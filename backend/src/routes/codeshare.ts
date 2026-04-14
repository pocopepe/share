import type { Hono } from "hono";
import { readBearerToken, verifyAuthToken } from "../lib/auth";
import {
  normalizeContentType,
  resolveCodeshareObjectKeyForGet,
  resolveCodeshareObjectKeyForSave,
} from "../lib/codeshare";
import { buildRetentionMetadata, getRetentionDays, isExpiredIsoDate } from "../lib/retention";

type PinCodeshareRecord = {
  key: string;
  itemName: string;
  createdAt: string;
  expiresAt: string;
  contentType: string;
};

type PinCodeshareIndex = {
  pin: string;
  files: PinCodeshareRecord[];
};

const normalizePin = (value: string): string => {
  const normalized = value.trim();
  return /^\d{4,5}$/.test(normalized) ? normalized : "";
};

const extractPinFromFilename = (filename: string): string => {
  const match = filename.match(/-(\d{4,5})(?:\.[^.]+)?$/);
  return match?.[1] || "";
};

const buildPinIndexKey = (pin: string): string => `codeshare-pin-index/${encodeURIComponent(pin)}.json`;

const readPinCodeshareIndex = async (bucket: any, pin: string): Promise<PinCodeshareIndex> => {
  const object = await bucket.get(buildPinIndexKey(pin));
  if (!object) {
    return { pin, files: [] };
  }

  try {
    const parsed = JSON.parse(await object.text()) as Partial<PinCodeshareIndex>;
    const files = Array.isArray(parsed.files)
      ? parsed.files.map((file) => ({
          key: String(file.key || ""),
          itemName: String(file.itemName || "codeshare"),
          createdAt: String(file.createdAt || new Date().toISOString()),
          expiresAt: String(file.expiresAt || new Date().toISOString()),
          contentType: String(file.contentType || "text/plain"),
        }))
      : [];

    return {
      pin: normalizePin(String(parsed.pin || pin)) || pin,
      files,
    };
  } catch {
    return { pin, files: [] };
  }
};

const writePinCodeshareIndex = async (bucket: any, index: PinCodeshareIndex): Promise<void> => {
  await bucket.put(buildPinIndexKey(index.pin), JSON.stringify(index, null, 2), {
    httpMetadata: { contentType: "application/json" },
  });
};

const resolveLatestKeyForPin = async (bucket: any, pin: string): Promise<string | null> => {
  const index = await readPinCodeshareIndex(bucket, pin);
  const activeFiles: PinCodeshareRecord[] = [];

  for (const file of index.files.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))) {
    const head = await bucket.head(file.key);
    if (!head) {
      continue;
    }

    const expiresAt = head.customMetadata?.expiresAt || file.expiresAt;
    if (isExpiredIsoDate(expiresAt)) {
      await bucket.delete(file.key);
      continue;
    }

    activeFiles.push({
      ...file,
      expiresAt,
      contentType: head.httpMetadata?.contentType || file.contentType,
    });
  }

  if (activeFiles.length !== index.files.length) {
    await writePinCodeshareIndex(bucket, { pin, files: activeFiles });
  }

  return activeFiles[0]?.key || null;
};

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

      const pin = extractPinFromFilename(keyResolution.key);
      if (pin) {
        const pinIndex = await readPinCodeshareIndex(bucket, pin);
        const nextRecord: PinCodeshareRecord = {
          key: keyResolution.key,
          itemName: keyResolution.key,
          createdAt: new Date().toISOString(),
          expiresAt: retentionMetadata.expiresAt,
          contentType: keyResolution.r2ContentType,
        };

        pinIndex.files = [nextRecord, ...pinIndex.files].sort(
          (left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt),
        );
        await writePinCodeshareIndex(bucket, pinIndex);
      }

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
      const requestedPin = normalizePin(requestedFilename);
      const matchingFileKey = requestedPin
        ? await resolveLatestKeyForPin(bucket, requestedPin)
        : await resolveCodeshareObjectKeyForGet(bucket, requestedFilename);

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
        key: matchingFileKey,
      });
    } catch (error) {
      console.error("Error fetching file:", error);
      return c.text("Error fetching file", 500);
    }
  });

  app.get("/get/codeshare/by-pin/:pin", async (c) => {
    const bucket = (c.env as { MY_BUCKET: any }).MY_BUCKET;
    const pin = normalizePin(c.req.param("pin"));

    if (!bucket) {
      return c.text("Internal server error: Bucket not found.", 500);
    }

    if (!pin) {
      return c.text("Pin is required and must be 4 or 5 digits", 400);
    }

    const index = await readPinCodeshareIndex(bucket, pin);
    const activeFiles: PinCodeshareRecord[] = [];

    for (const file of index.files.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))) {
      const head = await bucket.head(file.key);
      if (!head) {
        continue;
      }

      const expiresAt = head.customMetadata?.expiresAt || file.expiresAt;
      if (isExpiredIsoDate(expiresAt)) {
        await bucket.delete(file.key);
        continue;
      }

      activeFiles.push({
        ...file,
        expiresAt,
        contentType: head.httpMetadata?.contentType || file.contentType,
      });
    }

    if (activeFiles.length !== index.files.length) {
      await writePinCodeshareIndex(bucket, { pin, files: activeFiles });
    }

    return c.json({
      pin,
      files: activeFiles.map((file) => ({
        ...file,
        retrieveUrl: `${new URL(c.req.url).origin}/get/codeshare/${encodeURIComponent(file.key)}`,
      })),
    });
  });
};
