# Agent Guide — PreDent Canada (my-app)

This file is a concise, factual reference for AI coding agents working on this project. It describes the technology stack, project layout, build/runtime behavior, conventions, and security model as they actually exist in the codebase.

> Last updated: 2026-08-14

---

## 1. Project overview

This is a full-stack TypeScript web application for **PreDent Canada**, a platform that helps Canadian pre-dental students prepare for the DAT (Dental Admission Test), explore dental schools, plan applications, and practice the Perceptual Ability Test (PAT).

The project is a single codebase that contains:

- A **React 19 + Vite 7** frontend (`src/`)
- A **Hono + tRPC + Drizzle ORM** backend (`server/`)
- A thin Vercel serverless entry point (`api/index.ts`)
- Shared contracts/types (`contracts/`)
- A PostgreSQL database schema and migrations (`db/`)

The backend and frontend are built together and served from the same Node process in production.

---

## 2. Technology stack

| Layer                   | Technology                                                   | Notes                                                 |
| ----------------------- | ------------------------------------------------------------ | ----------------------------------------------------- |
| Runtime                 | Node.js 24+                                                  | Required engine                                       |
| Frontend framework      | React 19.2                                                   | Uses `StrictMode`                                     |
| Build tool / dev server | Vite 7.3.6                                                   | SPA build, output goes to `dist/public`               |
| Routing                 | `react-router` / `react-router-dom` v7.18.2                  | Uses `BrowserRouter` in `src/main.tsx`                |
| Styling                 | Tailwind CSS v3.4.19                                         | Config in `tailwind.config.js`, `darkMode: "class"`   |
| UI components           | shadcn/ui (New York style, non-RSC)                          | ~50 components under `src/components/ui/`             |
| Icons                   | `lucide-react`                                               |                                                       |
| Forms / validation      | `react-hook-form` + `zod`                                    | `@hookform/resolvers`                                 |
| Animations              | `framer-motion`                                              | Used heavily on the landing page                      |
| State / data fetching   | `@tanstack/react-query` + tRPC React client                  | Single `QueryClient`                                  |
| Backend framework       | `hono` v4.13.1                                               | Runs on `@hono/node-server` v2.1.0                    |
| API protocol            | tRPC v11 (`@trpc/server`, `@trpc/client`)                    | `superjson` transformer                               |
| Database ORM            | `drizzle-orm` v0.45.2                                        | PostgreSQL dialect via `postgres` (Supabase)          |
| Database migrations     | `drizzle-kit` v0.31.10                                       | Config in `drizzle.config.ts`                         |
| Auth                    | Google OAuth 2.0                                             | Session cookie via signed JWT (HS256)                 |
| Payments                | `stripe` v22                                                 | Checkout sessions + webhooks; configured via env vars |
| Testing                 | `vitest` v4                                                  | Config in `vitest.config.ts`                          |
| Linting                 | ESLint 9 + `typescript-eslint` + React Hooks/Refresh plugins | Config in `eslint.config.js`                          |
| Formatting              | Prettier 3                                                   | Config in `.prettierrc`                               |

---

## 3. Project structure

