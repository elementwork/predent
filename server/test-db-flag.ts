/**
 * Shared flag indicating whether a PostgreSQL database is available for tests.
 * Database integration tests are enabled only through TEST_DATABASE_URL.
 * vitest.setup.ts records whether that explicit test-only URL was provided.
 */
export const hasDb = process.env.TEST_DATABASE_AVAILABLE === "true";
