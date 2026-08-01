import { describe, it, expect } from "vitest";

function normalizeGpa(gpa: number, scale: "4.0" | "100") {
  if (scale === "100") return (gpa / 100) * 4;
  return gpa;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

describe("normalizeGpa", () => {
  it("returns 4.0 scale unchanged", () => {
    expect(normalizeGpa(3.5, "4.0")).toBe(3.5);
  });

  it("converts 100 scale to 4.0 scale", () => {
    expect(normalizeGpa(100, "100")).toBe(4);
    expect(normalizeGpa(75, "100")).toBe(3);
  });
});

describe("clamp", () => {
  it("keeps values inside range", () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it("clamps below minimum", () => {
    expect(clamp(-2, 0, 10)).toBe(0);
  });

  it("clamps above maximum", () => {
    expect(clamp(12, 0, 10)).toBe(10);
  });
});
