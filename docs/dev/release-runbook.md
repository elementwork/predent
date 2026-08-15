# Release and Rollback Runbook

> Last updated: 2026-08-08

This is the release gate for Docker and Vercel production deployments. A
release owner and rollback owner must be named before deployment.

## Before release

1. Confirm the working tree contains only intended changes and review all
   migration SQL under `db/migrations/`.
2. Run `npm ci`, `npm run check`, `npm run lint`, `npm test`,
   `npm run test:frontend`, `npm run build`, `npm run audit:production`, and
   `npm run licenses:check`.
3. In a disposable PostgreSQL 16 database, run `npm run db:migrate`, the full
   DB-gated test suite with `TEST_DATABASE_URL`, and `npm run db:verify-plans`.
4. Run `npm run test:e2e` against the release build or preview environment.
5. Confirm production secrets, OAuth callback URLs, Stripe webhook endpoint,
   shared Redis rate limiting, metrics scraping, and alert routing.
6. Confirm a recent database backup or provider recovery point and record its
   timestamp. Never release an irreversible migration without a tested restore
   path.
7. The `Deploy Production` workflow runs only after the exact main-branch CI
   SHA passes. Configure the protected `production` GitHub environment with
   `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID` and require reviewer
   approval where appropriate.

## Deployment order

1. Put backward-compatible schema additions in production first. Avoid mixing
   destructive schema changes with the application release that stops using
   them; remove old columns in a later release.
2. Apply committed migrations once from the deployment job. Application
   startup intentionally does not run migrations.
3. Deploy the application artifact by immutable commit SHA/image digest.
4. Verify `/api/health/live`, `/api/health/ready`, login, one representative
   tRPC read, and Stripe webhook delivery.
5. Check error rate, p95 latency, database saturation, rate-limit failures,
   outbox depth/dead letters, and Stripe reconciliation drift for at least 15
   minutes.

Deploying the session hardening release invalidates legacy one-year sessions;
users may need to sign in again. Production sessions now use the
`__Host-predent_sid` cookie and expire after 30 days.

## Rollback

- Roll back application code to the last known-good immutable artifact.
- Prefer forward-fix migrations. Do not manually reverse a data migration in
  production unless its rollback was reviewed and tested on a restored copy.
- If a migration is not backward compatible, stop writes, restore the most
  recent recovery point into a new database, validate it, then switch the
  application connection. Follow the disaster-recovery runbook.
- Stripe is the billing source of truth. After webhook downtime or rollback,
  run the Admin Dashboard billing audit in dry-run mode, review unknown prices
  or multiple subscriptions, then explicitly apply safe drift corrections.
- Re-run smoke checks and record the rollback reason, data-loss window, and
  follow-up owner in the incident timeline.
- For Vercel, dispatch `Roll Back Production`; leave the deployment input blank
  for the immediately prior release or provide an eligible production URL.

## Session key rotation

1. Generate a new 32+ character secret and a new unique key ID.
2. Move the current key into `SESSION_PREVIOUS_SECRETS` as JSON, set
   `APP_SECRET` to the new value, and update `SESSION_KEY_ID` atomically.
3. Deploy and verify both new and existing sessions. Tokens with unknown key
   IDs are rejected.
4. After the 30-day maximum token lifetime plus clock tolerance, remove the old
   key. An emergency compromise response may remove it immediately and sign all
   users out.

## Release record

Record commit SHA/image digest, migration range, backup timestamp, release and
rollback owners, start/end time, smoke results, observed metrics, and any
follow-up issue. Link the record from the devlog.
