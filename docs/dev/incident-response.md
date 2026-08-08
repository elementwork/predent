# Incident Response Runbook

> Last updated: 2026-08-08

## Severity and ownership

- **SEV-1:** security breach, incorrect paid access at scale, destructive data
  loss, or complete outage. Page immediately; assign incident commander,
  operations lead, communications lead, and scribe.
- **SEV-2:** major feature unavailable, sustained SLO burn, delayed billing or
  notification processing, or material performance degradation. Respond
  within 30 minutes.
- **SEV-3:** limited degradation with a workaround. Triage during business
  hours and assign an owner.

## First 15 minutes

1. Declare severity, open a timestamped incident channel/document, freeze
   unrelated deployments, and identify the last change.
2. Check liveness/readiness, request/error/latency metrics, structured logs by
   request ID, database/Redis health, outbox depth and dead letters, Stripe
   webhook failures, and provider status pages.
3. Reduce harm first: roll back the application, disable an affected OAuth or
   payment entry point, or stop a worker only when the action is scoped and
   reversible. Preserve logs and evidence.
4. Post an internal status every 30 minutes for SEV-1/2, including impact,
   mitigation, current hypothesis, and next update time.

## Security incidents

- Rotate the affected secret and invalidate sessions by incrementing affected
  users' `tokenVersion` (or all users if exposure is broad).
- Preserve audit logs and Stripe event IDs. Do not delete suspected malicious
  records before evidence is captured.
- Determine whether personal information was accessed and escalate notification
  obligations to legal/privacy counsel; this runbook does not decide statutory
  reporting requirements.
- For OAuth incidents, disable the provider credentials and callback until
  issuer, subject, and redirect-origin behavior are verified.

## Billing incidents

Treat Stripe as source of truth. Restore webhook delivery, then run the Admin
Dashboard billing audit without applying changes. Manually review unknown
prices and customers with multiple active subscriptions. Apply only the
deterministic corrections and retain the generated `admin_actions` audit log.

## Recovery and closure

Confirm user flows and SLO recovery, drain safe outbox retries, inspect dead
letters, and monitor for recurrence. Within two business days, write a
blameless review containing timeline, customer impact, root cause, detection
gap, contributing conditions, corrective actions with owners/dates, and
evidence that the actions were tested.
