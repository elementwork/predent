import { describe, it, expect } from "vitest";

describe("useAuth", () => {
  it("can be imported without errors", async () => {
    const mod = await import("../useAuth");
    expect(mod).toBeDefined();
    expect(typeof mod.useAuth).toBe("function");
  });
});
