import {
  Google,
  Twitter,
  LinkedIn,
  Apple,
  Discord,
  MicrosoftEntraId,
  Facebook,
  generateCodeVerifier,
  generateState,
} from "arctic";
import * as jose from "jose";
import { env } from "../lib/env";
import type { OAuthProvider, OAuthProfile } from "./types";

const GOOGLE_JWKS_URL = "https://www.googleapis.com/oauth2/v3/certs";

const INSTAGRAM_AUTH_URL = "https://api.instagram.com/oauth/authorize";
const INSTAGRAM_TOKEN_URL = "https://api.instagram.com/oauth/access_token";
const INSTAGRAM_GRAPH_URL = "https://graph.instagram.com/me";

export { generateState as createOAuthState, generateCodeVerifier as createCodeVerifier };
export type { OAuthProvider, OAuthProfile };

export function isOAuthProvider(value: string): value is OAuthProvider {
  return (
    value === "google" ||
    value === "x" ||
    value === "instagram" ||
    value === "linkedin" ||
    value === "apple" ||
    value === "discord" ||
    value === "microsoft" ||
    value === "facebook"
  );
}

export function getGoogleClient(redirectUri: string) {
  return new Google(env.googleClientId, env.googleClientSecret, redirectUri);
}

export function getXClient(redirectUri: string) {
  return new Twitter(env.xClientId, env.xClientSecret, redirectUri);
}

export function getLinkedInClient(redirectUri: string) {
  return new LinkedIn(env.linkedinClientId, env.linkedinClientSecret, redirectUri);
}

export function getAppleClient(redirectUri: string) {
  const key = env.applePrivateKey;
  return new Apple(
    env.appleClientId,
    env.appleTeamId,
    env.appleKeyId,
    new TextEncoder().encode(key),
    redirectUri
  );
}

export function getDiscordClient(redirectUri: string) {
  return new Discord(env.discordClientId, env.discordClientSecret, redirectUri);
}

export function getMicrosoftClient(redirectUri: string) {
  return new MicrosoftEntraId(
    env.microsoftTenant,
    env.microsoftClientId,
    env.microsoftClientSecret,
    redirectUri
  );
}

export function getFacebookClient(redirectUri: string) {
  return new Facebook(env.facebookClientId, env.facebookClientSecret, redirectUri);
}

export function buildAuthorizeUrl(
  provider: OAuthProvider,
  redirectUri: string,
  state: string,
  codeVerifier: string
): URL {
  switch (provider) {
    case "google": {
      const client = getGoogleClient(redirectUri);
      return client.createAuthorizationURL(state, codeVerifier, [
        "openid",
        "email",
        "profile",
      ]);
    }
    case "x": {
      const client = getXClient(redirectUri);
      return client.createAuthorizationURL(state, codeVerifier, [
        "tweet.read",
        "users.read",
        "offline.access",
      ]);
    }
    case "linkedin": {
      const client = getLinkedInClient(redirectUri);
      return client.createAuthorizationURL(state, ["openid", "profile", "email"]);
    }
    case "apple": {
      const client = getAppleClient(redirectUri);
      return client.createAuthorizationURL(state, ["name", "email"]);
    }
    case "discord": {
      const client = getDiscordClient(redirectUri);
      return client.createAuthorizationURL(state, codeVerifier, [
        "identify",
        "email",
      ]);
    }
    case "microsoft": {
      const client = getMicrosoftClient(redirectUri);
      return client.createAuthorizationURL(state, codeVerifier, [
        "openid",
        "profile",
        "email",
        "User.Read",
      ]);
    }
    case "facebook": {
      const client = getFacebookClient(redirectUri);
      return client.createAuthorizationURL(state, ["email", "public_profile"]);
    }
    case "instagram": {
      const url = new URL(INSTAGRAM_AUTH_URL);
      url.searchParams.set("client_id", env.instagramClientId);
      url.searchParams.set("redirect_uri", redirectUri);
      url.searchParams.set("response_type", "code");
      url.searchParams.set("scope", "user_profile,user_media");
      url.searchParams.set("state", state);
      return url;
    }
  }
}

