if (!process.env.VERCEL && process.env.NODE_ENV !== "test") {
  try {
    const dotenv = await import("dotenv");
    dotenv.config();
  } catch (err) {
    console.warn("[env] Failed to load dotenv:", err);
  }
}

function required(name: string): string {
  const value = process.env[name];
  if (!value && process.env.NODE_ENV === "production") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value ?? "";
}

// Cache values that are accessed frequently and never mutated at runtime.
const cache: Record<string, string> = {};

function getRequiredCached(name: string): string {
  if (!(name in cache)) {
    cache[name] = required(name);
  }
  return cache[name];
}

export const env = {
  get appSecret() {
    const secret = getRequiredCached("APP_SECRET");
    if (
      process.env.NODE_ENV === "production" &&
      secret.length > 0 &&
      secret.length < 32
    ) {
      throw new Error(
        "APP_SECRET must be at least 32 characters in production"
      );
    }
    return secret;
  },
  get isProduction() {
    return process.env.NODE_ENV === "production";
  },
  get databaseUrl() {
    return getRequiredCached("DATABASE_URL");
  },
  get googleClientId() {
    return required("GOOGLE_CLIENT_ID");
  },
  get googleClientSecret() {
    return required("GOOGLE_CLIENT_SECRET");
  },
  get xClientId() {
    return process.env.X_CLIENT_ID ?? "";
  },
  get xClientSecret() {
    return process.env.X_CLIENT_SECRET ?? "";
  },
  get instagramClientId() {
    return process.env.INSTAGRAM_CLIENT_ID ?? "";
  },
  get instagramClientSecret() {
    return process.env.INSTAGRAM_CLIENT_SECRET ?? "";
  },
  get linkedinClientId() {
    return process.env.LINKEDIN_CLIENT_ID ?? "";
  },
  get linkedinClientSecret() {
    return process.env.LINKEDIN_CLIENT_SECRET ?? "";
  },
  get appleClientId() {
    return process.env.APPLE_CLIENT_ID ?? "";
  },
  get appleTeamId() {
    return process.env.APPLE_TEAM_ID ?? "";
  },
  get appleKeyId() {
    return process.env.APPLE_KEY_ID ?? "";
  },
  get applePrivateKey() {
    return process.env.APPLE_PRIVATE_KEY ?? "";
  },
  get discordClientId() {
    return process.env.DISCORD_CLIENT_ID ?? "";
  },
  get discordClientSecret() {
    return process.env.DISCORD_CLIENT_SECRET ?? "";
  },
  get microsoftTenant() {
    return process.env.MICROSOFT_TENANT ?? "common";
  },
  get microsoftClientId() {
    return process.env.MICROSOFT_CLIENT_ID ?? "";
  },
  get microsoftClientSecret() {
    return process.env.MICROSOFT_CLIENT_SECRET ?? "";
  },
  get facebookClientId() {
    return process.env.FACEBOOK_CLIENT_ID ?? "";
  },
  get facebookClientSecret() {
    return process.env.FACEBOOK_CLIENT_SECRET ?? "";
  },
  get ownerUnionId() {
    return process.env.OWNER_UNION_ID ?? "";
  },
  get stripeSecretKey() {
    return process.env.STRIPE_SECRET_KEY ?? "";
  },
  get stripeWebhookSecret() {
    return process.env.STRIPE_WEBHOOK_SECRET ?? "";
  },
  get stripePricePremiumMonthly() {
    return process.env.STRIPE_PRICE_PREMIUM_MONTHLY ?? "";
  },
  get stripePricePremiumYearly() {
    return process.env.STRIPE_PRICE_PREMIUM_YEARLY ?? "";
  },
  get stripePricePlusLifetime() {
    return process.env.STRIPE_PRICE_PLUS_LIFETIME ?? "";
  },
  get publicAppUrl() {
    return process.env.PUBLIC_APP_URL ?? "";
  },
  get emailProvider() {
    return process.env.EMAIL_PROVIDER ?? "console";
  },
  get cronSecret() {
    return process.env.CRON_SECRET ?? "";
  },
  get metricsSecret() {
    return process.env.METRICS_SECRET ?? "";
  },
  get upstashRedisRestUrl() {
    return process.env.UPSTASH_REDIS_REST_URL ?? "";
  },
  get upstashRedisRestToken() {
    return process.env.UPSTASH_REDIS_REST_TOKEN ?? "";
  },
  get allowInMemoryRateLimit() {
    return process.env.RATE_LIMIT_ALLOW_IN_MEMORY === "true";
  },
  get trustProxy() {
    return process.env.TRUST_PROXY === "true";
  },
  get trustCloudflareProxy() {
    return process.env.TRUST_CLOUDFLARE_PROXY === "true";
  },
  get pushEndpointAllowedHosts() {
    return (process.env.PUSH_ENDPOINT_ALLOWED_HOSTS ?? "")
      .split(",")
      .map(value => value.trim().toLowerCase())
      .filter(Boolean);
  },
  get databasePoolMax() {
    const configured = Number(process.env.DATABASE_POOL_MAX);
    if (Number.isInteger(configured) && configured >= 1 && configured <= 50) {
      return configured;
    }
    return process.env.VERCEL === "1" ? 3 : 10;
  },
  get sessionKeyId() {
    return process.env.SESSION_KEY_ID ?? "current";
  },
  get sessionPreviousSecrets() {
    const raw = process.env.SESSION_PREVIOUS_SECRETS ?? "{}";
    try {
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      return Object.fromEntries(
        Object.entries(parsed).filter(
          (entry): entry is [string, string] =>
            entry[0].length > 0 &&
            typeof entry[1] === "string" &&
            entry[1].length >= 32
        )
      );
    } catch {
      throw new Error("SESSION_PREVIOUS_SECRETS must be a JSON object");
    }
  },
};
