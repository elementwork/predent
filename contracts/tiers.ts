export type Tier = "free" | "premium" | "premium_plus";

export const TIER_QUOTAS: Record<Tier, number> = {
  free: 20,
  premium: 360,
  premium_plus: 1080,
};

export function getTierQuota(tier: Tier): number {
  return TIER_QUOTAS[tier] ?? TIER_QUOTAS.free;
}

const TIER_RANK: Record<Tier, number> = {
  free: 0,
  premium: 1,
  premium_plus: 2,
};

export function getEffectiveTier(
  tier: Tier | null | undefined,
  premiumUntil: Date | string | null | undefined,
  now = Date.now()
): Tier {
  if (!tier || tier === "free") return "free";
  if (!premiumUntil) return "free";

  const expiresAt =
    premiumUntil instanceof Date
      ? premiumUntil.getTime()
      : new Date(premiumUntil).getTime();

  return Number.isFinite(expiresAt) && expiresAt > now ? tier : "free";
}

export function hasTierAccess(current: Tier, required: Tier): boolean {
  return TIER_RANK[current] >= TIER_RANK[required];
}
