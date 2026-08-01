import type { PRNG } from "@/lib/prng";

export interface AngleRankingProblem {
  angles: number[];
  sorted: number[];
  correctIndex: number;
}

export function generateAngleRankingProblem(
  random: PRNG,
  difficulty: "easy" | "medium" | "hard"
): AngleRankingProblem {
  const ranges: Record<string, [number, number]> = {
    easy: [25, 70],
    medium: [15, 75],
    hard: [10, 80],
  };
  const [min, max] = ranges[difficulty]!;
  const separation = difficulty === "easy" ? 12 : difficulty === "medium" ? 7 : 4;

  const angles: number[] = [];
  while (angles.length < 4) {
    const angle = Math.floor(random() * (max - min + 1)) + min;
    const tooClose = angles.some(a => Math.abs(a - angle) < separation);
    if (!tooClose) angles.push(angle);
  }

  // Deterministic shuffle using Fisher-Yates with the PRNG
  const shuffled = [...angles];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
  }

  const sorted = [...shuffled].sort((a, b) => a - b);
  // The correct answer is the index of the smallest angle in the shuffled array
  const smallest = sorted[0]!;
  const correctIndex = shuffled.indexOf(smallest);

  return { angles: shuffled, sorted, correctIndex };
}