export async function fetchProfile(
  provider: OAuthProvider,
  code: string,
  redirectUri: string,
  codeVerifier: string
): Promise<OAuthProfile> {
  switch (provider) {
    case "google":
      return fetchGoogleProfile(code, redirectUri, codeVerifier);
    case "x":
      return fetchXProfile(code, redirectUri, codeVerifier);
    case "linkedin":
      return fetchLinkedInProfile(code, redirectUri);
    case "apple":
      return fetchAppleProfile(code, redirectUri);
    case "discord":
      return fetchDiscordProfile(code, redirectUri, codeVerifier);
    case "microsoft":
      return fetchMicrosoftProfile(code, redirectUri, codeVerifier);
    case "facebook":
      return fetchFacebookProfile(code, redirectUri);
    case "instagram":
      return fetchInstagramProfile(code, redirectUri);
  }
}

async function fetchGoogleProfile(
  code: string,
  redirectUri: string,
  codeVerifier: string
): Promise<OAuthProfile> {
  const client = getGoogleClient(redirectUri);
  const tokens = await client.validateAuthorizationCode(code, codeVerifier);
  const idToken = tokens.idToken();
  if (!idToken) {
    throw new Error("Google did not return an ID token");
  }

  const { payload } = await jose.jwtVerify(
    idToken,
    jose.createRemoteJWKSet(new URL(GOOGLE_JWKS_URL)),
    {
      issuer: "https://accounts.google.com",
      audience: env.googleClientId,
      algorithms: ["RS256"],
    }
  );

  const sub = payload.sub;
  if (!sub) {
    throw new Error("sub missing from Google ID token");
  }

  return {
    provider: "google",
    unionId: sub,
    email: (payload.email as string) ?? undefined,
    name: (payload.name as string) ?? undefined,
    avatar: (payload.picture as string) ?? undefined,
  };
}

async function fetchXProfile(
  code: string,
  redirectUri: string,
  codeVerifier: string
): Promise<OAuthProfile> {
  const client = getXClient(redirectUri);
  const tokens = await client.validateAuthorizationCode(code, codeVerifier);
  const accessToken = tokens.accessToken();

  const resp = await fetch(
    "https://api.twitter.com/2/users/me?user.fields=profile_image_url",
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`X userinfo failed (${resp.status}): ${text}`);
  }

  const json = (await resp.json()) as {
    data?: {
      id?: string;
      name?: string;
      username?: string;
      profile_image_url?: string;
    };
  };
  const user = json.data;
  if (!user?.id) {
    throw new Error("X userinfo did not return a user id");
  }

  return {
    provider: "x",
    unionId: user.id,
    name: user.name ?? user.username ?? undefined,
    avatar: user.profile_image_url ?? undefined,
  };
}

async function fetchLinkedInProfile(
  code: string,
  redirectUri: string
): Promise<OAuthProfile> {
  const client = getLinkedInClient(redirectUri);
  const tokens = await client.validateAuthorizationCode(code);
  const accessToken = tokens.accessToken();

  const resp = await fetch("https://api.linkedin.com/v2/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`LinkedIn userinfo failed (${resp.status}): ${text}`);
  }

  const user = (await resp.json()) as {
    sub?: string;
    email?: string;
    name?: string;
    picture?: string;
  };
  if (!user.sub) {
    throw new Error("LinkedIn userinfo did not return a sub");
  }

  return {
    provider: "linkedin",
    unionId: user.sub,
    email: user.email ?? undefined,
    name: user.name ?? undefined,
    avatar: user.picture ?? undefined,
  };
}

async function fetchAppleProfile(
  code: string,
  redirectUri: string
): Promise<OAuthProfile> {
  const client = getAppleClient(redirectUri);
  const tokens = await client.validateAuthorizationCode(code);
  const idToken = tokens.idToken();
  if (!idToken) {
    throw new Error("Apple did not return an ID token");
  }

  const { payload } = await jose.jwtVerify(idToken, jose.createRemoteJWKSet(new URL("https://appleid.apple.com/auth/keys")), {
    issuer: "https://appleid.apple.com",
    audience: env.appleClientId,
    algorithms: ["RS256"],
  });

  const sub = payload.sub;
  if (!sub) {
    throw new Error("sub missing from Apple ID token");
  }

  return {
    provider: "apple",
    unionId: sub,
    email: (payload.email as string) ?? undefined,
    name: (payload.name as string) ?? undefined,
  };
}

