import type { Hono } from "hono";
import JSZip from "jszip";
import {
  buildRetentionMetadata,
  computeExpiryDateIso,
  isExpiredIsoDate,
} from "../lib/retention";

type EmailUploadRecord = {
  key: string;
  itemName: string;
  email: string;
  createdAt: string;
  expiresAt: string;
  kind: "single" | "zip";
  fileCount: number;
};

type EmailUploadIndex = {
  email: string;
  uploads: EmailUploadRecord[];
};

const normalizeEmail = (email: string): string => email.trim().toLowerCase();

const safeFileName = (name: string): string =>
  name
    .trim()
    .replace(/[\\/]/g, "-")
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "upload";

const buildIndexKey = (email: string): string =>
  `email-index/${encodeURIComponent(normalizeEmail(email))}.json`;

const buildUploadKey = (email: string, zipFilename: string): string => {
  const normalizedEmail = encodeURIComponent(normalizeEmail(email));
  const timestamp = Date.now();
  return `uploads/${normalizedEmail}/${timestamp}-${safeFileName(zipFilename)}`;
};

const buildBundleName = (): string => `bundle-${Date.now()}.zip`;

const readEmailIndex = async (bucket: any, email: string): Promise<EmailUploadIndex> => {
  const indexKey = buildIndexKey(email);
  const existing = await bucket.get(indexKey);

  if (!existing) {
    return { email: normalizeEmail(email), uploads: [] };
  }

  try {
    const text = await existing.text();
    const parsed = JSON.parse(text) as Partial<EmailUploadIndex> & {
      uploads?: Array<Partial<EmailUploadRecord>>;
    };
    return {
      email: normalizeEmail(parsed.email || email),
      uploads: Array.isArray(parsed.uploads)
        ? parsed.uploads.map((upload) => ({
            key: String(upload.key || ""),
            itemName: String(upload.itemName || "upload"),
            email: normalizeEmail(String(upload.email || email)),
            createdAt: String(upload.createdAt || new Date().toISOString()),
            expiresAt: String(upload.expiresAt || new Date().toISOString()),
            kind: upload.kind === "single" || upload.kind === "zip" ? upload.kind : "zip",
            fileCount: Number(upload.fileCount || 1),
          }))
        : [],
    };
  } catch {
    return { email: normalizeEmail(email), uploads: [] };
  }
};

const writeEmailIndex = async (bucket: any, index: EmailUploadIndex): Promise<void> => {
  await bucket.put(buildIndexKey(index.email), JSON.stringify(index, null, 2), {
    httpMetadata: {
      contentType: "application/json",
    },
  });
};

