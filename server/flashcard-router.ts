import { z } from "zod";
import { eq, and, desc, sql, isNull, lte, count } from "drizzle-orm";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { flashcardReviews, patQuestions, datQuestions } from "@db/schema";

function applySM2(
  quality: number,
  currentEaseFactor: number,
  currentInterval: number,
  currentRepetitions: number
) {
  let easeFactor = currentEaseFactor;
  let interval = currentInterval;
  let repetitions = currentRepetitions;

  if (quality >= 3) {
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions++;
  } else {
    repetitions = 0;
    interval = 1;
  }

  easeFactor =
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (easeFactor < 1.3) easeFactor = 1.3;

  const now = new Date();
  const nextReview = new Date(now);
  nextReview.setDate(nextReview.getDate() + interval);

  return { easeFactor, interval, repetitions, nextReview, lastReview: now };
}

export const flashcardRouter = createRouter({
  getDueCards: authedQuery
    .input(
      z
        .object({
          source: z.enum(["pat", "dat"]).optional(),
          limit: z.number().int().min(1).max(100).default(20),
        })
        .default({ limit: 20 })
    )
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const now = new Date();
      const userId = ctx.user.id;

      const sources = input.source ? [input.source] : (["pat", "dat"] as const);

      const results: Array<{
        source: "pat" | "dat";
        questionId: number;
        questionData: unknown;
        review: {
          id: number;
          easeFactor: number;
          interval: number;
          repetitions: number;
          nextReview: Date;
          lastReview: Date;
        } | null;
        isNew: boolean;
      }> = [];

      for (const source of sources) {
        if (source === "pat") {
          const reviewed = await db
            .select({
              reviewId: flashcardReviews.id,
              easeFactor: flashcardReviews.easeFactor,
              interval: flashcardReviews.interval,
              repetitions: flashcardReviews.repetitions,
              nextReview: flashcardReviews.nextReview,
              lastReview: flashcardReviews.lastReview,
              questionId: flashcardReviews.questionId,
              questionData: patQuestions.questionData,
              category: patQuestions.category,
              difficulty: patQuestions.difficulty,
              explanationL1: patQuestions.explanationL1,
            })
            .from(flashcardReviews)
            .innerJoin(
              patQuestions,
              eq(flashcardReviews.questionId, patQuestions.id)
            )
            .where(
              and(
                eq(flashcardReviews.userId, userId),
                eq(flashcardReviews.source, "pat"),
                isNull(patQuestions.deletedAt),
                lte(flashcardReviews.nextReview, now)
              )
            )
            .orderBy(flashcardReviews.nextReview)
            .limit(input.limit);

          for (const r of reviewed) {
            results.push({
              source: "pat",
              questionId: r.questionId,
              questionData: r.questionData,
              review: {
                id: r.reviewId,
                easeFactor: r.easeFactor,
                interval: r.interval,
                repetitions: r.repetitions,
                nextReview: r.nextReview,
                lastReview: r.lastReview,
              },
              isNew: false,
            });
          }

          const newCards = await db
            .select({
              id: patQuestions.id,
              questionData: patQuestions.questionData,
              category: patQuestions.category,
              difficulty: patQuestions.difficulty,
              explanationL1: patQuestions.explanationL1,
            })
            .from(patQuestions)
            .where(
              and(
                isNull(patQuestions.deletedAt),
                sql`NOT EXISTS (
                  SELECT 1 FROM ${flashcardReviews}
                  WHERE ${flashcardReviews.userId} = ${userId}
                    AND ${flashcardReviews.source} = 'pat'
                    AND ${flashcardReviews.questionId} = ${patQuestions.id}
                )`
              )
            )
            .limit(input.limit);

          for (const q of newCards) {
            results.push({
              source: "pat",
              questionId: q.id,
              questionData: q.questionData,
              review: null,
              isNew: true,
            });
          }
        } else {
          const reviewed = await db
            .select({
              reviewId: flashcardReviews.id,
              easeFactor: flashcardReviews.easeFactor,
              interval: flashcardReviews.interval,
              repetitions: flashcardReviews.repetitions,
              nextReview: flashcardReviews.nextReview,
              lastReview: flashcardReviews.lastReview,
              questionId: flashcardReviews.questionId,
              questionText: datQuestions.questionText,
              options: datQuestions.options,
              subject: datQuestions.subject,
              topic: datQuestions.topic,
              explanation: datQuestions.explanation,
            })
            .from(flashcardReviews)
            .innerJoin(
              datQuestions,
              eq(flashcardReviews.questionId, datQuestions.id)
            )
            .where(
              and(
                eq(flashcardReviews.userId, userId),
                eq(flashcardReviews.source, "dat"),
                isNull(datQuestions.deletedAt),
                lte(flashcardReviews.nextReview, now)
              )
            )
            .orderBy(flashcardReviews.nextReview)
            .limit(input.limit);

          for (const r of reviewed) {
            results.push({
              source: "dat",
              questionId: r.questionId,
              questionData: {
                questionText: r.questionText,
                options: r.options,
                subject: r.subject,
                topic: r.topic,
                explanation: r.explanation,
              },
              review: {
                id: r.reviewId,
                easeFactor: r.easeFactor,
                interval: r.interval,
                repetitions: r.repetitions,
                nextReview: r.nextReview,
                lastReview: r.lastReview,
              },
              isNew: false,
            });
          }

          const newCards = await db
            .select({
              id: datQuestions.id,
              questionText: datQuestions.questionText,
              options: datQuestions.options,
              subject: datQuestions.subject,
              topic: datQuestions.topic,
              explanation: datQuestions.explanation,
            })
            .from(datQuestions)
            .where(
              and(
                isNull(datQuestions.deletedAt),
                sql`NOT EXISTS (
                  SELECT 1 FROM ${flashcardReviews}
                  WHERE ${flashcardReviews.userId} = ${userId}
                    AND ${flashcardReviews.source} = 'dat'
                    AND ${flashcardReviews.questionId} = ${datQuestions.id}
                )`
              )
            )
            .limit(input.limit);

          for (const q of newCards) {
            results.push({
              source: "dat",
              questionId: q.id,
              questionData: {
                questionText: q.questionText,
                options: q.options,
                subject: q.subject,
                topic: q.topic,
                explanation: q.explanation,
              },
              review: null,
              isNew: true,
            });
          }
        }
      }

      results.sort((a, b) => {
        if (a.isNew && !b.isNew) return 1;
        if (!a.isNew && b.isNew) return -1;
        if (a.review && b.review) {
          return (
            new Date(a.review.nextReview).getTime() -
            new Date(b.review.nextReview).getTime()
          );
        }
        return 0;
      });

      return results.slice(0, input.limit);
    }),

  recordReview: authedQuery
    .input(
      z.object({
        source: z.enum(["pat", "dat"]),
        questionId: z.number().int().positive(),
        quality: z.number().int().min(0).max(5),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user.id;

      const questionTable =
        input.source === "pat" ? patQuestions : datQuestions;
      const [question] = await db
        .select({ id: questionTable.id })
        .from(questionTable)
        .where(
          and(
            eq(questionTable.id, input.questionId),
            isNull(questionTable.deletedAt)
          )
        )
        .limit(1);

      if (!question) {
        throw new Error("Question not found");
      }

      const [existing] = await db
        .select()
        .from(flashcardReviews)
        .where(
          and(
            eq(flashcardReviews.userId, userId),
            eq(flashcardReviews.source, input.source),
            eq(flashcardReviews.questionId, input.questionId)
          )
        )
        .limit(1);

      const sm2 = applySM2(
        input.quality,
        existing?.easeFactor ?? 2.5,
        existing?.interval ?? 0,
        existing?.repetitions ?? 0
      );

      if (existing) {
        await db
          .update(flashcardReviews)
          .set({
            easeFactor: sm2.easeFactor,
            interval: sm2.interval,
            repetitions: sm2.repetitions,
            nextReview: sm2.nextReview,
            lastReview: sm2.lastReview,
          })
          .where(eq(flashcardReviews.id, existing.id));
      } else {
        await db.insert(flashcardReviews).values({
          userId,
          source: input.source,
          questionId: input.questionId,
          easeFactor: sm2.easeFactor,
          interval: sm2.interval,
          repetitions: sm2.repetitions,
          nextReview: sm2.nextReview,
          lastReview: sm2.lastReview,
        });
      }

      return {
        easeFactor: sm2.easeFactor,
        interval: sm2.interval,
        repetitions: sm2.repetitions,
        nextReview: sm2.nextReview,
      };
    }),

  getStats: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const userId = ctx.user.id;
    const now = new Date();

    const [totalResult] = await db
      .select({ total: count() })
      .from(flashcardReviews)
      .where(eq(flashcardReviews.userId, userId));

    const totalReviewed = totalResult?.total ?? 0;

    const [dueResult] = await db
      .select({ total: count() })
      .from(flashcardReviews)
      .where(
        and(
          eq(flashcardReviews.userId, userId),
          lte(flashcardReviews.nextReview, now)
        )
      );

    const cardsDueToday = dueResult?.total ?? 0;

    const allReviews = await db
      .select({
        easeFactor: flashcardReviews.easeFactor,
        interval: flashcardReviews.interval,
        repetitions: flashcardReviews.repetitions,
      })
      .from(flashcardReviews)
      .where(eq(flashcardReviews.userId, userId));

    let newCount = 0;
    let learningCount = 0;
    let reviewCount = 0;
    let masteredCount = 0;

    for (const r of allReviews) {
      if (r.repetitions === 0) {
        newCount++;
      } else if (r.interval < 21) {
        learningCount++;
      } else if (r.interval < 60) {
        reviewCount++;
      } else {
        masteredCount++;
      }
    }

    return {
      totalReviewed,
      cardsDueToday,
      mastery: {
        new: newCount,
        learning: learningCount,
        review: reviewCount,
        mastered: masteredCount,
      },
    };
  }),

  getReviewHistory: authedQuery
    .input(
      z
        .object({ limit: z.number().int().min(1).max(100).default(20) })
        .default({ limit: 20 })
    )
    .query(async ({ ctx, input }) => {
      const db = getDb();

      const history = await db
        .select()
        .from(flashcardReviews)
        .where(eq(flashcardReviews.userId, ctx.user.id))
        .orderBy(desc(flashcardReviews.lastReview))
        .limit(input.limit);

      return history;
    }),
});
