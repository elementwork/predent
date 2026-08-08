type SentryModule = typeof import("@sentry/react");

const dsn = import.meta.env.VITE_SENTRY_DSN;
let sentry: SentryModule | undefined;
let initialized = false;

export async function enableSentry() {
  if (!dsn || initialized) return;
  sentry = await import("@sentry/react");
  sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    integrations: [
      sentry.browserTracingIntegration(),
      sentry.replayIntegration({ maskAllText: true, blockAllMedia: true }),
    ],
    tracesSampleRate: import.meta.env.PROD ? 0.2 : 1.0,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 1.0,
    enabled: import.meta.env.PROD || !!import.meta.env.VITE_SENTRY_DSN,
  });
  initialized = true;
}

export async function disableSentry() {
  if (!sentry || !initialized) return;
  await sentry.close(2_000);
  initialized = false;
}

export function captureException(error: Error, componentStack?: string | null) {
  sentry?.captureException(error, {
    contexts: { react: { componentStack } },
  });
}
