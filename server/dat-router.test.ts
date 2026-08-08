import { describe, it, expect } from "vitest";
import { datRouter } from "./dat-router";
import { hasDb } from "./test-db-flag";
import { createTestUser, mockContext, seedDatQuestion } from "./test-helpers";

const createCaller = (user?: Awaited<ReturnType<typeof createTestUser>>) =>
  datRouter.createCaller(mockContext(user));

const createPremiumTestUser = () =>
  createTestUser({
    tier: "premium",
    premiumUntil: new Date("2099-01-01T00:00:00.000Z"),
  });

describe.skipIf(!hasDb)("datRouter mock exams", () => {
  it("does not expose answers before submission and grades on the server", async () => {
    const user = await createPremiumTestUser();
    await seedDatQuestion({ subject: "biology" });
    const caller = createCaller(user);

    const exam = await caller.startExam({
      sections: [{ subject: "biology", limit: 1 }],
    });

    expect(exam.questions).toHaveLength(1);
    expect(exam.questions[0]).not.toHaveProperty("correctAnswer");
    expect(exam.questions[0]).not.toHaveProperty("explanation");

    const grade = await caller.submitExam({
      examToken: exam.examToken,
      answers: [
        {
          questionId: exam.questions[0].id,
          userAnswer: 0,
        },
      ],
    });

    expect(grade.results[0]).toHaveProperty("correctAnswer");
    expect(grade.results[0]).toHaveProperty("explanation");
    expect(grade.results[0].userAnswer).toBe(0);
    expect(grade.results[0].isCorrect).toBe(
      grade.results[0].correctAnswer === 0
    );
  });

  it("rejects answers for questions outside the signed exam", async () => {
    const user = await createPremiumTestUser();
    await seedDatQuestion({ subject: "biology" });
    const caller = createCaller(user);
    const exam = await caller.startExam({
      sections: [{ subject: "biology", limit: 1 }],
    });

    await expect(
      caller.submitExam({
        examToken: exam.examToken,
        answers: [{ questionId: 999999, userAnswer: 0 }],
      })
    ).rejects.toThrow("outside this exam");
  });
});

describe.skipIf(!hasDb)("datRouter.listQuestions", () => {
  it("returns questions for a subject", async () => {
    const user = await createPremiumTestUser();
    await seedDatQuestion({ subject: "biology" });
    await seedDatQuestion({ subject: "chemistry" });

    const caller = createCaller(user);
    const questions = await caller.listQuestions({ subject: "biology" });

    expect(questions.length).toBeGreaterThan(0);
    expect(questions.every(q => q.subject === "biology")).toBe(true);
  });

  it("filters by difficulty", async () => {
    const user = await createPremiumTestUser();
    await seedDatQuestion({ subject: "biology", difficulty: "advanced" });

    const caller = createCaller(user);
    const questions = await caller.listQuestions({
      subject: "biology",
      difficulty: "advanced",
    });

    expect(questions.every(q => q.difficulty === "advanced")).toBe(true);
  });

  it("excludes provided ids", async () => {
    const user = await createPremiumTestUser();
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
    const user = await createPremiumTestUser();
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
    const user = await createPremiumTestUser();
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
    const user = await createPremiumTestUser();
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
    const user = await createPremiumTestUser();
    const caller = createCaller(user);

    const stats = await caller.stats();

    expect(stats.total).toBe(0);
    expect(stats.accuracy).toBe(0);
  });
});
