# PreDent Canada — Developer Guide

This guide is for developers who will extend, maintain, or deploy PreDent Canada.

> Last updated: 2026-08-07T15:45:00-04:00

## Table of Contents

1. [Project Structure](#project-structure)
2. [Tech Stack](#tech-stack)
3. [Getting Started](#getting-started)
4. [Architecture](#architecture)
5. [Adding a New Feature](#adding-a-new-feature)
6. [Database & Migrations](#database--migrations)
7. [API (tRPC) Conventions](#api-trpc-conventions)
8. [Frontend Conventions](#frontend-conventions)
9. [Testing](#testing)
10. [Theming](#theming)
11. [Recommended Next Features](#recommended-next-features)
12. [Performance Notes](#performance-notes)

---

## Project Structure

```
.
├── api/                    # Vercel serverless entry point only
│   └── index.ts
├── server/                 # Backend (Hono + tRPC)
│   ├── auth/               # OAuth / session integration
│   ├── lib/                # Email, env, cookies, task scheduler, rate limiting
│   ├── queries/            # Database connection + user queries
│   ├── auth-router.ts      # Auth routes (me, logout)
│   ├── profile-router.ts   # User profile CRUD
│   ├── task-router.ts      # Application planner tasks
│   ├── pat-router.ts       # PAT practice, analytics, attempts
│   ├── dat-router.ts       # DAT practice and stats
│   ├── tools-router.ts     # Competitiveness calculator
│   ├── interview-router.ts # Interview question bank
│   ├── payment-router.ts   # Stripe checkout + billing portal
│   ├── admin-router.ts     # Admin dashboard, user/role/question management
│   ├── community-router.ts # Posts, comments, reports, moderation
│   ├── notification-router.ts # In-app + push + email notifications
│   ├── router.ts           # Root router composition
│   ├── app.ts              # Hono app setup
│   ├── boot.ts             # Production server entry
│   ├── context.ts          # tRPC context creation
│   └── middleware.ts       # Procedure builders (publicQuery, authedQuery, adminQuery)
├── contracts/              # Shared types, constants, school data
├── db/                     # Drizzle schema, relations, migrations, seeds
├── public/                 # Static assets, PWA files
├── src/                    # React frontend
│   ├── components/         # UI components (shadcn/ui + custom)
│   ├── hooks/              # useAuth, useTier, usePageTitle, useRecordPATAttempt
│   ├── pages/              # Route pages (~30 pages)
│   ├── providers/          # Theme, tRPC providers
│   ├── lib/                # Utilities (cn)
│   ├── App.tsx             # Route definitions
│   └── main.tsx            # Entry point
├── docs/                   # Documentation
│   ├── user/               # End-user guides
│   ├── dev/                # Developer & operator guides
│   └── design/             # PRD and planning docs
├── .agents/                # Agent session resume
├── Dockerfile
├── docker-compose.yml
├── vercel.json
└── .github/workflows/ci.yml
```

---

## Tech Stack

- **Frontend:** React 19, Vite 7, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion, React Router (BrowserRouter)
- **Backend:** Hono, tRPC, Node.js, esbuild
- **Database:** PostgreSQL (Supabase) via `postgres` driver, Drizzle ORM, Drizzle Kit
- **Auth:** OAuth 2.0 via Google, Apple, Microsoft, LinkedIn, Facebook, X (Twitter), Discord, and Instagram (using the `arctic` library)
- **Testing:** Vitest
- **Deployment:** Docker, Docker Compose, GitHub Actions

---

## Getting Started

```bash
npm install
# create .env (see [Admin & Operations Guide](./admin-guide.md))
npm run db:migrate
npm run db:seed:dat:full
npm run dev
```

---

## Architecture

### Frontend

- `src/App.tsx` defines routes.
- `src/providers/trpc.tsx` sets up tRPC client.
- `src/providers/theme.tsx` manages light/dark/system theme.
- Pages are function components that call `usePageTitle` and tRPC hooks.

### Backend

- `server/app.ts` creates the Hono transport app; Stripe lifecycle decisions live in `server/services/stripe-webhook-service.ts`, while cron endpoints invoke bounded worker/reconciliation services.
- `server/boot.ts` serves static files and starts the Node production server.
- `server/router.ts` composes 13 routers: `auth`, `profile`, `task`, `pat`, `tools`, `interview`, `payment`, `dat`, `admin`, `community`, `notification`, `saved`, `flash`, plus a `ping` endpoint.
- `server/middleware.ts` defines `publicQuery`, `authedQuery`, `authedMutation`, `adminQuery`, and `createRouter`.
- `server/queries/connection.ts` creates a singleton `postgres` Drizzle client.

### Authentication

OAuth is handled by `server/auth/auth.ts` and provider-specific code in `server/auth/providers.ts` using the `arctic` library:

- `GET /api/oauth/authorize/:provider` — backend generates OAuth state + PKCE verifier, stores them in httpOnly cookies, and redirects the user to the provider.
- `GET /api/oauth/callback` — provider redirects back here; the backend validates state, exchanges the code, fetches the user profile, upserts the user, and sets the session cookie.
- Supported providers: `google`, `apple`, `microsoft`, `linkedin`, `facebook`, `x`, `discord`, `instagram`.
- Providers appear on the login page automatically when their client ID/secret are configured. If credentials are missing, the backend returns `provider_not_configured`.
- New providers can be added by extending `server/auth/providers.ts` and the `users.provider` enum in `db/schema.ts`.
- Session tokens are signed HS256 JWTs containing `unionId`, `provider`, and `tokenVersion`.

### Database

- `db/schema.ts` defines 19 tables using Drizzle PostgreSQL core, including `communityReactions` for idempotent likes and `outboxJobs` for durable asynchronous notification delivery.
- `db/relations.ts` defines all foreign-key relationships.
- PAT questions are never stored in the DB — generated on the fly from numeric seeds (see `contracts/pat-stats.ts`, `server/lib/pat-generation/`, `src/lib/prng.ts`). Generators follow the authentic recent-DAT (ADA) format — see `docs/design/pat-research.md` and the PAT format section of `AGENTS.md` (choice counts 5/4/4/5/5/4, dashed hidden TFE lines, half-fold hole punching, etc.).
- `db/seed-dat.ts` seeds 15 DAT questions; `db/seed-dat-full.ts` seeds 500; `db/seed-interview.ts` seeds 24 interview questions.
- Migrations are generated with `npm run db:generate` and applied with `npm run db:migrate`.

---

## Adding a New Feature

1. **Schema** — If you need new data, add tables to `db/schema.ts` and generate a migration.
2. **Backend Router** — Create a new router in `server/` or extend an existing one. Export it from `server/router.ts`.
3. **Frontend Page** — Create a page in `src/pages/` and add a route in `src/App.tsx`.
4. **Navigation** — Add a link in `src/components/Navbar.tsx` if needed.
5. **Tests** — Add Vitest tests in `server/**/*.test.ts` or `src/**/*.test.ts`.
6. **Docs** — Update [`devlog.md`](./devlog.md) and relevant guides.

### Example: Add a New Tool

Create `server/my-tool-router.ts`:

```ts
import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";

export const myToolRouter = createRouter({
  calculate: publicQuery
    .input(z.object({ value: z.number() }))
    .query(({ input }) => ({ result: input.value * 2 })),
});
```

Register in `server/router.ts`:

```ts
import { myToolRouter } from "./my-tool-router";

export const appRouter = createRouter({
  // ...
  myTool: myToolRouter,
});
```

Consume in frontend:

```ts
const { data } = trpc.myTool.calculate.useQuery({ value: 5 });
```

---

## Database & Migrations

### Schema Changes

After editing `db/schema.ts`:

```bash
npm run db:generate
npm run db:migrate
```

### PostgreSQL Notes

- Native `enum` type supported via `varchar` with enum values.
- `boolean` is native PostgreSQL boolean.
- `jsonb` columns support indexing and efficient queries.
- Connection pooling is handled by Supabase's built-in pooler.

---

## API (tRPC) Conventions

- Use `publicQuery` for unauthenticated endpoints.
- Use `authedQuery`/`authedMutation` for endpoints requiring a user.
- Validate inputs with Zod.
- Keep routers focused (PAT, tools, interview, etc.).
- Return typed objects from queries/mutations.
- Place reusable DB logic in `server/queries/`.

---

## Frontend Conventions

- Use Tailwind utility classes.
- Prefer shadcn/ui components for consistency.
- Use `usePageTitle` on every route page.
- Use tRPC hooks from `trpc` provider.
- For theme-aware colors, use CSS variables:
  - `bg-[var(--page-bg)]`
  - `text-[var(--text-primary)]`
  - `text-[var(--text-secondary)]`
  - `text-[var(--text-tertiary)]`
  - `bg-[var(--page-surface)]`
  - `bg-[var(--page-muted)]`
  - `border-[var(--border-color)]`
- Avoid hardcoded `#0F172A` / `text-white` on new pages.

### Page Header & Navigation Conventions

Top-level index/academy pages (e.g. `/schools`, `/pat-academy`, `/dat-academy`) use an icon + title header with no back link:

```tsx
<div className="pt-20 pb-12 bg-gradient-to-br from-[var(--page-bg)] to-[var(--page-surface)]">
  <div className="section-container max-w-7xl mx-auto">
    <div className="flex items-center gap-4">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#10B981] flex items-center justify-center">
        <Icon className="w-7 h-7 text-white" />
      </div>
      <div>
        <h1 className="text-3xl lg:text-4xl font-bold text-[var(--text-primary)]">
          Page Title
        </h1>
        <p className="text-[var(--text-secondary)]">Short subtitle.</p>
      </div>
    </div>
  </div>
</div>
```

Deeper/subpages should add a small parent back-link at the top of the content area:

```tsx
<Link
  to="/parent"
  className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-4"
>
  <ArrowLeft className="w-4 h-4" />
  Back to Parent
</Link>
```

All page content containers use `section-container max-w-7xl mx-auto` for a consistent maximum width. The navbar always renders with the theme-aware scrolled background (`bg-[var(--page-bg)]/95 backdrop-blur-md shadow-md border-b border-[var(--border-color)]`) and does not have a transparent top-of-page state.

### Card Click Targets

- Cards that represent a single entity (e.g. a dental school) should wrap the whole card in a `<Link>` to that entity's detail page.
- Keep distinct action buttons (e.g. "Practice") separate from the main link so users can still trigger actions without navigating.

### Security & Backend Conventions

- **Sessions:** Store a `tokenVersion` in the `users` table, include it in the JWT, and verify it on every request. Increment on logout to revoke existing tokens.
- **Rate limiting:** Public API groups use Hono middleware backed by atomic
  Upstash Redis REST counters in production. Configure
  `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`; requests fail closed
  with 503 if the shared store is unavailable. Local development uses the
  in-process store. `RATE_LIMIT_ALLOW_IN_MEMORY=true` is an explicit
  single-instance production escape hatch and must not be used on Vercel or a
  horizontally scaled deployment.
- **Trusted client IPs:** Vercel uses its sanitized
  `X-Vercel-Forwarded-For`. Traditional deployments use the socket address
  unless `TRUST_PROXY=true`; Cloudflare origins may opt into
  `TRUST_CLOUDFLARE_PROXY=true`. Never enable either trust flag unless the
  corresponding proxy is the only path to the origin.
- **Soft deletes:** Use `deletedAt` timestamps instead of hard deletes for destructive admin actions, and keep an `adminActions` audit log.
- **Environment variables:** Read `process.env` directly for values that may change between tests. Cache only values accessed on every request (e.g., `APP_SECRET`, `DATABASE_URL`).

---

## Testing

Run tests:

```bash
npm test
npm run test:frontend
npm run test:e2e
```

Playwright is pinned and configured to use the installed Google Chrome channel
instead of downloading an OS-specific browser bundle. Local and CI E2E runners
must therefore provide Google Chrome.

Database integration tests are opt-in and must use a disposable PostgreSQL
database supplied through `TEST_DATABASE_URL`. The test harness deliberately
ignores the normal application `DATABASE_URL` and never loads `.env`, because
integration suites create and delete shared rows.

GitHub Actions provisions its own PostgreSQL 16 service, applies all committed
migrations, and supplies that service through `TEST_DATABASE_URL`. A CI run
that cannot migrate or execute the integration suite fails rather than falling
back to skipped database coverage.

```bash
TEST_DATABASE_URL=postgresql://localhost:5432/predent_test npm test
```

Add new tests next to the code they test. Example:

```ts
import { describe, it, expect } from "vitest";

describe("myFeature", () => {
  it("works", () => {
    expect(true).toBe(true);
  });
});
```

---

## Theming

Theme state is managed in `src/providers/theme.tsx`. It supports `light`, `dark`, and `system`.

To make a new page theme-aware:

1. Use `bg-[var(--page-bg)]` for the main background.
2. Use `text-[var(--text-primary)]` for primary text.
3. Use `bg-[var(--page-surface)]` for cards/panels.
4. Use `border-[var(--border-color)]` for borders.

For pages that should always be dark/light regardless of toggle, apply the `dark` class to a wrapper element.

---

## Recommended Next Features

### Active Opportunities

1. **PAT Predicted Score** — Improve algorithm to account for difficulty distribution, category performance, time spent (#21)
2. **Silent Error Swallowing** — Replace `.catch(() => {})` with proper error logging in community-router.ts (#24)
3. **Schema Cleanup** — Remove unused `kimi` from provider enum (#50)

### Completed (kept for reference)

- **~~Community Post Edit~~** _(done — EditPostDialog component, userId in listPosts)_
- **~~Email Provider Fix~~** _(done — unsupported SendGrid configuration removed from current operator docs; Resend is the supported production provider)_
- **~~Interview Questions to DB~~** _(done — interviewQuestions table, seed script, router updated)_
- **~~DAT Analytics~~** _(done — getAnalytics endpoint with trend, heatmap, strengths, weaknesses)_
- **~~Study Schedule Generator~~** _(done — DynamicScheduleGenerator with test date, hours/week, comfort levels)_
- **~~Shared Provinces~~** _(done — DashboardPage uses contracts/schools.ts provinces)_
- **~~On-the-Fly PAT Generation~~** _(done — seeded PRNG, 6 generators, quota system, 140 tests)_
- **~~PAT Generators~~** _(done — all 6 categories with DB persistence + on-the-fly generation)_
- **~~E2E Tests~~** _(done — Playwright smoke tests)_
- **~~Production Error Tracking~~** _(done — Sentry integrated)_
- **~~DAT Question Banks~~** _(done — Biology, Chemistry, Reading Comprehension)_
- **~~Payment & Premium Gating~~** _(done — Stripe Checkout, webhooks, billing portal)_
- **~~Admin Dashboard~~** _(done — stats, user/role management, question management)_
- **~~Email Notifications~~** _(done — Resend/SendGrid, study reminders, task due-date reminders, community notifications)_
- **~~Community Hub~~** _(done — posts, comments, reports, moderation, tabbed feed)_
- **~~Web Push Notifications~~** _(done — VAPID, service worker, settings toggle)_
- **~~Product Analytics~~** _(done — PostHog pageviews and key events)_
- **~~Advanced Study Planner~~** _(done — calendar view, filters, scheduling suggestions)_
- **~~Database Migration~~** _(done — PostgreSQL on Supabase)_
- **~~Code Splitting~~** _(done — all pages lazy-loaded)_
- **~~API Rate Limiting~~** _(done — shared Redis REST fixed-window limiting in production; explicit in-memory development fallback)_

---

## Performance Notes

- All pages are code-split via `lazy()` — main chunk is ~606 KB, individual pages load on demand.
- `dist/boot.js` is ~2 MB (server + dependencies).
- Database is hosted on Supabase — no local file I/O.
- tRPC batching is enabled by default in react-query; fine for most use cases.
- Static assets are served from `dist/` in production.
