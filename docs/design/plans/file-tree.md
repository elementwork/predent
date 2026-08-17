# PreDent Canada — Complete File Tree

> Generated: 2026-08-03T22:40:00-04:00 | Every non-gitignored file with purpose

---

## Root Config Files

```
.
├── .backend-features.json        # Metadata: which backend features (auth, db) are initialized
├── .dockerignore                 # Docker build exclusions
├── .env                          # Environment variables (gitignored)
├── .env.example                  # Environment variable template
├── .env.test                     # Test environment variables
├── .gitignore                    # Git exclusions (node_modules, dist, .env, etc.)
├── .prettierignore               # Prettier exclusions
├── .prettierrc                   # Prettier config (double quotes, semicolons, 80 width)
├── AGENTS.md                     # AI agent guide: conventions, commands, tech stack
├── Dockerfile                    # Docker build (Node 24 Alpine, multi-stage)
├── README.md                     # Project README with setup instructions
├── components.json               # shadcn/ui CLI config (New York style, non-RSC)
├── docker-compose.yml            # Docker Compose config (single app service)
├── drizzle.config.ts             # Drizzle Kit config for migrations
├── eslint.config.js              # ESLint 9 flat config (strict TS + React hooks)
├── index.html                    # Vite SPA entry HTML
├── package.json                  # Dependencies, scripts, engines (Node ≥24)
├── package-lock.json             # Lockfile
├── playwright.config.ts          # Playwright E2E config
├── postcss.config.js             # PostCSS config (Tailwind + Autoprefixer)
├── tailwind.config.js            # Tailwind CSS config (darkMode: "class")
├── tsconfig.json                 # Root TS config (project references)
├── tsconfig.app.json             # TS config for frontend (src/)
├── tsconfig.node.json            # TS config for Vite config
├── tsconfig.server.json          # TS config for backend (server/, contracts/, db/)
├── vercel.json                   # Vercel deployment config
├── vite.config.ts                # Vite config (React plugin, aliases, Hono dev server)
├── vitest.config.ts              # Vitest config (backend tests)
├── vitest.config.frontend.ts     # Vitest config (frontend tests)
├── vitest.setup.ts               # Vitest setup (backend)
├── vitest.setup.frontend.ts      # Vitest setup (frontend)
│
├── .atomcode/                    # AtomCode agent workspace
│   └── memory.md                 # Agent memory file
│
└── .mimocode/                    # MimoCode agent workspace
    ├── .gitignore                # MimoCode git exclusions
    ├── package.json              # MimoCode dependencies
    ├── package-lock.json         # MimoCode lockfile
    └── plans/                    # MimoCode historical plans
        ├── 1782945257942-cosmic-wizard.md
        ├── 1783000359661-cosmic-lagoon.md
        └── 1783118947842-gentle-rocket.md
```

---

## `api/` — Vercel Serverless Entry

```
api/
└── index.ts                      # Thin wrapper exporting Hono app for Vercel serverless
```

---

## `contracts/` — Shared Constants & Types

```
contracts/
├── constants.ts                  # Session cookie name/expiry, error messages, URL paths
├── errors.ts                     # AppError type + factory functions (400, 401, 403, 404, 500)
├── schools.ts                    # Normalized Canadian dental school data (24 schools)
├── tiers.ts                      # Tier quota definitions (free=20, premium=360)
└── types.ts                      # Barrel re-export of all DB schema types + errors
```

---

## `db/` — Database Schema, Migrations, Seeds

