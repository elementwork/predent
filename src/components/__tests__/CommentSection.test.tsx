import { describe, it, expect } from "vitest";

describe("CommentSection", () => {
  it("can be imported without errors", async () => {
    const mod = await import("../CommentSection");
    expect(mod).toBeDefined();
  });
});