```
.
├── api/                    # Vercel serverless entry point only
│   └── index.ts            # Thin wrapper that exports the Hono app for Vercel
├── server/                 # Backend (Hono + tRPC)
│   ├── app.ts              # Shared Hono app: tRPC, OAuth, Stripe, cron
│   ├── boot.ts             # Node production server entry point
│   ├── router.ts           # Root tRPC router composition
│   ├── auth-router.ts      # tRPC auth routes
│   ├── profile-router.ts   # User profile CRUD
│   ├── task-router.ts      # Application planner tasks, dashboard stats, recommendations
│   ├── pat-router.ts       # PAT practice, analytics, attempts, quota
│   ├── tools-router.ts     # Competitiveness calculator
│   ├── interview-router.ts # Interview question bank (DB-backed)
│   ├── payment-router.ts   # Stripe checkout + billing portal
│   ├── dat-router.ts       # DAT practice, analytics, attempts
│   ├── community-router.ts # Community posts, comments, likes, reports, edit
│   ├── notification-router.ts # In-app notifications, settings
│   ├── admin-router.ts     # Admin stats, user management, question management
│   ├── saved-router.ts     # Saved/bookmarked questions (PAT + DAT)
│   ├── flashcard-router.ts # Flashcard SRS (SM-2 algorithm, seed-based PAT cards, due cards, reviews)
│   ├── middleware.ts       # tRPC init, auth middleware, procedure builders
│   ├── context.ts          # tRPC context creation
│   ├── auth/               # Google OAuth / session integration
│   ├── lib/                # Backend utilities (env, cookies, http, vite static)
│   │   ├── pat-generation/ # Server-side PAT question generation (PRNG + 6 categories)
│   │   │   ├── prng.ts     # mulberry32 PRNG (same as client)
│   │   │   ├── index.ts    # Barrel export for server-side generation
│   │   │   ├── keyholes.ts
│   │   │   ├── tfe.ts
│   │   │   ├── angleRanking.ts
│   │   │   ├── holePunching.ts
│   │   │   ├── cubeCounting.ts
│   │   │   └── patternFolding.ts
│   │   ├── email/          # Email delivery (console, Resend)
│   │   ├── tasks/          # Background schedulers (task reminders)
│   │   ├── score-prediction.ts # Weighted score prediction algorithm
│   │   ├── rate-limit.ts   # Shared Redis limiter + explicit local fallback
│   │   ├── push.ts         # Web Push notifications
│   │   ├── sentry.ts       # Server-side error tracking
│   │   ├── cookies.ts      # Session cookie options
│   │   ├── env.ts          # Environment variable accessor
│   │   ├── http.ts         # HTTP client wrapper
│   │   └── vite.ts         # Production static file serving
│   ├── queries/            # DB query helpers / connection
│   └── cron-notify.test.ts # Tests for the Vercel Cron reminder endpoint
├── src/                    # Frontend (React + Vite)
│   ├── main.tsx            # React entry point
│   ├── App.tsx             # Route definitions
│   ├── index.css           # Global styles / theme CSS variables
│   ├── App.css             # App-specific styles
│   ├── const.ts            # LOGIN_PATH constant
│   ├── pages/              # Page-level components
│   ├── components/         # Shared components + shadcn/ui + PAT generators
│   │   └── pat-generators/ # Interactive SVG PAT generators (all 6 categories)
│   │       └── logic/      # Client-side generation logic (seeded PRNG, 6 categories)
│   ├── hooks/              # Custom React hooks (useAuth, usePageTitle, useRecordPATAttempt)
│   ├── providers/          # TRPCProvider, ThemeProvider
│   └── lib/                # Frontend utilities (cn, prng.ts for seeded PRNG)
├── contracts/              # Shared constants, error types, re-exports from db
│   ├── schools.ts          # Normalized Canadian dental school data
│   ├── tiers.ts            # Tier quota definitions (free, premium, premium_plus)
│   └── pat-stats.ts        # Static PAT counts (60 per category, 360 total)
├── db/                     # Database schema, relations, seeds
│   ├── schema.ts           # Drizzle PostgreSQL schema
│   ├── relations.ts        # Drizzle relations for all foreign keys
│   ├── seed-dat.ts         # Seeds 15 DAT questions
│   ├── seed-dat-full.ts    # Seeds 500 DAT questions (200 bio + 200 chem + 100 RC)
│   ├── seed-interview.ts   # Seeds 24 interview questions
│   └── migrations/         # Drizzle Kit output directory (committed SQL files)
├── docs/                   # Documentation
│   ├── user/               # End-user guides
│   ├── dev/                # Developer & operator guides
│   └── design/             # PRD and planning documents
├── .agents/                # Agent session resume and context
├── public/                 # Static assets, PWA manifest, icons, sw.js
├── Dockerfile
├── docker-compose.yml
├── package.json
├── vite.config.ts
├── tsconfig*.json
├── drizzle.config.ts
├── vitest.config.ts
├── eslint.config.js
├── tailwind.config.js
└── postcss.config.js
```

---

## 4. TypeScript project references

The repo uses TypeScript project references:

