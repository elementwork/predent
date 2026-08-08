import { describe, it, expect } from "vitest";
import { patRouter } from "./pat-router";
import { getDb } from "./queries/connection";
import { patAttempts, users, type User } from "@db/schema";
import { createTestUser, mockContext } from "./test-helpers";
import { eq } from "drizzle-orm";
import { getCorrectAnswer } from "./lib/pat-generation";
import { hasDb } from "./test-db-flag";

const createCaller = (user?: Partial<User>) =>
  patRouter.createCaller(mockContext(user as User | undefined));

const premiumFields = {
  role: "user" as const,
  tier: "premium" as const,
  premiumUntil: new Date("2099-01-01T00:00:00.000Z"),
};

describe.skipIf(!hasDb)("patRouter.getPredictedScore", () => {
  it("returns null score when no attempts exist", async () => {
    const caller = createCaller({ id: 9999, ...premiumFields });
    const result = await caller.getPredictedScore();

    expect(result.score).toBeNull();
    expect(result.confidence).toBe(0);
  });
});

describe.skipIf(!hasDb)("patRouter.getAnalytics", () => {
  it("returns empty analytics when no attempts exist", async () => {
    const caller = createCaller({ id: 9999, ...premiumFields });
    const analytics = await caller.getAnalytics();

    expect(analytics.totalAttempts).toBe(0);
    expect(analytics.overallAccuracy).toBe(0);
    expect(analytics.categoryStats).toEqual([]);
    expect(analytics.heatmap).toEqual([]);
    expect(analytics.trend).toEqual([]);
  });

  it("returns analytics after attempts", async () => {
    const user = await createTestUser(premiumFields);
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

describe.skipIf(!hasDb)("patRouter.recordAttempt", () => {
  it("throws UNAUTHORIZED when no user", async () => {
    const caller = createCaller();
    await expect(
      caller.recordAttempt({
        category: "keyholes",
        difficulty: "beginner",
        seed: 1,
        userAnswer: 0,
        timeSpent: 10,
        sessionId: "s1",
      })
    ).rejects.toThrow("Authentication required");
  });
});

describe.skipIf(!hasDb)("patRouter.getStats", () => {
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

describe.skipIf(!hasDb)("patRouter.recordAttempt with seed", () => {
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

  it("does not record an attempt after the quota is exhausted", async () => {
    const user = await createTestUser({ patQuestionsGenerated: 20 });
    const caller = createCaller(user);

    await expect(
      caller.recordAttempt({
        category: "keyholes",
        difficulty: "beginner",
        seed: 300,
        userAnswer: 0,
        timeSpent: 10,
        sessionId: "quota-test",
      })
    ).rejects.toThrow("PAT question quota exhausted");

    const db = getDb();
    const attempts = await db
      .select({ id: patAttempts.id })
      .from(patAttempts)
      .where(eq(patAttempts.userId, user.id));
    expect(attempts).toHaveLength(0);
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

describe.skipIf(!hasDb)("patRouter.getQuota", () => {
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
