import { describe, it, expect } from "vitest";

describe("AdminDashboardPage", () => {
  it("can be imported without errors", async () => {
    const mod = await import("../AdminDashboardPage");
    expect(mod).toBeDefined();
  });
});
