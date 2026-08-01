# PreDent Canada — Feature Inventory & Roadmap

> Last updated: 2026-07-31T17:30:00-04:00

This document is a comprehensive inventory of everything currently implemented in the PreDent Canada platform, plus a brainstorm of future features, gaps, and risks. It is intended for product, engineering, and agent audiences.

---

## How to read this document

- **Part 1** groups features by product domain. For each feature we describe:
  - *What it is* — user-facing purpose.
  - *How it is implemented* — key files, endpoints, data models, and integrations.
  - *User perspective* — how an end user interacts with it.
  - *Developer perspective* — how to extend, configure, or debug it.
- **Part 2** is a living brainstorm of must-haves, nice-to-haves, missing capabilities, and known disadvantages/risks.

---

## Part 1: Implemented Features

---

### 1. Authentication & Identity

#### 1.1 Multi-Provider OAuth Sign-In

**What it is**
Single sign-on using any of 8 supported OAuth providers: Google, Apple, Microsoft, LinkedIn, Facebook, X (Twitter), Discord, and Instagram. Users click "Sign In" on `/login`, choose a provider, are redirected, and return with a session cookie.

**How it is implemented**
- Frontend: `src/pages/Login.tsx` renders a card for each configured provider. Each card links to `/api/oauth/authorize/:provider`, which triggers the backend OAuth flow.
- Backend: `server/auth/auth.ts::createOAuthAuthorizeHandler` generates OAuth state + PKCE code verifier, stores them in httpOnly cookies, and redirects to the provider. `server/auth/auth.ts::createOAuthCallbackHandler` handles `GET /api/oauth/callback`, validates state, exchanges the code (via `server/auth/providers.ts`), and upserts the user.
- Providers are implemented via the `arctic` library in `server/auth/providers.ts`. Each provider supplies `getAuthorizationUrl`, `exchangeCode`, and `getUserProfile` methods.
- Session: a signed HS256 JWT (`predent_sid`) is issued with 1-year expiry and stored as an `httpOnly` cookie. The payload contains `unionId`, `provider`, and `tokenVersion`.
- Roles: the first user whose `unionId` matches `OWNER_UNION_ID` is auto-promoted to `role = "admin"`.
- Providers appear on the login page automatically when their client ID/secret are configured. If credentials are missing, the backend returns `provider_not_configured`.

**Supported providers**

| Provider | Flow | Profile Source |
|---|---|---|
| Google | OAuth 2.0 + PKCE, ID token (RS256 JWKS) | ID token payload |
| Apple | OAuth 2.0, ID token (RS256 JWKS) | ID token payload |
| Microsoft | Microsoft Entra ID + PKCE | `graph.microsoft.com/v1.0/me` |
| LinkedIn | OAuth 2.0 (OpenID Connect) | `api.linkedin.com/v2/userinfo` |
| Facebook | OAuth 2.0 | `graph.facebook.com/me` |
| X (Twitter) | OAuth 2.0 + PKCE | `api.twitter.com/2/users/me` |
| Discord | OAuth 2.0 + PKCE | `discord.com/api/v10/users/@me` |
| Instagram | Instagram Basic Display OAuth | `graph.instagram.com/me` |

**User perspective**
- Click **Sign In** in the navbar.
- Choose any configured provider and authorize the app.
- Return to the requested page or `/dashboard`.
- Click avatar → **Logout** to end the session.

**Developer perspective**
- Configure the provider's client ID/secret in `.env`. See `AGENTS.md` §12 for the full list of environment variables.
- Add the redirect URI `https://your-domain.com/api/oauth/callback` in each provider's console.
- To revoke sessions, increment `users.tokenVersion` (done automatically on logout).
- Add new providers by extending `server/auth/providers.ts` and the `users.provider` enum in `db/schema.ts`.

#### 1.2 Session Security

**What it is**
Tamper-proof sessions with server-side revocation support.

**How it is implemented**
- `server/auth/session.ts` signs and verifies session JWTs using `jose`.
- `server/context.ts` loads the current user from the cookie on every tRPC request.
- `server/middleware.ts` exposes `publicQuery`, `authedQuery`, and `adminQuery` procedure builders.
- `tokenVersion` is included in the JWT and compared against the DB; mismatches return 401.

**User perspective**
Users remain signed in across browser restarts for up to one year unless they explicitly log out or an admin invalidates their session.

**Developer perspective**
- Use `authedQuery` / `authedMutation` for user-scoped endpoints.
- Use `adminQuery` / `adminMutation` for admin-only endpoints.
- Changing `APP_SECRET` invalidates all existing sessions.

---

### 2. Landing & Marketing

#### 2.1 Landing Page

**What it is**
The public homepage at `/` that explains the product and drives sign-ups.

**How it is implemented**
- `src/pages/LandingPage.tsx` with Framer Motion scroll animations.
- Sections: animated hero, 6 feature pillars, **How It Works** 3-step explainer, animated stats counter, competitive comparison table (mobile card view + desktop table), **sample PAT question preview**, testimonials, pricing toggle, FAQ accordion, final CTA.
- Theme-aware: hero and CTA adapt to light/dark mode via CSS variables.

**User perspective**
- Browse value props and pricing.
- See the 3-step "How It Works" flow (Diagnose → Practice → Apply).
- Try a free sample PAT question without signing in.
- Click **Get Started Free** or **Explore Schools**.
- Toggle light/dark mode from the navbar.

