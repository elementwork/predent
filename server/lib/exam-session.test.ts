import { describe, expect, it } from "vitest";
import { signExamSession, verifyExamSession } from "./exam-session";

describe("DAT exam session tokens", () => {
  it("round-trips a valid signed exam session", async () => {
    const token = await signExamSession({ userId: 42, questionIds: [1, 2, 3] });

    await expect(verifyExamSession(token, 42)).resolves.toEqual({
      userId: 42,
      questionIds: [1, 2, 3],
    });
  });

  it("rejects use by a different user", async () => {
    const token = await signExamSession({ userId: 42, questionIds: [1, 2, 3] });

    await expect(verifyExamSession(token, 43)).resolves.toBeNull();
  });

  it("rejects a tampered token", async () => {
    const token = await signExamSession({ userId: 42, questionIds: [1, 2, 3] });
    const parts = token.split(".");
    parts[2] = `${parts[2].startsWith("a") ? "b" : "a"}${parts[2].slice(1)}`;
    const tampered = parts.join(".");

    await expect(verifyExamSession(tampered, 42)).resolves.toBeNull();
  });
});
