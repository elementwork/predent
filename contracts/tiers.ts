export type Tier = "free" | "premium" | "premium_plus";

export const TIER_QUOTAS: Record<Tier, number> = {
  free: 20,
  premium: 360,
  premium_plus: 1080,
};

export function getTierQuota(tier: Tier): number {
  return TIER_QUOTAS[tier] ?? TIER_QUOTAS.free;
}