**Developer perspective**
- Update stats and comparison copy directly in `LandingPage.tsx`.
- The sample PAT preview uses a hardcoded question object rendered with the same components as PAT practice; keep it in sync with the `PracticeQuestion` interface.
- Images use explicit `width`/`height` and lazy loading for CLS/performance.

#### 2.2 SEO Content Pages

**What it is**
Static / mostly-static content pages for organic search and user education.

**How it is implemented**
- `src/pages/GuidesIndexPage.tsx` — directory at `/guides`.
- `src/pages/DATGuidePage.tsx` — `/guides/canadian-dat-guide`.
- `src/pages/StudySchedulesPage.tsx` — `/guides/dat-study-schedules`.
- `src/pages/PATStrategyPage.tsx` — `/guides/pat/:category` for all 6 PAT categories.
- `src/pages/CASPerGuidePage.tsx` — `/guides/casper-dental-school`.
- `src/pages/InterviewPrepPage.tsx` — `/guides/dental-school-interview`.
- `src/pages/ArticleGuidePage.tsx` — `/guides/article/:slug` for evergreen articles.
- `public/sitemap.xml`, `public/robots.txt`, and Open Graph tags in `index.html` support SEO.

**User perspective**
- Navigate via **Guides** in the navbar.
- Read strategy, schedules, and school-prep content without signing in.

**Developer perspective**
- Add new article slugs to the switch statement in `ArticleGuidePage.tsx`.
- Update `sitemap.xml` when adding new public pages.

#### 2.3 Legal Pages

**What it is**
Privacy Policy, Terms of Service, Refund Policy, and Higher Score Guarantee.

**How it is implemented**
- `src/pages/LegalPage.tsx` renders `/legal/:topic`.

**User perspective**
- Linked from the footer.

**Developer perspective**
- Add or update legal topics in `LegalPage.tsx`.

#### 2.4 About & Contact Pages

##### About Page

**What it is**
A public page at `/about` explaining the mission, values, and independence of PreDent Canada.

**How it is implemented**
- `src/pages/AboutPage.tsx`.
- Sections: mission statement, value cards (Canadian-First, Student-Driven, Transparent), disclaimer of affiliation.

**User perspective**
- Click **About** in the footer.
- Read the mission and understand that PreDent Canada is independent of the CDA and dental schools.

**Developer perspective**
- Update copy directly in `AboutPage.tsx`.
- Add team bios, careers, or press-kit sections here as the company grows.

##### Contact Page

**What it is**
A public support page at `/contact` with support channels and response-time expectations.

**How it is implemented**
- `src/pages/ContactPage.tsx`.
- Cards for Email Support, Community Forum, and Response Time.
- "Before You Email" self-service checklist.

**User perspective**
- Click **Contact** in the footer.
- Find the support email, community link, and typical response time.

**Developer perspective**
- Update the support email or response-time copy in `ContactPage.tsx`.
- If a contact form is added later, wire it to a backend router and email provider.

---

### 3. User Dashboard & Profile

#### 3.1 Dashboard

**What it is**
The authenticated home page at `/dashboard` showing a user's progress and quick actions.

**How it is implemented**
- `src/pages/DashboardPage.tsx` calls `trpc.auth.me`, `trpc.profile.get`, and `trpc.task.dashboardStats`.
- Displays user card (avatar, role badge, tier, profile completion), quick links, and editable profile form.

**User perspective**
- View PAT questions done, study streak, and task count.
- Jump to PAT Academy, DAT Academy, School Hub, or Planner.
- Admins see a link to `/admin`.

**Developer perspective**
- New dashboard cards can be added by extending `task.dashboardStats` or adding a new tRPC query.

#### 3.2 User Profile

**What it is**
Extended applicant profile used for personalization and the competitiveness calculator.

**How it is implemented**
- DB: `profiles` table (one-to-one with `users`).
- Backend: `server/profile-router.ts` (`profile.get`, `profile.upsert`).
- Frontend: form in `DashboardPage.tsx`.

**Fields**
- First/last name
- Province
- Current GPA and scale (`4.0` or `100`)
- Year level
- Target application year
- Degree status (`in_progress` / `completed`)
- Undergraduate school
- DAT test date
- Target schools (JSONB array)

**User perspective**
- Fill out the profile form on `/dashboard` to personalize recommendations.

**Developer perspective**
- The profile is optional; pages should degrade gracefully when it is missing.
- New profile fields require a DB migration.

---

### 4. PAT Academy

#### 4.1 PAT Question Bank

**What it is**
A database of 360 Perceptual Ability Test questions covering all 6 Canadian DAT PAT categories, plus infinite on-the-fly generated questions.

**How it is implemented**
- DB: `patQuestions` table with `publicId`, `category`, `difficulty`, `questionData`, `correctAnswer`, `explanationL1/L2/L3`, `concepts`, `timeTarget`, `deletedAt`.
- Seed: `db/seed.ts` generates 360 deterministic questions (60 per category) with 4 difficulties.
- Backend: `server/pat-router.ts` serves questions without exposing the correct answer to the client.
- **On-the-fly:** Questions are now primarily generated via seeded PRNG (see §4.5). The 360 DB questions serve as examples/onboarding. Practice sessions use generated questions.

