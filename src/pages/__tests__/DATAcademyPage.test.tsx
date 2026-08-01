import { describe, it, expect } from "vitest";

describe("DATAcademyPage", () => {
  it("can be imported without errors", async () => {
    const mod = await import("../DATAcademyPage");
    expect(mod).toBeDefined();
  });
});
