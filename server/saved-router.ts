import { z } from "zod";
import { eq, and, desc, sql } from "drizzle-orm";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { savedQuestions, datQuestions } from "@db/schema";

const sourceEnum = z.enum(["pat", "dat"]);

export const savedRouter = createRouter({
  list: authedQuery
    .input(
      z.object({
        source: sourceEnum.optional(),
      }).default({})
    )
    .query(async ({ ctx, input }) => {
      const db = getDb();

      const conditions = [eq(savedQuestions.userId, ctx.user.id)];
      if (input.source) {
        conditions.push(eq(savedQuestions.source, input.source));
      }

      const rows = await db
        .select({
          id: savedQuestions.id,
          source: savedQuestions.source,
          questionId: savedQuestions.questionId,
          note: savedQuestions.note,
          createdAt: savedQuestions.createdAt,
          datSubject: datQuestions.subject,
          datTopic: datQuestions.topic,
          datDifficulty: datQuestions.difficulty,
          datQuestionText: datQuestions.questionText,
          datOptions: datQuestions.options,
        })
        .from(savedQuestions)
        .leftJoin(datQuestions, and(
          eq(savedQuestions.source, "dat"),
          eq(savedQuestions.questionId, datQuestions.id)
        ))
        .where(and(...conditions))
        .orderBy(desc(savedQuestions.createdAt));

      return rows.map(row => {
        if (row.source === "pat") {
          return {
            id: row.id,
            source: "pat" as const,
            questionId: row.questionId,
            note: row.note,
            createdAt: row.createdAt,
          };
        }
        return {
          id: row.id,
          source: "dat" as const,
          questionId: row.questionId,
          note: row.note,
          createdAt: row.createdAt,
          subject: row.datSubject,
          topic: row.datTopic,
          difficulty: row.datDifficulty,
          questionText: row.datQuestionText,
          options: row.datOptions,
        };
      });
    }),

  toggle: authedQuery
    .input(
      z.object({
        source: sourceEnum,
        questionId: z.number().int().positive(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      const [existing] = await db
        .select()
        .from(savedQuestions)
        .where(
          and(
            eq(savedQuestions.userId, ctx.user.id),
            eq(savedQuestions.source, input.source),
            eq(savedQuestions.questionId, input.questionId)
          )
        )
        .limit(1);

      if (existing) {
        await db
          .delete(savedQuestions)
          .where(eq(savedQuestions.id, existing.id));
        return { saved: false };
      }

      await db.insert(savedQuestions).values({
        userId: ctx.user.id,
        source: input.source,
        questionId: input.questionId,
      });
      return { saved: true };
    }),

  isSaved: authedQuery
    .input(
      z.object({
        source: sourceEnum,
        questionId: z.number().int().positive(),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = getDb();

      const [existing] = await db
        .select()
        .from(savedQuestions)
        .where(
          and(
            eq(savedQuestions.userId, ctx.user.id),
            eq(savedQuestions.source, input.source),
            eq(savedQuestions.questionId, input.questionId)
          )
        )
        .limit(1);

      return { saved: !!existing };
    }),

  count: authedQuery.query(async ({ ctx }) => {
    const db = getDb();

    const rows = await db
      .select({
        source: savedQuestions.source,
        total: sql<number>`count(*)::int`,
      })
      .from(savedQuestions)
      .where(eq(savedQuestions.userId, ctx.user.id))
      .groupBy(savedQuestions.source);

    const counts: Record<string, number> = {};
    for (const row of rows) {
      counts[row.source] = row.total;
    }

    return { counts, total: Object.values(counts).reduce((s, n) => s + n, 0) };
  }),
});