**Categories**
1. Keyholes
2. Top-Front-End (TFE)
3. Angle Ranking
4. Hole Punching
5. Cube Counting
6. Pattern Folding

**User perspective**
- Browse the PAT Academy hub to see per-category counts and stats.
- Start a practice session with filters.
- Submit answers and read explanations.

**Developer perspective**
- Extend `db/seed.ts` or insert rows via SQL/admin UI.
- `pat.getQuestions` intentionally strips `correctAnswer`; grading is server-side via `pat.recordAttempt`.

#### 4.2 PAT Practice Modes

**What it is**
A full practice session UI with multiple modes, timer, flagging, and keyboard shortcuts.

**How it is implemented**
- Frontend: `src/pages/PATPracticePage.tsx`.
- Setup modes: Quick, Category Drill, Timed, Mixed, Exam.
- Difficulty selection, question count, time-limit toggle.
- Active question screen: timer, progress dots, flagging, pause/resume.
- Results screen: accuracy, category breakdown, expandable review.
- Keyboard shortcuts: `1-4` to select, arrows to navigate, space/enter to submit, escape to pause.

**User perspective**
- Go to **PAT Academy → Practice**.
- Choose mode, category, difficulty, and count.
- Answer questions under a timer and review results.

**Developer perspective**
- Practice state is local to the page; attempts are persisted via `pat.recordAttempt` after each question.

#### 4.3 PAT Analytics

**What it is**
A performance dashboard for PAT practice.

**How it is implemented**
- Backend: `server/pat-router.ts::pat.getAnalytics`.
- Frontend: `src/pages/PATAnalyticsPage.tsx`.

**Metrics**
- Overall accuracy and average time per question
- Predicted PAT score (1–30) with confidence
- Study streak
- Accuracy by category
- Time distribution by category
- Progress trend across recent sessions
- Weakness heatmap (category × difficulty)
- AI-style strengths/weaknesses recommendations

**User perspective**
- Go to **PAT Academy → Analytics** after practicing.
- Identify weak categories and target them.

**Developer perspective**
- Analytics aggregate `patAttempts` for the current user.
- Query limits (500 rows) prevent unbounded reads.

#### 4.4 PAT Generators

**What it is**
Interactive, procedurally generated PAT questions rendered as SVG/canvas diagrams.

**How it is implemented**
- Frontend: `src/pages/PATGeneratorsPage.tsx` + `src/components/pat-generators/`.
- Generators: `AngleRankingGenerator`, `KeyholesGenerator`, `TopFrontEndGenerator`, `HolePunchingGenerator`, `CubeCountingGenerator`, `PatternFoldingGenerator`.
- Shared SVG utilities in `src/components/pat-generators/shared/IsoCube.tsx`.
- Attempts are persisted via the shared `useRecordPATAttempt` hook.

**User perspective**
- Premium users get unlimited generator questions.
- Free users can try the Angle Ranking generator; others show a `PremiumLock` overlay.

**Developer perspective**
- Generators map client-side `easy/medium/hard` to server-side `beginner/intermediate/advanced/elite` difficulty.
- Correct options are tagged before shuffling to avoid distractor collisions.

#### 4.5 On-the-Fly PAT Generation

**What it is**
Seeded PRNG-based question generation that produces infinite unique PAT questions on demand. Questions are generated client-side using a seed (derived from `Date.now()`), while the server re-derives the correct answer from the seed to prevent cheating. No generated questions are persisted to the database.

**How it is implemented**
- **PRNG:** `src/lib/prng.ts` (mulberry32) and `server/lib/pat-generation/prng.ts` (identical).
- **Client logic:** `src/components/pat-generators/logic/` — 6 category modules (`keyholes.ts`, `tfe.ts`, `angleRanking.ts`, `holePunching.ts`, `cubeCounting.ts`, `patternFolding.ts`) + `index.ts` barrel export.
- **Server logic:** `server/lib/pat-generation/` — mirrors client logic for answer re-derivation.
- **Generators (client):** All 6 generator components accept `{ config: { seed, difficulty }, onAnswer }` props. In controlled mode (practice), they render a specific question from the seed. In free mode (generator page), they use `Math.random()`.
- **Practice page:** `src/pages/PATPracticePage.tsx` — `QuestionRenderer` switch dispatches to the correct generator based on category. Attempts recorded via `useRecordPATAttempt` hook which sends `{ seed, category, difficulty, userAnswer, isCorrect, timeSpent }`.
- **Server:** `server/pat-router.ts` — `recordAttempt` accepts `questionId` (DB) OR `seed` (generated) mode. `getQuota` returns remaining questions and stats. `apiToGenDifficulty` maps `"beginner"→"easy"`, `"intermediate"→"medium"`, `"advanced"/"elite"→"hard"`.
- **Quota:** `contracts/tiers.ts` — `TIER_QUOTAS` defines lifetime limits: free=20, premium=360, premium_plus=1080. `users.patQuestionsGenerated` tracks usage. Quota auto-increments on each generated question attempt.
- **Academy page:** `src/pages/PATAcademyPage.tsx` — shows real stats, quota progress bar, tier badge, upgrade CTA.
- **Hooks:** `src/hooks/useRecordPATAttempt.ts` — accepts both string `questionId` (DB questions) and number `seed` (generated questions).

