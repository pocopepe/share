import type { Hono } from "hono";
import { readBearerToken, verifyAuthToken } from "../lib/auth";
import {
  normalizeContentType,
  resolveCodeshareObjectKeyForGet,
  resolveCodeshareObjectKeyForSave,
} from "../lib/codeshare";
import { buildRetentionMetadata, getRetentionDays, isExpiredIsoDate } from "../lib/retention";

export const registerCodeShareRoutes = (app: Hono): void => {
  app.post("/upload/codeshare/:filename", async (c) => {
    const filename = c.req.param("filename");
    const bucket = (c.env as { MY_BUCKET: any }).MY_BUCKET;

    if (!bucket) {
      console.error("Bucket is undefined.");
      return c.text("Internal server error: Bucket not found.", 500);
    }

    try {
      const contentType = c.req.header("Content-Type");
      const keyResolution = resolveCodeshareObjectKeyForSave(filename, contentType);

      if (!keyResolution.key || !keyResolution.r2ContentType) {
        return c.text(keyResolution.error || "Invalid request", 400);
      }

      const normalizedContentType = normalizeContentType(contentType);
      let fileContent = "";

      const tokenSecret = (c.env as any).AUTH_TOKEN_SECRET;
      const token = readBearerToken(c.req.header("Authorization"));
      const payload = token && tokenSecret ? await verifyAuthToken(token, tokenSecret) : null;
      const isMember = payload?.tier === "member";
      const retentionDays = getRetentionDays(isMember);
      const retentionMetadata = buildRetentionMetadata(
        retentionDays,
        isMember ? "member" : "guest",
      );

      if (normalizedContentType === "application/json") {
        const body = await c.req.json();
        fileContent = body.content || "";
      } else {
        fileContent = await c.req.text();
      }

      await bucket.put(keyResolution.key, fileContent, {
        httpMetadata: {
          contentType: keyResolution.r2ContentType,
        },
        customMetadata: retentionMetadata,
      });

      return c.json({
        key: keyResolution.key,
        retentionDays,
        expiresAt: retentionMetadata.expiresAt,
        retrieveUrl: `${new URL(c.req.url).origin}/get/codeshare/${encodeURIComponent(filename)}`,
      });
    } catch (error) {
      console.error("Error creating file:", error);
      return c.text("Error creating file", 500);
    }
  });

  app.get("/get/codeshare/:filename", async (c) => {
    const bucket = (c.env as { MY_BUCKET: any }).MY_BUCKET;
    const requestedFilename = c.req.param("filename");

    if (!bucket) {
      console.error("Bucket is undefined.");
      return c.text("Internal server error: Bucket not found.", 500);
    }

    try {
      const matchingFileKey = await resolveCodeshareObjectKeyForGet(bucket, requestedFilename);

      if (!matchingFileKey) {
        return c.text("File not found", 404);
      }

      const object = await bucket.get(matchingFileKey);
      if (!object) {
        return c.text("File not found", 404);
      }

      const expiresAt = object.customMetadata?.expiresAt;
      if (isExpiredIsoDate(expiresAt)) {
        await bucket.delete(matchingFileKey);
        return c.text("File expired", 410);
      }

      const contentType = object.httpMetadata?.contentType || "text/plain";
      const fileContents = await object.arrayBuffer();

      return c.json({
        content: new TextDecoder().decode(fileContents),
        contentType,
      });
    } catch (error) {
      console.error("Error fetching file:", error);
      return c.text("Error fetching file", 500);
    }
  });
};
