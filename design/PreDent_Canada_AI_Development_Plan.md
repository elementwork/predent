# PreDent Canada: AI-Optimized Development Plan for Kimi Website Agent

> **Version:** 1.0  
> **Date:** 2026-06-20  
> **Optimized For:** Kimi K2.6 Website Agent (Text-to-Website, Multi-Page, Full-Stack, One-Click Publish)  
> **Source PRD:** PreDent_Canada_PRD.md

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Kimi Website Agent Optimization Strategy](#2-kimi-website-agent-optimization-strategy)
3. [Phase 1: Foundation & Static Layer (Steps 1–4)](#3-phase-1-foundation--static-layer-steps-14)
4. [Phase 2: Dynamic Layer — Auth & Database (Steps 5–7)](#4-phase-2-dynamic-layer--auth--database-steps-57)
5. [Phase 3: Core Product — PAT & DAT Academy (Steps 8–10)](#5-phase-3-core-product--pat--dat-academy-steps-810)
6. [Phase 4: Intelligence & Analytics (Steps 11–13)](#6-phase-4-intelligence--analytics-steps-1113)
7. [Phase 5: Polish & Launch (Steps 14–16)](#7-phase-5-polish--launch-steps-1416)
8. [Summary: 16-Step Roadmap](#8-summary-16-step-roadmap)
9. [Key Prompting Tips for Kimi Website Agent](#9-key-prompting-tips-for-kimi-website-agent)
10. [Appendix: PRD Data Quick Reference](#10-appendix-prd-data-quick-reference)

---

## 1. Executive Summary

This plan transforms the 100+ page **PreDent Canada PRD** into **16 discrete, self-contained prompt steps** optimized for Kimi K2.6's Website Agent capabilities. Each step produces a **working, testable milestone** that builds incrementally toward the complete platform.

**Core Strategy:**
- **Static-first launch** — SEO pages, school database, and free tools require no backend
- **Dynamic layer added incrementally** — auth, database, payments, and premium gating
- **Full-stack in single codebase** — Next.js 14 + SQLite + TypeScript + Tailwind
- **One-click deployable at every step** — each milestone is independently testable

**Target Metrics:**
- **Development Time:** 16–24 days of focused AI-assisted development
- **Monthly Operating Cost:** $5–25 (VPS + domain + optional services)
- **User Capacity:** 50,000+ registered users on single SQLite instance

---

## 2. Kimi Website Agent Optimization Strategy

### 2.1 Capability Mapping

| Kimi Capability | How We Leverage It |
|---|---|
| **Text/Image/Video to Website** | Provide wireframe descriptions + PRD visual references as prompts |
| **Multi-page Support** | Each step generates a complete page cluster (landing + dashboard + feature pages) |
| **Full-stack (Auth, DB, Payments)** | Prompt for SQLite + Lucia auth + Stripe integration in dynamic steps |
| **Natural Language Editing** | `"Change the hero section to dark mode"` — iterative refinement prompts |
| **One-click Publish** | Each milestone is deployable for immediate testing |
| **Awwwards-level Design** | Reference PRD Section 14 (Visual Design System) in every prompt |

### 2.2 Design System Constants (Use in EVERY Prompt)

```
COLOR PALETTE:
- Primary: #2563EB (Dental Blue)
- Primary Dark: #1D4ED8
- Secondary: #10B981 (Success Green)
- Accent: #F59E0B (Warm Orange)
- Alert: #EF4444
- Background: #FFFFFF
- Background Alt: #F8FAFC
- Surface: #F1F5F9
- Text Primary: #0F172A
- Text Secondary: #475569
- Text Tertiary: #94A3B8
- Border: #E2E8F0

PAT CATEGORY COLORS:
- Keyholes: #14B8A6 (Teal)
- TFE: #6366F1 (Indigo)
- Angle Ranking: #F59E0B (Amber)
- Hole Punching: #F43F5E (Rose)
- Cube Counting: #10B981 (Emerald)
- Pattern Folding: #8B5CF6 (Violet)

TYPOGRAPHY:
- Font: Inter (all weights)
- Mono: JetBrains Mono
- Display: 800 weight, 48px / 3rem, line-height 1.1
- H1: 700 weight, 36px / 2.25rem, line-height 1.2
- H2: 600 weight, 28px / 1.75rem, line-height 1.3
- H3: 600 weight, 22px / 1.375rem, line-height 1.4
- Body: 400 weight, 16px / 1rem, line-height 1.6
- Body Small: 400 weight, 14px / 0.875rem, line-height 1.5
- Caption: 400 weight, 12px / 0.75rem, line-height 1.5
- Label: 500 weight, 12px / 0.75rem, line-height 1.4
- Button: 600 weight, 14px / 0.875rem, line-height 1

SPACING (4px grid):
- space-1: 4px
- space-2: 8px
- space-3: 12px
- space-4: 16px
- space-6: 24px
- space-8: 32px
- space-12: 48px
- space-16: 64px

CARDS:
- Background: #FFFFFF or #F8FAFC
- Border radius: 12px (rounded-xl)
- Shadow: 0 1px 3px rgba(0,0,0,0.08)
- Hover shadow: 0 4px 12px rgba(0,0,0,0.12)
- Padding: 24px

INPUTS:
- Border: 1px #E2E8F0
- Border radius: 8px (rounded-lg)
- Height: 44px
- Focus: 2px #2563EB ring
- Placeholder: #94A3B8

BUTTONS:
- Primary: bg #2563EB, white text, hover #1D4ED8
- Secondary: white bg, #2563EB border
- Success: bg #10B981, white text, hover #059669
- Danger: bg #EF4444, white text, hover #DC2626
- Ghost: transparent bg, #475569 text, hover #F1F5F9
- Premium: bg #F59E0B, white text, hover #D97706
```

### 2.3 Tech Stack (Repeated in Dynamic Steps)

```
FRAMEWORK: Next.js 14 (App Router)
LANGUAGE: TypeScript
STYLING: Tailwind CSS + shadcn/ui
DATABASE: SQLite (better-sqlite3)
ORM: Drizzle ORM
AUTH: Lucia (session-based, SQLite-native)
PAYMENTS: Stripe
3D: Three.js (client-side)
SEARCH: SQLite FTS5
EMAIL: Resend
HOSTING: Hetzner CX11 VPS ($4.51/mo) or Railway
```

---

## 3. Phase 1: Foundation & Static Layer (Steps 1–4)

> **Goal:** Launch a beautiful, SEO-ready static site with school database, landing pages, and free tools. No backend required yet.

---

### Step 1: Design System & Landing Page

**Prompt for Kimi Website Agent:**

```
Create a production-ready landing page for "PreDent Canada" — the operating system for Canadian pre-dental students.

DESIGN SYSTEM (strictly follow):
- Primary: #2563EB (Dental Blue), Primary Dark: #1D4ED8
- Secondary: #10B981 (Success Green), Accent: #F59E0B (Warm Orange)
- Alert: #EF4444, Background: #FFFFFF, Background Alt: #F8FAFC
- Surface: #F1F5F9, Text Primary: #0F172A, Text Secondary: #475569
- Text Tertiary: #94A3B8, Border: #E2E8F0
- Font: Inter (all weights), Mono: JetBrains Mono
- Cards: 12px radius, shadow 0 1px 3px rgba(0,0,0,0.08), hover: 0 4px 12px rgba(0,0,0,0.12)
- Buttons: Primary (blue bg, white text, hover #1D4ED8), Secondary (white bg, blue border)
- Spacing: 4px grid (4, 8, 12, 16, 24, 32, 48, 64)

PAGE STRUCTURE:
1. HERO: "The Operating System for Canadian Pre-Dental Students" — animated gradient background, CTA "Get Started Free" + "Explore Schools"
2. VALUE PROP: 6 pillar cards (PAT Academy, DAT Academy, School Hub, Application Planner, Community Intelligence, Analytics) with icons
3. SOCIAL PROOF: "900+ applications for 96 UofT seats" — animated counter stats
4. COMPETITIVE COMPARISON: Side-by-side table vs DATCrusher vs DAT Bootcamp
5. TESTIMONIALS: 3 student quotes with photos
6. PRICING: Free / Premium $29/mo / Premium Plus $149 one-time tiers
7. FAQ: 5 accordion questions
8. FOOTER: Links to all 10 Canadian dental schools

ANIMATIONS:
- Scroll-triggered fade-in for each section
- Hero text typewriter effect
- Stats counter animation
- Card hover lift effects

RESPONSIVE: Fully responsive, mobile-first, <3s load time target.

SEO: Meta title "PreDent Canada | #1 Platform for Canadian Dental School Admissions", meta description includes "DAT prep, PAT practice, dental school requirements, GPA calculator"

Generate as a single-page application with smooth scroll navigation.
```

**Expected Output:** Complete landing page with all sections, animations, and responsive design.

**Testing Checklist:**
- [ ] All 6 pillar cards render correctly
- [ ] CTAs scroll to correct sections
- [ ] Mobile menu works
- [ ] Stats counters animate
- [ ] Pricing table displays all 3 tiers
- [ ] FAQ accordion opens/closes

---

### Step 2: School Hub — Static Pages (10 School Pages + Comparison Tool)

**Prompt for Kimi Website Agent:**

```
Create the "School Hub" section for PreDent Canada — a multi-page experience covering all 10 Canadian dental schools.

PAGES TO GENERATE:

1. SCHOOL HUB INDEX (/schools):
   - Grid of 10 school cards with logo placeholder, name, province, program (DDS/DMD), seat count
   - Filter by province (Ontario, Quebec, BC, Alberta, Saskatchewan, Manitoba, Nova Scotia)
   - Search bar
   - "Compare Schools" button → links to comparison tool

2. INDIVIDUAL SCHOOL PAGES (generate 1 as template, I'll duplicate):
   Template: /school/[slug] — use University of Toronto as example
   - Hero: School name, province, program, seat count
   - Admission Snapshot card: Min GPA, GPA method, Avg admitted GPA, Min DAT, Avg DAT AA, Avg DAT PAT, CASPer required, Interview format, Degree required, Prerequisites, Application deadline, Application fee, Tuition domestic/international
   - 5-Year Trend charts (use Recharts-style visualizations): GPA trend line, DAT trend line
   - Acceptance Statistics: Applications/seat ratio, interview rate
   - "Am I Competitive?" calculator teaser (locked, shows "Upgrade to Premium")
   - Recent Acceptance Posts section (3 mock posts)
   - Related schools sidebar

3. SCHOOL COMPARISON TOOL (/compare):
   - Multi-select dropdown (choose 2-4 schools)
   - Side-by-side comparison table with all requirements
   - "Diff View" highlighting unique requirements per school
   - Export as PDF button (mock)

SCHOOL DATA (use this exact data for UofT page):
- Name: University of Toronto Faculty of Dentistry
- Program: DDS
- Province: Ontario
- Seats: 96
- Min GPA: 3.0
- GPA Method: Lowest year dropped (if 4+ years)
- Avg Admitted GPA: 3.96
- Min DAT: Not specified
- Avg DAT AA: 24
- Avg DAT PAT: 23
- CASPer: Required
- Interview: Panel (February)
- Degree Required: 3 full years
- Prerequisites: Biochemistry, Physiology, Life Sciences (4 sem), Humanities/Social Sciences (2 sem)
- Application Fee: $350 CAD
- Deadline: November 1
- Tuition Domestic: $51,200/yr

For the other 9 schools, create placeholder pages with the same structure but "Coming Soon" overlay.

DESIGN: Follow PreDent Canada design system (blue #2563EB primary, Inter font, 12px card radius, etc.)

NAVIGATION: Add to main nav as "School Hub" dropdown with "All Schools" and "Compare"

INTERACTIVE: Filter animations, comparison table sorting, hover effects on school cards.
```

**Expected Output:** 12 pages total (index + 10 school pages + comparison), all with consistent design.

**Testing Checklist:**
- [ ] All 10 schools appear in grid
- [ ] UofT page has all data fields
- [ ] Province filter works
- [ ] Comparison tool allows multi-select
- [ ] Diff View highlights differences
- [ ] Mobile responsive

---

### Step 3: SEO Content Pages — Guides & Calculators (Free Tools)

**Prompt for Kimi Website Agent:**

```
Create the "Free Tools" and "Guides" content pages for PreDent Canada to drive SEO traffic.

PAGES TO GENERATE:

1. GPA CALCULATOR (/tools/gpa-calculator):
   - Input: Current GPA (numeric), GPA Scale (4.0 / percentage), Target Schools (multi-select of 10 schools)
   - Output: "Competitive" / "Reach" / "Below Average" rating per school
   - Visual: Gauge chart showing where user stands vs school average
   - "How Canadian Dental Schools Calculate GPA" explainer section
   - School-specific formula notes (e.g., "UofT drops lowest year", "Western uses best 2 years")

2. DAT STUDY SCHEDULES (/guides/dat-study-schedules):
   - 4 schedule cards: 4-week, 8-week, 12-week, 16-week
   - Each card shows: Weekly hours, Biology/Chemistry/PAT/RC breakdown, milestones
   - "Generate My Schedule" button → form asking: test date, hours/week, comfort levels (weak/moderate/strong per subject)
   - Output: Personalized week-by-week plan with checkboxes

3. COMPLETE CANADIAN DAT GUIDE (/guides/canadian-dat-guide):
   - Long-form guide (3000+ words equivalent)
   - Sections: What is the DAT, Canadian vs American DAT differences, Section breakdowns (SNS 70Q/60min, PAT 90Q/60min, RC 50Q/60min), Registration process, Score scale (1-30), What's competitive (21+ AA, 20+ PAT), Study resources, Test day tips
   - Interactive: FAQ accordion, "Is the Canadian DAT for me?" decision tree

4. PAT STRATEGY GUIDES (5 pages):
   - /guides/pat-keyholes — strategy, common pitfalls, time-saving tips
   - /guides/pat-tfe — top-front-end guide
   - /guides/pat-angle-ranking — angle ranking methods
   - /guides/pat-hole-punching — fold sequence strategies
   - /guides/pat-cube-counting — tally table method
   - /guides/pat-pattern-folding — 3D form development
   Each guide: Theory, example walkthrough (3-5 questions with diagrams), strategy summary card, "Practice Now" CTA

5. CASPER GUIDE (/guides/casper-dental-school):
   - What is CASPer, which schools require it, preparation tips, practice scenarios

6. INTERVIEW PREP GUIDE (/guides/dental-school-interview):
   - MMI vs Panel formats, common questions, preparation timeline

DESIGN: Follow PreDent Canada design system. Use MDX-style content blocks with:
- Info boxes (blue left border for tips, orange for warnings)
- Code-style blocks for formulas (GPA calculations)
- Interactive checklists
- "Related Guides" sidebar navigation

SEO: Every page needs unique meta title/description targeting specific keywords (e.g., "What GPA for UBC Dentistry? | PreDent Canada", "PAT Keyhole Strategy Guide | PreDent Canada")

NAVIGATION: Add "Guides" and "Tools" to main nav with dropdowns.
```

**Expected Output:** 15+ content pages with interactive elements, calculators, and SEO optimization.

**Testing Checklist:**
- [ ] GPA calculator computes correctly for sample inputs
- [ ] Study schedule generator produces logical plans
- [ ] All guide pages have unique meta tags
- [ ] Internal navigation between guides works
- [ ] Mobile responsive

---

### Step 4: PAT Academy — Visual Interface (Static Preview)

**Prompt for Kimi Website Agent:**

```
Create the "PAT Academy" frontend interface for PreDent Canada — the flagship feature for Perceptual Ability Test preparation.

PAGES TO GENERATE:

1. PAT ACADEMY HOME (/pat-academy):
   - Hero: "Master the PAT" with animated 3D cube illustration
   - 6 category cards in grid:
     * Keyholes (Teal #14B8A6) — 847 questions, 78% avg
     * TFE (Indigo #6366F1) — 923 questions, 64% avg
     * Angle Ranking (Amber #F59E0B) — 756 questions, 82% avg
     * Hole Punching (Rose #F43F5E) — 891 questions, 71% avg
     * Cube Counting (Emerald #10B981) — 634 questions, 89% avg
     * Pattern Folding (Violet #8B5CF6) — 712 questions, 58% avg
   - Progress rings on each card (mock data)
   - "Generators [Premium]" banner card with lock icon
   - Recent performance chart (last 7 sessions)
   - "Start Full Mock Exam" button (locked for free users)

2. PRACTICE INTERFACE (/pat-academy/practice):
   - Setup panel: Mode (Quick Practice/Category Drill/Timed Set/Mixed Practice/Exam Mode), Difficulty, Questions count, Time limit toggle, 3D models toggle
   - Question viewer:
     * Left side: Question diagram (placeholder SVG for 3D object)
     * Right side: 4 answer options (A/B/C/D) as cards
     * Bottom: Timer (counting down), "Flag for Review", "Previous", "Next", "Submit"
   - For Pattern Folding: show 2D net diagram with fold animation placeholder
   - For Cube Counting: show stacked cubes with "Exploded View" toggle
   - Result overlay: Correct/Incorrect with time spent, target time, explanation preview (locked "View Full Explanation")

3. GENERATORS PAGE (/pat-academy/generators — Premium teaser):
   - "Unlimited PAT Generators" header
   - 6 generator cards showing "10M+ variations" etc. (from PRD)
   - "Upgrade to Premium" CTA with $29/mo pricing
   - Sample generated question (1 per category) with "Generate New" button disabled

4. VISUAL LESSONS (/pat-academy/lessons):
   - Lesson module cards: Theory, Example Walkthrough, Guided Practice, Independent Drill, Exam Simulation
   - Progress tracking per lesson
   - Video placeholder thumbnails with play buttons

5. PERFORMANCE DASHBOARD (/pat-academy/analytics):
   - Accuracy by Category: horizontal bar chart
   - Time Distribution: scatter plot with 40-second threshold line
   - Progress Trend: line graph (mock 10 sessions)
   - Weakness Heatmap: 6×4 color matrix (category × difficulty)
   - Percentile Ranking: gauge chart
   - Predicted PAT Score: big number "22" with ±2 confidence interval
   - Auto-generated recommendations card (mock)

DESIGN: Use category colors consistently. Dark mode optional for practice interface (reduces eye strain). Timer should pulse when under 10 seconds remaining.

INTERACTIVE: Smooth transitions between questions, keyboard shortcuts (1-4 for answers, arrow keys for navigation), progress bar at top.

MOCK DATA: Use realistic mock data for all charts and progress indicators.
```

**Expected Output:** Complete PAT Academy frontend with practice interface, generators teaser, lessons, and analytics dashboard.

**Testing Checklist:**
- [ ] All 6 categories accessible
- [ ] Practice timer counts down
- [ ] Answer selection works
- [ ] Mock charts render
- [ ] Keyboard shortcuts functional
- [ ] Mobile responsive


---

## 4. Phase 2: Dynamic Layer — Auth & Database (Steps 5–7)

> **Goal:** Add user accounts, SQLite database, and premium paywall. This is where we transition from static to full-stack.

---

### Step 5: Authentication & User System

**Prompt for Kimi Website Agent:**

```
Add full-stack authentication and user management to the PreDent Canada website.

TECH STACK:
- Next.js 14 App Router
- SQLite database (better-sqlite3)
- Lucia auth (session-based, no external service)
- TypeScript throughout
- Tailwind CSS + shadcn/ui components

FEATURES TO IMPLEMENT:

1. AUTHENTICATION SYSTEM:
   - Sign Up (/auth/register): Email, password, confirm password, province dropdown, year level (1-5+), target application year
   - Sign In (/auth/login): Email, password, "Remember me" checkbox
   - Password reset flow (/auth/forgot-password, /auth/reset-password)
   - Google OAuth sign-in option
   - Session management: HTTP-only cookies, 30-day expiry
   - Protected route middleware: redirect unauthenticated users to /auth/login

2. USER PROFILE (/dashboard/profile):
   - Editable: Name, province, current GPA, GPA scale (4.0/percentage), year level, target year, degree status, undergrad school
   - Profile completion progress bar
   - Avatar upload (placeholder if not implemented yet)

3. NAVIGATION UPDATES:
   - Replace "Get Started Free" with user menu when logged in (avatar + dropdown: Dashboard, Profile, Settings, Logout)
   - Dashboard link in main nav when authenticated

4. DATABASE SCHEMA (SQLite):
   Table: users (id UUID PRIMARY KEY, email UNIQUE, password_hash, tier DEFAULT 'free', status, email_verified, created_at, updated_at, premium_until)
   Table: profiles (user_id FK, first_name, last_name, province, current_gpa, gpa_scale, year_level, target_year, degree_status, undergrad_school)

5. FREE VS PREMIUM GATING:
   - Add "Premium" badge to locked features
   - Show upgrade modal when free user clicks premium feature
   - Tier stored in database, checked server-side

DESIGN: Use PreDent Canada design system. Auth pages should be clean, centered, with dental blue accents. Form validation with inline error messages.

SECURITY: Passwords hashed with bcrypt, rate limiting on auth endpoints (5 attempts per 15 min), CSRF protection.
```

**Expected Output:** Working auth system with register/login/profile pages, database schema, and route protection.

**Testing Checklist:**
- [ ] Create test account
- [ ] Verify login persists across page refresh
- [ ] Verify protected routes redirect unauthenticated users
- [ ] Password reset flow works
- [ ] Profile updates save to database
- [ ] Rate limiting triggers after 5 attempts

---

### Step 6: Premium Paywall & Stripe Integration

**Prompt for Kimi Website Agent:**

```
Add premium subscription management and Stripe payment integration to PreDent Canada.

TECH STACK:
- Next.js 14 App Router
- SQLite database
- Stripe Checkout + Stripe Customer Portal
- TypeScript, Tailwind, shadcn/ui

SUBSCRIPTION TIERS:

1. FREE ($0):
   - Full school database access
   - Basic GPA calculator
   - 500 PAT questions
   - 10 keyhole generators/day
   - Limited 3D models
   - 1 free mock exam
   - Basic error analysis
   - Basic application tracker (3 schools)
   - Read-only community content

2. PREMIUM ($29/month or $249/year):
   - Unlimited PAT question bank
   - All 6 PAT generators (unlimited)
   - Full 3D model access
   - Unlimited mock exams
   - Advanced AI error analysis
   - Personalized study schedule generator
   - Unlimited application tracker
   - Full interview question bank
   - Multi-school competitiveness calculator
   - AI tutor (basic)
   - Unlimited progress analytics
   - Anki export
   - Priority email support

3. PREMIUM PLUS ($149 one-time):
   - Everything in Premium
   - 1 personal statement review
   - 1-on-1 admissions strategy consultation
   - Advanced AI tutor
   - Application document review
   - Lifetime access (no recurring)

FEATURES TO IMPLEMENT:

1. PRICING PAGE (/pricing):
   - 3-tier comparison table (feature matrix from above)
   - Monthly/Annual toggle (show savings)
   - "Higher Score Guarantee" badge (money-back if DAT doesn't improve)
   - FAQ accordion about billing
   - CTA buttons: "Start Free", "Get Premium", "Get Premium Plus"

2. STRIPE CHECKOUT:
   - /api/stripe/checkout-session — creates Stripe Checkout session
   - /api/stripe/webhook — handles checkout.session.completed, invoice.paid, invoice.payment_failed
   - Success page: /payment/success?session_id=xxx
   - Cancel page: /payment/cancel

3. CUSTOMER PORTAL:
   - /api/stripe/portal-session — creates Stripe Customer Portal for managing subscription
   - "Manage Subscription" button in user menu

4. DATABASE UPDATES:
   - Add to users table: stripe_customer_id, stripe_subscription_id, tier, premium_until
   - Add subscriptions table: id, user_id, stripe_subscription_id, stripe_price_id, tier, status, current_period_start, current_period_end, created_at

5. PREMIUM GATING LOGIC:
   - Server-side check: isPremium(userId) helper function
   - Client-side: PremiumBadge component, UpgradeModal component
   - Feature access matrix: central config file mapping features to required tiers

6. HIGHER SCORE GUARANTEE:
   - Mock exam baseline storage
   - Refund eligibility check (compare baseline to actual DAT score input)
   - Refund request form

DESIGN: Pricing page should be visually compelling — use the accent orange (#F59E0B) for "Best Value" badge on Premium Annual. Feature comparison table with checkmarks and X marks.

TESTING: Use Stripe test mode (sk_test_...). Verify webhook handling, tier upgrades on payment, downgrade on cancellation.
```

**Expected Output:** Complete payment flow with Stripe integration, tier-based access control, and pricing page.

**Testing Checklist:**
- [ ] Test Stripe Checkout in test mode
- [ ] Verify webhook updates user tier
- [ ] Verify premium features unlock after payment
- [ ] Test subscription cancellation flow
- [ ] Verify Higher Score Guarantee form
- [ ] Test customer portal access

---

### Step 7: Application Planner & Task Management

**Prompt for Kimi Website Agent:**

```
Create the "Application Planner" feature for PreDent Canada — a comprehensive application tracking system.

TECH STACK:
- Next.js 14 App Router, SQLite, TypeScript, Tailwind, shadcn/ui
- Full CRUD API routes
- Calendar/date picker components

PAGES TO GENERATE:

1. APPLICATION PLANNER DASHBOARD (/dashboard/planner):
   - Timeline visualization: horizontal scrollable timeline from Year 1 to Decision Phase
   - Phase cards: Foundation (Year 1), Building (Year 2), DAT Prep (Summer), Application Year (Sept-Nov), Interview Season (Dec-Mar), Decision Phase (Mar-May)
   - Current phase highlighted based on user's year level and target year
   - Milestone markers with checkboxes

2. TASK MANAGER (/dashboard/planner/tasks):
   - Kanban board: Not Started → In Progress → Under Review → Complete
   - Task cards: Title, category (Academic/DAT/Experience/Application/Interview), due date with countdown, priority (Critical/High/Medium/Low), associated school, status
   - Add Task modal: Title, category, due date, priority, school association, notes, sub-tasks
   - Task status workflow with "Blocked" and "Needs Attention" states
   - Filter by: category, status, priority, school
   - Search tasks
   - Overdue tasks highlighted in red (#EF4444)

3. DOCUMENT VAULT (/dashboard/planner/docs):
   - Upload interface: drag-and-drop or click to upload
   - Document types: Transcripts, Reference Letters, Personal Statement, CV/Resume, DAT Score Report, CASPer Score, ID Documents
   - Document cards: filename, type, upload date, preview thumbnail, download button
   - Version history for Personal Statement and CV (show previous versions)
   - Organization: folders by document type

4. DEADLINE ALERTS (/dashboard/planner/alerts):
   - Alert list: Upcoming (30 days), Urgent (7 days), Same-Day, Overdue, School-Specific, DAT Registration
   - Alert cards: Title, trigger date, description, notification channels (email/in-app/push)
   - Mark as read/dismiss
   - Settings: choose which alerts to receive

5. CALENDAR VIEW (/dashboard/planner/calendar):
   - Monthly calendar with deadline dots
   - Click date to see tasks/deadlines
   - Sync with task due dates

DATABASE SCHEMA:
Table: tasks (id, user_id, title, category, due_date, status, priority, school_id, notes, created_at, updated_at)
Table: sub_tasks (id, task_id, title, status, created_at)
Table: documents (id, user_id, type, filename, url, uploaded_at, version)
Table: alerts (id, user_id, type, title, description, trigger_date, is_read, created_at)

DESIGN: Clean, organized, calming aesthetic. Use soft grays (#F8FAFC) for backgrounds. Priority colors: Critical (#EF4444), High (#F59E0B), Medium (#2563EB), Low (#10B981). Overdue items pulse gently.

INTERACTIVE: Drag-and-drop task status changes, smooth modal transitions, calendar day hover effects.
```

**Expected Output:** Full application planner with task management, document vault, and deadline alerts.

**Testing Checklist:**
- [ ] Create tasks and verify status changes
- [ ] Upload documents to vault
- [ ] Verify alerts trigger on deadline approach
- [ ] Test drag-and-drop task movement
- [ ] Check calendar sync with tasks
- [ ] Mobile responsive

---

## 5. Phase 3: Core Product — PAT & DAT Academy (Steps 8–10)

> **Goal:** Build the interactive PAT practice engine and DAT content modules. This is the core value proposition.

---

### Step 8: PAT Question Bank & Practice Engine

**Prompt for Kimi Website Agent:**

```
Build the interactive PAT (Perceptual Ability Test) practice engine for PreDent Canada.

TECH STACK:
- Next.js 14 App Router, SQLite, TypeScript, Tailwind
- Three.js for 3D model viewer (client-side)
- Canvas/SVG for 2D diagrams (Angle Ranking, Hole Punching)

DATABASE SCHEMA:
Table: pat_questions (
  id UUID PRIMARY KEY,
  category ENUM('KEYHOLE','TFE','ANGLE_RANKING','HOLE_PUNCH','CUBE_COUNT','PATTERN_FOLD'),
  difficulty ENUM('BEGINNER','INTERMEDIATE','ADVANCED','ELITE'),
  source ENUM('GENERATED','CURATED'),
  question_data JSONB, -- stores diagram URLs, options, correct answer
  correct_answer VARCHAR(10),
  explanation_l1 TEXT, -- quick answer
  explanation_l2 TEXT, -- step-by-step
  explanation_l3 TEXT, -- expert strategy
  concepts ARRAY,
  time_target INT,
  model_3d_id UUID,
  correct_rate DECIMAL,
  avg_time DECIMAL,
  times_used INT DEFAULT 0
)

Table: pat_attempts (
  id UUID PRIMARY KEY,
  user_id UUID,
  question_id UUID,
  session_id UUID,
  user_answer VARCHAR(10),
  is_correct BOOLEAN,
  time_spent INT,
  created_at TIMESTAMP
)

FEATURES:

1. QUESTION BANK BROWSER (/pat-academy/questions):
   - Filter sidebar: category (6 checkboxes), difficulty (4 levels), source, concepts
   - Question cards: preview diagram, category badge (color-coded), difficulty badge, stats (correct rate, avg time)
   - "Practice Selected" button
   - Pagination (20 per page)

2. PRACTICE SESSION ENGINE (/pat-academy/practice/session):
   - Session setup: select categories, difficulties, question count, mode (Quick/Category Drill/Timed Set/Mixed/Exam/Adaptive)
   - Question viewer:
     * Top bar: Question X/Y, category badge, timer, pause button
     * Main area: Question diagram (Canvas/SVG or Three.js 3D viewer)
     * For Keyholes: 3D object + 4 aperture options
     * For TFE: 2 given views + 4 missing view options
     * For Angle Ranking: 4 angles with drag-to-rank interaction
     * For Hole Punching: fold diagram with punch marks, answer grid
     * For Cube Counting: 3D stack with "Exploded View" toggle, tally table
     * For Pattern Folding: 2D net with "Fold Animation" button, 4 3D options
     * Answer options: A/B/C/D cards with hover effects
     * Bottom: "Flag for Review", "Previous", "Next", "Submit Answer"
   - Keyboard shortcuts: 1-4 (select answer), Arrow keys (navigate), Space (flag), Enter (submit)
   - Session timer: global countdown for timed modes

3. POST-SESSION RESULTS (/pat-academy/practice/results):
   - Score summary: X/YY correct (ZZ%), time spent, avg time per question
   - Category breakdown: accuracy per category (bar chart)
   - Time analysis: scatter plot (time vs accuracy)
   - Review incorrect answers: click to see question + explanation
   - "Save to Error Log" button

4. EXPLANATION SYSTEM:
   - Level 1: One-sentence correct answer (always visible)
   - Level 2: Step-by-step solution with annotated diagrams (Premium)
   - Level 3: Expert strategy + related questions (Premium)
   - Toggle between levels

5. 3D VIEWER INTEGRATION:
   - Three.js scene for Keyholes, TFE, Cube Counting, Pattern Folding
   - Controls: rotate (mouse drag), zoom (scroll), preset views (front/top/side/isometric)
   - Exploded view for cube counting
   - Fold animation for pattern folding (simple CSS/JS animation, not true physics)

MOCK DATA: Seed 50 questions per category (300 total) with realistic diagrams (use placeholder geometric shapes that look like PAT questions).

DESIGN: Dark mode for practice interface (#0F172A background, #FFFFFF text). Category colors from design system. Timer turns red under 10 seconds. Smooth transitions between questions.
```

**Expected Output:** Working PAT practice engine with question bank, practice session, and results review.

**Testing Checklist:**
- [ ] Start practice session
- [ ] Answer questions and verify timer
- [ ] Check results page accuracy calculation
- [ ] Test 3D viewer rotation
- [ ] Verify keyboard shortcuts
- [ ] Test explanation levels
- [ ] Mobile responsive

---

### Step 9: PAT Generators (Procedural Question Generation)

**Prompt for Kimi Website Agent:**

```
Create the PAT Generators for PreDent Canada — procedural algorithms that generate unlimited practice questions.

TECH STACK:
- Next.js 14 API routes for generation
- Canvas API or SVG for 2D rendering (server-side or client-side)
- Three.js for 3D preview (client-side)
- SQLite for storing generated questions

GENERATOR ARCHITECTURE (3-stage pipeline):
1. Parameter Selection: difficulty-based constraints
2. Geometry Generation: procedural algorithms
3. Validation & Rendering: ensure exactly one correct answer

GENERATE ALL 6 CATEGORIES:

1. KEYHOLE GENERATOR:
   - Procedural 3D objects: vary face count (4-12), curve complexity (0-3 curves), proportion range
   - Generate 4 aperture options: 1 correct, 3 plausible distractors
   - Validation: object fits exactly one aperture
   - Rendering: SVG/Canvas 2D projection + Three.js 3D preview

2. TFE GENERATOR:
   - Orthographic projection puzzles
   - Parameters: missing view type (top/front/end), edge complexity, hidden lines
   - Generate 2 given views + 4 missing view options
   - Validation: geometric consistency

3. ANGLE RANKING GENERATOR:
   - Parametric angles: 4 angles with controlled separation
   - Parameters: angle separation (easy: >15°, hard: <5°), orientation variation
   - Rendering: 4 angle diagrams with clear labels
   - Validation: unambiguous ranking

4. HOLE PUNCHING GENERATOR:
   - Fold sequence: 1-4 folds, paper shape (square/rectangle/triangle)
   - Punch location: random within folded area
   - Answer grid: 4×4 or 5×5 showing hole pattern
   - Validation: deterministic unfold result

5. CUBE COUNTING GENERATOR:
   - Stacked cube configurations: 3-5 layers, 5-15 cubes
   - Paint pattern: random faces painted
   - Questions: "How many cubes have X painted faces?" for X=0-5
   - Validation: computable from configuration
   - Rendering: isometric 3D view with exploded view toggle

6. PATTERN FOLDING GENERATOR:
   - 2D nets: standard cube/net variations with symbol placement
   - 4 3D form options: 1 correct, 3 with impossible folds or wrong symbol orientation
   - Validation: net folds to exactly one valid 3D shape
   - Fold animation: CSS keyframe animation showing 2D→3D

GENERATOR UI (/pat-academy/generators):
   - Settings panel per category: difficulty, object complexity, number of questions
   - "Generate New Set" button
   - Generated question viewer (same as practice interface)
   - "Add to Practice Bank" button
   - Generator stats: questions generated today, total variations

PREMIUM GATING:
   - Free: 10 keyhole generators/day only
   - Premium: unlimited all categories

PERFORMANCE:
   - Generation should complete in <2 seconds
   - Cache generated questions in SQLite for reuse
   - Pre-generate 1000 questions per category at build time
```

**Expected Output:** Working generators for all 6 PAT categories with procedural generation algorithms.

**Testing Checklist:**
- [ ] Generate questions for each category
- [ ] Verify exactly one correct answer per question
- [ ] Check rendering quality
- [ ] Test generation speed (<2 seconds)
- [ ] Verify premium gating
- [ ] Mobile responsive

---

### Step 10: DAT Academy — Biology, Chemistry, RC Modules

**Prompt for Kimi Website Agent:**

```
Create the "DAT Academy" content modules for PreDent Canada — Biology, Chemistry, and Reading Comprehension.

TECH STACK:
- Next.js 14, SQLite, TypeScript, Tailwind
- MDX/structured content for lessons
- Flashcard components with flip animation
- Video player component (YouTube embed or self-hosted)

PAGES TO GENERATE:

1. DAT ACADEMY HOME (/dat-academy):
   - Progress overview: Biology X%, Chemistry Y%, PAT Z%, RC W%
   - 3 module cards: Biology, Chemistry, Reading Comprehension
   - Study schedule widget: "Your next session: Biology - Cell Structure (15 min)"
   - Recent activity feed

2. BIOLOGY MODULE (/dat-academy/biology):
   - 7 unit sidebar navigation:
     * Cell Biology (4-6 DAT questions, 4-6 study hours)
     * Molecular Biology (6-8 questions, 6-8 hours)
     * Evolution & Ecology (4-6 questions, 4-5 hours)
     * Physiology (8-10 questions, 8-10 hours)
     * Microbiology (4-6 questions, 4-6 hours)
     * Plant Biology (3-5 questions, 3-4 hours)
     * Anatomy (6-8 questions, 6-8 hours)
   - Unit page structure:
     * Illustrated study notes (scrollable, with custom diagrams)
     * Video lesson player (placeholder)
     * Practice questions (20-50 per topic, multiple choice with explanations)
     * Flashcards (flip animation, spaced repetition tracking)
     * Cheat sheet (condensed 1-page summary, printable)
   - Progress tracking per unit: checkbox completion, quiz scores

3. CHEMISTRY MODULE (/dat-academy/chemistry):
   - 9 units: Atomic Structure, Bonding, Stoichiometry, Gases, Solutions, Equilibrium, Thermodynamics, Electrochemistry, Kinetics
   - Same structure as Biology
   - IMPORTANT: Prominent banner "Canadian DAT does NOT include Organic Chemistry" — warn against US-focused resources

4. READING COMPREHENSION MODULE (/dat-academy/reading-comprehension):
   - Strategy lessons: Skim-Scan-Deep Read, Keyword Mapping, Question-First Method, Elimination Technique
   - 20+ practice passages (1,200-1,500 words each, scientific topics)
   - Passage viewer: left side passage, right side questions
   - Timing trainer: 1.2 min/question target, global 60-min countdown
   - Highlighting tool: select text in passage to highlight

5. STUDY SCHEDULE GENERATOR (/dat-academy/schedule):
   - Form: DAT test date, hours/week (5-10, 10-20, 20-30, 30-40), comfort levels (Weak/Moderate/Strong per subject)
   - Output: Week-by-week calendar view
   - Each week shows: Biology hours, Chemistry hours, PAT hours, RC hours, total hours
   - Click week to see specific tasks: "Watch Cell Biology video", "Complete 20 practice questions", "Review flashcards"
   - Export to calendar (ICS file) or print

6. FLASHCARD SYSTEM (/dat-academy/flashcards):
   - Deck browser: by subject, by topic
   - Flashcard viewer: front (term/question), back (definition/answer) — flip animation
   - Spaced repetition: "Again", "Hard", "Good", "Easy" buttons (Anki-style)
   - Progress: cards due today, new cards, review cards
   - Anki export: generate .apkg file for download

DATABASE SCHEMA:
Table: lessons (id, category, unit, title, content, order, tier)
Table: flashcards (id, category, front, back, unit, difficulty)
Table: lesson_progress (user_id, lesson_id, completed, score, time_spent)
Table: flashcard_progress (user_id, flashcard_id, interval, ease_factor, due_date)

MOCK CONTENT: Create realistic biology/chemistry content for first 2 units each. Use scientifically accurate but concise explanations. Include diagrams described in text (render as SVG or placeholder images).

DESIGN: Clean, academic aesthetic. Content area max-width 800px for readability. Flashcards use large, centered text. Video lessons have transcript below.
```

**Expected Output:** Complete DAT Academy with Biology, Chemistry, RC modules, study schedule, and flashcards.

**Testing Checklist:**
- [ ] Verify lesson navigation
- [ ] Flashcard flip animation works
- [ ] Study schedule generates logical plans
- [ ] Practice questions show explanations
- [ ] Spaced repetition tracking works
- [ ] Mobile responsive


---

## 6. Phase 4: Intelligence & Analytics (Steps 11–13)

> **Goal:** Add AI-powered explanations, acceptance analytics, and community features.

---

### Step 11: AI Explanation Engine & Performance Analytics

**Prompt for Kimi Website Agent:**

```
Build the AI Explanation Engine and Performance Analytics dashboard for PreDent Canada.

TECH STACK:
- Next.js 14, SQLite, TypeScript, Tailwind
- OpenAI/Anthropic API integration (or mock AI responses for MVP)
- Recharts for data visualization

FEATURES:

1. AI EXPLANATION ENGINE:
   - Integrated into PAT practice results
   - Three-tier system:
     * Level 1 (Free): One-sentence correct answer — "Answer B is correct because the object's deepest concave groove matches only aperture B's corresponding ridge."
     * Level 2 (Premium): Step-by-step solution with annotated diagrams — numbered steps with visual markers on the question diagram
     * Level 3 (Premium Plus): Expert strategy — pattern recognition cues, distractor analysis, timing optimization, related question links
   - "Ask AI" follow-up: text input to ask custom questions about the question
   - AI response streaming (typewriter effect)

2. PERFORMANCE DASHBOARD (/dashboard/analytics):
   - Overview cards:
     * Overall Accuracy: 78% (↑ 12% from last month)
     * Average Time: 38 sec/question (target: 40 sec) ✓
     * Predicted PAT Score: 22 (confidence: ±2)
     * Study Streak: 12 days 🔥
   - Charts:
     * Accuracy by Category: horizontal bar chart with benchmark comparison (your score vs average)
     * Time Distribution: scatter plot (time vs accuracy) with 40-second threshold line
     * Progress Trend: line graph (last 10 sessions) with moving average
     * Weakness Heatmap: 6×4 matrix (category × difficulty) — color intensity = error rate
     * Percentile Ranking: gauge chart showing where user ranks vs all users
   - Auto-Generated Recommendations:
     * Strengths list (green badges)
     * Priority Improvement Areas (orange badges with specific actions)
     * Personalized 7-Day Study Plan (day-by-day schedule)

3. ERROR LOG (/dashboard/error-log):
   - List of all incorrect answers with: question preview, your answer, correct answer, time spent, date
   - Filter by: category, difficulty, date range
   - "Practice Error Questions" button (spaced repetition)
   - Notes field per error (user can add personal notes)

4. LEADERBOARD (/dashboard/leaderboard):
   - Anonymous rankings by: PAT score prediction, study streak, questions attempted
   - Time filters: This Week, This Month, All Time
   - User's rank highlighted

5. EXPORT FEATURES:
   - Export analytics as PDF report
   - Export study plan to calendar
   - Export error log to CSV

DATABASE: Add analytics aggregation queries (SQLite views or computed columns):
   - user_category_accuracy (user_id, category, accuracy, avg_time)
   - user_progress_trend (user_id, session_date, accuracy, avg_time)
   - user_predicted_score (user_id, predicted_pat, confidence)

MOCK AI: For MVP, use template-based responses rather than true AI. Example templates:
   - "Your weakness in [CATEGORY] suggests focusing on [CONCEPT]. Try [STRATEGY]."
   - Generate from performance data patterns.

DESIGN: Dashboard uses card-based layout. Charts are interactive (hover for tooltips). Recommendations use info cards with action buttons. Color coding: green (strengths), orange (improvements), red (critical).
```

**Expected Output:** AI explanation system, comprehensive analytics dashboard, error log, and leaderboard.

**Testing Checklist:**
- [ ] Answer questions incorrectly, verify error log populates
- [ ] Check analytics calculations
- [ ] Test chart interactivity
- [ ] Verify AI explanation templates populate correctly
- [ ] Test export features
- [ ] Mobile responsive

---

### Step 12: Acceptance Probability Engine & School Calculator

**Prompt for Kimi Website Agent:**

```
Build the "Acceptance Probability Engine" and enhanced school competitiveness calculator for PreDent Canada.

TECH STACK:
- Next.js 14, SQLite, TypeScript, Tailwind
- Recharts for visualization

ALGORITHM (simplified for MVP):
- Weighted scoring model:
  * GPA: 25%
  * DAT AA: 20%
  * DAT PAT: 15%
  * DAT RC: 10%
  * Province (IP vs OOP): 15%
  * Degree Completion: 5%
  * CASPer Quartile: 5%
  * Extracurricular Score: 5%
- Convert each input to 0-100 score based on school-specific benchmarks
- Weighted average = probability estimate
- Competitiveness rating: >70% = Safety, 40-70% = Competitive, <40% = Reach

PAGES TO GENERATE:

1. COMPETITIVENESS CALCULATOR (/tools/competitiveness):
   - Input form:
     * GPA: numeric input + scale selector (4.0 / percentage)
     * DAT AA: 1-30 slider
     * DAT PAT: 1-30 slider
     * DAT RC: 1-30 slider
     * Province of Residence: dropdown (Ontario, BC, Alberta, etc.)
     * Degree Status: In-progress / Completed
     * CASPer Taken: Yes/No/Planned + quartile if yes
     * Extracurricular Score: self-assessed 1-10 rubric
   - "Calculate My Chances" button
   - Results (Free preview): Overall rating + 1 school
   - Full Results (Premium): All 10 schools with detailed breakdown

2. RESULTS VIEW (/tools/competitiveness/results):
   - School cards for each of 10 schools:
     * School name + logo
     * Probability: 0-100% with progress bar
     * Rating badge: Reach (red) / Competitive (orange) / Safety (green)
     * Competitiveness breakdown per stat:
       - GPA: Your 3.82 → School avg 3.96 ⚠ Below Average
       - DAT AA: Your 22 → School avg 24 ⚠ Below Average
       - DAT PAT: Your 21 → School avg 23 ⚠ Below Average
       - IP Advantage: Ontario resident ✓ Significant Boost
     * Improvement suggestions: "Raise PAT to 23+ (Priority: Pattern Folding)"
     * Estimated study time: "40-60 hours"
   - Comparison table: all schools side-by-side
   - "Create Study Plan" button (links to DAT Academy schedule)

3. ACCEPTANCE STATISTICS PAGES (per school):
   - Interactive charts:
     * Admitted GPA range and average (5-year trend line)
     * Admitted DAT scores by section (5-year trend)
     * Interview-to-offer ratio (pie chart)
     * In-province vs out-of-province acceptance rates (bar chart)
     * Waitlist movement statistics (line chart)
   - Data tables with year-over-year numbers
   - "Submit Your Stats" button (crowdsourced data collection)

4. CROWDSOURCED STATISTICS (/community/stats):
   - Anonymous submission form: GPA, DAT scores, school applied, IP/OOP, interview received, offer received, cycle year
   - Aggregated display:
     * Average GPA by school (with range)
     * Average DAT by school
     * Acceptance rate by school
     * IP vs OOP acceptance rates
     * Year-over-year trends
   - Filter by: cycle year, school, IP/OOP status

DATABASE SCHEMA:
Table: school_stats (school_id, year, avg_gpa, avg_dat_aa, avg_dat_pat, avg_dat_rc, interview_rate, offer_rate, ip_acceptance_rate, oop_acceptance_rate)
Table: user_stats (id, gpa, dat_aa, dat_pat, dat_rc, province, school, ip_status, interview_received, offer_received, cycle_year, submitted_at)

DESIGN: Calculator uses clean form layout with inline validation. Results use card-based layout with color-coded ratings. Charts are interactive with hover tooltips. "Probability" uses circular progress indicator.

MOCK DATA: Seed realistic historical data for all 10 schools (2020-2025 trends).
```

**Expected Output:** Working probability calculator with school-specific results, statistics pages, and crowdsourced data.

**Testing Checklist:**
- [ ] Input sample stats, verify probability calculations
- [ ] Check chart rendering
- [ ] Test school comparison table
- [ ] Verify crowdsourced submission form
- [ ] Test premium gating on full results
- [ ] Mobile responsive

---

### Step 13: Community Intelligence & Interview Prep

**Prompt for Kimi Website Agent:**

```
Create the "Community Intelligence" and "Interview Preparation" modules for PreDent Canada.

TECH STACK:
- Next.js 14, SQLite, TypeScript, Tailwind
- Markdown rendering for community posts
- Audio player for mock interview recordings (optional MVP)

PAGES TO GENERATE:

1. COMMUNITY HUB (/community):
   - News feed: Admission requirement changes, DAT changes, deadline updates, tuition changes, seat changes
   - Reddit Intelligence section:
     * Aggregated posts: "Acceptance Posts", "DAT Breakdowns", "Interview Experiences", "Rejection/WL Posts", "Study Schedules"
     * Each post card: title, source (r/predental), snippet, stats extracted, date
     * "Read Full Post" → external link
   - Structured pages:
     * "Best DAT Study Schedules (Aggregated from 50+ Successful Applicants)"
     * "Highest PAT Scorers: How They Did It"
     * "Canadian DAT Breakdown Database (2020-2025)"
     * "Interview Experience Database by School"
   - Crowdsourced stats submission form (same as Step 12)

2. INTERVIEW PREP MODULE (/interview-prep):
   - Format selector: MMI or Panel
   - MMI Station Types:
     * Ethical Scenario
     * Communication
     * Problem Solving
     * Collaboration
     * Self-Reflection
     * Critical Thinking
   - Panel Question Categories:
     * Motivation for Dentistry (95% frequency)
     * Knowledge of Profession (80%)
     * Personal Strengths/Weaknesses (75%)
     * Ethical Scenarios (70%)
     * School-Specific (60%)
     * Current Events (50%)
   - Question bank: 200+ questions organized by type/category
   - Question card: question text, category badge, frequency indicator, model answer (Premium), "Practice This Question" button
   - Practice interface:
     * Question displayed
     * Timer: 5 minutes for MMI, open-ended for Panel
     * "Start Recording" button (mock — just timer)
     * "Show Model Answer" (Premium)
     * Self-assessment rubric: 1-5 scoring on clarity, relevance, structure, empathy
   - School-specific interview guides: UofT (Panel), Western (Panel), McGill (MMI), UBC (MMI+SGI), etc.
   - Mock interview simulator: random 8 MMI stations or 30-min panel with timer

3. ADMISSION NEWS FEED (/community/news):
   - Filter by: news type, school, date range
   - News cards: title, type badge, school, summary, source link, date
   - "Subscribe to Alerts" → email notification settings

4. USER CONTRIBUTIONS (/community/contribute):
   - Submit DAT breakdown form
   - Submit interview experience form
   - Submit acceptance post form
   - Moderation queue indicator (submitted, under review, published)

DATABASE SCHEMA:
Table: interview_questions (id, school_id, category, question_text, model_answer, frequency, format)
Table: news (id, type, school_id, title, content, source_url, published_date)
Table: reddit_posts (id, post_type, school_id, source_url, content, stats, cycle_year, scraped_at)
Table: user_contributions (id, user_id, type, content, status, created_at)

DESIGN: Community hub uses card-based feed layout. Interview prep uses clean, focused interface (minimal distractions for practice). Question cards use frequency indicators (small bar charts). News feed uses chronological timeline.

MOCK DATA: 50 interview questions per format, 20 news items, 30 Reddit posts.
```

**Expected Output:** Community hub with news, Reddit intelligence, interview question bank, and practice simulator.

**Testing Checklist:**
- [ ] Browse interview questions by category
- [ ] Practice with timer
- [ ] Submit contribution form
- [ ] Verify news feed filters
- [ ] Test school-specific interview guides
- [ ] Mobile responsive

---

## 7. Phase 5: Polish & Launch (Steps 14–16)

> **Goal:** Mobile app, SEO optimization, final testing, and deployment.

---

### Step 14: Mobile Responsive & PWA

**Prompt for Kimi Website Agent:**

```
Optimize PreDent Canada for mobile devices and Progressive Web App (PWA) capabilities.

TECH STACK:
- Next.js 14 PWA support
- Service worker for offline caching
- Mobile-optimized UI components

TASKS:

1. MOBILE OPTIMIZATION:
   - All pages responsive: test on 320px, 375px, 414px, 768px breakpoints
   - PAT practice interface: touch-friendly answer cards (larger tap targets), swipe navigation between questions
   - Bottom navigation bar for mobile (Dashboard, PAT, DAT, Schools, Community)
   - Hamburger menu → slide-out drawer
   - Touch-optimized filters and sliders
   - Mobile-specific study schedule view (vertical timeline)

2. PWA FEATURES:
   - manifest.json: name "PreDent Canada", icons, theme color #2563EB
   - Service worker: cache static assets, school pages, guide content
   - Offline mode: show cached content when offline, "You're offline" banner
   - Add to Home Screen prompt
   - Push notifications: deadline alerts (using web push API)

3. PERFORMANCE:
   - Lazy load images and 3D models
   - Code splitting per route
   - Optimize bundle size: <200KB initial JS
   - Image optimization: WebP format, responsive sizes
   - Core Web Vitals: LCP <2.5s, FID <100ms, CLS <0.1

4. MOBILE-SPECIFIC FEATURES:
   - PAT practice: haptic feedback on answer selection (if supported)
   - Flashcards: swipe left/right for difficulty rating (Anki-style)
   - Document vault: camera upload for quick document capture
   - Push notifications for deadline reminders

5. TESTING:
   - Chrome DevTools mobile emulation
   - Real device testing checklist (iOS Safari, Android Chrome)
   - Touch interaction verification
   - Offline functionality test

DESIGN: Mobile uses bottom sheet modals instead of center modals. PAT practice goes full-screen on mobile. Navigation is thumb-friendly.
```

**Expected Output:** Fully responsive site with PWA capabilities, offline support, and mobile-optimized interactions.

**Testing Checklist:**
- [ ] Test on actual mobile devices
- [ ] Verify PWA install prompt
- [ ] Test offline mode
- [ ] Verify touch interactions
- [ ] Check Core Web Vitals scores
- [ ] Test push notifications

---

### Step 15: SEO, Analytics & Final Polish

**Prompt for Kimi Website Agent:**

```
Implement comprehensive SEO, analytics, and final polish for PreDent Canada.

SEO IMPLEMENTATION:

1. TECHNICAL SEO:
   - XML sitemap: auto-generated, includes all static pages, school pages, guides
   - robots.txt: allow all, reference sitemap
   - Canonical URLs: prevent duplicate content
   - Schema markup:
     * Organization schema (PreDent Canada)
     * FAQ schema on all guide pages
     * HowTo schema on calculator pages
     * Article schema on blog posts
     * Course schema on DAT Academy lessons
   - Meta tags: dynamic title/description for every page
   - Open Graph tags: image, title, description for social sharing
   - Twitter Cards: summary_large_image

2. CONTENT SEO:
   - 500+ content pages (from PRD Section 13):
     * 10 school pages
     * 20+ guide pages
     * 400+ blog posts (target long-tail keywords)
   - Internal linking: related guides, related schools, breadcrumb navigation
   - URL structure: /school/uoft-dentistry, /guides/pat-keyholes, /blog/what-gpa-for-dental-school
   - Breadcrumbs: Home > School Hub > University of Toronto

3. PERFORMANCE:
   - Page speed: <3s load time, <1s for static pages
   - Core Web Vitals monitoring
   - Image optimization: WebP, lazy loading, responsive images
   - Font optimization: subset Inter font, font-display: swap

ANALYTICS:

1. WEB ANALYTICS:
   - Plausible or PostHog integration (privacy-friendly)
   - Track: page views, user journeys, conversion funnels
   - Event tracking: sign_up, upgrade_premium, start_practice, complete_mock_exam, use_calculator
   - Funnel analysis: landing → sign up → free tool use → upgrade

2. PRODUCT ANALYTICS:
   - PAT practice metrics: questions attempted, accuracy by category, time per question
   - DAT Academy metrics: lessons completed, videos watched, flashcards reviewed
   - Conversion metrics: free→premium rate, upgrade page visits, pricing page interactions
   - Retention: D1, D7, D30 retention cohorts

FINAL POLISH:

1. ACCESSIBILITY:
   - WCAG 2.1 AA compliance
   - Keyboard navigation throughout
   - Screen reader support (ARIA labels)
   - Color contrast ratios >4.5:1
   - Focus indicators visible

2. ERROR HANDLING:
   - 404 page: helpful links, search bar
   - 500 page: error report form, retry button
   - Form validation: inline, clear error messages
   - Loading states: skeleton screens, spinners

3. ONBOARDING:
   - First-time user tutorial: tooltips highlighting key features
   - Progress checklist: "Complete your profile", "Try a PAT question", "Explore schools", "Calculate your chances"
   - Email welcome sequence: day 0 (welcome), day 3 (explore PAT), day 7 (school research tips)

4. LOCALIZATION PREP:
   - French language support structure (for Quebec schools)
   - i18n framework setup (next-intl)
   - Content translation placeholders
```

**Expected Output:** SEO-optimized, analytics-instrumented, accessible, polished production site.

**Testing Checklist:**
- [ ] Run Lighthouse audit (target 90+ all categories)
- [ ] Verify schema markup with Google's Rich Results Test
- [ ] Test keyboard navigation
- [ ] Check color contrast ratios
- [ ] Verify analytics events fire correctly
- [ ] Test 404 and 500 error pages
- [ ] Mobile responsive

---

### Step 16: Deployment & DevOps

**Prompt for Kimi Website Agent:**

```
Set up production deployment and DevOps for PreDent Canada.

DEPLOYMENT ARCHITECTURE:

1. HOSTING:
   - Hetzner CX11 VPS (2 vCPU, 4GB RAM, 40GB SSD) or Railway
   - Ubuntu 22.04 LTS
   - Node.js 20 LTS
   - PM2 process manager

2. SERVER SETUP:
   - Nginx reverse proxy:
     * Static files: /_next/, /images/, /assets/ (cached 1 year)
     * API routes: /api/* → proxy to Node.js (port 3000)
     * Everything else: Next.js SSR/SSG
     * SSL: Let's Encrypt auto-renewal
     * Gzip compression
     * Rate limiting: 100 req/min per IP
   - Firewall: UFW, allow 22, 80, 443 only
   - Fail2ban for brute force protection

3. DATABASE:
   - SQLite file: /var/lib/predent/predent.db
   - WAL mode enabled (PRAGMA journal_mode = WAL)
   - Daily backups: /var/backups/predent/predent.db.YYYY-MM-DD.backup
   - Backup retention: 30 days
   - Restore script: automated

4. DEPLOYMENT WORKFLOW:
   - GitHub repository: predentcanada/predent
   - GitHub Actions:
     * On push to main: run tests, build, deploy to VPS
     * SSH into VPS: git pull, npm install, npm run build, pm2 restart
   - Zero-downtime deployment: PM2 cluster mode or reload
   - Rollback: git revert + redeploy

5. ENVIRONMENT CONFIG:
   - .env.production:
     * DATABASE_URL=file:/var/lib/predent/predent.db
     * STRIPE_SECRET_KEY=sk_live_...
     * STRIPE_WEBHOOK_SECRET=whsec_...
     * NEXTAUTH_SECRET=...
     * OPENAI_API_KEY=... (for AI explanations)
   - Environment validation on startup

6. MONITORING:
   - PM2 monitoring: CPU, memory, uptime
   - Log rotation: /var/log/predent/
   - Health check endpoint: /api/health (returns DB connection status, uptime)
   - Uptime monitoring: UptimeRobot or Pingdom
   - Error tracking: Sentry integration

7. SSL & SECURITY:
   - Let's Encrypt SSL certificate
   - HTTPS redirect (HSTS header)
   - Security headers: X-Frame-Options, X-Content-Type-Options, CSP
   - CORS: configured for API routes
   - Input sanitization: all user inputs sanitized

8. SCALING PREP:
   - Database migration script: SQLite → PostgreSQL (when needed)
   - CDN: Cloudflare (free tier) for static assets
   - File storage: local → Cloudflare R2 (when needed)

DEPLOYMENT CHECKLIST:
- [ ] VPS provisioned and hardened
- [ ] Nginx configured and SSL installed
- [ ] Node.js and PM2 installed
- [ ] Database initialized with schema + seed data
- [ ] Environment variables configured
- [ ] GitHub Actions workflow created
- [ ] Domain DNS pointed to VPS
- [ ] Stripe webhooks configured for production
- [ ] Email service (Resend) configured
- [ ] Backup script scheduled (cron daily)
- [ ] Health check verified
- [ ] Load testing: 100 concurrent users

ESTIMATED COSTS:
- VPS: $5/mo (Hetzner CX11)
- Domain: $12/yr
- CDN: $0 (Cloudflare free)
- Email: $0 (Resend free tier: 3,000/day)
- Analytics: $0 (Plausible self-hosted) or $20/mo
- Total: ~$5-25/mo
```

**Expected Output:** Production-ready deployment with automated CI/CD, monitoring, backups, and security.

**Testing Checklist:**
- [ ] Deploy to staging environment
- [ ] Run load tests (100 concurrent users)
- [ ] Verify SSL certificate
- [ ] Test backup/restore process
- [ ] Verify health check endpoint
- [ ] Test GitHub Actions deployment flow
- [ ] Verify Stripe webhooks in production

---

## 8. Summary: 16-Step Roadmap

| Step | Phase | Feature | Complexity | Est. Time | Deliverable |
|---|---|---|---|---|---|
| 1 | Foundation | Design System & Landing Page | Medium | 1 day | Beautiful landing page with 6 pillars, animations, pricing |
| 2 | Foundation | School Hub (10 pages + comparison) | Medium | 1 day | Complete school database with UofT template + comparison tool |
| 3 | Foundation | SEO Content Pages (15+ guides/tools) | Medium | 1 day | GPA calculator, study schedules, DAT guides, PAT strategy guides |
| 4 | Foundation | PAT Academy Frontend (static preview) | High | 1-2 days | Practice interface, generators teaser, lessons, analytics dashboard |
| 5 | Dynamic | Authentication & User System | Medium | 1 day | Register/login/profile, SQLite schema, route protection |
| 6 | Dynamic | Premium Paywall & Stripe | High | 1-2 days | 3-tier pricing, checkout, webhooks, customer portal |
| 7 | Dynamic | Application Planner | High | 1-2 days | Task manager, document vault, deadline alerts, calendar |
| 8 | Core | PAT Question Bank & Practice | High | 2-3 days | 300+ questions, practice engine, results, 3D viewer |
| 9 | Core | PAT Generators (6 categories) | Very High | 2-3 days | Procedural generation for all 6 PAT types |
| 10 | Core | DAT Academy (Bio/Chem/RC) | High | 2-3 days | Biology, Chemistry, RC modules, flashcards, study schedule |
| 11 | Intelligence | AI Explanations & Analytics | High | 1-2 days | 3-tier explanations, performance dashboard, error log, leaderboard |
| 12 | Intelligence | Probability Engine & Calculator | Medium | 1-2 days | School competitiveness calculator, statistics, crowdsourced data |
| 13 | Intelligence | Community & Interview Prep | Medium | 1-2 days | News feed, Reddit intelligence, 200+ interview questions, practice simulator |
| 14 | Polish | Mobile & PWA | Medium | 1 day | Responsive optimization, offline mode, push notifications |
| 15 | Polish | SEO, Analytics, Accessibility | Medium | 1 day | Schema markup, Core Web Vitals, WCAG 2.1 AA, onboarding |
| 16 | Launch | Deployment & DevOps | Medium | 1 day | VPS setup, CI/CD, monitoring, backups, SSL |

**Total Estimated Development Time:** 16–24 days of focused AI-assisted development  
**Monthly Operating Cost:** $5–25 (VPS + domain + optional services)  
**User Capacity:** 50,000+ registered users on single SQLite instance

---

## 9. Key Prompting Tips for Kimi Website Agent

### 9.1 General Principles

1. **Be specific about design system** — always include hex codes, font names, and spacing values from the PRD
2. **Provide exact data** — copy school statistics, question counts, and pricing directly from the PRD
3. **Define the tech stack upfront** — Next.js 14 + SQLite + TypeScript + Tailwind + shadcn/ui
4. **Use wireframe descriptions** — the PRD ASCII wireframes translate directly to Kimi's visual understanding
5. **Specify interactive behaviors** — animations, transitions, keyboard shortcuts, hover effects
6. **Include database schemas** — Kimi can generate full-stack code when given table structures
7. **Reference previous steps** — "Follow the design system from Step 1" maintains consistency
8. **Define mock data** — seed data ensures the generated site looks populated immediately
9. **Specify SEO requirements** — meta titles, descriptions, URL structures for every page
10. **Iterate with natural language** — after generation, use "Change the hero to dark mode" or "Add a floating action button" for refinements

### 9.2 Prompt Structure Template

For each step, use this structure:

```
[ROLE] Create [FEATURE] for PreDent Canada — [ONE-SENTENCE DESCRIPTION].

DESIGN SYSTEM (strictly follow):
- [Copy from Section 2.2]

TECH STACK:
- [Copy from Section 2.3]

PAGES TO GENERATE:
1. [Page Name] (/[route]):
   - [Specific features]
   - [Interactive elements]
   - [Data requirements]

2. [Page Name] (/[route]):
   - ...

DATABASE SCHEMA:
Table: [table_name] (
  [column] [type] [constraints],
  ...
)

MOCK DATA: [Specific data points]

DESIGN: [Visual requirements]

INTERACTIVE: [Animations, transitions, behaviors]

SEO: [Meta tags, keywords, URL structure]
```

### 9.3 Iteration Prompts

After initial generation, use these natural language prompts to refine:

| Issue | Prompt |
|---|---|
| Color mismatch | "Change the primary button color to #2563EB and hover to #1D4ED8" |
| Layout issue | "Make the school cards 3 columns on desktop, 2 on tablet, 1 on mobile" |
| Missing animation | "Add a fade-in animation when scrolling to each section" |
| Data update | "Update the UofT average GPA to 3.96 and add 2026 cycle data" |
| New feature | "Add a 'Compare' button to each school card that opens a comparison modal" |
| Mobile fix | "Make the PAT practice interface full-screen on mobile with larger tap targets" |
| Performance | "Lazy load the 3D models and add skeleton screens for loading states" |
| Accessibility | "Add ARIA labels to all interactive elements and ensure keyboard navigation works" |

---

## 10. Appendix: PRD Data Quick Reference

### 10.1 Canadian Dental Schools (All 10)

| # | School | Province | Program | Seats | Interview | CASPer | Min GPA | Avg GPA | Avg DAT AA | Avg DAT PAT |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | University of Toronto | Ontario | DDS | 96 | Panel | Yes | 3.0 | 3.96 | 24 | 23 |
| 2 | Western (Schulich) | Ontario | DDS | ~56 | Panel | Yes | 80% (best 2) | 89.85% | 21 | 21 |
| 3 | McGill | Quebec | DMD | ~40 | MMI | Yes | NR | 3.83 IP / 3.92 OOP | NR | NR |
| 4 | Universite de Montreal | Quebec | DMD | ~65 | MMI | Yes | NR | NR | NR | NR |
| 5 | Universite Laval | Quebec | DMD | ~55 | MMI | Yes | NR | NR | NR | NR |
| 6 | UBC | British Columbia | DMD | ~48 | MMI+SGI | No | 70% (2.8) | 86.24% | NR | NR |
| 7 | Alberta | Alberta | DDS | ~30 | MMI | Yes | 3.5 | 3.94 | NR | NR |
| 8 | Saskatchewan | Saskatchewan | DMD | 36 | MMI | Yes | 75% | 88.82% IP / 93.66% OOP | 21.88 | NR |
| 9 | Manitoba (Niznick) | Manitoba | DMD | ~30 | Panel | No | NR | 3.75 IP / 4.0 OOP | NR | NR |
| 10 | Dalhousie | Nova Scotia | DDS | ~40 | Panel | No | NR | NR | NR | NR |

### 10.2 PAT Section Breakdown

| Order | Subsection | Questions | Time | Difficulty |
|---|---|---|---|---|
| 1 | Keyholes | 15 | ~7.5 min | Medium |
| 2 | Top-Front-End | 15 | ~11 min | Hard |
| 3 | Angle Ranking | 15 | ~6 min | Medium |
| 4 | Hole Punching | 15 | ~10 min | Hard |
| 5 | Cube Counting | 15 | ~9 min | Medium |
| 6 | Pattern Folding | 15 | ~16.5 min | Very Hard |

### 10.3 Pricing Tiers

| Tier | Price | Duration | Key Features |
|---|---|---|---|
| Free | $0 | Unlimited | School DB, basic GPA calc, 500 PAT Qs, 10 generators/day |
| Premium Monthly | $29/mo | Recurring | Unlimited everything, full generators, AI tutor (basic) |
| Premium Annual | $249/yr | 12 months | 28% savings, Higher Score Guarantee |
| Premium Plus | $149 | One-time | Everything + PS review + 1-on-1 consultation |

### 10.4 DAT Format Reference

| Section | Questions | Time | Content |
|---|---|---|---|
| MDT (Manual Dexterity Test) | 1 soap pattern | 30 min | Soap carving (optional) |
| SNS (Survey of Natural Sciences) | 70 questions | 60 min | 40 Biology + 30 Chemistry |
| PAT (Perceptual Ability Test) | 90 questions | 60 min | 6 subsections x 15 questions |
| RCT (Reading Comprehension Test) | 50 questions | 60 min | 3 passages x ~16 paragraphs |
| **Total** | **211 questions** | **~3h 50min** | |

### 10.5 Competitive Comparison Matrix

| Feature | DATCrusher | DAT Bootcamp | PATBooster | PreDent Canada |
|---|---|---|---|---|
| Primary Focus | Canadian DAT | American DAT | PAT Section | Full admissions journey |
| Price | $499–849 | $519–919 | $299–499 | Free–$149 |
| School Database | No | No | No | Yes |
| Admissions Tools | No | No | No | Yes |
| Interview Prep | No | No | No | Yes |
| Application Tracking | No | No | No | Yes |
| AI Features | No | No | No | Yes |
| 3D PAT Models | Yes | Yes | Yes (best) | Yes |
| PAT Generators | Yes | Limited | Yes | Yes (all types) |
| Canadian Specificity | Excellent | US-focused | US-focused | Purpose-built |

---

## Quick Reference: One-Line Prompts for Each Step

For rapid iteration or when you need to regenerate a specific step:

| Step | One-Line Prompt |
|---|---|
| 1 | "Create PreDent Canada landing page with 6 pillars, animated stats, pricing tiers, and FAQ using design system #2563EB primary, Inter font, 12px card radius" |
| 2 | "Add School Hub with 10 Canadian dental school pages, comparison tool, and UofT template with admission snapshot, 5-year trend charts, and 'Am I Competitive?' teaser" |
| 3 | "Create SEO content pages: GPA calculator with gauge chart, DAT study schedule generator, Canadian DAT guide, 5 PAT strategy guides, CASPer guide, interview prep guide" |
| 4 | "Build PAT Academy frontend with 6 category cards, practice interface with timer and answer options, generators teaser, visual lessons, and performance dashboard with charts" |
| 5 | "Add full-stack auth: register/login with Lucia + SQLite, user profiles, protected routes, free vs premium gating, bcrypt passwords, rate limiting" |
| 6 | "Integrate Stripe payments: 3-tier pricing page, checkout sessions, webhooks for tier updates, customer portal, Higher Score Guarantee, subscription management" |
| 7 | "Build Application Planner: timeline visualization, Kanban task manager, document vault with drag-drop upload, deadline alerts, calendar view, SQLite schema" |
| 8 | "Create PAT practice engine: 300 question bank with filters, practice session with timer and keyboard shortcuts, post-session results, 3-tier explanations, Three.js 3D viewer" |
| 9 | "Build PAT generators for all 6 categories: procedural algorithms, Canvas/SVG rendering, validation pipeline, premium gating, <2s generation time" |
| 10 | "Create DAT Academy: Biology 7 units, Chemistry 9 units, RC module with passages, flashcards with spaced repetition, study schedule generator, Anki export" |
| 11 | "Add AI explanations (3 tiers) and performance analytics: accuracy charts, time distribution scatter plot, weakness heatmap, predicted score, auto-recommendations, error log, leaderboard" |
| 12 | "Build Acceptance Probability Engine: weighted scoring algorithm, school-specific results, improvement suggestions, acceptance statistics charts, crowdsourced data submission" |
| 13 | "Create Community Intelligence: news feed, Reddit aggregation, interview prep with 200+ MMI/Panel questions, practice simulator with timer, school-specific interview guides" |
| 14 | "Optimize for mobile: responsive breakpoints, PWA with service worker and offline mode, push notifications, touch-friendly PAT interface, Core Web Vitals <2.5s LCP" |
| 15 | "Add SEO and polish: XML sitemap, schema markup, meta tags, Plausible analytics, WCAG 2.1 AA accessibility, error pages, onboarding tutorial, email welcome sequence" |
| 16 | "Deploy to production: Hetzner VPS setup, Nginx reverse proxy, Let's Encrypt SSL, PM2 process manager, GitHub Actions CI/CD, SQLite backups, health checks, monitoring" |

---

*Document generated from PreDent_Canada_PRD.md*  
*Optimized for Kimi K2.6 Website Agent (Text-to-Website, Multi-Page, Full-Stack, One-Click Publish)*  
*Version 1.0 | 2026-06-20*
