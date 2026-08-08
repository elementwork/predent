import { z } from "zod";
import { eq, and, notInArray, desc, isNull, count, inArray } from "drizzle-orm";
import { createRouter, premiumQuery, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { datQuestions, datAttempts } from "@db/schema";
import { computePredictedScore } from "./lib/score-prediction";
import { TRPCError } from "@trpc/server";
import { signExamSession, verifyExamSession } from "./lib/exam-session";
import {
  getDatAggregates,
  percentage,
} from "./repositories/analytics-repository";

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

  startExam: premiumQuery
    .input(
      z.object({
        sections: z
          .array(
            z.object({
              subject: subjectSchema,
              limit: z.number().int().min(1).max(50),
            })
          )
          .min(1)
          .max(3)
          .superRefine((sections, context) => {
            if (
              new Set(sections.map(section => section.subject)).size !==
              sections.length
            ) {
              context.addIssue({
                code: "custom",
                message: "Each exam section may only be requested once.",
              });
            }
            if (
              sections.reduce((total, section) => total + section.limit, 0) >
              100
            ) {
              context.addIssue({
                code: "custom",
                message: "An exam may contain at most 100 questions.",
              });
            }
          }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const rows = (
        await Promise.all(
          input.sections.map(section =>
            db
              .select()
              .from(datQuestions)
              .where(
                and(
                  eq(datQuestions.subject, section.subject),
                  isNull(datQuestions.deletedAt)
                )
              )
              .orderBy(datQuestions.id)
              .limit(section.limit)
          )
        )
      ).flat();

      if (rows.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No exam questions are available for the selected sections.",
        });
      }

      const questions = rows.map(q => ({
        id: q.id,
        publicId: q.publicId,
        subject: q.subject,
        topic: q.topic,
        difficulty: q.difficulty,
        questionText: q.questionText,
        options: q.options,
      }));

      return {
        questions,
        examToken: await signExamSession({
          userId: ctx.user.id,
          questionIds: questions.map(question => question.id),
        }),
      };
    }),

  submitExam: premiumQuery
    .input(
      z.object({
        examToken: z.string().min(1).max(16_000),
        answers: z
          .array(
            z.object({
              questionId: z.number().int().positive(),
              userAnswer: z.number().int().min(0).max(9),
            })
          )
          .max(100),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const session = await verifyExamSession(input.examToken, ctx.user.id);
      if (!session) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This exam session is invalid or has expired.",
        });
      }

      const answerIds = input.answers.map(answer => answer.questionId);
      if (new Set(answerIds).size !== answerIds.length) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Each exam question may only be answered once.",
        });
      }

      const allowedIds = new Set(session.questionIds);
      if (answerIds.some(id => !allowedIds.has(id))) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "An answer references a question outside this exam.",
        });
      }

      const db = getDb();
      const rows = await db
        .select()
        .from(datQuestions)
        .where(
          and(
            inArray(datQuestions.id, session.questionIds),
            isNull(datQuestions.deletedAt)
          )
        );

      if (rows.length !== session.questionIds.length) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "One or more exam questions are no longer available.",
        });
      }

      const questionById = new Map(
        rows.map(question => [question.id, question])
      );
      const answerById = new Map(
        input.answers.map(answer => [answer.questionId, answer.userAnswer])
      );

      return {
        results: session.questionIds.map(questionId => {
          const question = questionById.get(questionId)!;
          const userAnswer = answerById.get(questionId) ?? null;
          return {
            id: question.id,
            publicId: question.publicId,
            subject: question.subject,
            topic: question.topic,
            difficulty: question.difficulty,
            questionText: question.questionText,
            options: question.options,
            userAnswer,
            correctAnswer: question.correctAnswer,
            explanation: question.explanation,
            isCorrect: userAnswer === question.correctAnswer,
          };
        }),
      };
    }),

  listQuestions: premiumQuery
    .input(
      z.object({
        subject: subjectSchema,
        topic: z.string().optional(),
        difficulty: difficultySchema.optional(),
        limit: z.number().min(1).max(50).default(10),
        excludeIds: z.array(z.number().int().positive()).max(500).default([]),
      })
    )
    .query(async ({ input }) => {
      const db = getDb();
      const filters = [
        eq(datQuestions.subject, input.subject),
        isNull(datQuestions.deletedAt),
      ];
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

  recordAttempt: premiumQuery
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
        .where(
          and(
            eq(datQuestions.id, input.questionId),
            isNull(datQuestions.deletedAt)
          )
        )
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

  stats: premiumQuery.query(async ({ ctx }) => {
    const user = ctx.user;
    if (!user) throw new TRPCError({ code: "UNAUTHORIZED" });

    const aggregates = await getDatAggregates(user.id);
    const bySubject = Object.fromEntries(
      aggregates.subjects.map(row => [
        row.subject,
        { total: row.total, correct: row.correct },
      ])
    );

    return {
      total: aggregates.overall.total,
      correct: aggregates.overall.correct,
      accuracy: percentage(
        aggregates.overall.correct,
        aggregates.overall.total
      ),
      bySubject,
    };
  }),

  getAnalytics: premiumQuery.query(async ({ ctx }) => {
    const db = getDb();
    const user = ctx.user;
    if (!user) throw new TRPCError({ code: "UNAUTHORIZED" });

    const [attemptsWithDetails, aggregates] = await Promise.all([
      db
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
        .where(
          and(eq(datAttempts.userId, user.id), isNull(datQuestions.deletedAt))
        )
        .orderBy(desc(datAttempts.createdAt))
        .limit(1000),
      getDatAggregates(user.id),
    ]);

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

    const overallAccuracy = percentage(
      aggregates.overall.correct,
      aggregates.overall.total
    );
    const avgTime = aggregates.overall.avgTime;

    // Predicted DAT score using weighted algorithm (1-30 scale)
    const { score: predictedScore, confidence: predictedConfidence } =
      computePredictedScore(attemptsWithDetails);

    const subjectStats = aggregates.subjects.map(row => ({
      subject: row.subject,
      accuracy: percentage(row.correct, row.total),
      avgTime: row.avgTime,
      total: row.total,
    }));

    // Heatmap: accuracy by subject x difficulty
    const difficulties: Array<
      "beginner" | "intermediate" | "advanced" | "elite"
    > = ["beginner", "intermediate", "advanced", "elite"];

    const heatmapMap = new Map<
      string,
      Map<string, { correct: number; total: number }>
    >();
    for (const item of aggregates.heatmap) {
      const values = heatmapMap.get(item.subject) ?? new Map();
      values.set(item.difficulty, item);
      heatmapMap.set(item.subject, values);
    }
    const heatmap = [...heatmapMap].map(([subj, byDiff]) => {
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
        const s = byDiff.get(d);
        row[d] = s ? percentage(s.correct, s.total) : 0;
      }
      return row;
    });

    // Trend: last 10 sessions (grouped by day)
    const dailySessions: Record<string, { correct: number; total: number }> =
      {};
    const sessionOrder: string[] = [];
    attemptsWithDetails.forEach(a => {
      const day = a.createdAt
        ? new Date(a.createdAt).toISOString().split("T")[0]
        : "unknown";
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
      totalAttempts: aggregates.overall.total,
      subjectStats,
      trend,
      heatmap,
      strengths,
      weaknesses,
    };
  }),
});
