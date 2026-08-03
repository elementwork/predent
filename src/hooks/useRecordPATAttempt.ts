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
    seed: number,
    userAnswer: number,
    sessionId: string
  ) => {
    const mappedCategory = CATEGORY_MAP[category];
    const mappedDifficulty = DIFFICULTY_MAP[difficulty];
    if (!mappedCategory || !mappedDifficulty) return;

    record.mutate({
      category: mappedCategory,
      difficulty: mappedDifficulty,
      seed,
      userAnswer,
      timeSpent: Math.round((Date.now() - startRef.current) / 1000),
      sessionId,
    });
  };

  return { start, recordAttempt };
}
