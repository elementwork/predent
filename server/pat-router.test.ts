import { describe, it, expect, beforeAll } from "vitest";
import { patRouter } from "./pat-router";
import { getDb } from "./queries/connection";
import { patAttempts, patQuestions, users, type User } from "@db/schema";
import { createTestUser, mockContext, seedPatQuestion } from "./test-helpers";
import { eq } from "drizzle-orm";
import { getCorrectAnswer } from "./lib/pat-generation";

const createCaller = (user?: Partial<User>) =>
  patRouter.createCaller(mockContext(user as User | undefined));

const db = getDb();

const seedQuestion = async (
  overrides: Partial<typeof patQuestions.$inferInsert> = {}
) => {
  const db = getDb();
  await db.insert(patQuestions).values({
    publicId: `test-${Math.random().toString(36).slice(2)}`,
    category: "keyholes",
    difficulty: "beginner",
    source: "curated",
    questionData: {
      prompt: "Test prompt",
      diagram: "",
      options: ["A", "B", "C", "D"],
    },
    correctAnswer: 0,
    explanationL1: "L1",
    explanationL2: "L2",
    explanationL3: "L3",
    concepts: ["concept"],
    timeTarget: 30,
    ...overrides,
  });
};

describe("patRouter.getQuestionCount", () => {
  beforeAll(async () => {
    await db.delete(patAttempts);
    await db.delete(patQuestions);
    await seedQuestion({ category: "keyholes" });
    await seedQuestion({ category: "keyholes" });
    await seedQuestion({ category: "tfe" });
  });

  it("returns total counts per category", async () => {
    const caller = createCaller();
    const counts = await caller.getQuestionCount({});

    expect(counts.keyholes).toBe(2);
    expect(counts.tfe).toBe(1);
  });

  it("can filter by category", async () => {
    const caller = createCaller();
    const count = await caller.getQuestionCount({ category: "keyholes" });

    expect(count).toEqual({ total: 2 });
  });
});

describe("patRouter.getPredictedScore", () => {
  it("returns null score when no attempts exist", async () => {
    const caller = createCaller({ id: 9999, role: "user" });
    const result = await caller.getPredictedScore();

    expect(result.score).toBeNull();
    expect(result.confidence).toBe(0);
  });
});

describe("patRouter.getAnalytics", () => {
  it("returns empty analytics when no attempts exist", async () => {
    const caller = createCaller({ id: 9999, role: "user" });
    const analytics = await caller.getAnalytics();

    expect(analytics.totalAttempts).toBe(0);
    expect(analytics.overallAccuracy).toBe(0);
    expect(analytics.categoryStats).toEqual([]);
    expect(analytics.heatmap).toEqual([]);
    expect(analytics.trend).toEqual([]);
  });

  it("returns analytics after attempts", async () => {
    const user = await createTestUser();
    const db = getDb();
    await db.insert(patAttempts).values({
      userId: user.id,
      category: "keyholes",
      difficulty: "beginner",
      questionId: "q1",
      userAnswer: 0,
      isCorrect: true,
      timeSpent: 30,
      sessionId: "s1",
    });

    const caller = createCaller(user);
    const analytics = await caller.getAnalytics();

    expect(analytics.totalAttempts).toBe(1);
    expect(analytics.overallAccuracy).toBe(100);
    expect(analytics.categoryStats).toHaveLength(1);
  });
});

describe("patRouter.getQuestions", () => {
  it("returns questions for authenticated user", async () => {
    await seedQuestion({ category: "keyholes" });
    const user = await createTestUser();
    const caller = createCaller(user);

    const questions = await caller.getQuestions({ count: 1 });

    expect(questions.length).toBeLessThanOrEqual(1);
  });

  it("throws UNAUTHORIZED when no user", async () => {
    const caller = createCaller();
    await expect(caller.getQuestions({})).rejects.toThrow(
      "Authentication required"
    );
  });
});

describe("patRouter.recordAttempt", () => {
  it("records an attempt", async () => {
    const user = await createTestUser();
    const caller = createCaller(user);

    const result = await caller.recordAttempt({
      category: "keyholes",
      difficulty: "beginner",
      seed: 12345,
      userAnswer: 0,
      timeSpent: 30,
      sessionId: "s1",
    });

    expect(result.success).toBe(true);
  });
});