- `tsconfig.app.json` — frontend code in `src/`
- `tsconfig.node.json` — Vite config (`vite.config.ts`)
- `tsconfig.server.json` — backend code in `server/`, plus `contracts/` and `db/`

Path aliases:

- `@/*` → `./src/*`
- `@contracts/*` → `./contracts/*`
- `@db/*` → `./db/*`
- `db` → `./db` (Vite only)

Run `npm run check` (`tsc -b`) to type-check all projects.

---

## 5. Build and run commands

```bash
# Development — Vite dev server on port 3000
npm run dev

# Type-check the whole repo
npm run check

# Lint
npm run lint

# Format with Prettier
npm run format

# Production build
npm run build

# Start production server
npm start

# Preview the Vite production build (frontend only)
npm run preview

# Run tests
npm test

# Database
npm run db:generate   # Generate migration SQL from schema changes
npm run db:migrate    # Apply pending migrations
npm run db:push       # Push schema changes directly
npm run db:seed:dat   # Seed DAT questions
npm run db:seed:dat:full # Seed 500 DAT questions (200 bio + 200 chem + 100 RC)
npm run db:seed:interview # Seed 24 interview questions

# Docker
npm run docker:build  # Build Docker image
npm run docker:up     # Start container
npm run docker:down   # Stop container
```

Production build output:

- `dist/public/` — static SPA assets
- `dist/boot.js` — bundled Node server entry point

---

## 6. Runtime architecture

### Development

- `vite` runs the dev server on port `3000`.
- `@hono/vite-dev-server` mounts `server/app.ts`.
- `server/app.ts` excludes static paths so Vite handles the SPA; all `/api/*` requests go to Hono.

### Production

- `server/boot.ts` detects `NODE_ENV=production` and:
  - imports `@hono/node-server`
  - serves static files from `dist/public`
  - falls back to `index.html` for SPA routes
  - listens on `process.env.PORT || 3000`
- API routes under `/api/*`:
  - `/api/oauth/callback` — Google OAuth callback
  - `/api/trpc/*` — tRPC request handler
  - `/api/webhooks/stripe` — Stripe webhook handler
  - `/api/cron/notify` — Vercel Cron task-reminder endpoint

### API / tRPC

- Root router: `server/router.ts`
- Sub-routers: `auth`, `profile`, `task`, `pat`, `tools`, `interview`, `payment`, `dat`, `admin`, `community`, `notification`, `saved`, `flash`
- Procedures:
  - `publicQuery` — no auth required
  - `authedQuery` — requires valid session cookie
  - `adminQuery` — requires `role === "admin"`
- Context (`server/context.ts`): attaches the authenticated `User` from the session cookie if present.

---

## 7. Authentication and authorization

### OAuth flow

The app supports Google, Apple, Microsoft, LinkedIn, Facebook, X (Twitter), Discord, and Instagram login via the `arctic` OAuth library.

1. `src/pages/Login.tsx` links to `/api/oauth/authorize/:provider?redirect=...` for the chosen provider.
2. `server/auth/auth.ts::createOAuthAuthorizeHandler` generates OAuth state and a PKCE code verifier, stores them in httpOnly cookies, and redirects to the provider.
3. The provider redirects back to `/api/oauth/callback`. `server/auth/auth.ts::createOAuthCallbackHandler` validates state, exchanges the code (via `server/auth/providers.ts`), and upserts the user.
4. A session JWT is signed with `APP_SECRET` (HS256, 30-day expiry) with issuer, audience, and JTI claims. Production stores it in the `__Host-predent_sid` cookie; development uses `predent_sid`. The payload contains `unionId`, `provider`, and `tokenVersion`.
5. Subsequent requests include the cookie; `authenticateRequest` verifies the JWT and loads the user.

### Supported providers

- `google` — OAuth 2.0 with ID-token verification via Google's JWKS.
- `apple` — Sign in with Apple; ID-token verification via Apple's JWKS; requires Team ID, Key ID, and private key.
- `microsoft` — Microsoft Entra ID (personal/work/school accounts); default tenant is `common`.
- `linkedin` — LinkedIn OAuth 2.0 with OpenID Connect userinfo.
- `facebook` — Facebook Login; fetches profile from `graph.facebook.com/me`.
- `x` — OAuth 2.0; fetches profile from `api.twitter.com/2/users/me`.
- `discord` — Discord OAuth 2.0 with PKCE.
- `instagram` — Instagram Basic Display OAuth; fetches profile from `graph.instagram.com/me`.

