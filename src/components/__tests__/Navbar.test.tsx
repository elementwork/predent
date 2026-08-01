import { describe, it, expect } from "vitest";

describe("Navbar", () => {
  it("can be imported without errors", async () => {
    const mod = await import("../Navbar");
    expect(mod).toBeDefined();
  });
});