describe("patRouter.getStats", () => {
  it("returns stats after attempts", async () => {
    const user = await createTestUser();
    const db = getDb();
    await db.insert(patAttempts).values({
      userId: user.id,
      category: "keyholes",
      difficulty: "beginner",
      questionId: "q1",
      userAnswer: 0,
      isCorrect: true,
      timeSpent: 30,
      sessionId: "s1",
    });

    const caller = createCaller(user);
    const stats = await caller.getStats();

    expect(stats.totalAttempts).toBe(1);
    expect(stats.overallAccuracy).toBe(100);
  });

  it("returns per-category accuracy breakdown", async () => {
    const user = await createTestUser();
    const db = getDb();
    await db.insert(patAttempts).values({
      userId: user.id,
      category: "keyholes",
      difficulty: "beginner",
      questionId: "q1",
      userAnswer: 0,
      isCorrect: true,
      timeSpent: 30,
      sessionId: "s1",
    });
    await db.insert(patAttempts).values({
      userId: user.id,
      category: "keyholes",
      difficulty: "beginner",
      questionId: "q2",
      userAnswer: 1,
      isCorrect: false,
      timeSpent: 45,
      sessionId: "s1",
    });
    await db.insert(patAttempts).values({
      userId: user.id,
      category: "tfe",
      difficulty: "beginner",
      questionId: "q3",
      userAnswer: 2,
      isCorrect: true,
      timeSpent: 20,
      sessionId: "s2",
    });

    const caller = createCaller(user);
    const stats = await caller.getStats();

    expect(stats.categoryStats).toHaveLength(2);
    const keyholesStats = stats.categoryStats.find(
      c => c.category === "keyholes"
    );
    expect(keyholesStats).toBeDefined();
    expect(keyholesStats!.accuracy).toBe(50);
    expect(keyholesStats!.total).toBe(2);
  });

  it("returns recent attempts limited to 50", async () => {
    const user = await createTestUser();
    const caller = createCaller(user);
    const stats = await caller.getStats();

    expect(stats.recentAttempts.length).toBeLessThanOrEqual(50);
  });
});

describe("patRouter.getQuestions", () => {
  it("excludes deleted questions", async () => {
    const db = getDb();
    const q = await seedPatQuestion({ category: "pattern_folding" });
    await db
      .update(patQuestions)
      .set({ deletedAt: new Date() })
      .where(eq(patQuestions.id, q.id));
    const user = await createTestUser();
    const caller = createCaller(user);

    const questions = await caller.getQuestions({
      count: 10,
      categories: ["pattern_folding"],
    });

    expect(questions).toHaveLength(0);
  });

  it("excludes specified excludeIds", async () => {
    const q = await seedPatQuestion({ category: "keyholes" });
    const user = await createTestUser();
    const caller = createCaller(user);

    const questions = await caller.getQuestions({
      count: 10,
      excludeIds: [q.publicId],
    });

    expect(questions.some(item => item.id === q.publicId)).toBe(false);
  });

  it("strips correctAnswer from response (anti-cheat)", async () => {
    await seedPatQuestion({ category: "keyholes" });
    const user = await createTestUser();
    const caller = createCaller(user);

    const questions = await caller.getQuestions({ count: 1 });

    expect(questions.length).toBeGreaterThan(0);
    const q = questions[0];
    expect(q).toHaveProperty("prompt");
    expect(q).toHaveProperty("options");
    expect(q).not.toHaveProperty("correctAnswer");
  });
});

