import { describe, it, expect } from "vitest";

describe("DashboardPage", () => {
  it("can be imported without errors", async () => {
    const mod = await import("../DashboardPage");
    expect(mod).toBeDefined();
  });
});
