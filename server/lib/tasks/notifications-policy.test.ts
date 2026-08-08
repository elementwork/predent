import { describe, expect, it } from "vitest";
import { getTaskDueEmail } from "./notifications";

describe("getTaskDueEmail", () => {
  it("returns the address when task emails are enabled", () => {
    expect(
      getTaskDueEmail({ email: "student@example.com", emailTaskDue: true })
    ).toBe("student@example.com");
  });

  it("honors task-email opt-out", () => {
    expect(
      getTaskDueEmail({ email: "student@example.com", emailTaskDue: false })
    ).toBeUndefined();
  });

  it("does not request email delivery without an address", () => {
    expect(
      getTaskDueEmail({ email: null, emailTaskDue: true })
    ).toBeUndefined();
  });
});
