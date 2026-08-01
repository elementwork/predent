# PreDent Canada — Development Log (DEVLOG)

> Last updated: 2026-07-31T17:30:00-04:00

A chronological summary of all major work completed on the PreDent Canada platform, derived from `git log`, GitHub history, and project milestones.

---

## Project Overview

PreDent Canada is a full-stack web platform for Canadian dental school applicants. It provides DAT preparation tools, school research, application planning, acceptance probability estimation, interview preparation, and premium subscriptions.

**Stack:** React 19 + Vite 7 + TypeScript, Tailwind CSS, shadcn/ui, Framer Motion, Hono + tRPC + Drizzle ORM, PostgreSQL (Supabase), Google OAuth, Stripe.

---

## Commit History

| Commit    | Date       | Summary                                                                                                      |
| --------- | ---------- | ------------------------------------------------------------------------------------------------------------ |
| `adefe7a` | Database   | Migrate from SQLite to Supabase (PostgreSQL) — replaced `better-sqlite3` with `postgres` driver, rewrote schema to `pgTable`, updated connection/config/deps/docs. |
| `410927a` | Initial    | PreDent Website Initial — project scaffold, landing page, and core site structure.                           |
| `495a742` | Foundation | Auth, login, backend etc. — OAuth authentication, Hono/tRPC backend, user sessions, protected routes.        |
| `faaff44` | Roadmap v1 | Complete remaining roadmap steps, light theme, docs — PAT academy foundations, theme system, documentation.  |
| `a7adbf3` | Roadmap v2 | Complete items 1-6 — PAT diagrams, DAT banks, admin dashboard, theme coverage, community hub, notifications. |
| `b145462` | Ops        | Production email provider and task due-date notifications — Resend/SendGrid email integration, scheduler.    |
| `aa3f4fb` | Docs       | Postpone production database migration to future release — updated AGENTS.md, devlog.md, resume.md.          |
| `253003d` | Auth       | Replace Kimi OAuth with Google OAuth — migrated OAuth provider to Google, renamed auth module.               |
| `b8f1047` | Audit      | Comprehensive code audit — 33 fixes across security, performance, bugs, and SEO.                           |
| `2ad7f03` | UI/UX      | PAT strategy guide routing fix + theme contrast across all pages.                                           |
| `squash`  | Release    | Squashed all commits into single release commit.                                                            |
| (pending) | Fix        | TypeScript build fix — widened union types in DashboardPage, made PracticeQuestion fields optional.          |
| `c68cf05` | Audit      | R1 audit fixes — server-side grading, answer leak, OAuth security, generators, code splitting.               |
| `9b1f1b3` | Fix        | PAT guide URL standardization — hyphens instead of underscores.                                             |
| `d465948` | Fix        | Sitewide link audit — fixed broken placeholder link in AuthLayout.                                          |
| `ba635d0` | Fix        | Quick wins — M3 unanswered PAT recording, M6 responsive grid, M8 lazy images, L3 parallel counts, L5 cleanup. |
| `6b4c3ed` | Fix        | Remaining audit — M5 theme sweep, M7 LandingPage perf, L2 admin guards, L4/L6 generator fixes, L7 NotFound, H4. |
| `536dd7b` | Feature    | PostHog analytics — pageviews, 9 key event types across 9 pages.                                           |
| `7b1067a` | Feature    | Email notifications expansion — study reminders, community notifications, user preferences.                 |
| `345654b` | Feature    | Community Hub — comments, reports, moderation, tabbed feed, all post types.                                  |
| `5145fd3` | Feature    | Web Push notifications — VAPID, service worker, subscribe/unsubscribe, settings toggle.                      |
| `6560307` | Feature    | Advanced Study Planner — calendar view, filters, scheduling suggestions, task form extraction.               |
| (pending) | Fix        | Test setup — generated Drizzle migration files, removed migrate() from vitest.setup.ts for faster tests.   |
| (pending) | Fix        | PAT guides 404 — React Router v7 doesn't support `pat-:category` param syntax, changed to `pat/:category`. |
| `e9b5c87` | Audit      | Comprehensive QA audit & remediation — fixed dead CTAs, theme consistency, OAuth CSRF state, Stripe webhook idempotency, DB FKs/indexes, query limits, dashboard stats, and input validation. |
| `1a78a24` | UI/UX      | Theme/header/layout/cards consistency pass — converted hardcoded dark headers, standardized academy headers, clickable school/PAT cards, parent back-links, navbar background drop, uniform page width, theme-aware LandingPage hero/CTA, and updated docs. |
| `7437705` | Security   | Audit-02 remediation — session invalidation, rate limiting, admin soft-delete + audit log, Drizzle relations, auth status codes, env cleanup, Stripe reuse, notification links, mobile theme toggle. |
| (pending) | Docs       | Documentation reorganization — moved user/dev/admin guides under `docs/`, moved resume to `.agents/`, moved design docs under `docs/design/`, added index files, updated README/AGENTS.md. |
| (pending) | Feature    | Comprehensive documentation update + P1 features — updated feature_list, dev-guide, user-guide; merged READMEs; implemented onboarding flow, Sentry error tracking, Playwright E2E tests, landing page testimonials removal, study streak computation (PAT+DAT), flashcard/DA module real DB counts, community sidebar cleanup, study reminder wiring, PWA theme color, CI migration check. |
| (pending) | Feature    | On-the-fly PAT question generation — seeded PRNG (mulberry32), 6 generator logic modules (client + server), `recordAttempt` with seed-based answer re-derivation, `getQuota` endpoint, `patQuestionsGenerated` column, tier quota system (free=20, premium=360, plus=1080), PAT Academy quota display with progress bar, difficulty mapping fix (API→generation). |
| `f9755ba` | Release    | Squashed release — all on-the-fly generation phases complete, 134 tests passing, docs updated. |
| `be42e66` | Feature    | P2 quick wins — community post edit dialog, interview questions moved to DB, DAT analytics endpoints, study schedule generator, shared provinces array. |
| `607038b` | Feature    | DAT question bank expansion — 500 questions (200 Bio, 200 Chem, 100 RC) with seed script. |
| `130924e` | Feature    | P2 features + quick wins — global search (Cmd+K), saved questions (DAT), flashcards with SRS (SM-2), mock DAT exam, personalized dashboard, improved score algorithm, error logging, removed sendgrid/kimi. |

