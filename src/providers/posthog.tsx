import { useEffect, useState, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  disableAnalytics,
  enableAnalytics,
  captureAnalytics,
  identifyAnalytics,
  resetAnalyticsIdentity,
} from "@/lib/posthog-client";
import { disableSentry, enableSentry } from "@/lib/sentry";
import {
  getTelemetryConsent,
  TELEMETRY_CONSENT_EVENT,
  type TelemetryConsent,
} from "@/lib/telemetry-consent";

export function PostHogProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { user } = useAuth();
  const [consent, setConsent] = useState<TelemetryConsent>(() =>
    getTelemetryConsent()
  );

  useEffect(() => {
    const handleConsent = (event: Event) => {
      setConsent((event as CustomEvent<TelemetryConsent>).detail);
    };
    window.addEventListener(TELEMETRY_CONSENT_EVENT, handleConsent);
    return () =>
      window.removeEventListener(TELEMETRY_CONSENT_EVENT, handleConsent);
  }, []);

  useEffect(() => {
    if (consent === "granted") {
      void enableAnalytics();
      void enableSentry();
    } else {
      void disableAnalytics();
      void disableSentry();
    }
  }, [consent]);

  useEffect(() => {
    if (consent !== "granted") return;
    void captureAnalytics("$pageview", { $current_url: location.pathname });
  }, [consent, location.pathname]);

  useEffect(() => {
    if (consent !== "granted") return;
    if (user) {
      void identifyAnalytics(String(user.id), {
        role: user.role,
        tier: user.tier,
      });
    } else {
      resetAnalyticsIdentity();
    }
  }, [consent, user]);

  return <>{children}</>;
}