Add new providers by extending `server/auth/providers.ts` and the `users.provider` enum in `db/schema.ts`.

### Session cookie options

- `httpOnly: true`
- `sameSite: Lax` on localhost, `None` otherwise
- `secure: true` outside localhost
- `path: /`
- JWT expiry: 30 days
- Production cookie name uses the `__Host-` prefix

### Roles

- `role` column on `users` is `"user"` or `"admin"`.
- The first user whose `unionId` matches `OWNER_UNION_ID` is automatically assigned `admin` on upsert.

---

## 8. Database schema

Database: PostgreSQL on Supabase (accessed via `postgres` driver, Drizzle ORM).

Tables (defined in `db/schema.ts`):

- `users` — OAuth users (provider, unionId/subject, name, email, avatar, role, tier, tokenVersion, premium fields, email preferences)
- `profiles` — Extended user profile (name, province, GPA, year level, target schools, etc.)
- `tasks` — Application planner tasks (category, due date, status, priority, notes, due-date notification tracking)
- `patAttempts` — PAT practice question attempts (category, difficulty, seed, correctness, time; PAT questions are generated on the fly from the seed via PRNG — no bank table)
- `datQuestions` — DAT Biology/Chemistry/Reading question bank (soft-delete support)
- `datAttempts` — DAT question attempts
- `communityPosts` — User-generated community posts (results, questions, discussions)
- `communityReactions` — One idempotent post reaction per user/post
- `communityComments` — Comments on community posts
- `communityReports` — User reports for posts/comments
- `notifications` — In-app notifications with optional email delivery
- `outboxJobs` — Transactional, retryable notification delivery jobs
- `pushSubscriptions` — Browser push notification subscriptions
- `schoolStats` — Aggregate admission stats per school/year
- `stripeWebhookEvents` — Idempotency log for processed Stripe webhook events
- `adminActions` — Audit log of destructive admin actions
- `interviewQuestions` — Interview question bank (MMI + Panel, DB-backed)
- `savedQuestions` — User-bookmarked questions (PAT + DAT)
- `flashcardReviews` — Spaced repetition review records (SM-2 algorithm; PAT cards store `category` + `difficulty` + `seed`, DAT cards store `datQuestionId`)

Drizzle migrations live in `db/migrations/`. Migration SQL files are committed to the repository so they can be applied in CI/CD and production deployments.

Seed scripts:

- `npm run db:seed:dat` — Seeds 15 DAT questions (original)
- `npm run db:seed:dat:full` — Seeds 500 DAT questions (200 bio + 200 chem + 100 RC)
- `npm run db:seed:interview` — Seeds 24 interview questions

PAT questions are never stored in the database — all practice/analytics/flashcard questions are generated on the fly from a numeric seed using the mulberry32 PRNG (`src/lib/prng.ts` client, `server/lib/pat-generation/prng.ts` server). The server re-derives the correct answer from the seed to grade attempts. Static counts live in `contracts/pat-stats.ts`.

PAT generators follow the authentic recent DAT (ADA) format, documented in `docs/design/pat-research.md`:

- **Choice counts:** keyholes = 5, TFE = 4, angle ranking = 4, hole punching = 5, cube counting = 5, pattern folding = 4. `server/pat-router.ts` `recordAttempt` accepts `userAnswer` in `0..4`.
- **Per-category model:** `keyholes.ts` (silhouette `boolean[][]` options, `correctAxis`), `tfe.ts` (`TFEView{cols,rows,edges:{hidden}}` per view — dashed = hidden line), `angle-ranking.ts` (permutation-string options like `"2-1-4-3"`), `hole-punching.ts` (4×4 grid, **half-folds only** `foldSteps` + `punch` + `correctHoles`), `cube-counting.ts` (`targetN`/`answer`/`choices`; painted = exposed faces), `pattern-folding.ts` (`net` string[6] face marks, options = `"top|left|right"`).
- **B&W renderers:** shared components in `src/components/pat-generators/shared/tech.tsx` (React) and `tools/pat-renderers/svg-renderer.ts` (CLI strings). All six interactive generators live in `src/components/pat-generators/*.tsx` and share state logic via `shared/usePatGenerator.ts` + `shared/PatGeneratorUI.tsx`.
- The CLI (`tools/pat-cli.ts`) and standalone bundle render only from these generators. Test artifacts `test-output/pat-360/` and `pat-standalone.html` are gitignored and regenerated via `tools/pat-cli.ts generate`/`standalone`.

