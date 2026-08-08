import { z } from "zod";
import { eq, and, gt, isNull, sql } from "drizzle-orm";
import { createRouter, premiumQuery, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { interviewQuestions } from "@db/schema";

const formatCategories: Record<string, string[]> = {
  MMI: [
    "Ethical Scenario",
    "Communication",
    "Problem Solving",
    "Collaboration",
    "Self-Reflection",
    "Critical Thinking",
  ],
  Panel: [
    "Motivation for Dentistry",
    "Knowledge of Profession",
    "Personal Strengths/Weaknesses",
    "Ethical Scenarios",
    "School-Specific",
    "Current Events",
  ],
};

export const interviewRouter = createRouter({
  getQuestions: premiumQuery
    .input(
      z
        .object({
          format: z.enum(["MMI", "Panel"]).optional(),
          category: z.string().optional(),
          limit: z.number().int().min(1).max(100).default(50),
          cursor: z.number().int().positive().optional(),
        })
        .default({ limit: 50 })
    )
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [isNull(interviewQuestions.deletedAt)];

      if (input.format) {
        conditions.push(eq(interviewQuestions.format, input.format));
      }
      if (input.category) {
        conditions.push(eq(interviewQuestions.category, input.category));
      }
      if (input.cursor)
        conditions.push(gt(interviewQuestions.id, input.cursor));

      const rows = await db
        .select()
        .from(interviewQuestions)
        .where(and(...conditions))
        .orderBy(interviewQuestions.id)
        .limit(input.limit);

      return rows;
    }),

  getCategories: publicQuery
    .input(z.object({ format: z.enum(["MMI", "Panel"]) }))
    .query(({ input }) => formatCategories[input.format]),

  getRandomSet: premiumQuery
    .input(
      z.object({
        format: z.enum(["MMI", "Panel"]),
        count: z.number().int().min(1).max(20).default(8),
      })
    )
    .query(async ({ input }) => {
      const db = getDb();
      return db
        .select()
        .from(interviewQuestions)
        .where(
          and(
            eq(interviewQuestions.format, input.format),
            isNull(interviewQuestions.deletedAt)
          )
        )
        .orderBy(sql`random()`)
        .limit(input.count);
    }),
});
