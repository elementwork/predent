import { z } from "zod";
import { and, desc, eq, isNull, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { createRouter, authedQuery, premiumQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { patAttempts, users } from "@db/schema";
import { patQuestionInstances, patSessions } from "@db/pat-schema";
import { computePredictedScore } from "./lib/score-prediction";
import {
  getPatAggregates,
  percentage,
} from "./repositories/analytics-repository";
import { getEffectiveTier, getTierQuota } from "@contracts/tiers";
import {
  PREDENT_PAT_CATEGORIES,
  PREDENT_PAT_DIFFICULTIES,
} from "./services/pat/categories";
import { generatePatSession } from "./services/pat/session";
import type {
  PrivatePatQuestionRecord,
  PublicPatQuestion,
} from "./services/pat/runtime";

const categoryEnum = z.enum(PREDENT_PAT_CATEGORIES);
const difficultyEnum = z.enum(PREDENT_PAT_DIFFICULTIES);
const modeEnum = z.enum(["quick", "category", "timed", "mixed", "exam"]);

type PatSessionRow = typeof patSessions.$inferSelect;
type PatQuestionRow = typeof patQuestionInstances.$inferSelect;

const asPublicQuestion = (value: Record<string, unknown>): PublicPatQuestion =>
  value as unknown as PublicPatQuestion;
const asPrivateRecord = (
  value: Record<string, unknown>
): PrivatePatQuestionRecord => value as unknown as PrivatePatQuestionRecord;

const getQuotaState = async (userId: number) => {
  const db = getDb();
  const [user] = await db
    .select({
      tier: users.tier,
      premiumUntil: users.premiumUntil,
      patQuestionsGenerated: users.patQuestionsGenerated,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) throw new TRPCError({ code: "NOT_FOUND" });

  const tier = getEffectiveTier(user.tier, user.premiumUntil);
  const quota = getTierQuota(tier);
  const used = user.patQuestionsGenerated ?? 0;
  return {
    tier,
    quota,
    used,
    remaining: Math.max(0, quota - used),
  };
};

const loadQuestionRows = async (sessionId: string): Promise<PatQuestionRow[]> => {
  const db = getDb();
  return db
    .select()
    .from(patQuestionInstances)
    .where(eq(patQuestionInstances.sessionId, sessionId))
    .orderBy(patQuestionInstances.position);
};

const remainingSecondsFor = (
  session: PatSessionRow,
  questions: readonly PatQuestionRow[],
  now = new Date()
): number | null => {
  if (session.timeLimitSeconds === null) return null;
  if (session.deadlineAt) {
    return Math.max(
      0,
      Math.ceil((session.deadlineAt.getTime() - now.getTime()) / 1000)
    );
  }
  const elapsed = questions.reduce((total, question) => total + question.timeSpent, 0);
  return Math.max(0, session.timeLimitSeconds - elapsed);
};

const publicSessionPayload = (
  session: PatSessionRow,
  questions: readonly PatQuestionRow[],
  now = new Date()
) => ({
  sessionId: session.id,
  mode: session.mode,
  category: session.category,
  difficulty: session.difficulty,
  questionCount: session.questionCount,
  sessionTimeLimitSeconds: session.timeLimitSeconds,
  startedAt: session.startedAt,
  deadlineAt: session.deadlineAt,
  remainingSeconds: remainingSecondsFor(session, questions, now),
  engineVersion: session.engineVersion,
  expired: session.deadlineAt !== null && session.deadlineAt.getTime() <= now.getTime(),
  questions: questions.map(question => ({
    instanceId: question.id,
    publicQuestion: asPublicQuestion(question.publicQuestion),
    userAnswer: question.userAnswer,
    timeSpent: question.timeSpent,
    flagged: question.flagged,
  })),
});

const resultForQuestion = (question: PatQuestionRow) => {
  const record = asPrivateRecord(question.privateRecord);
  const userAnswer = question.userAnswer ?? -1;
  const isCorrect =
    question.userAnswer !== null &&
    question.userAnswer === record.correctChoiceIndex;
  return {
    instanceId: question.id,
    category: question.category,
    difficulty: question.difficulty,
    difficultyBand: question.difficultyBand,
    canonicalQuestionId: question.canonicalQuestionId,
    userAnswer,
    isCorrect,
    correctChoiceIndex: record.correctChoiceIndex,
    solution: record.solution,
  };
};

export const patRouter = createRouter({
  createSession: authedQuery
    .input(
      z.object({
        mode: modeEnum,
        category: categoryEnum.optional(),
        difficulty: difficultyEnum,
        count: z.number().int().min(1).max(90).default(10),
        timeLimit: z.boolean().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (input.mode === "category" && !input.category) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Choose a PAT category for category drill mode.",
        });
      }

      const db = getDb();
      const [activeSession] = await db
        .select({ id: patSessions.id })
        .from(patSessions)
        .where(
          and(
            eq(patSessions.userId, ctx.user.id),
            isNull(patSessions.submittedAt),
            isNull(patSessions.abandonedAt)
          )
        )
        .limit(1);
      if (activeSession) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Finish or discard your active PAT session before starting another one.",
        });
      }

      const requestedCount =
        input.mode === "quick"
          ? 10
          : input.mode === "timed"
            ? 15
            : input.mode === "exam"
              ? 90
              : input.count;

      const quotaState = await getQuotaState(ctx.user.id);
      if (requestedCount > quotaState.remaining) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: `PAT question quota exhausted. ${quotaState.remaining} question${
            quotaState.remaining === 1 ? "" : "s"
          } remaining.`,
        });
      }

      let generated;
      try {
        generated = await generatePatSession({
          userId: ctx.user.id,
          mode: input.mode,
          ...(input.category === undefined ? {} : { category: input.category }),
          difficulty: input.difficulty,
          requestedCount: input.count,
          timeLimit: input.timeLimit,
        });
      } catch (error) {
        console.error("[pat] ManipAT session generation failed", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Unable to generate this PAT session. Please try again.",
        });
      }

      const startedAt = new Date();
      const deadlineAt =
        input.mode === "exam" && generated.sessionTimeLimitSeconds !== null
          ? new Date(startedAt.getTime() + generated.sessionTimeLimitSeconds * 1000)
          : null;

      const reservation = await db.transaction(async tx => {
        const [reserved] = await tx
          .update(users)
          .set({
            patQuestionsGenerated: sql`${users.patQuestionsGenerated} + ${generated.questionCount}`,
          })
          .where(
            and(
              eq(users.id, ctx.user.id),
              sql`${users.patQuestionsGenerated} + ${generated.questionCount} <= ${quotaState.quota}`
            )
          )
          .returning({ used: users.patQuestionsGenerated });

        if (!reserved) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "PAT question quota was exhausted by another session.",
          });
        }

        await tx.insert(patSessions).values({
          id: generated.sessionId,
          userId: ctx.user.id,
          mode: input.mode,
          category: input.mode === "category" ? input.category ?? null : null,
          difficulty: input.difficulty,
          questionCount: generated.questionCount,
          timeLimitSeconds: generated.sessionTimeLimitSeconds,
          engineVersion: generated.engineInfo.engineVersion,
          startedAt,
          deadlineAt,
        });

        await tx.insert(patQuestionInstances).values(
          generated.questions.map((question, position) => ({
            id: question.instanceId,
            sessionId: generated.sessionId,
            position,
            category: question.category,
            difficulty: question.difficulty,
            difficultyBand: question.privateRecord.difficultyBand,
            canonicalQuestionId: question.privateRecord.canonicalQuestionId,
            publicQuestion: question.publicQuestion as unknown as Record<string, unknown>,
            privateRecord: question.privateRecord as unknown as Record<string, unknown>,
          }))
        );

        return reserved;
      });

      return {
        sessionId: generated.sessionId,
        mode: input.mode,
        category: input.mode === "category" ? input.category ?? null : null,
        difficulty: input.difficulty,
        questionCount: generated.questionCount,
        sessionTimeLimitSeconds: generated.sessionTimeLimitSeconds,
        startedAt,
        deadlineAt,
        remainingSeconds: generated.sessionTimeLimitSeconds,
        engineVersion: generated.engineInfo.engineVersion,
        expired: false,
        questions: generated.questions.map(question => ({
          instanceId: question.instanceId,
          publicQuestion: question.publicQuestion,
          userAnswer: null,
          timeSpent: 0,
          flagged: false,
        })),
        engineInfo: generated.engineInfo,
        quota: {
          tier: quotaState.tier,
          quota: quotaState.quota,
          used: reservation.used,
          remaining: Math.max(0, quotaState.quota - reservation.used),
        },
      };
    }),

  getActiveSession: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const [session] = await db
      .select()
      .from(patSessions)
      .where(
        and(
          eq(patSessions.userId, ctx.user.id),
          isNull(patSessions.submittedAt),
          isNull(patSessions.abandonedAt)
        )
      )
      .orderBy(desc(patSessions.createdAt))
      .limit(1);
    if (!session) return null;
    const questions = await loadQuestionRows(session.id);
    return publicSessionPayload(session, questions);
  }),

  saveProgress: authedQuery
    .input(
      z.object({
        sessionId: z.string().uuid(),
        instanceId: z.string().uuid(),
        userAnswer: z.number().int().min(-1).max(4),
        timeSpent: z.number().int().min(0).max(7200),
        flagged: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const [session] = await db
        .select()
        .from(patSessions)
        .where(
          and(
            eq(patSessions.id, input.sessionId),
            eq(patSessions.userId, ctx.user.id)
          )
        )
        .limit(1);
      if (!session) throw new TRPCError({ code: "NOT_FOUND" });
      if (session.submittedAt || session.abandonedAt) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "This PAT session is already closed.",
        });
      }
      if (session.deadlineAt && session.deadlineAt.getTime() <= Date.now()) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "PAT session time limit has expired.",
        });
      }

      const [saved] = await db
        .update(patQuestionInstances)
        .set({
          userAnswer: input.userAnswer < 0 ? null : input.userAnswer,
          timeSpent: input.timeSpent,
          flagged: input.flagged,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(patQuestionInstances.id, input.instanceId),
            eq(patQuestionInstances.sessionId, input.sessionId)
          )
        )
        .returning({ id: patQuestionInstances.id });
      if (!saved) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "PAT question instance does not belong to this session.",
        });
      }
      return { saved: true };
    }),

  abandonSession: authedQuery
    .input(z.object({ sessionId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const [abandoned] = await db
        .update(patSessions)
        .set({ abandonedAt: new Date(), updatedAt: new Date() })
        .where(
          and(
            eq(patSessions.id, input.sessionId),
            eq(patSessions.userId, ctx.user.id),
            isNull(patSessions.submittedAt),
            isNull(patSessions.abandonedAt)
          )
        )
        .returning({ id: patSessions.id });
      if (!abandoned) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "PAT session is already closed or does not exist.",
        });
      }
      return { abandoned: true };
    }),

  submitSession: authedQuery
    .input(z.object({ sessionId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const now = new Date();
      const finalized = await db.transaction(async tx => {
        const [session] = await tx
          .select()
          .from(patSessions)
          .where(
            and(
              eq(patSessions.id, input.sessionId),
              eq(patSessions.userId, ctx.user.id)
            )
          )
          .limit(1);
        if (!session) throw new TRPCError({ code: "NOT_FOUND" });
        if (session.abandonedAt) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "This PAT session was discarded.",
          });
        }

        const questions = await tx
          .select()
          .from(patQuestionInstances)
          .where(eq(patQuestionInstances.sessionId, input.sessionId))
          .orderBy(patQuestionInstances.position);
        if (questions.length !== session.questionCount) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "PAT session question state is incomplete.",
          });
        }

        if (!session.submittedAt) {
          await tx
            .update(patSessions)
            .set({ submittedAt: now, updatedAt: now })
            .where(
              and(
                eq(patSessions.id, input.sessionId),
                eq(patSessions.userId, ctx.user.id),
                isNull(patSessions.submittedAt),
                isNull(patSessions.abandonedAt)
              )
            );

          const attempts = questions.map(question => {
            const record = asPrivateRecord(question.privateRecord);
            return {
              userId: ctx.user.id,
              category: question.category,
              difficulty: question.difficulty,
              questionId: question.canonicalQuestionId,
              userAnswer: question.userAnswer,
              isCorrect:
                question.userAnswer !== null &&
                question.userAnswer === record.correctChoiceIndex,
              timeSpent: question.timeSpent,
              sessionId: input.sessionId,
            };
          });
          if (attempts.length > 0) {
            await tx.insert(patAttempts).values(attempts).onConflictDoNothing();
          }
        }

        return { session, questions };
      });

      return {
        sessionId: input.sessionId,
        submittedAt: finalized.session.submittedAt ?? now,
        results: finalized.questions.map(resultForQuestion),
      };
    }),

  getQuota: authedQuery.query(async ({ ctx }) => getQuotaState(ctx.user.id)),

  getStats: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const [aggregates, recentAttempts] = await Promise.all([
      getPatAggregates(ctx.user.id),
      db.query.patAttempts.findMany({
        where: eq(patAttempts.userId, ctx.user.id),
        orderBy: [desc(patAttempts.createdAt)],
        limit: 50,
      }),
    ]);

    return {
      overallAccuracy: percentage(
        aggregates.overall.correct,
        aggregates.overall.total
      ),
      totalAttempts: aggregates.overall.total,
      categoryStats: aggregates.categories.map(row => ({
        category: row.category,
        accuracy: percentage(row.correct, row.total),
        avgTime: row.avgTime,
        total: row.total,
      })),
      recentAttempts,
    };
  }),

  getPredictedScore: premiumQuery.query(async ({ ctx }) => {
    const db = getDb();
    const attempts = await db.query.patAttempts.findMany({
      where: eq(patAttempts.userId, ctx.user.id),
      orderBy: [desc(patAttempts.createdAt)],
      limit: 1000,
    });

    if (attempts.length === 0) return { score: null, confidence: 0 };

    const { score, confidence } = computePredictedScore(attempts);
    return { score, confidence };
  }),

  getAnalytics: premiumQuery.query(async ({ ctx }) => {
    const db = getDb();
    const [attempts, aggregates] = await Promise.all([
      db.query.patAttempts.findMany({
        where: eq(patAttempts.userId, ctx.user.id),
        orderBy: [desc(patAttempts.createdAt)],
        limit: 1000,
      }),
      getPatAggregates(ctx.user.id),
    ]);

    if (attempts.length === 0) {
      return {
        overallAccuracy: 0,
        avgTime: 0,
        predictedScore: null,
        predictedConfidence: 0,
        totalAttempts: 0,
        categoryStats: [],
        trend: [],
        heatmap: [],
        strengths: [],
        weaknesses: [],
      };
    }

    const overallAccuracy = percentage(
      aggregates.overall.correct,
      aggregates.overall.total
    );
    const avgTime = aggregates.overall.avgTime;
    const { score: predictedScore, confidence: predictedConfidence } =
      computePredictedScore(attempts);

    const categoryStats = aggregates.categories.map(row => ({
      category: row.category,
      accuracy: percentage(row.correct, row.total),
      avgTime: row.avgTime,
      total: row.total,
    }));

    const difficulties: Array<
      "beginner" | "intermediate" | "advanced" | "elite"
    > = ["beginner", "intermediate", "advanced", "elite"];
    const heatmapMap = new Map<
      string,
      Map<string, { correct: number; total: number }>
    >();
    for (const item of aggregates.heatmap) {
      const values = heatmapMap.get(item.category) ?? new Map();
      values.set(item.difficulty, item);
      heatmapMap.set(item.category, values);
    }
    const heatmap = [...heatmapMap].map(([cat, byDiff]) => {
      const row: {
        category: string;
        beginner: number;
        intermediate: number;
        advanced: number;
        elite: number;
      } = {
        category: cat,
        beginner: 0,
        intermediate: 0,
        advanced: 0,
        elite: 0,
      };
      for (const difficulty of difficulties) {
        const stats = byDiff.get(difficulty);
        row[difficulty] = stats
          ? percentage(stats.correct, stats.total)
          : 0;
      }
      return row;
    });

    const sessions: Record<string, { correct: number; total: number }> = {};
    const sessionOrder: string[] = [];
    attempts.forEach(attempt => {
      const sessionId = attempt.sessionId ?? "unknown";
      if (!sessions[sessionId]) {
        sessions[sessionId] = { correct: 0, total: 0 };
        sessionOrder.push(sessionId);
      }
      sessions[sessionId].total += 1;
      if (attempt.isCorrect) sessions[sessionId].correct += 1;
    });

    const trend = sessionOrder
      .slice(0, 10)
      .reverse()
      .map((sessionId, index) => ({
        session: index + 1,
        accuracy: Math.round(
          (sessions[sessionId]!.correct / sessions[sessionId]!.total) * 100
        ),
      }));

    const sortedByAccuracy = [...categoryStats].sort(
      (first, second) => first.accuracy - second.accuracy
    );
    const weaknesses = sortedByAccuracy.slice(0, 2).map(category => ({
      category: category.category,
      accuracy: category.accuracy,
      action:
        category.category === "pattern_folding"
          ? "Practice 20 min daily"
          : category.category === "tfe"
            ? "Use 3D model viewer"
            : "Focus on fundamentals",
    }));
    const strengths = [...categoryStats]
      .sort((first, second) => second.accuracy - first.accuracy)
      .slice(0, 2)
      .map(category => ({
        category: category.category,
        accuracy: category.accuracy,
      }));

    return {
      overallAccuracy,
      avgTime,
      predictedScore,
      predictedConfidence,
      totalAttempts: aggregates.overall.total,
      categoryStats,
      trend,
      heatmap,
      strengths,
      weaknesses,
    };
  }),
});
