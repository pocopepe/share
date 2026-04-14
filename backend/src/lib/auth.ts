const encoder = new TextEncoder();

type AuthTokenPayload = {
  sub: string;
  tier: "guest" | "member";
  exp: number;
};

const toBase64Url = (input: string): string =>
  btoa(input).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");

const fromBase64Url = (input: string): string => {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  return atob(padded);
};

const importSigningKey = async (secret: string): Promise<CryptoKey> =>
  crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );

const bytesToHex = (bytes: Uint8Array): string =>
  Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

const signPayload = async (secret: string, payloadBase64: string): Promise<string> => {
  const key = await importSigningKey(secret);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payloadBase64));
  return bytesToHex(new Uint8Array(signature));
};

export const createAuthToken = async (
  secret: string,
  payload: AuthTokenPayload,
): Promise<string> => {
  const payloadBase64 = toBase64Url(JSON.stringify(payload));
  const signatureHex = await signPayload(secret, payloadBase64);
  return `${payloadBase64}.${signatureHex}`;
};

export const verifyAuthToken = async (
  token: string,
  secret: string,
): Promise<AuthTokenPayload | null> => {
  const [payloadBase64, signatureHex] = token.split(".");
  if (!payloadBase64 || !signatureHex) {
    return null;
  }

  const expected = await signPayload(secret, payloadBase64);
  if (expected !== signatureHex) {
    return null;
  }

  try {
    const payload = JSON.parse(fromBase64Url(payloadBase64)) as AuthTokenPayload;
    const nowSeconds = Math.floor(Date.now() / 1000);

    if (!payload.exp || payload.exp < nowSeconds) {
      return null;
    }

    if (payload.tier !== "guest" && payload.tier !== "member") {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
};

export const readBearerToken = (authorizationHeader?: string): string | null => {
  if (!authorizationHeader) {
    return null;
  }

  const [scheme, token] = authorizationHeader.split(" ");
  if (!scheme || !token || scheme.toLowerCase() !== "bearer") {
    return null;
  }

  return token;
};