```
db/
├── schema.ts                     # Drizzle PostgreSQL schema (17 tables)
├── relations.ts                  # Drizzle relations (FK definitions)
├── seed-dat.ts                   # Seeds 15 DAT questions (original, kept for reference)
├── seed-dat-full.ts              # Seeds 500 DAT questions (200 bio + 200 chem + 100 RC)
├── seed-interview.ts             # Seeds 24 interview questions (14 panel + 10 MMI)
│
├── data/                         # DAT question data files
│   ├── dat-biology.ts            # 200 biology questions (12 topics)
│   ├── dat-chemistry.ts          # 200 chemistry questions (14 topics)
│   └── dat-reading.ts            # 100 reading comprehension questions (8 topics)
│
└── migrations/                   # Drizzle Kit migration SQL files
    ├── .gitkeep
    ├── 0000_clear_sersi.sql      # Initial schema
    ├── 0001_workable_puma.sql    # Migration 1
    ├── 0002_lucky_deathbird.sql  # Migration 2
    ├── 0003_modern_mandroid.sql  # Migration 3
    ├── 0004_hard_bloodstrike.sql # Creates interview_questions table
    ├── 0005_remove_kimi_provider.sql # Removes unused 'kimi' from provider enum
    ├── 0006_fresh_peter_parker.sql   # Creates saved_questions + flashcard_reviews tables
    └── meta/                     # Drizzle Kit metadata
        ├── _journal.json         # Migration journal ( ordered list)
        ├── 0000_snapshot.json    # Schema snapshot at migration 0
        ├── 0001_snapshot.json    # Schema snapshot at migration 1
        ├── 0002_snapshot.json    # Schema snapshot at migration 2
        ├── 0003_snapshot.json    # Schema snapshot at migration 3
        ├── 0004_snapshot.json    # Schema snapshot at migration 4
        └── 0006_snapshot.json    # Schema snapshot at migration 6
```

---

## `server/` — Backend (Hono + tRPC + Drizzle)

```
server/
├── app.ts                        # Hono app: mounts OAuth, tRPC, Stripe webhooks, cron, rate limiting, Sentry
├── app.test.ts                   # Tests for Hono app
├── boot.ts                       # Node production server entry (serves static + API)
├── context.ts                    # tRPC context creation (extracts user from session cookie)
├── middleware.ts                 # tRPC init, procedure builders (publicQuery, authedQuery, adminQuery)
├── router.ts                     # Root tRPC router composition (14 sub-routers)
├── test-helpers.ts               # Test utilities (mock context, test client)
│
├── auth/                         # OAuth authentication
│   ├── auth.ts                   # OAuth authorize/callback handlers (state + PKCE)
│   ├── auth.test.ts              # Auth tests
│   ├── providers.ts              # OAuth provider implementations (8 providers via arctic)
│   ├── session.ts                # JWT session management (sign/verify/cookie)
│   └── types.ts                  # OAuth-related types
│
├── lib/                          # Backend utilities
│   ├── cookies.ts                # Session cookie options (httpOnly, sameSite, secure)
│   ├── email/                    # Email delivery
│   │   ├── index.ts              # sendEmail(), createNotification() with console/Resend/SendGrid
│   │   └── templates.ts          # Email HTML templates
│   ├── env.ts                    # Environment variable accessor (lazy, cached, validated)
│   ├── http.ts                   # HTTP client class (fetch wrapper with timeout)
│   ├── math.test.ts              # Math utility tests
│   ├── pat-generation/           # Server-side PAT question generation
│   │   ├── angle-ranking.ts      # Angle Ranking generator
│   │   ├── cube-counting.ts      # Cube Counting generator
│   │   ├── hole-punching.ts      # Hole Punching generator
│   │   ├── index.ts              # Barrel export for server-side generation
│   │   ├── keyholes.ts           # Keyholes generator
│   │   ├── pattern-folding.ts    # Pattern Folding generator
│   │   ├── prng.ts               # mulberry32 PRNG (same as client)
│   │   └── tfe.ts                # Top-Front-End generator
│   ├── push.ts                   # Web Push notifications (VAPID + web-push library)
│   ├── rate-limit.ts             # In-memory rate limiter (sliding window)
│   ├── score-prediction.ts       # Weighted score prediction algorithm (accuracy, recency, difficulty, consistency)
│   ├── sentry.ts                 # Server-side Sentry error tracking
│   ├── tasks/                    # Background task schedulers
│   │   └── notifications.ts      # Hourly task due-date reminder scheduler
│   └── vite.ts                   # Production static file serving (SPA fallback)
│
├── queries/                      # Database query helpers
│   ├── connection.ts             # Singleton Drizzle ORM connection (postgres driver)
│   └── users.ts                  # User find/upsert helpers (admin auto-assignment, welcome notification)
│
├── auth-router.ts                # tRPC auth routes (me, logout, switchRole)
├── auth-router.test.ts           # Auth router tests
├── community-router.ts           # tRPC community routes (posts, comments, likes, reports, edit)
├── community-router.test.ts      # Community router tests
├── cron-notify.test.ts           # Tests for Vercel Cron notification endpoint
├── dat-router.ts                 # tRPC DAT routes (questions, attempts, analytics)
├── dat-router.test.ts            # DAT router tests
├── flashcard-router.ts           # tRPC flashcard SRS routes (due cards, record review, stats)
├── interview-router.ts           # tRPC interview routes (questions from DB, categories, random sets)
├── interview-router.test.ts      # Interview router tests
├── notification-router.ts        # tRPC notification routes (list, mark read, settings)
├── notification-router.test.ts   # Notification router tests
├── pat-router.ts                 # tRPC PAT routes (questions, attempts, analytics, quota)
├── pat-router.test.ts            # PAT router tests
├── payment-router.ts             # tRPC Stripe routes (checkout, portal, webhook)
├── payment-router.test.ts        # Payment router tests
├── profile-router.ts             # tRPC profile routes (get, upsert)
├── profile-router.test.ts        # Profile router tests
├── saved-router.ts               # tRPC saved questions routes (list, toggle, isSaved, count)
├── task-router.ts                # tRPC task routes (CRUD, dashboard stats, recommendations)
├── task-router.test.ts           # Task router tests
├── tools-router.ts               # tRPC competitiveness calculator
└── tools-router.test.ts          # Tools router tests
```

