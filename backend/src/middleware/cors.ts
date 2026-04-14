import type { Hono } from "hono";

export const registerCors = (app: Hono): void => {
  app.use("*", async (c, next) => {
    c.res.headers.set("Access-Control-Allow-Origin", "*");
    c.res.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    c.res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    c.res.headers.set("Access-Control-Expose-Headers", "ETag");
    await next();
  });

  app.options("*", (c) => {
    c.res.headers.set("Access-Control-Allow-Origin", "*");
    c.res.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    c.res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    return c.text("", 204);
  });
};