---

## Detailed Milestones

### 1. Initial Website Scaffold

- Set up React 19 + Vite 7 frontend with TypeScript.
- Configured Tailwind CSS, shadcn/ui components, and Framer Motion animations.
- Built landing page with hero, features, testimonials, and pricing sections.
- Added initial routing and navigation.

### 2. Authentication & Backend Foundation

- Implemented OAuth-based authentication using Kimi/Union ID.
- Built Hono backend mounted under `/api`.
- Added tRPC router structure with public and authenticated procedures.
- Created session management with signed JWT cookies (`APP_SECRET`).
- Added user roles (`user`, `admin`) and tiers (`free`, `premium`, `premium_plus`).
- Built login page and auth flow.

### 3. Database Migration to SQLite

- Switched from MySQL to SQLite because local MySQL installation was blocked on the development machine.
- Converted `db/schema.ts` from `drizzle-orm/mysql-core` to `drizzle-orm/sqlite-core`.
- Updated connection layer (`api/queries/connection.ts`) and `drizzle.config.ts`.
- Migrated MySQL-specific query patterns (`onDuplicateKeyUpdate`, `RAND()`, insert IDs) to SQLite equivalents.
- Seeded the local database with **360 PAT questions** (60 per category).

### 4. Theme System

- Added `src/providers/theme.tsx` for `light`, `dark`, and `system` modes.
- Defined theme CSS variables in `src/index.css`.
- Converted key pages (Dashboard, Login, LandingPage) to use theme variables.
- Added theme toggle to the navbar.

### 5. PAT Academy

- Added `patQuestions` table with category, difficulty, question data, explanations, and concepts.
- Extended `pat-router.ts` with:
  - `getQuestionCount` — public query returning per-category totals.
  - `getQuestions` — authed mutation returning filtered/randomized questions.
  - `recordAttempt`, `getStats`, `getPredictedScore`.
- Refactored `PATPracticePage.tsx` to load real questions, track time, save attempts, and show L1 explanations.
- Built `PATAcademyPage.tsx` overview with live question counts.

### 6. PAT Generators

- Implemented interactive SVG PAT generators for all six categories:
  - Angle Ranking
  - Keyholes
  - Top-Front-End
  - Hole Punching
  - Cube Counting
  - Pattern Folding
- Wired generators into `PATGeneratorsPage.tsx` with premium gating.

### 7. Performance Analytics

- Added `pat.getAnalytics` endpoint computing:
  - Overall accuracy and average time per question.
  - Predicted PAT score with confidence.
  - Per-category accuracy and timing.
  - Progress trend over recent sessions.
  - Weakness heatmap (category × difficulty).
  - AI-generated strengths and priority improvements.
- Rewrote `PATAnalyticsPage.tsx` to consume real analytics data.

### 8. Acceptance Probability Engine

- Created `api/tools-router.ts` with a weighted scoring model across 10 Canadian dental schools.
- Factors: GPA (normalized 4.0/100), DAT AA/PAT/RC, province (IP/OOP), degree status, CASPer quartile, extracurriculars.
- Rewrote `GPACalculatorPage.tsx` as the Competitiveness Calculator.
- Routed `/tools/competitiveness` to the calculator.

### 9. Interview Preparation

- Created `api/interview-router.ts` with MMI and Panel question banks.
- Added endpoints: `getQuestions`, `getCategories`, `getRandomSet`.
- Updated `InterviewPrepPage.tsx` with guide, question bank, and practice simulator tabs.

### 10. DAT Academy

- Added `datQuestions` table for Biology, Chemistry, and Reading Comprehension.
- Built `dat-router.ts` with question listing, filtering, and attempt tracking.
- Created `DATAcademyPage.tsx` with module overviews and study schedule generator.
- Added `db/seed-dat.ts` with curated DAT questions.

