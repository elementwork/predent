import type { Context } from "hono";
import { setCookie, getCookie } from "hono/cookie";
import * as cookie from "cookie";
import {
  getSessionCookieName,
  getSessionCookieOptions,
} from "../lib/cookies";
import { Session } from "@contracts/constants";
import { Errors } from "@contracts/errors";
import { signSessionToken, verifySessionToken } from "./session";
import { findUserByOAuthIdentity, upsertUser } from "../queries/users";
import {
  isOAuthProvider,
  buildAuthorizeUrl,
  fetchProfile,
  createOAuthState,
  createCodeVerifier,
} from "./providers";
import type { OAuthProvider } from "./providers";
import { getPublicAppOrigin } from "../lib/origin";

const ALLOWED_REDIRECTS = new Set(["/", "/dashboard", "/pricing"]);
const OAUTH_STATE_COOKIE = "predent_oauth_state";
const OAUTH_PROVIDER_COOKIE = "predent_oauth_provider";
const OAUTH_VERIFIER_COOKIE = "predent_oauth_verifier";
const OAUTH_REDIRECT_COOKIE = "predent_oauth_redirect";

export async function authenticateRequest(headers: Headers) {
  const cookies = cookie.parse(headers.get("cookie") || "");
  const token =
    cookies[getSessionCookieName()] ?? cookies[Session.cookieName];
  if (!token) {
    console.warn("[auth] No session cookie found in request.");
    throw Errors.unauthorized("Invalid authentication token.");
  }
  const claim = await verifySessionToken(token);
  if (!claim) {
    throw Errors.unauthorized("Invalid authentication token.");
  }
  const user = await findUserByOAuthIdentity(claim.provider, claim.unionId);
  if (!user) {
    throw Errors.unauthorized("User not found. Please re-login.");
  }
  if (user.tokenVersion !== claim.tokenVersion) {
    throw Errors.unauthorized("Session has been revoked. Please log in again.");
  }
  return user;
}

function getRedirectTarget(raw: string | undefined): string {
  if (
    raw &&
    raw.startsWith("/") &&
    !raw.startsWith("//") &&
    ALLOWED_REDIRECTS.has(raw)
  ) {
    return raw;
  }
  return "/dashboard";
}

function getCallbackUrl(c: Context): string {
  return `${getPublicAppOrigin(c.req.url)}/api/oauth/callback`;
}

export function createOAuthAuthorizeHandler() {
  return async (c: Context) => {
    const providerParam = c.req.param("provider");
    if (!providerParam || !isOAuthProvider(providerParam)) {
      return c.redirect("/login?error=invalid_provider", 302);
    }
    const provider = providerParam;

    const envMissing = missingEnvForProvider(provider);
    if (envMissing) {
      console.error(`[OAuth] ${provider} not configured: ${envMissing}`);
      return c.redirect("/login?error=provider_not_configured", 302);
    }

    const state = createOAuthState();
    const codeVerifier = createCodeVerifier();
    const redirect = getRedirectTarget(c.req.query("redirect") ?? undefined);
    const redirectUri = getCallbackUrl(c);

    const cookieOpts = getSessionCookieOptions(c.req.raw.headers);
    const maxAge = 600; // 10 minutes

    setCookie(c, OAUTH_STATE_COOKIE, state, { ...cookieOpts, maxAge });
    setCookie(c, OAUTH_PROVIDER_COOKIE, provider, { ...cookieOpts, maxAge });
    setCookie(c, OAUTH_VERIFIER_COOKIE, codeVerifier, {
      ...cookieOpts,
      maxAge,
    });
    setCookie(c, OAUTH_REDIRECT_COOKIE, redirect, { ...cookieOpts, maxAge });

    const authorizeUrl = buildAuthorizeUrl(
      provider,
      redirectUri,
      state,
      codeVerifier
    );
    return c.redirect(authorizeUrl.toString(), 302);
  };
}

