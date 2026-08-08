import { describe, it, expect } from "vitest";
import { communityRouter } from "./community-router";
import { createTestUser, mockContext, seedCommunityPost } from "./test-helpers";
import { getDb } from "./queries/connection";
import {
  communityPosts,
  communityComments,
  communityReactions,
} from "@db/schema";
import { and, eq } from "drizzle-orm";
import { hasDb } from "./test-db-flag";

const createCaller = (user?: Awaited<ReturnType<typeof createTestUser>>) =>
  communityRouter.createCaller(mockContext(user));

describe.skipIf(!hasDb)("communityRouter.listPosts", () => {
  it("returns posts", async () => {
    const user = await createTestUser();
    await seedCommunityPost(user.id);

    const caller = createCaller();
    const posts = await caller.listPosts({});

    expect(posts.length).toBeGreaterThan(0);
  });

  it("filters by type", async () => {
    const user = await createTestUser();
    await seedCommunityPost(user.id, { type: "result" });
    await seedCommunityPost(user.id, { type: "question" });

    const caller = createCaller();
    const posts = await caller.listPosts({ type: "result" });

    expect(posts.every(p => p.type === "result")).toBe(true);
  });
});

describe.skipIf(!hasDb)("communityRouter.getPostCount", () => {
  it("returns total count", async () => {
    const user = await createTestUser();
    await seedCommunityPost(user.id);
    await seedCommunityPost(user.id);

    const caller = createCaller();
    const count = await caller.getPostCount({});

    expect(count).toBeGreaterThanOrEqual(2);
  });

  it("returns count filtered by type", async () => {
    const user = await createTestUser();
    await seedCommunityPost(user.id, { type: "discussion" });

    const caller = createCaller();
    const count = await caller.getPostCount({ type: "discussion" });

    expect(count).toBeGreaterThanOrEqual(1);
  });
});

describe.skipIf(!hasDb)("communityRouter.createPost", () => {
  it("creates a post for authenticated user", async () => {
    const user = await createTestUser();
    const caller = createCaller(user);

    const post = await caller.createPost({
      type: "discussion",
      title: "Hello",
      content: "World",
    });

    expect(post.title).toBe("Hello");
    expect(post.userId).toBe(user.id);
  });

  it("throws UNAUTHORIZED when no user", async () => {
    const caller = createCaller();
    await expect(
      caller.createPost({ type: "discussion", title: "X", content: "Y" })
    ).rejects.toThrow("Authentication required");
  });
});

describe.skipIf(!hasDb)("communityRouter.likePost", () => {
  it("creates one idempotent reaction per user and post", async () => {
    const user = await createTestUser();
    const post = await seedCommunityPost(user.id, { likes: 5 });
    const caller = createCaller(user);

    const first = await caller.likePost({ postId: post.id });
    const second = await caller.likePost({ postId: post.id });

    const db = getDb();
    const reactions = await db
      .select()
      .from(communityReactions)
      .where(
        and(
          eq(communityReactions.postId, post.id),
          eq(communityReactions.userId, user.id)
        )
      );

    expect(first.created).toBe(true);
    expect(second.created).toBe(false);
    expect(second.likes).toBe(6);
    expect(reactions).toHaveLength(1);
  });

  it("throws NOT_FOUND for missing post", async () => {
    const user = await createTestUser();
    const caller = createCaller(user);

    await expect(caller.likePost({ postId: 999999 })).rejects.toThrow(
      "NOT_FOUND"
    );
  });
});

describe.skipIf(!hasDb)("communityRouter.editPost", () => {
  it("allows owner to edit their post", async () => {
    const user = await createTestUser();
    const post = await seedCommunityPost(user.id, { title: "Original" });
    const caller = createCaller(user);

    const updated = await caller.editPost({
      postId: post.id,
      title: "Edited",
    });

    expect(updated.title).toBe("Edited");
  });

  it("prevents non-owner from editing", async () => {
    const owner = await createTestUser();
    const other = await createTestUser();
    const post = await seedCommunityPost(owner.id);
    const caller = createCaller(other);

    await expect(
      caller.editPost({ postId: post.id, title: "Hacked" })
    ).rejects.toThrow("FORBIDDEN");
  });
});