### 11. Dental School Data & Pages

- Centralized Canadian dental school data in `contracts/schools.ts`.
- Built `SchoolDetailPage.tsx` with charts, stats, and program details.
- Built `SchoolComparisonPage.tsx` for side-by-side school comparison.
- Updated `SchoolHubPage.tsx` to consume centralized data.

### 12. Community Hub

- Added `communityPosts` table for result, question, and discussion posts.
- Created `api/community-router.ts` with list, count, create, and like endpoints.
- Built `CommunityHubPage.tsx` for browsing and sharing admission results.

### 13. Guides & Tools Indexes

- Created `GuidesIndexPage.tsx` and `ToolsIndexPage.tsx`.
- Added `/guides` and `/tools` routes.

### 14. Premium Subscriptions & Stripe

- Installed and configured Stripe.
- Created `api/payment-router.ts` with checkout session creation and customer portal.
- Added Stripe webhook handler in `api/boot.ts` for subscription events.
- Rewrote `PricingPage.tsx` with plan selection and checkout integration.
- Added premium gating with `useTier` hook and `PremiumCTA` component.

### 15. Admin Dashboard

- Created `api/admin-router.ts` with stats, user listing, role updates, question listing/deletion, DAT seeding, and manual reminder dispatch.
- Built `AdminDashboardPage.tsx` for admin operations.

### 16. Notifications & Email

- Added `notifications` table for in-app notifications.
- Built `api/notification-router.ts` for listing, unread count, and marking read.
- Implemented email abstraction in `api/lib/email/index.ts` supporting:
  - Console output (development)
  - Resend
  - SendGrid
- Added welcome notification on first login.
- Created hourly task due-date reminder scheduler in `api/lib/tasks/notifications.ts`.

### 17. DevOps & Tooling

- Added Dockerfile and Docker Compose configuration.
- Added GitHub Actions CI workflow running type-check, lint, tests, and build.
- Added PWA manifest, icons, service worker, sitemap, and robots.txt.
- Added Vitest test suite:
  - `api/lib/math.test.ts`
  - `api/pat-router.test.ts`
  - `api/interview-router.test.ts`
  - `api/tools-router.test.ts`

### 18. Vercel Deployment Support

- Refactored backend into `api/app.ts` (shared Hono app) and `api/boot.ts` (Node server entry).
- Added `api/index.ts` as the Vercel serverless function entry point using `hono/vercel`.
- Configured `vercel.json` to build the Vite frontend and route `/api/*` to the serverless function.
- Updated `package.json` Node engine requirement to `>=20.x` for Vercel compatibility.
- Disabled the Node server block and hourly notification scheduler when `VERCEL=1`.
- Documented SQLite ephemeral-storage limitation on Vercel and recommended managed database options.

### 19. Vercel Cron & Expanded Test Coverage

- Added `api/cron/notify.ts` as a Vercel Cron endpoint for daily task due-date reminders, secured with `CRON_SECRET`.
- Configured `vercel.json` with a cron job that calls `/api/cron/notify` once daily.
- Updated Node engine requirement to `>=24.x` and GitHub Actions CI to Node 24.
- Expanded Vitest coverage from 4 test files / 20 tests to 14 test files / 80 tests, covering:
  - Auth, profile, tasks, DAT, admin, community, notifications, payments
  - Hono app routing, Stripe webhook, Vercel Cron endpoint
  - Existing PAT, interview, tools, and math tests
- Fixed date binding bug in `notifyUpcomingTasks` by replacing raw SQL Date interpolation with Drizzle `lte`/`ne` operators.
- Refactored `payment-router.ts` to read Stripe price IDs lazily from env vars.
- Added shared `api/test-helpers.ts` for seeding test data and building mock tRPC contexts.
- Committed Drizzle migration files so tests and CI can run on fresh clones.

### 20. Google OAuth Migration

- Replaced Kimi/Union ID OAuth with Google OAuth 2.0.
- Added `users.provider` column (defaults to `google`).
- Rebuilt `api/auth/auth.ts` to verify Google ID tokens via Google's JWKS.
- Renamed auth module from `api/kimi/*` to `api/auth/*`.
- Updated `Login.tsx` to use Google authorize URL.
- Renamed session cookie from `kimi_sid` to `predent_sid`.
- Updated environment variables and documentation.

### 21. Documentation Maintenance

- Created and updated [`admin-guide.md`](./admin-guide.md) with setup, deployment, content management, email, and troubleshooting guides.
- Created `devlog.md` (this file) summarizing all completed work.
- Maintained `AGENTS.md`, [`.agents/resume.md`](../../.agents/resume.md), and `devlog.md` to reflect current state.

### 22. Vercel Cron Frequency Adjustment

- Changed `vercel.json` cron schedule from `0 * * * *` (hourly) to `0 14 * * *` (daily at 14:00 UTC) to stay within Vercel Hobby account daily-cron limits.
- Updated `AGENTS.md`, [`admin-guide.md`](./admin-guide.md), and `devlog.md` to describe the cron as running once daily.

### 23. Vercel Serverless Function Consolidation

