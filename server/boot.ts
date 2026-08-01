import app from "./app";
import { env } from "./lib/env";

// Start the Node server only in traditional production environments.
// Vercel serverless functions use api/index.ts instead.
const isVercel = process.env.VERCEL === "1";

if (env.isProduction && !isVercel) {
  const { serve } = await import("@hono/node-server");
  const { serveStaticFiles } = await import("./lib/vite");
  const { startTaskNotificationScheduler } =
    await import("./lib/tasks/notifications");

  serveStaticFiles(app);
  startTaskNotificationScheduler();

  const port = parseInt(process.env.PORT || "3000");
  serve({ fetch: app.fetch, port }, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}
