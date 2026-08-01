import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createTestUser, mockContext } from "./test-helpers";

const createCaller = (user?: Awaited<ReturnType<typeof createTestUser>>) =>
  paymentRouter.createCaller(mockContext(user));

let paymentRouter: typeof import("./payment-router").paymentRouter;

describe("paymentRouter", () => {
  let originalEnv: Record<string, string | undefined>;

  beforeAll(async () => {
    originalEnv = {
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
      STRIPE_PRICE_PREMIUM_MONTHLY: process.env.STRIPE_PRICE_PREMIUM_MONTHLY,
      STRIPE_PRICE_PREMIUM_YEARLY: process.env.STRIPE_PRICE_PREMIUM_YEARLY,
      STRIPE_PRICE_PLUS_LIFETIME: process.env.STRIPE_PRICE_PLUS_LIFETIME,
      PUBLIC_APP_URL: process.env.PUBLIC_APP_URL,
    };

    process.env.STRIPE_SECRET_KEY = "sk_test_xxx";
    process.env.STRIPE_PRICE_PREMIUM_MONTHLY = "price_monthly";
    process.env.STRIPE_PRICE_PREMIUM_YEARLY = "price_yearly";
    process.env.STRIPE_PRICE_PLUS_LIFETIME = "price_lifetime";
    process.env.PUBLIC_APP_URL = "https://predent.ca";

    // Import after env vars are set so PLAN_PRICES is populated.
    const mod = await import("./payment-router");
    paymentRouter = mod.paymentRouter;
  });

  afterAll(() => {
    Object.assign(process.env, originalEnv);
  });

  describe("createCheckoutSession", () => {
    it("throws when Stripe is not configured", async () => {
      const user = await createTestUser();
      const caller = createCaller(user);
      const original = process.env.STRIPE_SECRET_KEY;
      process.env.STRIPE_SECRET_KEY = "";

      await expect(
        caller.createCheckoutSession({ plan: "premium_monthly" })
      ).rejects.toThrow("Stripe is not configured");

      process.env.STRIPE_SECRET_KEY = original;
    });

    it("throws when no price is configured", async () => {
      const user = await createTestUser();
      const caller = createCaller(user);
      const original = process.env.STRIPE_PRICE_PREMIUM_MONTHLY;
      process.env.STRIPE_PRICE_PREMIUM_MONTHLY = "";

      await expect(
        caller.createCheckoutSession({ plan: "premium_monthly" })
      ).rejects.toThrow("No price configured");

      process.env.STRIPE_PRICE_PREMIUM_MONTHLY = original;
    });
  });

  describe("getBillingPortalUrl", () => {
    it("throws when user has no Stripe customer", async () => {
      const user = await createTestUser();
      const caller = createCaller(user);

      await expect(caller.getBillingPortalUrl()).rejects.toThrow(
        "No Stripe customer found"
      );
    });
  });

  describe("payment helpers", () => {
    it("maps price ids to plans", async () => {
      const { getPlanFromPrice, getTierFromPlan } =
        await import("./payment-router");
      expect(getPlanFromPrice("price_monthly")).toBe("premium_monthly");
      expect(getPlanFromPrice("price_lifetime")).toBe("plus_lifetime");
      expect(getPlanFromPrice("unknown")).toBeNull();

      expect(getTierFromPlan("premium_monthly")).toBe("premium");
      expect(getTierFromPlan("plus_lifetime")).toBe("premium_plus");
    });
  });
});
