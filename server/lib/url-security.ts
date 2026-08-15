import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { env } from "./env";

const DEFAULT_PUSH_HOSTS = [
  "fcm.googleapis.com",
  "updates.push.services.mozilla.com",
  "web.push.apple.com",
  ".push.apple.com",
  ".notify.windows.com",
];

function isPrivateAddress(address: string) {
  const normalized = address.toLowerCase().split("%")[0];
  if (isIP(normalized) === 4) {
    const [a, b] = normalized.split(".").map(Number);
    return (
      a === 0 ||
      a === 10 ||
      a === 127 ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      a >= 224
    );
  }
  if (isIP(normalized) === 6) {
    return (
      normalized === "::" ||
      normalized === "::1" ||
      normalized.startsWith("fc") ||
      normalized.startsWith("fd") ||
      normalized.startsWith("fe8") ||
      normalized.startsWith("fe9") ||
      normalized.startsWith("fea") ||
      normalized.startsWith("feb") ||
      normalized.startsWith("::ffff:127.") ||
      normalized.startsWith("::ffff:10.") ||
      normalized.startsWith("::ffff:192.168.")
    );
  }
  return true;
}

function hostAllowed(hostname: string) {
  const configured = env.pushEndpointAllowedHosts;
  const allowed = configured.length ? configured : DEFAULT_PUSH_HOSTS;
  return allowed.some(rule =>
    rule.startsWith(".")
      ? hostname.endsWith(rule) && hostname.length > rule.length
      : hostname === rule
  );
}

export async function assertSafePushEndpoint(
  endpoint: string,
  resolve: (
    hostname: string,
    options: { all: true; verbatim: true }
  ) => Promise<Array<{ address: string; family: number }>> = lookup
) {
  const url = new URL(endpoint);
  const hostname = url.hostname.toLowerCase();
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    url.port ||
    !hostAllowed(hostname)
  ) {
    throw new Error("Push endpoint host is not approved");
  }
  const results = await resolve(hostname, { all: true, verbatim: true });
  if (
    results.length === 0 ||
    results.some(result => isPrivateAddress(result.address))
  ) {
    throw new Error("Push endpoint resolves to a non-public address");
  }
}

export const pushEndpointDefaults = DEFAULT_PUSH_HOSTS;
