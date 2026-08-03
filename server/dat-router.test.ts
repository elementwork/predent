import { describe, it, expect } from "vitest";
import { datRouter } from "./dat-router";
import { hasDb } from "./test-db-flag";
import { createTestUser, mockContext, seedDatQuestion } from "./test-helpers";

const createCaller = (user?: Awaited<ReturnType<typeof createTestUser>>) =>
  datRouter.createCaller(mockContext(user));

describe.skipIf(!hasDb)("datRouter.listQuestions", () => {
  it("returns questions for a subject", async () => {
    const user = await createTestUser();
    await seedDatQuestion({ subject: "biology" });
    await seedDatQuestion({ subject: "chemistry" });

    const caller = createCaller(user);
    const questions = await caller.listQuestions({ subject: "biology" });

    expect(questions.length).toBeGreaterThan(0);
    expect(questions.every(q => q.subject === "biology")).toBe(true);
  });

  it("filters by difficulty", async () => {
    const user = await createTestUser();
    await seedDatQuestion({ subject: "biology", difficulty: "advanced" });

    const caller = createCaller(user);
    const questions = await caller.listQuestions({
      subject: "biology",
      difficulty: "advanced",
    });

    expect(questions.every(q => q.difficulty === "advanced")).toBe(true);
  });

  it("excludes provided ids", async () => {
    const user = await createTestUser();
    const q = await seedDatQuestion({ subject: "biology" });

    const caller = createCaller(user);
    const questions = await caller.listQuestions({
      subject: "biology",
      excludeIds: [q.id],
    });

    expect(questions.some(item => item.id === q.id)).toBe(false);
  });
});

describe.skipIf(!hasDb)("datRouter.recordAttempt", () => {
  it("records a correct attempt", async () => {
    const user = await createTestUser();
    const question = await seedDatQuestion();
    const caller = createCaller(user);

    const result = await caller.recordAttempt({
      questionId: question.id,
      userAnswer: question.correctAnswer,
      timeSpent: 45,
    });

    expect(result.success).toBe(true);
    expect(result.isCorrect).toBe(true);
  });

  it("records an incorrect attempt and returns correct answer", async () => {
    const user = await createTestUser();
    const question = await seedDatQuestion();
    const caller = createCaller(user);

    const result = await caller.recordAttempt({
      questionId: question.id,
      userAnswer: 99,
      timeSpent: 30,
    });

    expect(result.success).toBe(true);
    expect(result.isCorrect).toBe(false);
    expect(result.correctAnswer).toBe(question.correctAnswer);
    expect(result.explanation).toBe(question.explanation);
  });

  it("throws NOT_FOUND for missing question", async () => {
    const user = await createTestUser();
    const caller = createCaller(user);

    await expect(
      caller.recordAttempt({ questionId: 999999, userAnswer: 0 })
    ).rejects.toThrow("NOT_FOUND");
  });

  it("throws UNAUTHORIZED when no user", async () => {
    const caller = createCaller();
    await expect(
      caller.recordAttempt({ questionId: 1, userAnswer: 0 })
    ).rejects.toThrow("Authentication required");
  });
});

describe.skipIf(!hasDb)("datRouter.stats", () => {
  it("returns zero stats when no attempts", async () => {
    const user = await createTestUser();
    const caller = createCaller(user);

    const stats = await caller.stats();

    expect(stats.total).toBe(0);
    expect(stats.accuracy).toBe(0);
  });
});
