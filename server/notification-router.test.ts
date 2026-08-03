import { describe, it, expect } from "vitest";
import { notificationRouter } from "./notification-router";
import { hasDb } from "./test-db-flag";
import { createTestUser, mockContext, seedNotification } from "./test-helpers";
import { getDb } from "./queries/connection";
import { notifications } from "@db/schema";
import { eq } from "drizzle-orm";

const createCaller = (user?: Awaited<ReturnType<typeof createTestUser>>) =>
  notificationRouter.createCaller(mockContext(user));

describe.skipIf(!hasDb)("notificationRouter.list", () => {
  it("returns user's notifications", async () => {
    const user = await createTestUser();
    await seedNotification(user.id);

    const caller = createCaller(user);
    const rows = await caller.list({});

    expect(rows.length).toBeGreaterThan(0);
  });

  it("filters unread notifications", async () => {
    const user = await createTestUser();
    await seedNotification(user.id, { read: false });
    await seedNotification(user.id, { read: true });

    const caller = createCaller(user);
    const rows = await caller.list({ unreadOnly: true });

    expect(rows.every(n => !n.read)).toBe(true);
  });

  it("throws UNAUTHORIZED when no user", async () => {
    const caller = createCaller();
    await expect(caller.list({})).rejects.toThrow("Authentication required");
  });
});

describe.skipIf(!hasDb)("notificationRouter.unreadCount", () => {
  it("returns the unread count", async () => {
    const user = await createTestUser();
    await seedNotification(user.id, { read: false });

    const caller = createCaller(user);
    const count = await caller.unreadCount();

    expect(count).toBeGreaterThanOrEqual(1);
  });
});

describe.skipIf(!hasDb)("notificationRouter.markRead", () => {
  it("marks a notification as read", async () => {
    const user = await createTestUser();
    const notification = await seedNotification(user.id, { read: false });
    const caller = createCaller(user);

    await caller.markRead({ notificationId: notification.id });

    const db = getDb();
    const [updated] = await db
      .select()
      .from(notifications)
      .where(eq(notifications.id, notification.id));

    expect(updated.read).toBe(true);
  });
});

describe.skipIf(!hasDb)("notificationRouter.markAllRead", () => {
  it("marks all notifications as read", async () => {
    const user = await createTestUser();
    await seedNotification(user.id, { read: false });
    await seedNotification(user.id, { read: false });

    const caller = createCaller(user);
    await caller.markAllRead();

    const count = await caller.unreadCount();
    expect(count).toBe(0);
  });
});

describe.skipIf(!hasDb)("notificationRouter.getPreferences", () => {
  it("returns default preferences when none set", async () => {
    const user = await createTestUser();
    const caller = createCaller(user);

    const prefs = await caller.getPreferences();

    expect(prefs.emailTaskDue).toBe(true);
    expect(prefs.emailStudyReminder).toBe(true);
    expect(prefs.emailCommunity).toBe(true);
  });
});

describe.skipIf(!hasDb)("notificationRouter.updatePreferences", () => {
  it("updates email preferences", async () => {
    const user = await createTestUser();
    const caller = createCaller(user);

    await caller.updatePreferences({ emailTaskDue: false });

    const prefs = await caller.getPreferences();
    expect(prefs.emailTaskDue).toBe(false);
    expect(prefs.emailStudyReminder).toBe(true);
  });

  it("returns success after update", async () => {
    const user = await createTestUser();
    const caller = createCaller(user);

    const result = await caller.updatePreferences({
      emailCommunity: false,
    });

    expect(result.success).toBe(true);
  });
});
