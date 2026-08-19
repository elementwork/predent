export const PREDENT_PAT_CATEGORIES = [
  "keyholes",
  "tfe",
  "angle_ranking",
  "hole_punching",
  "cube_counting",
  "pattern_folding",
] as const;

export type PredentPatCategory = (typeof PREDENT_PAT_CATEGORIES)[number];

export const PREDENT_PAT_DIFFICULTIES = [
  "beginner",
  "intermediate",
  "advanced",
  "elite",
] as const;

export type PredentPatDifficulty = (typeof PREDENT_PAT_DIFFICULTIES)[number];

export type ManipATCategory =
  | "aperture"
  | "view-recognition"
  | "angle"
  | "paper-folding"
  | "cube-counting"
  | "form-development";

export type DifficultyBand = 1 | 2 | 3 | 4 | 5;

export type PatPracticeMode =
  | "quick"
  | "category"
  | "timed"
  | "mixed"
  | "exam";

const TO_MANIPAT: Record<PredentPatCategory, ManipATCategory> = {
  keyholes: "aperture",
  tfe: "view-recognition",
  angle_ranking: "angle",
  hole_punching: "paper-folding",
  cube_counting: "cube-counting",
  pattern_folding: "form-development",
};

const FROM_MANIPAT: Record<ManipATCategory, PredentPatCategory> = {
  aperture: "keyholes",
  "view-recognition": "tfe",
  angle: "angle_ranking",
  "paper-folding": "hole_punching",
  "cube-counting": "cube_counting",
  "form-development": "pattern_folding",
};

const DIFFICULTY_BANDS: Record<
  PredentPatDifficulty,
  readonly [DifficultyBand, DifficultyBand]
> = {
  beginner: [1, 2],
  intermediate: [2, 3],
  advanced: [3, 4],
  elite: [4, 5],
};

export const toManipATCategory = (
  category: PredentPatCategory
): ManipATCategory => TO_MANIPAT[category];

export const fromManipATCategory = (
  category: ManipATCategory
): PredentPatCategory => FROM_MANIPAT[category];

export const difficultyBandFor = (
  difficulty: PredentPatDifficulty,
  position: number
): DifficultyBand => {
  const pair = DIFFICULTY_BANDS[difficulty];
  return pair[position % pair.length]!;
};

export const flashcardDifficultyBand = (
  difficulty: "easy" | "medium" | "hard"
): DifficultyBand =>
  difficulty === "easy" ? 2 : difficulty === "medium" ? 3 : 4;

export const effectiveQuestionCount = (
  mode: PatPracticeMode,
  requestedCount: number
): number => {
  if (mode === "quick") return 10;
  if (mode === "timed") return 15;
  if (mode === "exam") return 90;
  return requestedCount;
};

export const categoryPlan = (
  mode: PatPracticeMode,
  count: number,
  selectedCategory?: PredentPatCategory
): readonly PredentPatCategory[] => {
  if (mode === "exam") {
    return PREDENT_PAT_CATEGORIES.flatMap(category =>
      Array.from({ length: 15 }, () => category)
    );
  }

  if (mode === "category") {
    if (!selectedCategory) {
      throw new Error("A category is required for category drill mode");
    }
    return Array.from({ length: count }, () => selectedCategory);
  }

  return Array.from(
    { length: count },
    (_, index) =>
      PREDENT_PAT_CATEGORIES[index % PREDENT_PAT_CATEGORIES.length]!
  );
};