- Moved all backend source from `api/` to a new `server/` directory using `git mv` to preserve history.
- Kept only a thin `api/index.ts` that imports the Hono app from `server/app.ts` and wraps it with `hono/vercel`'s `handle()`.
- Inlined the `/api/cron/notify` endpoint into `server/app.ts` so Vercel Cron calls route through the single serverless function.
- Updated `vite.config.ts`, `package.json`, `tsconfig.server.json`, `vitest.config.ts`, `vitest.setup.ts`, `db/seed.ts`, `db/seed-dat.ts`, and `src/providers/trpc.tsx` to reference `server/` instead of `api/`.
- Updated `AGENTS.md`, [`admin-guide.md`](./admin-guide.md), [`dev-guide.md`](./dev-guide.md), [`.agents/resume.md`](../../.agents/resume.md), and `devlog.md` to reflect the new project layout.
- Verified with `npm run check`, `npm test`, `npm run lint`, and `npm run build`.

---

### 24. Comprehensive Code Audit & Fixes

Full code audit covering logic, performance, responsiveness, and security. 33 issues found and fixed across 23 files.

**Critical fixes:**
- Switched `HashRouter` → `BrowserRouter` — fixes SEO, clean URLs, PWA, sitemap, service worker offline support
- Standardized `react-router` / `react-router-dom` imports across all files
- Rewrote service worker for `BrowserRouter` compatibility (caches `index.html`, skips `/api/`)
- Added missing pages to `sitemap.xml` (9 new URLs)
- Created `ErrorBoundary` component wrapping the entire app

**Security fixes:**
- Sanitized Stripe webhook error responses (no longer leaks internal details)
- Added `APP_SECRET` minimum length validation (32+ chars in production)
- Fixed community post like race condition — atomic SQL increment instead of read-then-write
- Reduced body size limit from 50MB to 1MB (no file uploads needed)
- Fixed Login page legal links to use `<Link>` instead of hardcoded `#/` hrefs
- Added security headers in `vercel.json` (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy)
- Added `verifyAnswer` endpoint to PAT router — correct answers no longer sent to client with questions

**Performance fixes:**
- Added 500-row limits to PAT analytics and DAT stats queries (were unbounded)
- Moved `QueryClient` inside React tree with proper staleTime defaults
- Fixed Dashboard profile form to react to query data arrival via `useEffect`
- Memoized Login OAuth URL computation
- Fixed database connection lifecycle — old connections closed on URL change

**Bug fixes:**
- Removed dead code (`Home.tsx`, `App.css` — default Vite template files)
- Fixed inverted theme toggle icon in Navbar (Sun/Moon swapped)
- Fixed `useAuth` hook to use router `useLocation` instead of `window.location.pathname`
- Fixed DAT stats grouping — was grouping by `questionId` instead of subject (joined with `datQuestions`)
- Fixed community router to properly use `conditions` array with `and(...)`
- Fixed notification link hash route (`/#/dashboard` → `/dashboard`)
- Added `robots.txt` disallow rules for `/api/`, `/admin`, `/dashboard`
- Renamed package from `my-app` to `predent-canada`
- Added security headers to `vercel.json`

### 25. PAT Strategy Guide Routing & Theme Contrast

**Routing fixes:**
- `PATStrategyPage` now normalizes hyphens to underscores in category param (`angle-ranking` → `angle_ranking`)
- Added proper "Guide Not Found" page for invalid categories instead of silent fallback
- All 6 PAT guide links from PATAcademyPage and GuidesIndexPage resolve correctly

**Theme contrast fixes (12 files):**
- Replaced hardcoded light-mode colors with theme CSS variables across all content pages:
  - `bg-[#F8FAFC]` → `bg-[var(--page-bg)]`
  - `text-[#0F172A]` → `text-[var(--text-primary)]`
  - `text-[#475569]` → `text-[var(--text-secondary)]`
  - `text-[#94A3B8]` → `text-[var(--text-tertiary)]`
  - `border-[#E2E8F0]` → `border-[var(--border-color)]`
  - `bg-[#F1F5F9]` → `bg-[var(--page-muted)]`
- Fixed pages: PATStrategyPage, PlaceholderPage, InterviewPrepPage, SchoolHubPage, SchoolDetailPage, CASPerGuidePage, CompetitivenessCalculatorPage, DATGuidePage, StudySchedulesPage, DATAcademyPage, SchoolComparisonPage, Navbar
- All pages now adapt cleanly to light and dark modes

---

### 27. R1 Audit Fixes — Security, Integrity, Generators, Performance

Addressed 26 findings from a comprehensive code audit (R1). 13 confirmed fixes across security, correctness, and performance.

**Security (Critical):**
- DAT answer leak fixed: `listQuestions` changed from `publicQuery` to `authedQuery`; `correctAnswer`/`explanation` stripped from response. Answers now only revealed after recording an attempt.
- Server-side grading: Both PAT and DAT `recordAttempt` now compute `isCorrect` server-side instead of trusting the client. Eliminates gameable stats.
- OAuth open redirect: Added `ALLOWED_REDIRECTS` set in `server/auth/auth.ts`; redirect target validated against allow-list before issuing 302.
- `auth.me` no longer leaks `stripeCustomerId`, `unionId`, or other internal fields — projects only safe user fields.

