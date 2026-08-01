import { describe, it, expect } from "vitest";

describe("PATCalculatorPage", () => {
  it("can be imported without errors", async () => {
    const mod = await import("../PATCalculatorPage");
    expect(mod).toBeDefined();
  });
});
