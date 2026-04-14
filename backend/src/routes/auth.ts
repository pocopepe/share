import type { Hono } from "hono";
import { createAuthToken } from "../lib/auth";

const LOGIN_TOKEN_TTL_SECONDS = 30 * 24 * 60 * 60;

export const registerAuthRoutes = (app: Hono): void => {
  app.post("/auth/login", async (c) => {
    const body = await c.req.json().catch(() => null);
    const password = body?.password;

    const expectedPassword = (c.env as any).LOGIN_PASSWORD;
    const tokenSecret = (c.env as any).AUTH_TOKEN_SECRET;

    if (!expectedPassword || !tokenSecret) {
      return c.text("Server auth configuration is missing", 500);
    }

    if (!password || password !== expectedPassword) {
      return c.text("Invalid credentials", 401);
    }

    const nowSeconds = Math.floor(Date.now() / 1000);
    const exp = nowSeconds + LOGIN_TOKEN_TTL_SECONDS;

    const token = await createAuthToken(tokenSecret, {
      sub: "share-user",
      tier: "member",
      exp,
    });

    return c.json({
      token,
      tier: "member",
      tokenExpiresAt: new Date(exp * 1000).toISOString(),
    });
  });
};
