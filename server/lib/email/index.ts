import { eq } from "drizzle-orm";
import { getDb } from "../../queries/connection";
import { notifications } from "@db/schema";
import { sendPushNotification } from "../push";

export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

interface SendResult {
  success: boolean;
  provider?: string;
  error?: string;
}

async function sendWithResend(message: EmailMessage): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return {
      success: false,
      provider: "resend",
      error: "Missing RESEND_API_KEY",
    };
  }

  const from = process.env.EMAIL_FROM || "onboarding@resend.dev";
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: message.to,
      subject: message.subject,
      text: message.text,
      html: message.html,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "Unknown error");
    return {
      success: false,
      provider: "resend",
      error: `${res.status} ${body}`,
    };
  }

  return { success: true, provider: "resend" };
}

async function sendWithSendgrid(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _message: EmailMessage,
): Promise<SendResult> {
  return {
    success: false,
    provider: "sendgrid",
    error:
      "SendGrid provider is not installed. Use Resend instead (set EMAIL_PROVIDER=resend).",
  };
}

/**
 * Send an email. Supported providers (set via EMAIL_PROVIDER):
 * - "console" (default): logs to stdout for local development
 * - "resend": uses Resend API (set RESEND_API_KEY and EMAIL_FROM)
 * - "sendgrid": uses SendGrid API (set SENDGRID_API_KEY and EMAIL_FROM)
 */
export async function sendEmail(message: EmailMessage): Promise<SendResult> {
  const provider = (process.env.EMAIL_PROVIDER || "console").toLowerCase();

  if (provider === "console") {
    console.log("--- EMAIL (console mode) ---");
    console.log(`To: ${message.to}`);
    console.log(`Subject: ${message.subject}`);
    console.log(message.text);
    console.log("----------------------------");
    return { success: true, provider: "console" };
  }

  if (provider === "resend") {
    return sendWithResend(message);
  }

  if (provider === "sendgrid") {
    return sendWithSendgrid(message);
  }

  console.warn(`Email provider "${provider}" is not implemented.`);
  return { success: false, provider, error: "Provider not implemented" };
}

interface NotificationInput {
  userId: number;
  type: "task_due" | "payment" | "community" | "system" | "study_reminder";
  title: string;
  message: string;
  link?: string;
  sendEmail?: boolean;
  email?: string;
}

export async function createNotification(input: NotificationInput) {
  const db = getDb();

  const [notification] = await db
    .insert(notifications)
    .values({
      userId: input.userId,
      type: input.type,
      title: input.title,
      message: input.message,
      link: input.link,
      read: false,
      emailSent: false,
    })
    .returning();

  if (input.sendEmail && input.email) {
    const result = await sendEmail({
      to: input.email,
      subject: input.title,
      text: `${input.title}\n\n${input.message}${input.link ? `\n\n${input.link}` : ""}`,
      html: input.link
        ? `<p>${escapeHtml(input.message)}</p><p><a href="${escapeHtml(input.link)}">View in PreDent</a></p>`
        : `<p>${escapeHtml(input.message)}</p>`,
    });
    if (result.success && notification) {
      await db
        .update(notifications)
        .set({ emailSent: true })
        .where(eq(notifications.id, notification.id));
    }
  }

  sendPushNotification(input.userId, {
    title: input.title,
    body: input.message,
    link: input.link,
  }).catch(err => {
    console.error("[push] Failed to send push notification:", err);
  });

  return notification;
}
