import { describe, expect, it } from "vitest";
import { formatInTimeZone, isValidTimeZone } from "./time";

describe("timezone handling", () => {
  it("validates IANA zones", () => {
    expect(isValidTimeZone("America/Vancouver")).toBe(true);
    expect(isValidTimeZone("not/a-zone")).toBe(false);
  });

  it("formats the same instant in the user's zone", () => {
    const instant = new Date("2026-01-01T02:00:00.000Z");
    expect(
      formatInTimeZone(instant, "America/Toronto", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
    ).toContain("2025");
  });
});