---

## 9. Code style and conventions

### Formatting

Prettier config (`.prettierrc`):

- Semicolons: enabled
- Single quotes: disabled (double quotes)
- Trailing commas: ES5
- Print width: 80
- Tab width: 2 spaces
- End of line: LF

### TypeScript

- ESM only (`"type": "module"`)
- Strict mode enabled
- `verbatimModuleSyntax: true`
- `allowImportingTsExtensions: true` and `noEmit: true`

### Imports

- Frontend uses `@/` aliases for `src/`.
- Backend uses `@contracts/*` and `@db/*` aliases.
- Utility merge helper: `cn(...)` from `src/lib/utils.ts`.

### React conventions

- Functional components, hooks
- `BrowserRouter` is used
- `useAuth` wraps the tRPC `auth.me` query
- Custom shadcn/ui components live in `src/components/ui/`
- Use `usePageTitle` on every route page
- New pages should use theme CSS variables (see Theming section)

---

## 10. Testing

- Test runner: **Vitest**
- Config: `vitest.config.ts`
- Environment: `node`
- Test file pattern: `server/**/*.test.ts`, `server/**/*.spec.ts`

Run tests:

```bash
npm test
npm run test:frontend
npm run test:e2e
```

Playwright uses the installed Google Chrome channel; E2E runners must provide
Google Chrome.

Test files: `server/lib/math.test.ts`, `server/pat-router.test.ts`, `server/interview-router.test.ts`, `server/tools-router.test.ts`.

---

## 11. Theming

Theme state is managed in `src/providers/theme.tsx`. It supports `light`, `dark`, and `system` modes and persists to `localStorage`.

Tailwind is configured with `darkMode: "class"`. The `<html>` element gets the `light` or `dark` class.

### Theme CSS variables

Use these instead of hardcoded colors on new pages:

- `bg-[var(--page-bg)]` — page background
- `text-[var(--text-primary)]` — primary text
- `text-[var(--text-secondary)]` — secondary text
- `text-[var(--text-tertiary)]` — muted text
- `bg-[var(--page-surface)]` — cards/panels
- `bg-[var(--page-muted)]` — subtle backgrounds
- `border-[var(--border-color)]` — borders

Some older pages (Dashboard, Login, parts of LandingPage) still use hardcoded colors and may not fully adapt to the theme toggle yet.

---

## 12. Security considerations

- **Secrets** are loaded from environment variables. Never commit `.env` files.
- **Session tokens** are signed HS256 JWTs. `APP_SECRET` must be strong and unique per environment.
- **Cookies** are `httpOnly`. Secure/SameSite flags adapt to localhost for local dev.
- **OAuth state**: cryptographically random state + PKCE code verifier stored in httpOnly cookies during the authorize step.
- **Admin elevation**: `OWNER_UNION_ID` grants admin on first login; keep it private.
- **Database URL**: Required for backend and Drizzle Kit commands.
- **OAuth identity key**: Users are uniquely identified by
  `(provider, unionId)`; both fields are required for lookup and upsert.
- **Entitlements**: Paid access is derived from both `tier` and an unexpired
  `premiumUntil`. Use `premiumQuery`/`premiumPlusQuery` for paid procedures.
- **Rate limiting**: Production uses shared Redis REST counters and fails closed
  when they are unavailable. Proxy IP headers are trusted only through the
  explicit platform/proxy configuration.

### Required environment variables