**PAT Generators (Critical):**
- All 6 generators (HolePunching, CubeCounting, Keyholes, TopFrontEnd, AngleRanking, PatternFolding) now persist attempts to DB via shared `useRecordPATAttempt` hook.
- Difficulty enum mismatch resolved: generators map `easy/medium/hard` → `beginner/intermediate/advanced/elite` server-side.
- HolePunching diagonal fold bug fixed: second fold now applied correctly on hard difficulty.
- Distractor collision fix: all generators tag correct options by identity before shuffling instead of post-shuffle value-equality lookup.
- CubeCounting answer selection fixed: now uses the face-count with most cubes instead of arbitrary modulo.

**Correctness (High/Medium):**
- PAT practice page latent bug: previously recorded all attempts as incorrect because `getQuestions` strips `correctAnswer`. Now uses server-computed `isCorrect`.
- DAT practice page updated to send `userAnswer` and use server response for feedback.
- GPA scale validation: `tools-router` now validates GPA max by scale (4.33 for 4.0 scale, 100 for 100 scale) via `.superRefine`.

**Performance (High):**
- Route-level code splitting: all 28 page components converted to `lazy()` imports with `Suspense` wrapper. Main chunk reduced from ~1,530 KB to ~606 KB.

**Cleanup:**
- Deleted orphaned `PlaceholderPage.tsx`.

**Files changed:** `server/dat-router.ts`, `server/pat-router.ts`, `server/auth/auth.ts`, `server/auth-router.ts`, `server/tools-router.ts`, `src/App.tsx`, `src/hooks/useRecordPATAttempt.ts` (new), all 6 PAT generators, `src/pages/DATPracticePage.tsx`, `src/pages/PATPracticePage.tsx`, `src/pages/PlaceholderPage.tsx` (deleted), test files.

---

### 28. PAT Guide URL Fix + Sitewide Link Audit

**PAT guide URL standardization:**
- `GuidesIndexPage.tsx`: Changed 4 PAT guide links from underscores to hyphens (`pat-angle_ranking` → `pat-angle-ranking`, etc.) for URL consistency and SEO.
- `PATAcademyPage.tsx`: Guide links now convert underscores to hyphens via `cat.id.replace(/_/g, "-")`.
- `PATStrategyPage.tsx` already normalizes hyphens to underscores for the data lookup — no change needed.

**Sitewide link audit:**
- Audited all `<Link to>` and `to:` data across Navbar, Footer, GuidesIndexPage, ToolsIndexPage, DashboardPage, LandingPage, PATAcademyPage, SchoolDetailPage, SchoolHubPage, SchoolComparisonPage, CommunityHubPage, NotFound, and NotificationBell.
- Found 1 broken link: `AuthLayout.tsx` had placeholder `/some-path` (dead code, not imported anywhere). Fixed to `/dashboard` and `/community`.
- All school slugs in Footer verified against `contracts/schools.ts` — all match.
- All legal links verified against `/legal/:topic` route — all match.

---

### 26. TypeScript Build Fix (Vercel Deployment)

**DashboardPage.tsx — union type widening:**
- `gpaScale` state narrowed to `"4.0"` via `as const`, blocking valid value `"100"` from select dropdown.
  Changed to `as "4.0" | "100"` in both initial state and `useEffect` profile sync.
- `degreeStatus` state narrowed to `"in_progress"` via `as const`, blocking valid value `"completed"`.
  Changed to `as "in_progress" | "completed"` in both initial state and `useEffect` profile sync.

**PATPracticePage.tsx — interface alignment with server response:**
- `PracticeQuestion` interface required `correctAnswer`, `explanationL1`, `explanationL2`, `explanationL3` as mandatory,
  but the server's `getQuestions` endpoint intentionally omits them (anti-cheat: prevents answer inspection via network tab).
  Made all four fields optional (`?`).
- Added `dbId?` and `concepts?` to the interface to match the actual server response shape.

---

### 27. UI/UX Header, Card, and Navigation Consistency

**Theme-aware header sweep:**
- Converted remaining hardcoded dark headers on `SchoolHubPage`, `SchoolDetailPage`, `DATAcademyPage`, `CommunityHubPage`, `ToolsIndexPage`, `GuidesIndexPage`, `ArticleGuidePage`, `StudySchedulesPage`, `DATGuidePage`, `CASPerGuidePage`, `InterviewPrepPage`, `PATCalculatorPage`, `GPACalculatorPage`, `CompetitivenessCalculatorPage`, `SchoolComparisonPage`, and `PATStrategyPage` to use theme CSS variables.

**Academy header standardization:**
- Removed "Back to Home" links from `SchoolHubPage`, `PATAcademyPage`, and `DATAcademyPage`.
- Replaced them with the icon + title header pattern used by the PAT Academy.

