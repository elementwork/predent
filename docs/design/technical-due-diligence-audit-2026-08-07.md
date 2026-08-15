# PreDent Canada — Technical Due Diligence Audit

> Audit date: 2026-08-07
> Scope: repository and local engineering environment
> Audience: engineering and product leadership

## Executive assessment

PreDent Canada has a sensible modern foundation—React, Hono, tRPC,
Drizzle, PostgreSQL, Zod validation, OAuth PKCE, Stripe signature
verification, migrations, and route-level lazy loading—but it is not
production-ready for paid multi-provider use in its current state.

The highest-risk issue is a cross-provider OAuth identity collision that can
associate different providers with the same account. Paid entitlements are
also predominantly enforced in the browser, the public mock-exam endpoint
exposes answer keys, and Stripe state transitions are not transactional or
strictly validated.

The most important immediate actions are:

1. Correct OAuth identity keys.
2. Enforce entitlements and quotas server-side.
3. Stop returning mock-exam answers before submission.
4. Harden Stripe event processing.
5. Build a safe, complete CI test environment.

## Remediation progress

The report below is a point-in-time audit. Remediation began on 2026-08-07
after the report was published:

- F01: OAuth identities are now uniquely keyed and queried by
  `(provider, unionId)`; migration `0008_icy_jackpot.sql` removes the unsafe
  global subject constraint, and a cross-provider regression test was added.
- F02: `getEffectiveTier` is now the shared expiry-aware policy for the server
  and UI. Paid DAT, interview, mock-exam, and advanced PAT procedures use
  premium middleware, while PAT quota reservation and attempt insertion are
  atomic.
- F03: mock exams now start through an authenticated Premium mutation that
  returns no answer data. A signed, user-bound, two-hour exam token constrains
  server-side submission and grading.
- F04: Stripe price, plan, paid state, and subscription status are validated.
  Event claiming and entitlement changes now share one transaction; stale
  events and unrelated subscription deletions cannot overwrite current state,
  and lifetime access is downgrade-safe. Migration
  `0009_puzzling_centennial.sql` records entitlement event ordering. The Admin
  Billing tab now provides bounded, paginated dry-run reconciliation against
  Stripe, explicit confirmed corrections, multiple-subscription/unknown-price
  manual review, missing-webhook subscription discovery, and immutable admin
  audit records. Stripe v22 billing-period and invoice-parent fields are
  handled with backward compatibility for older webhook API versions.

- F05: tests no longer load `.env` or inherit the normal `DATABASE_URL`; an
  explicit `TEST_DATABASE_URL` is required, and frontend Vitest aliases were
  repaired. CI now provisions a disposable PostgreSQL 16 service, applies
  migrations, runs the DB integration suite with `TEST_DATABASE_URL`, and runs
  the frontend suite separately so neither can silently skip. Playwright smoke
  and accessibility gates run in CI against Chrome; visual baselines remain a
  separately reviewed, platform-specific suite and cannot auto-update in CI.
- F06: Sentry Replay now masks all text and blocks media; PostHog no longer
  receives user names or email addresses and resets identity on logout. Both
  services now remain uninitialized until explicit opt-in; users can decline
  or reopen Privacy Choices from the footer.
- F08: service-worker navigations now use network-first delivery with the
  cached app shell only as an offline fallback.
- F09: the multi-stage Docker runtime now matches Node 24, installs production
  dependencies only, runs as non-root `node`, exposes a liveness healthcheck,
  and is scanned with an immutable-action-pinned Trivy gate and image SBOM.
- F10: unused AWS S3, SendGrid, and Resend SDK dependencies were removed.
  Nano ID and the Hono Node adapter were upgraded to patched releases. CI now
  fails on high/critical production advisories and forbidden licenses,
  publishes dependency/container CycloneDX SBOMs, pins actions by commit SHA,
  and receives weekly Dependabot updates.
- F11: task-due email delivery now honors `emailTaskDue`.
- F22: targeted navigation, notification, range, and switch controls received
  accessible labels, state, and keyboard behavior.
- F23: Community, notifications, and Planner now consume bounded cursor pages;
  Community and Planner append subsequent pages without offset drift.
- F24: Node and Vercel share CSP, HSTS, frame/cross-origin, referrer, and
  permissions headers. Cookie-authenticated tRPC mutations require the trusted
  application Origin in production. OAuth and Stripe redirects use a validated
  HTTPS `PUBLIC_APP_URL`; sessions have issuer/audience/JTI, 30-day expiry, and
  a production `__Host-` cookie.
- F26: current setup and operator documentation no longer advertises unsupported
  SendGrid or obsolete one-year/in-memory-only controls. Release/rollback,
  incident response, disaster recovery, and dependency governance runbooks are
  now authoritative operator entry points.
- F07: production rate limiting now uses an atomic shared Redis REST store,
  fails closed when that store is unavailable or unconfigured, reads only
  platform/trusted-proxy client IP headers, and emits standard limit headers.
  An in-memory fallback requires an explicit production escape hatch.
- Follow-up items 1–16 are complete except the separately deferred PAT rewrite.
  Stripe lifecycle handling now covers subscription updates/pauses/resumes,
  payment failures, refunds, disputes, and lifetime reversals; the outbox drains
  every five minutes on supported Vercel plans and propagates push failures.
  Billing is isolated in a service with integration coverage and scheduled
  reconciliation. Public sitemap routes are build-time pre-rendered with route
  metadata. Admin collections now use cursor pages, authenticated Axe gates are
  part of CI, and push endpoints have provider/DNS/IP egress enforcement.
