import { describe, expect, it } from "vitest";
import {
  openPatInstance,
  sealPatInstance,
  type PrivatePatQuestionRecord,
} from "./runtime";

const record: PrivatePatQuestionRecord = {
  canonicalQuestionId: "angle:test",
  engineVersion: "0.1.0",
  schemaVersion: 1,
  category: "angle",
  difficultyBand: 2,
  seed: "seed",
  templateId: "angle-template",
  templateVersion: 1,
  candidateGroupCount: 1,
  correctChoiceIndex: 2,
  solution: {
    correctChoiceIndex: 2,
    answerDisplay: "C",
    explanationHtml: "<p>test</p>",
  },
};

describe("PAT instance tokens", () => {
  it("round-trips a private record without exposing it in plaintext", () => {
    const token = sealPatInstance({
      userId: 42,
      sessionId: "11111111-1111-4111-8111-111111111111",
      category: "angle_ranking",
      difficulty: "beginner",
      privateRecord: record,
    });

    expect(token).not.toContain("angle-template");
    expect(token).not.toContain('"correctChoiceIndex":2');

    const claims = openPatInstance(token, {
      userId: 42,
      sessionId: "11111111-1111-4111-8111-111111111111",
    });
    expect(claims.privateRecord.correctChoiceIndex).toBe(2);
  });

  it("rejects tampering and cross-user reuse", () => {
    const token = sealPatInstance({
      userId: 42,
      sessionId: "11111111-1111-4111-8111-111111111111",
      category: "angle_ranking",
      difficulty: "beginner",
      privateRecord: record,
    });

    const tampered = `${token.slice(0, -1)}${token.endsWith("A") ? "B" : "A"}`;
    expect(() =>
      openPatInstance(tampered, {
        userId: 42,
        sessionId: "11111111-1111-4111-8111-111111111111",
      })
    ).toThrow("Invalid PAT question instance");

    expect(() =>
      openPatInstance(token, {
        userId: 7,
        sessionId: "11111111-1111-4111-8111-111111111111",
      })
    ).toThrow("does not belong");
  });
});