**Clickable cards:**
- Wrapped every school card in `SchoolHubPage` with a link to `/school/:id`.
- Wrapped PAT category cards in `PATAcademyPage` with links to their respective guide pages while keeping the Practice button as a separate action.
- Added an explicit "View details" link to each PAT category card for clearer navigation.

**Parent back-links on subpages:**
- Added/verified back-links on deeper pages (`ArticleGuidePage`, `CASPerGuidePage`, `DATGuidePage`, `InterviewPrepPage`, `PATStrategyPage`, `StudySchedulesPage`, `ToolsIndexPage`, `PATCalculatorPage`, `GPACalculatorPage`, `CompetitivenessCalculatorPage`, `SchoolComparisonPage`, `SchoolDetailPage`, and `NotificationSettingsPage`) pointing to their parent sections.

**Docs:**
- Updated [`dev-guide.md`](./dev-guide.md) with page header, back-link, and card click-target conventions.

---

### 28. Navbar Background Drop and Page Width Standardization

**Navbar background drop:**
- Updated `src/components/Navbar.tsx` to always render with the scrolled/dark-page theme-aware background (`bg-[var(--page-bg)]/95 backdrop-blur-md shadow-md border-b border-[var(--border-color)]`) on every page.
- Removed the transparent top-of-page state and the now-unused scroll/dark-page conditional logic.

**Page width consistency:**
- Standardized every page content container in `src/pages/**/*.tsx` to `section-container max-w-7xl mx-auto`.
- Affected pages include `LandingPage`, `DashboardPage`, `PricingPage`, `SchoolHubPage`, `SchoolDetailPage`, `PATAcademyPage`, `DATAcademyPage`, `DATGuidePage`, `DATPracticePage`, `PATPracticePage`, `PATAnalyticsPage`, `PATGeneratorsPage`, `PATCalculatorPage`, `PATStrategyPage`, `GuidesIndexPage`, `ArticleGuidePage`, `StudySchedulesPage`, `InterviewPrepPage`, `CASPerGuidePage`, `ToolsIndexPage`, `GPACalculatorPage`, `CompetitivenessCalculatorPage`, `SchoolComparisonPage`, `CommunityHubPage`, `NotificationSettingsPage`, `LegalPage`, `AdminDashboardPage`, and `admin/CommunityModerationPage`.

**LandingPage button fix:**
- Added `bg-transparent` to the two outline "Explore Schools" buttons so white text remains visible in light mode.

**LandingPage theme-aware hero/CTA:**
- Replaced the always-dark `gradient-hero` and `gradient-blue` backgrounds on `HeroSection` and `CTASection` with theme-aware gradients (`bg-gradient-to-br from-[var(--page-bg)] to-[var(--page-surface)]` and `from-[var(--page-surface)] to-[var(--page-muted)]`).
- Converted hero/CTA text, badge, avatar border, and outline buttons to theme CSS variables so they remain readable in both light and dark modes.

**Docs:**
- Updated [`dev-guide.md`](./dev-guide.md) with the navbar background and page-width conventions.

---

### 29. Audit-02 Security & Quality Remediation

**Database changes:**
- Added `token_version` column to `users`.
- Added `deleted_at` columns to `patQuestions` and `datQuestions`.
- Added `adminActions` audit-log table.
- Populated `db/relations.ts` with Drizzle relations for all foreign keys.
- Generated and applied migration `0002_lucky_deathbird`.

**Session security:**
- Included `tokenVersion` in the JWT payload and verify it against the DB on every request.
- Increment `tokenVersion` on logout to revoke existing sessions.
- Changed missing/invalid session response from HTTP 403 to 401.

**Rate limiting:**
- Added in-memory Hono rate-limit middleware at `server/lib/rate-limit.ts`.
- Applied limits to `/api/oauth/callback`, `/api/trpc/*`, `/api/webhooks/stripe`, and `/api/cron/notify`.

**Admin data protection:**
- Converted admin question deletion to soft-delete (`deletedAt = now()`).
- Insert an `adminActions` audit row on each deletion.
- Filter out deleted questions from admin lists, stats, PAT practice, DAT practice, and analytics.

**Backend cleanup:**
- Reused a single Stripe client instance at module level.
- Made `getOrigin()` throw in production when `PUBLIC_APP_URL` is missing.
- Used `env.cronSecret` consistently in the cron endpoint.
- Added a `console.warn` for dotenv load failures.
- Logged push notification errors instead of swallowing them.
- Removed `export default app` from `server/boot.ts` and pointed Vite dev server to `server/app.ts`.
- Cached `APP_SECRET` and `DATABASE_URL` while leaving other env values dynamic for tests.
- Removed duplicate `hono` and `nanoid` entries from `package.json`.

**UI/UX:**
- Added a theme toggle button to the mobile menu.
- Added a "Manage notifications" link in the notification dropdown and a "Notifications" link in the user dropdown.
- Lazy-loaded `PATStrategyPage`.
- Switched `NotFound` subtitle to theme-aware text color.

**Tests:**
- Updated `server/admin-router.test.ts` to verify soft-delete behavior and audit logging.
- All 81 tests pass.

