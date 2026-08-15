import { z } from "zod";
import { and, eq, desc, count, isNull, lt, or } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { createRouter, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { env } from "./lib/env";
import { PAT_TOTAL_QUESTION_COUNT } from "@contracts/pat-stats";
import {
  users,
  patAttempts,
  datQuestions,
  datAttempts,
  adminActions,
} from "@db/schema";
import { reconcileStripeEntitlements } from "./services/stripe-reconciliation-service";
import { cursorSchema, nextCursor } from "@contracts/pagination";

export const adminRouter = createRouter({
  stats: adminQuery.query(async () => {
    const db = getDb();

    const [userRows, patAttemptRows, datQuestionRows, datAttemptRows] =
      await Promise.all([
        db.select({ total: count() }).from(users),
        db.select({ total: count() }).from(patAttempts),
        db
          .select({ total: count() })
          .from(datQuestions)
          .where(isNull(datQuestions.deletedAt)),
        db.select({ total: count() }).from(datAttempts),
      ]);

    return {
      users: userRows[0]?.total ?? 0,
      patQuestions: PAT_TOTAL_QUESTION_COUNT,
      patAttempts: patAttemptRows[0]?.total ?? 0,
      datQuestions: datQuestionRows[0]?.total ?? 0,
      datAttempts: datAttemptRows[0]?.total ?? 0,
    };
  }),

  listUsersPage: adminQuery
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        cursor: cursorSchema,
      })
    )
    .query(async ({ input }) => {
      const db = getDb();
      const cursorCondition = input.cursor
        ? or(
            lt(users.createdAt, new Date(input.cursor.createdAt)),
            and(
              eq(users.createdAt, new Date(input.cursor.createdAt)),
              lt(users.id, input.cursor.id)
            )
          )
        : undefined;
      const rows = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
          tier: users.tier,
          createdAt: users.createdAt,
          lastSignInAt: users.lastSignInAt,
        })
        .from(users)
        .where(cursorCondition)
        .orderBy(desc(users.createdAt), desc(users.id))
        .limit(input.limit + 1);
      return {
        items: rows.slice(0, input.limit),
        nextCursor: nextCursor(rows, input.limit),
      };
    }),

  updateUserRole: adminQuery
    .input(
      z.object({
        userId: z.number(),
        role: z.enum(["user", "admin"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      if (input.userId === ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot change your own role.",
        });
      }

      const [target] = await db
        .select({ provider: users.provider, unionId: users.unionId })
        .from(users)
        .where(eq(users.id, input.userId))
        .limit(1);

      if (!target) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found." });
      }

      if (target.provider === "google" && target.unionId === env.ownerUnionId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot change the owner's role.",
        });
      }

      if (input.role === "user") {
        const [{ total }] = await db
          .select({ total: count() })
          .from(users)
          .where(eq(users.role, "admin"));
        if (total <= 1) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Cannot demote the last admin.",
          });
        }
      }

      await db
        .update(users)
        .set({ role: input.role })
        .where(eq(users.id, input.userId));
      return { success: true };
    }),

  listQuestionsPage: adminQuery
    .input(
      z.object({
        type: z.enum(["pat", "dat"]),
        limit: z.number().min(1).max(100).default(50),
        cursor: cursorSchema,
      })
    )
    .query(async ({ input }) => {
      const db = getDb();
      if (input.type === "pat") {
        return { items: [], nextCursor: null };
      }

      const cursorCondition = input.cursor
        ? or(
            lt(datQuestions.createdAt, new Date(input.cursor.createdAt)),
            and(
              eq(datQuestions.createdAt, new Date(input.cursor.createdAt)),
              lt(datQuestions.id, input.cursor.id)
            )
          )
        : undefined;
      const rows = await db
        .select({
          id: datQuestions.id,
          publicId: datQuestions.publicId,
          subject: datQuestions.subject,
          topic: datQuestions.topic,
          difficulty: datQuestions.difficulty,
          createdAt: datQuestions.createdAt,
        })
        .from(datQuestions)
        .where(and(isNull(datQuestions.deletedAt), cursorCondition))
        .orderBy(desc(datQuestions.createdAt), desc(datQuestions.id))
        .limit(input.limit + 1);
      return {
        items: rows.slice(0, input.limit).map(r => ({
          ...r,
          type: "dat" as const,
        })),
        nextCursor: nextCursor(rows, input.limit),
      };
    }),

  deleteQuestion: adminQuery
    .input(
      z.object({
        type: z.enum(["pat", "dat"]),
        id: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      if (input.type === "pat") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "PAT questions are generated on the fly and cannot be deleted.",
        });
      }
      await db.transaction(async tx => {
        const deletedAt = new Date();
        const [updated] = await tx
          .update(datQuestions)
          .set({ deletedAt })
          .where(
            and(eq(datQuestions.id, input.id), isNull(datQuestions.deletedAt))
          )
          .returning({ id: datQuestions.id });
        if (!updated) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Question not found.",
          });
        }
        await tx.insert(adminActions).values({
          adminId: ctx.user.id,
          action: "delete_dat",
          targetType: "dat_question",
          targetId: input.id,
          metadata: { deletedAt: deletedAt.toISOString() },
        });
      });
      return { success: true };
    }),

  seedDatQuestions: adminQuery.mutation(async () => {
    const { seedDatQuestions } = await import("../db/seed-dat");
    await seedDatQuestions();
    return { success: true };
  }),

  sendTaskDueReminders: adminQuery.mutation(async () => {
    const { notifyUpcomingTasks } = await import("./lib/tasks/notifications");
    const result = await notifyUpcomingTasks();
    return { success: true, ...result };
  }),

  auditStripeEntitlements: adminQuery
    .input(
      z.object({
        afterId: z.number().int().positive().optional(),
        limit: z.number().int().min(1).max(100).default(50),
      })
    )
    .query(({ ctx, input }) =>
      reconcileStripeEntitlements({
        adminId: ctx.user.id,
        afterId: input.afterId,
        limit: input.limit,
        apply: false,
      })
    ),

  reconcileStripeEntitlements: adminQuery
    .input(
      z.object({
        afterId: z.number().int().positive().optional(),
        limit: z.number().int().min(1).max(100).default(50),
        confirmation: z.literal("RECONCILE_STRIPE_ENTITLEMENTS"),
      })
    )
    .mutation(({ ctx, input }) =>
      reconcileStripeEntitlements({
        adminId: ctx.user.id,
        afterId: input.afterId,
        limit: input.limit,
        apply: true,
      })
    ),
});
