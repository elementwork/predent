import { eq } from "drizzle-orm";
import { notifications, outboxJobs } from "@db/schema";
import { getDb } from "../queries/connection";

export interface NotificationInput {
  userId: number;
  type: "task_due" | "payment" | "community" | "system" | "study_reminder";
  title: string;
  message: string;
  link?: string;
  sendEmail?: boolean;
  /** Stable key for retry-safe creation. Generated when omitted. */
  idempotencyKey?: string;
}

type Database = ReturnType<typeof getDb>;
type Transaction = Parameters<Parameters<Database["transaction"]>[0]>[0];

export async function insertQueuedNotification(
  tx: Transaction,
  input: NotificationInput
) {
  const dedupeKey = input.idempotencyKey ?? crypto.randomUUID();
  const [created] = await tx
    .insert(notifications)
    .values({
      userId: input.userId,
      type: input.type,
      title: input.title,
      message: input.message,
      link: input.link,
      dedupeKey,
    })
    .onConflictDoNothing({ target: notifications.dedupeKey })
    .returning();

  const notification =
    created ??
    (
      await tx
        .select()
        .from(notifications)
        .where(eq(notifications.dedupeKey, dedupeKey))
        .limit(1)
    )[0];

  if (!notification) {
    throw new Error("Unable to create or find deduplicated notification");
  }

  await tx
    .insert(outboxJobs)
    .values({
      idempotencyKey: `notification:${dedupeKey}`,
      topic: "notification_delivery",
      payload: {
        notificationId: notification.id,
        sendEmail: Boolean(input.sendEmail),
      },
    })
    .onConflictDoNothing({ target: outboxJobs.idempotencyKey });

  return notification;
}

/** Persist the in-app notification and delivery job atomically. */
export async function createNotification(input: NotificationInput) {
  const db = getDb();
  return db.transaction(tx => insertQueuedNotification(tx, input));
}
