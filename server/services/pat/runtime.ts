import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";
import { env } from "../../lib/env";
import {
  createPatRuntime,
  type PatRuntime,
  type PrivatePatQuestionRecord,
  type PublicPatQuestion,
  type PatSolutionPayload,
  type PatRuntimeInfo,
} from "../../../vendor/manipat/runtime/dist/index.js";
import type {
  PredentPatCategory,
  PredentPatDifficulty,
} from "./categories";

const TOKEN_VERSION = "v1";
const TOKEN_AAD = Buffer.from("predent:pat-instance:v1", "utf8");
const TOKEN_TTL_MS = 6 * 60 * 60 * 1000;
const TEST_SECRET = "predent-test-secret-do-not-use-in-production";

let runtimePromise: Promise<PatRuntime> | undefined;

export interface PatInstanceClaims {
  readonly userId: number;
  readonly sessionId: string;
  readonly category: PredentPatCategory;
  readonly difficulty: PredentPatDifficulty;
  readonly issuedAt: number;
  readonly expiresAt: number;
  readonly privateRecord: PrivatePatQuestionRecord;
}

export interface IssuedPatQuestion {
  readonly instanceId: string;
  readonly publicQuestion: PublicPatQuestion;
}

export type {
  PatRuntimeInfo,
  PatSolutionPayload,
  PrivatePatQuestionRecord,
  PublicPatQuestion,
};

export const getPatRuntime = (): Promise<PatRuntime> => {
  runtimePromise ??= createPatRuntime();
  return runtimePromise;
};

const tokenKey = (): Buffer => {
  const secret = env.appSecret || TEST_SECRET;
  return createHash("sha256")
    .update("predent:pat-instance-key:")
    .update(secret)
    .digest();
};

const encode = (value: Buffer): string => value.toString("base64url");
const decode = (value: string): Buffer => Buffer.from(value, "base64url");

export const sealPatInstance = (
  claims: Omit<PatInstanceClaims, "issuedAt" | "expiresAt">
): string => {
  const now = Date.now();
  const payload: PatInstanceClaims = {
    ...claims,
    issuedAt: now,
    expiresAt: now + TOKEN_TTL_MS,
  };

  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", tokenKey(), iv);
  cipher.setAAD(TOKEN_AAD);
  const ciphertext = Buffer.concat([
    cipher.update(JSON.stringify(payload), "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return [TOKEN_VERSION, encode(iv), encode(tag), encode(ciphertext)].join(".");
};

export const openPatInstance = (
  token: string,
  expected: { readonly userId: number; readonly sessionId: string }
): PatInstanceClaims => {
  const parts = token.split(".");
  if (parts.length !== 4 || parts[0] !== TOKEN_VERSION) {
    throw new Error("Invalid PAT question instance");
  }

  const [, ivPart, tagPart, ciphertextPart] = parts;
  if (!ivPart || !tagPart || !ciphertextPart) {
    throw new Error("Invalid PAT question instance");
  }

  try {
    const iv = decode(ivPart);
    const tag = decode(tagPart);
    const ciphertext = decode(ciphertextPart);
    const decipher = createDecipheriv("aes-256-gcm", tokenKey(), iv);
    decipher.setAAD(TOKEN_AAD);
    decipher.setAuthTag(tag);
    const plaintext = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ]).toString("utf8");
    const claims = JSON.parse(plaintext) as PatInstanceClaims;

    const userMatches =
      Buffer.byteLength(String(claims.userId)) ===
        Buffer.byteLength(String(expected.userId)) &&
      timingSafeEqual(
        Buffer.from(String(claims.userId)),
        Buffer.from(String(expected.userId))
      );
    const sessionMatches =
      Buffer.byteLength(claims.sessionId) ===
        Buffer.byteLength(expected.sessionId) &&
      timingSafeEqual(
        Buffer.from(claims.sessionId),
        Buffer.from(expected.sessionId)
      );

    if (!userMatches || !sessionMatches) {
      throw new Error("PAT question instance does not belong to this session");
    }
    if (!Number.isFinite(claims.expiresAt) || claims.expiresAt < Date.now()) {
      throw new Error("PAT question instance has expired");
    }
    return claims;
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message.includes("does not belong") ||
        error.message.includes("expired"))
    ) {
      throw error;
    }
    throw new Error("Invalid PAT question instance");
  }
};
