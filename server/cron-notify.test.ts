import { describe, it, expect } from "vitest";
import app from "./app";
import { hasDb } from "./test-db-flag";

describe.skipIf(!hasDb)("GET /api/cron/notify", () => {
  it("returns 500 when CRON_SECRET is not configured", async () => {
    const original = process.env.CRON_SECRET;
    delete process.env.CRON_SECRET;

    const res = await app.request("/api/cron/notify", { method: "GET" });
    expect(res.status).toBe(500);

    process.env.CRON_SECRET = original;
  });

  it("returns 401 when authorization header is missing", async () => {
    process.env.CRON_SECRET = "secret";

    const res = await app.request("/api/cron/notify", { method: "GET" });
    expect(res.status).toBe(401);
  });

  it("returns 401 when authorization header is invalid", async () => {
    process.env.CRON_SECRET = "secret";

    const res = await app.request("/api/cron/notify", {
      method: "GET",
      headers: { authorization: "Bearer wrong" },
    });
    expect(res.status).toBe(401);
  });

  it("runs notification task with valid secret", async () => {
    process.env.CRON_SECRET = "secret";

    const res = await app.request("/api/cron/notify", {
      method: "GET",
      headers: { authorization: "Bearer secret" },
    });
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body).toHaveProperty("tasks");
    expect(body).toHaveProperty("study");
  });
});
