import type { PRNG } from "./prng";

export interface AngleRankingProblem {
  /** Four angles in display order (labels 1..4 follow this order). */
  angles: number[];
  sorted: number[];
  /** Permutation strings like "2-1-4-3"; the correct one orders labels smallest to largest. */
  options: string[];
  correctIndex: number;
}

export const ANGLE_RANKING_OPTION_COUNT = 4;

const SEPARATION: Record<string, number> = {
  easy: 9,
  medium: 6,
  hard: 3,
};

const RANGES: Record<string, [number, number]> = {
  easy: [15, 70],
  medium: [10, 80],
  hard: [5, 88],
};

function join(labels: number[]): string {
  return labels.join("-");
}

export function generateAngleRankingProblem(
  random: PRNG,
  difficulty: "easy" | "medium" | "hard"
): AngleRankingProblem {
  const [min, max] = RANGES[difficulty]!;
  const separation = SEPARATION[difficulty]!;

  const angles: number[] = [];
  let attempts = 0;
  while (angles.length < 4 && attempts++ < 500) {
    const value = Math.floor(random() * (max - min + 1)) + min;
    if (angles.every(a => Math.abs(a - value) >= separation)) {
      angles.push(value);
    }
  }
  if (angles.length < 4) {
    // Fallback: evenly spaced values.
    angles.length = 0;
    for (let i = 0; i < 4; i++) {
      angles.push(min + Math.floor(((max - min) * i) / 4));
    }
  }

  // Display order shuffle, labels 1..4 in that order.
  for (let i = angles.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [angles[i], angles[j]] = [angles[j]!, angles[i]!];
  }
  const sorted = [...angles].sort((a, b) => a - b);

  const order = angles
    .map((angle, i) => ({ angle, label: i + 1 }))
    .sort((p, q) => p.angle - q.angle)
    .map(p => p.label);

  const correctStr = join(order);
  const reversed = join([...order].reverse());
  const swapAdjacent = (i: number) => {
    const arr = [...order];
    [arr[i], arr[i + 1]] = [arr[i + 1]!, arr[i]!];
    return join(arr);
  };

  const candidates = [
    reversed,
    swapAdjacent(0),
    swapAdjacent(1),
    swapAdjacent(2),
  ].filter(s => s !== correctStr && s !== reversed && s !== swapAdjacent(0));

  const seen = new Set<string>([correctStr]);
  const distractors: string[] = [];
  for (const c of candidates) {
    if (!seen.has(c)) {
      seen.add(c);
      distractors.push(c);
    }
    if (distractors.length >= ANGLE_RANKING_OPTION_COUNT - 1) break;
  }
  // Fallback: build a deterministic distinct permutation.
  let fallback = 1;
  while (distractors.length < ANGLE_RANKING_OPTION_COUNT - 1) {
    const arr = [...order];
    const i = fallback % 4;
    const j = (fallback * 2 + 1) % 4;
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
    const s = join(arr);
    if (!seen.has(s)) {
      seen.add(s);
      distractors.push(s);
    }
    fallback++;
  }

  const options = [correctStr, ...distractors];
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [options[i], options[j]] = [options[j]!, options[i]!];
  }
  const correctIndex = options.indexOf(correctStr);

  return { angles, sorted, options, correctIndex };
}