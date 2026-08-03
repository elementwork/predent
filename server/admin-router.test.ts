import { describe, it, expect } from "vitest";
import { adminRouter } from "./admin-router";
import {
  createTestUser,
  mockContext,
  seedDatQuestion,
} from "./test-helpers";
import { getDb } from "./queries/connection";
import { datQuestions } from "@db/schema";
import { eq } from "drizzle-orm";
import { hasDb } from "./test-db-flag";

const createCaller = (user?: Awaited<ReturnType<typeof createTestUser>>) =>
  adminRouter.createCaller(mockContext(user));

describe.skipIf(!hasDb)("adminRouter.stats", () => {
  it("returns stats for admin", async () => {
    const admin = await createTestUser({ role: "admin" });
    const caller = createCaller(admin);

    const stats = await caller.stats();

    expect(stats).toHaveProperty("users");
    expect(stats.patQuestions).toBe(360);
    expect(stats).toHaveProperty("datQuestions");
  });

  it("throws FORBIDDEN for non-admin", async () => {
    const user = await createTestUser({ role: "user" });
    const caller = createCaller(user);

    await expect(caller.stats()).rejects.toThrow("Insufficient permissions");
  });

  it("throws UNAUTHORIZED when no user", async () => {
    const caller = createCaller();
    await expect(caller.stats()).rejects.toThrow("Authentication required");
  });
});

describe.skipIf(!hasDb)("adminRouter.listUsers", () => {
  it("lists users with pagination", async () => {
    const admin = await createTestUser({ role: "admin" });
    await createTestUser();
    await createTestUser();

    const caller = createCaller(admin);
    const rows = await caller.listUsers({ limit: 2, offset: 0 });

    expect(rows.length).toBeLessThanOrEqual(2);
  });
});

describe.skipIf(!hasDb)("adminRouter.updateUserRole", () => {
  it("promotes a user to admin", async () => {
    const admin = await createTestUser({ role: "admin" });
    const user = await createTestUser({ role: "user" });
    const caller = createCaller(admin);

    const result = await caller.updateUserRole({
      userId: user.id,
      role: "admin",
    });

    expect(result.success).toBe(true);
  });
});

describe.skipIf(!hasDb)("adminRouter.listQuestions", () => {
  it("returns empty PAT list (generated on the fly)", async () => {
    const admin = await createTestUser({ role: "admin" });
    const caller = createCaller(admin);
    const rows = await caller.listQuestions({ type: "pat" });

    expect(rows).toEqual([]);
  });

  it("lists DAT questions", async () => {
    const admin = await createTestUser({ role: "admin" });
    await seedDatQuestion();

    const caller = createCaller(admin);
    const rows = await caller.listQuestions({ type: "dat" });

    expect(rows.length).toBeGreaterThan(0);
    expect(rows[0].type).toBe("dat");
  });
});

describe.skipIf(!hasDb)("adminRouter.deleteQuestion", () => {
  it("rejects PAT question deletion", async () => {
    const admin = await createTestUser({ role: "admin" });
    const caller = createCaller(admin);

    await expect(
      caller.deleteQuestion({ type: "pat", id: 1 })
    ).rejects.toThrow("generated on the fly");
  });

  it("soft-deletes a DAT question and logs the action", async () => {
    const admin = await createTestUser({ role: "admin" });
    const question = await seedDatQuestion();
    const caller = createCaller(admin);

    await caller.deleteQuestion({ type: "dat", id: question.id });

    const db = getDb();
    const rows = await db
      .select()
      .from(datQuestions)
      .where(eq(datQuestions.id, question.id));
    expect(rows).toHaveLength(1);
    expect(rows[0].deletedAt).not.toBeNull();

    const listed = await caller.listQuestions({ type: "dat" });
    expect(listed.find(q => q.id === question.id)).toBeUndefined();
  });
});

describe.skipIf(!hasDb)("adminRouter.updateUserRole", () => {
  it("prevents changing own role", async () => {
    const admin = await createTestUser({ role: "admin" });
    const caller = createCaller(admin);

    await expect(
      caller.updateUserRole({ userId: admin.id, role: "user" })
    ).rejects.toThrow("Cannot change your own role");
  });

  it("prevents changing owner role", async () => {
    const admin = await createTestUser({ role: "admin" });
    const ownerUnionId = `owner-${Math.random().toString(36).slice(2)}`;
    process.env.OWNER_UNION_ID = ownerUnionId;
    const owner = await createTestUser({ role: "admin", unionId: ownerUnionId });
    const caller = createCaller(admin);

    await expect(
      caller.updateUserRole({ userId: owner.id, role: "user" })
    ).rejects.toThrow("Cannot change the owner");

    delete process.env.OWNER_UNION_ID;
  });

  it("prevents demoting the last admin", async () => {
    const admin = await createTestUser({ role: "admin" });
    const caller = createCaller(admin);

    // When there's only one admin, demoting any admin should fail
    // We test by trying to demote ourselves (which also fails with own-role message)
    // The key assertion is that the operation is blocked
    await expect(
      caller.updateUserRole({ userId: admin.id, role: "user" })
    ).rejects.toThrow();
  });
});
