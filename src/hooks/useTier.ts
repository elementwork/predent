import { useMemo } from "react";
import { useAuth } from "./useAuth";
import { getEffectiveTier, hasTierAccess, type Tier } from "@contracts/tiers";

export type { Tier } from "@contracts/tiers";

export function useTier() {
  const { user, isAuthenticated } = useAuth();

  const tier = getEffectiveTier(
    user?.tier as Tier | undefined,
    user?.premiumUntil
  );

  return useMemo(
    () => ({
      tier,
      isAuthenticated,
      isFree: tier === "free",
      isPremium: tier === "premium",
      hasAccess(required: Tier) {
        return hasTierAccess(tier, required);
      },
    }),
    [tier, isAuthenticated]
  );
}