**User perspective**
- Free users can try 20 generated questions per category.
- Premium users get 360 total across all categories.
- Premium Plus users get 1080 total.
- Quota is displayed on PAT Academy with a progress bar.
- Generated questions are indistinguishable from DB questions — same SVG rendering, same answer flow.

**Developer perspective**
- Server re-derives the answer from the seed to prevent client-side answer leaking.
- `useRecordPATAttempt` hook handles both DB and generated question types.
- Difficulty mapping is handled by `genToApi`/`difficultyToGen` on the client and `apiToGenDifficulty` on the server.
- 150 seeded test cases per category in the test suite verify generation determinism.

#### 4.6 Tiered Explanations

**What it is**
Three levels of explanation for each PAT question.

**How it is implemented**
- `patQuestions.explanationL1` (available to all)
- `patQuestions.explanationL2` and `explanationL3` (locked for Premium users)

**User perspective**
- Free users see the L1 explanation after answering.
- Premium users unlock deeper explanations.

**Developer perspective**
- Explanations are returned by `pat.verifyAnswer` and `pat.recordAttempt` based on the user's tier.

---

### 5. DAT Academy

#### 5.1 DAT Question Bank

**What it is**
Biology, Chemistry, and Reading Comprehension practice questions for the Canadian DAT.

**How it is implemented**
- DB: `datQuestions` table (`subject`, `topic`, `difficulty`, `questionText`, `options`, `correctAnswer`, `explanation`).
- Seed: `db/seed-dat.ts` provides 15 hardcoded sample questions (6 biology, 6 chemistry, 3 reading).
- Backend: `server/dat-router.ts` (`dat.listQuestions`, `dat.recordAttempt`, `dat.stats`).

**User perspective**
- Go to **DAT Academy** and select a subject.
- Practice one question at a time with instant feedback.

**Developer perspective**
- `dat.listQuestions` is authed and strips answers; `dat.recordAttempt` grades server-side.
- Expand the bank by editing `db/seed-dat.ts` and running `npm run db:seed:dat`.

#### 5.2 Study Schedule Generator

**What it is**
A tool that builds a weekly study plan based on test date, available hours, and comfort levels.

**How it is implemented**
- Frontend: embedded in `src/pages/DATAcademyPage.tsx`.
- Inputs: test date, hours per week, comfort sliders for Biology/Chemistry/Reading/PAT.
- Output: weekly schedule with milestones and subject breakdown.

**User perspective**
- Enter DAT test date and availability.
- Receive a customized multi-week schedule.

**Developer perspective**
- The schedule is generated client-side; no backend state is persisted.

#### 5.3 Flashcard Decks

**What it is**
Preview of Biology, Chemistry, and PAT concept flashcard decks.

**How it is implemented**
- Frontend: `DATAcademyPage.tsx` lists decks.

**User perspective**
- Browse available decks on the DAT Academy hub.

**Developer perspective**
- Full flashcard study mode is a placeholder / preview; the underlying content lives in `datQuestions` and `patQuestions` concepts.

---

### 6. School Hub

#### 6.1 School Directory

**What it is**
A searchable/filterable list of all 10 Canadian dental schools.

**How it is implemented**
- Data: `contracts/schools.ts` (static TypeScript array).
- Frontend: `src/pages/SchoolHubPage.tsx` with province filter and search.

**Schools covered**
- University of Toronto
- Western University
- McGill University
- Université de Montréal
- Université Laval
- UBC
- University of Alberta
- University of Saskatchewan
- University of Manitoba
- Dalhousie University

**User perspective**
- Visit **School Hub**.
- Filter by province and click a school for details.

**Developer perspective**
- Update `contracts/schools.ts` when admission stats or program details change, then rebuild.

#### 6.2 School Detail Page

**What it is**
A comprehensive profile for each dental school.

**How it is implemented**
- Frontend: `src/pages/SchoolDetailPage.tsx`.
- Sections: overview, highlights, admission requirements, prerequisites, 5-year trend charts (GPA/DAT AA/DAT PAT), acceptance stats, campus life, related schools, competitiveness CTA.

**User perspective**
- View requirements, averages, and trends.
- Click **Check Your Chances** to pre-fill the competitiveness calculator.

**Developer perspective**
- Charts use Recharts; data comes from `contracts/schools.ts` and `schoolStats` table.

#### 6.3 School Comparison

**What it is**
Side-by-side comparison of up to 4 schools.

**How it is implemented**
- Frontend: `src/pages/SchoolComparisonPage.tsx`.
- Route: `/compare`.

**User perspective**
- Select schools to compare tuition, seats, GPA, DAT, CASPer, and interview format.
- See a "Key Differences" summary.

**Developer perspective**
- Comparison data is static from `contracts/schools.ts`.

---

### 7. Tools & Calculators

#### 7.1 Competitiveness Calculator

**What it is**
Estimates admission probability at each Canadian dental school based on applicant stats.

**How it is implemented**
- Backend: `server/tools-router.ts::tools.calculateCompetitiveness`.
- Frontend: `src/pages/CompetitivenessCalculatorPage.tsx`.
- Inputs: GPA (4.0/100), DAT AA/PAT/RC, province, degree status, CASPer quartile, extracurricular score.
- Outputs: per-school probability and Safety/Competitive/Reach rating with component breakdown.

