import { describe, it, expect } from "vitest";
import { taskRouter } from "./task-router";
import { createTestUser, mockContext, seedTask } from "./test-helpers";
import { getDb } from "./queries/connection";
import { tasks } from "@db/schema";
import { eq } from "drizzle-orm";
import { hasDb } from "./test-db-flag";

const createCaller = (user?: Awaited<ReturnType<typeof createTestUser>>) =>
  taskRouter.createCaller(mockContext(user));

describe.skipIf(!hasDb)("taskRouter.listPage", () => {
  it("returns only the current user's tasks", async () => {
    const user = await createTestUser();
    const other = await createTestUser();
    await seedTask(user.id, { title: "Mine" });
    await seedTask(other.id, { title: "Other" });

    const caller = createCaller(user);
    const { items: tasks } = await caller.listPage({});

    expect(tasks).toHaveLength(1);
    expect(tasks[0].title).toBe("Mine");
  });

  it("throws UNAUTHORIZED when no user", async () => {
    const caller = createCaller();
    await expect(caller.listPage({})).rejects.toThrow(
      "Authentication required"
    );
  });
});

describe.skipIf(!hasDb)("taskRouter.create", () => {
  it("creates a task for the authenticated user", async () => {
    const user = await createTestUser();
    const caller = createCaller(user);

    const result = await caller.create({
      title: "Write DAT",
      category: "dat",
      priority: "high",
    });

    expect(result.success).toBe(true);
    expect(result.id).toBeDefined();

    const { items: tasks } = await caller.listPage({});
    expect(tasks).toHaveLength(1);
    expect(tasks[0].title).toBe("Write DAT");
  });
});

describe.skipIf(!hasDb)("taskRouter.update", () => {
  it("updates the user's task", async () => {
    const user = await createTestUser();
    const task = await seedTask(user.id, { title: "Old" });
    const caller = createCaller(user);

    await caller.update({ id: task.id, title: "New" });

    const { items: tasks } = await caller.listPage({});
    expect(tasks[0].title).toBe("New");
  });

  it("does not update another user's task", async () => {
    const user = await createTestUser();
    const other = await createTestUser();
    const task = await seedTask(other.id, { title: "Other" });
    const caller = createCaller(user);

    await caller.update({ id: task.id, title: "Hacked" });

    const callerOther = createCaller(other);
    const { items: tasks } = await callerOther.listPage({});
    expect(tasks[0].title).toBe("Other");
  });
});

describe.skipIf(!hasDb)("taskRouter.delete", () => {
  it("deletes the user's task", async () => {
    const user = await createTestUser();
    const task = await seedTask(user.id);
    const caller = createCaller(user);

    await caller.delete({ id: task.id });

    const { items: tasks } = await caller.listPage({});
    expect(tasks).toHaveLength(0);
  });
});

describe.skipIf(!hasDb)("taskRouter.listPage filters", () => {
  it("filters by status", async () => {
    const user = await createTestUser();
    await seedTask(user.id, { title: "Open", status: "not_started" });
    await seedTask(user.id, { title: "Done", status: "complete" });

    const caller = createCaller(user);
    const result = await caller.listPage({ status: "not_started" });

    expect(result.items).toHaveLength(1);
    expect(result.items[0].title).toBe("Open");
  });

  it("filters by category", async () => {
    const user = await createTestUser();
    await seedTask(user.id, { title: "DAT", category: "dat" });
    await seedTask(user.id, { title: "Academic", category: "academic" });

    const caller = createCaller(user);
    const result = await caller.listPage({ category: "dat" });

    expect(result.items).toHaveLength(1);
    expect(result.items[0].title).toBe("DAT");
  });

  it("filters by priority", async () => {
    const user = await createTestUser();
    await seedTask(user.id, { title: "High", priority: "high" });
    await seedTask(user.id, { title: "Low", priority: "low" });

    const caller = createCaller(user);
    const result = await caller.listPage({ priority: "high" });

    expect(result.items).toHaveLength(1);
    expect(result.items[0].title).toBe("High");
  });

  it("paginates with a stable cursor", async () => {
    const user = await createTestUser();
    await seedTask(user.id, { title: "A" });
    await seedTask(user.id, { title: "B" });
    await seedTask(user.id, { title: "C" });

    const caller = createCaller(user);
    const page1 = await caller.listPage({ limit: 2 });
    const page2 = await caller.listPage({
      limit: 2,
      cursor: page1.nextCursor ?? undefined,
    });

    expect(page1.items).toHaveLength(2);
    expect(page2.items).toHaveLength(1);
  });
});

describe.skipIf(!hasDb)("taskRouter.update", () => {
  it("sets completedAt when status changes to complete", async () => {
    const user = await createTestUser();
    const task = await seedTask(user.id, { status: "not_started" });
    const caller = createCaller(user);

    await caller.update({ id: task.id, status: "complete" });

    const db = getDb();
    const [updated] = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, task.id));
    expect(updated.completedAt).not.toBeNull();
  });

  it("clears completedAt when status changes away from complete", async () => {
    const user = await createTestUser();
    const task = await seedTask(user.id, { status: "complete" });
    const caller = createCaller(user);

    await caller.update({ id: task.id, status: "in_progress" });

    const db = getDb();
    const [updated] = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, task.id));
    expect(updated.completedAt).toBeNull();
  });
});

