import * as jose from "jose";
import { env } from "../lib/env";
import type { SessionPayload } from "./types";

const JWT_ALG = "HS256";
const JWT_ISSUER = "predent-canada";
const JWT_AUDIENCE = "predent-web";

export async function signSessionToken(
  payload: SessionPayload
): Promise<string> {
  const secret = new TextEncoder().encode(env.appSecret);
  return new jose.SignJWT(payload)
    .setProtectedHeader({ alg: JWT_ALG })
    .setIssuedAt()
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .setJti(crypto.randomUUID())
    .setExpirationTime("30 days")
    .sign(secret);
}

export async function verifySessionToken(
  token: string
): Promise<SessionPayload | null> {
  if (!token) {
    console.warn("[session] No token provided for verification.");
    return null;
  }
  try {
    const secret = new TextEncoder().encode(env.appSecret);
    const { payload } = await jose.jwtVerify(token, secret, {
      algorithms: [JWT_ALG],
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
      maxTokenAge: "30 days",
      clockTolerance: 5,
    });
    const { unionId, provider, tokenVersion } = payload;
    if (!unionId || !provider || tokenVersion === undefined || !payload.jti) {
      console.warn("[session] JWT payload missing required fields.");
      return null;
    }
    return {
      unionId: unionId as string,
      provider: provider as SessionPayload["provider"],
      tokenVersion: Number(tokenVersion),
    };
  } catch (error) {
    console.warn("[session] JWT verification failed:", error);
    return null;
  }
}
