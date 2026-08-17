# PreDent Canada — Admin Guide

This guide covers how to set up, deploy, and operate the PreDent Canada platform. It is intended for administrators, DevOps engineers, and content managers.

> Last updated: 2026-08-08

> **New to PreDent?** Start with the [Step-by-Step Setup Guide](./setup-guide.md) for a complete walkthrough from zero to production.

## Table of Contents

1. [Environment Setup](#environment-setup)
2. [Local Development](#local-development)
3. [Database Management](#database-management)
4. [Authentication & Admin Access](#authentication--admin-access)
5. [Deployment](#deployment)
6. [Content Management](#content-management)
7. [Email & Notifications](#email--notifications)
8. [Monitoring & Health Checks](#monitoring--health-checks)
9. [Backup & Recovery](#backup--recovery)
10. [Troubleshooting](#troubleshooting)

---

## Environment Setup

Create a `.env` file in the project root. Required and common optional variables:

```env
# ── Backend ─────────────────────────────────────────────────────
APP_SECRET=               # Strong random secret for signing session JWTs

# ── Database ───────────────────────────────────────────────────
DATABASE_URL=             # Supabase PostgreSQL connection string
                          # e.g. postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres

# ── Distributed rate limiting (required in production) ─────────
UPSTASH_REDIS_REST_URL=    # Shared Redis REST endpoint
UPSTASH_REDIS_REST_TOKEN=  # Shared Redis REST bearer token
RATE_LIMIT_ALLOW_IN_MEMORY=false # Retained for explicit local-only operation; the runtime falls back automatically when Redis is unavailable
TRUST_PROXY=false          # Only for a controlled proxy that sanitizes XFF
TRUST_CLOUDFLARE_PROXY=false # Only when Cloudflare directly fronts the origin

# ── Google OAuth ────────────────────────────────────────────────
VITE_GOOGLE_CLIENT_ID=    # Browser-facing Google OAuth client ID
GOOGLE_CLIENT_ID=         # Same Google OAuth client ID (backend)
GOOGLE_CLIENT_SECRET=     # Google OAuth client secret

# ── Apple Sign In ───────────────────────────────────────────────
APPLE_CLIENT_ID=          # Apple Services ID (e.g. com.example.predent)
APPLE_TEAM_ID=            # Apple Team ID (10 characters)
APPLE_KEY_ID=             # Apple private key ID
APPLE_PRIVATE_KEY=        # PEM-encoded Apple private key

# ── Microsoft Entra ID ──────────────────────────────────────────
MICROSOFT_TENANT=common   # Entra tenant ID or "common" for personal accounts
MICROSOFT_CLIENT_ID=      # Microsoft app client ID
MICROSOFT_CLIENT_SECRET=  # Microsoft app client secret

# ── LinkedIn OAuth 2.0 ──────────────────────────────────────────
LINKEDIN_CLIENT_ID=       # LinkedIn app client ID
LINKEDIN_CLIENT_SECRET=   # LinkedIn app client secret

# ── Facebook Login ──────────────────────────────────────────────
FACEBOOK_CLIENT_ID=       # Facebook app ID
FACEBOOK_CLIENT_SECRET=   # Facebook app secret

# ── X (Twitter) OAuth 2.0 ───────────────────────────────────────
X_CLIENT_ID=              # X OAuth 2.0 client ID
X_CLIENT_SECRET=          # X OAuth 2.0 client secret

# ── Discord OAuth 2.0 ───────────────────────────────────────────
DISCORD_CLIENT_ID=        # Discord app client ID
DISCORD_CLIENT_SECRET=    # Discord app client secret

# ── Instagram OAuth ─────────────────────────────────────────────
INSTAGRAM_CLIENT_ID=      # Instagram app client ID
INSTAGRAM_CLIENT_SECRET=  # Instagram app client secret

# ── Admin Role ──────────────────────────────────────────────────
OWNER_UNION_ID=           # OAuth "sub"/id of the app creator; gets role "admin" on first login

# ── Payments (Stripe) ──────────────────────────────────────────
STRIPE_SECRET_KEY=        # sk_test_... or sk_live_...
STRIPE_WEBHOOK_SECRET=    # whsec_... for webhook signature verification
STRIPE_PRICE_PREMIUM_MONTHLY=     # price_... for $39/mo Premium plan
STRIPE_PRICE_PREMIUM_3MONTH=      # price_... for $99 one-time 3-Month window
STRIPE_PRICE_PREMIUM_YEARLY=      # price_... for $249/yr Premium plan
STRIPE_PRICE_UPGRADE_MONTHLY_TO_3MONTH=   # price_... top-up ($60)
STRIPE_PRICE_UPGRADE_MONTHLY_TO_YEARLY=   # price_... top-up ($210)
STRIPE_PRICE_UPGRADE_3MONTH_TO_YEARLY=    # price_... top-up ($150)

# ── Email / Notifications ───────────────────────────────────────
EMAIL_PROVIDER=           # "console" (default) or "resend"; SendGrid is unsupported
EMAIL_FROM=               # Sender address (e.g. noreply@predent.vercel.app)
RESEND_API_KEY=           # re_... (required when EMAIL_PROVIDER=resend)
PUBLIC_APP_URL=           # Public origin for links (e.g. https://predent.vercel.app)

# ── Vercel Cron ─────────────────────────────────────────────────
CRON_SECRET=              # Random secret Vercel sends for cron auth
METRICS_SECRET=           # Bearer token protecting /api/metrics
```

### OAuth Redirect URI

All OAuth providers use the **same callback URL**:

- Local: `http://localhost:3000/api/oauth/callback`
- Production: `https://your-domain.com/api/oauth/callback`

You must register this URI in every provider console you enable. The backend route is `GET /api/oauth/callback`; the authorize route is `GET /api/oauth/authorize/:provider`.

### Google OAuth Configuration

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create or select a project, then navigate to **APIs & Services → Credentials**.
3. Click **Create Credentials → OAuth client ID**.
4. Configure the consent screen if prompted.
5. For the application type, choose **Web application**.
6. Add authorized JavaScript origins:
   - `http://localhost:3000` (local)
   - `https://your-domain.com` (production)
7. Add authorized redirect URIs:
   - `http://localhost:3000/api/oauth/callback`
   - `https://your-domain.com/api/oauth/callback`
8. Copy the **Client ID** and **Client Secret** into `.env`.

### Apple Sign In Configuration

1. Go to the [Apple Developer Portal](https://developer.apple.com/).
2. Create a **Services ID** (e.g. `com.yourteam.predent`) and enable **Sign in with Apple**.
3. Configure the web domain and redirect URI.
4. Go to **Certificates, Identifiers & Profiles → Keys** and create a **Sign in with Apple private key**.
5. Note the **Key ID** and **Team ID**.
6. Download the `.p8` private key and paste its contents into `APPLE_PRIVATE_KEY`.
7. Copy **Services ID**, **Team ID**, and **Key ID** into `.env`.

### Microsoft Entra ID Configuration

1. Go to [Microsoft Entra admin center](https://entra.microsoft.com/) → **App registrations**.
2. Click **New registration**.
3. Set **Supported account types** to:
   - _Accounts in any organizational directory and personal Microsoft accounts_ (recommended)
4. Add a **Web** platform redirect URI:
   - `https://your-domain.com/api/oauth/callback`
5. Create a **Client secret** and note the **Application (client) ID**.
6. Copy **Client ID**, **Client secret**, and tenant (use `common` for personal accounts) into `.env`.

### LinkedIn OAuth Configuration

1. Go to [LinkedIn Developers](https://developer.linkedin.com/) and create an app.
2. Under **Products**, add **Sign In with LinkedIn using OpenID Connect**.
3. Under **Auth**, add the redirect URI:
   - `https://your-domain.com/api/oauth/callback`
4. Copy the **Client ID** and **Client Secret** into `.env`.

### Facebook Login Configuration

1. Go to [Meta for Developers](https://developers.facebook.com/) and create an app.
2. Add the **Facebook Login** product.
3. Under **Settings → Valid OAuth Redirect URIs**, add:
   - `https://your-domain.com/api/oauth/callback`
4. Copy the **App ID** and **App Secret** into `.env`.

### X (Twitter) OAuth Configuration

1. Go to the [X Developer Portal](https://developer.x.com/) and create a project/app.
2. Enable **OAuth 2.0** in the app settings.
3. Set the callback URI to:
   - `https://your-domain.com/api/oauth/callback`
4. Copy the **Client ID** and **Client Secret** into `.env`.

### Discord OAuth Configuration

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications) and create an application.
2. Navigate to **OAuth2 → General**.
3. Add the redirect URI:
   - `https://your-domain.com/api/oauth/callback`
4. Copy the **Client ID** and **Client Secret** into `.env`.

### Instagram Basic Display / Instagram Login Configuration

Instagram Login is configured through the Meta/Facebook developer portal:

1. Go to [Meta for Developers](https://developers.facebook.com/) and create an app.
2. Add the **Instagram Basic Display** product.
3. Under **User Token Generator** or **Basic Display → Settings**, add the redirect URI:
   - `https://your-domain.com/api/oauth/callback`
4. Copy the **Instagram App ID** and **App Secret** into `.env`.

### Admin Access

The first user whose `unionId` matches `OWNER_UNION_ID` is automatically promoted to `admin` on login. The value is the provider-specific identifier (e.g. Google `sub`, Apple `sub`, Microsoft `id`). After that first login, you can also promote users from the Admin Dashboard or directly via SQL.

---

## Local Development

```bash
npm install
npm run db:migrate
npm run db:seed:dat:full
npm run dev
```

The Vite dev server starts on port `3000`. The backend Hono app is mounted under `/api/*`.

Run the production build locally:

```bash
npm run build
npm start
```

---

## Database Management

### Generate Migrations

After changing `db/schema.ts`:

```bash
npm run db:generate
```

### Apply Migrations

```bash
npm run db:migrate
```

### Seed Data

PAT questions are generated on the fly from numeric seeds (seeded PRNG) — there is no `pat_questions` table and nothing to seed for PAT.

Seed DAT questions (500 questions: 200 bio + 200 chem + 100 RC):

```bash
npm run db:seed:dat:full
```

Seed interview questions (24 questions: 14 panel + 10 MMI):

```bash
npm run db:seed:interview
```

> Seeding is additive. Run once for a fresh database, or write idempotent seed logic for production refreshes.

### Inspect Database

Connect via any PostgreSQL client, for example:

```bash
psql "postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres"

SELECT COUNT(*) FROM pat_attempts;
SELECT COUNT(*) FROM dat_questions;
SELECT COUNT(*) FROM users;
```

### Common Maintenance Queries

Promote a user to admin:

```sql
UPDATE users SET role = 'admin' WHERE unionId = 'google-sub-id';
```

Change a user's tier:

```sql
UPDATE users SET tier = 'premium' WHERE unionId = 'google-sub-id';
```

---

## Authentication & Admin Access

- Users sign in via OAuth 2.0. Supported providers: Google, Apple, Microsoft, LinkedIn, Facebook, X (Twitter), Discord, Instagram.
- Session tokens are signed HS256 JWTs stored in the `predent_sid` cookie.
- The `OWNER_UNION_ID` env variable grants admin on first login.
- After the first admin exists, additional admins can be promoted from **Admin Dashboard → Users** or via SQL.

### Provider Enable/Disable Behavior

Providers appear on the Login page automatically when their client ID/secret are configured. If a provider's credentials are missing, the backend returns `provider_not_configured` and redirects back to `/login?error=provider_not_configured`.

### Admin Dashboard Features

The admin dashboard (`/admin`) provides:

- Platform stats (users, PAT/DAT questions, attempts).
- User listing and role management.
- PAT/DAT question listing and deletion.
- Manual DAT question seeding.
- Manual task due-date reminder dispatch.
- Dry-run and confirmed Stripe entitlement reconciliation with an immutable
  admin audit record for applied corrections.

### Billing Reconciliation

Open **Admin → Billing** and run **Audit Stripe** first. The audit compares
local paid/customer records with Stripe using bounded concurrency. It discovers
active subscriptions from a stored customer ID when a webhook did not attach
the subscription locally. Unknown prices and multiple active subscriptions are
always flagged for manual review and are never changed automatically.

After reviewing the full result set, use the explicit confirmation control to
apply deterministic drift corrections. Every applied user change is written to
`admin_actions` with previous and recommended state. Run this after webhook
outages, Stripe price changes, restores, and before/after billing migrations.

---

## Deployment

### Docker (Recommended)

Build and start:

```bash
npm run docker:build
npm run docker:up
```

Stop:

```bash
npm run docker:down
```

The app is available on port `3000`. Set `DATABASE_URL` in `.env` to your Supabase PostgreSQL connection string.

### Manual Deployment

```bash
npm ci
npm run build
NODE_ENV=production npm start
```

### Vercel Deployment

The project includes a `vercel.json` configuration for serverless deployment:

1. Install the Vercel CLI and log in:

   ```bash
   npm i -g vercel
   vercel login
   ```

2. Link the project:

   ```bash
   vercel
   ```

3. Set environment variables in the Vercel dashboard:

   Required:
   - `APP_SECRET`
   - `DATABASE_URL`
   - `OWNER_UNION_ID`
   - `PUBLIC_APP_URL`

   OAuth providers (set only the ones you want to offer):
   - `VITE_GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
   - `APPLE_CLIENT_ID`, `APPLE_TEAM_ID`, `APPLE_KEY_ID`, `APPLE_PRIVATE_KEY`
   - `MICROSOFT_TENANT`, `MICROSOFT_CLIENT_ID`, `MICROSOFT_CLIENT_SECRET`
   - `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET`
   - `FACEBOOK_CLIENT_ID`, `FACEBOOK_CLIENT_SECRET`
   - `X_CLIENT_ID`, `X_CLIENT_SECRET`
   - `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`
   - `INSTAGRAM_CLIENT_ID`, `INSTAGRAM_CLIENT_SECRET`

   Payments (if using Stripe):
   - `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
   - `STRIPE_PRICE_PREMIUM_MONTHLY`, `STRIPE_PRICE_PREMIUM_3MONTH`, `STRIPE_PRICE_PREMIUM_YEARLY`
   - Upgrade top-ups: `STRIPE_PRICE_UPGRADE_MONTHLY_TO_3MONTH`, `STRIPE_PRICE_UPGRADE_MONTHLY_TO_YEARLY`, `STRIPE_PRICE_UPGRADE_3MONTH_TO_YEARLY`

   Email/notifications (if sending real emails):
   - `EMAIL_PROVIDER`, `EMAIL_FROM`, `RESEND_API_KEY`

   Vercel Cron:
   - `CRON_SECRET`

   Distributed rate limiting:
   - `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`

4. Configure OAuth redirect URIs in every provider console you enable:

   - `https://your-vercel-domain.vercel.app/api/oauth/callback`

5. Deploy:

   ```bash
   vercel --prod
   ```

#### Provisioning Stripe Plans & Prices

The app expects **six** Stripe price IDs (all priced in CAD). Create them once
in the Stripe Dashboard, then set the matching environment variables.

| Env var                                         | Stripe product                 | Price  | Type           |
| ----------------------------------------------- | ------------------------------ | ------ | -------------- |
| `STRIPE_PRICE_PREMIUM_MONTHLY`                  | Premium Monthly                | $39.00 | Recurring/mo   |
| `STRIPE_PRICE_PREMIUM_3MONTH`                   | Premium 3-Month                | $99.00 | One-time       |
| `STRIPE_PRICE_PREMIUM_YEARLY`                   | Premium Yearly                 | $249.00| Recurring/yr   |
| `STRIPE_PRICE_UPGRADE_MONTHLY_TO_3MONTH`        | Upgrade Monthly → 3-Month      | $60.00 | One-time       |
| `STRIPE_PRICE_UPGRADE_MONTHLY_TO_YEARLY`        | Upgrade Monthly → Yearly       | $210.00| One-time       |
| `STRIPE_PRICE_UPGRADE_3MONTH_TO_YEARLY`         | Upgrade 3-Month → Yearly       | $150.00| One-time       |

Steps:

1. Stripe Dashboard → **Products → Add product**. Create `Premium Monthly`,
   `Premium 3-Month`, `Premium Yearly`, plus the three upgrade products, each
   with the price above. Recurring products use a monthly/yearly interval;
   the 3-Month plan and upgrade top-ups are one-time prices.
2. Copy each **Price ID** (`price_...`) and set the matching env var
   (`STRIPE_PRICE_*`). The upgrade products are resolved by Price ID via
   `getUpgradeKeyFromPrice` — if one is missing, checkout returns
   `"Upgrade price is not configured"`.
3. Configure a Stripe webhook endpoint at
   `https://your-domain.com/api/webhooks/stripe` and subscribe to:

   - `checkout.session.completed`
   - `invoice.paid`, `invoice.payment_failed`, `invoice.marked_uncollectible`, `invoice.voided`
   - `customer.subscription.created`, `.updated`, `.deleted`, `.paused`, `.resumed`

   Verify the webhook signing secret matches `STRIPE_WEBHOOK_SECRET`.

#### Applying the pricing migration (`0013_equal_wong`)

Migrations are **not** applied automatically on startup — run them during
deploy. The pricing release includes one migration that removes the legacy
lifetime column and its unique index:

- `db/migrations/0013_equal_wong.sql`
  - `DROP INDEX "users_stripe_lifetime_payment_intent_unique";`
  - `ALTER TABLE "users" DROP COLUMN "stripe_lifetime_payment_intent_id";`

Apply it to the target database:

```bash
npm run db:migrate
```

CI safety net: the `check` job in `.github/workflows/ci.yml` runs
`npm run db:generate` and fails if the committed migration files drift, then
applies all migrations to a disposable PostgreSQL before the test suite runs.
Always run `npm run db:migrate` against staging first, verify no data loss (the
dropped column was unused — no lifetime customers existed), then apply to
production.

#### Vercel Limitations

- The **background task-reminder scheduler does not run** on serverless. `vercel.json` defines a Vercel Cron job that calls `/api/cron/notify` once daily. Set `CRON_SECRET` in the Vercel dashboard to authenticate cron requests.

### Pre-Deploy Checklist

1. Set all required environment variables.
2. Ensure `DATABASE_URL` points to a persistent PostgreSQL database.
3. Run `npm run db:migrate` (includes the pricing migration `0013_equal_wong`).
4. Provision the six Stripe price IDs and set `STRIPE_PRICE_*` env vars
   (see [Provisioning Stripe Plans & Prices](#provisioning-stripe-plans--prices)).
5. Run `npm run db:seed:dat:full` and/or `npm run db:seed:dat` on a fresh database (PAT needs no seeding).
6. Configure OAuth redirect URIs for every enabled provider:
   - `https://your-domain.com/api/oauth/callback`
7. Configure Stripe webhook endpoint to `https://your-domain.com/api/webhooks/stripe` (if using payments).
8. Configure email provider (Resend or SendGrid) for real notifications.
9. Set `PUBLIC_APP_URL` to the production origin (e.g. `https://predent.vercel.app`).
10. Set `CRON_SECRET` for Vercel cron authentication (Vercel only).
11. Configure the shared Redis REST rate-limit store. Do not enable the
    in-memory escape hatch on Vercel or multi-instance deployments.
12. Follow the [release runbook](./release-runbook.md), including disposable
    database migration validation and a verified recovery point.
13. Run a dry Stripe entitlement audit and resolve all manual-review rows.

### Environment Notes

- The production build bundles the frontend into `dist/public/` and the backend into `dist/boot.js`.
- The server serves static files and tRPC API routes from `/api/trpc`.
- Migrations are **not** run automatically on startup; run them during deploy.
- Production API requests fall back to the local in-process rate-limit store
  when the shared store is missing or unavailable, logging a loud warning.
  Limits are not shared across instances during the fallback; monitor Redis
  health so the shared limiter is always available.

---

## Content Management

### PAT Questions

PAT questions are **not stored in the database**. Every question is generated on the fly from a numeric seed using the mulberry32 PRNG (`server/lib/pat-generation/` on the server, `src/lib/prng.ts` on the client):

- Seeds are integers (1–1,000,000); each `(seed, category, difficulty)` triple deterministically produces one question.
- The server re-derives the question and correct answer from the seed to grade attempts — no answer ever travels to the client.
- Practice (uncontrolled generators), flashcards, and the CLI all derive questions from seeds.
- Static per-category counts (60 × 6 = 360) live in `contracts/pat-stats.ts` (`PAT_QUESTION_COUNTS`).
- Attempts are recorded in `pat_attempts` (category, difficulty, seed, correctness, time).
- Flashcard PAT reviews store `category`, `difficulty`, and `seed` in `flashcard_reviews`; due cards are regenerated from the stored seed.

To change the question universe, edit the generator logic under `server/lib/pat-generation/` (server) and `src/components/pat-generators/logic/` (client) — both sides must stay in sync.

### DAT Questions

DAT questions live in `dat_questions`:

- `publicId`, `subject` (biology/chemistry/reading), `topic`, `difficulty`
- `questionText`, `options`, `correctAnswer`, `explanation`

Add or update by extending `db/seed-dat.ts` and running `npm run db:seed:dat`, or via SQL.

### Community Posts

Community posts live in `community_posts`. Supported types: `result`, `question`, `discussion`.

#### Batch Add Community Posts

Prepare a JSON file `posts.json`:

```json
[
  {
    "userId": 1,
    "type": "result",
    "title": "Accepted to UofT Dentistry",
    "content": "Excited to share...",
    "school": "University of Toronto",
    "program": "DDS",
    "result": "Accepted",
    "gpa": "3.92",
    "datAa": "22",
    "datPat": "21",
    "province": "IP"
  }
]
```

Then insert with a small script:

```bash
npx tsx scripts/import-posts.ts posts.json
```

Example `scripts/import-posts.ts`:

```ts
import { getDb } from "../server/queries/connection";
import { communityPosts } from "../db/schema";
import fs from "fs";

const file = process.argv[2];
const posts = JSON.parse(fs.readFileSync(file, "utf-8"));

const db = getDb();
await db.insert(communityPosts).values(posts);
console.log(`Imported ${posts.length} posts.`);
```

> For production imports, validate data first and wrap in a transaction.

### School Data

Canadian dental school data is centralized in `contracts/schools.ts`. Update this file when admission stats or program details change, then rebuild and redeploy.

---

## Email & Notifications

### Email Provider Setup

Set `EMAIL_PROVIDER` to one of:

- `console` — logs emails to stdout (default, useful for local dev)
- `resend` — sends via [Resend](https://resend.com); requires `RESEND_API_KEY` and `EMAIL_FROM`

`sendgrid` is intentionally unsupported; selecting it returns an explicit
delivery error. Use Resend or implement and review a provider before exposing
that configuration in production.

Example Resend configuration:

```env
EMAIL_PROVIDER=resend
EMAIL_FROM=noreply@predent.vercel.app
RESEND_API_KEY=re_xxxxxxxx
```

### Notification Types

The platform creates in-app notifications for:

- Welcome messages (`system`)
- Task due-date reminders (`task_due`)
- Community activity (`community`)
- Study reminders (`study_reminder`)
- Payment events (`payment`)

When `sendEmail` is true and the user has an email address, an email is sent alongside the in-app notification.

### Task Due-Date Reminders

**Docker / Node production server:** an hourly background scheduler runs automatically:

1. Finds tasks due within the next 24 hours.
2. Creates in-app notifications.
3. Sends emails if an email provider is configured.

**Vercel:** the scheduler does not run as a background process. The daily Vercel Cron job (`/api/cron/notify`) performs the same check once per day.

Trigger manually from the Admin Dashboard, or run:

```bash
npx tsx -e "import { notifyUpcomingTasks } from './server/lib/tasks/notifications'; console.log(await notifyUpcomingTasks());"
```

---

## Monitoring & Health Checks

### CI Checks

The GitHub Actions workflow runs on every push/PR:

```bash
npm run check
npm run lint
npm test
npm run build
```

### Health Endpoints

- `GET /api/trpc/ping` — public ping, returns `{ ok: true, ts: ... }`
- Docker Compose healthcheck pings this endpoint every 30 seconds.

Manual check:

```bash
curl https://your-domain.com/api/trpc/ping
```

### Logs

Docker Compose:

```bash
docker compose logs app -f
```

Manual process:

```bash
NODE_ENV=production npm start 2>&1 | tee predent.log
```

### Telemetry Privacy Operations

- PostHog analytics and Sentry browser telemetry initialize only after the user
  selects **Allow analytics**. Declining leaves both services off.
- Configure PostHog event retention to no more than 12 months and Sentry replay
  retention to no more than 30 days in their provider dashboards.
- Process access/deletion requests across both providers using the internal user
  ID; names and email addresses are not sent as analytics person properties.
- Revisit consent and the privacy policy before adding any new event properties,
  replay allowlists, advertising tools, or cross-domain tracking.

---

## Backup & Recovery

The authoritative procedure and quarterly restore-drill evidence requirements
are in the [disaster-recovery runbook](./disaster-recovery.md). The commands
below are examples, not proof that the production Supabase plan has backups or
point-in-time recovery enabled.

### Database Backups

Database is hosted on Supabase. Use Supabase Dashboard → Database → Backups, or `pg_dump`:

```bash
pg_dump "postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres" > predent-backup-$(date +%Y%m%d).sql
```

Store backups offsite (S3, Backblaze B2, etc.) for production.

### Restore

Restore the SQL dump into a fresh PostgreSQL database, then restart the app:

```bash
# Create the target database first if it does not exist.
psql "$DATABASE_URL" -c "CREATE DATABASE predent_restore;"

# Restore from the dump.
psql "$DATABASE_URL_TO_RESTORE" < predent-backup-20260101.sql

# Update DATABASE_URL to point at the restored database and restart.
docker compose down
docker compose up -d
```

> On managed platforms such as Supabase, use the provider's backup/restore tools instead of manual `pg_dump`/`psql` when possible.

---

## Troubleshooting

### Database connection issues

Verify your `DATABASE_URL` is correct and the Supabase project is active:

```bash
psql "$DATABASE_URL" -c "SELECT 1"
```

### OAuth login fails

General checks for any provider:

- Verify the provider's client ID and secret match the values in the provider console.
- Ensure the redirect URI `https://your-domain.com/api/oauth/callback` is registered **exactly** (no trailing slash, correct protocol).
- Check that `APP_SECRET` is set and consistent.
- Check Vercel function logs for the exact error returned by `server/auth/auth.ts`.

Provider-specific tips:

- **Google:** `VITE_GOOGLE_CLIENT_ID` must be set in addition to `GOOGLE_CLIENT_ID`; the app is built at deploy time and bakes the value into the frontend bundle. Also add the production domain to **Authorized JavaScript origins**.
- **Apple:** the private key must be PEM-encoded and include the `-----BEGIN/END EC PRIVATE KEY-----` lines. The Services ID must match `APPLE_CLIENT_ID` exactly.
- **Microsoft:** use tenant `common` for personal Microsoft accounts; use a specific tenant ID for organization-only access.
- **LinkedIn:** the product **Sign In with LinkedIn using OpenID Connect** must be enabled for the app.
- **Facebook:** add the redirect URI under **Facebook Login → Settings → Valid OAuth Redirect URIs**.
- **X:** enable **OAuth 2.0** in the app settings and set the callback URI there.
- **Discord:** add the redirect URI under **OAuth2 → General**.
- **Instagram:** configure through the Meta developer portal under **Instagram Basic Display → Settings**.

### Stripe webhooks fail

- Verify `STRIPE_WEBHOOK_SECRET`.
- Ensure the webhook endpoint is `https://your-domain.com/api/webhooks/stripe`.
- Check server logs for signature verification errors.

### Emails not sending

- Verify `EMAIL_PROVIDER` is set to `resend` in production.
- Check API keys and `EMAIL_FROM`.
- For `console` provider, emails are only logged to stdout.

### PAT/DAT question count shows zero

PAT questions are generated on the fly from seeds (see Content Management → PAT Questions) — a zero count there is not a data problem. DAT questions are stored:

```bash
npm run db:seed:dat:full
```

### 500 errors after deployment

Check that all env vars are set and the database is reachable:

```bash
docker compose logs app
psql "$DATABASE_URL" -c "SELECT 1"
```
