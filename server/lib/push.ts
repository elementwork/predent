import webPush from "web-push";
import { eq } from "drizzle-orm";
import { getDb } from "../queries/connection";
import { pushSubscriptions } from "@db/schema";

const VAPID_PUBLIC = process.env.VITE_VAPID_PUBLIC_KEY || "";
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY || "";
const VAPID_EMAIL = process.env.VAPID_EMAIL || "mailto:admin@predent.ca";

if (VAPID_PUBLIC && VAPID_PRIVATE) {
  webPush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC, VAPID_PRIVATE);
}

export async function sendPushNotification(
  userId: number,
  payload: { title: string; body: string; icon?: string; link?: string }
) {
  if (!VAPID_PUBLIC || !VAPID_PRIVATE) return;
  const db = getDb();
  const subs = await db
    .select()
    .from(pushSubscriptions)
    .where(eq(pushSubscriptions.userId, userId));

  for (const sub of subs) {
    try {
      await webPush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        JSON.stringify({
          title: payload.title,
          body: payload.body,
          icon: payload.icon || "/icon-192.png",
          data: { link: payload.link || "/" },
        })
      );
    } catch (err: unknown) {
      if ((err as { statusCode?: number })?.statusCode === 410) {
        await db.delete(pushSubscriptions).where(eq(pushSubscriptions.endpoint, sub.endpoint));
      }
    }
  }
}

export function isPushConfigured() {
  return !!(VAPID_PUBLIC && VAPID_PRIVATE);
}