---

## `src/` — Frontend (React + Vite)

```
src/
├── main.tsx                      # React entry point (StrictMode, BrowserRouter)
├── App.tsx                       # Route definitions (40+ routes)
├── index.css                     # Global styles + theme CSS variables
├── App.css                       # App-specific styles
├── const.ts                      # LOGIN_PATH constant
├── test-helpers.ts               # Frontend test utilities
│
├── components/                   # Shared components
│   ├── AuthLayout.tsx            # Auth page layout (centered card)
│   ├── AuthLayoutSkeleton.tsx    # Loading skeleton for auth pages
│   ├── CommentSection.tsx        # Community post comment section
│   ├── ErrorBoundary.tsx         # React error boundary
│   ├── FlashcardStudyModal.tsx   # Simple flashcard viewer modal (sequential, no SRS)
│   ├── Footer.tsx                # Site footer
│   ├── Navbar.tsx                # Top nav (links, search Cmd+K, theme toggle, auth)
│   ├── NotificationBell.tsx      # Notification bell with dropdown
│   ├── OnboardingModal.tsx       # 3-step onboarding wizard
│   ├── PremiumCTA.tsx            # Premium upgrade call-to-action
│   ├── PushNotificationToggle.tsx # Browser push notification opt-in
│   ├── ReportDialog.tsx          # Content report dialog
│   │
│   ├── __tests__/                # Component tests
│   │   ├── CommentSection.test.tsx
│   │   ├── ErrorBoundary.test.tsx
│   │   ├── FlashcardStudyModal.test.tsx
│   │   ├── Navbar.test.tsx
│   │   ├── NotificationBell.test.tsx
│   │   ├── PremiumCTA.test.tsx
│   │   ├── PushNotificationToggle.test.tsx
│   │   └── ReportDialog.test.tsx
│   │
│   ├── pat-generators/           # Interactive SVG PAT generators
│   │   ├── AngleRankingGenerator.tsx
│   │   ├── CubeCountingGenerator.tsx
│   │   ├── HolePunchingGenerator.tsx
│   │   ├── KeyholesGenerator.tsx
│   │   ├── PatternFoldingGenerator.tsx
│   │   ├── TopFrontEndGenerator.tsx
│   │   ├── shared/
│   │   │   └── IsoCube.tsx       # Shared isometric cube renderer
│   │   └── logic/                # Client-side generation logic (seeded PRNG)
│   │       ├── angle-ranking.ts
│   │       ├── cube-counting.ts
│   │       ├── hole-punching.ts
│   │       ├── index.ts          # Barrel export + generateQuestions()
│   │       ├── keyholes.ts
│   │       ├── pattern-folding.ts
│   │       └── tfe.ts
│   │
│   ├── planner/                  # Application planner components
│   │   ├── CalendarView.tsx      # Calendar view for tasks
│   │   ├── SchedulingSuggestions.tsx # AI scheduling suggestions
│   │   ├── TaskFilters.tsx       # Task filter controls
│   │   ├── TaskForm.tsx          # Task creation/edit form
│   │   ├── types.ts              # Planner types (categories, priorities, statuses)
│   │   └── __tests__/            # Planner component tests
│   │       ├── SchedulingSuggestions.test.tsx
│   │       ├── TaskFilters.test.tsx
│   │       └── TaskForm.test.tsx
│   │
│   └── ui/                       # shadcn/ui components (~50 components)
│       ├── accordion.tsx
│       ├── alert-dialog.tsx
│       ├── alert.tsx
│       ├── aspect-ratio.tsx
│       ├── avatar.tsx
│       ├── badge.tsx
│       ├── breadcrumb.tsx
│       ├── button-group.tsx
│       ├── button.tsx
│       ├── calendar.tsx
│       ├── card.tsx
│       ├── carousel.tsx
│       ├── chart.tsx
│       ├── checkbox.tsx
│       ├── collapsible.tsx
│       ├── command.tsx           # Cmd+K command palette (used by search)
│       ├── context-menu.tsx
│       ├── dialog.tsx
│       ├── drawer.tsx
│       ├── dropdown-menu.tsx
│       ├── empty.tsx
│       ├── field.tsx
│       ├── form.tsx
│       ├── hover-card.tsx
│       ├── input-group.tsx
│       ├── input-otp.tsx
│       ├── input.tsx
│       ├── item.tsx
│       ├── kbd.tsx
│       ├── label.tsx
│       ├── menubar.tsx
│       ├── navigation-menu.tsx
│       ├── pagination.tsx
│       ├── popover.tsx
│       ├── progress.tsx
│       ├── radio-group.tsx
│       ├── resizable.tsx
│       ├── scroll-area.tsx
│       ├── select.tsx
│       ├── separator.tsx
│       ├── sheet.tsx
│       ├── sidebar.tsx
│       ├── skeleton.tsx
│       ├── slider.tsx
│       ├── sonner.tsx
│       ├── spinner.tsx
│       ├── switch.tsx
│       ├── table.tsx
│       ├── tabs.tsx
│       ├── textarea.tsx
│       ├── toggle-group.tsx
│       ├── toggle.tsx
│       └── tooltip.tsx
│
├── hooks/                        # Custom React hooks
│   ├── useAuth.ts                # Auth state (wraps tRPC auth.me)
│   ├── use-mobile.ts             # Mobile viewport detection (< 768px)
│   ├── usePageTitle.ts           # Sets document.title on route
│   ├── useRecordPATAttempt.ts    # Dual-mode PAT attempt recording
│   ├── useTier.ts                # Subscription tier flags (isFree, isPremium, isPlus)
│   └── __tests__/                # Hook tests
│       ├── useAuth.test.tsx
│       ├── usePageTitle.test.tsx
│       └── useRecordPATAttempt.test.tsx
│
├── lib/                          # Frontend utilities
│   ├── analytics.ts              # PostHog event capture wrapper
│   ├── posthog-client.ts         # PostHog SDK initialization
│   ├── prng.ts                   # mulberry32 seeded PRNG (same as server)
│   ├── sentry.ts                 # Sentry browser SDK initialization
│   └── utils.ts                  # cn() utility (clsx + tailwind-merge)
│
├── pages/                        # Page-level components (40+ pages)
│   ├── AboutPage.tsx             # /about — Team info
│   ├── AdminDashboardPage.tsx    # /admin — Admin stats, user management, question management
│   ├── ArticleGuidePage.tsx      # /guides/article/:slug — Dynamic article renderer
│   ├── CASPerGuidePage.tsx       # /guides/casper-dental-school — CASPer test guide
│   ├── CommunityHubPage.tsx      # /community — Community posts, comments, likes, edit dialog
│   ├── CompetitivenessCalculatorPage.tsx # /tools/competitiveness — School competitiveness calc
│   ├── ContactPage.tsx           # /contact — Contact form
│   ├── DATAcademyPage.tsx        # /dat-academy — DAT modules, flashcards, study schedule
│   ├── DATGuidePage.tsx          # /guides/canadian-dat-guide — DAT study guide
│   ├── DATPracticePage.tsx       # /dat-academy/practice — DAT question practice
│   ├── DashboardPage.tsx         # /dashboard — Profile, stats, personalized recommendations
│   ├── FlashcardsPage.tsx        # /flashcards — SRS flashcard review (SM-2 algorithm)
│   ├── GPACalculatorPage.tsx     # /tools/gpa-calculator — GPA calculator
│   ├── GuidesIndexPage.tsx       # /guides — Guides landing page
│   ├── InterviewPrepPage.tsx     # /guides/dental-school-interview — Interview prep guide
│   ├── LandingPage.tsx           # / — Marketing landing page
│   ├── LegalPage.tsx             # /legal/:topic — Privacy, Terms, Refund, Guarantee
│   ├── Login.tsx                 # /login, /register — OAuth login page
│   ├── MockExamPage.tsx          # /dat-academy/mock-exam — Timed 100-question DAT exam
│   ├── NotFound.tsx              # 404 page
│   ├── NotificationSettingsPage.tsx # /dashboard/settings/notifications — Email/push prefs
│   ├── PATAcademyPage.tsx        # /pat-academy — PAT modules, quota display
│   ├── PATAnalyticsPage.tsx      # /pat-academy/analytics — PAT performance analytics
│   ├── PATCalculatorPage.tsx     # /tools/pat-calculator — PAT score calculator
│   ├── PATGeneratorsPage.tsx     # /pat-academy/generators — Interactive PAT generators
│   ├── PATPracticePage.tsx       # /pat-academy/practice — PAT question practice
│   ├── PATStrategyPage.tsx       # /guides/pat/:category — PAT strategy guides
│   ├── PlannerPage.tsx           # /dashboard/planner — Application task planner
│   ├── PricingPage.tsx           # /pricing — Pricing tiers
│   ├── SchoolComparisonPage.tsx  # /compare — Side-by-side school comparison
│   ├── SchoolDetailPage.tsx      # /school/:id — Individual school detail
│   ├── SchoolHubPage.tsx         # /schools — School directory
│   ├── StudySchedulesPage.tsx    # /guides/dat-study-schedules — Study schedule generator
│   ├── ToolsIndexPage.tsx        # /tools — Tools landing page
│   │
│   ├── __tests__/                # Page tests
│   │   ├── AdminDashboardPage.test.tsx
│   │   ├── CompetitivenessCalculatorPage.test.tsx
│   │   ├── DATAcademyPage.test.tsx
│   │   ├── DATPracticePage.test.tsx
│   │   ├── DashboardPage.test.tsx
│   │   ├── GPACalculatorPage.test.tsx
│   │   ├── InterviewPrepPage.test.tsx
│   │   ├── Login.test.tsx
│   │   ├── NotFound.test.tsx
│   │   ├── NotificationSettingsPage.test.tsx
│   │   ├── PATAcademyPage.test.tsx
│   │   ├── PATAnalyticsPage.test.tsx
│   │   ├── PATCalculatorPage.test.tsx
│   │   ├── PATGeneratorsPage.test.tsx
│   │   └── PricingPage.test.tsx
│   │
│   └── admin/
│       └── CommunityModerationPage.tsx # /admin/community — Report review queue
│
└── providers/                    # React context providers
    ├── posthog.tsx               # PostHog page view tracking + user identification
    ├── theme.tsx                 # Theme state (light/dark/system, localStorage persistence)
    └── trpc.tsx                  # tRPC React client + QueryClient provider
```

