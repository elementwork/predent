import { z } from "zod";
import { eq, desc, sql } from "drizzle-orm";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { patAttempts, users } from "@db/schema";
import { TRPCError } from "@trpc/server";
import { getCorrectAnswer, type PatCategory, type Difficulty } from "./lib/pat-generation";
import { computePredictedScore } from "./lib/score-prediction";

const apiToGenDifficulty: Record<string, Difficulty> = {
  beginner: "easy",
  intermediate: "medium",
  advanced: "hard",
  elite: "hard",
};
import { getTierQuota } from "@contracts/tiers";

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
        userAnswer: z.number().int().min(-1).max(3),
        timeSpent: z.number().int(),
        sessionId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      // Generated question: re-derive answer from seed
      const genDifficulty = apiToGenDifficulty[input.difficulty] ?? "medium";
      const correctAnswer = getCorrectAnswer(
        input.category as PatCategory,
        { seed: input.seed, difficulty: genDifficulty }
      );

      const isCorrect = input.userAnswer === correctAnswer;

      await db.insert(patAttempts).values({
        userId: ctx.user.id,
        category: input.category,
        difficulty: input.difficulty,
        questionId: String(input.seed),
        userAnswer: input.userAnswer,
        isCorrect,
        timeSpent: input.timeSpent,
        sessionId: input.sessionId,
      });

      await db
        .update(users)
        .set({ patQuestionsGenerated: sql`${users.patQuestionsGenerated} + 1` })
        .where(eq(users.id, ctx.user.id));

      return { success: true, isCorrect };
    }),

  getQuota: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const [user] = await db
      .select({ tier: users.tier, patQuestionsGenerated: users.patQuestionsGenerated })
      .from(users)
      .where(eq(users.id, ctx.user.id))
      .limit(1);

    if (!user) throw new TRPCError({ code: "NOT_FOUND" });

    const quota = getTierQuota(user.tier as "free" | "premium" | "premium_plus");
    const used = user.patQuestionsGenerated ?? 0;
    const remaining = Math.max(0, quota - used);

    return { tier: user.tier, quota, used, remaining };
  }),

  getStats: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const attempts = await db.query.patAttempts.findMany({
      where: eq(patAttempts.userId, ctx.user.id),
      orderBy: [desc(patAttempts.createdAt)],
      limit: 1000,
    });

    // Aggregate by category
    const byCategory: Record<
      string,
      { correct: number; total: number; totalTime: number }
    > = {};
    attempts.forEach(a => {
      if (!byCategory[a.category])
        byCategory[a.category] = { correct: 0, total: 0, totalTime: 0 };
      byCategory[a.category].total++;
      if (a.isCorrect) byCategory[a.category].correct++;
      byCategory[a.category].totalTime += a.timeSpent ?? 0;
    });

    const categoryStats = Object.entries(byCategory).map(([cat, stats]) => ({
      category: cat,
      accuracy: Math.round((stats.correct / stats.total) * 100),
      avgTime: Math.round(stats.totalTime / stats.total),
      total: stats.total,
    }));

    const totalCorrect = attempts.filter(a => a.isCorrect).length;
    const overallAccuracy =
      attempts.length > 0
        ? Math.round((totalCorrect / attempts.length) * 100)
        : 0;

    return {
      overallAccuracy,
      totalAttempts: attempts.length,
      categoryStats,
      recentAttempts: attempts.slice(0, 50),
    };
  }),

  getPredictedScore: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const attempts = await db.query.patAttempts.findMany({
      where: eq(patAttempts.userId, ctx.user.id),
    });

    if (attempts.length === 0) return { score: null, confidence: 0 };

    const { score, confidence } = computePredictedScore(attempts);

    return { score, confidence };
  }),

  getAnalytics: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const attempts = await db.query.patAttempts.findMany({
      where: eq(patAttempts.userId, ctx.user.id),
      orderBy: [desc(patAttempts.createdAt)],
      limit: 1000,
    });

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

    const totalCorrect = attempts.filter(a => a.isCorrect).length;
    const overallAccuracy = Math.round((totalCorrect / attempts.length) * 100);
    const avgTime = Math.round(
      attempts.reduce((s, a) => s + (a.timeSpent ?? 0), 0) / attempts.length
    );

    // Predicted PAT score using weighted algorithm (1-30)
    const { score: predictedScore, confidence: predictedConfidence } =
      computePredictedScore(attempts);

    // Category stats
    const categoryMap: Record<
      string,
      { correct: number; total: number; totalTime: number }
    > = {};
    const heatmapMap: Record<
      string,
      Record<string, { correct: number; total: number }>
    > = {};

    attempts.forEach(a => {
      if (!categoryMap[a.category]) {
        categoryMap[a.category] = { correct: 0, total: 0, totalTime: 0 };
      }
      categoryMap[a.category].total++;
      if (a.isCorrect) categoryMap[a.category].correct++;
      categoryMap[a.category].totalTime += a.timeSpent ?? 0;

      if (!heatmapMap[a.category]) heatmapMap[a.category] = {};
      const diff = a.difficulty;
      if (!heatmapMap[a.category][diff]) {
        heatmapMap[a.category][diff] = { correct: 0, total: 0 };
      }
      heatmapMap[a.category][diff].total++;
      if (a.isCorrect) heatmapMap[a.category][diff].correct++;
    });

    const categoryStats = Object.entries(categoryMap).map(([cat, stats]) => ({
      category: cat,
      accuracy: Math.round((stats.correct / stats.total) * 100),
      avgTime: Math.round(stats.totalTime / stats.total),
      total: stats.total,
    }));

    // Heatmap: accuracy by category x difficulty
    const difficulties: Array<
      "beginner" | "intermediate" | "advanced" | "elite"
    > = ["beginner", "intermediate", "advanced", "elite"];
    const heatmap = Object.entries(heatmapMap).map(([cat, byDiff]) => {
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
        const s = byDiff[d];
        row[d] = s ? Math.round((s.correct / s.total) * 100) : 0;
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
      totalAttempts: attempts.length,
      categoryStats,
      trend,
      heatmap,
      strengths,
      weaknesses,
    };
  }),
});