**User perspective**
- Go to **Tools → Competitiveness Calculator**.
- Enter stats and click **Calculate**.
- Review ranked results and methodology.

**Developer perspective**
- The weighted scoring model is in `tools-router.ts`.
- School data comes from `contracts/schools.ts` and `schoolStats`.

#### 7.2 GPA Calculator

**What it is**
Converts between 4.0, percentage, and letter grade scales.

**How it is implemented**
- Frontend: `src/pages/GPACalculatorPage.tsx`.

**User perspective**
- Enter a GPA on one scale and see conversions.

**Developer perspective**
- Pure client-side utility; no backend required.

#### 7.3 PAT Score Calculator

**What it is**
Estimates an overall PAT score from 6 category sub-scores.

**How it is implemented**
- Frontend: `src/pages/PATCalculatorPage.tsx`.

**User perspective**
- Input category scores with sliders.
- See estimated total and percentile approximation.

**Developer perspective**
- Client-side calculation; can be extended with real percentile norms.

---

### 8. Interview Preparation

**What it is**
MMI and Panel interview preparation with question bank and timed simulator.

**How it is implemented**
- DB: `interviewQuestions` table with `publicId`, `format`, `category`, `question`, `modelAnswer`, `frequency`, `schoolId`.
- Backend: `server/interview-router.ts` queries from DB with filtering.
- Seed: `db/seed-interview.ts` seeds 25 questions (16 Panel, 9 MMI).
- Frontend: `src/pages/InterviewPrepPage.tsx`.
- Tabs: Guide, Question Bank, Practice Simulator.

**User perspective**
- Read about MMI vs Panel formats and school-specific styles.
- Browse questions by category.
- Run a timed mock interview with randomized questions and model answers.

**Developer perspective**
- Questions are stored in `interviewQuestions` table; seed via `npm run db:seed:interview`.
- Add new questions via DB inserts or admin UI.

---

### 9. Application Planner

**What it is**
A Kanban/calendar task manager for dental school application deadlines.

**How it is implemented**
- DB: `tasks` table.
- Backend: `server/task-router.ts` (CRUD, filtering, bulk updates, scheduling suggestions).
- Frontend: `src/pages/PlannerPage.tsx` with board view, calendar view, task form, filters, and scheduling suggestions.

**Task fields**
- Title, category (`academic`, `dat`, `experience`, `application`, `interview`, `other`)
- Status (`not_started`, `in_progress`, `under_review`, `complete`, `blocked`)
- Priority (`critical`, `high`, `medium`, `low`)
- Due date, estimated minutes, notes, school ID
- `completedAt`, `rescheduledFrom`, `dueNotifiedAt`

**User perspective**
- Go to **Dashboard → Planner**.
- Drag tasks across board columns or view them on a calendar.
- Add/edit tasks and reschedule with previous-date tracking.
- Receive due-date reminders via email/push.

**Developer perspective**
- The hourly background scheduler (`server/lib/tasks/notifications.ts`) creates reminders for tasks due within 24 hours.
- On Vercel, the daily cron job (`/api/cron/notify`) performs the same check.

---

### 10. Community Hub

**What it is**
A forum for pre-dental students to share admission results, ask questions, and discuss applications.

**How it is implemented**
- DB: `communityPosts`, `communityComments`, `communityReports`.
- Backend: `server/community-router.ts`.
- Frontend: `src/pages/CommunityHubPage.tsx`, `src/components/CommentSection.tsx`, `src/components/ReportDialog.tsx`.

**Post types**
- `result` — admission outcomes with GPA/DAT stats
- `question` — application questions
- `discussion` — general topics

**Features**
- Tabbed feed with filtering
- Create/edit/delete own posts
- Comments
- Likes (atomic increment + notification)
- Reports (idempotent per reporter)
- Admin moderation queue

**User perspective**
- Visit **Community**.
- Share a result or ask a question.
- Like and comment on posts.
- Report inappropriate content.

**Developer perspective**
- Posts/comments support soft delete/hide.
- `community.createPost` emails users who posted about the same school when a question is asked.
- Admins review reports at `/admin/community`.

---

### 11. Notifications

#### 11.1 In-App Notifications

**What it is**
A notification bell and dropdown showing recent activity.

**How it is implemented**
- DB: `notifications` table.
- Backend: `server/notification-router.ts`.
- Frontend: `src/components/NotificationBell.tsx`.

**Types**
- `system` — welcome messages
- `task_due` — task reminders
- `study_reminder` — study prompts
- `community` — likes, comments, new posts
- `payment` — subscription events

**User perspective**
- Click the bell in the navbar.
- See unread count and latest notifications.
- Mark individual or all notifications as read.

**Developer perspective**
- Create notifications via `createNotification()` in `server/lib/email/index.ts`.

#### 11.2 Email Notifications

**What it is**
Email delivery for task reminders, study reminders, and community activity.

**How it is implemented**
- Provider abstraction: `EMAIL_PROVIDER=console|resend|sendgrid`.
- Templates in `server/lib/email/templates.ts`.
- Sends respect user preferences stored in `users.emailTaskDue`, `emailStudyReminder`, `emailCommunity`.

**User perspective**
- Configure email preferences in **Dashboard → Settings → Notifications**.
- Receive reminders when tasks are due or study prompts are scheduled.

**Developer perspective**
- Set `EMAIL_PROVIDER`, `EMAIL_FROM`, and provider API keys in `.env`.
- `console` provider logs emails to stdout for local dev.

