import { useRef } from "react";
import { trpc } from "@/providers/trpc";

const DIFFICULTY_MAP: Record<
  string,
  "beginner" | "intermediate" | "advanced" | "elite"
> = {
  easy: "beginner",
  medium: "intermediate",
  hard: "advanced",
};

const CATEGORY_MAP: Record<
  string,
  | "keyholes"
  | "tfe"
  | "angle_ranking"
  | "hole_punching"
  | "cube_counting"
  | "pattern_folding"
> = {
  keyholes: "keyholes",
  tfe: "tfe",
  angle_ranking: "angle_ranking",
  hole_punching: "hole_punching",
  cube_counting: "cube_counting",
  pattern_folding: "pattern_folding",
};

export function useRecordPATAttempt() {
  const startRef = useRef<number>(0);
  const utils = trpc.useUtils();
  const record = trpc.pat.recordAttempt.useMutation({
    onSuccess: () => utils.pat.getAnalytics.invalidate(),
  });

  const start = () => {
    startRef.current = Date.now();
  };

  const recordAttempt = (
    category: string,
    difficulty: string,
    questionIdOrSeed: string | number,
    userAnswer: number,
    sessionId: string
  ) => {
    const mappedCategory = CATEGORY_MAP[category];
    const mappedDifficulty = DIFFICULTY_MAP[difficulty];
    if (!mappedCategory || !mappedDifficulty) return;

    const payload: {
      category: typeof mappedCategory;
      difficulty: typeof mappedDifficulty;
      userAnswer: number;
      timeSpent: number;
      sessionId: string;
      questionId?: string;
      seed?: number;
    } = {
      category: mappedCategory,
      difficulty: mappedDifficulty,
      userAnswer,
      timeSpent: Math.round((Date.now() - startRef.current) / 1000),
      sessionId,
    };

    if (typeof questionIdOrSeed === "number") {
      payload.seed = questionIdOrSeed;
    } else {
      payload.questionId = questionIdOrSeed;
    }

    record.mutate(payload);
  };

  return { start, recordAttempt };
}
