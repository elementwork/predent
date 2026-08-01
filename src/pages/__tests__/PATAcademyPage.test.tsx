import { describe, it, expect } from "vitest";

describe("PATAcademyPage", () => {
  it("can be imported without errors", async () => {
    const mod = await import("../PATAcademyPage");
    expect(mod).toBeDefined();
  });
});