#### 11.3 Web Push Notifications

**What it is**
Browser push notifications for reminders and community activity.

**How it is implemented**
- `web-push` library with VAPID keys.
- `pushSubscriptions` table stores subscriptions.
- Frontend: `src/components/PushNotificationToggle.tsx`.
- Backend: `server/notification-router.ts` (`subscribePush`, `unsubscribePush`, `getPushStatus`).

**User perspective**
- Enable push notifications in **Dashboard → Settings → Notifications**.
- Receive system reminders even when the site is closed.

**Developer perspective**
- VAPID keys must be configured (public/private) for push to work in production.
- Expired subscriptions (410) are automatically removed.

---

### 12. Premium Subscriptions & Payments

#### 12.1 Pricing & Checkout

**What it is**
Free, Premium, and Premium Plus subscription tiers with Stripe checkout.

**How it is implemented**
- Backend: `server/payment-router.ts`.
- Frontend: `src/pages/PricingPage.tsx`, `src/components/PremiumCTA.tsx`, `src/components/PremiumLock.tsx`.
- Stripe Checkout sessions for:
  - Premium Monthly
  - Premium Yearly
  - Premium Plus Lifetime

**User perspective**
- Visit **Pricing**.
- Choose a plan and complete checkout via Stripe.
- Manage billing via the customer portal.

**Developer perspective**
- Configure Stripe price IDs and webhook secret in `.env`.
- Webhook handler is at `POST /api/webhooks/stripe`.

#### 12.2 Subscription Lifecycle

**What it is**
Automatic tier updates based on Stripe events.

**How it is implemented**
- `stripeWebhookEvents` table prevents duplicate processing.
- Handled events:
  - `checkout.session.completed` — upgrade to `premium` or `premium_plus`
  - `invoice.paid` — extend `premiumUntil`
  - `customer.subscription.deleted` — downgrade to `free`

**User perspective**
- Access to premium features is automatic after successful checkout.
- Premium expires if subscription is canceled.

**Developer perspective**
- Stripe webhook endpoint must be registered in Stripe Dashboard.
- Use Stripe CLI or dashboard to replay events for testing.

#### 12.3 Tier Gating

**What it is**
Premium-only features are blocked for free users.

**How it is implemented**
- `useTier()` hook checks `users.tier`.
- `PremiumLock` overlays locked generators.
- L2/L3 explanations are filtered server-side.

**User perspective**
- Free users see upgrade CTAs on locked features.
- Premium/Premium Plus users get full access.

**Developer perspective**
- Use `useTier().hasAccess("premium")` in components.
- Always enforce tier checks on the server, not just the UI.

---

### 13. Admin

#### 13.1 Admin Dashboard

**What it is**
An admin-only control panel at `/admin`.

**How it is implemented**
- Frontend: `src/pages/AdminDashboardPage.tsx`.
- Backend: `server/admin-router.ts`.

**Capabilities**
- Platform stats (users, PAT/DAT questions, attempts)
- User listing with role toggle
- PAT/DAT question listing and soft delete
- Manual DAT question seeding
- Manual task due-date reminder dispatch

**User perspective**
- Admin logs in and navigates to `/admin`.
- Manage users, content, and operational tasks.

**Developer perspective**
- Admin access is enforced by `adminQuery` middleware.
- Soft deletes set `deletedAt` and are audited in `adminActions`.

#### 13.2 Community Moderation

**What it is**
Admin queue for reported community posts and comments.

**How it is implemented**
- Frontend: `src/pages/admin/CommunityModerationPage.tsx`.
- Backend: `server/community-router.ts` admin procedures.

**User perspective**
- Admins review reports and choose dismiss/hide/delete.

**Developer perspective**
- Reports are in `communityReports`; actions update `hiddenAt`/`deletedAt`.

---

### 14. Developer Experience & Infrastructure

#### 14.1 Frontend Stack

- **React 19** with functional components and hooks.
- **Vite 7** dev server and production build.
- **Tailwind CSS v3** with theme CSS variables and `darkMode: "class"`.
- **shadcn/ui** primitives in `src/components/ui/` (~50 components).
- **React Router v7** `BrowserRouter`.
- **Framer Motion** for landing-page animations.
- **Recharts** for analytics charts.
- **lucide-react** for icons.
- **react-hook-form + zod** for forms.
- Code-splitting: all pages lazy-loaded.

#### 14.2 Backend Stack

- **Hono** web framework.
- **tRPC v11** for type-safe API with `superjson` transformer.
- **Drizzle ORM** with PostgreSQL (`postgres` driver).
- **Drizzle Kit** for migrations.
- **Zod** for input validation.
- **esbuild** for server bundling.

#### 14.3 Database

- PostgreSQL on Supabase.
- 14 tables: `users`, `profiles`, `tasks`, `patQuestions`, `patAttempts`, `datQuestions`, `datAttempts`, `schoolStats`, `communityPosts`, `communityComments`, `communityReports`, `notifications`, `stripeWebhookEvents`, `pushSubscriptions`, `adminActions`.
- Drizzle relations defined in `db/relations.ts`.

#### 14.4 DevOps

