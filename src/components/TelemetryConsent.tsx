import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  getTelemetryConsent,
  setTelemetryConsent,
  TELEMETRY_CONSENT_EVENT,
  type TelemetryConsent,
} from "@/lib/telemetry-consent";

export function TelemetryConsentBanner() {
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

  if (consent !== null) return null;

  return (
    <aside
      aria-label="Analytics privacy choices"
      className="fixed inset-x-4 bottom-4 z-[100] mx-auto max-w-3xl rounded-xl border border-[var(--border-color)] bg-[var(--page-surface)] p-4 shadow-2xl"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[var(--text-secondary)]">
          Optional analytics and masked error replay help us improve PreDent.
          They stay off unless you allow them. See our{" "}
          <Link
            to="/legal/privacy"
            className="text-[#1D4ED8] underline underline-offset-2"
          >
            Privacy Policy
          </Link>
          .
        </p>
        <div className="flex shrink-0 gap-2">
          <Button
            variant="outline"
            onClick={() => setTelemetryConsent("denied")}
          >
            Decline
          </Button>
          <Button
            className="bg-[#2563EB] text-white hover:bg-[#1D4ED8]"
            onClick={() => setTelemetryConsent("granted")}
          >
            Allow analytics
          </Button>
        </div>
      </div>
    </aside>
  );
}
