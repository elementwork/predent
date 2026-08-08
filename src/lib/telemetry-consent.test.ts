import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getTelemetryConsent,
  requestTelemetryConsent,
  setTelemetryConsent,
  TELEMETRY_CONSENT_EVENT,
} from "./telemetry-consent";

describe("telemetry consent", () => {
  beforeEach(() => window.localStorage.clear());

  it("defaults to no consent", () => {
    expect(getTelemetryConsent()).toBeNull();
  });

  it("persists and broadcasts an explicit decision", () => {
    const listener = vi.fn();
    window.addEventListener(TELEMETRY_CONSENT_EVENT, listener);

    setTelemetryConsent("granted");

    expect(getTelemetryConsent()).toBe("granted");
    expect(listener).toHaveBeenCalledOnce();
    window.removeEventListener(TELEMETRY_CONSENT_EVENT, listener);
  });

  it("allows the user to reopen privacy choices", () => {
    setTelemetryConsent("denied");
    requestTelemetryConsent();

    expect(getTelemetryConsent()).toBeNull();
  });
});
