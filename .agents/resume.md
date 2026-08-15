# Session Resume — PreDent Canada

> Last updated: 2026-08-14T00:00:00-04:00

Use this file to quickly get up to speed when continuing work on PreDent Canada.

## Project State

- **Stack:** React 19 + Vite 7 + TypeScript, Tailwind CSS, shadcn/ui, Hono + tRPC + Drizzle ORM, PostgreSQL (Supabase).
- **Database:** PostgreSQL on Supabase, accessed via `postgres` driver. DAT (500) + interview (24) questions are seeded; PAT questions are never stored — generated on the fly from numeric seeds.
- **Build:** All checks pass (`npm run check`, `npm run lint`, `npm test` = 140 tests, `npm run build`).
- **Recent work:** Authentic recent-DAT (ADA) PAT format rewrite — all 6 generators, B&W technical renderers (app + CLI + flashcards), option-count-aware validation, 16 new generator tests (commit `9646430`). See `docs/design/pat-research.md`.
- **Deployment:** CI-gated Vercel deployment, manual rollback, Docker build/scan, uptime monitoring, Prometheus/Grafana definitions, and backup/restore drill workflows are in place.
- **17 DB tables:** users, profiles, tasks, patAttempts, datQuestions, datAttempts, communityPosts, communityComments, communityReports, notifications, pushSubscriptions, schoolStats, stripeWebhookEvents, adminActions, interviewQuestions, savedQuestions, flashcardReviews.

## Environment

Create a `.env` file before running:

```env
APP_SECRET=local-dev-secret-change-in-production
DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
VITE_GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
OWNER_UNION_ID=your-google-sub
```

Run locally:

```bash
npm install
npm run db:migrate
npm run db:seed:dat:full
npm run db:seed:interview
npm run dev
```

## Completed Work

