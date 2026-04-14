import type { Hono } from "hono";
import { purgeExpiredObjects } from "../lib/retention";

export const registerCleanupRoutes = (app: Hono): void => {
  app.post("/cleanup/expired", async (c) => {
    const bucket = (c.env as { MY_BUCKET: any }).MY_BUCKET;

    if (!bucket) {
      console.error("Bucket is undefined.");
      return c.text("Internal server error: Bucket not found.", 500);
    }

    try {
      const deletedCount = await purgeExpiredObjects(bucket);
      return c.json({ deletedCount });
    } catch (error) {
      console.error("Error in expired cleanup:", error);
      return c.text("Error in expired cleanup", 500);
    }
  });

  app.post("/cleanup", async (c) => {
    const bucket = (c.env as { MY_BUCKET: any }).MY_BUCKET;

    if (!bucket) {
      console.error("Bucket is undefined.");
      return c.text("Internal server error: Bucket not found.", 500);
    }

    try {
      const result = await bucket.list();

      if (result.objects && result.objects.length > 0) {
        const deletePromises = result.objects.map((obj: any) => bucket.delete(obj.key));
        await Promise.all(deletePromises);
        return c.text("All objects deleted successfully.");
      }

      return c.text("No objects to delete.");
    } catch (error) {
      console.error("Error in cleanup:", error);
      return c.text("Error in cleanup", 500);
    }
  });
};
