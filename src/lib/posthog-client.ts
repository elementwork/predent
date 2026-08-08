type PostHogClient = (typeof import("posthog-js"))["default"];

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY as string | undefined;
const POSTHOG_HOST =
  (import.meta.env.VITE_POSTHOG_HOST as string) || "https://app.posthog.com";

let client: PostHogClient | undefined;
let loading: Promise<PostHogClient> | undefined;
let initialized = false;

async function loadClient() {
  loading ??= import("posthog-js").then(module => module.default);
  client = await loading;
  return client;
}

export async function enableAnalytics() {
  if (!POSTHOG_KEY) return false;
  const posthog = await loadClient();
  if (initialized) {
    posthog.opt_in_capturing();
    return true;
  }
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    capture_pageview: false,
    capture_pageleave: true,
    persistence: "localStorage+cookie",
    person_profiles: "identified_only",
  });
  posthog.opt_in_capturing();
  initialized = true;
  return true;
}

export async function disableAnalytics() {
  if (!client || !initialized) return;
  client.reset();
  client.opt_out_capturing();
}

export async function captureAnalytics(
  event: string,
  properties?: Record<string, unknown>
) {
  if (!(await enableAnalytics())) return;
  client!.capture(event, properties);
}

export async function identifyAnalytics(
  id: string,
  properties: Record<string, unknown>
) {
  if (!(await enableAnalytics())) return;
  client!.identify(id, properties);
}

export function resetAnalyticsIdentity() {
  client?.reset();
}