describe.skipIf(!hasDb)("communityRouter.deletePost", () => {
  it("allows owner to delete their post", async () => {
    const user = await createTestUser();
    const post = await seedCommunityPost(user.id);
    const caller = createCaller(user);

    const result = await caller.deletePost({ postId: post.id });
    expect(result.success).toBe(true);

    const db = getDb();
    const [deleted] = await db
      .select()
      .from(communityPosts)
      .where(eq(communityPosts.id, post.id));
    expect(deleted.deletedAt).not.toBeNull();
  });

  it("allows admin to delete any post", async () => {
    const user = await createTestUser();
    const admin = await createTestUser({ role: "admin" });
    const post = await seedCommunityPost(user.id);
    const caller = createCaller(admin);

    const result = await caller.deletePost({ postId: post.id });
    expect(result.success).toBe(true);
  });
});

describe.skipIf(!hasDb)("communityRouter.createComment", () => {
  it("creates a comment on a post", async () => {
    const user = await createTestUser();
    const post = await seedCommunityPost(user.id);
    const caller = createCaller(user);

    const comment = await caller.createComment({
      postId: post.id,
      content: "Great post!",
    });

    expect(comment.content).toBe("Great post!");
    expect(comment.postId).toBe(post.id);
    expect(comment.userId).toBe(user.id);
  });

  it("throws UNAUTHORIZED when no user", async () => {
    const caller = createCaller();
    await expect(
      caller.createComment({ postId: 1, content: "X" })
    ).rejects.toThrow("Authentication required");
  });
});

describe.skipIf(!hasDb)("communityRouter.deleteComment", () => {
  it("allows owner to delete their comment", async () => {
    const user = await createTestUser();
    const post = await seedCommunityPost(user.id);
    const db = getDb();
    const [comment] = await db
      .insert(communityComments)
      .values({ postId: post.id, userId: user.id, content: "Test" })
      .returning();
    const caller = createCaller(user);

    const result = await caller.deleteComment({ commentId: comment.id });
    expect(result.success).toBe(true);

    const [deleted] = await db
      .select()
      .from(communityComments)
      .where(eq(communityComments.id, comment.id));
    expect(deleted).toBeUndefined();
  });

  it("allows admin to delete any comment", async () => {
    const user = await createTestUser();
    const admin = await createTestUser({ role: "admin" });
    const post = await seedCommunityPost(user.id);
    const db = getDb();
    const [comment] = await db
      .insert(communityComments)
      .values({ postId: post.id, userId: user.id, content: "Test" })
      .returning();
    const caller = createCaller(admin);

    const result = await caller.deleteComment({ commentId: comment.id });
    expect(result.success).toBe(true);
  });
});

describe.skipIf(!hasDb)("communityRouter.reportPost", () => {
  it("creates a report for a post", async () => {
    const reporter = await createTestUser();
    const author = await createTestUser();
    const post = await seedCommunityPost(author.id);
    const caller = createCaller(reporter);

    const report = await caller.reportPost({
      postId: post.id,
      reason: "spam",
    });

    expect(report.postId).toBe(post.id);
    expect(report.reason).toBe("spam");
  });

  it("returns existing report if already reported", async () => {
    const reporter = await createTestUser();
    const author = await createTestUser();
    const post = await seedCommunityPost(author.id);
    const caller = createCaller(reporter);

    const first = await caller.reportPost({ postId: post.id, reason: "spam" });
    const second = await caller.reportPost({
      postId: post.id,
      reason: "harassment",
    });

    expect(first.id).toBe(second.id);
  });
});
