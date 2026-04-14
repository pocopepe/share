const CONTENT_TYPE_TO_EXTENSION: Record<string, string> = {
  "application/json": "json",
  "text/plain": "txt",
  "application/javascript": "js",
  "text/html": "html",
  "application/x-python": "py",
};

const CONTENT_TYPE_TO_R2_CONTENT_TYPE: Record<string, string> = {
  "application/json": "application/json",
  "text/plain": "text/plain",
  "application/javascript": "application/javascript",
  "text/html": "text/html",
  "application/x-python": "application/x-python",
};

const CODESHARE_ALLOWED_EXTENSIONS = ["json", "txt", "js", "html", "py"];

export const normalizeContentType = (contentType?: string): string =>
  (contentType || "").split(";")[0].trim().toLowerCase();

const hasAllowedExtension = (key: string): boolean => {
  const lastDot = key.lastIndexOf(".");
  if (lastDot === -1 || lastDot === key.length - 1) {
    return false;
  }

  const extension = key.slice(lastDot + 1).toLowerCase();
  return CODESHARE_ALLOWED_EXTENSIONS.includes(extension);
};

export const resolveCodeshareObjectKeyForSave = (
  filename: string,
  contentType?: string,
): { key?: string; r2ContentType?: string; error?: string } => {
  const cleanFilename = filename.trim();
  if (!cleanFilename) {
    return { error: "Filename is required" };
  }

  const normalizedType = normalizeContentType(contentType);
  const extension = CONTENT_TYPE_TO_EXTENSION[normalizedType];

  if (!extension) {
    return {
      error:
        "Unsupported Content-Type. Please send JSON, plain text, JavaScript, HTML, or Python.",
    };
  }

  if (hasAllowedExtension(cleanFilename)) {
    return {
      key: cleanFilename,
      r2ContentType: CONTENT_TYPE_TO_R2_CONTENT_TYPE[normalizedType],
    };
  }

  return {
    key: `${cleanFilename}.${extension}`,
    r2ContentType: CONTENT_TYPE_TO_R2_CONTENT_TYPE[normalizedType],
  };
};

export const resolveCodeshareObjectKeyForGet = async (
  bucket: any,
  requestedFilename: string,
): Promise<string | null> => {
  const cleanRequestedFilename = requestedFilename.trim();
  if (!cleanRequestedFilename) {
    return null;
  }

  const candidates = hasAllowedExtension(cleanRequestedFilename)
    ? [cleanRequestedFilename]
    : [
        cleanRequestedFilename,
        ...CODESHARE_ALLOWED_EXTENSIONS.map((ext) =>
          `${cleanRequestedFilename}.${ext}`,
        ),
      ];

  for (const candidate of candidates) {
    const object = await bucket.get(candidate, {
      onlyIf: { etagMatches: "__never_matches__" },
    });

    if (object) {
      return candidate;
    }
  }

  return null;
};
