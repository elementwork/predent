import { z } from "zod";
import { eq, and, notInArray, desc, isNull, count } from "drizzle-orm";
import { createRouter, authedQuery, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { datQuestions, datAttempts } from "@db/schema";
import { computePredictedScore } from "./lib/score-prediction";
import { TRPCError } from "@trpc/server";

const subjectSchema = z.enum(["biology", "chemistry", "reading"]);
const difficultySchema = z.enum([
  "beginner",
  "intermediate",
  "advanced",
  "elite",
]);

export const datRouter = createRouter({
  questionCount: publicQuery.query(async () => {
    const db = getDb();
    const rows = await db
      .select({ subject: datQuestions.subject, total: count() })
      .from(datQuestions)
      .where(isNull(datQuestions.deletedAt))
      .groupBy(datQuestions.subject);
    const bySubject: Record<string, number> = {};
    let total = 0;
    for (const row of rows) {
      bySubject[row.subject] = row.total;
      total += row.total;
    }
    return { total, bySubject };
  }),

  getExamQuestions: publicQuery
    .input(
      z.object({
        subject: subjectSchema,
        limit: z.number().min(1).max(50).default(40),
      })
    )
    .query(async ({ input }) => {
      const db = getDb();
      const rows = await db
        .select()
        .from(datQuestions)
        .where(and(eq(datQuestions.subject, input.subject), isNull(datQuestions.deletedAt)))
        .orderBy(datQuestions.id)
        .limit(input.limit);

      return rows.map(q => ({
        id: q.id,
        publicId: q.publicId,
        subject: q.subject,
        topic: q.topic,
        difficulty: q.difficulty,
        questionText: q.questionText,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
      }));
    }),

  listQuestions: authedQuery
    .input(
      z.object({
        subject: subjectSchema,
        topic: z.string().optional(),
        difficulty: difficultySchema.optional(),
        limit: z.number().min(1).max(50).default(10),
        excludeIds: z.array(z.number()).default([]),
      })
    )
    .query(async ({ input }) => {
      const db = getDb();
      const filters = [eq(datQuestions.subject, input.subject), isNull(datQuestions.deletedAt)];
      if (input.topic) filters.push(eq(datQuestions.topic, input.topic));
      if (input.difficulty)
        filters.push(eq(datQuestions.difficulty, input.difficulty));
      if (input.excludeIds.length > 0)
        filters.push(notInArray(datQuestions.id, input.excludeIds));

      const rows = await db
        .select()
        .from(datQuestions)
        .where(and(...filters))
        .orderBy(datQuestions.id)
        .limit(input.limit);

      return rows.map(q => ({
        id: q.id,
        publicId: q.publicId,
        subject: q.subject,
        topic: q.topic,
        difficulty: q.difficulty,
        questionText: q.questionText,
        options: q.options,
      }));
    }),

  recordAttempt: authedQuery
    .input(
      z.object({
        questionId: z.number(),
        userAnswer: z.number().int().min(0),
        timeSpent: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const user = ctx.user;
      if (!user) throw new TRPCError({ code: "UNAUTHORIZED" });

      const [question] = await db
        .select()
        .from(datQuestions)
        .where(and(eq(datQuestions.id, input.questionId), isNull(datQuestions.deletedAt)))
        .limit(1);
      if (!question) throw new TRPCError({ code: "NOT_FOUND" });

      const isCorrect = input.userAnswer === question.correctAnswer;

      await db.insert(datAttempts).values({
        userId: user.id,
        questionId: input.questionId,
        isCorrect,
        timeSpent: input.timeSpent,
      });

      return {
        success: true,
        isCorrect,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
      };
    }),

  stats: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const user = ctx.user;
    if (!user) throw new TRPCError({ code: "UNAUTHORIZED" });

    // Join with questions to get subject, limit to recent 500
    const attemptsWithSubject = await db
      .select({
        questionId: datAttempts.questionId,
        isCorrect: datAttempts.isCorrect,
        subject: datQuestions.subject,
      })
      .from(datAttempts)
      .innerJoin(datQuestions, eq(datAttempts.questionId, datQuestions.id))
      .where(and(eq(datAttempts.userId, user.id), isNull(datQuestions.deletedAt)))
      .orderBy(desc(datAttempts.createdAt))
      .limit(500);

    const bySubject: Record<string, { total: number; correct: number }> = {};

    for (const a of attemptsWithSubject) {
      if (!bySubject[a.subject]) bySubject[a.subject] = { total: 0, correct: 0 };
      bySubject[a.subject].total++;
      if (a.isCorrect) bySubject[a.subject].correct++;
    }

    const total = attemptsWithSubject.length;
    const correct = attemptsWithSubject.filter(a => a.isCorrect).length;

    return {
      total,
      correct,
      accuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
      bySubject,
    };
  }),

  getAnalytics: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const user = ctx.user;
    if (!user) throw new TRPCError({ code: "UNAUTHORIZED" });

    const attemptsWithDetails = await db
      .select({
        questionId: datAttempts.questionId,
        isCorrect: datAttempts.isCorrect,
        timeSpent: datAttempts.timeSpent,
        createdAt: datAttempts.createdAt,
        subject: datQuestions.subject,
        difficulty: datQuestions.difficulty,
      })
      .from(datAttempts)
      .innerJoin(datQuestions, eq(datAttempts.questionId, datQuestions.id))
      .where(and(eq(datAttempts.userId, user.id), isNull(datQuestions.deletedAt)))
      .orderBy(desc(datAttempts.createdAt))
      .limit(1000);

    if (attemptsWithDetails.length === 0) {
      return {
        overallAccuracy: 0,
        avgTime: 0,
        predictedScore: null,
        predictedConfidence: 0,
        totalAttempts: 0,
        subjectStats: [],
        trend: [],
        heatmap: [],
        strengths: [],
        weaknesses: [],
      };
    }

    const totalCorrect = attemptsWithDetails.filter(a => a.isCorrect).length;
    const overallAccuracy = Math.round(
      (totalCorrect / attemptsWithDetails.length) * 100
    );
    const avgTime = Math.round(
      attemptsWithDetails.reduce((s, a) => s + (a.timeSpent ?? 0), 0) /
        attemptsWithDetails.length
    );

    // Predicted DAT score using weighted algorithm (1-30 scale)
    const { score: predictedScore, confidence: predictedConfidence } =
      computePredictedScore(attemptsWithDetails);

    // Subject stats
    const subjectMap: Record<
      string,
      { correct: number; total: number; totalTime: number }
    > = {};
    const heatmapMap: Record<
      string,
      Record<string, { correct: number; total: number }>
    > = {};

    attemptsWithDetails.forEach(a => {
      if (!subjectMap[a.subject]) {
        subjectMap[a.subject] = { correct: 0, total: 0, totalTime: 0 };
      }
      subjectMap[a.subject].total++;
      if (a.isCorrect) subjectMap[a.subject].correct++;
      subjectMap[a.subject].totalTime += a.timeSpent ?? 0;

      if (!heatmapMap[a.subject]) heatmapMap[a.subject] = {};
      const diff = a.difficulty;
      if (!heatmapMap[a.subject][diff]) {
        heatmapMap[a.subject][diff] = { correct: 0, total: 0 };
      }
      heatmapMap[a.subject][diff].total++;
      if (a.isCorrect) heatmapMap[a.subject][diff].correct++;
    });

    const subjectStats = Object.entries(subjectMap).map(([subj, stats]) => ({
      subject: subj,
      accuracy: Math.round((stats.correct / stats.total) * 100),
      avgTime: Math.round(stats.totalTime / stats.total),
      total: stats.total,
    }));

    // Heatmap: accuracy by subject x difficulty
    const difficulties: Array<
      "beginner" | "intermediate" | "advanced" | "elite"
    > = ["beginner", "intermediate", "advanced", "elite"];

    const heatmap = Object.entries(heatmapMap).map(([subj, byDiff]) => {
      const row: {
        subject: string;
        beginner: number;
        intermediate: number;
        advanced: number;
        elite: number;
      } = {
        subject: subj,
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

    // Trend: last 10 sessions (grouped by day)
    const dailySessions: Record<string, { correct: number; total: number }> = {};
    const sessionOrder: string[] = [];
    attemptsWithDetails.forEach(a => {
      const day = a.createdAt ? new Date(a.createdAt).toISOString().split("T")[0] : "unknown";
      if (!dailySessions[day]) {
        dailySessions[day] = { correct: 0, total: 0 };
        sessionOrder.push(day);
      }
      dailySessions[day].total++;
      if (a.isCorrect) dailySessions[day].correct++;
    });

    const trend = sessionOrder
      .slice(0, 10)
      .reverse()
      .map((day, idx) => ({
        session: idx + 1,
        accuracy: Math.round(
          (dailySessions[day].correct / dailySessions[day].total) * 100
        ),
      }));

    // Recommendations
    const sortedByAccuracy = [...subjectStats].sort(
      (a, b) => a.accuracy - b.accuracy
    );
    const weaknesses = sortedByAccuracy.slice(0, 2).map(c => ({
      subject: c.subject,
      accuracy: c.accuracy,
      action:
        c.subject === "biology"
          ? "Review cell biology fundamentals"
          : c.subject === "chemistry"
            ? "Practice stoichiometry problems"
            : "Focus on active reading strategies",
    }));
    const strengths = [...subjectStats]
      .sort((a, b) => b.accuracy - a.accuracy)
      .slice(0, 2)
      .map(c => ({ subject: c.subject, accuracy: c.accuracy }));

    return {
      overallAccuracy,
      avgTime,
      predictedScore,
      predictedConfidence,
      totalAttempts: attemptsWithDetails.length,
      subjectStats,
      trend,
      heatmap,
      strengths,
      weaknesses,
    };
  }),
});