1. **PAT Question Bank & Practice Engine** — real DB-backed questions, attempt tracking, analytics *(replaced by seed-based generation, see #29).*
2. **Performance Analytics** — accuracy, predicted score (weighted algorithm), trends, heatmap, recommendations.
3. **Competitiveness Calculator** — 10-school weighted scoring model.
4. **Interview Prep** — DB-backed question bank (24 questions) + practice simulator.
5. **DAT Academy** — module overviews, study schedule generator, 500-question bank.
6. **PAT Generators** — all 6 categories implemented as interactive SVG prototypes.
7. **PWA** — manifest, icons, service worker.
8. **SEO** — sitemap, robots, page titles, and build-time pre-rendered public routes.
9. **DevOps** — Docker, CI, test suite (140 tests).
10. **Light Theme Toggle** — theme provider, CSS variables, toggle in navbar.
11. **Dental School Hub** — school detail pages, comparison tool, centralized `contracts/schools.ts` data.
12. **Community Hub** — community landing page, comments, likes, reports, edit dialog.
13. **Guides & Tools Indexes** — `/guides` and `/tools` index routes.
14. **Stripe Payments** — checkout sessions, billing portal, webhooks, `PricingPage` integration.
15. **Premium Gating** — `useTier` hook, `PremiumCTA` component, PAT generator tier limits.
16. **Legal Pages** — Privacy Policy, Terms of Service, Refund Policy, Higher Score Guarantee.
17. **High-Fidelity PAT Diagrams** — shared isometric/grid/angle renderers, canvas paper folds, theme-aware SVGs for all 6 categories.
18. **DAT Question Banks** — Biology (200), Chemistry (200), Reading (100) questions with practice UI and attempt tracking.
19. **Admin Dashboard** — stats, user/role management, question management, DAT seeding.
20. **Theme Coverage** — Login, Dashboard, and LandingPage converted to theme CSS variables.
21. **Community Hub** — real user-generated admission-result posts with share dialog, edit dialog.
22. **Email/Notifications** — in-app notification system, email stub, notification bell, welcome notification.
23. **Production Email Provider** — Resend support via `EMAIL_PROVIDER` env var.
24. **Task Due-Date Notifications** — hourly background scheduler + admin manual trigger for planner deadline reminders.
25. **Google OAuth Migration** — replaced legacy OAuth with Google sign-in; `users.provider` column added.
26. **Comprehensive QA Audit** — fixed dead CTAs, theme consistency, OAuth CSRF hardening, Stripe webhook idempotency, database FKs/indexes, dashboard stats, and input validation.
27. **Documentation Reorganization** — moved user/dev/admin guides under `docs/`, moved resume to `.agents/`, moved design docs under `docs/design/`, added index files, updated `README.md` and `AGENTS.md`.
28. **P1 Features** — onboarding flow, Sentry error tracking, Playwright E2E tests, landing page testimonials removal, study streak computation (PAT+DAT), flashcard/DA module real DB counts, community sidebar cleanup, study reminder wiring, PWA theme color, CI migration check.
29. **On-the-Fly PAT Generation** — seeded PRNG (mulberry32), 6 generator logic modules (client + server), `recordAttempt` with seed-based answer re-derivation, `getQuota` endpoint, `patQuestionsGenerated` column, tier quota system (free=20, premium=360, plus=1080), PAT Academy quota display with progress bar, difficulty mapping fix (API→generation).
30. **Release** — squashed all commits into single release (`f9755ba`), pushed to main.
31. **P2 Quick Wins** — community post edit dialog, interview questions moved to DB, DAT analytics endpoints, study schedule generator, shared provinces array.
32. **DAT Question Expansion** — 500 questions (200 Bio, 200 Chem, 100 RC) with seed script.
33. **P2 Features** — global search (Cmd+K command palette), saved/bookmarked questions (DAT), flashcards with SRS (SM-2 algorithm), mock DAT exam (timed 100-question exam with score report), personalized study dashboard (recommendations from performance data).
34. **Quick Wins** — improved predicted score algorithm (weighted: accuracy, recency, difficulty, consistency), proper error logging in community router, removed dead sendgrid provider, removed unused `kimi` from provider enum.
35. **Dockerfile** — updated to Node 24 (required by engines field).
36. **PAT CLI Toolset + Question Bank Removal** — `tools/pat-cli.ts` (generate/render/convert/validate/stats/benchmark/standalone), HTML renderer templates, standalone browser bundle with `window.PAT_ENGINE`; deleted `patQuestions` table (migration `0007_handy_nomad`); seed-based flashcards, saved-questions PAT branch; `db/seed.ts` removed.
37. **Authentic PAT Format Rewrite** — ADA-aligned generators: keyholes 5 options, TFE 4 with dashed hidden edges, angle ranking permutation answers, hole punching 4×4 half-folds, cube counting never-zero answers, pattern folding visible-face marks; B&W technical renderers shared by app + CLI; `server/pat-router.ts` accepts answers 0–4; new `server/pat-generation.test.ts` (16 tests); artifacts `test-output/pat-360/` + `pat-standalone.html` (gitignored). Research in `docs/design/pat-research.md`.
38. **Due-Diligence Closure** — full Stripe lifecycle/reconciliation, bounded serverless outbox, push egress policy, SLO histograms/alerts, capacity gates, pre-rendering, cursor-admin APIs, authenticated accessibility, session key rotation, deploy/rollback automation, and restore drills. PAT generation intentionally unchanged.

## Key Files

- `src/providers/theme.tsx` — theme state.
- `src/index.css` — theme CSS variables.
- `src/components/Navbar.tsx` — top nav + theme toggle + Cmd+K search.
- `src/lib/prng.ts` — seeded PRNG (mulberry32).
- `src/components/pat-generators/logic/` — client-side generation logic (6 categories).
- `src/pages/PATPracticePage.tsx` — practice with on-the-fly generation.
- `src/pages/PATAcademyPage.tsx` — quota display and real stats.
- `src/pages/FlashcardsPage.tsx` — SRS flashcard review (SM-2 algorithm).
- `src/pages/MockExamPage.tsx` — timed DAT mock exam with score report.
- `src/hooks/useRecordPATAttempt.ts` — dual-mode attempt recording.
- `server/router.ts` — tRPC router composition (13 sub-routers).
- `server/pat-router.ts` — PAT practice, analytics, attempts, quota, on-the-fly generation (answers `0..4`).
- `server/dat-router.ts` — DAT practice, analytics, attempts.
- `server/flashcard-router.ts` — Flashcard SRS (SM-2, due cards, reviews).
- `server/saved-router.ts` — Saved/bookmarked questions.
- `server/lib/pat-generation/` — server-side generation logic (source of truth).
- `src/components/pat-generators/logic/` — client mirrors of the 6 generators.
- `src/components/pat-generators/shared/` — B&W tech components (`tech.tsx`), `usePatGenerator.ts` hook, `PatGeneratorUI.tsx`, `PatFlashcardRenderer.tsx`.
- `tools/pat-cli.ts` / `tools/pat-cli.md` — PAT CLI toolset + user guide; `tools/pat-renderers/`, `tools/pat-commands/`, `tools/pat-explanations/`.
- `server/lib/score-prediction.ts` — weighted score prediction algorithm.
- `contracts/tiers.ts` — tier quota definitions.
- `db/schema.ts` — database schema (17 tables).
- `db/seed-dat-full.ts` — seed data (500 DAT questions).
- `db/seed-interview.ts` — seed data (24 interview questions).
- `docs/design/pat-research.md` — authentic DAT PAT format research (choice counts, conventions).
- `docs/design/plans/file-tree.md` — complete file tree with explanations.
- `docs/design/plans/comprehensive-todo.md` — all outstanding work.
- `docs/dev/devlog.md` — detailed milestone log.
- `docs/user/user-guide.md` — end-user documentation.
- `docs/dev/dev-guide.md` — developer guide.

## Open Tasks / Next Priorities

See `docs/design/plans/comprehensive-todo.md` for the full list. Remaining P2 items:
1. School stats table underutilized (#23)
2. Search (#26) — implemented but could be enhanced
3. Bookmarking (#27) — DAT only, PAT needs metadata column
4. Flashcards (#28) — basic SRS implemented, could add more features
5. Mock DAT Exam (#29) — implemented, could add more analytics
6. Personalized Dashboard (#30) — implemented, could add more recommendations

The only deferred due-diligence scope is the separately planned PAT generation
rewrite plus a quarterly managed-Supabase restore drill using production backup
retention; the synthetic repository drill is automated.

## Conventions to Follow

- Use `npm run check` and `npm run lint` before finishing.
- Add tests for new utilities/API logic.
- Use theme CSS variables for new UI: `var(--page-bg)`, `var(--text-primary)`, etc.
- Use `usePageTitle` on every new route page.
- Keep routers focused in `server/`.
- Run `npm run db:generate` and `npm run db:migrate` after schema changes.

## Useful Commands

```bash
npm run dev              # Start dev server
npm run build            # Production build
npm run check            # TypeScript check
npm run lint             # ESLint
npm test                 # Vitest
npm run db:generate      # Generate Drizzle migration
npm run db:migrate       # Apply migrations
npm run db:seed:dat:full # Seed 500 DAT questions
npm run db:seed:interview # Seed 24 interview questions
npm run docker:build     # Build Docker image
npm run docker:up        # Start Docker container
```
