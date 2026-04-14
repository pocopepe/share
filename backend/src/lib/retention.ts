const DAY_MS = 24 * 60 * 60 * 1000;

type R2ObjectLike = {
  key: string;
  customMetadata?: Record<string, string>;
};

type R2ListResultLike = {
  objects: R2ObjectLike[];
  cursor?: string;
  truncated?: boolean;
};

type R2BucketLike = {
  list: (options?: { cursor?: string }) => Promise<R2ListResultLike>;
  delete: (key: string) => Promise<void>;
};

export const GUEST_RETENTION_DAYS = 3;
export const MEMBER_RETENTION_DAYS = 60;

export const getRetentionDays = (isMember: boolean): number =>
  isMember ? MEMBER_RETENTION_DAYS : GUEST_RETENTION_DAYS;

export const computeExpiryDateIso = (retentionDays: number): string =>
  new Date(Date.now() + retentionDays * DAY_MS).toISOString();

export const isExpiredIsoDate = (expiresAtIso?: string): boolean => {
  if (!expiresAtIso) {
    return false;
  }

  const expiresAtMs = Date.parse(expiresAtIso);
  if (Number.isNaN(expiresAtMs)) {
    return false;
  }

  return Date.now() > expiresAtMs;
};

export const buildRetentionMetadata = (
  retentionDays: number,
  ownerTier: "guest" | "member",
): Record<string, string> => ({
  retentionDays: String(retentionDays),
  expiresAt: computeExpiryDateIso(retentionDays),
  ownerTier,
  uploadedAt: new Date().toISOString(),
});

export const purgeExpiredObjects = async (bucket: R2BucketLike): Promise<number> => {
  let cursor: string | undefined = undefined;
  let deletedCount = 0;

  do {
    const result: R2ListResultLike = await bucket.list({ cursor });
    const objects = result.objects || [];

    for (const obj of objects) {
      const expiresAt = obj.customMetadata?.expiresAt;
      if (isExpiredIsoDate(expiresAt)) {
        await bucket.delete(obj.key);
        deletedCount += 1;
      }
    }

    cursor = result.truncated ? result.cursor : undefined;
  } while (cursor);

  return deletedCount;
};
