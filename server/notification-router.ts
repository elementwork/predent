import { z } from "zod";
import { eq, and, desc, count, lt, or } from "drizzle-orm";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { notifications, users, pushSubscriptions } from "@db/schema";
import { TRPCError } from "@trpc/server";
import { cursorSchema, nextCursor } from "@contracts/pagination";
import { assertSafePushEndpoint } from "./lib/url-security";

const pushEndpointSchema = z.string().url().max(2048);

export const notificationRouter = createRouter({
  unreadCount: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const user = ctx.user;
    if (!user) throw new TRPCError({ code: "UNAUTHORIZED" });

    const [row] = await db
      .select({ total: count() })
      .from(notifications)
      .where(
        and(eq(notifications.userId, user.id), eq(notifications.read, false))
      );

    return row?.total ?? 0;
  }),

  listPage: authedQuery
    .input(
      z.object({
        limit: z.number().int().min(1).max(50).default(20),
        cursor: cursorSchema,
        unreadOnly: z.boolean().default(false),
      })
    )
    .query(async ({ ctx, input }) => {
      const conditions = [eq(notifications.userId, ctx.user.id)];
      if (input.unreadOnly) conditions.push(eq(notifications.read, false));
      if (input.cursor) {
        const date = new Date(input.cursor.createdAt);
        conditions.push(
          or(
            lt(notifications.createdAt, date),
            and(
              eq(notifications.createdAt, date),
              lt(notifications.id, input.cursor.id)
            )
          )!
        );
      }
      const rows = await getDb()
        .select()
        .from(notifications)
        .where(and(...conditions))
        .orderBy(desc(notifications.createdAt), desc(notifications.id))
        .limit(input.limit + 1);
      return {
        items: rows.slice(0, input.limit),
        nextCursor: nextCursor(rows, input.limit),
      };
    }),

  markRead: authedQuery
    .input(z.object({ notificationId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const user = ctx.user;
      if (!user) throw new TRPCError({ code: "UNAUTHORIZED" });

      const [updated] = await db
        .update(notifications)
        .set({ read: true })
        .where(
          and(
            eq(notifications.id, input.notificationId),
            eq(notifications.userId, user.id)
          )
        )
        .returning({ id: notifications.id });

      if (!updated) throw new TRPCError({ code: "NOT_FOUND" });

      return { success: true };
    }),

  markAllRead: authedQuery.mutation(async ({ ctx }) => {
    const db = getDb();
    const user = ctx.user;
    if (!user) throw new TRPCError({ code: "UNAUTHORIZED" });

    await db
      .update(notifications)
      .set({ read: true })
      .where(
        and(eq(notifications.userId, user.id), eq(notifications.read, false))
      );

    return { success: true };
  }),

  getPreferences: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

    const [row] = await db
      .select({
        emailTaskDue: users.emailTaskDue,
        emailStudyReminder: users.emailStudyReminder,
        emailCommunity: users.emailCommunity,
      })
      .from(users)
      .where(eq(users.id, ctx.user.id))
      .limit(1);

    return {
      emailTaskDue: row?.emailTaskDue ?? true,
      emailStudyReminder: row?.emailStudyReminder ?? true,
      emailCommunity: row?.emailCommunity ?? true,
    };
  }),

  updatePreferences: authedQuery
    .input(
      z.object({
        emailTaskDue: z.boolean().optional(),
        emailStudyReminder: z.boolean().optional(),
        emailCommunity: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
      await db.update(users).set(input).where(eq(users.id, ctx.user.id));

      return { success: true };
    }),

  subscribePush: authedQuery
    .input(
      z.object({
        endpoint: pushEndpointSchema,
        p256dh: z.string().min(16).max(512),
        auth: z.string().min(8).max(512),
        userAgent: z.string().max(500).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
      try {
        await assertSafePushEndpoint(input.endpoint);
      } catch {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "A trusted public HTTPS push endpoint is required",
        });
      }

      const [existing] = await db
        .select({ userId: pushSubscriptions.userId })
        .from(pushSubscriptions)
        .where(eq(pushSubscriptions.endpoint, input.endpoint))
        .limit(1);
      if (existing && existing.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Push endpoint is already registered",
        });
      }
      await db
        .insert(pushSubscriptions)
        .values({ userId: ctx.user.id, ...input })
        .onConflictDoUpdate({
          target: pushSubscriptions.endpoint,
          set: {
            p256dh: input.p256dh,
            auth: input.auth,
            userAgent: input.userAgent,
          },
        });

      return { success: true };
    }),

  unsubscribePush: authedQuery
    .input(z.object({ endpoint: pushEndpointSchema }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

      await db
        .delete(pushSubscriptions)
        .where(
          and(
            eq(pushSubscriptions.endpoint, input.endpoint),
            eq(pushSubscriptions.userId, ctx.user.id)
          )
        );

      return { success: true };
    }),

  getPushStatus: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

    const subs = await db
      .select()
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.userId, ctx.user.id));

    return {
      subscribed: subs.length > 0,
      subscriptionCount: subs.length,
    };
  }),
});
