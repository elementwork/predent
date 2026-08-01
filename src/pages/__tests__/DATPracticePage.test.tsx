import { describe, it, expect } from "vitest";

describe("DATPracticePage", () => {
  it("can be imported without errors", async () => {
    const mod = await import("../DATPracticePage");
    expect(mod).toBeDefined();
  });
});
