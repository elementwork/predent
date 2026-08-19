# Post-merge PAT audit — 2026-08-19

This audit verifies the production ManipAT integration after Predent PR #20 and ManipAT PR #11 were merged.

## Production verification

- Predent production deploy for merge commit `142e7468a4c3bca06aa05c4ea3079d756725091a` is READY on Vercel.
- `https://predent.vercel.app` returns HTTP 200 from the production deployment.
- Vercel reported no grouped runtime errors in the two-hour audit window.
- The production build is pinned to merged ManipAT commit `3af8314cb1c5199d3365ffdc7fe3d26fca32290a`.

## Verified architecture

- ManipAT is the only PAT generation and scoring engine.
- Active-client DTOs exclude seed, canonical question ID, correct answer, solution, solver output, validation internals, and provenance.
- Scoring occurs server-side after submission by opening user/session-bound encrypted instance tokens.
- The full exam plan is 90 questions: 15 each of Keyholes, TFE, Angle Ranking, Hole Punching, Cube Counting, and Pattern Folding.
- Cube Counting preserves shared candidate groups of up to three questions.
- PAT flashcards generate from the same ManipAT runtime and reveal the ManipAT solution only after the flashcard is flipped.
- Canonical ManipAT SVG is rendered directly in Predent; generated SVG receives a static-content guard before exposure.

## Findings fixed in this audit

### Exam timing could be disabled

`sessionTimeLimitSeconds()` previously honored `timeLimit: false` before applying the exam-mode rule. A client could therefore create an untimed 90-question Exam session.

**Fix:** exam mode now always returns a 60-minute server-issued time limit regardless of client input.

### Exam timer could be paused

The practice UI exposed Pause during Exam mode, and pausing stopped the client countdown.

**Fix:** Exam setup now states that 90 questions / 60 minutes is fixed, the timer request is forced on client-side as defense in depth, and the Pause control is removed during Exam mode. Non-exam practice modes retain pausing.

## Follow-up hardening / product work

These are not blockers for the merged integration, but they are worthwhile future changes:

1. **Durable sessions / resume:** active PAT sessions currently live in React state and question tokens expire after six hours. A reload loses the current UI session even though quota has already been reserved. Persisting `pat_sessions` and question instances would support cross-device resume and long-lived review.
2. **Race-safe submission idempotency:** application logic deduplicates attempts by user/session/canonical question ID, but a database unique constraint would protect concurrent duplicate submissions.
3. **Server-side exam deadline enforcement:** the normal UI now enforces exam timing faithfully, but the server does not persist an immutable one-hour submission deadline. A persistent session record would allow strict enforcement against modified clients.
4. **Explanation HTML defense in depth:** ManipAT explanation HTML is deterministic internal output, not user content, but Predent renders it as HTML. A narrow allowlist sanitizer or typed structured explanation format would further reduce supply-chain risk.
5. **Authenticated visual corpus smoke:** CI validates the site broadly, but a production-only authenticated smoke that generates at least one Aperture and TFE question would specifically exercise Manifold/WASM packaging after each deployment.

## Scope limitation

This audit verified production deployment state, live HTTP availability, Vercel runtime errors, merged source contracts, PAT session/scoring logic, SVG rendering, and flashcard integration. It did not use a real authenticated end-user browser session, so subjective SVG visual quality and mobile interaction ergonomics still require an authenticated visual pass.
