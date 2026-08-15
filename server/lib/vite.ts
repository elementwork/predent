import type { Hono } from "hono";
import type { HttpBindings } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import fs from "fs";
import path from "path";

type App = Hono<{
  Bindings: HttpBindings;
  Variables: { requestId: string };
}>;

export function serveStaticFiles(app: App) {
  const distPath = path.resolve(import.meta.dirname, "../dist/public");

  app.use("*", serveStatic({ root: "./dist/public" }));

  app.notFound(c => {
    const accept = c.req.header("accept") ?? "";
    if (!accept.includes("text/html")) {
      return c.json({ error: "Not Found" }, 404);
    }
    const relative = decodeURIComponent(c.req.path).replace(/^\/+/, "");
    const candidate = path.resolve(distPath, relative, "index.html");
    const indexPath =
      candidate.startsWith(`${distPath}${path.sep}`) && fs.existsSync(candidate)
        ? candidate
        : path.resolve(distPath, "index.html");
    const content = fs.readFileSync(indexPath, "utf-8");
    return c.html(content);
  });
}
