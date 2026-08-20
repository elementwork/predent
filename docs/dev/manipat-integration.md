# ManipAT ↔ Predent integration

## Boundary

ManipAT is the canonical deterministic PAT engine. Predent consumes the pinned local ManipAT runtime from `vendor/manipat` and owns product concerns: authentication, quota, session lifecycle, timing, navigation, analytics, flashcards, and presentation.

Predent never reimplements PAT generation, scoring, solver truth, distractors, validation, or canonical SVG construction.

## Distribution

`vendor/manipat` is a public HTTPS Git submodule pinned to an exact ManipAT commit. Predent CI, Docker, and Vercel build the pinned ManipAT workspace first and link the runtime locally. There is no network call to a ManipAT service at request time.

## Active-session trust model

PAT sessions are server-authoritative and durable:

1. Predent asks the ManipAT runtime to generate and validate each question.
2. Predent persists a `pat_sessions` row and one `pat_question_instances` row per issued question.
3. The browser receives only an opaque question-instance UUID plus the safe public ManipAT DTO and the user's own answer/time/flag state.
4. Seed, canonical question ID, correct choice, solution, and generator provenance remain in the trusted `private_record` JSONB column.
5. Answer/time/flag progress is persisted as the user works so refresh and cross-device resume recover the open session.
6. `submitSession` scores only persisted server state and writes attempts with database-enforced idempotency.

The old encrypted client-carried private PAT record is intentionally retired for practice sessions; trusted question state no longer leaves the server before submission.

## Exam timing

Full Exam mode is fixed at 90 questions / 60 minutes. Predent persists an immutable `deadline_at` when the exam is issued. Progress writes after that deadline are rejected server-side, so browser refreshes, clock changes, device switches, or a modified client cannot extend the exam.

Normal practice/timed sessions remain pausable. Their remaining time is reconstructed from the configured limit minus persisted per-question elapsed time.

## Category mapping

| Predent | ManipAT |
| --- | --- |
| `keyholes` | `aperture` |
| `tfe` | `view-recognition` |
| `angle_ranking` | `angle` |
| `hole_punching` | `paper-folding` |
| `cube_counting` | `cube-counting` |
| `pattern_folding` | `form-development` |

Predent's four product difficulty labels map deterministically across ManipAT's five bands:

- beginner → 1 / 2
- intermediate → 2 / 3
- advanced → 3 / 4
- elite → 4 / 5

## Exam order

The full PAT exam is fixed at 90 questions / 60 minutes with 15 questions in each category, in this order:

1. Keyholes
2. Top-Front-End
3. Angle Ranking
4. Hole Punching
5. Cube Counting
6. Pattern Folding

Cube Counting preserves contiguous ManipAT candidate groups up to three questions so shared figures remain coherent.

## Rendering and explanation safety

Predent renders the canonical SVG emitted by ManipAT. ManipAT rejects executable SVG content before exposure. Predent additionally validates ManipAT explanation HTML at the server trust boundary against a strict no-attributes allowlist containing only `p`, `strong`, `h4`, `ul`, and `li`, matching the current deterministic ManipAT explanation renderer.

## Quota and idempotency

Question quota is reserved atomically when a validated durable session is issued. Discarding a session does not refund quota.

`pat_attempts` is protected by a database unique index on `(user_id, session_id, question_id)` when `session_id` is non-null. Repeated or concurrent submissions use conflict-safe insertion and cannot create duplicate attempts.

## Flashcards

PAT flashcards generate through the same pinned ManipAT runtime boundary. The public question is shown first; the server-sanitized ManipAT solution is revealed only after the card is flipped. DAT flashcards are unaffected.

## Release gates

In addition to unit/integration coverage, CI runs an authenticated PAT corpus smoke against the **compiled production server** and disposable Postgres database. It exercises all six categories, including Manifold-backed Aperture and View Recognition generation, verifies mobile SVG/choice geometry and overflow, submits through the real HTTP API, verifies review solutions, and retains screenshots as the `pat-visual-corpus` workflow artifact.

## Upgrade flow

1. Update ManipAT on its own branch and run ManipAT validation/tests.
2. Merge the ManipAT change.
3. Repin `vendor/manipat` in Predent to the exact merged ManipAT commit.
4. Rebuild/link the runtime and run Predent's full CI/Vercel preview gates.
5. If a Predent schema migration is included, apply it to production before promoting code that requires it.
6. Merge Predent only after the pinned runtime, migration, CI, production-build PAT corpus, and preview deployment are all green.
