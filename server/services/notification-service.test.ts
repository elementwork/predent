import { describe, expect, it } from "vitest";
import { count, eq } from "drizzle-orm";
import { notifications, outboxJobs } from "@db/schema";
import { hasDb } from "../test-db-flag";
import { createTestUser } from "../test-helpers";
import { getDb } from "../queries/connection";
import { createNotification } from "./notification-service";

describe.skipIf(!hasDb)("notification outbox", () => {
  it("atomically deduplicates notifications and delivery jobs", async () => {
    const user = await createTestUser();
    const idempotencyKey = `test:${crypto.randomUUID()}`;
    const input = {
      userId: user.id,
      type: "system" as const,
      title: "Test",
      message: "Test",
      idempotencyKey,
    };

    const first = await createNotification(input);
    const second = await createNotification(input);
    expect(second.id).toBe(first.id);

    const db = getDb();
    const [{ total: notificationCount }] = await db
      .select({ total: count() })
      .from(notifications)
      .where(eq(notifications.dedupeKey, idempotencyKey));
    const [{ total: jobCount }] = await db
      .select({ total: count() })
      .from(outboxJobs)
      .where(eq(outboxJobs.idempotencyKey, `notification:${idempotencyKey}`));
    expect(notificationCount).toBe(1);
    expect(jobCount).toBe(1);
  });
});