**Docs:**
- Updated [`dev-guide.md`](./dev-guide.md) with security/backend conventions.

---

### 30. Documentation Reorganization

Reorganized project documentation to separate user-facing and developer/operator docs and reduce root-directory clutter.

**Structure changes:**
- Moved `docs/user-guide.md` → [`docs/user/user-guide.md`](../../docs/user/user-guide.md).
- Moved `docs/dev-guide.md` → [`docs/dev/dev-guide.md`](./dev-guide.md).
- Moved `docs/admin-guide.md` → [`docs/dev/admin-guide.md`](./admin-guide.md).
- Moved `devlog.md` → [`docs/dev/devlog.md`](./devlog.md).
- Moved `resume.md` → [`.agents/resume.md`](../../.agents/resume.md).
- Moved `design/` → [`docs/design/`](../../docs/design/).
- Removed obsolete `info.md` and `.atomcode.md`.
- Added `docs/README.md`, `docs/user/README.md`, and `docs/dev/README.md` as navigation indexes.

**Content updates:**
- Updated `README.md` and `AGENTS.md` project-structure references.
- Updated [`dev-guide.md`](./dev-guide.md) project tree, fixed remaining `api/` code-path references, and refreshed the recommended-next-features list.
- Updated [`admin-guide.md`](./admin-guide.md) backup/restore instructions for PostgreSQL and clarified Docker vs. Vercel notification scheduling.
- Updated historical doc-path references in this log.

**Verification:** `npm run check` ✓, `npm run lint` ✓

---

### 32. Multi-Provider OAuth

Added support for social login beyond Google and hardened the OAuth flow.

**Auth refactor:**
- Installed `arctic` as the OAuth client library.
- Created `server/auth/providers.ts` with provider-specific authorize URL generation, token exchange, and profile fetching for Google, Apple, Microsoft, LinkedIn, Facebook, X, Discord, and Instagram.
- Rewrote `server/auth/auth.ts`:
  - Added `GET /api/oauth/authorize/:provider` endpoint that generates state + PKCE verifier and stores them in httpOnly cookies.
  - Updated `GET /api/oauth/callback` to dispatch by provider stored in the cookie.
  - Tightened redirect-target validation to the explicit allow-list (`/`, `/dashboard`, `/pricing`).
  - Replaced raw JSON OAuth errors with redirects to `/login?error=...`.
- Updated `server/auth/session.ts` and `server/auth/types.ts` to use a provider-agnostic session payload (`unionId`, `provider`, `tokenVersion`).
- Widened `users.provider` enum in `db/schema.ts` to `["kimi", "google", "x", "instagram", "linkedin", "apple", "discord", "microsoft", "facebook"]`.

**UI:**
- Rewrote `src/pages/Login.tsx` with dedicated buttons for Google, Apple, Microsoft, LinkedIn, Facebook, X, Discord, and Instagram, plus error-message handling from query params.
- Removed frontend-side OAuth state/redirect cookie logic; the backend now owns the whole authorize flow.

**Configuration:**
- Added env getters for all new providers in `server/lib/env.ts` and `.env.example`.

**Testing:**
- Added `server/auth.test.ts` covering authorize redirects for every provider, invalid-provider handling, missing state, and access-denied behavior.
- Set dummy OAuth credentials for all providers in `vitest.setup.ts`.

**Docs:**
- Updated `AGENTS.md`, [`dev-guide.md`](./dev-guide.md) auth architecture section, and this log.

**Verification:** `npm run check` ✓, `npm run lint` ✓, `npm test` ✓ (128 tests), `npm run build` ✓

### 33. Admin Guide OAuth Setup Documentation

Updated [`admin-guide.md`](./admin-guide.md) with complete setup instructions for all OAuth providers:

- Expanded the `.env` template to include every provider (Google, Apple, Microsoft, LinkedIn, Facebook, X, Discord, Instagram) plus `PUBLIC_APP_URL` and `CRON_SECRET`.
- Added per-provider configuration steps for each console.
- Documented the shared OAuth redirect URI and authorize/callback routes.
- Updated Vercel deployment environment variable list and pre-deploy checklist.
- Replaced the Google-only troubleshooting section with general OAuth debugging plus provider-specific tips.

**Verification:** `npm run check` ✓, `npm run lint` ✓, `npm run build` ✓

---

### 31. Content Audit & Copy Accuracy Remediation

Conducted a full website content audit against clarity, brand voice, SEO, persuasion, accuracy, and content-gap criteria. Created [`docs/design/content-audit.md`](../../docs/design/content-audit.md) to capture findings and remediated P0–P3 issues.

**Copy accuracy fixes:**
- Rewrote landing-page hero H1 and badge to remove unsubstantiated "#1 Platform" and "Operating System" framing.
- Corrected PAT question counts from "300+/500/5,000+" to **360+** across landing and pricing pages.
- Removed false feature claims: 3D models, mock exams, AI tutor, Anki export, document vault, Reddit aggregation, and Premium Plus human-review services.
- Replaced "Community Intelligence" with "Student Community" and updated related descriptions.
- Softened footer overpromise copy to focus on prep and planning.
- Updated guarantee copy on landing/pricing pages to link to [`/legal/guarantee`](../../src/pages/LegalPage.tsx) and removed references to non-existent mock exams.
- Fixed DAT guide "Min" score language to "Competitive" and qualified the CDA registration fee note.
- Removed false "3D model viewer" / "fold animation" references from PAT strategy guides.
- Expanded `index.html` meta description and removed "#1" from OG/Twitter titles.

