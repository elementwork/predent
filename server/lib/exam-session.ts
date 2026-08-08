import * as jose from "jose";
import { env } from "./env";

const JWT_ALG = "HS256";
const ISSUER = "predent";
const AUDIENCE = "dat-mock-exam";
const MAX_QUESTIONS = 100;

export type ExamSession = {
  userId: number;
  questionIds: number[];
};

export async function signExamSession(session: ExamSession): Promise<string> {
  return new jose.SignJWT({
    kind: "dat_mock_exam",
    questionIds: session.questionIds,
  })
    .setProtectedHeader({ alg: JWT_ALG, typ: "JWT" })
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setSubject(String(session.userId))
    .setIssuedAt()
    .setExpirationTime("2 hours")
    .setJti(crypto.randomUUID())
    .sign(new TextEncoder().encode(env.appSecret));
}

export async function verifyExamSession(
  token: string,
  userId: number
): Promise<ExamSession | null> {
  try {
    const { payload } = await jose.jwtVerify(
      token,
      new TextEncoder().encode(env.appSecret),
      {
        algorithms: [JWT_ALG],
        issuer: ISSUER,
        audience: AUDIENCE,
        subject: String(userId),
      }
    );

    const questionIds = payload.questionIds;
    if (
      payload.kind !== "dat_mock_exam" ||
      !Array.isArray(questionIds) ||
      questionIds.length === 0 ||
      questionIds.length > MAX_QUESTIONS ||
      !questionIds.every(id => Number.isInteger(id) && Number(id) > 0) ||
      new Set(questionIds).size !== questionIds.length
    ) {
      return null;
    }

    return {
      userId,
      questionIds: questionIds.map(Number),
    };
  } catch {
    return null;
  }
}
