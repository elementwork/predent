import { and, eq, sql } from "drizzle-orm";
import { notifications, outboxJobs, users } from "@db/schema";
import { getDb } from "../../queries/connection";
import { sendEmail } from "../email";
import { sendPushNotification } from "../push";
import { incrementCounter, log } from "../observability";

const MAX_ATTEMPTS = 5;

type NotificationPayload = {
  notificationId: number;
  sendEmail: boolean;
};

function parsePayload(payload: Record<string, unknown>): NotificationPayload {
  if (
    !Number.isSafeInteger(payload.notificationId) ||
    typeof payload.sendEmail !== "boolean"
  ) {
    throw new Error("Invalid notification outbox payload");
  }
  return payload as NotificationPayload;
}

export function getRetryDelayMs(attempt: number) {
  return Math.min(60 * 60_000, 2 ** Math.max(0, attempt - 1) * 30_000);
}

async function claimJobs(limit: number) {
  const db = getDb();
  return db.transaction(async tx => {
    const result = await tx.execute(sql`
      UPDATE outbox_jobs
      SET status = 'processing', locked_at = now(), attempts = attempts + 1
      WHERE id IN (
        SELECT id FROM outbox_jobs
        WHERE (status = 'pending' OR (status = 'processing' AND locked_at < now() - interval '10 minutes'))
          AND available_at <= now()
        ORDER BY available_at, id
        FOR UPDATE SKIP LOCKED
        LIMIT ${limit}
      )
      RETURNING id, topic, payload, attempts
    `);
    return Array.from(result) as Array<{
      id: number;
      topic: string;
      payload: Record<string, unknown>;
      attempts: number;
    }>;
  });
}

async function deliverNotification(payload: NotificationPayload) {
  const db = getDb();
  const [row] = await db
    .select({ notification: notifications, user: users })
    .from(notifications)
    .innerJoin(users, eq(notifications.userId, users.id))
    .where(eq(notifications.id, payload.notificationId))
    .limit(1);
  if (!row) throw new Error(`Notification ${payload.notificationId} not found`);

  const emailAllowed =
    row.notification.type === "task_due"
      ? row.user.emailTaskDue
      : row.notification.type === "study_reminder"
        ? row.user.emailStudyReminder
        : row.notification.type === "community"
          ? row.user.emailCommunity
          : true;

  if (payload.sendEmail && emailAllowed && row.user.email) {
    const result = await sendEmail({
      to: row.user.email,
      subject: row.notification.title,
      text: `${row.notification.title}\n\n${row.notification.message}${row.notification.link ? `\n\n${row.notification.link}` : ""}`,
    });
    if (!result.success)
      throw new Error(result.error ?? "Email delivery failed");
    await db
      .update(notifications)
      .set({ emailSent: true })
      .where(eq(notifications.id, row.notification.id));
  }

  await sendPushNotification(row.user.id, {
    title: row.notification.title,
    body: row.notification.message,
    link: row.notification.link ?? undefined,
  });
}

export async function processOutboxBatch(limit = 25) {
  const db = getDb();
  const jobs = await claimJobs(Math.max(1, Math.min(limit, 100)));
  let completed = 0;
  let failed = 0;

  for (const job of jobs) {
    try {
      if (job.topic !== "notification_delivery") {
        throw new Error(`Unsupported outbox topic: ${job.topic}`);
      }
      await deliverNotification(parsePayload(job.payload));
      await db
        .update(outboxJobs)
        .set({ status: "completed", processedAt: new Date(), lockedAt: null })
        .where(
          and(eq(outboxJobs.id, job.id), eq(outboxJobs.status, "processing"))
        );
      completed++;
      incrementCounter("outbox_completed");
    } catch (error) {
      const terminal = job.attempts >= MAX_ATTEMPTS;
      await db
        .update(outboxJobs)
        .set({
          status: terminal ? "failed" : "pending",
          availableAt: new Date(Date.now() + getRetryDelayMs(job.attempts)),
          lockedAt: null,
          lastError:
            error instanceof Error
              ? error.message.slice(0, 2000)
              : String(error),
        })
        .where(eq(outboxJobs.id, job.id));
      failed++;
      incrementCounter("outbox_failed");
      log(terminal ? "error" : "warn", "outbox.delivery_failed", {
        jobId: job.id,
        attempts: job.attempts,
        terminal,
      });
    }
  }

  return { claimed: jobs.length, completed, failed };
}

export function startOutboxWorker() {
  const run = () =>
    processOutboxBatch().catch(error => {
      log("error", "outbox.worker_failed", {
        error: error instanceof Error ? error.message : String(error),
      });
    });
  void run();
  const timer = setInterval(run, 10_000);
  return { stop: () => clearInterval(timer) };
}
