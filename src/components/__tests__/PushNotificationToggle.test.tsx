import { describe, it, expect } from "vitest";

describe("PushNotificationToggle", () => {
  it("can be imported without errors", async () => {
    const mod = await import("../PushNotificationToggle");
    expect(mod).toBeDefined();
  });
});