- Production operations now include histogram-backed SLO metrics, checked-in
  Prometheus alerts/Grafana dashboard, independent GitHub readiness monitoring,
  pool sizing, graceful shutdown, a capacity gate, reproducible deploy/manual
  rollback workflows, and an automated backup/restore drill. CSP no longer
  permits arbitrary HTTPS connections or external fonts, and sessions support
  explicit `kid`-based key rotation.

## Validation performed

| Check                               | Result                                                                                             |
| ----------------------------------- | -------------------------------------------------------------------------------------------------- |
| TypeScript                          | Passed                                                                                             |
| Production build                    | Passed                                                                                             |
| ESLint                              | Passed with 2 hook warnings                                                                        |
| Server tests without a real test DB | 32 passed, 108 skipped                                                                             |
| Default server test run             | 87 failed because test setup loaded the local DB configuration, which was unreachable              |
| Frontend tests                      | 51 passed, 3 failed because `@contracts` is missing from the frontend Vitest aliases               |
| Playwright smoke suite              | 17/17 passed                                                                                       |
| npm audit                           | 23 advisories: 13 high, 9 moderate, 1 low, 0 critical                                              |
| Bundle                              | Main JS 981 kB; School Detail chunk 423 kB                                                         |
| Secret heuristic scan               | No apparent production secret committed; the test fixture contains an intentional private test key |

### Post-remediation validation

| Check                                     | Result through 2026-08-14                                                                                                                     |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| TypeScript                                | Passed                                                                                                                                        |
| ESLint                                    | Passed with zero warnings                                                                                                                     |
| Server tests without `TEST_DATABASE_URL`  | 64 passed, 118 safely skipped; PostgreSQL-backed cases remain an enforced CI gate                                                             |
| Frontend tests                            | 57 passed                                                                                                                                     |
| Production build                          | Passed; bundle budgets passed at 586.5 kB initial, 25.9 kB School Detail, and 399.1 kB deferred chart                                         |
| Playwright accessibility/smoke/load gates | 32/32 passed, including six authenticated Axe routes and 200% zoom                                                                            |
| Production dependency audit               | Passed with 0 vulnerabilities after upgrading Nano ID and `@hono/node-server`                                                                 |
| Dependency license policy                 | Passed across 777 packages                                                                                                                    |
| Full dependency audit                     | Development-only moderate findings may remain in Drizzle Kit's legacy loader; it is excluded from production images and tracked by Dependabot |

Database-backed integration tests were intentionally not run locally because
no explicit disposable `TEST_DATABASE_URL`, PostgreSQL client, or container
runtime was available. CI provisions PostgreSQL 16, applies migrations 0000
through 0011 from an empty database, runs the DB-gated tests, and verifies query
plans. That CI gate must pass before production rollout.

Production infrastructure, live Supabase plans, real traffic, Vercel
settings, Stripe configuration, monitoring dashboards, and real query plans
were not available. Findings involving production load or cloud configuration
should be validated with deployment data and `EXPLAIN ANALYZE`.

## Audit scores

| Category                |  Score | Assessment                                                                                                                                             |
| ----------------------- | -----: | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Architecture            | 4.5/10 | Good technology choices, but routers combine transport, domain logic, persistence, and side effects.                                                   |
| Code Quality            | 5.5/10 | Strict TypeScript and generally readable code; several 500–1,100-line feature files and duplicated domain logic.                                       |
| Security                | 3.5/10 | Several good controls, but OAuth identity, entitlement enforcement, answer exposure, telemetry, and webhook integrity are material risks.              |
| Performance             | 5.0/10 | Route splitting exists, but client bundles, in-memory aggregation, synchronous fan-out, and missing composite indexes constrain growth.                |
| Database                | 4.5/10 | Foreign keys and migrations exist; business constraints, transactional boundaries, composite indexes, and time semantics need work.                    |
| API                     | 5.0/10 | tRPC and Zod give strong contracts; authorization, pagination, error semantics, and idempotency are inconsistent.                                      |
| Testing                 | 3.0/10 | Useful generator tests exist, but CI skips most database coverage and does not run frontend or E2E suites.                                             |
| DevOps & Infrastructure | 4.0/10 | Reproducible npm installs and Docker build exist; runtime mismatch, root execution, and weak release/rollback controls remain.                         |
| Observability           | 2.5/10 | Sentry and console logging exist, but no structured request telemetry, metrics, tracing, readiness, or alert definitions.                              |
| UI/UX                   | 5.5/10 | Broad, polished feature set; accessibility semantics, error states, theme consistency, SEO delivery, and account-specific onboarding need improvement. |
| Documentation           | 5.0/10 | Extensive documentation, but multiple sections contradict the implementation.                                                                          |
| Dependencies            | 3.5/10 | Lockfile present; current advisories, unused large dependencies, unpinned actions, and no automated dependency governance.                             |

## Prioritized findings

### F01 — OAuth identities are keyed without their provider

**Severity:** Critical
**Category:** Security, Architecture, Authentication

**Evidence:** `unionId` is globally unique in `db/schema.ts:31`. Users are
found and upserted solely by that value in `server/queries/users.ts:8` and
`server/queries/users.ts:35`. Authentication ignores the provider embedded in
the JWT when loading the user in `server/auth/auth.ts:35`.

**Why it matters:** OAuth subject identifiers are scoped to their
issuer/provider. Two providers can issue the same textual subject. A collision
would overwrite account provider/profile data and authenticate the second
identity as the existing account, potentially including an administrator.

