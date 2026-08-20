import { describe, expect, it } from "vitest";
import { and, eq } from "drizzle-orm";
import { patRouter } from "./pat-router";
import { getDb } from "./queries/connection";
import { patAttempts, users, type User } from "@db/schema";
import { patQuestionInstances, patSessions } from "@db/pat-schema";
import { createTestUser, mockContext } from "./test-helpers";
import { hasDb } from "./test-db-flag";

const createCaller = (user?: Partial<User>) =>
  patRouter.createCaller(mockContext(user as User | undefined));

const premiumFields = {
  role: "user" as const,
  tier: "premium" as const,
  premiumUntil: new Date("2099-01-01T00:00:00.000Z"),
};

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;

describe.skipIf(!hasDb)("patRouter durable ManipAT sessions", () => {
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

  it("persists answer-free public DTOs and reserves quota on issue", async () => {
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
    expect(session.questions[0]?.instanceId).toMatch(uuidPattern);
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

    const [storedSession] = await db
      .select()
      .from(patSessions)
      .where(eq(patSessions.id, session.sessionId))
      .limit(1);
    expect(storedSession?.questionCount).toBe(1);

    const [storedQuestion] = await db
      .select()
      .from(patQuestionInstances)
      .where(eq(patQuestionInstances.sessionId, session.sessionId))
      .limit(1);
    expect(storedQuestion?.privateRecord).toHaveProperty("correctChoiceIndex");
    expect(JSON.stringify(session.questions[0])).not.toContain("correctChoiceIndex");
  });

  it("restores persisted answer, timing, and flag state", async () => {
    const user = await createTestUser();
    const caller = createCaller(user);
    const session = await caller.createSession({
      mode: "category",
      category: "angle_ranking",
      difficulty: "intermediate",
      count: 1,
      timeLimit: true,
    });
    const issued = session.questions[0]!;

    await caller.saveProgress({
      sessionId: session.sessionId,
      instanceId: issued.instanceId,
      userAnswer: 2,
      timeSpent: 17,
      flagged: true,
    });

    const resumed = await caller.getActiveSession();
    expect(resumed?.sessionId).toBe(session.sessionId);
    expect(resumed?.questions[0]).toMatchObject({
      instanceId: issued.instanceId,
      userAnswer: 2,
      timeSpent: 17,
      flagged: true,
    });
    expect(resumed?.remainingSeconds).toBe(23);
  });

  it("rejects progress after a persisted immutable deadline", async () => {
    const user = await createTestUser();
    const caller = createCaller(user);
    const session = await caller.createSession({
      mode: "category",
      category: "angle_ranking",
      difficulty: "beginner",
      count: 1,
      timeLimit: true,
    });

    const db = getDb();
    await db
      .update(patSessions)
      .set({ deadlineAt: new Date(Date.now() - 1000) })
      .where(eq(patSessions.id, session.sessionId));

    await expect(
      caller.saveProgress({
        sessionId: session.sessionId,
        instanceId: session.questions[0]!.instanceId,
        userAnswer: 0,
        timeSpent: 1,
        flagged: false,
      })
    ).rejects.toThrow("time limit has expired");

    const resumed = await caller.getActiveSession();
    expect(resumed?.expired).toBe(true);
    expect(resumed?.remainingSeconds).toBe(0);
  });

  it("scores persisted answers server-side and remains idempotent", async () => {
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

    await caller.saveProgress({
      sessionId: session.sessionId,
      instanceId: issued.instanceId,
      userAnswer: 0,
      timeSpent: 21,
      flagged: false,
    });

    const first = await caller.submitSession({ sessionId: session.sessionId });
    expect(first.results).toHaveLength(1);
    expect(typeof first.results[0]?.isCorrect).toBe("boolean");
    expect(first.results[0]?.solution.explanationHtml.length).toBeGreaterThan(0);

    const second = await caller.submitSession({ sessionId: session.sessionId });
    expect(second.results).toEqual(first.results);
    expect(await caller.getActiveSession()).toBeNull();

    const db = getDb();
    const rows = await db
      .select()
      .from(patAttempts)
      .where(
        and(
          eq(patAttempts.userId, user.id),
          eq(patAttempts.sessionId, session.sessionId)
        )
      );
    expect(rows).toHaveLength(1);

    await expect(
      db.insert(patAttempts).values({
        userId: user.id,
        category: rows[0]!.category,
        difficulty: rows[0]!.difficulty,
        questionId: rows[0]!.questionId,
        userAnswer: rows[0]!.userAnswer,
        isCorrect: rows[0]!.isCorrect,
        timeSpent: rows[0]!.timeSpent,
        sessionId: session.sessionId,
      })
    ).rejects.toThrow();
  });

  it("requires the current active session to be finished or discarded", async () => {
    const user = await createTestUser();
    const caller = createCaller(user);
    const first = await caller.createSession({
      mode: "category",
      category: "angle_ranking",
      difficulty: "beginner",
      count: 1,
      timeLimit: false,
    });

    await expect(
      caller.createSession({
        mode: "category",
        category: "angle_ranking",
        difficulty: "beginner",
        count: 1,
        timeLimit: false,
      })
    ).rejects.toThrow("active PAT session");

    await caller.abandonSession({ sessionId: first.sessionId });
    await expect(
      caller.createSession({
        mode: "category",
        category: "angle_ranking",
        difficulty: "beginner",
        count: 1,
        timeLimit: false,
      })
    ).resolves.toMatchObject({ questionCount: 1 });
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