---

## `public/` — Static Assets

```
public/
├── apple-touch-icon.png         # iOS home screen icon
├── hero-illustration.jpg        # Landing page hero image
├── icon-192.png                 # PWA icon 192x192
├── icon-512.png                 # PWA icon 512x512
├── manifest.json                # PWA manifest
├── robots.txt                   # Search engine crawler rules
├── sitemap.xml                  # XML sitemap for SEO
├── sw.js                        # Service worker (workbox)
├── testimonial-1.jpg            # Testimonial avatar 1
├── testimonial-2.jpg            # Testimonial avatar 2
└── testimonial-3.jpg            # Testimonial avatar 3
```

---

## `docs/` — Documentation

```
docs/
├── design/                       # Design & planning documents
│   ├── PRD/                      # Product requirements
│   │   ├── PreDent_Canada_AI_Development_Plan.md
│   │   ├── PreDent_Canada_PRD.md
│   │   └── chart_*.png           # PRD diagrams (6 images)
│   └── plans/                    # Planning documents
│       ├── comprehensive-todo.md             # Master todo list (50 items)
│       ├── feature_list.md                  # Feature list with cross-reference
│       ├── file-tree.md                     # This file (complete file tree)
│       └── index-1.html                     # HTML artifact (can be deleted)
│
├── dev/                          # Developer documentation
│   ├── admin-guide.md            # Admin & operations guide
│   ├── dev-guide.md              # Developer guide (setup, conventions)
│   └── devlog.md                 # Development log (milestones)
│
└── user/                         # End-user documentation
    └── user-guide.md             # User guide
```

