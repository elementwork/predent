import { describe, expect, it } from "vitest";
import { getRetryDelayMs, shouldSendNotificationEmail } from "./worker";

describe("outbox retry policy", () => {
  it("uses capped exponential backoff", () => {
    expect(getRetryDelayMs(1)).toBe(30_000);
    expect(getRetryDelayMs(2)).toBe(60_000);
    expect(getRetryDelayMs(20)).toBe(3_600_000);
  });
});

describe("outbox email retry policy", () => {
  it("does not resend email after a later delivery channel fails", () => {
    expect(
      shouldSendNotificationEmail({
        requested: true,
        allowed: true,
        email: "student@example.test",
        alreadySent: true,
      })
    ).toBe(false);
  });

  it("sends an eligible email once", () => {
    expect(
      shouldSendNotificationEmail({
        requested: true,
        allowed: true,
        email: "student@example.test",
        alreadySent: false,
      })
    ).toBe(true);
  });
});
