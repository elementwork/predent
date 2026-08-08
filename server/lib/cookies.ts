import type { CookieOptions } from "hono/utils/cookie";
import { Session } from "@contracts/constants";
import { env } from "./env";

function isLocalhost(headers: Headers): boolean {
  const host = headers.get("host") || "";
  return host.startsWith("localhost:") || host.startsWith("127.0.0.1:");
}

export function getSessionCookieOptions(headers: Headers): CookieOptions {
  const localhost = isLocalhost(headers);

  return {
    httpOnly: true,
    path: "/",
    sameSite: "Lax",
    secure: !localhost,
  };
}

export function getSessionCookieName(): string {
  return env.isProduction ? Session.productionCookieName : Session.cookieName;
}