---

## `e2e/` — End-to-End Tests

```
e2e/
└── smoke.spec.ts                 # Playwright smoke tests (landing, nav, theme, API)
```

---

## `tools/` — Standalone Tools

```
tools/
├── pat-cli.ts                     # PAT CLI entry (generate/render/convert/validate/stats/benchmark/standalone)
├── pat-cli.md                     # PAT CLI user guide (templates, formats, validation rules)
├── pat-types.ts                   # PAT question types (mirror server generation contracts)
├── pat-commands/                  # CLI subcommand implementations
│   ├── generate.ts                # Question generation (HTML/JSON/both, split, answer keys)
│   ├── convert.ts                 # JSON ↔ HTML conversion
│   ├── validate.ts                # Question validation (option counts, determinism, bounds)
│   ├── stats.ts                   # Generated-question statistics
│   └── benchmark.ts               # Generator performance benchmarking
├── pat-renderers/                 # HTML/SVG renderers for questions
│   ├── html-renderer.ts           # HTML templates (modern/classic/minimal/print) + print CSS
│   ├── question-card.ts           # Question card data (prompts, option counts)
│   └── svg-renderer.ts            # B&W technical SVG renderers (all 6 categories)
├── pat-explanations/              # Tiered explanation generation (brief/detailed/full)
│   └── index.ts                   # generateExplanation per category
├── pat-utils/                     # Shared helpers for CLI
├── pat-standalone/                # esbuild-bundled standalone browser build
│   └── entry.ts                   # window.PAT_ENGINE + inline practice cards
```