**Recommendation:** Migrate to a composite unique key on
`(provider, unionId)`. Require both fields in all lookup, upsert, session, and
owner-elevation paths. Audit existing rows for collisions before migration.
Add cross-provider collision and owner-account regression tests.

**Estimated effort:** L

**Expected impact:** Eliminates an account-takeover class and makes
multi-provider identity behavior deterministic. Collision likelihood is
provider-dependent; inspecting production identifiers would quantify current
exposure.

### F02 — Paid features, expiry, and quotas are not authoritative on the server

**Severity:** High
**Category:** Security, API, Product Correctness

**Evidence:** Pricing marks DAT, interviews, analytics, and unlimited PAT as
paid in `src/pages/PricingPage.tsx:38`, while DAT requires only authentication
and interview questions are public in `server/dat-router.ts:63` and
`server/interview-router.ts:27`. PAT quota enforcement is only a disabled
browser button in `src/pages/PATPracticePage.tsx:324`; the mutation always
inserts and increments in `server/pat-router.ts:35`. `useTier` ignores
`premiumUntil` in `src/hooks/useTier.ts:9`. “Unlimited” plans are backed by
finite lifetime quotas of 360 and 1,080 in `contracts/tiers.ts:3`.

**Why it matters:** Users can bypass paid restrictions through direct API
calls. Expired accounts can retain access when webhook state is stale, while
legitimate customers can encounter limits inconsistent with advertised plans.

**Recommendation:** Add a centralized server-side entitlement service and
protected procedure builders. Derive effective access from billing status and
expiry, not raw tier alone. Atomically check and consume quotas. Define reset
periods and align them with pricing copy. Cover every paid procedure with
tier-matrix tests.

**Estimated effort:** XL

**Expected impact:** Closes revenue leakage, produces consistent subscription
behavior, and makes entitlement coverage measurable for every API procedure.

### F03 — The public mock-exam API returns its answer key before the exam

**Severity:** High
**Category:** Security, API, Product Correctness

**Evidence:** The public endpoint returns `correctAnswer` and `explanation` in
`server/dat-router.ts:34`. The browser downloads these before starting in
`src/pages/MockExamPage.tsx:99` and grades locally in
`src/pages/MockExamPage.tsx:278`.

**Why it matters:** Anyone can retrieve the entire exam answer set through
browser developer tools or the public API. This undermines assessment
integrity and exposes premium question-bank content.

**Recommendation:** Create an authenticated exam session that returns
question IDs, text, and options only. Submit answers to the server for grading,
then return explanations. Randomize the set server-side and record the session
and attempts.

**Estimated effort:** L

**Expected impact:** Prevents trivial answer extraction and makes mock-exam
analytics credible.

### F04 — Stripe entitlement changes are neither atomic nor strictly validated

**Severity:** High
**Category:** Security, Payments, Database

**Evidence:** The handler checks idempotency before processing but records the
event afterward in `server/app.ts:95` and `server/app.ts:189`. Unknown
subscription prices default to Premium in `server/app.ts:121`. Any successful
payment-mode checkout grants lifetime Plus without validating its price,
amount, or payment status in `server/app.ts:133`.

**Why it matters:** Concurrent deliveries can process twice. Misconfigured or
unexpected checkout sessions can grant incorrect access. Refunds, disputes,
failed invoices, and incomplete subscription states can leave database
entitlements inconsistent with Stripe.

**Recommendation:** Claim and process each event in a database transaction.
Reject unknown prices and validate mode, payment status, customer, amount,
currency, subscription, and user mapping. Store durable billing state and
handle failed, refunded, disputed, paused, and updated lifecycle events. Add a
reconciliation job against Stripe.

**Estimated effort:** XL

**Expected impact:** Makes billing state recoverable and auditable while
preventing incorrect upgrades and webhook races.

### F05 — CI’s test signal is incomplete and can target a developer database

**Severity:** High
**Category:** Testing, DevOps, Data Safety

**Evidence:** CI invokes only `npm test` in `.github/workflows/ci.yml:38`, which
is the server Vitest configuration. Frontend and E2E suites are separate
scripts in `package.json:14`. Test setup falls back to `.env` in
`vitest.setup.ts:3`. The frontend configuration lacks `@contracts` and `@db`
aliases in `vitest.config.frontend.ts:10`.

**Why it matters:** CI can pass while skipping most database behavior and
every frontend/E2E test. Locally, destructive database tests may connect to a
non-test database merely because `.env` exists.

**Recommendation:** Require an explicit `TEST_DATABASE_URL` whose database
name or marker is validated before tests run. Provision disposable PostgreSQL
in CI, migrate it, and run server, frontend, and critical Playwright suites.
Remove `.env` fallback, fix aliases, isolate test data, and add coverage
thresholds for auth, billing, permissions, and destructive operations.

**Estimated effort:** L

**Expected impact:** Turns CI into a release gate and removes the risk of
test-driven production/development data damage.

### F06 — Session replay and analytics can collect identifiable educational data

**Severity:** High
**Category:** Security, Privacy, Compliance

**Evidence:** Sentry Replay explicitly disables text masking and media
blocking, with 100% error replay sampling, in `src/lib/sentry.ts:9`. PostHog
persists identifiers in cookies/local storage in `src/lib/posthog-client.ts:6`
and transmits email and name in `src/providers/posthog.tsx:15`.

**Why it matters:** Profiles, GPA, tasks, application plans, community
content, and account details may be captured by third-party telemetry. No
consent or privacy-control mechanism was found.