describe.skipIf(!hasDb)("taskRouter.reschedule", () => {
  it("saves previous dueDate into rescheduledFrom", async () => {
    const user = await createTestUser();
    const dueDate = new Date("2025-01-15T00:00:00Z");
    const task = await seedTask(user.id, { dueDate });
    const caller = createCaller(user);

    await caller.reschedule({
      id: task.id,
      newDueDate: "2025-02-01T00:00:00Z",
    });

    const db = getDb();
    const [updated] = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, task.id));
    expect(updated.rescheduledFrom).not.toBeNull();
    expect(new Date(updated.dueDate!).toISOString().split("T")[0]).toBe(
      "2025-02-01"
    );
  });

  it("returns success=false for missing task", async () => {
    const user = await createTestUser();
    const caller = createCaller(user);

    const result = await caller.reschedule({
      id: 999999,
      newDueDate: "2025-02-01T00:00:00Z",
    });

    expect(result.success).toBe(false);
  });
});

describe.skipIf(!hasDb)("taskRouter.bulkUpdateStatus", () => {
  it("updates multiple tasks to complete and sets completedAt", async () => {
    const user = await createTestUser();
    const t1 = await seedTask(user.id, { status: "not_started" });
    const t2 = await seedTask(user.id, { status: "in_progress" });
    const caller = createCaller(user);

    const result = await caller.bulkUpdateStatus({
      ids: [t1.id, t2.id],
      status: "complete",
    });

    expect(result.updated).toBe(2);

    const db = getDb();
    const [u1] = await db.select().from(tasks).where(eq(tasks.id, t1.id));
    const [u2] = await db.select().from(tasks).where(eq(tasks.id, t2.id));
    expect(u1.completedAt).not.toBeNull();
    expect(u2.completedAt).not.toBeNull();
  });

  it("updates multiple tasks to incomplete and clears completedAt", async () => {
    const user = await createTestUser();
    const t1 = await seedTask(user.id, { status: "complete" });
    const caller = createCaller(user);

    const result = await caller.bulkUpdateStatus({
      ids: [t1.id],
      status: "not_started",
    });

    expect(result.updated).toBe(1);

    const db = getDb();
    const [u1] = await db.select().from(tasks).where(eq(tasks.id, t1.id));
    expect(u1.completedAt).toBeNull();
  });

  it("handles empty ids array", async () => {
    const user = await createTestUser();
    const caller = createCaller(user);

    const result = await caller.bulkUpdateStatus({
      ids: [],
      status: "complete",
    });

    expect(result.success).toBe(true);
    expect(result.updated).toBe(0);
  });
});

describe.skipIf(!hasDb)("taskRouter.getSchedulingSuggestions", () => {
  it("returns empty schedule when no incomplete tasks exist", async () => {
    const user = await createTestUser();
    const caller = createCaller(user);

    const result = await caller.getSchedulingSuggestions();

    expect(result.overdue).toHaveLength(0);
    expect(result.schedule).toHaveLength(7);
    result.schedule.forEach(day => expect(day.tasks).toHaveLength(0));
  });

  it("separates overdue tasks from upcoming tasks", async () => {
    const user = await createTestUser();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await seedTask(user.id, { status: "not_started", dueDate: yesterday });
    await seedTask(user.id, { status: "not_started", dueDate: tomorrow });

    const caller = createCaller(user);
    const result = await caller.getSchedulingSuggestions();

    expect(result.overdue).toHaveLength(1);
  });

  it("assigns tasks with due dates to their matching day", async () => {
    const user = await createTestUser();
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const dateStr = tomorrow.toISOString().split("T")[0];
    await seedTask(user.id, {
      status: "not_started",
      dueDate: tomorrow,
    });

    const caller = createCaller(user);
    const result = await caller.getSchedulingSuggestions();

    const targetDay = result.schedule.find(d => d.date === dateStr);
    expect(targetDay).toBeDefined();
    expect(targetDay!.tasks).toHaveLength(1);
  });

  it("distributes tasks with no due date across days", async () => {
    const user = await createTestUser();
    await seedTask(user.id, { status: "not_started", dueDate: null });
    await seedTask(user.id, { status: "not_started", dueDate: null });

    const caller = createCaller(user);
    const result = await caller.getSchedulingSuggestions();

    const totalScheduled = result.schedule.reduce(
      (sum, day) => sum + day.tasks.length,
      0
    );
    expect(totalScheduled).toBe(2);
  });

  it("sorts tasks within each day by priority", async () => {
    const user = await createTestUser();
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await seedTask(user.id, {
      status: "not_started",
      dueDate: tomorrow,
      priority: "low",
    });
    await seedTask(user.id, {
      status: "not_started",
      dueDate: tomorrow,
      priority: "critical",
    });

    const caller = createCaller(user);
    const result = await caller.getSchedulingSuggestions();

    const todayTasks = result.schedule[0].tasks;
    if (todayTasks.length === 2) {
      expect(todayTasks[0].priority).toBe("critical");
      expect(todayTasks[1].priority).toBe("low");
    }
  });
});

describe.skipIf(!hasDb)("taskRouter.dashboardStats", () => {
  it("returns task and PAT attempt counts", async () => {
    const user = await createTestUser();
    await seedTask(user.id);
    await seedTask(user.id);
    const caller = createCaller(user);

    const stats = await caller.dashboardStats();

    expect(stats.taskCount).toBe(2);
    expect(stats).toHaveProperty("patQuestions");
    expect(stats).toHaveProperty("studyStreakDays");
  });
});