```bash
APP_SECRET=              # Used to sign session JWTs
SESSION_KEY_ID=current   # Active JWT signing-key identifier
SESSION_PREVIOUS_SECRETS={} # JSON map of previous key IDs to secrets
DATABASE_URL=            # Supabase PostgreSQL connection string
DATABASE_POOL_MAX=       # Per-instance pool cap; defaults 3 Vercel / 10 Node
                          # e.g. postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
UPSTASH_REDIS_REST_URL=   # Required in production for shared rate limiting
UPSTASH_REDIS_REST_TOKEN= # Required in production for shared rate limiting
RATE_LIMIT_ALLOW_IN_MEMORY=false # Single-instance production escape hatch only
TRUST_PROXY=false        # Only for a proxy that sanitizes X-Forwarded-For
TRUST_CLOUDFLARE_PROXY=false # Only when Cloudflare directly fronts the origin
VITE_GOOGLE_CLIENT_ID=   # Browser-facing Google OAuth client ID
GOOGLE_CLIENT_ID=        # Google OAuth client ID (backend)
GOOGLE_CLIENT_SECRET=    # Google OAuth client secret
OWNER_UNION_ID=          # Google "sub" granted admin role

# X (Twitter) OAuth 2.0 — required only when offering X login
X_CLIENT_ID=             # X OAuth 2.0 client ID
X_CLIENT_SECRET=         # X OAuth 2.0 client secret

# Instagram OAuth — required only when offering Instagram login
INSTAGRAM_CLIENT_ID=     # Instagram app client ID
INSTAGRAM_CLIENT_SECRET= # Instagram app client secret

# LinkedIn OAuth 2.0 — required only when offering LinkedIn login
LINKEDIN_CLIENT_ID=      # LinkedIn app client ID
LINKEDIN_CLIENT_SECRET=  # LinkedIn app client secret

# Apple Sign In — required only when offering Apple login
APPLE_CLIENT_ID=         # Apple Services ID (e.g. com.example.predent)
APPLE_TEAM_ID=            # Apple Team ID (10 characters)
APPLE_KEY_ID=             # Apple private key ID
APPLE_PRIVATE_KEY=        # PEM-encoded Apple private key

# Discord OAuth 2.0 — required only when offering Discord login
DISCORD_CLIENT_ID=        # Discord app client ID
DISCORD_CLIENT_SECRET=    # Discord app client secret

# Microsoft Entra ID — required only when offering Microsoft login
MICROSOFT_TENANT=common   # Entra tenant ID or "common" for personal accounts
MICROSOFT_CLIENT_ID=      # Microsoft app client ID
MICROSOFT_CLIENT_SECRET=  # Microsoft app client secret

# Facebook Login — required only when offering Facebook login
FACEBOOK_CLIENT_ID=       # Facebook app ID
FACEBOOK_CLIENT_SECRET=   # Facebook app secret

# Payments (Stripe) — required only if checkout is enabled
STRIPE_SECRET_KEY=                # sk_test_... or sk_live_...
STRIPE_WEBHOOK_SECRET=            # whsec_... for webhook signature verification
STRIPE_PRICE_PREMIUM_MONTHLY=     # price_... for Premium monthly plan
STRIPE_PRICE_PREMIUM_YEARLY=      # price_... for Premium yearly plan
STRIPE_PRICE_PLUS_LIFETIME=       # price_... for Premium Plus lifetime plan
PUBLIC_APP_URL=                   # Public origin, e.g. https://predent.ca

# Vercel Cron (required only on Vercel for scheduled reminders)
CRON_SECRET=              # Random secret Vercel sends in the Authorization header
METRICS_SECRET=           # Bearer token protecting /api/metrics

# Email / Notifications (required only when sending real emails)
EMAIL_PROVIDER=           # "console" (default) or "resend"; SendGrid is unsupported
EMAIL_FROM=               # Sender address (e.g. noreply@predent.ca)
RESEND_API_KEY=           # re_... (required when EMAIL_PROVIDER=resend)
```

---

## 13. Deployment notes

### Docker / Node server (traditional)

