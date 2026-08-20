# PAT post-merge audit — 2026-08-19

## Scope

This audit covers the merged ManipAT integration on Predent production and the additional hardening implemented in PR #21.

## Production verification

- The merged production deployment was healthy and returned HTTP 200 during the audit.
- Vercel reported no runtime errors in the audit window.
- Predent remains pinned to the merged ManipAT revision.
- Active PAT questions expose only public ManipAT DTOs; scoring truth stays server-side.
- PAT flashcards use the same ManipAT runtime boundary.

## Findings and disposition

### 1. Exam timer could be disabled

**Fixed.** Exam mode is always 90 questions / 60 minutes. The server ignores a client attempt to disable the timer.

### 2. Exam timer could be paused

**Fixed.** Exam mode has no Pause control. Its deadline is now persisted on the server, so refreshes, device changes, or a modified client cannot extend it.

### 3. Active session state was browser-only

**Fixed.** `pat_sessions` and `pat_question_instances` persist the issued ManipAT public question, trusted private record, answer, elapsed time, and flag state. An authenticated user automatically resumes the current open session after refresh or on another device. Users may explicitly discard an open session; quota is not refunded.

### 4. Submission idempotency was application-only

**Fixed.** Submission reads persisted question state, and `pat_attempts` has a database unique index on `(user_id, session_id, question_id)` for non-null session IDs. Submission uses conflict-safe insertion and can be repeated without duplicating attempts.

### 5. Explanation HTML relied only on ManipAT's escaping

**Fixed.** Predent now validates every ManipAT explanation at the server trust boundary against the exact structural allowlist currently emitted by ManipAT: `p`, `strong`, `h4`, `ul`, and `li`, with no attributes. The same boundary applies to practice sessions and flashcards.

### 6. No authenticated production-path visual corpus gate

**Fixed.** CI now runs a signed-user Playwright flow against the compiled production server and disposable Postgres database. It creates and scores real sessions for all six PAT categories, exercises ManipAT/Manifold through HTTP, checks mobile geometry and horizontal overflow, verifies SVG or label choice rendering, verifies solution review, and saves category screenshots as the `pat-visual-corpus` artifact.

## Security boundary after hardening

Browser state contains only the opaque question-instance UUID, public ManipAT question DTO, and the user's own progress. Seed, canonical answer, solver truth, private solution data, and generator provenance are persisted server-side and are returned only after session submission.

## Deployment note

The new persistence tables require the migration in this PR to be applied before production code that uses them is promoted. Vercel currently builds and deploys the application but does not run database migrations automatically, so migration application remains an explicit deployment step.
