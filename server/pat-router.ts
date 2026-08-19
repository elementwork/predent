import { z } from "zod";
import { and, desc, eq, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { createRouter, authedQuery, premiumQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { patAttempts, users } from "@db/schema";
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
import { openPatInstance } from "./services/pat/runtime";

const categoryEnum = z.enum(PREDENT_PAT_CATEGORIES);
const difficultyEnum = z.enum(PREDENT_PAT_DIFFICULTIES);
const modeEnum = z.enum(["quick", "category", "timed", "mixed", "exam"]);

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

      let session;
      try {
        session = await generatePatSession({
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

      const db = getDb();
      const [reservation] = await db
        .update(users)
        .set({
          patQuestionsGenerated: sql`${users.patQuestionsGenerated} + ${session.questionCount}`,
        })
        .where(
          and(
            eq(users.id, ctx.user.id),
            sql`${users.patQuestionsGenerated} + ${session.questionCount} <= ${quotaState.quota}`
          )
        )
        .returning({ used: users.patQuestionsGenerated });

      if (!reservation) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "PAT question quota was exhausted by another session.",
        });
      }

      return {
        ...session,
        quota: {
          tier: quotaState.tier,
          quota: quotaState.quota,
          used: reservation.used,
          remaining: Math.max(0, quotaState.quota - reservation.used),
        },
      };
    }),

  submitSession: authedQuery
    .input(
      z.object({
        sessionId: z.string().uuid(),
        answers: z
          .array(
            z.object({
              instanceId: z.string().min(20),
              userAnswer: z.number().int().min(-1).max(4),
              timeSpent: z.number().int().min(0).max(7200),
            })
          )
          .min(1)
          .max(90),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const decoded = input.answers.map(answer => {
        try {
          const claims = openPatInstance(answer.instanceId, {
            userId: ctx.user.id,
            sessionId: input.sessionId,
          });
          const isCorrect =
            answer.userAnswer === claims.privateRecord.correctChoiceIndex;
          return {
            instanceId: answer.instanceId,
            claims,
            userAnswer: answer.userAnswer,
            timeSpent: answer.timeSpent,
            isCorrect,
          };
        } catch (error) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message:
              error instanceof Error
                ? error.message
                : "Invalid PAT question instance",
          });
        }
      });

      const db = getDb();
      const existingRows = await db
        .select({ questionId: patAttempts.questionId })
        .from(patAttempts)
        .where(
          and(
            eq(patAttempts.userId, ctx.user.id),
            eq(patAttempts.sessionId, input.sessionId)
          )
        );
      const recorded = new Set(existingRows.map(row => row.questionId));
      const pending: Array<typeof patAttempts.$inferInsert> = [];
      const seen = new Set<string>();

      for (const item of decoded) {
        const questionId = item.claims.privateRecord.canonicalQuestionId;
        if (recorded.has(questionId) || seen.has(questionId)) continue;
        seen.add(questionId);
        pending.push({
          userId: ctx.user.id,
          category: item.claims.category,
          difficulty: item.claims.difficulty,
          questionId,
          userAnswer: item.userAnswer < 0 ? null : item.userAnswer,
          isCorrect: item.isCorrect,
          timeSpent: item.timeSpent,
          sessionId: input.sessionId,
        });
      }

      if (pending.length > 0) {
        await db.insert(patAttempts).values(pending);
      }

      return {
        sessionId: input.sessionId,
        results: decoded.map(item => ({
          instanceId: item.instanceId,
          category: item.claims.category,
          difficulty: item.claims.difficulty,
          difficultyBand: item.claims.privateRecord.difficultyBand,
          canonicalQuestionId:
            item.claims.privateRecord.canonicalQuestionId,
          userAnswer: item.userAnswer,
          isCorrect: item.isCorrect,
          correctChoiceIndex: item.claims.privateRecord.correctChoiceIndex,
          solution: item.claims.privateRecord.solution,
        })),
      };
    }),

  /**
   * Kept temporarily so old, unreferenced generator components still type-check
   * during the cutover. Production PAT flows must use createSession/submitSession.
   */
  recordAttempt: authedQuery
    .input(
      z.object({
        category: categoryEnum,
        difficulty: difficultyEnum,
        seed: z.number().int(),
        userAnswer: z.number().int().min(-1).max(4),
        timeSpent: z.number().int(),
        sessionId: z.string(),
      })
    )
    .mutation(async () => {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message:
          "Legacy PAT scoring is retired. Start a new ManipAT-backed PAT session.",
      });
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