- The production artifact is the `dist/` folder produced by `npm run build` plus `node_modules`.
- Start with `NODE_ENV=production node dist/boot.js` or `npm start`.
- The server expects `DATABASE_URL` and `APP_SECRET` at runtime.
- Migrations are not run automatically on startup; run `npm run db:migrate` during deploy.
- The production server starts an hourly background job (`server/lib/tasks/notifications.ts`) that creates in-app and email reminders for tasks due within 24 hours.

### Vercel (serverless)

- A Vercel deployment entry point exists at `api/index.ts`.
- `vercel.json` is configured to build the Vite frontend and route `/api/*` requests to the serverless function.
- The Node server block in `server/boot.ts` is skipped when `VERCEL=1`.
- Database is hosted on Supabase (PostgreSQL). No local database file needed.
- The background task-reminder scheduler does not run on Vercel; `vercel.json` invokes `/api/cron/notify` once daily. That endpoint processes reminders, study reminders, the outbox, and billing reconciliation, which is compatible with Vercel Hobby. Set `CRON_SECRET` to authenticate cron requests.

---

## 14. Where to find things

| Concern                   | Location                                                                                |
| ------------------------- | --------------------------------------------------------------------------------------- |
| Add a new page            | `src/pages/*.tsx` + route in `src/App.tsx`                                              |
| Add a new API route       | Create a router under `server/*-router.ts` and add it to `server/router.ts`             |
| Enforce auth on a route   | Use `authedQuery` or `adminQuery` from `server/middleware.ts`                           |
| Change DB schema          | `db/schema.ts`, then `npm run db:generate`                                              |
| Run a DB query            | Add helper in `server/queries/` or query inline using `getDb()`                         |
| Add a UI component        | `src/components/ui/` (shadcn/ui style)                                                  |
| Shared constants / errors | `contracts/constants.ts`, `contracts/errors.ts`                                         |
| Styling variables         | `src/index.css` + `tailwind.config.js`                                                  |
| Environment config        | `.env.example`, `server/lib/env.ts`                                                     |
| Theme provider            | `src/providers/theme.tsx`                                                               |
| Page titles               | `src/hooks/usePageTitle.ts`                                                             |
| Email delivery            | `server/lib/email/index.ts`                                                             |
| Task due-date reminders   | `server/lib/tasks/notifications.ts`                                                     |
| Outbox worker             | `server/lib/outbox/worker.ts`                                                           |
| Health, metrics, SLOs     | `docs/dev/observability.md`                                                             |
| PAT question generation   | `server/lib/pat-generation/` (server) + `src/components/pat-generators/logic/` (client) |
| Tier quota definitions    | `contracts/tiers.ts`                                                                    |
| User documentation        | `docs/user/`                                                                            |
| Developer / ops docs      | `docs/dev/`                                                                             |
| Agent session resume      | `.agents/resume.md`                                                                     |
| PRD / planning docs       | `docs/design/`                                                                          |

---

## 15. Known limitations and TODOs

- Database is hosted on Supabase (PostgreSQL).
- Public sitemap routes are pre-rendered during `npm run build`; authenticated
  and other dynamic routes remain client-rendered.
- Restore objectives depend on the production Supabase plan and must be proven
  through the quarterly drill in `docs/dev/disaster-recovery.md`.
- PAT generation is intentionally awaiting a separate rewrite; do not couple
  unrelated remediation to the current generator implementation.

## 16. Git & Commit Rules

1. **Always update all relevant docs** (including devlog) before any commit.
2. **Do NOT push to remote** unless the user explicitly approves.
3. **Always run 'npm run check' and 'npm run lint'** before pushing to remote - both must pass.
4. **Squash before push**: merge all local commits into one single commit, then push.
5. **User**: use elementwork <elementworkinc@gmail.com> to commit and push to github

## 17. Global Guardrails
Never run full tests, create a git commit, push to a remote repository, or generate pull requests unless explicitly authorized by the user in the immediate message. 
* Do not auto-commit or auto-push after implementing changes, fixing bugs, or completing tasks.
* Always wait for the user to review code in the console and request a commit explicitly.
* A commit or push instruction from a previous message never carries over to a new task.
* If a task is finished, halt and wait for manual approval.
