import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { TRPCProvider } from "@/providers/trpc";
import { ThemeProvider } from "@/providers/theme";
import { PostHogProvider } from "@/providers/posthog";
import { Toaster } from "@/components/ui/sonner";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import "./index.css";
import App from "./App.tsx";
import { TelemetryConsentBanner } from "@/components/TelemetryConsent";

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(err => {
      console.error("Service worker registration failed:", err);
    });
  });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <BrowserRouter>
          <TRPCProvider>
            <PostHogProvider>
              <App />
              <TelemetryConsentBanner />
              <Toaster />
            </PostHogProvider>
          </TRPCProvider>
        </BrowserRouter>
      </ThemeProvider>
    </ErrorBoundary>
  </StrictMode>
);
