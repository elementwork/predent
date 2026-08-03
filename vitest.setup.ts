import { existsSync } from "fs";

// Load .env.test as fallback if DATABASE_URL is not set
if (!process.env.DATABASE_URL) {
  try {
    const dotenv = await import("dotenv");
    if (existsSync(".env.test")) {
      dotenv.config({ path: ".env.test" });
    }
    if (existsSync(".env")) {
      dotenv.config({ path: ".env" });
    }
  } catch {
    // dotenv not available
  }
}

// DATABASE_URL is optional — tests that need a DB will be skipped when it's absent.
if (!process.env.DATABASE_URL) {
  console.warn(
    "[vitest] DATABASE_URL not set — DB-dependent tests will be skipped."
  );
  // Set a dummy URL so getDb() doesn't throw during module imports.
  // Tests use describe.skipIf to skip when there's no real DB.
  process.env.DATABASE_URL = "postgresql://localhost:5432/test";
}

process.env.APP_SECRET = "***";
process.env.GOOGLE_CLIENT_ID = "test-google-client-id";
process.env.GOOGLE_CLIENT_SECRET = "***";
process.env.X_CLIENT_ID = "test-x-client-id";
process.env.X_CLIENT_SECRET = "***";
process.env.INSTAGRAM_CLIENT_ID = "test-instagram-client-id";
process.env.INSTAGRAM_CLIENT_SECRET = "***";
process.env.LINKEDIN_CLIENT_ID = "test-linkedin-client-id";
process.env.LINKEDIN_CLIENT_SECRET = "***";
process.env.APPLE_CLIENT_ID = "test-apple-client-id";
process.env.APPLE_TEAM_ID = "TEAM123456";
process.env.APPLE_KEY_ID = "KEY1234567";
process.env.APPLE_PRIVATE_KEY = "-----BEGIN EC PRIVATE KEY-----\nMHQCAQEEIBXDRNGLLGkDi2WfKhfsAJ3FSKgb0/BI1Q9LM8rxN9uloAcGBSuBBAAK\noUQDQgAEypZW6p+1WjanBnb/zF5bxcB5xEpzf9wXnPwL0DKf7gAdlvXjYnO42Hjz\n0P/J1zUj0M1kckDSNwzbn8IeCgt5Ow==\n-----END EC PRIVATE KEY-----";
process.env.DISCORD_CLIENT_ID = "test-discord-client-id";
process.env.DISCORD_CLIENT_SECRET = "***";
process.env.MICROSOFT_CLIENT_ID = "test-microsoft-client-id";
process.env.MICROSOFT_CLIENT_SECRET = "***";
process.env.FACEBOOK_CLIENT_ID = "test-facebook-client-id";
process.env.FACEBOOK_CLIENT_SECRET = "***";