export function createOAuthCallbackHandler() {
  return async (c: Context) => {
    const code = c.req.query("code");
    const state = c.req.query("state");
    const error = c.req.query("error");
    const errorDescription = c.req.query("error_description");

    if (error) {
      console.warn("[OAuth] Provider returned error:", error, errorDescription);
      if (error === "access_denied") {
        return c.redirect("/", 302);
      }
      return c.redirect(`/login?error=${encodeURIComponent(error)}`, 302);
    }

    if (!code || !state) {
      return c.redirect("/login?error=missing_oauth_params", 302);
    }

    const expectedState = getCookie(c, OAUTH_STATE_COOKIE);
    const providerCookie = getCookie(c, OAUTH_PROVIDER_COOKIE);
    const verifierCookie = getCookie(c, OAUTH_VERIFIER_COOKIE);
    const redirectCookie = getCookie(c, OAUTH_REDIRECT_COOKIE);

    if (!expectedState || state !== expectedState) {
      return c.redirect("/login?error=invalid_state", 302);
    }
    if (!providerCookie || !isOAuthProvider(providerCookie)) {
      return c.redirect("/login?error=invalid_provider", 302);
    }
    if (!verifierCookie) {
      return c.redirect("/login?error=missing_verifier", 302);
    }

    try {
      const redirectTarget = getRedirectTarget(redirectCookie ?? undefined);
      const redirectUri = getCallbackUrl(c);
      const profile = await fetchProfile(
        providerCookie,
        code,
        redirectUri,
        verifierCookie
      );

      await upsertUser({
        provider: profile.provider,
        unionId: profile.unionId,
        name: profile.name ?? null,
        email: profile.email ?? null,
        avatar: profile.avatar ?? null,
        lastSignInAt: new Date(),
      });

      const user = await findUserByOAuthIdentity(
        profile.provider,
        profile.unionId
      );
      const token = await signSessionToken({
        unionId: profile.unionId,
        provider: profile.provider,
        tokenVersion: user?.tokenVersion ?? 0,
      });

      const cookieOpts = getSessionCookieOptions(c.req.raw.headers);
      setCookie(c, getSessionCookieName(), token, {
        ...cookieOpts,
        maxAge: Session.maxAgeMs / 1000,
      });

      // Clear OAuth flow cookies
      setCookie(c, OAUTH_STATE_COOKIE, "", { ...cookieOpts, maxAge: 0 });
      setCookie(c, OAUTH_PROVIDER_COOKIE, "", { ...cookieOpts, maxAge: 0 });
      setCookie(c, OAUTH_VERIFIER_COOKIE, "", { ...cookieOpts, maxAge: 0 });
      setCookie(c, OAUTH_REDIRECT_COOKIE, "", { ...cookieOpts, maxAge: 0 });

      return c.redirect(redirectTarget, 302);
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      return c.redirect("/login?error=oauth_callback_failed", 302);
    }
  };
}

function missingEnvForProvider(provider: OAuthProvider): string | null {
  switch (provider) {
    case "google":
      if (!process.env.GOOGLE_CLIENT_ID) return "GOOGLE_CLIENT_ID";
      if (!process.env.GOOGLE_CLIENT_SECRET) return "GOOGLE_CLIENT_SECRET";
      return null;
    case "x":
      if (!process.env.X_CLIENT_ID) return "X_CLIENT_ID";
      if (!process.env.X_CLIENT_SECRET) return "X_CLIENT_SECRET";
      return null;
    case "instagram":
      if (!process.env.INSTAGRAM_CLIENT_ID) return "INSTAGRAM_CLIENT_ID";
      if (!process.env.INSTAGRAM_CLIENT_SECRET)
        return "INSTAGRAM_CLIENT_SECRET";
      return null;
    case "linkedin":
      if (!process.env.LINKEDIN_CLIENT_ID) return "LINKEDIN_CLIENT_ID";
      if (!process.env.LINKEDIN_CLIENT_SECRET) return "LINKEDIN_CLIENT_SECRET";
      return null;
    case "apple":
      if (!process.env.APPLE_CLIENT_ID) return "APPLE_CLIENT_ID";
      if (!process.env.APPLE_TEAM_ID) return "APPLE_TEAM_ID";
      if (!process.env.APPLE_KEY_ID) return "APPLE_KEY_ID";
      if (!process.env.APPLE_PRIVATE_KEY) return "APPLE_PRIVATE_KEY";
      return null;
    case "discord":
      if (!process.env.DISCORD_CLIENT_ID) return "DISCORD_CLIENT_ID";
      if (!process.env.DISCORD_CLIENT_SECRET) return "DISCORD_CLIENT_SECRET";
      return null;
    case "microsoft":
      if (!process.env.MICROSOFT_CLIENT_ID) return "MICROSOFT_CLIENT_ID";
      if (!process.env.MICROSOFT_CLIENT_SECRET)
        return "MICROSOFT_CLIENT_SECRET";
      return null;
    case "facebook":
      if (!process.env.FACEBOOK_CLIENT_ID) return "FACEBOOK_CLIENT_ID";
      if (!process.env.FACEBOOK_CLIENT_SECRET) return "FACEBOOK_CLIENT_SECRET";
      return null;
  }
}
