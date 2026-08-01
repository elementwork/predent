import { z } from "zod";
import { eq, and, desc, count } from "drizzle-orm";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { notifications, users, pushSubscriptions } from "@db/schema";
import { TRPCError } from "@trpc/server";

export const notificationRouter = createRouter({
  list: authedQuery
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(20),
        offset: z.number().min(0).default(0),
        unreadOnly: z.boolean().default(false),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const user = ctx.user;
      if (!user) throw new TRPCError({ code: "UNAUTHORIZED" });

      const conditions = [eq(notifications.userId, user.id)];
      if (input.unreadOnly) conditions.push(eq(notifications.read, false));

      const rows = await db
        .select()
        .from(notifications)
        .where(and(...conditions))
        .orderBy(desc(notifications.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      return rows;
    }),

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

  markRead: authedQuery
    .input(z.object({ notificationId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const user = ctx.user;
      if (!user) throw new TRPCError({ code: "UNAUTHORIZED" });

      await db
        .update(notifications)
        .set({ read: true })
        .where(
          and(
            eq(notifications.id, input.notificationId),
            eq(notifications.userId, user.id)
          )
        );

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

      await db
        .update(users)
        .set(input)
        .where(eq(users.id, ctx.user.id));

      return { success: true };
    }),

  subscribePush: authedQuery
    .input(
      z.object({
        endpoint: z.string(),
        p256dh: z.string(),
        auth: z.string(),
        userAgent: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

      await db
        .delete(pushSubscriptions)
        .where(eq(pushSubscriptions.endpoint, input.endpoint));

      await db.insert(pushSubscriptions).values({
        userId: ctx.user.id,
        endpoint: input.endpoint,
        p256dh: input.p256dh,
        auth: input.auth,
        userAgent: input.userAgent,
      });

      return { success: true };
    }),

  unsubscribePush: authedQuery
    .input(z.object({ endpoint: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

      await db
        .delete(pushSubscriptions)
        .where(eq(pushSubscriptions.endpoint, input.endpoint));

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
