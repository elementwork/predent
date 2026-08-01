# PreDent Canada — Admin Guide

This guide covers how to set up, deploy, and operate the PreDent Canada platform. It is intended for administrators, DevOps engineers, and content managers.

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
STRIPE_PRICE_PREMIUM_MONTHLY=     # price_... for $29/mo Premium plan
STRIPE_PRICE_PREMIUM_YEARLY=      # price_... for $249/yr Premium plan
STRIPE_PRICE_PLUS_LIFETIME=      # price_... for $149 one-time Plus plan

# ── Email / Notifications ───────────────────────────────────────
EMAIL_PROVIDER=           # "console" (default), "resend", or "sendgrid"
EMAIL_FROM=               # Sender address (e.g. noreply@predent.ca)
RESEND_API_KEY=           # re_... (required when EMAIL_PROVIDER=resend)
SENDGRID_API_KEY=         # SG.xxx (required when EMAIL_PROVIDER=sendgrid)
PUBLIC_APP_URL=           # Public origin for links (e.g. https://predent.ca)

# ── Vercel Cron ─────────────────────────────────────────────────
CRON_SECRET=              # Random secret Vercel sends for cron auth
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
   - *Accounts in any organizational directory and personal Microsoft accounts* (recommended)
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
npm run db:seed
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

Seed PAT questions (360 deterministic questions):

```bash
npm run db:seed
```

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

SELECT COUNT(*) FROM pat_questions;
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
   - `STRIPE_PRICE_PREMIUM_MONTHLY`, `STRIPE_PRICE_PREMIUM_YEARLY`, `STRIPE_PRICE_PLUS_LIFETIME`

   Email/notifications (if sending real emails):
   - `EMAIL_PROVIDER`, `EMAIL_FROM`, `RESEND_API_KEY` or `SENDGRID_API_KEY`

   Vercel Cron:
   - `CRON_SECRET`

4. Configure OAuth redirect URIs in every provider console you enable:

   - `https://your-vercel-domain.vercel.app/api/oauth/callback`

5. Deploy:

   ```bash
   vercel --prod
   ```

#### Vercel Limitations

- The **background task-reminder scheduler does not run** on serverless. `vercel.json` defines a Vercel Cron job that calls `/api/cron/notify` once daily. Set `CRON_SECRET` in the Vercel dashboard to authenticate cron requests.

### Pre-Deploy Checklist

1. Set all required environment variables.
2. Ensure `DATABASE_URL` points to a persistent PostgreSQL database.
3. Run `npm run db:migrate`.
4. Run `npm run db:seed` and/or `npm run db:seed:dat` on a fresh database.
5. Configure OAuth redirect URIs for every enabled provider:
   - `https://your-domain.com/api/oauth/callback`
6. Configure Stripe webhook endpoint to `https://your-domain.com/api/webhooks/stripe` (if using payments).
7. Configure email provider (Resend or SendGrid) for real notifications.
8. Set `PUBLIC_APP_URL` to the production origin (e.g. `https://predent.ca`).
9. Set `CRON_SECRET` for Vercel cron authentication (Vercel only).

### Environment Notes

- The production build bundles the frontend into `dist/public/` and the backend into `dist/boot.js`.
- The server serves static files and tRPC API routes from `/api/trpc`.
- Migrations are **not** run automatically on startup; run them during deploy.

---

## Content Management

### PAT Questions

PAT questions live in the `pat_questions` table. Each row contains:

- `publicId` — unique stable identifier
- `category` — keyholes, tfe, angle_ranking, hole_punching, cube_counting, pattern_folding
- `difficulty` — beginner, intermediate, advanced, elite
- `questionData` — JSON with prompt, diagram, options
- `correctAnswer`, `explanationL1/L2/L3`, `concepts`, `timeTarget`

Add or update questions by:

1. Extending `db/seed.ts` and running `npm run db:seed`.
2. Inserting rows directly via SQL or a migration.
3. Building admin UI CRUD (future enhancement).

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
- `sendgrid` — sends via [SendGrid](https://sendgrid.com); requires `SENDGRID_API_KEY` and `EMAIL_FROM`

Example Resend configuration:

```env
EMAIL_PROVIDER=resend
EMAIL_FROM=noreply@predent.ca
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

---

## Backup & Recovery

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

- Verify `EMAIL_PROVIDER` is set to `resend` or `sendgrid` in production.
- Check API keys and `EMAIL_FROM`.
- For `console` provider, emails are only logged to stdout.

### PAT/DAT question count shows zero

Run the relevant seed:

```bash
npm run db:seed
npm run db:seed:dat
```

### 500 errors after deployment

Check that all env vars are set and the database is reachable:

```bash
docker compose logs app
psql "$DATABASE_URL" -c "SELECT 1"
```
