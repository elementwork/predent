# ManipAT integration

Predent consumes ManipAT as a pinned local library. ManipAT is not a network
service and must not become an HTTP dependency of the production site.

## Dependency boundary

- `vendor/manipat` is a public HTTPS Git submodule pinned to one exact ManipAT
  commit.
- Predent server code imports only `vendor/manipat/runtime/dist/index.js`.
- `tools/prepare-manipat-runtime.mjs` installs/builds the pinned submodule and
  exposes the two third-party runtime packages (`manifold-3d` and `three`) to
  Predent's server bundle.
- Vercel runs the prepare script during install. GitHub Actions checks out
  submodules and runs it once before the normal verification gates.
- To upgrade ManipAT, move the submodule pointer intentionally in a dedicated
  change and re-run the full Predent release gates.

## Security boundary

Active PAT clients receive only:

- opaque encrypted `instanceId`
- category and difficulty band
- prompt text
- canonical ManipAT prompt SVGs
- answer labels/SVGs

They do not receive the seed, canonical question id, correct choice, solution,
validator output, or generator provenance until the session is submitted.

The opaque instance token is AES-256-GCM encrypted with a key derived from
`APP_SECRET`, bound to the authenticated user and session, and expires after
six hours. Session scoring happens exclusively in `server/pat-router.ts`.

## Product mapping

| Predent | ManipAT |
| --- | --- |
| Keyholes | `aperture` |
| Top-Front-End | `view-recognition` |
| Angle Ranking | `angle` |
| Hole Punching | `paper-folding` |
| Cube Counting | `cube-counting` |
| Pattern Folding | `form-development` |

Predent keeps four user-facing difficulty labels. Each label alternates between
two adjacent ManipAT bands:

- beginner: bands 1–2
- intermediate: bands 2–3
- advanced: bands 3–4
- elite: bands 4–5

The exact band is recorded/displayed for provenance but remains an engine
concept rather than a fifth product difficulty setting.

## Session behavior

- Quick: 10 questions.
- Timed: 15 questions / 15 minutes.
- Full exam: 90 questions / 60 minutes, fixed category order, 15 per category.
- Category drill and mixed practice use the selected count.
- Consecutive cube-counting questions are generated as ManipAT candidate groups
  (up to three) so shared-figure behavior is retained.
- Quota is reserved when validated questions are issued, not when an answer is
  submitted.
- Submitting the same session again is idempotent at the attempt-record level.

## Legacy code

The old `src/components/pat-generators/logic` and
`server/lib/pat-generation` implementations remain temporarily as dead
rollback/reference code during the first production cutover. Production
practice, generator, scoring, and PAT flashcard paths must not import them.
Delete the dead implementations after the ManipAT-backed preview and CI gates
are accepted.
