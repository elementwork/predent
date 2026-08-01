import { z } from "zod";
import { eq, and, desc, asc, lte, gte, inArray, sql, count } from "drizzle-orm";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { tasks, patAttempts, datAttempts, datQuestions } from "@db/schema";

const categoryEnum = z.enum([
  "academic",
  "dat",
  "experience",
  "application",
  "interview",
  "other",
]);
const statusEnum = z.enum([
  "not_started",
  "in_progress",
  "under_review",
  "complete",
  "blocked",
]);
const priorityEnum = z.enum(["critical", "high", "medium", "low"]);

const priorityWeight: Record<string, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

export const taskRouter = createRouter({
  list: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db.query.tasks.findMany({
      where: eq(tasks.userId, ctx.user.id),
      orderBy: [desc(tasks.createdAt)],
    });
  }),

  listFiltered: authedQuery
    .input(
      z.object({
        status: statusEnum.optional(),
        category: categoryEnum.optional(),
        priority: priorityEnum.optional(),
        dueBefore: z.string().datetime().optional(),
        dueAfter: z.string().datetime().optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const conditions = [eq(tasks.userId, ctx.user.id)];
      if (input.status) conditions.push(eq(tasks.status, input.status));
      if (input.category) conditions.push(eq(tasks.category, input.category));
      if (input.priority) conditions.push(eq(tasks.priority, input.priority));
      if (input.dueBefore)
        conditions.push(lte(tasks.dueDate, new Date(input.dueBefore)));
      if (input.dueAfter)
        conditions.push(gte(tasks.dueDate, new Date(input.dueAfter)));

      const whereClause = and(...conditions);

      const rows = await db
        .select()
        .from(tasks)
        .where(whereClause)
        .orderBy(
          sql`CASE WHEN ${tasks.dueDate} IS NULL THEN 1 ELSE 0 END`,
          asc(tasks.dueDate),
          sql`CASE
            WHEN ${tasks.priority} = 'critical' THEN 0
            WHEN ${tasks.priority} = 'high' THEN 1
            WHEN ${tasks.priority} = 'medium' THEN 2
            WHEN ${tasks.priority} = 'low' THEN 3
          END`
        )
        .limit(input.limit)
        .offset(input.offset);

      return rows;
    }),

  create: authedQuery
    .input(
      z.object({
        title: z.string().min(1).max(255),
        category: categoryEnum.default("other"),
        dueDate: z.string().optional(),
        status: statusEnum.default("not_started"),
        priority: priorityEnum.default("medium"),
        schoolId: z.string().max(50).optional(),
        notes: z.string().optional(),
        estimatedMinutes: z.number().int().positive().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const completedAt =
        input.status === "complete" ? new Date() : null;
      const result = await db.insert(tasks).values({
        userId: ctx.user.id,
        title: input.title,
        category: input.category,
        dueDate: input.dueDate ? new Date(input.dueDate) : null,
        status: input.status,
        priority: input.priority,
        schoolId: input.schoolId ?? null,
        notes: input.notes ?? null,
        estimatedMinutes: input.estimatedMinutes ?? null,
        completedAt,
      }).returning({ id: tasks.id });
      return { success: true, id: result[0]!.id };
    }),

  update: authedQuery
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(1).max(255).optional(),
        category: categoryEnum.optional(),
        dueDate: z.string().optional(),
        status: statusEnum.optional(),
        priority: priorityEnum.optional(),
        schoolId: z.string().max(50).optional(),
        notes: z.string().optional(),
        estimatedMinutes: z.number().int().positive().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const { id, ...data } = input;

      const updateData: Record<string, unknown> = {
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        updatedAt: new Date(),
      };

      if (data.status !== undefined) {
        if (data.status === "complete") {
          updateData.completedAt = new Date();
        } else {
          updateData.completedAt = null;
        }
      }

      await db
        .update(tasks)
        .set(updateData)
        .where(and(eq(tasks.id, id), eq(tasks.userId, ctx.user.id)));
      return { success: true };
    }),

  delete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db
        .delete(tasks)
        .where(and(eq(tasks.id, input.id), eq(tasks.userId, ctx.user.id)));
      return { success: true };
    }),

  reschedule: authedQuery
    .input(z.object({ id: z.number(), newDueDate: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const task = await db.query.tasks.findFirst({
        where: and(eq(tasks.id, input.id), eq(tasks.userId, ctx.user.id)),
      });
      if (!task) return { success: false };

      await db
        .update(tasks)
        .set({
          rescheduledFrom: task.dueDate,
          dueDate: new Date(input.newDueDate),
          updatedAt: new Date(),
        })
        .where(and(eq(tasks.id, input.id), eq(tasks.userId, ctx.user.id)));
      return { success: true };
    }),

  getSchedulingSuggestions: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const incompleteTasks = await db
      .select()
      .from(tasks)
      .where(
        and(
          eq(tasks.userId, ctx.user.id),
          sql`${tasks.status} != 'complete'`,
          sql`(${tasks.dueDate} <= ${sevenDaysFromNow.toISOString()} OR ${tasks.dueDate} IS NULL)`
        )
      )
      .orderBy(
        sql`CASE WHEN ${tasks.dueDate} IS NULL THEN 1 ELSE 0 END`,
        asc(tasks.dueDate)
      );

    const overdue: typeof incompleteTasks = [];
    const upcoming: typeof incompleteTasks = [];

    for (const t of incompleteTasks) {
      if (t.dueDate && new Date(t.dueDate) < now) {
        overdue.push(t);
      } else {
        upcoming.push(t);
      }
    }

    const days: Array<{ date: string; tasks: typeof incompleteTasks }> = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
      const dateStr = d.toISOString().split("T")[0];
      days.push({ date: dateStr, tasks: [] });
    }

    const assigned = new Set<number>();

    for (const t of upcoming) {
      if (!t.dueDate) continue;
      const dueStr = new Date(t.dueDate).toISOString().split("T")[0];
      const day = days.find(d => d.date === dueStr);
      if (day) {
        day.tasks.push(t);
        assigned.add(t.id);
      }
    }

    const remaining = upcoming
      .filter(t => !assigned.has(t.id))
      .sort(
        (a, b) =>
          (priorityWeight[b.priority] ?? 0) - (priorityWeight[a.priority] ?? 0)
      );

    let dayIdx = 0;
    for (const t of remaining) {
      days[dayIdx % 7].tasks.push(t);
      dayIdx++;
    }

    for (const day of days) {
      day.tasks.sort(
        (a, b) =>
          (priorityWeight[b.priority] ?? 0) - (priorityWeight[a.priority] ?? 0)
      );
    }

    return { overdue, schedule: days };
  }),

  bulkUpdateStatus: authedQuery
    .input(z.object({ ids: z.array(z.number()), status: statusEnum }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      if (input.ids.length === 0) return { success: true, updated: 0 };

      const updateData: Record<string, unknown> = {
        status: input.status,
        updatedAt: new Date(),
      };
      if (input.status === "complete") {
        updateData.completedAt = new Date();
      } else {
        updateData.completedAt = null;
      }

      const result = await db
        .update(tasks)
        .set(updateData)
        .where(
          and(
            eq(tasks.userId, ctx.user.id),
            inArray(tasks.id, input.ids)
          )
        )
        .returning({ id: tasks.id });
      return { success: true, updated: result.length };
    }),

  dashboardStats: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const [{ total: patQuestions }] = await db
      .select({ total: count() })
      .from(patAttempts)
      .where(eq(patAttempts.userId, ctx.user.id));
    const [{ total: taskCount }] = await db
      .select({ total: count() })
      .from(tasks)
      .where(eq(tasks.userId, ctx.user.id));

    // Compute study streak: consecutive days with at least one PAT or DAT attempt
    const [patActivity, datActivity] = await Promise.all([
      db
        .select({ createdAt: patAttempts.createdAt })
        .from(patAttempts)
        .where(eq(patAttempts.userId, ctx.user.id))
        .orderBy(desc(patAttempts.createdAt))
        .limit(365),
      db
        .select({ createdAt: datAttempts.createdAt })
        .from(datAttempts)
        .where(eq(datAttempts.userId, ctx.user.id))
        .orderBy(desc(datAttempts.createdAt))
        .limit(365),
    ]);

    let streakDays = 0;
    const allAttempts = [...patActivity, ...datActivity];
    if (allAttempts.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dayMs = 24 * 60 * 60 * 1000;

      // Get unique days with activity (descending)
      const daySet = new Set<number>();
      for (const row of allAttempts) {
        const d = new Date(row.createdAt);
        d.setHours(0, 0, 0, 0);
        daySet.add(d.getTime());
      }
      const sortedDays = Array.from(daySet).sort((a, b) => b - a);

      // Check if today or yesterday has activity (allow streak to start from today or yesterday)
      const latestDay = sortedDays[0]!;
      if (latestDay === today.getTime() || latestDay === today.getTime() - dayMs) {
        streakDays = 1;
        for (let i = 1; i < sortedDays.length; i++) {
          if (sortedDays[i - 1]! - sortedDays[i]! === dayMs) {
            streakDays++;
          } else {
            break;
          }
        }
      }
    }

    return {
      patQuestions: patQuestions ?? 0,
      taskCount: taskCount ?? 0,
      studyStreakDays: streakDays,
    };
  }),

  getRecommendations: authedQuery.query(async ({ ctx }) => {
    const db = getDb();

    // Get recent PAT attempts (last 50)
    const patRecent = await db
      .select({
        category: patAttempts.category,
        difficulty: patAttempts.difficulty,
        isCorrect: patAttempts.isCorrect,
      })
      .from(patAttempts)
      .where(eq(patAttempts.userId, ctx.user.id))
      .orderBy(desc(patAttempts.createdAt))
      .limit(50);

    // Get recent DAT attempts (last 50)
    const datRecent = await db
      .select({
        subject: datQuestions.subject,
        difficulty: datQuestions.difficulty,
        isCorrect: datAttempts.isCorrect,
      })
      .from(datAttempts)
      .innerJoin(datQuestions, eq(datAttempts.questionId, datQuestions.id))
      .where(eq(datAttempts.userId, ctx.user.id))
      .orderBy(desc(datAttempts.createdAt))
      .limit(50);

    // Get upcoming tasks
    const upcomingTasks = await db
      .select()
      .from(tasks)
      .where(
        and(
          eq(tasks.userId, ctx.user.id),
          eq(tasks.status, "not_started"),
          sql`${tasks.dueDate} IS NOT NULL`,
          gte(tasks.dueDate, new Date())
        )
      )
      .orderBy(asc(tasks.dueDate))
      .limit(5);

    const recommendations: {
      type: "study" | "practice" | "task";
      title: string;
      description: string;
      link: string;
      priority: "high" | "medium" | "low";
    }[] = [];

    // Analyze PAT weak categories
    if (patRecent.length > 0) {
      const catStats: Record<string, { correct: number; total: number }> = {};
      for (const a of patRecent) {
        if (!catStats[a.category]) catStats[a.category] = { correct: 0, total: 0 };
        catStats[a.category].total++;
        if (a.isCorrect) catStats[a.category].correct++;
      }
      const weakCats = Object.entries(catStats)
        .map(([cat, s]) => ({ cat, acc: s.correct / s.total, total: s.total }))
        .filter(c => c.total >= 3)
        .sort((a, b) => a.acc - b.acc);

      if (weakCats.length > 0) {
        const weakest = weakCats[0]!;
        recommendations.push({
          type: "practice",
          title: `Practice ${weakest.cat}`,
          description: `Your accuracy in ${weakest.cat} is ${Math.round(weakest.acc * 100)}%. Focus on this area to improve.`,
          link: "/pat-academy/practice",
          priority: "high",
        });
      }
    }

    // Analyze DAT weak subjects
    if (datRecent.length > 0) {
      const subStats: Record<string, { correct: number; total: number }> = {};
      for (const a of datRecent) {
        if (!subStats[a.subject]) subStats[a.subject] = { correct: 0, total: 0 };
        subStats[a.subject].total++;
        if (a.isCorrect) subStats[a.subject].correct++;
      }
      const weakSubs = Object.entries(subStats)
        .map(([sub, s]) => ({ sub, acc: s.correct / s.total, total: s.total }))
        .filter(s => s.total >= 3)
        .sort((a, b) => a.acc - b.acc);

      if (weakSubs.length > 0) {
        const weakest = weakSubs[0]!;
        recommendations.push({
          type: "practice",
          title: `Study ${weakest.sub}`,
          description: `Your accuracy in ${weakest.sub} is ${Math.round(weakest.acc * 100)}%. Review the fundamentals.`,
          link: "/dat-academy/practice",
          priority: "high",
        });
      }
    }

    // Flashcard reminder
    if (patRecent.length > 0 || datRecent.length > 0) {
      recommendations.push({
        type: "study",
        title: "Review Flashcards",
        description: "Spaced repetition helps lock in what you've learned. Review your due cards.",
        link: "/flashcards",
        priority: "medium",
      });
    }

    // Upcoming tasks
    for (const task of upcomingTasks.slice(0, 2)) {
      if (!task.dueDate) continue;
      const daysUntil = Math.ceil(
        (new Date(task.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      recommendations.push({
        type: "task",
        title: task.title,
        description: daysUntil <= 1
          ? "Due soon — complete this task today!"
          : `Due in ${daysUntil} days.`,
        link: "/dashboard/planner",
        priority: daysUntil <= 1 ? "high" : "medium",
      });
    }

    // If no data yet, show onboarding recommendations
    if (patRecent.length === 0 && datRecent.length === 0) {
      recommendations.push(
        {
          type: "practice",
          title: "Start PAT Practice",
          description: "Begin with a quick 10-question session to establish your baseline.",
          link: "/pat-academy/practice",
          priority: "high",
        },
        {
          type: "practice",
          title: "Try DAT Practice",
          description: "Test your knowledge in Biology, Chemistry, or Reading Comprehension.",
          link: "/dat-academy/practice",
          priority: "medium",
        },
        {
          type: "study",
          title: "Explore Flashcards",
          description: "Use spaced repetition to memorize key concepts efficiently.",
          link: "/flashcards",
          priority: "low",
        }
      );
    }

    return { recommendations: recommendations.slice(0, 6) };
  }),
});
