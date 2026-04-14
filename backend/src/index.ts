import { Hono } from "hono";
import { registerCors } from "./middleware/cors";
import { registerCleanupRoutes } from "./routes/cleanup";
import { registerCodeShareRoutes } from "./routes/codeshare";
import { registerFileRoutes } from "./routes/files";
import { registerAuthRoutes } from "./routes/auth";
import { purgeExpiredObjects } from "./lib/retention";

const app = new Hono();

registerCors(app);
registerAuthRoutes(app);
registerFileRoutes(app);
registerCodeShareRoutes(app);
registerCleanupRoutes(app);

export default {
	fetch: app.fetch,
	scheduled: async (_event: ScheduledEvent, env: any): Promise<void> => {
		const bucket = env.MY_BUCKET;
		if (!bucket) {
			return;
		}

		const deletedCount = await purgeExpiredObjects(bucket);
		console.log(`Expired object cleanup complete. Deleted: ${deletedCount}`);
	},
};