- **Docker** multi-stage build + docker-compose.
- **Vercel** serverless deployment via `api/index.ts`.
- **GitHub Actions CI** running `check`, `lint`, `test`, `build`.
- **Health check** at `GET /api/trpc/ping`.
- **Rate limiting** on public endpoints (`/api/oauth/callback`, `/api/trpc/*`, `/api/webhooks/stripe`, `/api/cron/notify`).

#### 14.5 PWA / SEO

- `public/manifest.json` — installable PWA.
- `public/sw.js` — service worker caches `index.html` and skips `/api/`.
- `public/robots.txt` — disallows `/api/`, `/admin`, `/dashboard`.
- `public/sitemap.xml` — SEO sitemap.
- Open Graph / Twitter Card meta tags in `index.html`.

#### 14.6 Analytics

- **PostHog** (`posthog-js`) for pageviews and key events across 9 pages.

#### 14.7 Security

- Signed session JWTs (`APP_SECRET`).
- `httpOnly` cookies with secure/SameSite adaptation.
- Rate limiting.
- Soft deletes + audit log for admin actions.
- Server-side grading for PAT/DAT.
- Input validation with Zod.
- Security headers in `vercel.json`.
- Body size limit of 1 MB.

---

## Part 2: Feature Brainstorm

This section captures potential next features, gaps, and risks. Items are not committed work; they are inputs for prioritization.

### Must-Haves (High-Impact / Low-to-Medium Effort)

1. **End-to-End (E2E) Test Suite**
   - Critical flows: sign-in, PAT practice, checkout, admin soft-delete, community post/comment.
   - Tool: Playwright or Cypress.
   - *Why:* The platform has 123 passing unit tests but no browser-level coverage for user journeys.

2. **Production Error Tracking**
   - Integrate Sentry (or similar) for backend/frontend errors and performance monitoring.
   - Wire the existing `ErrorBoundary` to report to Sentry.
   - *Why:* Currently errors are only visible in server logs or the client console.

3. **DAT Question Bank Expansion**
   - Increase from 15 sample questions to a full bank (target: 500–1,000+ per subject).
   - Add topic tagging and difficulty calibration.
   - *Why:* DAT Academy is currently a thin preview; users need real practice volume.

4. **Study Streak Calculation**
   - Compute actual consecutive daily activity from `patAttempts`/`datAttempts` instead of the placeholder `0`.
   - Surface streak in Dashboard, Analytics, and notifications.
   - *Why:* Study streak is shown in UI but not actually computed.

5. **PAT Generator Expansion & Quality**
   - Add more variety, difficulty levels, and visual polish to all 6 generators.
   - Improve Hole Punching canvas renderer and Pattern Folding 3D preview.
   - *Why:* Generators are a premium differentiator but currently prototypes.

### Nice-to-Haves (Medium-to-High Impact / Higher Effort)

6. **Spaced Repetition / Flashcards**
   - Full SRS flashcard mode using existing `datQuestions` and `patQuestions.concepts`.
   - Track mastery and schedule reviews.

7. **Mock DAT Exam**
   - Full-length timed exam mixing all subjects.
   - Score report with percentile and section breakdowns.

8. **Personalized Study Dashboard**
   - AI/ML or heuristic-driven daily recommendation: "Practice Angle Ranking today — accuracy dropped 12%."
   - Combine PAT analytics, DAT stats, task deadlines, and streak.

9. **Application Timeline Templates**
   - Pre-built task lists for each school/application cycle (e.g., "UofT 2026 cycle").
   - Auto-create tasks with realistic deadlines.

10. **Document / Portfolio Manager**
    - Upload and track CV, personal statement, reference letters, transcripts.
    - Use the existing AWS S3 SDK dependency.

11. **Real-Time Community**
    - Live comments, typing indicators, online presence.
    - Optional WebSocket or SSE layer.

12. **Mobile App (PWA-First or React Native)**
    - Offline practice for PAT generators.
    - Push notifications become more valuable.

13. **Affiliate / Referral Program**
    - Referral codes, credits, or extended Premium for invites.
    - Stripe metadata tracking.

14. **School Admissions Data Import**
    - Admin UI to upload annual admission stats instead of editing `contracts/schools.ts`.
    - Migrate trend data from static TS to `schoolStats` table.

15. **A/B Testing Framework**
    - Feature flags and experiment tracking (PostHog supports this).
    - Useful for pricing page and landing page optimization.

### Missing Features / Gaps

16. **Content Management System (CMS)**
    - All guides, legal pages, and school data are hardcoded in TypeScript.
    - Non-engineers cannot update marketing copy or school stats.

17. **User Onboarding Flow**
    - No guided onboarding after first login.
    - Profile completion is optional and not prompted.

18. **Search**
    - No global search across schools, guides, questions, or community posts.
    - SQLite FTS5 was planned in the original PRD but not implemented.

19. **Bookmarking / Saved Questions**
    - Users cannot flag questions to review later.
    - The "flag" button in PAT practice is only per-session.

20. **Performance Benchmarking**
    - No official target times or percentile comparisons for DAT practice.
    - PAT time targets exist but are not surfaced as strongly as they could be.

21. **Social Login Beyond Google**
    - ~~Only Google OAuth is supported.~~ *(Done — 8 providers: Google, Apple, Microsoft, LinkedIn, Facebook, X, Discord, Instagram)*

22. **Email Verification / Password Recovery**
    - Not applicable to OAuth-only auth, but if email/password is added, these become required.

