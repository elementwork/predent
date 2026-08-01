import { describe, it, expect } from "vitest";

describe("InterviewPrepPage", () => {
  it("can be imported without errors", async () => {
    const mod = await import("../InterviewPrepPage");
    expect(mod).toBeDefined();
  });
});
