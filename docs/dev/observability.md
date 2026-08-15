# Observability, SLOs, and Alerting

PreDent emits newline-delimited JSON request/procedure logs and propagates an
`x-request-id` through HTTP and tRPC error responses. Do not log request bodies,
OAuth tokens, session cookies, email addresses, or outbox payloads.

## Endpoints

- `GET /api/health/live` checks that the process can serve requests.
- `GET /api/health/ready` performs a three-second PostgreSQL dependency check.
- `GET /api/metrics` returns Prometheus text and requires
  `Authorization: Bearer $METRICS_SECRET`.

Metrics include HTTP/tRPC request counters, internal tRPC failures, Prometheus
duration histograms, Stripe webhook outcomes, push delivery outcomes,
reconciliation drift, outbox delivery outcomes, pending/failed gauges, and the
oldest pending-job age.
Process counters are per instance; aggregate them in the monitoring backend.

## Service-level objectives

Measure over a rolling 28-day window:

| Signal                  | Objective                                          | Alerting                                                                               |
| ----------------------- | -------------------------------------------------- | -------------------------------------------------------------------------------------- |
| API availability        | 99.9% non-5xx responses, excluding liveness probes | Page when 5-minute burn is 14.4× or 1-hour burn is 6×                                  |
| Interactive API latency | 95% of tRPC calls under 500 ms; 99% under 1.5 s    | Warn at p95 >500 ms for 15 min; page at p99 >1.5 s for 15 min                          |
| Stripe webhooks         | 99.9% accepted/processed without 5xx               | Page on sustained failures or five failures in 10 min                                  |
| Notification delivery   | 99% completed within 5 min                         | Warn when pending jobs exceed 100 or oldest job exceeds 5 min; page on any failed jobs |
| Database readiness      | 99.95% successful checks                           | Page after three consecutive failures                                                  |

Import `ops/monitoring/grafana-dashboard.json` and
`ops/monitoring/prometheus-rules.yml` into the production monitoring stack.
Route JSON logs and Sentry events into the chosen provider, scrape metrics at
30–60 second intervals, and attach `requestId` to incident timelines. Dashboard
panels should cover request rate/error/latency, readiness, Stripe failures, and
outbox pending/failed counts. The outbox retries five times with exponential
backoff and treats exhausted jobs as a dead-letter queue; investigate and replay
those only after resolving the underlying cause.

## Deployment checks

1. Set a high-entropy `METRICS_SECRET` and restrict the route at the edge too.
2. Probe liveness without restart sensitivity and use readiness to remove an
   unhealthy instance from traffic.
3. Verify alert delivery in staging and quarterly thereafter.
4. Apply database migrations before starting workers.
5. On Vercel Pro or Enterprise, keep `/api/cron/outbox` on its five-minute
   schedule. Vercel Hobby only permits daily cron jobs and cannot meet the
   five-minute notification SLO; use a Pro plan or an external scheduler.
6. GitHub's `Production Uptime Monitor` probes readiness every five minutes and
   opens/updates an incident issue. Treat it as an independent availability
   check, not a replacement for metrics and paging.
