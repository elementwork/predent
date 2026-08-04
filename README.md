# PreDent Canada

A practice and planning platform for Canadian pre-dental students. DAT prep, school research, application planning, and peer community — in one place.

**Live:** [predent.vercel.app](https://predent.vercel.app)

> Last updated: 2026-08-03T22:40:00-04:00

## Features

- **PAT Academy** — On-the-fly question generation (seeded PRNG, infinite questions), 6 category practice modules (Quick, Category Drill, Timed, Mixed, Exam), authentic recent-DAT format (5/4/4/5/5/4 answer choices, dashed hidden TFE lines, half-fold hole punching, never-zero cube counts), B&W technical SVG renderers, progress analytics, predicted score, tiered explanations, tiered quota system
- **DAT Academy** — Biology, Chemistry, Reading Comprehension question banks with study schedule generator and flashcard previews
- **School Hub** — Detailed profiles for all 10 Canadian dental schools with admission stats, 5-year trends, and side-by-side comparison
- **Competitiveness Calculator** — Enter GPA, DAT scores, province, and ECs to see Safety/Competitive/Reach ratings at each school
- **Application Planner** — Kanban board + calendar view with deadline alerts, scheduling suggestions, and email/push reminders
- **Interview Prep** — MMI and Panel question banks with timed practice simulator and model answers
- **Community Hub** — Share admission results, ask questions, discuss with other applicants, like, comment, and report
- **Notifications** — In-app bell, email reminders (Resend/SendGrid), and browser push notifications
- **Premium Subscriptions** — Stripe-powered Free / Premium / Premium Plus tiers with tier-gated content and PAT question quotas
- **Admin Dashboard** — Platform stats, user/role management, question management, community moderation

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 7, TypeScript, Tailwind CSS, shadcn/ui (~50 components), Framer Motion, Recharts |
| Backend | Hono, tRPC v11, Drizzle ORM |
| Database | PostgreSQL (Supabase via `postgres` driver), 17 tables |
| Auth | 8 OAuth providers (Google, Apple, Microsoft, LinkedIn, Facebook, X, Discord, Instagram) via `arctic`, JWT sessions (`jose`) |
| Payments | Stripe (subscriptions + one-time) |
| Email | Resend / SendGrid / console |
| Testing | Vitest |
| Deploy | Vercel (serverless + cron), Docker, GitHub Actions CI |

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your values (APP_SECRET, GOOGLE_CLIENT_ID, DATABASE_URL, etc.)

# Initialize database
npm run db:push
npm run db:seed:dat:full   # 500 DAT questions (200 bio + 200 chem + 100 RC)
npm run db:seed:interview  # 24 interview questions

# Start dev server
npm run dev
```

The app runs at `http://localhost:3000`.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with HMR |
| `npm run build` | Build for production (`dist/public/` + `dist/boot.js`) |
| `npm run start` | Start production server |
| `npm run check` | TypeScript type-check (`tsc -b`) |
| `npm run lint` | ESLint |
| `npm run test` | Run Vitest tests |
| `npm run format` | Prettier format |
| `npm run db:push` | Push schema to database |
| `npm run db:generate` | Generate Drizzle migrations |
| `npm run db:migrate` | Run migrations |
| `npm run db:seed:dat:full` | Seed DAT questions (500) |
| `npm run db:seed:interview` | Seed interview questions (24) |
| `npm run docker:build` | Build Docker image |
| `npm run docker:up` | Start Docker container |
| `npm run docker:down` | Stop Docker container |

## Project Structure

```
.
├── api/                    # Vercel serverless entry point
│   └── index.ts
├── server/                 # Backend (Hono + tRPC)
│   ├── auth/               # OAuth / session integration (8 providers)
│   ├── lib/                # Email, env, cookies, task scheduler, rate limiting
│   │   └── pat-generation/ # Server-side PAT question generation (PRNG + 6 categories)
│   ├── queries/            # Database connection + user queries
│   ├── auth-router.ts      # Auth routes (me, logout)
│   ├── profile-router.ts   # User profile CRUD
│   ├── task-router.ts      # Application planner tasks, dashboard stats, recommendations
│   ├── pat-router.ts       # PAT practice, analytics, attempts, quota, on-the-fly generation
│   ├── dat-router.ts       # DAT practice and stats
│   ├── tools-router.ts     # Competitiveness calculator
│   ├── interview-router.ts # Interview question bank (DB-backed)
│   ├── payment-router.ts   # Stripe checkout + billing portal
│   ├── admin-router.ts     # Admin dashboard, user/role/question management
│   ├── community-router.ts # Posts, comments, reports, moderation
│   ├── notification-router.ts # In-app + push + email notifications
│   ├── saved-router.ts     # Saved/bookmarked questions (PAT + DAT)
│   ├── flashcard-router.ts # Flashcard SRS (SM-2 algorithm, due cards, reviews)
│   ├── router.ts           # Root router composition (13 sub-routers)
│   ├── app.ts              # Hono app setup
│   ├── boot.ts             # Production server entry
│   ├── context.ts          # tRPC context creation
│   └── middleware.ts       # Procedure builders (publicQuery, authedQuery, adminQuery)
├── src/                    # React frontend
│   ├── components/         # UI components (shadcn/ui + custom)
│   │   └── pat-generators/ # Interactive SVG PAT generators (6 categories)
│   │       └── logic/      # Client-side generation logic (seeded PRNG, 6 categories)
│   ├── hooks/              # useAuth, useTier, usePageTitle, useRecordPATAttempt
│   ├── pages/              # Route pages (~30 pages)
│   ├── providers/          # Theme, tRPC providers
│   ├── lib/                # Utilities (cn, prng.ts for seeded PRNG)
│   ├── App.tsx             # Route definitions
│   └── main.tsx            # Entry point
├── contracts/              # Shared types, constants, school data
├── db/                     # Drizzle schema, relations, migrations, seeds
│   ├── schema.ts           # 17 tables
│   ├── relations.ts        # Foreign-key relationships
│   ├── seed-dat-full.ts    # DAT question seeder (500 questions)
│   ├── seed-interview.ts   # Interview question seeder (24 questions)
│   ├── data/               # DAT question data files (bio, chem, reading)
│   └── migrations/         # Committed SQL migration files
├── docs/                   # Documentation
│   ├── user/               # End-user guides
│   ├── dev/                # Developer & operator guides
│   └── design/             # PRD, feature list, planning docs
├── tools/                  # Standalone PAT tooling — pat CLI (generate/render/convert/validate/standalone)
├── .agents/                # Agent session resume
├── public/                 # Static assets, PWA manifest, icons, sw.js
├── Dockerfile
├── docker-compose.yml
├── vercel.json
└── .github/workflows/ci.yml
```

## Documentation

### Users

- [`docs/user/user-guide.md`](./docs/user/user-guide.md) — Complete guide to PAT Academy, DAT Academy, Competitiveness Calculator, Interview Prep, School Hub, Community, Notifications, Dashboard, and Planner.

### Developers & Operators

- [`docs/dev/setup-guide.md`](./docs/dev/setup-guide.md) — **Complete step-by-step production setup** — database, OAuth, email, payments, deployment (Vercel + Cloudflare), all on free tiers.
- [`docs/dev/dev-guide.md`](./docs/dev/dev-guide.md) — Project structure, stack, architecture, conventions, how to add features, testing, theming.
- [`docs/dev/admin-guide.md`](./docs/dev/admin-guide.md) — Environment setup, deployment (Docker/Vercel), database management, OAuth configuration, email/notifications, monitoring, backups, troubleshooting.
- [`docs/dev/devlog.md`](./docs/dev/devlog.md) — Chronological milestone and commit history.

### Design & Planning

- [`docs/design/feature_list.md`](./docs/design/feature_list.md) — Complete inventory of implemented features plus roadmap brainstorm.
- [`docs/design/PRD/`](./docs/design/PRD/) — Product Requirements Document.

### AI Agents

- [`AGENTS.md`](./AGENTS.md) — Codebase conventions, stack, structure, security model.
- [`.agents/resume.md`](./.agents/resume.md) — Session context for continuing work.

## Environment Variables

See `.env.example` for all required and optional variables. Key variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `APP_SECRET` | Yes | JWT signing secret (min 32 chars) |
| `DATABASE_URL` | Yes | Supabase PostgreSQL connection string |
| `GOOGLE_CLIENT_ID` | Yes | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Yes | Google OAuth client secret |
| `OWNER_UNION_ID` | Yes | OAuth `sub` granted admin role on first login |
| `STRIPE_SECRET_KEY` | No | Stripe secret key (for payments) |
| `STRIPE_WEBHOOK_SECRET` | No | Stripe webhook signing secret |
| `EMAIL_PROVIDER` | No | `console` (default), `resend`, or `sendgrid` |
| `RESEND_API_KEY` | No | Resend API key (when using Resend) |
| `CRON_SECRET` | No | Vercel cron authentication |

All 8 OAuth providers are optional — configure only the ones you want to offer. See [`docs/dev/admin-guide.md`](./docs/dev/admin-guide.md) for per-provider setup instructions.

## License

Proprietary. Not affiliated with the Canadian Dental Association or any dental school.