23. **Data Export / GDPR Compliance**
    - No self-service data export or account deletion flow.
    - Privacy page exists but operational GDPR tools do not.

24. **Leaderboards / Gamification**
    - No public leaderboards, badges, or achievements beyond streak.

25. **Tutoring / Marketplace**
    - Original PRD mentioned expert tutoring; no marketplace exists.

26. **About / Contact Depth**
    - Basic `/about` and `/contact` pages exist, but they lack team bios, careers/press kit, a contact form, live chat, or detailed company history.

### Disadvantages / Risks of Current Features

26. **In-Memory Rate Limiting**
    - `server/lib/rate-limit.ts` stores limits in process memory.
    - Does not work correctly across multiple server instances or Vercel serverless functions.
    - *Mitigation:* move to Redis or a rate-limiting service for production scale.

27. **Vercel Cron Single Point of Failure**
    - Daily cron runs only once per day.
    - If it fails, reminders are missed until the next day.
    - *Mitigation:* add cron monitoring and retry logic.

28. **Hardcoded School Data**
    - `contracts/schools.ts` requires a code change and redeploy for stat updates.
    - *Mitigation:* migrate to `schoolStats` table + admin UI.

29. **Limited DAT Content**
    - Only 15 DAT questions exist.
    - Makes DAT Academy uncompetitive with dedicated DAT prep sites.
    - *Mitigation:* content expansion is the highest-priority content gap.

30. **PAT Generator Quality**
    - Some generators are SVG/canvas prototypes with limited variety.
    - Hole Punching and Pattern Folding are especially tricky to render well.
    - *Mitigation:* invest in diagram rendering or license existing question banks.

31. **Community Moderation Scale**
    - Reports are reviewed manually by admins.
    - At scale, this becomes a bottleneck.
    - *Mitigation:* automated moderation heuristics + trusted-user moderation.

32. **Push Notification UX**
    - Browser push permission prompts can be intrusive.
    - Without careful timing, users may block notifications.
    - *Mitigation:* gate prompts behind explicit opt-in after value demonstration.

33. **Payment Dependency on Stripe**
    - Single payment provider creates vendor lock-in.
    - *Mitigation:* abstract payment provider interface further; keep door open for PayPal, Apple Pay, etc.

34. **Database Migrations Not Auto-Run**
    - Deploys require manual `npm run db:migrate`.
    - Easy to forget, especially on Vercel.
    - *Mitigation:* add a pre-deploy hook or migration command in CI/CD.

35. **PWA Theme Color**
    - `manifest.json` uses always-dark `#0F172A`, which clashes in light mode.
    - *Mitigation:* generate manifest/theme color dynamically or choose a neutral brand color.

---

## Appendix: Cross-Reference

| Domain | Key Frontend | Key Backend | Key DB Tables |
|---|---|---|---|
| Auth | `src/pages/Login.tsx` | `server/auth/`, `server/auth-router.ts` | `users` |
| About / Contact | `src/pages/AboutPage.tsx`, `src/pages/ContactPage.tsx` | — | — |
| Dashboard / Profile | `src/pages/DashboardPage.tsx` | `server/profile-router.ts` | `users`, `profiles` |
| PAT Academy | `src/pages/PAT*.tsx`, `src/components/pat-generators/` | `server/pat-router.ts` | `patQuestions`, `patAttempts` |
| DAT Academy | `src/pages/DAT*.tsx` | `server/dat-router.ts` | `datQuestions`, `datAttempts` |
| School Hub | `src/pages/School*.tsx` | `server/tools-router.ts` | `schoolStats`, `contracts/schools.ts` |
| Interview | `src/pages/InterviewPrepPage.tsx` | `server/interview-router.ts` | `interviewQuestions` |
| Planner | `src/pages/PlannerPage.tsx` | `server/task-router.ts` | `tasks` |
| Community | `src/pages/CommunityHubPage.tsx` | `server/community-router.ts` | `communityPosts`, `communityComments`, `communityReports` |
| Notifications | `src/components/NotificationBell.tsx` | `server/notification-router.ts`, `server/lib/tasks/notifications.ts` | `notifications`, `pushSubscriptions` |
| Payments | `src/pages/PricingPage.tsx` | `server/payment-router.ts`, `server/app.ts` (webhook) | `users`, `stripeWebhookEvents` |
| Admin | `src/pages/AdminDashboardPage.tsx`, `src/pages/admin/CommunityModerationPage.tsx` | `server/admin-router.ts` | `users`, `adminActions` |
| Search | `src/components/Navbar.tsx` (Cmd+K) | — (client-side) | — |
| Saved Questions | `src/pages/DATPracticePage.tsx` | `server/saved-router.ts` | `savedQuestions` |
| Flashcards | `src/pages/FlashcardsPage.tsx` | `server/flashcard-router.ts` | `flashcardReviews` |
| Mock Exam | `src/pages/MockExamPage.tsx` | `server/dat-router.ts` | `datQuestions`, `datAttempts` |
| Recommendations | `src/pages/DashboardPage.tsx` | `server/task-router.ts` (`getRecommendations`) | `patAttempts`, `datAttempts`, `tasks` |

---

*For implementation conventions, see [`AGENTS.md`](../../AGENTS.md). For the development history, see [`docs/dev/devlog.md`](../dev/devlog.md).*