export const registerFileRoutes = (app: Hono): void => {
  app.post("/upload/files", async (c) => {
    const bucket = (c.env as { MY_BUCKET: any }).MY_BUCKET;

    if (!bucket) {
      return c.text("Internal server error: Bucket not found.", 500);
    }

    const formData = await c.req.formData().catch(() => null);
    const emailInput = String(formData?.get("email") || "").trim();
    const fileEntries = formData
      ? Array.from(formData.entries()).filter(([, value]) => value instanceof File && value.size > 0)
      : [];

    if (!emailInput) {
      return c.text("Email is required", 400);
    }

    if (fileEntries.length === 0) {
      return c.text("Please attach at least one file in form field 'file'", 400);
    }

    const files = fileEntries
      .map(([key, value]) => ({ key, file: value as File }))
      .sort((left, right) => left.file.name.localeCompare(right.file.name));

    const email = normalizeEmail(emailInput);
    const retentionDays = 3;
    const retentionMetadata = buildRetentionMetadata(retentionDays, "guest");
    const isSingleFile = files.length === 1;
    const sourceFile = files[0]?.file;
    const bundleName = isSingleFile && sourceFile ? sourceFile.name : buildBundleName();
    const uploadKey = buildUploadKey(email, bundleName);

    try {
      if (isSingleFile && sourceFile) {
        await bucket.put(uploadKey, sourceFile.stream(), {
          httpMetadata: {
            contentType: sourceFile.type || "application/octet-stream",
            contentDisposition: `attachment; filename="${safeFileName(sourceFile.name)}"`,
          },
          customMetadata: {
            ...retentionMetadata,
            kind: "single",
            itemName: sourceFile.name,
            fileCount: "1",
          },
        });
      } else {
        const zip = new JSZip();

        for (const { file: entryFile } of files) {
          const fileBuffer = await entryFile.arrayBuffer();
          zip.file(entryFile.name, fileBuffer);
        }

        const zipBytes = await zip.generateAsync({
          type: "uint8array",
          compression: "DEFLATE",
          compressionOptions: { level: 6 },
        });

        await bucket.put(uploadKey, zipBytes, {
          httpMetadata: {
            contentType: "application/zip",
            contentDisposition: `attachment; filename="${safeFileName(bundleName)}"`,
          },
          customMetadata: {
            ...retentionMetadata,
            kind: "zip",
            itemName: bundleName,
            fileCount: String(files.length),
          },
        });
      }

      const index = await readEmailIndex(bucket, email);
      const uploadRecord: EmailUploadRecord = {
        key: uploadKey,
        itemName: bundleName,
        email,
        createdAt: new Date().toISOString(),
        expiresAt: retentionMetadata.expiresAt,
        kind: isSingleFile ? "single" : "zip",
        fileCount: files.length,
      };
      index.uploads = [uploadRecord, ...index.uploads].sort(
        (left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt),
      );
      await writeEmailIndex(bucket, index);

      return c.json({
        key: uploadKey,
        email,
        itemName: bundleName,
        kind: isSingleFile ? "single" : "zip",
        fileCount: files.length,
        retentionDays,
        expiresAt: retentionMetadata.expiresAt,
        downloadUrl: `${new URL(c.req.url).origin}/download/files/${encodeURIComponent(uploadKey)}`,
      });
    } catch (error: any) {
      console.error("Error uploading file:", error?.message, error?.stack);
      return c.text(`Failed to upload file: ${error?.message || "Unknown error"}`, 500);
    }
  });

  app.get("/upload/files/:filename", (c) => {
    const filename = c.req.param("filename");
    if (!filename) {
      return c.text("Filename is required", 400);
    }

    return c.json({
      message: "Use POST /upload/files with multipart/form-data (field: file)",
      key: filename,
    });
  });

  app.get("/get/files/:filename", async (c) => {
    const bucket = (c.env as { MY_BUCKET: any }).MY_BUCKET;
    const filename = c.req.param("filename");

    if (!bucket) {
      return c.text("Internal server error: Bucket not found.", 500);
    }

    if (!filename) {
      return c.text("Filename is required", 400);
    }

    try {
      const object = await bucket.head(filename);
      if (!object) {
        return c.text("File does not exist", 404);
      }

      const expiresAt = object.customMetadata?.expiresAt;
      if (isExpiredIsoDate(expiresAt)) {
        await bucket.delete(filename);
        return c.text("File expired", 410);
      }

      return c.json({
        key: filename,
        expiresAt: expiresAt || computeExpiryDateIso(3),
        downloadUrl: `${new URL(c.req.url).origin}/download/files/${encodeURIComponent(filename)}`,
      });
    } catch (error: any) {
      console.error("Error reading file metadata:", error?.message, error?.stack);
      return c.text(`Failed to get file: ${error?.message || "Unknown error"}`, 500);
    }
  });

  app.get("/download/files/:filename", async (c) => {
    const bucket = (c.env as { MY_BUCKET: any }).MY_BUCKET;
    const filename = c.req.param("filename");

    if (!bucket) {
      return c.text("Internal server error: Bucket not found.", 500);
    }

    if (!filename) {
      return c.text("Filename is required", 400);
    }

    try {
      const object = await bucket.get(filename);
      if (!object) {
        return c.text("File does not exist", 404);
      }

      const expiresAt = object.customMetadata?.expiresAt;
      if (isExpiredIsoDate(expiresAt)) {
        await bucket.delete(filename);
        return c.text("File expired", 410);
      }

      c.header("Content-Type", object.httpMetadata?.contentType || "application/octet-stream");
      c.header("Content-Disposition", `attachment; filename="${filename}"`);
      if (expiresAt) {
        c.header("X-Expires-At", expiresAt);
      }

      return c.body(object.body);
    } catch (error: any) {
      console.error("Error downloading file:", error?.message, error?.stack);
      return c.text(`Failed to download file: ${error?.message || "Unknown error"}`, 500);
    }
  });

  app.get("/get/files/by-email/:email", async (c) => {
    const bucket = (c.env as { MY_BUCKET: any }).MY_BUCKET;
    const email = normalizeEmail(c.req.param("email"));

    if (!bucket) {
      return c.text("Internal server error: Bucket not found.", 500);
    }

    if (!email) {
      return c.text("Email is required", 400);
    }

    const index = await readEmailIndex(bucket, email);
    const activeUploads: EmailUploadRecord[] = [];

    for (const upload of index.uploads) {
      const object = await bucket.get(upload.key);
      if (!object) {
        continue;
      }

      const expiresAt = object.customMetadata?.expiresAt || upload.expiresAt;
      if (isExpiredIsoDate(expiresAt)) {
        await bucket.delete(upload.key);
        continue;
      }

      activeUploads.push({
        ...upload,
        expiresAt,
      });
    }

    if (activeUploads.length !== index.uploads.length) {
      await writeEmailIndex(bucket, { email, uploads: activeUploads });
    }

    return c.json({
      email,
      uploads: activeUploads.map((upload) => ({
        ...upload,
        downloadUrl: `${new URL(c.req.url).origin}/download/files/${encodeURIComponent(upload.key)}`,
      })),
    });
  });
};