describe("patRouter.verifyAnswer", () => {
  it("returns correct=true and explanations for right answer", async () => {
    const question = await seedPatQuestion({ correctAnswer: 0 });
    const user = await createTestUser();
    const caller = createCaller(user);

    const result = await caller.verifyAnswer({
      questionId: question.publicId,
      userAnswer: 0,
    });

    expect(result.isCorrect).toBe(true);
    expect(result.correctAnswer).toBe(0);
    expect(result.explanationL1).toBeDefined();
    expect(result.explanationL2).toBeDefined();
    expect(result.explanationL3).toBeDefined();
  });

  it("returns correct=false and explanations for wrong answer", async () => {
    const question = await seedPatQuestion({ correctAnswer: 2 });
    const user = await createTestUser();
    const caller = createCaller(user);

    const result = await caller.verifyAnswer({
      questionId: question.publicId,
      userAnswer: 0,
    });

    expect(result.isCorrect).toBe(false);
    expect(result.correctAnswer).toBe(2);
  });

  it("throws NOT_FOUND for missing question", async () => {
    const user = await createTestUser();
    const caller = createCaller(user);

    await expect(
      caller.verifyAnswer({ questionId: "nonexistent", userAnswer: 0 })
    ).rejects.toThrow("NOT_FOUND");
  });
});

describe("patRouter.recordAttempt with seed", () => {
  it("records an attempt with seed and increments quota", async () => {
    const user = await createTestUser();
    const caller = createCaller(user);

    const result = await caller.recordAttempt({
      category: "keyholes",
      difficulty: "beginner",
      seed: 12345,
      userAnswer: 0,
      timeSpent: 30,
      sessionId: "s1",
    });

    expect(result.success).toBe(true);
    expect(typeof result.isCorrect).toBe("boolean");

    const db = getDb();
    const [u] = await db
      .select({ patQuestionsGenerated: users.patQuestionsGenerated })
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);
    expect(u.patQuestionsGenerated).toBe(1);
  });

  it("increments quota on each generated question", async () => {
    const user = await createTestUser();
    const caller = createCaller(user);

    await caller.recordAttempt({
      category: "keyholes",
      difficulty: "beginner",
      seed: 100,
      userAnswer: 0,
      timeSpent: 10,
      sessionId: "s1",
    });
    await caller.recordAttempt({
      category: "tfe",
      difficulty: "intermediate",
      seed: 200,
      userAnswer: 1,
      timeSpent: 15,
      sessionId: "s1",
    });

    const db = getDb();
    const [u] = await db
      .select({ patQuestionsGenerated: users.patQuestionsGenerated })
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);
    expect(u.patQuestionsGenerated).toBe(2);
  });

  it("re-derives correct answer from seed server-side", async () => {
    const user = await createTestUser();
    const caller = createCaller(user);

    const correctAnswer = getCorrectAnswer("keyholes", {
      seed: 9999,
      difficulty: "medium",
    });

    const result = await caller.recordAttempt({
      category: "keyholes",
      difficulty: "intermediate",
      seed: 9999,
      userAnswer: correctAnswer,
      timeSpent: 20,
      sessionId: "s2",
    });

    expect(result.isCorrect).toBe(true);
  });

  it("returns isCorrect=false for wrong answer", async () => {
    const user = await createTestUser();
    const caller = createCaller(user);

    const correctAnswer = getCorrectAnswer("angle_ranking", {
      seed: 5555,
      difficulty: "hard",
    });
    const wrongAnswer = (correctAnswer + 1) % 4;

    const result = await caller.recordAttempt({
      category: "angle_ranking",
      difficulty: "advanced",
      seed: 5555,
      userAnswer: wrongAnswer,
      timeSpent: 25,
      sessionId: "s3",
    });

    expect(result.isCorrect).toBe(false);
  });
});

describe("patRouter.getQuota", () => {
  it("returns default quota for new user", async () => {
    const user = await createTestUser();
    const caller = createCaller(user);
    const quota = await caller.getQuota();

    expect(quota.tier).toBe("free");
    expect(quota.quota).toBe(20);
    expect(quota.used).toBe(0);
    expect(quota.remaining).toBe(20);
  });

  it("returns correct used count after recordAttempt", async () => {
    const user = await createTestUser();
    const caller = createCaller(user);

    await caller.recordAttempt({
      category: "keyholes",
      difficulty: "beginner",
      seed: 111,
      userAnswer: 0,
      timeSpent: 10,
      sessionId: "s1",
    });

    const quota = await caller.getQuota();
    expect(quota.used).toBe(1);
    expect(quota.remaining).toBe(19);
  });
});
