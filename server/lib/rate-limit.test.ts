import { beforeEach, describe, expect, it } from "vitest";
import { Hono } from "hono";
import { clearRateLimitStore, rateLimit } from "./rate-limit";

describe("rateLimit", () => {
  beforeEach(() => clearRateLimitStore());

  it("returns standard limit headers and rejects requests over budget", async () => {
    const app = new Hono();
    app.use(rateLimit({ windowMs: 60_000, maxRequests: 2 }));
    app.get("/test", c => c.json({ ok: true }));

    const first = await app.request("/test");
    const second = await app.request("/test");
    const blocked = await app.request("/test");

    expect(first.status).toBe(200);
    expect(first.headers.get("RateLimit-Limit")).toBe("2");
    expect(first.headers.get("RateLimit-Remaining")).toBe("1");
    expect(second.headers.get("RateLimit-Remaining")).toBe("0");
    expect(blocked.status).toBe(429);
    expect(blocked.headers.get("Retry-After")).toBe("60");
  });

  it("uses only explicitly trusted proxy headers", async () => {
    const app = new Hono();
    app.get("/ip", c => c.text("ok"));
    app.use("/limited/*", rateLimit({ windowMs: 60_000, maxRequests: 1 }));
    app.get("/limited/test", c => c.text("ok"));

    const first = await app.request("/limited/test", {
      headers: { "x-forwarded-for": "198.51.100.1" },
    });
    const spoofed = await app.request("/limited/test", {
      headers: { "x-forwarded-for": "198.51.100.2" },
    });

    expect(first.status).toBe(200);
    expect(spoofed.status).toBe(429);
  });
});
