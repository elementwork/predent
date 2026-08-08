export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
  html?: string;
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
  _message: EmailMessage
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
 * - "sendgrid": intentionally unsupported; returns an explicit error
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
