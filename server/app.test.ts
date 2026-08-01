import { describe, it, expect } from "vitest";
import app from "./app";

describe("app", () => {
  it("returns 404 for unknown /api routes", async () => {
    const res = await app.request("/api/unknown");
    expect(res.status).toBe(404);
    const body: unknown = await res.json();
    expect((body as { error: string }).error).toBe("Not Found");
  });

  it("returns 200 for trpc ping", async () => {
    const res = await app.request("/api/trpc/ping");
    expect(res.status).toBe(200);
    const body: unknown = await res.json();
    const data =
      (body as { result?: { data?: { json?: { ok: boolean; ts: number } } } })
        .result?.data?.json ?? (body as { ok: boolean; ts: number });
    expect(data.ok).toBe(true);
    expect(data).toHaveProperty("ts");
  });

  it("rejects Stripe webhook when not configured", async () => {
    const originalKey = process.env.STRIPE_SECRET_KEY;
    process.env.STRIPE_SECRET_KEY = "";

    const res = await app.request("/api/webhooks/stripe", {
      method: "POST",
      body: "test",
    });
    expect(res.status).toBe(500);

    process.env.STRIPE_SECRET_KEY = originalKey;
  });
});
