import { createPRNG } from "@/lib/prng";
import {
  generateKeyholesProblem,
  type KeyholesProblem,
} from "./keyholes";
import { generateTFEProblem, type TFEProblem } from "./tfe";
import {
  generateAngleRankingProblem,
  type AngleRankingProblem,
} from "./angle-ranking";
import {
  generateHolePunchingProblem,
  type HolePunchingProblem,
} from "./hole-punching";
import {
  generateCubeCountingProblem,
  type CubeCountingProblem,
} from "./cube-counting";
import {
  generatePatternFoldingProblem,
  type PatternFoldingProblem,
} from "./pattern-folding";

export type Difficulty = "easy" | "medium" | "hard";

export type PatCategory =
  | "keyholes"
  | "tfe"
  | "angle_ranking"
  | "hole_punching"
  | "cube_counting"
  | "pattern_folding";

export interface GeneratorConfig {
  seed: number;
  difficulty: Difficulty;
}

export type ProblemData =
  | KeyholesProblem
  | TFEProblem
  | AngleRankingProblem
  | HolePunchingProblem
  | CubeCountingProblem
  | PatternFoldingProblem;

export interface GeneratedQuestion {
  id: string;
  seed: number;
  category: PatCategory;
  difficulty: Difficulty;
  problem: ProblemData;
  timeTarget: number;
}

export type { KeyholesProblem, TFEProblem, AngleRankingProblem, HolePunchingProblem, CubeCountingProblem, PatternFoldingProblem };

const TIME_TARGETS: Record<PatCategory, Record<Difficulty, number>> = {
  keyholes: { easy: 45, medium: 60, hard: 90 },
  tfe: { easy: 45, medium: 60, hard: 90 },
  angle_ranking: { easy: 20, medium: 30, hard: 40 },
  hole_punching: { easy: 45, medium: 60, hard: 90 },
  cube_counting: { easy: 30, medium: 45, hard: 60 },
  pattern_folding: { easy: 30, medium: 45, hard: 60 },
};

export function generateProblem(
  category: PatCategory,
  config: GeneratorConfig
): ProblemData {
  const random = createPRNG(config.seed);

  switch (category) {
    case "keyholes":
      return generateKeyholesProblem(random, config.difficulty);
    case "tfe":
      return generateTFEProblem(random, config.difficulty);
    case "angle_ranking":
      return generateAngleRankingProblem(random, config.difficulty);
    case "hole_punching":
      return generateHolePunchingProblem(random, config.difficulty);
    case "cube_counting":
      return generateCubeCountingProblem(random, config.difficulty);
    case "pattern_folding":
      return generatePatternFoldingProblem(random, config.difficulty);
  }
}

export function generateQuestion(
  category: PatCategory,
  config: GeneratorConfig
): GeneratedQuestion {
  return {
    id: `gen-${config.seed}`,
    seed: config.seed,
    category,
    difficulty: config.difficulty,
    problem: generateProblem(category, config),
    timeTarget: TIME_TARGETS[category][config.difficulty],
  };
}

export function generateQuestions(
  category: PatCategory | "mixed",
  difficulty: Difficulty,
  count: number
): GeneratedQuestion[] {
  const categories: PatCategory[] =
    category === "mixed"
      ? ["keyholes", "tfe", "angle_ranking", "hole_punching", "cube_counting", "pattern_folding"]
      : [category];

  const questions: GeneratedQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const cat = categories[i % categories.length]!;
    const seed = Math.floor(Math.random() * 2_147_483_647);
    questions.push(generateQuestion(cat, { seed, difficulty }));
  }
  return questions;
}

/**
 * Server-side: re-derive the correct answer from a seed.
 * Used by recordAttempt to avoid client-side answer leaking.
 */
export function getCorrectAnswer(
  category: PatCategory,
  config: GeneratorConfig
): number {
  const problem = generateProblem(category, config);

  switch (category) {
    case "keyholes":
    case "tfe":
    case "hole_punching":
    case "pattern_folding":
      return (problem as KeyholesProblem | TFEProblem | HolePunchingProblem | PatternFoldingProblem).correctIndex;
    case "angle_ranking": {
      const p = problem as AngleRankingProblem;
      return p.correctIndex;
    }
    case "cube_counting": {
      const p = problem as CubeCountingProblem;
      return p.choices.indexOf(p.answer);
    }
    default:
      return 0;
  }
}
