# Dependency and Supply-Chain Policy

> Last updated: 2026-08-08

- Production installs use the committed lockfile and `npm ci`; runtime images
  contain production dependencies only and run as a non-root user.
- Direct dependencies should be exact-pinned when changed for a security fix.
  Dependabot opens weekly npm and GitHub Actions updates.
- CI fails on high/critical production advisories, forbidden or missing license
  metadata, high/critical container findings with fixes, type/lint/test failures,
  and stale generated migrations.
- GitHub Actions are pinned to immutable commit SHAs. Review an action's owner,
  release notes, permissions, and compromise notices before updating the SHA.
- CI emits CycloneDX dependency and container SBOM artifacts for every eligible
  build. Retain them with the release evidence.
- New packages require a maintained upstream, compatible license, justified
  bundle/runtime cost, and no safer existing equivalent. Remove unused packages.
- Moderate development-only advisories may be accepted temporarily only when
  documented with scope, compensating controls, owner, and review date. Never
  suppress production high/critical findings without explicit security review.

Current known exception: Drizzle Kit's development-only legacy loader can carry
moderate advisory findings. It is excluded from the production image and
production audit; Dependabot should continue tracking a compatible upstream
fix.
