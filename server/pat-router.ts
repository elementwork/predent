import { z } from "zod";
import { and, eq, desc, lt, sql } from "drizzle-orm";
import { createRouter, authedQuery, premiumQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { patAttempts, users } from "@db/schema";
import { TRPCError } from "@trpc/server";
import {
  getCorrectAnswer,
  type PatCategory,
  type Difficulty,
} from "./lib/pat-generation";
import { computePredictedScore } from "./lib/score-prediction";
import {
  getPatAggregates,
  percentage,
} from "./repositories/analytics-repository";

const apiToGenDifficulty: Record<string, Difficulty> = {
  beginner: "easy",
  intermediate: "medium",
  advanced: "hard",
  elite: "hard",
};
import { getEffectiveTier, getTierQuota } from "@contracts/tiers";

const categoryEnum = z.enum([
  "keyholes",
  "tfe",
  "angle_ranking",
  "hole_punching",
  "cube_counting",
  "pattern_folding",
]);

const difficultyEnum = z.enum([
  "beginner",
  "intermediate",
  "advanced",
  "elite",
]);

export const patRouter = createRouter({
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
    .mutation(async ({ ctx, input }) => {
      // Generated question: re-derive answer from seed
      const genDifficulty = apiToGenDifficulty[input.difficulty] ?? "medium";
      const correctAnswer = getCorrectAnswer(input.category as PatCategory, {
        seed: input.seed,
        difficulty: genDifficulty,
      });

      const isCorrect = input.userAnswer === correctAnswer;

      const db = getDb();
      await db.transaction(async tx => {
        const [user] = await tx
          .select({
            tier: users.tier,
            premiumUntil: users.premiumUntil,
          })
          .from(users)
          .where(eq(users.id, ctx.user.id))
          .limit(1);
        if (!user) throw new TRPCError({ code: "NOT_FOUND" });

        const tier = getEffectiveTier(user.tier, user.premiumUntil);
        const quota = getTierQuota(tier);
        const [reservation] = await tx
          .update(users)
          .set({
            patQuestionsGenerated: sql`${users.patQuestionsGenerated} + 1`,
          })
          .where(
            and(
              eq(users.id, ctx.user.id),
              lt(users.patQuestionsGenerated, quota)
            )
          )
          .returning({ used: users.patQuestionsGenerated });

        if (!reservation) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "PAT question quota exhausted.",
          });
        }

        await tx.insert(patAttempts).values({
          userId: ctx.user.id,
          category: input.category,
          difficulty: input.difficulty,
          questionId: String(input.seed),
          userAnswer: input.userAnswer,
          isCorrect,
          timeSpent: input.timeSpent,
          sessionId: input.sessionId,
        });
      });

      return { success: true, isCorrect };
    }),

  getQuota: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const [user] = await db
      .select({
        tier: users.tier,
        premiumUntil: users.premiumUntil,
        patQuestionsGenerated: users.patQuestionsGenerated,
      })
      .from(users)
      .where(eq(users.id, ctx.user.id))
      .limit(1);

    if (!user) throw new TRPCError({ code: "NOT_FOUND" });

    const tier = getEffectiveTier(user.tier, user.premiumUntil);
    const quota = getTierQuota(tier);
    const used = user.patQuestionsGenerated ?? 0;
    const remaining = Math.max(0, quota - used);

    return { tier, quota, used, remaining };
  }),

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

    // Predicted PAT score using weighted algorithm (1-30)
    const { score: predictedScore, confidence: predictedConfidence } =
      computePredictedScore(attempts);

    const categoryStats = aggregates.categories.map(row => ({
      category: row.category,
      accuracy: percentage(row.correct, row.total),
      avgTime: row.avgTime,
      total: row.total,
    }));

    // Heatmap: accuracy by category x difficulty
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
      for (const d of difficulties) {
        const s = byDiff.get(d);
        row[d] = s ? percentage(s.correct, s.total) : 0;
      }
      return row;
    });

    // Trend: last 10 sessions (grouped by sessionId, chronological)
    const sessions: Record<string, { correct: number; total: number }> = {};
    // Keep sessions in reverse chronological order then slice/reverse
    const sessionOrder: string[] = [];
    attempts.forEach(a => {
      const sid = a.sessionId ?? "unknown";
      if (!sessions[sid]) {
        sessions[sid] = { correct: 0, total: 0 };
        sessionOrder.push(sid);
      }
      sessions[sid].total++;
      if (a.isCorrect) sessions[sid].correct++;
    });

    const trend = sessionOrder
      .slice(0, 10)
      .reverse()
      .map((sid, idx) => ({
        session: idx + 1,
        accuracy: Math.round(
          (sessions[sid].correct / sessions[sid].total) * 100
        ),
      }));

    // Recommendations
    const sortedByAccuracy = [...categoryStats].sort(
      (a, b) => a.accuracy - b.accuracy
    );
    const weaknesses = sortedByAccuracy.slice(0, 2).map(c => ({
      category: c.category,
      accuracy: c.accuracy,
      action:
        c.category === "pattern_folding"
          ? "Practice 20 min daily"
          : c.category === "tfe"
            ? "Use 3D model viewer"
            : "Focus on fundamentals",
    }));
    const strengths = [...categoryStats]
      .sort((a, b) => b.accuracy - a.accuracy)
      .slice(0, 2)
      .map(c => ({ category: c.category, accuracy: c.accuracy }));

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