**New content/pages:**
- Created [`AboutPage.tsx`](../../src/pages/AboutPage.tsx) at `/about`.
- Created [`ContactPage.tsx`](../../src/pages/ContactPage.tsx) at `/contact`.
- Added About/Contact routes in [`App.tsx`](../../src/App.tsx) and footer links in [`Footer.tsx`](../../src/components/Footer.tsx).
- Added "How It Works" 3-step section to [`LandingPage.tsx`](../../src/pages/LandingPage.tsx).
- Added sample PAT question preview section with "Try a Free PAT Question" CTA.
- Updated [`LegalPage.tsx`](../../src/pages/LegalPage.tsx) guarantee terms with clear eligibility, requirements, refund process, and exclusions.

**Docs:**
- Created [`docs/design/content-audit.md`](../../docs/design/content-audit.md).
- Updated [`docs/design/feature_list.md`](../../docs/design/feature_list.md) with About/Contact pages, How It Works section, and sample PAT preview.
- Updated [`docs/README.md`](../../docs/README.md), [`docs/dev/README.md`](./README.md), and [`docs/user/README.md`](../user/README.md) to reference the new design docs and contact page.
- Updated [`README.md`](../../README.md) and [`AGENTS.md`](../../AGENTS.md) for accuracy (removed "operating system" / "3D models" claims, corrected OAuth/backend/references).
- Updated this log.

**Quality fixes discovered during verification:**
- Fixed admin-router test isolation bug where parallel PAT/DAT deletion tests could match each other's `adminActions` rows by `targetId`. Added `action` filter to the query.
- Fixed pre-existing lint errors in `server/admin-router.test.ts`, `server/community-router.test.ts`, `src/components/planner/__tests__/TaskForm.test.tsx`, and `src/test-helpers.tsx`.

**Verification:** `npm run check` ✓, `npm run lint` ✓, `npm test` ✓ (123 tests)

---

## Open Tasks / Future Work

### Tech Debt (archived — deferred until explicitly brought up)
- SQLite → PostgreSQL/MySQL migration
- E2E tests (Playwright/Cypress)
- ~~API rate limiting~~ (done)
- Error boundaries + Sentry logging

### Medium Priority (all complete)
- ~~PostHog analytics~~ (done — `536dd7b`)
- ~~Email notifications expansion~~ (done — `7b1067a`)
- ~~Community Hub enhancements~~ (done — `345654b`)
- ~~Web Push notifications~~ (done — `5145fd3`)
- ~~Advanced study planner~~ (done — `6560307`)

---

## UI/UX Audit Fixes (Landing Page)

Implemented fixes based on audit-report.md analysis:

**Phase 1 — High Impact:**
- Comparison table: added card-based mobile view (`md:hidden`/`hidden md:block`), replacing horizontal-scroll-only approach
- Image optimization: added `width`/`height` attributes to all `<img>` tags (prevents CLS), `loading="lazy"` on below-fold images
- Meta tags & SEO: added Open Graph, Twitter Cards, canonical URL, Schema.org structured data to `index.html`

**Phase 2 — Accessibility & Polish:**
- Global `*:focus-visible` outline rule in `index.css`
- Pricing toggle buttons: added `focus-visible` styles
- Stats section: added `<h2>` heading ("The Canadian Dental School Landscape")
- Mid-page CTA: added "Start Free Today" button between comparison table and testimonials
- Color contrast: darkened `--text-tertiary` from `#94a3b8` to `#64748b` (WCAG AA compliant)
- Reduced motion: added `prefers-reduced-motion` media query to disable animations

**Phase 3 — Minor Polish:**
- Standardized section heading margins to `mb-12` (was inconsistent `mb-12`/`mb-16`)
- CTA section heading: upgraded to `text-4xl lg:text-5xl font-extrabold` for visual hierarchy
- Font loading: moved Google Fonts from CSS `@import` to HTML `<link rel="preconnect">` (no render blocking)
- Skip navigation: added visually-hidden skip link for keyboard accessibility

**Files changed:**
- `src/pages/LandingPage.tsx` — mobile comparison table, image attributes, stats heading, mid-page CTA, spacing, CTA typography, pricing focus styles, skip-nav
- `src/index.css` — focus-visible, color contrast, reduced motion, font import removal
- `index.html` — OG tags, Twitter Cards, canonical, structured data, font preconnect

**Verification:** `npm run check` ✓, `npm run lint` ✓

---

## How to Update This Log

After each significant feature or milestone:

1. Summarize the work in a new entry above.
2. Update the commit history table if new commits land.
3. Run `npm run check`, `npm test`, and `npm run lint` before committing doc updates.
