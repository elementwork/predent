export type QuestionCategory =
  | "keyholes"
  | "tfe"
  | "angle_ranking"
  | "hole_punching"
  | "cube_counting"
  | "pattern_folding";

export type Difficulty = "easy" | "medium" | "hard";

export type OutputFormat = "html" | "json" | "both";

export type TemplateStyle = "modern" | "classic" | "minimal";

export type ExplanationDepth = "brief" | "detailed" | "full";

export interface CLIOptions {
  count: number;
  categories: QuestionCategory[] | "all";
  difficulty: string;
  format: OutputFormat;
  output: string;
  seed?: number;
  validate: boolean;
  template: TemplateStyle;
  split: boolean;
  perFile: number;
  explanations: boolean;
  explanationDepth: ExplanationDepth;
  print: boolean;
  pageSize: string;
  pageNumbers: boolean;
  answerKey: boolean;
  quiet: boolean;
}

export interface ConvertOptions {
  input: string;
  output: string;
  template: TemplateStyle;
  split: boolean;
  perFile: number;
  filterCategories: string;
  filterDifficulty: string;
  pageTitle: string;
  explanations: boolean;
  showAnswers: boolean;
  print: boolean;
}

export interface ValidateOptions {
  input: string;
  fix: boolean;
  report: boolean;
}

export interface StatsOptions {
  input: string;
  breakdown: boolean;
  distribution: boolean;
}

export interface BenchmarkOptions {
  iterations: number;
  categories: QuestionCategory[] | "all";
  difficulty: Difficulty;
}

export interface GeneratedQuestion {
  id: string;
  category: QuestionCategory;
  difficulty: Difficulty;
  seed: number;
  correctIndex: number;
  timeTarget: number;
  options: string[];
  metadata: Record<string, unknown>;
  explanation?: {
    summary: string;
    correct: string;
    distractors?: string[];
    concepts?: string[];
    tips?: string[];
  };
}

export interface GenerationResult {
  version: string;
  generatedAt: string;
  generator: string;
  seed: number;
  stats: {
    total: number;
    byCategory: Record<QuestionCategory, number>;
    byDifficulty: Record<Difficulty, number>;
  };
  questions: GeneratedQuestion[];
}

export const ALL_CATEGORIES: QuestionCategory[] = [
  "keyholes",
  "tfe",
  "angle_ranking",
  "hole_punching",
  "cube_counting",
  "pattern_folding",
];

export const CATEGORY_DESCRIPTIONS: Record<QuestionCategory, string> = {
  keyholes: "3D object rotation and silhouette matching",
  tfe: "Top-Front-End view relationships",
  angle_ranking: "Compare and rank angles",
  hole_punching: "Paper folding and hole punching",
  cube_counting: "Count exposed faces on cube stacks",
  pattern_folding: "2D net to 3D cube folding",
};
