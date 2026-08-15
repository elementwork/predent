import { decodeJwt, SignJWT } from "jose";
import { describe, expect, it } from "vitest";
import { signSessionToken, verifySessionToken } from "./session";

const payload = {
  unionId: "oauth-subject",
  provider: "google" as const,
  tokenVersion: 3,
};

describe("session tokens", () => {
  it("uses bounded issuer, audience, JTI, and expiry claims", async () => {
    const token = await signSessionToken(payload);
    const claims = decodeJwt(token);

    expect(claims.iss).toBe("predent-canada");
    expect(claims.aud).toBe("predent-web");
    expect(claims.jti).toEqual(expect.any(String));
    expect((claims.exp ?? 0) - (claims.iat ?? 0)).toBe(30 * 24 * 60 * 60);
    await expect(verifySessionToken(token)).resolves.toEqual(payload);
  });

  it("rejects a token without the required claims", async () => {
    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("30 days")
      .sign(new TextEncoder().encode(process.env.APP_SECRET));
    await expect(verifySessionToken(token)).resolves.toBeNull();
  });

  it("accepts a named previous key during a rotation window", async () => {
    const previousSecret = "previous-session-secret-at-least-32-characters";
    process.env.SESSION_PREVIOUS_SECRETS = JSON.stringify({
      old: previousSecret,
    });
    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256", kid: "old" })
      .setIssuedAt()
      .setIssuer("predent-canada")
      .setAudience("predent-web")
      .setJti(crypto.randomUUID())
      .setExpirationTime("30 days")
      .sign(new TextEncoder().encode(previousSecret));

    await expect(verifySessionToken(token)).resolves.toEqual(payload);
    delete process.env.SESSION_PREVIOUS_SECRETS;
  });
});