async function fetchDiscordProfile(
  code: string,
  redirectUri: string,
  codeVerifier: string
): Promise<OAuthProfile> {
  const client = getDiscordClient(redirectUri);
  const tokens = await client.validateAuthorizationCode(code, codeVerifier);
  const accessToken = tokens.accessToken();

  const resp = await fetch("https://discord.com/api/v10/users/@me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Discord userinfo failed (${resp.status}): ${text}`);
  }

  const user = (await resp.json()) as {
    id?: string;
    username?: string;
    email?: string;
    avatar?: string | null;
    discriminator?: string;
  };
  if (!user.id) {
    throw new Error("Discord userinfo did not return an id");
  }

  const avatar = user.avatar
    ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
    : undefined;
  const name = user.discriminator && user.discriminator !== "0"
    ? `${user.username}#${user.discriminator}`
    : user.username;

  return {
    provider: "discord",
    unionId: user.id,
    email: user.email ?? undefined,
    name: name ?? undefined,
    avatar,
  };
}

async function fetchMicrosoftProfile(
  code: string,
  redirectUri: string,
  codeVerifier: string
): Promise<OAuthProfile> {
  const client = getMicrosoftClient(redirectUri);
  const tokens = await client.validateAuthorizationCode(code, codeVerifier);
  const accessToken = tokens.accessToken();

  const resp = await fetch("https://graph.microsoft.com/v1.0/me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Microsoft userinfo failed (${resp.status}): ${text}`);
  }

  const user = (await resp.json()) as {
    id?: string;
    displayName?: string;
    mail?: string | null;
    userPrincipalName?: string | null;
  };
  if (!user.id) {
    throw new Error("Microsoft userinfo did not return an id");
  }

  return {
    provider: "microsoft",
    unionId: user.id,
    email: (user.mail ?? user.userPrincipalName) ?? undefined,
    name: user.displayName ?? undefined,
  };
}

async function fetchFacebookProfile(
  code: string,
  redirectUri: string
): Promise<OAuthProfile> {
  const client = getFacebookClient(redirectUri);
  const tokens = await client.validateAuthorizationCode(code);
  const accessToken = tokens.accessToken();

  const resp = await fetch(
    "https://graph.facebook.com/me?fields=id,name,email,picture",
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Facebook userinfo failed (${resp.status}): ${text}`);
  }

  const user = (await resp.json()) as {
    id?: string;
    name?: string;
    email?: string;
    picture?: { data?: { url?: string } };
  };
  if (!user.id) {
    throw new Error("Facebook userinfo did not return an id");
  }

  return {
    provider: "facebook",
    unionId: user.id,
    email: user.email ?? undefined,
    name: user.name ?? undefined,
    avatar: user.picture?.data?.url ?? undefined,
  };
}

async function fetchInstagramProfile(
  code: string,
  redirectUri: string
): Promise<OAuthProfile> {
  const tokenBody = new URLSearchParams({
    client_id: env.instagramClientId,
    client_secret: env.instagramClientSecret,
    grant_type: "authorization_code",
    redirect_uri: redirectUri,
    code,
  });

  const tokenResp = await fetch(INSTAGRAM_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: tokenBody.toString(),
  });
  if (!tokenResp.ok) {
    const text = await tokenResp.text();
    throw new Error(`Instagram token exchange failed (${tokenResp.status}): ${text}`);
  }

  const tokenJson = (await tokenResp.json()) as {
    access_token?: string;
    user_id?: number;
  };
  const accessToken = tokenJson.access_token;
  const userId = tokenJson.user_id;
  if (!accessToken || userId === undefined) {
    throw new Error("Instagram token response missing access_token or user_id");
  }

  const userResp = await fetch(
    `${INSTAGRAM_GRAPH_URL}?fields=id,username,account_type&access_token=${accessToken}`
  );
  if (!userResp.ok) {
    const text = await userResp.text();
    throw new Error(`Instagram userinfo failed (${userResp.status}): ${text}`);
  }

  const user = (await userResp.json()) as {
    id?: string;
    username?: string;
    account_type?: string;
  };
  if (!user.id) {
    throw new Error("Instagram userinfo did not return an id");
  }

  return {
    provider: "instagram",
    unionId: user.id,
    name: user.username ?? undefined,
  };
}
