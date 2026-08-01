import { describe, it, expect } from "vitest";

describe("PricingPage", () => {
  it("can be imported without errors", async () => {
    const mod = await import("../PricingPage");
    expect(mod).toBeDefined();
  });
});
