-- Remove unused 'kimi' from provider enum
-- Safe because no users have provider = 'kimi' (no Kimi OAuth implementation exists)

ALTER TABLE "users" ALTER COLUMN "provider" DROP DEFAULT;

CREATE TYPE "provider_new" AS ENUM (
  'google', 'x', 'instagram', 'linkedin',
  'apple', 'discord', 'microsoft', 'facebook'
);

ALTER TABLE "users"
  ALTER COLUMN "provider" TYPE "provider_new"
  USING "provider"::text::"provider_new";

ALTER TABLE "users" ALTER COLUMN "provider" SET DEFAULT 'google';

DROP TYPE "provider";

ALTER TYPE "provider_new" RENAME TO "provider";
