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
  const { startOutboxWorker } = await import("./lib/outbox/worker");
  const { closeDb } = await import("./queries/connection");
  const { Sentry } = await import("./lib/sentry");

  serveStaticFiles(app);
  const taskScheduler = startTaskNotificationScheduler();
  const outboxWorker = startOutboxWorker();

  const port = parseInt(process.env.PORT || "3000");
  const server = serve({ fetch: app.fetch, port }, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });

  let shuttingDown = false;
  const shutdown = async (signal: string) => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log(`[shutdown] ${signal} received; draining resources`);
    taskScheduler.stop();
    outboxWorker.stop();
    const forceTimer = setTimeout(() => process.exit(1), 15_000);
    forceTimer.unref();
    await new Promise<void>(resolve => server.close(() => resolve()));
    await closeDb();
    await Sentry.flush(2_000);
    clearTimeout(forceTimer);
  };
  process.once("SIGTERM", () => void shutdown("SIGTERM"));
  process.once("SIGINT", () => void shutdown("SIGINT"));
}
