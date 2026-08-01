import { useMemo } from "react";
import { useAuth } from "./useAuth";

export type Tier = "free" | "premium" | "premium_plus";

export function useTier() {
  const { user, isAuthenticated } = useAuth();

  const tier: Tier = (user?.tier as Tier) ?? "free";

  return useMemo(
    () => ({
      tier,
      isAuthenticated,
      isFree: tier === "free",
      isPremium: tier === "premium" || tier === "premium_plus",
      isPlus: tier === "premium_plus",
      hasAccess(required: Tier) {
        if (required === "free") return true;
        if (required === "premium")
          return tier === "premium" || tier === "premium_plus";
        return tier === "premium_plus";
      },
    }),
    [tier, isAuthenticated]
  );
}