**Recommendation:** Enable `maskAllText` and `blockAllMedia`; allowlist only
safe selectors. Remove email/name unless demonstrably required, add
consent-aware initialization, define retention and deletion behavior, and
scrub both client and server events.

**Estimated effort:** M

**Expected impact:** Materially reduces PII exposure and makes telemetry
behavior align with privacy disclosures and user consent.

### F07 — The rate limiter is ineffective across serverless or multi-instance deployments

**Severity:** High
**Category:** Security, Scalability, Reliability

**Evidence:** Limits are stored in a process-local `Map` in
`server/lib/rate-limit.ts:14`. The first `X-Forwarded-For` value is trusted
directly in `server/lib/rate-limit.ts:16`.

**Why it matters:** Limits reset on cold starts and are divided across
instances. Depending on proxy sanitization, clients may spoof the key.
Expensive operations, community spam, authentication endpoints, and
notification triggers remain susceptible to abuse.

**Recommendation:** Use a shared Redis/managed rate-limit store. Resolve
client IP only from trusted platform headers. Key authenticated traffic by
user and operation, define route-specific budgets, return standard limit
headers, and monitor rejected traffic.

**Estimated effort:** L

**Expected impact:** Provides consistent abuse protection across all
deployment modes and bounds expensive request volume.

### F08 — The service worker can permanently serve an obsolete deployment

**Severity:** High
**Category:** Reliability, Performance, UX

**Evidence:** The cache name is manually fixed to `predent-v2`, and
`/index.html` is precached in `public/sw.js:1`. All non-API GET requests use
cache-first behavior in `public/sw.js:24`.

**Why it matters:** Users can remain on an old `index.html` after deployment.
That HTML may reference hashed chunks that have already been removed,
resulting in broken or inconsistent clients until the cache name is manually
changed.

**Recommendation:** Generate a revisioned precache manifest during the build.
Use network-first behavior for navigations and cache-first only for immutable
hashed assets. Add update notification/reload handling and an E2E upgrade test
across two builds.

**Estimated effort:** M

**Expected impact:** Eliminates stale-release lock-in and substantially
reduces post-deployment blank-page failures.

### F09 — The production Docker image violates the declared runtime contract

**Severity:** High
**Category:** DevOps, Supply Chain

**Evidence:** The project requires Node 24 in `package.json:134`, but the
runtime stage uses Node 22 in `Dockerfile:18`. It copies the full development
`node_modules` tree in `Dockerfile:25` and runs as root.

**Why it matters:** Development and production execute on different major
runtimes. The image includes avoidable packages and vulnerabilities, has a
larger attack surface, and grants the process unnecessary privileges.

**Recommendation:** Pin the same Node 24 image by digest in both stages.
Install production-only dependencies or make the server bundle self-contained,
add a non-root user, remove obsolete SQLite build steps, and scan the resulting
image/SBOM in CI.

**Estimated effort:** M

**Expected impact:** Produces a smaller, reproducible, supported image and
reduces runtime and supply-chain risk.

### F10 — Current dependencies include known advisories and unused heavy packages

**Severity:** Medium
**Category:** Dependencies, Security, Maintainability

**Evidence:** Local `npm audit` reported 23 advisories. Direct packages
needing attention include Vite, Playwright, PostCSS, Hono, and
`@hono/node-server`. AWS S3 clients, SendGrid, and Resend are declared in
`package.json:30`, while no AWS use was found and email delivery uses raw
HTTP/stub code. CI actions use mutable version tags in
`.github/workflows/ci.yml:15`.

**Why it matters:** Unused packages expand installation time and attack
surface. Some advisories are build-only or React Server Component-specific and
may not be exploitable here, but the project has no process to document or
continuously reassess that conclusion.

**Recommendation:** Remove unused direct packages, patch
Vite/PostCSS/Playwright/Hono, document non-applicable advisories, add automated
dependency updates and audit/license/SBOM checks, and pin GitHub Actions by
commit SHA.

**Estimated effort:** M

**Expected impact:** Fewer transitive packages, faster installs, and a
continuously measurable vulnerability baseline.

### F11 — Task reminder emails ignore the user’s task-email preference

**Severity:** Medium
**Category:** Correctness, Privacy, Notifications

**Evidence:** The query selects only user ID and email in
`server/lib/tasks/notifications.ts:30`, then always requests email delivery in
`server/lib/tasks/notifications.ts:69`. The `emailTaskDue` preference exists in
`db/schema.ts:50`.

**Why it matters:** Users who opted out can still receive email, damaging
trust and potentially conflicting with anti-spam/privacy obligations.

**Recommendation:** Select and enforce `emailTaskDue`, separating in-app from
email delivery. Centralize preference evaluation so every email path uses the
same policy. Add opt-out regression tests.

**Estimated effort:** S

**Expected impact:** Makes task-email opt-out behavior reliable and directly
testable.

### F12 — Database constraints do not enforce important business invariants

**Severity:** Medium
**Category:** Database, Data Integrity

**Evidence:** `schoolStats` lacks uniqueness on school/year in
`db/schema.ts:175`. Reports allow both or neither target and lack reporter
uniqueness in `db/schema.ts:298`. Push endpoints are not unique in
`db/schema.ts:364`. Saved questions and flashcards lack unique
user/source/question keys in `db/schema.ts:422` and `db/schema.ts:444`.
Drizzle `varchar(..., { enum })` does not create PostgreSQL checks in the
committed migrations.

