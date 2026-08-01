import type { PRNG } from "@/lib/prng";

const SYMBOLS = ["●", "■", "▲", "★", "♦", "○"];

export interface PatternFoldingProblem {
  symbols: string[];
  options: string[][];
  correctIndex: number;
}

function generateSymbols(
  random: PRNG,
  difficulty: "easy" | "medium" | "hard"
): string[] {
  const count = difficulty === "easy" ? 4 : difficulty === "medium" ? 5 : 6;
  // Deterministic shuffle using PRNG
  const pool = [...SYMBOLS];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [pool[i], pool[j]] = [pool[j]!, pool[i]!];
  }
  return Array.from({ length: 6 }, (_, i) => (i < count ? pool[i]! : ""));
}

function generateCorrectMapping(symbols: string[]): string[] {
  return [...symbols];
}

function generateDistractorMappings(symbols: string[]): string[][] {
  const correct = generateCorrectMapping(symbols);
  return [
    [correct[0]!, correct[4]!, correct[2]!, correct[3]!, correct[1]!, correct[5]!],
    [correct[1]!, correct[0]!, correct[2]!, correct[3]!, correct[4]!, correct[5]!],
    [correct[2]!, correct[1]!, correct[0]!, correct[3]!, correct[4]!, correct[5]!],
  ];
}

function shuffleOptions(
  correctMapping: string[],
  symbols: string[]
): { options: string[][]; correctIndex: number } {
  const distractors = generateDistractorMappings(symbols);
  const tagged = [
    { mapping: correctMapping, isCorrect: true },
    ...distractors.map(d => ({ mapping: d, isCorrect: false })),
  ];
  const seed = symbols.reduce((acc, s) => acc + s.charCodeAt(0), 1);
  for (let i = tagged.length - 1; i > 0; i--) {
    const j = (seed * (i + 1)) % (i + 1);
    [tagged[i], tagged[j]] = [tagged[j]!, tagged[i]!];
  }
  const options = tagged.map(t => t.mapping);
  const correctIndex = tagged.findIndex(t => t.isCorrect);
  return { options, correctIndex };
}

export function generatePatternFoldingProblem(
  random: PRNG,
  difficulty: "easy" | "medium" | "hard"
): PatternFoldingProblem {
  const symbols = generateSymbols(random, difficulty);
  const correctMapping = generateCorrectMapping(symbols);
  const { options, correctIndex } = shuffleOptions(correctMapping, symbols);
  return { symbols, options, correctIndex };
}
