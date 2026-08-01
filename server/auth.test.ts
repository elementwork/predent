import { describe, it, expect } from "vitest";
import app from "./app";

describe("OAuth authorize", () => {
  it("redirects to Google for /api/oauth/authorize/google", async () => {
    const res = await app.request("/api/oauth/authorize/google?redirect=/dashboard");
    expect(res.status).toBe(302);
    const location = res.headers.get("location");
    expect(location).toBeTruthy();
    expect(location).toMatch(/^https:\/\/accounts\.google\.com\/o\/oauth2\/v2\/auth/);
    expect(location).toContain("state=");

    const cookies = res.headers.get("set-cookie") || "";
    expect(cookies).toContain("predent_oauth_state=");
    expect(cookies).toContain("predent_oauth_provider=google");
    expect(cookies).toContain("predent_oauth_verifier=");
  });

  it("recognizes all configured social providers", async () => {
    const expectations: Record<string, string> = {
      google: "https://accounts.google.com/o/oauth2/v2/auth",
      x: "https://twitter.com/i/oauth2/authorize",
      instagram: "https://api.instagram.com/oauth/authorize",
      linkedin: "https://www.linkedin.com/oauth/v2/authorization",
      apple: "https://appleid.apple.com/auth/authorize",
      discord: "https://discord.com/oauth2/authorize",
      microsoft: "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
      facebook: "https://www.facebook.com/v16.0/dialog/oauth",
    };

    for (const [provider, expectedHost] of Object.entries(expectations)) {
      const res = await app.request(`/api/oauth/authorize/${provider}`);
      expect(res.status).toBe(302);
      const location = res.headers.get("location") ?? "";
      expect(location).toContain(expectedHost);
      expect(location).toContain("state=");
    }
  });

  it("redirects to login for an unknown provider", async () => {
    const res = await app.request("/api/oauth/authorize/unknown");
    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toBe("/login?error=invalid_provider");
  });
});

describe("OAuth callback", () => {
  it("redirects to login when state is missing", async () => {
    const res = await app.request("/api/oauth/callback?code=abc&state=xyz");
    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toBe("/login?error=invalid_state");
  });

  it("redirects to home when the user denies access", async () => {
    const res = await app.request("/api/oauth/callback?error=access_denied");
    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toBe("/");
  });
});
