import webPush from "web-push";
import { eq } from "drizzle-orm";
import { getDb } from "../queries/connection";
import { pushSubscriptions } from "@db/schema";
import { incrementCounter, log } from "./observability";

const VAPID_PUBLIC = process.env.VITE_VAPID_PUBLIC_KEY || "";
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY || "";
const VAPID_EMAIL = process.env.VAPID_EMAIL || "mailto:admin@predent.vercel.app";

if (VAPID_PUBLIC && VAPID_PRIVATE) {
  webPush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC, VAPID_PRIVATE);
}

export async function sendPushNotification(
  userId: number,
  payload: { title: string; body: string; icon?: string; link?: string }
) {
  if (!VAPID_PUBLIC || !VAPID_PRIVATE) {
    return { configured: false, attempted: 0, delivered: 0, expired: 0 };
  }
  const db = getDb();
  const subs = await db
    .select()
    .from(pushSubscriptions)
    .where(eq(pushSubscriptions.userId, userId));

  let delivered = 0;
  let expired = 0;
  const failures: Array<{ endpoint: string; statusCode?: number }> = [];
  for (const sub of subs) {
    try {
      await webPush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        JSON.stringify({
          title: payload.title,
          body: payload.body,
          icon: payload.icon || "/icon-192.png",
          data: { link: payload.link || "/" },
        })
      );
      delivered++;
      incrementCounter("push_delivered");
    } catch (err: unknown) {
      const statusCode = (err as { statusCode?: number })?.statusCode;
      if (statusCode === 404 || statusCode === 410) {
        await db
          .delete(pushSubscriptions)
          .where(eq(pushSubscriptions.endpoint, sub.endpoint));
        expired++;
      } else {
        failures.push({ endpoint: new URL(sub.endpoint).hostname, statusCode });
        incrementCounter("push_failed");
      }
    }
  }
  if (failures.length > 0) {
    log("warn", "push.delivery_failed", {
      userId,
      failures,
      attempted: subs.length,
    });
    throw new Error(`Push delivery failed for ${failures.length} endpoint(s)`);
  }
  return {
    configured: true,
    attempted: subs.length,
    delivered,
    expired,
  };
}

export function isPushConfigured() {
  return !!(VAPID_PUBLIC && VAPID_PRIVATE);
}
