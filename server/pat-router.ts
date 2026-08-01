import { z } from "zod";
import { eq, desc, inArray, notInArray, and, sql, count, isNull } from "drizzle-orm";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { patAttempts, patQuestions, users } from "@db/schema";
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
  getQuestions: authedQuery
    .input(
      z.object({
        categories: z.array(categoryEnum).default([]),
        difficulties: z.array(difficultyEnum).default([]),
        count: z.number().int().min(1).max(90).default(10),
        excludeIds: z.array(z.string()).default([]),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();

      const conditions = [isNull(patQuestions.deletedAt)];
      if (input.categories.length > 0) {
        conditions.push(inArray(patQuestions.category, input.categories));
      }
      if (input.difficulties.length > 0) {
        conditions.push(inArray(patQuestions.difficulty, input.difficulties));
      }
      if (input.excludeIds.length > 0) {
        conditions.push(notInArray(patQuestions.publicId, input.excludeIds));
      }

      const rows = await db
        .select()
        .from(patQuestions)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(sql`RANDOM()`)
        .limit(input.count);

      // Return question WITHOUT correct answer — prevents cheating via network inspection
      return rows.map(q => ({
        id: q.publicId,
        dbId: q.id,
        category: q.category,
        difficulty: q.difficulty,
        prompt: q.questionData.prompt,
        diagram: q.questionData.diagram,
        options: q.questionData.options,
        concepts: q.concepts,
        timeTarget: q.timeTarget,
      }));
    }),

  getQuestionCount: publicQuery
    .input(z.object({ category: categoryEnum.optional() }).default({}))
    .query(async ({ input }) => {
      const db = getDb();

      if (input.category) {
        const [row] = await db
          .select({ total: count() })
          .from(patQuestions)
          .where(and(eq(patQuestions.category, input.category), isNull(patQuestions.deletedAt)));
        return { total: row?.total ?? 0 };
      }

      const rows = await db
        .select({ category: patQuestions.category, total: count() })
        .from(patQuestions)
        .where(isNull(patQuestions.deletedAt))
        .groupBy(patQuestions.category);

      return rows.reduce<Record<string, number>>((acc, r) => {
        acc[r.category] = r.total;
        return acc;
      }, {});
    }),

  verifyAnswer: authedQuery
    .input(
      z.object({
        questionId: z.string(),
        userAnswer: z.number().int().min(0).max(3),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const [question] = await db
        .select()
        .from(patQuestions)
        .where(and(eq(patQuestions.publicId, input.questionId), isNull(patQuestions.deletedAt)))
        .limit(1);

      if (!question) throw new TRPCError({ code: "NOT_FOUND" });

      return {
        isCorrect: question.correctAnswer === input.userAnswer,
        correctAnswer: question.correctAnswer,
        explanationL1: question.explanationL1,
        explanationL2: question.explanationL2,
        explanationL3: question.explanationL3,
      };
    }),

  recordAttempt: authedQuery
    .input(
      z.object({
        category: categoryEnum,
        difficulty: difficultyEnum,
        questionId: z.string().optional(),
        seed: z.number().int().optional(),
        userAnswer: z.number().int().min(-1).max(3),
        timeSpent: z.number().int(),
        sessionId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      let correctAnswer: number;
      let questionIdStr: string;

      if (input.seed !== undefined) {
        // Generated question: re-derive answer from seed
        const genDifficulty = apiToGenDifficulty[input.difficulty] ?? "medium";
        correctAnswer = getCorrectAnswer(
          input.category as PatCategory,
          { seed: input.seed, difficulty: genDifficulty }
        );
        questionIdStr = String(input.seed);
      } else if (input.questionId) {
        // DB question: look up answer
        const [q] = await db
          .select({ correctAnswer: patQuestions.correctAnswer })
          .from(patQuestions)
          .where(and(eq(patQuestions.publicId, input.questionId), isNull(patQuestions.deletedAt)))
          .limit(1);
        if (!q) throw new TRPCError({ code: "NOT_FOUND" });
        correctAnswer = q.correctAnswer;
        questionIdStr = input.questionId;
      } else {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Either seed or questionId is required" });
      }

      const isCorrect = input.userAnswer === correctAnswer;

      await db.insert(patAttempts).values({
        userId: ctx.user.id,
        category: input.category,
        difficulty: input.difficulty,
        questionId: questionIdStr,
        userAnswer: input.userAnswer,
        isCorrect,
        timeSpent: input.timeSpent,
        sessionId: input.sessionId,
      });

      // Increment quota counter only for generated questions
      if (input.seed !== undefined) {
        await db
          .update(users)
          .set({ patQuestionsGenerated: sql`${users.patQuestionsGenerated} + 1` })
          .where(eq(users.id, ctx.user.id));
      }

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
