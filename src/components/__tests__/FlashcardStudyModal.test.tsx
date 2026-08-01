import { describe, it, expect } from "vitest";

describe("FlashcardStudyModal", () => {
  it("can be imported without errors", async () => {
    const mod = await import("../FlashcardStudyModal");
    expect(mod).toBeDefined();
  });
});
