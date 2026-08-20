import { randomUUID } from "node:crypto";
import {
  categoryPlan,
  difficultyBandFor,
  effectiveQuestionCount,
  toManipATCategory,
  type PatPracticeMode,
  type PredentPatCategory,
  type PredentPatDifficulty,
} from "./categories";
import {
  getPatRuntime,
  type PatRuntimeInfo,
  type PrivatePatQuestionRecord,
  type PublicPatQuestion,
} from "./runtime";

export interface CreatePatSessionRequest {
  readonly userId: number;
  readonly mode: PatPracticeMode;
  readonly category?: PredentPatCategory;
  readonly difficulty: PredentPatDifficulty;
  readonly requestedCount: number;
  readonly timeLimit: boolean;
}

export interface GeneratedPatSessionQuestion {
  readonly instanceId: string;
  readonly category: PredentPatCategory;
  readonly difficulty: PredentPatDifficulty;
  readonly publicQuestion: PublicPatQuestion;
  readonly privateRecord: PrivatePatQuestionRecord;
}

export interface GeneratedPatSession {
  readonly sessionId: string;
  readonly questionCount: number;
  readonly sessionTimeLimitSeconds: number | null;
  readonly engineInfo: PatRuntimeInfo;
  readonly questions: readonly GeneratedPatSessionQuestion[];
}

export const sessionTimeLimitSeconds = (
  mode: PatPracticeMode,
  count: number,
  enabled: boolean
): number | null => {
  if (mode === "exam") return 60 * 60;
  if (!enabled) return null;
  if (mode === "timed") return 15 * 60;
  return count * 40;
};

export const generatePatSession = async (
  request: CreatePatSessionRequest
): Promise<GeneratedPatSession> => {
  const count = effectiveQuestionCount(request.mode, request.requestedCount);
  const plan = categoryPlan(request.mode, count, request.category);
  const runtime = await getPatRuntime();
  const sessionId = randomUUID();
  const questions: GeneratedPatSessionQuestion[] = [];

  let position = 0;
  while (position < plan.length) {
    const category = plan[position]!;
    const difficultyBand = difficultyBandFor(request.difficulty, position);
    const seed = `predent:${request.userId}:${sessionId}:${position}`;
    const type = toManipATCategory(category);

    if (category === "cube_counting") {
      let runLength = 1;
      while (
        runLength < 3 &&
        position + runLength < plan.length &&
        plan[position + runLength] === category
      ) {
        runLength += 1;
      }

      const generated = await runtime.generateCandidateGroup(
        { type, seed, difficulty: difficultyBand },
        runLength
      );
      if (generated.length === 0) {
        throw new Error("ManipAT returned no cube-counting questions");
      }

      for (const item of generated.slice(0, runLength)) {
        questions.push({
          instanceId: randomUUID(),
          category,
          difficulty: request.difficulty,
          publicQuestion: item.publicQuestion,
          privateRecord: item.privateRecord,
        });
      }
      position += Math.min(generated.length, runLength);
      continue;
    }

    const generated = await runtime.generateQuestion({
      type,
      seed,
      difficulty: difficultyBand,
    });
    questions.push({
      instanceId: randomUUID(),
      category,
      difficulty: request.difficulty,
      publicQuestion: generated.publicQuestion,
      privateRecord: generated.privateRecord,
    });
    position += 1;
  }

  if (questions.length !== count) {
    throw new Error(
      `ManipAT generated ${questions.length} questions for a ${count}-question session`
    );
  }

  return {
    sessionId,
    questionCount: count,
    sessionTimeLimitSeconds: sessionTimeLimitSeconds(
      request.mode,
      count,
      request.timeLimit
    ),
    engineInfo: runtime.getEngineInfo(),
    questions,
  };
};
