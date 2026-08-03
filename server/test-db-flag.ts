/**
 * Shared flag indicating whether a PostgreSQL database is available for tests.
 * vitest.setup.ts sets DATABASE_URL to a dummy value when none is configured.
 * This flag checks if a real DB URL was originally present.
 */
export const hasDb = Boolean(
  process.env.DATABASE_URL && process.env.DATABASE_URL !== "postgresql://localhost:5432/test"
);
