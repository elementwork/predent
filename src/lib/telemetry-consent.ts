export type TelemetryConsent = "granted" | "denied" | null;

const STORAGE_KEY = "predent_telemetry_consent";
export const TELEMETRY_CONSENT_EVENT = "predent:telemetry-consent";

export function getTelemetryConsent(): TelemetryConsent {
  if (typeof window === "undefined") return null;
  const value = window.localStorage.getItem(STORAGE_KEY);
  return value === "granted" || value === "denied" ? value : null;
}

export function setTelemetryConsent(consent: Exclude<TelemetryConsent, null>) {
  window.localStorage.setItem(STORAGE_KEY, consent);
  window.dispatchEvent(
    new CustomEvent<TelemetryConsent>(TELEMETRY_CONSENT_EVENT, {
      detail: consent,
    })
  );
}

export function requestTelemetryConsent() {
  window.localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(
    new CustomEvent<TelemetryConsent>(TELEMETRY_CONSENT_EVENT, {
      detail: null,
    })
  );
}
