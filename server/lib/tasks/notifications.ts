import { eq, ne, and, lte, gte, isNull, or } from "drizzle-orm";
import { getDb } from "../../queries/connection";
import { tasks, users } from "@db/schema";
import { createNotification } from "../email";
import { studyReminderEmail } from "../email/templates";

const MS_PER_HOUR = 60 * 60 * 1000;
const MS_PER_DAY = 24 * MS_PER_HOUR;

interface NotifyOptions {
  /** How far before the due date to notify (ms). Default: 24 hours. */
  windowMs?: number;
  /** Only send one notification per task within this period (ms). Default: 24 hours. */
  minIntervalMs?: number;
}

/**
 * Find tasks whose due date is within the reminder window and whose owners
 * have not yet been notified recently for that task. Creates in-app
 * notifications and sends emails when an email provider is configured.
 */
export async function notifyUpcomingTasks(options: NotifyOptions = {}) {
  const windowMs = options.windowMs ?? MS_PER_DAY;
  const minIntervalMs = options.minIntervalMs ?? MS_PER_DAY;
  const now = Date.now();
  const horizon = new Date(now + windowMs);

  const db = getDb();

  const pending = await db
    .select({
      task: tasks,
      user: {
        id: users.id,
        email: users.email,
      },
    })
    .from(tasks)
    .innerJoin(users, eq(tasks.userId, users.id))
    .where(
      and(
        // Due date exists and is in the future but within the reminder window
        gte(tasks.dueDate, new Date(now)),
        lte(tasks.dueDate, horizon),
        // Not completed
        ne(tasks.status, "complete"),
        // Never notified, or last notification was long enough ago
        or(
          isNull(tasks.dueNotifiedAt),
          lte(tasks.dueNotifiedAt, new Date(now - minIntervalMs))
        )
      )
    );

  let notified = 0;
  const errors: { taskId: number; error: string }[] = [];

  for (const { task, user } of pending) {
    try {
      if (!task.dueDate) continue;

      const dueText = task.dueDate.toLocaleDateString("en-CA", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      await createNotification({
        userId: task.userId,
        type: "task_due",
        title: `Task due soon: ${task.title}`,
        message: `Your "${task.title}" task is due on ${dueText}.`,
        link: `${process.env.PUBLIC_APP_URL || ""}/dashboard`,
        sendEmail: true,
        email: user.email ?? undefined,
      });

      await db
        .update(tasks)
        .set({ dueNotifiedAt: new Date() })
        .where(eq(tasks.id, task.id));

      notified++;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      errors.push({ taskId: task.id, error: message });
      console.error(`Failed to notify task ${task.id}:`, message);
    }
  }

  return { notified, errors };
}

/**
 * Start the background task-notification scheduler. Runs immediately once,
 * then repeats every hour. Only intended for the production server process.
 */
export function startTaskNotificationScheduler(options?: NotifyOptions) {
  const run = async () => {
    try {
      const result = await notifyUpcomingTasks(options);
      if (result.notified > 0) {
        console.log(
          `[scheduler] Sent ${result.notified} task due-date reminder(s).`
        );
      }
      if (result.errors.length > 0) {
        console.error(
          `[scheduler] ${result.errors.length} reminder(s) failed.`,
          result.errors
        );
      }
    } catch (err) {
      console.error("[scheduler] notifyUpcomingTasks failed:", err);
    }

    try {
      const studyResult = await sendStudyReminders();
      if (studyResult.notified > 0) {
        console.log(
          `[scheduler] Sent ${studyResult.notified} study reminder(s).`
        );
      }
    } catch (err) {
      console.error("[scheduler] sendStudyReminders failed:", err);
    }
  };

  // Run once on startup, then hourly.
  run();
  const intervalMs = 60 * 60 * 1000;
  const timer = setInterval(run, intervalMs);

  return {
    stop: () => clearInterval(timer),
  };
}

/**
 * Send study reminders for tasks due within 48 hours.
 * Creates study_reminder type notifications + emails.
 */
export async function sendStudyReminders() {
  const windowMs = 48 * MS_PER_HOUR;
  const minIntervalMs = MS_PER_DAY;
  const now = Date.now();
  const horizon = new Date(now + windowMs);

  const db = getDb();

  const pending = await db
    .select({
      task: tasks,
      user: {
        id: users.id,
        name: users.name,
        email: users.email,
        emailStudyReminder: users.emailStudyReminder,
      },
    })
    .from(tasks)
    .innerJoin(users, eq(tasks.userId, users.id))
    .where(
      and(
        gte(tasks.dueDate, new Date(now)),
        lte(tasks.dueDate, horizon),
        ne(tasks.status, "complete"),
        or(
          isNull(tasks.dueNotifiedAt),
          lte(tasks.dueNotifiedAt, new Date(now - minIntervalMs))
        ),
        eq(users.emailStudyReminder, true)
      )
    );

  // Group tasks by user
  const byUser = new Map<number, typeof pending>();
  for (const row of pending) {
    const uid = row.user.id;
    if (!byUser.has(uid)) byUser.set(uid, []);
    byUser.get(uid)!.push(row);
  }

  let notified = 0;

  for (const [userId, rows] of byUser) {
    const user = rows[0]!.user;
    const taskList = rows.map(r => ({
      title: r.task.title,
      dueDate: r.task.dueDate!.toLocaleDateString("en-CA", {
        month: "short",
        day: "numeric",
      }),
      category: r.task.category,
    }));

    const template = studyReminderEmail(
      user.name || "Student",
      taskList
    );

    await createNotification({
      userId,
      type: "study_reminder",
      title: template.subject,
      message: `You have ${taskList.length} task${taskList.length > 1 ? "s" : ""} due soon.`,
      link: `${process.env.PUBLIC_APP_URL || ""}/dashboard/planner`,
      sendEmail: true,
      email: user.email ?? undefined,
    });

    // Mark tasks as notified
    for (const row of rows) {
      await db
        .update(tasks)
        .set({ dueNotifiedAt: new Date() })
        .where(eq(tasks.id, row.task.id));
    }

    notified++;
  }

  return { notified };
}