**Why it matters:** Concurrent requests can create duplicates and invalid
states even when application-level checks exist. Invalid answer indices,
negative times, duplicate reviews, and malformed reports can silently corrupt
analytics.

**Recommendation:** Add unique, check, and XOR constraints; add missing
foreign keys where a polymorphic model permits them; and migrate duplicates
before enabling constraints. Add composite indexes based on observed filters
and ordering.

**Estimated effort:** L

**Expected impact:** Moves correctness guarantees into PostgreSQL and removes
a broad class of race-condition defects.

### F13 — Multi-step state transitions lack transaction boundaries

**Severity:** Medium
**Category:** Architecture, Database, Correctness

**Evidence:** OAuth upsert and welcome-notification creation are separate
operations in `server/queries/users.ts:35`. Admin deletion and audit insertion
are separate in `server/admin-router.ts:166`. Reminder delivery and
`dueNotifiedAt` update are separate in
`server/lib/tasks/notifications.ts:69`.

**Why it matters:** Partial failure can leave a user created but login reported
as failed, a question deleted without an audit record, or reminders delivered
repeatedly.

**Recommendation:** Define transaction boundaries for database-only state
changes. For email/push/Stripe side effects, use an outbox with idempotency keys
and worker retries rather than holding a database transaction open across
network calls.

**Estimated effort:** L

**Expected impact:** Makes operations retryable and prevents partial-state and
duplicate-delivery incidents.

### F14 — Community reactions and moderation invariants are easy to abuse

**Severity:** Medium
**Category:** Security, Database, Product Correctness

**Evidence:** Every `likePost` call increments the counter and sends another
notification in `server/community-router.ts:527`. Reports use
check-then-insert without a database uniqueness constraint in
`server/community-router.ts:412`. Direct post lookup does not exclude
deleted/hidden posts in `server/community-router.ts:137`, and comments can be
added to them in `server/community-router.ts:347`.

**Why it matters:** One user can inflate engagement and repeatedly email
another user. Moderated content remains addressable and interactive, and
concurrent duplicate reports are possible.

**Recommendation:** Introduce a reaction table with unique
`(user_id, post_id)`, enforce report uniqueness/XOR constraints, filter
moderated content consistently, and add community-specific rate limits and
notification deduplication.

**Estimated effort:** L

**Expected impact:** Produces trustworthy engagement counts and makes
moderation actually remove content from normal user flows.

### F15 — Push-subscription ownership and endpoint validation are insufficient

**Severity:** Medium
**Category:** Security, Authorization, SSRF

**Evidence:** Subscribe and unsubscribe delete by endpoint without
constraining `userId` in `server/notification-router.ts:140` and
`server/notification-router.ts:161`. Endpoint validation is only `z.string()`
in `server/notification-router.ts:127`. The server later sends outbound
requests to stored endpoints in `server/lib/push.ts:25`.

**Why it matters:** A user who obtains another endpoint can remove or reassign
it. Arbitrary endpoints also create a potential authenticated SSRF/egress
surface, depending on `web-push` URL validation.

**Recommendation:** Include `userId` in ownership predicates, enforce a unique
endpoint, validate HTTPS URL/key formats and lengths, and reject private/local
destinations if the library does not. Test cross-user deletion and hostile
endpoint cases.

**Estimated effort:** M

**Expected impact:** Prevents cross-user subscription manipulation and narrows
the outbound network surface. Library behavior should be verified to determine
exact SSRF exploitability.

### F16 — Timestamp types mix calendar dates and instants without timezone semantics

**Severity:** Medium
**Category:** Database, Correctness

**Evidence:** User expiry, task due dates, attempts, and reminders use
PostgreSQL `timestamp` rather than timezone-aware timestamps throughout
`db/schema.ts:43` and `db/schema.ts:115`. Reminder formatting uses server-local
`toLocaleDateString` in `server/lib/tasks/notifications.ts:62`.

**Why it matters:** Server timezone, Supabase timezone, browser timezone, and
Toronto/user-local expectations can disagree, causing reminders or entitlement
expiry at the wrong time.

**Recommendation:** Classify each field as an instant, calendar date, or
user-local time. Use `timestamptz` for instants, `date` for date-only deadlines,
store the user timezone when needed, and explicitly format in that timezone.

**Estimated effort:** L

**Expected impact:** Removes environment-dependent date behavior and reduces
off-by-one-day reminder defects.

### F17 — Analytics and list APIs load excessive rows into application memory

**Severity:** Medium
**Category:** Performance, Database, Scalability

**Evidence:** PAT stats load and aggregate up to 1,000 attempts in JavaScript,
while score prediction loads every attempt in `server/pat-router.ts:94` and
`server/pat-router.ts:136`. Interview sampling loads all matching questions and
performs a biased JavaScript sort in `server/interview-router.ts:67`. Task
listing is unbounded in `server/task-router.ts:31`.

**Why it matters:** Latency and memory grow with each user’s history and the
question bank. Separate single-column indexes do not optimally serve common
user/order/filter combinations.

**Recommendation:** Perform counts, averages, category grouping, and recent
windows in SQL. Paginate task/history APIs, bound prediction windows, replace
random sorting with database sampling or deterministic selection, and add
composite indexes verified with `EXPLAIN ANALYZE`.

**Estimated effort:** L

**Expected impact:** Keeps query cost bounded and reduces API memory/latency as
histories grow.

### F18 — Email and push fan-out blocks user-facing requests

**Severity:** Medium
**Category:** Architecture, Performance, Reliability

