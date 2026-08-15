import Stripe from "stripe";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { hasDb } from "./test-db-flag";

const webhookSecret = "whsec_test_route_signature_secret";
const payload = JSON.stringify({
  id: `evt_route_${crypto.randomUUID()}`,
  object: "event",
  api_version: "2026-07-29.basil",
  created: Math.floor(Date.now() / 1000),
  livemode: false,
  pending_webhooks: 1,
  request: null,
  type: "payment_intent.created",
  data: { object: { id: "pi_route", object: "payment_intent" } },
});

let app: typeof import("./app").default;

beforeAll(async () => {
  process.env.STRIPE_SECRET_KEY = "sk_test_route_only";
  process.env.STRIPE_WEBHOOK_SECRET = webhookSecret;
  vi.resetModules();
  app = (await import("./app")).default;
});

describe("Stripe webhook HTTP boundary", () => {
  it("rejects a bad Stripe signature", async () => {
    const response = await app.request("/api/webhooks/stripe", {
      method: "POST",
      headers: { "stripe-signature": "invalid" },
      body: payload,
    });
    expect(response.status).toBe(400);
  });

  it.skipIf(!hasDb)(
    "accepts and idempotently claims a signed event",
    async () => {
      const signature = Stripe.webhooks.generateTestHeaderString({
        payload,
        secret: webhookSecret,
      });
      const request = () =>
        app.request("/api/webhooks/stripe", {
          method: "POST",
          headers: { "stripe-signature": signature },
          body: payload,
        });
      const first = await request();
      expect(first.status).toBe(200);
      expect(await first.json()).toMatchObject({
        received: true,
        duplicate: false,
      });
      const duplicate = await request();
      expect(await duplicate.json()).toMatchObject({ duplicate: true });
    }
  );
});
