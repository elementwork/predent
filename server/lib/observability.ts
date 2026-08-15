import type { MiddlewareHandler } from "hono";

type RequestVariables = { requestId: string };
type CounterKey =
  | "http_requests"
  | "trpc_requests"
  | "trpc_errors"
  | "outbox_completed"
  | "outbox_failed"
  | "push_delivered"
  | "push_failed"
  | "stripe_webhook_processed"
  | "stripe_webhook_failed"
  | "stripe_reconciliation_drift";

const counters: Record<CounterKey, number> = {
  http_requests: 0,
  trpc_requests: 0,
  trpc_errors: 0,
  outbox_completed: 0,
  outbox_failed: 0,
  push_delivered: 0,
  push_failed: 0,
  stripe_webhook_processed: 0,
  stripe_webhook_failed: 0,
  stripe_reconciliation_drift: 0,
};
const HISTOGRAM_BUCKETS = [50, 100, 250, 500, 1_000, 1_500, 3_000, 5_000];
type Histogram = { count: number; totalMs: number; buckets: number[] };
const durations = new Map<string, Histogram>();

export function log(
  level: "info" | "warn" | "error",
  event: string,
  fields: Record<string, unknown> = {}
) {
  const entry = JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    event,
    ...fields,
  });
  const writer =
    level === "error"
      ? console.error
      : level === "warn"
        ? console.warn
        : console.log;
  writer(entry);
}

export function incrementCounter(key: CounterKey) {
  counters[key]++;
}

export function observeDuration(operation: string, durationMs: number) {
  const current = durations.get(operation) ?? {
    count: 0,
    totalMs: 0,
    buckets: HISTOGRAM_BUCKETS.map(() => 0),
  };
  current.count++;
  current.totalMs += durationMs;
  HISTOGRAM_BUCKETS.forEach((bound, index) => {
    if (durationMs <= bound) current.buckets[index]++;
  });
  durations.set(operation, current);
}

export function requestObservability(): MiddlewareHandler<{
  Variables: RequestVariables;
}> {
  return async (context, next) => {
    const supplied = context.req.header("x-request-id");
    const requestId =
      supplied && /^[A-Za-z0-9._:-]{1,100}$/.test(supplied)
        ? supplied
        : crypto.randomUUID();
    context.set("requestId", requestId);
    context.header("x-request-id", requestId);
    const started = performance.now();
    incrementCounter("http_requests");
    try {
      await next();
    } finally {
      const durationMs = Math.round((performance.now() - started) * 100) / 100;
      observeDuration("http", durationMs);
      log("info", "http.request", {
        requestId,
        method: context.req.method,
        path: context.req.path,
        status: context.res.status,
        durationMs,
      });
    }
  };
}

export function renderPrometheusMetrics(queue: {
  pending: number;
  failed: number;
  oldestPendingAgeSeconds: number;
}) {
  const lines = [
    "# TYPE predent_http_requests_total counter",
    `predent_http_requests_total ${counters.http_requests}`,
    "# TYPE predent_trpc_requests_total counter",
    `predent_trpc_requests_total ${counters.trpc_requests}`,
    "# TYPE predent_trpc_errors_total counter",
    `predent_trpc_errors_total ${counters.trpc_errors}`,
    "# TYPE predent_outbox_completed_total counter",
    `predent_outbox_completed_total ${counters.outbox_completed}`,
    "# TYPE predent_outbox_failed_total counter",
    `predent_outbox_failed_total ${counters.outbox_failed}`,
    "# TYPE predent_push_delivered_total counter",
    `predent_push_delivered_total ${counters.push_delivered}`,
    "# TYPE predent_push_failed_total counter",
    `predent_push_failed_total ${counters.push_failed}`,
    "# TYPE predent_stripe_webhook_processed_total counter",
    `predent_stripe_webhook_processed_total ${counters.stripe_webhook_processed}`,
    "# TYPE predent_stripe_webhook_failed_total counter",
    `predent_stripe_webhook_failed_total ${counters.stripe_webhook_failed}`,
    "# TYPE predent_stripe_reconciliation_drift_total counter",
    `predent_stripe_reconciliation_drift_total ${counters.stripe_reconciliation_drift}`,
    "# TYPE predent_outbox_jobs gauge",
    `predent_outbox_jobs{status="pending"} ${queue.pending}`,
    `predent_outbox_jobs{status="failed"} ${queue.failed}`,
    "# TYPE predent_outbox_oldest_pending_age_seconds gauge",
    `predent_outbox_oldest_pending_age_seconds ${queue.oldestPendingAgeSeconds}`,
  ];
  for (const [operation, value] of durations) {
    const label = operation.replace(/[^A-Za-z0-9_.-]/g, "_");
    lines.push("# TYPE predent_operation_duration_ms histogram");
    HISTOGRAM_BUCKETS.forEach((bound, index) => {
      lines.push(
        `predent_operation_duration_ms_bucket{operation="${label}",le="${bound}"} ${value.buckets[index]}`
      );
    });
    lines.push(
      `predent_operation_duration_ms_bucket{operation="${label}",le="+Inf"} ${value.count}`,
      `predent_operation_duration_ms_count{operation="${label}"} ${value.count}`,
      `predent_operation_duration_ms_sum{operation="${label}"} ${value.totalMs}`
    );
  }
  return `${lines.join("\n")}\n`;
}