**Evidence:** Creating a community post can sequentially send up to 20
notifications/emails before returning in `server/community-router.ts:239`.
Push subscriptions are also processed sequentially in
`server/lib/push.ts:25`.

**Why it matters:** Third-party latency directly increases API response time
and raises timeout risk. A transient provider outage slows normal community
writes.

**Recommendation:** Persist notification jobs in an outbox and process them
asynchronously with bounded concurrency, retry/backoff, dead-letter handling,
and idempotency keys.

**Estimated effort:** XL

**Expected impact:** Decouples interactive latency from email/push providers
and gives reliable delivery metrics and retry behavior.

### F19 — Initial and feature bundles are too large

**Severity:** Medium
**Category:** Performance, Frontend

**Evidence:** The production build generated a 981 kB main chunk and a 423 kB
School Detail chunk. Landing is eagerly imported in `src/App.tsx:5`, while
School Detail imports Recharts at module load in
`src/pages/SchoolDetailPage.tsx:34`. Replay, analytics, animation, school data,
and navigation functionality are globally initialized.

**Why it matters:** Parsing more than 1 MB of JavaScript slows first
interaction on mobile devices. The chart dependency dominates a page chunk
even when the chart is below the fold.

**Recommendation:** Lazy-load Landing, telemetry/replay, search data, and the
School Detail chart. Dynamically import Recharts only when visible. Inspect
bundle composition, set chunk budgets in CI, and self-host/preload the required
font subsets.

**Estimated effort:** L

**Expected impact:** A realistic target is a 40–60% reduction in initial
JavaScript and a substantially smaller School Detail entry cost.

### F20 — Large feature modules and duplicated PAT logic weaken architecture boundaries

**Severity:** Medium
**Category:** Architecture, Code Quality, Maintainability

**Evidence:** Landing, Community, PAT Practice, Interview, and Mock Exam pages
range from roughly 700 to 1,179 lines. Routers such as
`server/community-router.ts` combine validation, persistence, authorization,
notification policy, and external effects. PAT generation is implemented
separately under both `src/components/pat-generators/logic` and
`server/lib/pat-generation`. Frontend planner components import database row
types directly in `src/components/planner/CalendarView.tsx:6`.

**Why it matters:** Business rules are difficult to test independently,
frontend/backend generator behavior can drift, and database changes leak into
UI code.

**Recommendation:** Organize by feature with explicit application services,
repositories, policy modules, and contract DTOs. Extract PAT generation into a
shared pure package with client/server parity tests. Split large pages into
controller hooks and presentation sections.

**Estimated effort:** XL

**Expected impact:** Reduces change blast radius, improves testability, and
prevents client/server grading divergence.

### F21 — Observability cannot explain production failures or service health

**Severity:** Medium
**Category:** Observability, SRE

**Evidence:** Server instrumentation captures only uncaught middleware
exceptions in `server/lib/sentry.ts:16`. Scheduler failures use console logging
in `server/lib/tasks/notifications.ts:99`. No structured logger, request ID,
metrics endpoint, tracing propagation, database readiness check, SLO, or alert
definitions were found.

**Why it matters:** Many tRPC errors may be serialized before reaching the
Hono exception middleware. Operators cannot reliably distinguish application
errors, provider failures, database saturation, slow procedures, or reminder
backlog.

**Recommendation:** Add structured JSON logs with correlation IDs and
user-safe context; instrument tRPC procedures, database latency, queues, OAuth,
and Stripe; add liveness and dependency readiness endpoints; define SLOs and
alerts for error rate, latency, webhook failures, and job backlog.

**Estimated effort:** XL

**Expected impact:** Reduces incident detection and diagnosis time and makes
production readiness objectively measurable.

### F22 — Several interactive controls lack keyboard and assistive semantics

**Severity:** Medium
**Category:** UI/UX, Accessibility

**Evidence:** Notification rows are clickable `<div>` elements with no
keyboard role or focus behavior in `src/components/NotificationBell.tsx:104`.
The popup lacks menu/dialog focus and Escape management in
`src/components/NotificationBell.tsx:72`. The mobile menu button lacks an
accessible label/state in `src/components/Navbar.tsx:247`. The PAT toggle has
no switch semantics, and its range lacks a programmatic label in
`src/pages/PATPracticePage.tsx:285`. A skip link/main landmark is implemented
only inside Landing at `src/pages/LandingPage.tsx:1145`.

**Why it matters:** Keyboard and screen-reader users cannot operate or
understand core navigation and notification controls consistently.

**Recommendation:** Use semantic buttons/links or Radix primitives, implement
focus trapping/restoration and Escape handling, add `aria-expanded`,
`aria-controls`, `aria-pressed`/switch semantics, label range controls, and put
the skip link and `<main id="main-content">` in the application shell. Add
automated axe checks plus manual keyboard testing.

**Estimated effort:** L

**Expected impact:** Resolves multiple WCAG 2.1 AA interaction failures and
creates reusable accessible patterns.

### F23 — API behavior is inconsistent around pagination, errors, and mutation outcomes

**Severity:** Medium
**Category:** API, Maintainability

**Evidence:** Flashcard procedures throw generic errors rather than typed tRPC
errors in `server/flashcard-router.ts:323`. Several updates/deletes return
success without verifying that a row changed, such as
`server/admin-router.ts:166`. Interview questions return the full matching
collection in `server/interview-router.ts:27`, while growing resources
primarily use offset rather than cursor pagination.

