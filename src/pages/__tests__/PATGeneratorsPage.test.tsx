import { describe, it, expect } from "vitest";

describe("PATGeneratorsPage", () => {
  it("can be imported without errors", async () => {
    const mod = await import("../PATGeneratorsPage");
    expect(mod).toBeDefined();
  });
});
