import { describe, it, expect } from "vitest";

// Simple test that doesn't require complex mocking
describe("PremiumCTA", () => {
  it("can be imported without errors", async () => {
    const mod = await import("../PremiumCTA");
    expect(mod).toBeDefined();
  });
});
