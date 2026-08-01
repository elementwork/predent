import { z } from "zod";
import { eq, and, isNull } from "drizzle-orm";
import { createRouter, publicQuery } from "./middleware";
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
  getQuestions: publicQuery
    .input(
      z
        .object({
          format: z.enum(["MMI", "Panel"]).optional(),
          category: z.string().optional(),
        })
        .default({})
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

      const rows = await db
        .select()
        .from(interviewQuestions)
        .where(and(...conditions));

      return rows;
    }),

  getCategories: publicQuery
    .input(z.object({ format: z.enum(["MMI", "Panel"]) }))
    .query(({ input }) => formatCategories[input.format]),

  getRandomSet: publicQuery
    .input(
      z.object({
        format: z.enum(["MMI", "Panel"]),
        count: z.number().int().min(1).max(20).default(8),
      })
    )
    .query(async ({ input }) => {
      const db = getDb();
      const rows = await db
        .select()
        .from(interviewQuestions)
        .where(
          and(
            eq(interviewQuestions.format, input.format),
            isNull(interviewQuestions.deletedAt)
          )
        );

      const shuffled = [...rows].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, Math.min(input.count, shuffled.length));
    }),
});
