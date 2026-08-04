import type { PRNG } from "@/lib/prng";
import type { CubeCoord } from "./keyholes";

export interface CubeCountingProblem {
  cubes: CubeCoord[];
  painted: Record<number, number>;
  /** Number of painted faces the stem asks about. */
  targetN: number;
  answer: number;
  choices: number[];
}

export const CUBE_COUNTING_OPTION_COUNT = 5;

function generateCubes(
  random: PRNG,
  difficulty: "easy" | "medium" | "hard"
): CubeCoord[] {
  const size = difficulty === "easy" ? 3 : difficulty === "medium" ? 4 : 5;
  const maxHeight =
    difficulty === "easy" ? 2 : difficulty === "medium" ? 3 : 4;
  const cubes: CubeCoord[] = [];
  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) {
      const height = Math.floor(random() * maxHeight) + 1;
      for (let z = 0; z < height; z++) {
        cubes.push({ x, y, z });
      }
    }
  }
  if (cubes.length < 5) {
    return generateCubes(random, difficulty);
  }
  return cubes;
}

function countPaintedFaces(cubes: CubeCoord[]): Record<number, number> {
  const cubeSet = new Set(cubes.map(c => `${c.x},${c.y},${c.z}`));
  const counts: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  for (const c of cubes) {
    let exposed = 0;
    const neighbors = [
      { x: c.x + 1, y: c.y, z: c.z },
      { x: c.x - 1, y: c.y, z: c.z },
      { x: c.x, y: c.y + 1, z: c.z },
      { x: c.x, y: c.y - 1, z: c.z },
      { x: c.x, y: c.y, z: c.z + 1 },
      { x: c.x, y: c.y, z: c.z - 1 },
    ];
    for (const n of neighbors) {
      if (!cubeSet.has(`${n.x},${n.y},${n.z}`)) exposed++;
    }
    counts[exposed]++;
  }
  return counts;
}

export function generateCubeCountingProblem(
  random: PRNG,
  difficulty: "easy" | "medium" | "hard"
): CubeCountingProblem {
  const cubes = generateCubes(random, difficulty);
  const painted = countPaintedFaces(cubes);

  // The stem asks for a count that is actually present (never zero).
  const valid = [2, 3, 1, 4].filter(n => (painted[n] ?? 0) > 0);
  const targetN = valid[Math.floor(random() * valid.length)] ?? 1;
  const answer = painted[targetN]!;

  const candidates = new Set<number>();
  candidates.add(answer);
  for (const offset of [1, -1, 2, -2]) {
    if (answer + offset >= 1) candidates.add(answer + offset);
  }
  // Add counts of neighbouring N values (never zero), then pad with small integers.
  for (const n of [targetN - 1, targetN + 1, targetN - 2, targetN + 2]) {
    if (n >= 1 && n <= 5 && (painted[n] ?? 0) > 0) {
      candidates.add(painted[n]!);
    }
  }
  let next = 1;
  while (candidates.size < CUBE_COUNTING_OPTION_COUNT) {
    if (next !== answer && next >= 1) candidates.add(next);
    next++;
  }

  // Exactly five choices, always including the correct answer.
  const others = [...candidates].filter(c => c !== answer).slice(0, CUBE_COUNTING_OPTION_COUNT - 1);
  const choices = [...others, answer];

  // Deterministic shuffle with the PRNG.
  for (let i = choices.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [choices[i], choices[j]] = [choices[j]!, choices[i]!];
  }

  return { cubes, painted, targetN, answer, choices };
}