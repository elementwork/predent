import { describe, it, expect } from "vitest";

describe("CompetitivenessCalculatorPage", () => {
  it("can be imported without errors", async () => {
    const mod = await import("../CompetitivenessCalculatorPage");
    expect(mod).toBeDefined();
  });
});
