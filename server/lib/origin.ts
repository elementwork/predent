import { env } from "./env";

export function parsePublicAppOrigin(value: string): string {
  const url = new URL(value);
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("PUBLIC_APP_URL must use http or https");
  }
  if (
    url.pathname !== "/" ||
    url.search.length > 0 ||
    url.hash.length > 0 ||
    url.username.length > 0 ||
    url.password.length > 0
  ) {
    throw new Error("PUBLIC_APP_URL must contain only an origin");
  }
  if (env.isProduction && url.protocol !== "https:") {
    throw new Error("PUBLIC_APP_URL must use https in production");
  }
  return url.origin;
}

export function getPublicAppOrigin(requestUrl?: string): string {
  if (env.publicAppUrl) return parsePublicAppOrigin(env.publicAppUrl);
  if (env.isProduction) {
    throw new Error("PUBLIC_APP_URL is required in production");
  }
  if (!requestUrl) return "http://localhost:3000";
  return new URL(requestUrl).origin;
}

export function isTrustedRequestOrigin(input: {
  origin: string | undefined;
  requestUrl: string;
}): boolean {
  if (!input.origin) return !env.isProduction;
  try {
    return new URL(input.origin).origin === getPublicAppOrigin(input.requestUrl);
  } catch {
    return false;
  }
}
