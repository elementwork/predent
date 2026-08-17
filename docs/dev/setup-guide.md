# PreDent Canada — Production Setup Guide

A complete, step-by-step guide to deploy PreDent Canada from zero to production using **free-tier plans** on all services.

> **Total monthly cost: $0** (Supabase Free + Vercel Hobby or Cloudflare Free + Resend Free + Stripe pay-as-you-go)

---

## Table of Contents

1. [Overview & Architecture](#1-overview--architecture)
2. [Prerequisites](#2-prerequisites)
3. [Database Setup (Supabase)](#3-database-setup-supabase)
4. [OAuth Provider Setup](#4-oauth-provider-setup)
5. [Email Setup (Resend)](#5-email-setup-resend)
6. [Payment Setup (Stripe)](#6-payment-setup-stripe)
7. [Deployment — Option A: Vercel](#7-deployment--option-a-vercel)
8. [Deployment — Option B: Cloudflare Workers](#8-deployment--option-b-cloudflare-workers)
9. [Post-Deploy Verification](#9-post-deploy-verification)
10. [Ongoing Operations](#10-ongoing-operations)

---

## 1. Overview & Architecture

PreDent Canada is a full-stack app: React frontend + Hono/tRPC backend, deployed as a single unit.

```
┌─────────────────────────────────────────────────────────┐
│                    Deployment Target                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Frontend    │  │   Backend    │  │   Cron Job    │  │
│  │  (React SPA)  │  │  (Hono API)  │  │  (Reminders)  │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────────┘  │
│         │                  │                              │
│         └────────┬─────────┘                              │
│                  │                                        │
└──────────────────┼────────────────────────────────────────┘
                   │
    ┌──────────────┼──────────────┐
    │              │              │
┌───┴───┐    ┌────┴────┐   ┌────┴────┐
│Supabase│    │ Resend  │   │ Stripe  │
│  (DB)  │    │ (Email) │   │(Payment)│
└────────┘    └─────────┘   └─────────┘
```

### Free Tier Limits Summary

| Service          | Plan     | Limits                                                                        |
| ---------------- | -------- | ----------------------------------------------------------------------------- |
| **Supabase**     | Free     | 500MB DB, 5GB egress, 2 projects, pauses after 1 week inactivity              |
| **Vercel**       | Hobby    | 100GB transfer, 1M function invocations, 100 deploys/day, non-commercial only |
| **Cloudflare**   | Free     | 100K requests/day, 10ms CPU/invocation                                        |
| **Resend**       | Free     | 3,000 emails/month, 100/day limit, 1 domain                                   |
| **Stripe**       | Standard | No monthly fee, 2.9% + $0.30 per transaction                                  |
| **Google OAuth** | Free     | Unlimited (no cost for OAuth)                                                 |

---

## 2. Prerequisites

Before you begin, create accounts on all these platforms:

| Platform                     | URL                                         | Purpose                     |
| ---------------------------- | ------------------------------------------- | --------------------------- |
| **GitHub**                   | https://github.com                          | Source code hosting + CI/CD |
| **Supabase**                 | https://supabase.com                        | PostgreSQL database         |
| **Vercel** OR **Cloudflare** | https://vercel.com / https://cloudflare.com | App hosting                 |
| **Google Cloud Console**     | https://console.cloud.google.com            | Google OAuth (required)     |
| **Resend**                   | https://resend.com                          | Transactional email         |
| **Stripe**                   | https://dashboard.stripe.com                | Payments                    |

### Local Setup

```bash
# Clone the repository
git clone https://github.com/your-org/predent.git
cd predent

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

You'll fill in `.env` values as you complete each section below.

---

## 3. Database Setup (Supabase)

### 3.1 Create a Supabase Project

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **"New project"**
3. Choose your organization (or create one)
4. Fill in:
   - **Project name:** `predent` (or `predent-prod`)
   - **Database password:** Generate a strong password and save it
   - **Region:** Choose closest to your users (e.g., `US East` for North America)
5. Click **"Create new project"**
6. Wait 2-3 minutes for provisioning

### 3.2 Get Your Connection String

1. In the Supabase dashboard, go to **Settings → Database**
2. Under **Connection string**, select **"Transaction"** (port 6543)
3. Copy the URI and replace `[YOUR-PASSWORD]` with your database password:

```
postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres
```

4. Add to your `.env`:

```bash
DATABASE_URL=postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres
```

> **Why port 6543?** Supabase uses PgBouncer for connection pooling on port 6543. This is required for serverless deployments (Vercel/Cloudflare) where connections are short-lived.

### 3.3 Run Migrations

```bash
# Generate migration files (if schema has changed)
npm run db:generate

# Apply all migrations to create tables
npm run db:migrate
```

This creates all 17 tables: `users`, `profiles`, `tasks`, `pat_attempts`, `dat_questions`, `community_posts`, etc. (PAT questions are **not** stored in the database — they are generated on the fly from numeric seeds.)

### 3.4 Seed Data

```bash
# Seed 500 DAT questions (200 bio + 200 chem + 100 RC)
npm run db:seed:dat:full

# Seed 24 interview questions (14 panel + 10 MMI)
npm run db:seed:interview
```

> **Note:** Seeding is additive. Running again will insert duplicate rows. Only run once on a fresh database.

### 3.5 Verify Database

Connect via any PostgreSQL client:

```bash
psql "$DATABASE_URL"

# Check table counts
SELECT 'dat_questions' as tbl, COUNT(*) FROM dat_questions
UNION ALL
SELECT 'interview_questions', COUNT(*) FROM interview_questions;
```

Expected output:

```
       tbl        | count
------------------+------
 dat_questions    |  500
 interview_questions |   24
```

### 3.6 Supabase Free Tier Notes

- **500MB database size** — sufficient for 10K+ users with PAT/DAT questions
- **5GB egress** — enough for ~50K API requests/month
- **Pauses after 1 week of inactivity** — Supabase auto-pauses free projects. To prevent:
  - Keep the project active by visiting the dashboard weekly
  - Or upgrade to Pro ($25/mo) for always-on
- **2 active projects** — you can have dev + prod, but only 2 active
- **No automatic backups** — back up manually via `pg_dump` or Supabase dashboard

---

## 4. OAuth Provider Setup

PreDent supports 8 OAuth providers. Only **Google is required** (for admin login). Others are optional — configure only the ones you want to offer.

### 4.1 Shared: Redirect URI

All providers use the same callback URL format:

```
https://your-domain.com/api/oauth/callback
```

For local development:

```
http://localhost:3000/api/oauth/callback
```

Register this URI in **every** provider console you enable.

### 4.2 Google OAuth (Required)

Google is the primary login method and grants admin access.

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Go to **APIs & Services → Credentials**
4. Click **"+ Create Credentials" → "OAuth client ID"**
5. If prompted, configure **OAuth consent screen**:
   - User type: **External**
   - App name: `PreDent Canada`
   - User support email: your email
   - Developer contact: your email
6. Back to **Create OAuth client ID**:
   - Application type: **Web application**
   - Name: `PreDent Canada`
7. Add **Authorized JavaScript origins:**
   ```
   http://localhost:3000
   https://your-domain.com
   ```
8. Add **Authorized redirect URIs:**
   ```
   http://localhost:3000/api/oauth/callback
   https://your-domain.com/api/oauth/callback
   ```
9. Click **Create**
10. Copy **Client ID** and **Client Secret**

Add to `.env`:

```bash
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-secret
```

> **Important:** `VITE_GOOGLE_CLIENT_ID` is needed for the frontend build. It must be set at build time.

### 4.3 Apple Sign In

1. Go to [Apple Developer Portal](https://developer.apple.com/)
2. Go to **Certificates, Identifiers & Profiles → Identifiers**
3. Click **"+" → Services IDs**
4. Enable **Sign in with Apple**
5. Configure:
   - Primary App ID: your bundle ID (e.g., `com.yourteam.predent`)
   - Web Domain: `your-domain.com`
   - Return URLs: `https://your-domain.com/api/oauth/callback`
6. Go to **Certificates, Identifiers & Profiles → Keys**
7. Create a new key:
   - Key name: `PreDent Sign in with Apple`
   - Enable **Sign in with Apple**
8. Download the `.p8` private key file
9. Note your **Team ID** (10 characters, top-right of dashboard)
10. Note your **Key ID**

Add to `.env`:

```bash
APPLE_CLIENT_ID=com.yourteam.predent
APPLE_TEAM_ID=ABCDE12345
APPLE_KEY_ID=ABCDEF1234
APPLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----
MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHAyIAB...
-----END PRIVATE KEY-----
```

### 4.4 Microsoft Entra ID

1. Go to [Microsoft Entra admin center](https://entra.microsoft.com/)
2. Go to **App registrations → New registration**
3. Fill in:
   - Name: `PreDent Canada`
   - Supported account types: **Accounts in any organizational directory and personal Microsoft accounts**
4. Add **Web** platform redirect URI:
   ```
   https://your-domain.com/api/oauth/callback
   ```
5. Click **Register**
6. Go to **Certificates & secrets → New client secret**
7. Copy the secret value (shown once)
8. Note the **Application (client) ID**

Add to `.env`:

```bash
MICROSOFT_TENANT=common
MICROSOFT_CLIENT_ID=your-client-id
MICROSOFT_CLIENT_SECRET=your-secret
```

### 4.5 LinkedIn

1. Go to [LinkedIn Developers](https://developer.linkedin.com/)
2. Create an app
3. Go to **Products → Add product: Sign In with LinkedIn using OpenID Connect**
4. Go to **Auth → Authorized redirect URLs for your app**:
   ```
   https://your-domain.com/api/oauth/callback
   ```
5. Copy **Client ID** and **Client Secret**

Add to `.env`:

```bash
LINKEDIN_CLIENT_ID=your-client-id
LINKEDIN_CLIENT_SECRET=your-secret
```

### 4.6 Facebook

1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Create an app (type: **Business**)
3. Add **Facebook Login** product
4. Go to **Settings → Valid OAuth Redirect URIs**:
   ```
   https://your-domain.com/api/oauth/callback
   ```
5. Copy **App ID** and **App Secret**

Add to `.env`:

```bash
FACEBOOK_CLIENT_ID=your-app-id
FACEBOOK_CLIENT_SECRET=your-app-secret
```

### 4.7 X (Twitter)

1. Go to [X Developer Portal](https://developer.x.com/)
2. Create a project and app
3. Go to **Settings → User authentication settings**
4. Enable **OAuth 2.0**
5. Set **Callback URI / Redirect URL:**
   ```
   https://your-domain.com/api/oauth/callback
   ```
6. Copy **Client ID** and **Client Secret**

Add to `.env`:

```bash
X_CLIENT_ID=your-client-id
X_CLIENT_SECRET=your-client-secret
```

### 4.8 Discord

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create an application
3. Go to **OAuth2 → General**
4. Add **Redirect**:
   ```
   https://your-domain.com/api/oauth/callback
   ```
5. Copy **Client ID** and **Client Secret**

Add to `.env`:

```bash
DISCORD_CLIENT_ID=your-client-id
DISCORD_CLIENT_SECRET=your-client-secret
```

### 4.9 Instagram

Instagram Login is configured through Meta/Facebook:

1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Use the same app as Facebook (or create new)
3. Add **Instagram Basic Display** product
4. Go to **Basic Display → Settings → Valid OAuth Redirect URIs**:
   ```
   https://your-domain.com/api/oauth/callback
   ```
5. Copy **Instagram App ID** and **App Secret**

Add to `.env`:

```bash
INSTAGRAM_CLIENT_ID=your-app-id
INSTAGRAM_CLIENT_SECRET=your-app-secret
```

### 4.10 Admin Access

The first user whose Google `sub` (user ID) matches `OWNER_UNION_ID` is automatically promoted to `admin` on first login.

To find your Google `sub`:

1. Log in with Google
2. Check the database: `SELECT unionId FROM users WHERE provider = 'google' LIMIT 1;`
3. Set that value as `OWNER_UNION_ID` in `.env`

```bash
OWNER_UNION_ID=your-google-sub-id
```

> **Security:** Keep `OWNER_UNION_ID` private. Anyone with this value gets admin access.

---

## 5. Email Setup (Resend)

### 5.1 Create Resend Account

1. Go to [https://resend.com](https://resend.com)
2. Sign up (GitHub login available)
3. Free tier includes: **3,000 emails/month, 100/day limit**

### 5.2 Add Your Domain

1. In Resend dashboard, go to **Domains**
2. Click **"Add Domain"**
3. Enter your domain: `predent.vercel.app`
4. Resend will provide **3 DNS records** to add (DKIM, SPF, DMARC)

### 5.3 Configure DNS

Go to your domain registrar (Namecheap, Cloudflare DNS, etc.) and add the DNS records Resend provides:

| Type | Name                | Value                            |
| ---- | ------------------- | -------------------------------- |
| TXT  | `resend._domainkey` | `p=MIGfMA0GCSq...` (DKIM key)    |
| TXT  | `_dmarc`            | `v=DMARC1; p=none;`              |
| TXT  | `@`                 | `v=spf1 include:resend.com ~all` |

> **Note:** DNS propagation takes 5-30 minutes. Click "Verify" in Resend after waiting.

### 5.4 Get API Key

1. Go to **API Keys** in Resend dashboard
2. Click **"Create API Key"**
3. Name it: `predent-production`
4. Copy the key (shown once)

### 5.5 Set Environment Variables

```bash
EMAIL_PROVIDER=resend
EMAIL_FROM=noreply@predent.vercel.app
RESEND_API_KEY=re_xxxxxxxxxxxxxxxx
PUBLIC_APP_URL=https://your-domain.com
```

### 5.6 Test Email

Start the dev server and trigger a test:

```bash
npm run dev
# Visit /login, log in, then trigger a notification
# Check console output for email logs
```

With `EMAIL_PROVIDER=console`, emails are logged to stdout (useful for development).

---

## 6. Payment Setup (Stripe)

### 6.1 Create Stripe Account

1. Go to [https://dashboard.stripe.com](https://dashboard.stripe.com)
2. Sign up and complete verification
3. **Free to open, no monthly fee** — you only pay 2.9% + $0.30 per successful transaction

### 6.2 Get API Keys

1. Go to **Developers → API keys**
2. You'll see two keys:
   - **Publishable key:** `pk_test_...` (for frontend)
   - **Secret key:** `sk_test_...` (for backend)

3. Start with **test mode** (toggle in dashboard). Switch to live keys when ready for production.

Add to `.env`:

```bash
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxx
```

### 6.3 Create Products & Prices

Create products in Stripe Dashboard (prices in CAD):

**Product 1: Premium Monthly**

1. Go to **Products → Add product**
2. Name: `Premium Monthly`
3. Add price: `$39.00` / month, recurring
4. Save and copy the **Price ID** (`price_xxx`)

**Product 2: Premium 3-Month**

1. Name: `Premium 3-Month`
2. Add price: `$99.00` / one-time (grants a 90-day access window)
3. Save and copy the **Price ID**

**Product 3: Premium Yearly**

1. Name: `Premium Yearly`
2. Add price: `$249.00` / year, recurring
3. Save and copy the **Price ID**

**Upgrade top-up products** (one-time, pay-the-difference plan upgrades):

- `Upgrade Monthly → 3-Month`: `$60.00`
- `Upgrade Monthly → Yearly`: `$210.00`
- `Upgrade 3-Month → Yearly`: `$150.00`

Add to `.env`:

```bash
STRIPE_PRICE_PREMIUM_MONTHLY=price_xxxxxxxxxxxxxxxx
STRIPE_PRICE_PREMIUM_3MONTH=price_xxxxxxxxxxxxxxxx
STRIPE_PRICE_PREMIUM_YEARLY=price_xxxxxxxxxxxxxxxx
STRIPE_PRICE_UPGRADE_MONTHLY_TO_3MONTH=price_xxxxxxxxxxxxxxxx
STRIPE_PRICE_UPGRADE_MONTHLY_TO_YEARLY=price_xxxxxxxxxxxxxxxx
STRIPE_PRICE_UPGRADE_3MONTH_TO_YEARLY=price_xxxxxxxxxxxxxxxx
```

### 6.4 Configure Webhook

1. Go to **Developers → Webhooks**
2. Click **"Add endpoint"**
3. Endpoint URL: `https://your-domain.com/api/webhooks/stripe`
4. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `customer.subscription.paused`
   - `customer.subscription.resumed`
   - `invoice.paid`
   - `invoice.payment_failed`
   - `invoice.marked_uncollectible`
   - `invoice.voided`
   - `charge.refunded`
   - `charge.dispute.created`
   - `charge.dispute.closed`
5. Click **Add endpoint**
6. Copy the **Signing secret** (`whsec_xxx`)

Add to `.env`:

```bash
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxx
```

### 6.5 Stripe Billing Portal

The Stripe billing portal is pre-configured in the codebase. Users can:

- View subscription status
- Update payment method
- Cancel subscription
- View invoices

No additional setup needed — the portal is created automatically via the API.

### 6.6 Test Mode vs Live Mode

| Feature      | Test Mode                        | Live Mode     |
| ------------ | -------------------------------- | ------------- |
| API keys     | `sk_test_...`                    | `sk_live_...` |
| Test cards   | 4242 4242 4242 4242              | Real cards    |
| Webhooks     | Use Stripe CLI for local testing | Real webhooks |
| Transactions | No real charges                  | Real charges  |

To test locally with Stripe:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to localhost
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# In another terminal, trigger test events
stripe trigger checkout.session.completed
```

---

## 7. Deployment — Option A: Vercel

### 7.1 Free Tier Limits (Hobby Plan)

| Resource             | Limit           |
| -------------------- | --------------- |
| Fast Data Transfer   | 100 GB/month    |
| Function invocations | 1,000,000/month |
| Edge requests        | 1,000,000/month |
| Deployments/day      | 100             |
| Build time           | 45 minutes      |
| Projects             | 200             |
| Custom domains       | 50              |

> **Note:** Vercel Hobby plan is **non-commercial only**. For commercial use, upgrade to Pro ($20/month).

### 7.2 Connect GitHub Repository

1. Go to [https://vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Add New Project"**
3. Import your `predent` repository
4. Configure:
   - **Framework Preset:** Vite (auto-detected)
   - **Root Directory:** `./` (default)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist/public`
5. Click **"Deploy"** (first deploy will fail — need env vars first)

### 7.3 Set Environment Variables

1. Go to **Project Settings → Environment Variables**
2. Add all variables from your `.env`:

| Variable                       | Value                          | Environment                      |
| ------------------------------ | ------------------------------ | -------------------------------- |
| `APP_SECRET`                   | your-secret                    | Production, Preview, Development |
| `DATABASE_URL`                 | postgresql://...               | Production, Preview, Development |
| `VITE_GOOGLE_CLIENT_ID`        | your-client-id                 | Production, Preview, Development |
| `GOOGLE_CLIENT_ID`             | your-client-id                 | Production, Preview, Development |
| `GOOGLE_CLIENT_SECRET`         | your-secret                    | Production, Preview, Development |
| `OWNER_UNION_ID`               | your-google-sub                | Production, Preview, Development |
| `PUBLIC_APP_URL`               | https://your-domain.vercel.app | Production                       |
| `EMAIL_PROVIDER`               | resend                         | Production                       |
| `EMAIL_FROM`                   | noreply@predent.vercel.app             | Production                       |
| `RESEND_API_KEY`               | re_xxx                         | Production                       |
| `STRIPE_SECRET_KEY`            | sk_live_xxx                    | Production                       |
| `STRIPE_WEBHOOK_SECRET`        | whsec_xxx                      | Production                       |
| `STRIPE_PRICE_PREMIUM_MONTHLY` | price_xxx                      | Production                       |
| `STRIPE_PRICE_PREMIUM_3MONTH`  | price_xxx                      | Production                       |
| `STRIPE_PRICE_PREMIUM_YEARLY`  | price_xxx                      | Production                       |
| `STRIPE_PRICE_UPGRADE_MONTHLY_TO_3MONTH` | price_xxx          | Production                       |
| `STRIPE_PRICE_UPGRADE_MONTHLY_TO_YEARLY` | price_xxx          | Production                       |
| `STRIPE_PRICE_UPGRADE_3MONTH_TO_YEARLY`  | price_xxx          | Production                       |
| `CRON_SECRET`                  | random-string                  | Production                       |

3. Click **"Save"**

### 7.4 Deploy

1. Go to **Deployments** and click **"Redeploy"**
2. Or push to GitHub — Vercel auto-deploys on push to `main`

### 7.5 Custom Domain

1. Go to **Settings → Domains**
2. Add your domain: `predent.vercel.app`
3. Vercel provides **2 DNS records** to add:

| Type  | Name  | Value                  |
| ----- | ----- | ---------------------- |
| A     | `@`   | `76.76.21.21`          |
| CNAME | `www` | `cname.vercel-dns.com` |

4. Update your domain registrar's DNS
5. SSL certificate is auto-provisioned (Let's Encrypt)

### 7.6 Vercel Cron (Task Reminders)

The app uses one daily cron job for task and study reminders, notification
outbox delivery, and Stripe entitlement reconciliation. This single schedule is
compatible with Vercel Hobby. Configure it in `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/notify",
      "schedule": "0 9 * * *"
    }
  ]
}
```

Set `CRON_SECRET` in environment variables (any random string).

---

## 8. Deployment — Option B: Cloudflare Workers

### 8.1 Free Tier Limits

| Resource   | Limit               |
| ---------- | ------------------- |
| Requests   | 100,000/day         |
| CPU time   | 10ms per invocation |
| Workers    | 100 per account     |
| KV storage | 1 GB                |
| R2 storage | 10 GB               |

### 8.2 Install Wrangler CLI

```bash
npm install -g wrangler
wrangler login
```

### 8.3 Create wrangler.toml

Create `wrangler.toml` in the project root:

```toml
name = "predent"
main = "dist/server/boot.js"
compatibility_date = "2024-01-01"
compatibility_flags = ["nodejs_compat"]

[assets]
directory = "dist/public"
binding = "ASSETS"
html_handling = "auto-trailing-slash"
not_found_handling = "single-page-application"

[vars]
NODE_ENV = "production"

# Set secrets via CLI:
# wrangler secret put APP_SECRET
# wrangler secret put DATABASE_URL
# etc.
```

### 8.4 Set Secrets

```bash
# Set each secret interactively
wrangler secret put APP_SECRET
wrangler secret put DATABASE_URL
wrangler secret put GOOGLE_CLIENT_ID
wrangler secret put GOOGLE_CLIENT_SECRET
wrangler secret put OWNER_UNION_ID
wrangler secret put STRIPE_SECRET_KEY
wrangler secret put STRIPE_WEBHOOK_SECRET
wrangler secret put RESEND_API_KEY
# ... etc for all secrets
```

### 8.5 Build & Deploy

```bash
# Build the project
npm run build

# Deploy to Cloudflare Workers
wrangler deploy
```

### 8.6 Custom Domain

1. Go to Cloudflare Dashboard → **Workers & Pages**
2. Click your worker → **Settings → Triggers**
3. Add a custom domain: `predent.vercel.app`
4. If your domain is already on Cloudflare DNS, it works instantly
5. If not, add a CNAME record pointing to your worker

### 8.7 Cloudflare Cron (Task Reminders)

Add a cron trigger to `wrangler.toml`:

```toml
[triggers]
crons = ["0 9 * * *"]
```

---

## 9. Post-Deploy Verification

### 9.1 Health Check

```bash
curl https://your-domain.com/api/trpc/ping
# Expected: {"ok":true,"ts":...}
```

### 9.2 Test OAuth Login

1. Visit `https://your-domain.com/login`
2. Click "Google" (or any configured provider)
3. Complete OAuth flow
4. Verify you're redirected to `/dashboard`
5. Check database: `SELECT * FROM users;`

### 9.3 Test Email

1. Log in to the app
2. Perform an action that triggers a notification (e.g., complete a task)
3. Check your email for the notification
4. If using Resend, check the **Logs** tab in the dashboard

### 9.4 Test Stripe (Test Mode)

1. Use Stripe test keys (`sk_test_...`)
2. Go to `/pricing`
3. Click "Upgrade" on a plan
4. Use test card: `4242 4242 4242 4242`
5. Complete checkout
6. Verify in Stripe Dashboard → **Payments**

### 9.5 Run Visual Tests

```bash
# Run all visual regression tests
npx playwright test e2e/visual.spec.ts e2e/visual-auth.spec.ts

# Run smoke tests
npx playwright test e2e/smoke.spec.ts
```

---

## 10. Ongoing Operations

### 10.1 Database Backups

**Manual backup:**

```bash
pg_dump "$DATABASE_URL" > predent-backup-$(date +%Y%m%d).sql
```

**Automated:** Supabase Pro plan includes 7-day automatic backups. Free plan does not.

### 10.2 Monitoring

The app includes Sentry for error tracking:

```bash
SENTRY_DSN=your-sentry-dsn
```

Create a free account at [https://sentry.io](https://sentry.io) (5K errors/month free).

### 10.3 Updating the App

```bash
# Pull latest changes
git pull origin main

# Install new dependencies
npm install

# Run migrations (if schema changed)
npm run db:migrate

# Rebuild
npm run build

# Redeploy
# Vercel: push to GitHub (auto-deploys)
# Cloudflare: wrangler deploy
# Docker: npm run docker:build && npm run docker:up
```

### 10.4 Common Issues

| Issue                          | Solution                                                                   |
| ------------------------------ | -------------------------------------------------------------------------- |
| OAuth callback error           | Verify redirect URI matches exactly in provider console                    |
| Email not sending              | Check `EMAIL_PROVIDER=resend`, verify API key, check Resend logs           |
| Stripe webhook fails           | Verify `STRIPE_WEBHOOK_SECRET`, check webhook endpoint URL                 |
| Database connection error      | Verify `DATABASE_URL`, check Supabase project is not paused                |
| DAT questions show 0           | Run `npm run db:seed:dat:full`                                             |
| PAT Academy shows no questions | Expected — PAT questions are generated on the fly from seeds, never stored |

### 10.5 Supabase Inactivity Pause

Free Supabase projects pause after 1 week of inactivity. To unpause:

1. Go to Supabase Dashboard
2. Click **"Restore project"**
3. Wait 1-2 minutes

To prevent pausing, consider:

- Upgrading to Supabase Pro ($25/mo)
- Using a cron job to ping the database daily
- Visiting the dashboard weekly

---

## Quick Reference: All Environment Variables

```bash
# ── Required ──────────────────────────────────────────────────
APP_SECRET=                          # Strong random secret (min 32 chars)
DATABASE_URL=                        # Supabase PostgreSQL connection string
VITE_GOOGLE_CLIENT_ID=               # Google OAuth (frontend, build-time)
GOOGLE_CLIENT_ID=                    # Google OAuth (backend)
GOOGLE_CLIENT_SECRET=                # Google OAuth secret
OWNER_UNION_ID=                      # Your Google "sub" → admin role

# ── OAuth (optional — enable only what you offer) ─────────────
APPLE_CLIENT_ID=                     # Apple Services ID
APPLE_TEAM_ID=                       # Apple Team ID (10 chars)
APPLE_KEY_ID=                        # Apple private key ID
APPLE_PRIVATE_KEY=                   # PEM-encoded Apple private key
MICROSOFT_TENANT=common              # Microsoft Entra tenant
MICROSOFT_CLIENT_ID=                 # Microsoft client ID
MICROSOFT_CLIENT_SECRET=             # Microsoft client secret
LINKEDIN_CLIENT_ID=                  # LinkedIn client ID
LINKEDIN_CLIENT_SECRET=              # LinkedIn client secret
FACEBOOK_CLIENT_ID=                  # Facebook app ID
FACEBOOK_CLIENT_SECRET=              # Facebook app secret
X_CLIENT_ID=                         # X (Twitter) client ID
X_CLIENT_SECRET=                     # X (Twitter) client secret
DISCORD_CLIENT_ID=                   # Discord client ID
DISCORD_CLIENT_SECRET=               # Discord client secret
INSTAGRAM_CLIENT_ID=                 # Instagram app ID
INSTAGRAM_CLIENT_SECRET=             # Instagram app secret

# ── Payments ──────────────────────────────────────────────────
STRIPE_SECRET_KEY=                   # sk_test_... or sk_live_...
STRIPE_WEBHOOK_SECRET=               # whsec_... for webhook verification
STRIPE_PRICE_PREMIUM_MONTHLY=        # price_... for $39/mo plan
STRIPE_PRICE_PREMIUM_3MONTH=         # price_... for $99 one-time 3-Month window
STRIPE_PRICE_PREMIUM_YEARLY=         # price_... for $249/yr plan
STRIPE_PRICE_UPGRADE_MONTHLY_TO_3MONTH=   # price_... top-up ($60)
STRIPE_PRICE_UPGRADE_MONTHLY_TO_YEARLY=   # price_... top-up ($210)
STRIPE_PRICE_UPGRADE_3MONTH_TO_YEARLY=    # price_... top-up ($150)

# ── Email ─────────────────────────────────────────────────────
EMAIL_PROVIDER=                      # "console" or "resend"
EMAIL_FROM=                          # noreply@yourdomain.com
RESEND_API_KEY=                      # re_... (if using Resend)
PUBLIC_APP_URL=                      # https://your-domain.com

# ── Vercel Cron ───────────────────────────────────────────────
CRON_SECRET=                         # Random string for cron authentication
```

---

_Last updated: 2026-08-03T22:40:00-04:00_
