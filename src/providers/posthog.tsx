import { useEffect, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { posthog, isAnalyticsEnabled } from "@/lib/posthog-client";

export function PostHogProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    if (!isAnalyticsEnabled) return;
    posthog.capture("$pageview", { $current_url: location.pathname });
  }, [location.pathname]);

  useEffect(() => {
    if (!isAnalyticsEnabled || !user) return;
    posthog.identify(String(user.id), {
      email: user.email,
      name: user.name,
      role: user.role,
      tier: user.tier,
    });
  }, [user]);

  return <>{children}</>;
}