**Why it matters:** Clients cannot reliably distinguish validation,
missing-resource, conflict, and server failures. Unbounded or offset lists
become slow and inconsistent under concurrent inserts.

**Recommendation:** Define API error codes and mutation-result conventions,
check affected row counts, add cursor pagination to growing feeds/history, cap
all array inputs such as DAT exclusion lists, and publish a procedure-level
authorization/entitlement matrix. Version incompatible external HTTP endpoints
if introduced.

**Estimated effort:** L

**Expected impact:** Predictable client behavior, bounded requests, and fewer
silent-success defects.

### F24 — Security headers and session hardening differ by deployment mode

**Severity:** Medium
**Category:** Security, Infrastructure

**Evidence:** Vercel defines basic headers but lacks CSP and HSTS in
`vercel.json:11`. The Node/Hono deployment does not apply the same header
policy. Sessions last one year and lack explicit issuer/audience claims in
`server/auth/session.ts:7`. OAuth callback origin is derived from the incoming
request in `server/auth/auth.ts:57`.

**Why it matters:** Docker deployments have weaker browser defenses than
Vercel. Host/proxy configuration can influence OAuth callback construction,
and long-lived bearer cookies increase exposure after theft.

**Recommendation:** Apply one Hono security-header policy in all deployments,
including CSP, HSTS, and cross-origin policies. Build callback URLs from an
allowlisted `PUBLIC_APP_URL`. Add issuer/audience/JTI, consider shorter rotating
sessions, use `__Host-` cookies, and validate Origin on cookie-authenticated
mutations.

**Estimated effort:** M

**Expected impact:** Consistent browser hardening and reduced session/callback
misconfiguration risk across deployment targets.

### F25 — SEO-focused content is delivered as a generic client-only SPA

**Severity:** Medium
**Category:** UI/UX, Performance, Product

**Evidence:** All routes are rewritten to one HTML document in
`vercel.json:7`. That document has one canonical URL and one metadata set in
`index.html:10`. SEO pages are rendered only after JavaScript route loading in
`src/App.tsx:97`.

**Why it matters:** School and guide pages can have incorrect canonical/social
metadata and weaker crawler rendering. Users see no meaningful route content
until the application bundle executes.

**Recommendation:** Pre-render or server-render public school/guide/article
routes, generate per-route canonical/OpenGraph/structured data, and generate
the sitemap from the same route/content source.

**Estimated effort:** XL

**Expected impact:** Improves discoverability, social previews, crawl
reliability, and content-page first render.

### F26 — Documentation materially contradicts runtime behavior

**Severity:** Medium
**Category:** Documentation, Developer Experience

**Evidence:** README advertises SendGrid in `README.md:18`, but its provider is
not implemented. AGENTS describes Google-only authentication despite eight
providers and contains obsolete limitations. Docker comments still reference
`better-sqlite3` in `Dockerfile:4`. The devlog contains historical SQLite/MySQL
guidance interleaved with current operations.

**Why it matters:** Operators may configure a nonfunctional email provider or
follow obsolete architecture assumptions. New contributors cannot confidently
distinguish current behavior from history.

**Recommendation:** Make README and operator docs authoritative for the
current release, mark historical plans as archived, document the true provider
matrix and unsupported SendGrid state, add architecture and entitlement
diagrams, and provide migration, rollback, incident, and test-environment
runbooks.

**Estimated effort:** M

**Expected impact:** Reduces onboarding time and prevents
deployment/configuration mistakes.

## Positive controls observed

- Broad use of Zod procedure validation.
- Drizzle query builders rather than string-built SQL; no confirmed production
  SQL injection.
- React escaping and no unsafe community-content HTML rendering; no confirmed
  production DOM XSS.
- OAuth state and PKCE cookies are implemented.
- Session cookies are HTTP-only, Secure outside localhost, and SameSite Lax.
- Session revocation uses `tokenVersion`.
- Stripe signatures are verified before event handling.
- Admin procedures have a dedicated role guard.
- Most user-owned mutations include user ownership predicates.
- Migrations and the npm lockfile are committed.
- Strict TypeScript, route-level lazy loading, reduced-motion support, and a
  global error boundary are present.
- No production command-injection path was identified.

## Overall scores

1. **Overall Architecture Score:** 4.5/10
2. **Overall Code Health Score:** 4.8/10
3. **Overall Security Score:** 3.5/10
4. **Overall Performance Score:** 5.0/10
5. **Overall Maintainability Score:** 4.5/10
6. **Overall Production Readiness Score:** 3.8/10

## Prioritized roadmap

### Immediate — today

- Disable non-Google OAuth providers or patch identity lookup to include
  provider immediately.
- Make mock-exam questions authenticated and stop returning answer fields.
- Add temporary server-side tier checks around all advertised paid procedures.
- Enable Sentry masking/blocking and stop sending name/email to analytics.
- Enforce `emailTaskDue`.
- Fix frontend Vitest aliases and remove `.env` fallback from tests.
- Change service-worker navigation handling to network-first.
- Reject unknown Stripe prices rather than defaulting to Premium.

### Short term — this week

- Migrate users to `(provider, unionId)`.
- Implement a server-side entitlement policy with expiry checks and atomic
  quota consumption.
- Make Stripe processing transactional and cover the full subscription
  lifecycle.
- Provision disposable PostgreSQL and run server/frontend/E2E suites in CI.
- Fix Docker Node/runtime mismatch and run as non-root.
- Add distributed rate limiting.
- Add push-subscription ownership and endpoint validation.
- Patch/remove vulnerable and unused dependencies.
- Add core database uniqueness and check constraints.

