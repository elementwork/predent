import { describe, it, expect } from "vitest";

describe("NotificationBell", () => {
  it("can be imported without errors", async () => {
    const mod = await import("../NotificationBell");
    expect(mod).toBeDefined();
  });
});
