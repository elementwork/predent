import { describe, it, expect } from "vitest";

describe("Login", () => {
  it("can be imported without errors", async () => {
    const mod = await import("../Login");
    expect(mod).toBeDefined();
  });
});