### Medium term — this month

- [x] Introduce application services, repositories, and an outbox/worker.
- [x] Move analytics aggregation into SQL and add measured composite indexes.
- [x] Implement exam sessions and server-side grading.
- [x] Replace community like counters with a reaction model.
- [x] Standardize API errors and cursor pagination.
- [x] Add structured logging, request IDs, metrics, readiness, SLOs, and alerts.
- [x] Complete a WCAG keyboard/screen-reader pass.
- [x] Reduce initial and School Detail bundle sizes.
- [x] Normalize timestamp and user-timezone handling.

Completed in the post-audit remediation batch. Migrations 0010–0011 add
timezone-aware instants, integrity constraints, composite indexes, reactions,
notification deduplication, and the transactional outbox. CI now uses
`EXPLAIN (ANALYZE, BUFFERS)` fixtures to verify the three critical composite
indexes. Core PAT/DAT aggregates execute in SQL; growing resources expose
cursor pages; error envelopes include correlation IDs and validation details.
Production operations now have JSON logs, health/readiness, protected metrics,
queue retry/dead-letter behavior, and documented SLO/alert thresholds.

The initial entry decreased from approximately 984 kB to 586 kB (40%), while
the School Detail route decreased from 423 kB to approximately 26 kB; the
399 kB Recharts chunk is fetched only near its viewport. CI enforces these
budgets. Axe checks across five public flows plus keyboard navigation tests pass
with no serious or critical findings. Dates are classified as PostgreSQL
`date` or `timestamptz`, and reminder formatting uses each user's validated IANA
timezone.

Verification on 2026-08-07: TypeScript and ESLint passed; 46 server tests and
57 frontend tests passed; the production build met all three bundle budgets;
and all 72 Playwright accessibility, smoke, and visual tests passed. The
database-gated suite and `EXPLAIN (ANALYZE, BUFFERS)` checks require a disposable
PostgreSQL URL and are configured to run in CI rather than locally executed.

### Long term

- [x] Pre-render public content routes at build time.
- Extract PAT generation into a shared deterministic domain package.
- [x] Build billing reconciliation and entitlement audit tooling.
- [x] Establish dependency governance and SBOM generation.
- [x] Add release, rollback, incident, and disaster-recovery runbooks.
- [x] Automate production deployment/rollback and synthetic restore drills.
- [x] Add measured SLO histograms, alerts, dashboard, uptime probes, load and
      database-capacity gates.
- Run representative load tests and production SLO reviews.
- Execute and record the first quarterly disaster-recovery restore drill.

PAT generation/package work is explicitly deferred for a planned rewrite and
was not changed in this closeout batch.

## Top 10 highest-impact issues

1. F01 — Cross-provider OAuth identity collision.
2. F02 — Server-side entitlement and expiry bypass.
3. F04 — Non-atomic and permissive Stripe processing.
4. F03 — Public mock-exam answer exposure.
5. F05 — Unsafe and incomplete test/CI environment.
6. F06 — Unmasked session replay and identifiable analytics.
7. F07 — Non-distributed/spoofable rate limiting.
8. F08 — Service worker can pin broken deployments.
9. F09 — Unsupported Docker runtime and oversized root image.
10. F12 — Missing database integrity constraints.

## Top 10 easiest wins

1. Enforce `emailTaskDue` before sending email — S.
2. Add missing frontend Vitest aliases — XS.
3. Stop test setup from reading `.env` — XS.
4. Mask Sentry Replay text and block media — XS.
5. Remove email/name from PostHog identity properties — XS.
6. Reject unknown Stripe price IDs — S.
7. Make service-worker navigations network-first — S.
8. Align Docker runtime to Node 24 and add a non-root user — S.
9. Add accessible labels/states to mobile menu and switches — S.
10. Remove unused AWS/SendGrid/Resend dependencies — S.

## Top 10 technical debt items

1. Routers combine transport, business rules, persistence, and side effects.
2. Client and server PAT generation implementations are duplicated.
3. Several frontend pages exceed 700–1,100 lines.
4. Database row types leak directly into frontend components.
5. Analytics are aggregated in application memory.
6. Notification delivery has no outbox or worker.
7. API errors and mutation outcomes are inconsistent.
8. Database invariants rely on application-level check-then-insert logic.
9. Timezone/date semantics are unspecified.
10. Documentation mixes current architecture with obsolete implementation
    history.

## Top 10 security risks

1. Provider-less OAuth identity key.
2. Client-only paid entitlement enforcement.
3. Public mock-exam answer keys.
4. Permissive/non-atomic Stripe entitlement changes.
5. Unmasked Sentry Replay.
6. Shared analytics identifiers without consent controls.
7. Process-local and potentially spoofable rate limiting.
8. Cross-user push-subscription deletion/reassignment.
9. Arbitrary push endpoint egress.
10. Missing CSP/HSTS/origin validation and deployment-specific header gaps.

## Top 10 performance opportunities

1. Lazy-load Landing and telemetry integrations.
2. Dynamically load the Recharts School Detail section.
3. Replace PAT in-memory aggregation with SQL aggregates.
4. Bound score-prediction history.
5. Paginate task and history APIs.
6. Add composite user/filter/order indexes.
7. Replace interview full-table shuffle with database/deterministic sampling.
8. Move community email/push fan-out to a worker.
9. Generate a revisioned immutable-asset service-worker manifest.
10. Self-host and subset fonts instead of blocking on Google Fonts.
