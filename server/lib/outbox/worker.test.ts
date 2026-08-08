import { describe, expect, it } from "vitest";
import { getRetryDelayMs } from "./worker";

describe("outbox retry policy", () => {
  it("uses capped exponential backoff", () => {
    expect(getRetryDelayMs(1)).toBe(30_000);
    expect(getRetryDelayMs(2)).toBe(60_000);
    expect(getRetryDelayMs(20)).toBe(3_600_000);
  });
});
