-- `users.provider` was created as varchar in 0000, not as a PostgreSQL enum.
-- Removing an app-level provider therefore requires no type migration. Keeping
-- the column varchar also matches db/schema.ts and preserves existing users.
ALTER TABLE "users" ALTER COLUMN "provider" SET DEFAULT 'google';
