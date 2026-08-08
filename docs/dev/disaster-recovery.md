# Disaster Recovery Runbook

> Last updated: 2026-08-08

## Recovery objectives

Initial targets are **RTO 4 hours** and **RPO 24 hours** until measured restore
drills justify tighter objectives. Supabase plan capabilities and actual backup
retention must be verified in the production account; repository inspection
cannot confirm them.

## Backup requirements

- Enable managed PostgreSQL backups and point-in-time recovery where the plan
  supports it.
- Keep an encrypted off-provider logical backup on a documented retention
  schedule. Restrict restore credentials and audit access.
- Configuration and secrets need a separate inventory; source control is not a
  secret backup.
- Quarterly, restore into an isolated account/project and record restore time,
  recovery-point age, integrity checks, and owner sign-off.

## Restore procedure

1. Declare an incident and stop application writes if continued writes would
   worsen loss or divergence.
2. Select a recovery point before the corruption event. Restore into a new
   database; never overwrite the only remaining production copy.
3. Apply only migrations that belong after the restored snapshot and are known
   safe for that version.
4. Validate migration journal state, table counts, foreign-key/invariant checks,
   representative authenticated reads/writes, and critical query plans.
5. Reconcile external systems: Stripe entitlements, OAuth configuration,
   outbox/dead-letter jobs, email/push duplication risk, and scheduled tasks.
6. Switch `DATABASE_URL`, deploy the matching application artifact, run release
   smoke checks, and monitor before reopening writes.

Outbox replay can duplicate an external side effect if delivery succeeded but
the final database acknowledgement was lost. Confirm provider-side delivery or
idempotency before replaying dead letters. Stripe webhook events remain guarded
by their durable event ID log.

## Drill evidence

Store the date, backup identifier, isolated destination, measured RTO/RPO,
validation results, failures, and remediation owners in the operator record and
link it from the devlog. A backup without a successful restore drill is not a
verified recovery control.