> Note: the legacy `PAT_Generator.py` prototype was replaced by the TypeScript `tools/` toolset.

---

## `.agents/` — Agent Session Context

```
.agents/
└── resume.md                     # Session resume file (completed work, open tasks, conventions)
```

---

## `.github/` — CI/CD

```
.github/
└── workflows/
    └── ci.yml                    # GitHub Actions CI (lint, typecheck, test)
```

---

## Summary

| Directory | Files | Purpose |
|-----------|-------|---------|
| Root | 28 | Config, build, lint, format, agent workspaces |
| `api/` | 1 | Vercel serverless entry |
| `contracts/` | 5 | Shared types, constants, school data |
| `db/` | 12 | Schema, migrations, seeds, question data |
| `server/` | 42 | Backend routers, auth, lib, queries |
| `src/` | 130+ | Frontend pages, components, hooks, providers |
| `public/` | 11 | Static assets, PWA |
| `docs/` | 15 | Design, dev, user documentation |
| `e2e/` | 1 | Playwright tests |
| `tools/` | 2 | Standalone tools (PAT Generator) |
| `.agents/` | 1 | Agent session context |
| `.github/` | 1 | CI/CD workflow |
| **Total** | **~255** | |

---

*This file tree is the single source of truth for codebase structure. Update it when adding/removing files.*
