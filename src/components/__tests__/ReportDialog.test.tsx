import { describe, it, expect } from "vitest";

describe("ReportDialog", () => {
  it("can be imported without errors", async () => {
    const mod = await import("../ReportDialog");
    expect(mod).toBeDefined();
  });
});
