import { z } from "zod";
import { eq, desc, count, sql, and, ne, isNull, lt, or } from "drizzle-orm";
import {
  createRouter,
  publicQuery,
  authedQuery,
  adminQuery,
} from "./middleware";
import { getDb } from "./queries/connection";
import {
  communityPosts,
  communityComments,
  communityReports,
  communityReactions,
  users,
} from "@db/schema";
import { TRPCError } from "@trpc/server";
import { createNotification } from "./services/notification-service";
import { cursorSchema, nextCursor } from "@contracts/pagination";
import { listVisiblePosts } from "./repositories/community-repository";

const postTypeSchema = z.enum(["result", "question", "discussion"]);
const resultSchema = z.enum([
  "Accepted",
  "Interview Invite",
  "Waitlisted",
  "Rejected",
]);

const reportReasonSchema = z.enum([
  "spam",
  "harassment",
  "inappropriate",
  "other",
]);

const reactionCount = sql<number>`(
  ${communityPosts.likes} + (
    SELECT count(*)::int FROM ${communityReactions}
    WHERE ${communityReactions.postId} = ${communityPosts.id}
  )
)`;

export const communityRouter = createRouter({
  listPostsPage: publicQuery
    .input(
      z.object({
        type: postTypeSchema.optional(),
        limit: z.number().int().min(1).max(50).default(20),
        cursor: cursorSchema,
      })
    )
    .query(async ({ ctx, input }) => {
      const rows = await listVisiblePosts({
        ...input,
        limit: input.limit + 1,
        viewerId: ctx.user?.id,
      });
      return {
        items: rows.slice(0, input.limit),
        nextCursor: nextCursor(rows, input.limit),
      };
    }),

  getPostCount: publicQuery
    .input(z.object({ type: postTypeSchema.optional() }).default({}))
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [
        isNull(communityPosts.deletedAt),
        isNull(communityPosts.hiddenAt),
      ];
      if (input.type) conditions.push(eq(communityPosts.type, input.type));

      const [row] = await db
        .select({ total: count() })
        .from(communityPosts)
        .where(and(...conditions));
      return row?.total ?? 0;
    }),

  getPost: authedQuery
    .input(z.object({ postId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const user = ctx.user!;

      const [post] = await db
        .select({
          id: communityPosts.id,
          userId: communityPosts.userId,
          type: communityPosts.type,
          title: communityPosts.title,
          content: communityPosts.content,
          school: communityPosts.school,
          program: communityPosts.program,
          result: communityPosts.result,
          gpa: communityPosts.gpa,
          datAa: communityPosts.datAa,
          datPat: communityPosts.datPat,
          province: communityPosts.province,
          likes: reactionCount,
          deletedAt: communityPosts.deletedAt,
          hiddenAt: communityPosts.hiddenAt,
          createdAt: communityPosts.createdAt,
          updatedAt: communityPosts.updatedAt,
          authorName: users.name,
          authorAvatar: users.avatar,
        })
        .from(communityPosts)
        .leftJoin(users, eq(communityPosts.userId, users.id))
        .where(
          and(
            eq(communityPosts.id, input.postId),
            isNull(communityPosts.deletedAt),
            isNull(communityPosts.hiddenAt)
          )
        )
        .limit(1);

      if (!post) throw new TRPCError({ code: "NOT_FOUND" });

      const [{ total: commentCount }] = await db
        .select({ total: count() })
        .from(communityComments)
        .where(eq(communityComments.postId, input.postId));

      const comments = await db
        .select({
          id: communityComments.id,
          postId: communityComments.postId,
          userId: communityComments.userId,
          content: communityComments.content,
          createdAt: communityComments.createdAt,
          authorName: users.name,
          authorAvatar: users.avatar,
        })
        .from(communityComments)
        .leftJoin(users, eq(communityComments.userId, users.id))
        .where(eq(communityComments.postId, input.postId))
        .orderBy(desc(communityComments.createdAt));

      const [existingReport] = await db
        .select({ id: communityReports.id })
        .from(communityReports)
        .where(
          and(
            eq(communityReports.postId, input.postId),
            eq(communityReports.reporterId, user.id)
          )
        )
        .limit(1);

      return {
        ...post,
        commentCount,
        comments,
        hasReported: !!existingReport,
      };
    }),

  createPost: authedQuery
    .input(
      z.object({
        type: postTypeSchema,
        title: z.string().min(1).max(200),
        content: z.string().min(1).max(2000),
        school: z.string().max(100).optional(),
        program: z.string().max(20).optional(),
        result: resultSchema.optional(),
        gpa: z.string().max(20).optional(),
        datAa: z.string().max(10).optional(),
        datPat: z.string().max(10).optional(),
        province: z.enum(["IP", "OOP"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const user = ctx.user;
      if (!user) throw new TRPCError({ code: "UNAUTHORIZED" });

      const [post] = await db
        .insert(communityPosts)
        .values({
          userId: user.id,
          ...input,
        })
        .returning();

      // Notify users who posted about the same school (for questions)
      if (input.type === "question" && input.school) {
        const relatedPosters = await db
          .select({
            id: users.id,
            email: users.email,
            emailCommunity: users.emailCommunity,
          })
          .from(communityPosts)
          .innerJoin(users, eq(communityPosts.userId, users.id))
          .where(
            and(
              eq(communityPosts.school, input.school),
              ne(communityPosts.userId, user.id)
            )
          )
          .groupBy(users.id)
          .limit(20);

        for (const poster of relatedPosters) {
          if (!poster.emailCommunity) continue;
          await createNotification({
            userId: poster.id,
            type: "community",
            title: `New question about ${input.school}`,
            message: `${user.name || "Someone"} asked: "${input.title}"`,
            link: `/community`,
            sendEmail: true,
            idempotencyKey: `community:school:${post.id}:${poster.id}`,
          }).catch(err => {
            console.error("[community] Failed to send post notification:", err);
          });
        }
      }

      return post;
    }),

  editPost: authedQuery
    .input(
      z.object({
        postId: z.number(),
        title: z.string().min(1).max(200).optional(),
        content: z.string().min(1).max(2000).optional(),
        school: z.string().max(100).optional(),
        program: z.string().max(20).optional(),
        result: resultSchema.optional(),
        gpa: z.string().max(20).optional(),
        datAa: z.string().max(10).optional(),
        datPat: z.string().max(10).optional(),
        province: z.enum(["IP", "OOP"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const user = ctx.user!;

      const [post] = await db
        .select({ id: communityPosts.id, userId: communityPosts.userId })
        .from(communityPosts)
        .where(
          and(
            eq(communityPosts.id, input.postId),
            isNull(communityPosts.deletedAt),
            isNull(communityPosts.hiddenAt)
          )
        )
        .limit(1);

      if (!post) throw new TRPCError({ code: "NOT_FOUND" });
      if (post.userId !== user.id) throw new TRPCError({ code: "FORBIDDEN" });

      const { postId, ...updates } = input;
      const [updated] = await db
        .update(communityPosts)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(communityPosts.id, postId))
        .returning();

      return updated;
    }),

  deletePost: authedQuery
    .input(z.object({ postId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const user = ctx.user!;

      const [post] = await db
        .select({ id: communityPosts.id, userId: communityPosts.userId })
        .from(communityPosts)
        .where(
          and(
            eq(communityPosts.id, input.postId),
            isNull(communityPosts.deletedAt),
            isNull(communityPosts.hiddenAt)
          )
        )
        .limit(1);

      if (!post) throw new TRPCError({ code: "NOT_FOUND" });
      if (post.userId !== user.id && user.role !== "admin")
        throw new TRPCError({ code: "FORBIDDEN" });

      await db
        .update(communityPosts)
        .set({ deletedAt: new Date() })
        .where(eq(communityPosts.id, input.postId));

      return { success: true };
    }),

  createComment: authedQuery
    .input(
      z.object({
        postId: z.number(),
        content: z.string().min(1).max(1000),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const user = ctx.user!;

      const [post] = await db
        .select({
          id: communityPosts.id,
          userId: communityPosts.userId,
          title: communityPosts.title,
        })
        .from(communityPosts)
        .where(
          and(
            eq(communityPosts.id, input.postId),
            isNull(communityPosts.deletedAt),
            isNull(communityPosts.hiddenAt)
          )
        )
        .limit(1);

      if (!post) throw new TRPCError({ code: "NOT_FOUND" });

      const [comment] = await db
        .insert(communityComments)
        .values({
          postId: input.postId,
          userId: user.id,
          content: input.content,
        })
        .returning();

      if (post.userId !== user.id) {
        const [author] = await db
          .select({
            id: users.id,
            email: users.email,
            emailCommunity: users.emailCommunity,
          })
          .from(users)
          .where(eq(users.id, post.userId))
          .limit(1);

        if (author && author.emailCommunity) {
          await createNotification({
            userId: author.id,
            type: "community",
            title: "New comment on your post",
            message: `${user.name || "Someone"} commented on "${post.title}"`,
            link: `/community`,
            sendEmail: true,
            idempotencyKey: `community:comment:${comment.id}:${author.id}`,
          }).catch(err => {
            console.error(
              "[community] Failed to send comment notification:",
              err
            );
          });
        }
      }

      return comment;
    }),

  deleteComment: authedQuery
    .input(z.object({ commentId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const user = ctx.user!;

      const [comment] = await db
        .select({ id: communityComments.id, userId: communityComments.userId })
        .from(communityComments)
        .where(eq(communityComments.id, input.commentId))
        .limit(1);

      if (!comment) throw new TRPCError({ code: "NOT_FOUND" });
      if (comment.userId !== user.id && user.role !== "admin")
        throw new TRPCError({ code: "FORBIDDEN" });

      await db
        .delete(communityComments)
        .where(eq(communityComments.id, input.commentId));

      return { success: true };
    }),

  reportPost: authedQuery
    .input(
      z.object({
        postId: z.number(),
        reason: reportReasonSchema,
        description: z.string().max(500).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const user = ctx.user!;

      const [report] = await db
        .insert(communityReports)
        .values({
          postId: input.postId,
          reporterId: user.id,
          reason: input.reason,
          description: input.description,
        })
        .onConflictDoNothing()
        .returning();
      if (report) return report;
      return (
        await db
          .select()
          .from(communityReports)
          .where(
            and(
              eq(communityReports.postId, input.postId),
              eq(communityReports.reporterId, user.id)
            )
          )
          .limit(1)
      )[0];
    }),

  reportComment: authedQuery
    .input(
      z.object({
        commentId: z.number(),
        reason: reportReasonSchema,
        description: z.string().max(500).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const user = ctx.user!;

      const [report] = await db
        .insert(communityReports)
        .values({
          commentId: input.commentId,
          reporterId: user.id,
          reason: input.reason,
          description: input.description,
        })
        .onConflictDoNothing()
        .returning();
      if (report) return report;
      return (
        await db
          .select()
          .from(communityReports)
          .where(
            and(
              eq(communityReports.commentId, input.commentId),
              eq(communityReports.reporterId, user.id)
            )
          )
          .limit(1)
      )[0];
    }),

  listMyPosts: authedQuery
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const user = ctx.user!;

      const rows = await db
        .select({
          id: communityPosts.id,
          type: communityPosts.type,
          title: communityPosts.title,
          content: communityPosts.content,
          school: communityPosts.school,
          program: communityPosts.program,
          result: communityPosts.result,
          gpa: communityPosts.gpa,
          datAa: communityPosts.datAa,
          datPat: communityPosts.datPat,
          province: communityPosts.province,
          likes: reactionCount,
          deletedAt: communityPosts.deletedAt,
          hiddenAt: communityPosts.hiddenAt,
          createdAt: communityPosts.createdAt,
          updatedAt: communityPosts.updatedAt,
        })
        .from(communityPosts)
        .where(eq(communityPosts.userId, user.id))
        .orderBy(desc(communityPosts.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      return rows;
    }),

  likePost: authedQuery
    .input(z.object({ postId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const user = ctx.user;
      if (!user) throw new TRPCError({ code: "UNAUTHORIZED" });

      const [post] = await db
        .select({
          id: communityPosts.id,
          userId: communityPosts.userId,
          title: communityPosts.title,
          likes: communityPosts.likes,
        })
        .from(communityPosts)
        .where(eq(communityPosts.id, input.postId))
        .limit(1);
      if (!post) throw new TRPCError({ code: "NOT_FOUND" });

      const [reaction] = await db
        .insert(communityReactions)
        .values({ postId: input.postId, userId: user.id })
        .onConflictDoNothing()
        .returning({ id: communityReactions.id });

      // Notify post author (if liker is not the author)
      if (reaction && post.userId !== user.id) {
        const [author] = await db
          .select({
            id: users.id,
            email: users.email,
            emailCommunity: users.emailCommunity,
          })
          .from(users)
          .where(eq(users.id, post.userId))
          .limit(1);

        if (author && author.emailCommunity) {
          await createNotification({
            userId: author.id,
            type: "community",
            title: "Someone liked your post",
            message: `${user.name || "Someone"} liked "${post.title}"`,
            link: `/community`,
            sendEmail: true,
            idempotencyKey: `community:like:${input.postId}:${user.id}`,
          }).catch(err => {
            console.error("[community] Failed to send like notification:", err);
          });
        }
      }

      const [{ total: reactionTotal }] = await db
        .select({ total: count() })
        .from(communityReactions)
        .where(eq(communityReactions.postId, input.postId));
      return {
        success: true,
        liked: true,
        created: Boolean(reaction),
        likes: post.likes + reactionTotal,
      };
    }),

  unlikePost: authedQuery
    .input(z.object({ postId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      await getDb()
        .delete(communityReactions)
        .where(
          and(
            eq(communityReactions.postId, input.postId),
            eq(communityReactions.userId, ctx.user.id)
          )
        );
      return { success: true, liked: false };
    }),

  // ─── Admin procedures ───

  listReportsPage: adminQuery
    .input(
      z.object({
        status: z
          .enum(["pending", "reviewed", "dismissed", "actioned"])
          .optional(),
        limit: z.number().min(1).max(50).default(20),
        cursor: cursorSchema,
      })
    )
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [];
      if (input.status)
        conditions.push(eq(communityReports.status, input.status));
      if (input.cursor) {
        const date = new Date(input.cursor.createdAt);
        conditions.push(
          or(
            lt(communityReports.createdAt, date),
            and(
              eq(communityReports.createdAt, date),
              lt(communityReports.id, input.cursor.id)
            )
          )!
        );
      }

      const rows = await db
        .select({
          id: communityReports.id,
          postId: communityReports.postId,
          commentId: communityReports.commentId,
          reporterId: communityReports.reporterId,
          reason: communityReports.reason,
          description: communityReports.description,
          status: communityReports.status,
          reviewedBy: communityReports.reviewedBy,
          createdAt: communityReports.createdAt,
          reviewedAt: communityReports.reviewedAt,
          reporterName: users.name,
          reporterEmail: users.email,
          postTitle: communityPosts.title,
          postContent: communityPosts.content,
          commentContent: communityComments.content,
        })
        .from(communityReports)
        .leftJoin(users, eq(communityReports.reporterId, users.id))
        .leftJoin(
          communityPosts,
          eq(communityReports.postId, communityPosts.id)
        )
        .leftJoin(
          communityComments,
          eq(communityReports.commentId, communityComments.id)
        )
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(communityReports.createdAt), desc(communityReports.id))
        .limit(input.limit + 1);

      return {
        items: rows.slice(0, input.limit),
        nextCursor: nextCursor(rows, input.limit),
      };
    }),

  reviewReport: adminQuery
    .input(
      z.object({
        reportId: z.number(),
        status: z.enum(["reviewed", "dismissed", "actioned"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const user = ctx.user!;

      const [report] = await db
        .select()
        .from(communityReports)
        .where(eq(communityReports.id, input.reportId))
        .limit(1);

      if (!report) throw new TRPCError({ code: "NOT_FOUND" });

      await db.transaction(async tx => {
        await tx
          .update(communityReports)
          .set({
            status: input.status,
            reviewedBy: user.id,
            reviewedAt: new Date(),
          })
          .where(eq(communityReports.id, input.reportId));

        if (input.status === "actioned") {
          if (report.postId) {
            await tx
              .update(communityPosts)
              .set({ hiddenAt: new Date() })
              .where(eq(communityPosts.id, report.postId));
          }
          if (report.commentId) {
            await tx
              .delete(communityComments)
              .where(eq(communityComments.id, report.commentId));
          }
        }
      });

      return { success: true };
    }),

  adminHidePost: adminQuery
    .input(z.object({ postId: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();

      await db
        .update(communityPosts)
        .set({ hiddenAt: new Date() })
        .where(eq(communityPosts.id, input.postId));

      return { success: true };
    }),

  adminRestorePost: adminQuery
    .input(z.object({ postId: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();

      await db
        .update(communityPosts)
        .set({ deletedAt: null, hiddenAt: null })
        .where(eq(communityPosts.id, input.postId));

      return { success: true };
    }),
});
