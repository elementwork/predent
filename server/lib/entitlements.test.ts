import { describe, expect, it } from "vitest";
import { getEffectiveTier, hasTierAccess } from "@contracts/tiers";

describe("entitlement policy", () => {
  const now = new Date("2026-08-07T12:00:00Z").getTime();

  it("keeps a paid tier while its entitlement is active", () => {
    expect(getEffectiveTier("premium", "2026-08-08T12:00:00Z", now)).toBe(
      "premium"
    );
  });

  it("fails closed for expired or missing paid entitlement dates", () => {
    expect(getEffectiveTier("premium", "2026-08-06T12:00:00Z", now)).toBe(
      "free"
    );
    expect(getEffectiveTier("premium_plus", null, now)).toBe("free");
  });

  it("allows higher tiers to satisfy lower-tier requirements", () => {
    expect(hasTierAccess("premium_plus", "premium")).toBe(true);
    expect(hasTierAccess("free", "premium")).toBe(false);
  });
});
