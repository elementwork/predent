import { and, desc, eq, isNull, lt, or, sql } from "drizzle-orm";
import { communityPosts, communityReactions, users } from "@db/schema";
import type { PageCursor } from "@contracts/pagination";
import { getDb } from "../queries/connection";

type PostType = "result" | "question" | "discussion";

export async function listVisiblePosts(input: {
  type?: PostType;
  limit: number;
  cursor?: PageCursor;
  offset?: number;
  viewerId?: number;
}) {
  const conditions = [
    isNull(communityPosts.deletedAt),
    isNull(communityPosts.hiddenAt),
  ];
  if (input.type) conditions.push(eq(communityPosts.type, input.type));
  if (input.cursor) {
    const cursorDate = new Date(input.cursor.createdAt);
    conditions.push(
      or(
        lt(communityPosts.createdAt, cursorDate),
        and(
          eq(communityPosts.createdAt, cursorDate),
          lt(communityPosts.id, input.cursor.id)
        )
      )!
    );
  }

  return getDb()
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
      likes: sql<number>`(
        ${communityPosts.likes} + (
          SELECT count(*)::int FROM ${communityReactions}
          WHERE ${communityReactions.postId} = ${communityPosts.id}
        )
      )`,
      likedByViewer: input.viewerId
        ? sql<boolean>`EXISTS (
            SELECT 1 FROM ${communityReactions}
            WHERE ${communityReactions.postId} = ${communityPosts.id}
              AND ${communityReactions.userId} = ${input.viewerId}
          )`
        : sql<boolean>`false`,
      createdAt: communityPosts.createdAt,
      authorName: users.name,
      authorAvatar: users.avatar,
    })
    .from(communityPosts)
    .leftJoin(users, eq(communityPosts.userId, users.id))
    .where(and(...conditions))
    .orderBy(desc(communityPosts.createdAt), desc(communityPosts.id))
    .limit(input.limit)
    .offset(input.offset ?? 0);
}
