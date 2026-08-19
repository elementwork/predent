import { describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { patRouter } from "./pat-router";
import { getDb } from "./queries/connection";
import { patAttempts, users, type User } from "@db/schema";
import { createTestUser, mockContext } from "./test-helpers";
import { hasDb } from "./test-db-flag";

const createCaller = (user?: Partial<User>) =>
  patRouter.createCaller(mockContext(user as User | undefined));

const premiumFields = {
  role: "user" as const,
  tier: "premium" as const,
  premiumUntil: new Date("2099-01-01T00:00:00.000Z"),
};

describe.skipIf(!hasDb)("patRouter ManipAT sessions", () => {
  it("requires authentication", async () => {
    const caller = createCaller();
    await expect(
      caller.createSession({
        mode: "category",
        category: "angle_ranking",
        difficulty: "beginner",
        count: 1,
        timeLimit: false,
      })
    ).rejects.toThrow("Authentication required");
  });

  it("issues answer-free public DTOs and reserves quota on issue", async () => {
    const user = await createTestUser();
    const caller = createCaller(user);

    const session = await caller.createSession({
      mode: "category",
      category: "angle_ranking",
      difficulty: "beginner",
      count: 1,
      timeLimit: false,
    });

    expect(session.questions).toHaveLength(1);
    expect(session.questions[0]?.publicQuestion.category).toBe("angle");
    expect(session.questions[0]?.publicQuestion.choiceCount).toBe(4);
    expect(session.questions[0]?.instanceId).toMatch(/^v1\./);
    expect(session.questions[0]?.publicQuestion).not.toHaveProperty(
      "correctChoiceIndex"
    );
    expect(session.questions[0]?.publicQuestion).not.toHaveProperty("seed");

    const db = getDb();
    const [storedUser] = await db
      .select({ used: users.patQuestionsGenerated })
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);
    expect(storedUser?.used).toBe(1);
  });

  it("scores a complete session server-side and records it idempotently", async () => {
    const user = await createTestUser();
    const caller = createCaller(user);
    const session = await caller.createSession({
      mode: "category",
      category: "angle_ranking",
      difficulty: "intermediate",
      count: 1,
      timeLimit: false,
    });
    const issued = session.questions[0]!;

    const first = await caller.submitSession({
      sessionId: session.sessionId,
      answers: [
        {
          instanceId: issued.instanceId,
          userAnswer: 0,
          timeSpent: 21,
        },
      ],
    });
    expect(first.results).toHaveLength(1);
    expect(typeof first.results[0]?.isCorrect).toBe("boolean");
    expect(first.results[0]?.solution.explanationHtml.length).toBeGreaterThan(0);

    await caller.submitSession({
      sessionId: session.sessionId,
      answers: [
        {
          instanceId: issued.instanceId,
          userAnswer: 0,
          timeSpent: 21,
        },
      ],
    });

    const db = getDb();
    const rows = await db
      .select({ id: patAttempts.id })
      .from(patAttempts)
      .where(eq(patAttempts.userId, user.id));
    expect(rows).toHaveLength(1);
  });

  it("rejects a session that exceeds remaining quota", async () => {
    const user = await createTestUser({ patQuestionsGenerated: 20 });
    const caller = createCaller(user);

    await expect(
      caller.createSession({
        mode: "category",
        category: "angle_ranking",
        difficulty: "beginner",
        count: 1,
        timeLimit: false,
      })
    ).rejects.toThrow("quota exhausted");
  });
});

describe.skipIf(!hasDb)("patRouter analytics", () => {
  it("returns empty premium analytics when no attempts exist", async () => {
    const caller = createCaller({ id: 9999, ...premiumFields });
    const analytics = await caller.getAnalytics();
    expect(analytics.totalAttempts).toBe(0);
    expect(analytics.overallAccuracy).toBe(0);
  });

  it("returns stats from persisted attempts", async () => {
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

    const stats = await createCaller(user).getStats();
    expect(stats.totalAttempts).toBe(1);
    expect(stats.overallAccuracy).toBe(100);
  });
});
