import { describe, it, expect } from "vitest";

describe("NotificationSettingsPage", () => {
  it("can be imported without errors", async () => {
    const mod = await import("../NotificationSettingsPage");
    expect(mod).toBeDefined();
  });
});
