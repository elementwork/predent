import { describe, it, expect } from "vitest";

describe("GPACalculatorPage", () => {
  it("can be imported without errors", async () => {
    const mod = await import("../GPACalculatorPage");
    expect(mod).toBeDefined();
  });
});
