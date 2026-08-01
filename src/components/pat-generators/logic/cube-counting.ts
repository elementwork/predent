import type { PRNG } from "@/lib/prng";
import type { CubeCoord } from "../shared/IsoCube";

export interface CubeCountingProblem {
  cubes: CubeCoord[];
  painted: Record<number, number>;
  answer: number;
  choices: number[];
}

function generateCubes(
  random: PRNG,
  difficulty: "easy" | "medium" | "hard"
): CubeCoord[] {
  const size = difficulty === "easy" ? 3 : difficulty === "medium" ? 4 : 5;
  const cubes: CubeCoord[] = [];
  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) {
      const height =
        Math.floor(
          random() *
            (difficulty === "easy" ? 2 : difficulty === "medium" ? 3 : 4)
        ) + 1;
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
  const options = [0, 1, 2, 3, 4, 5].filter(n => painted[n]! > 0);
  const answer = options.reduce(
    (best, n) => (painted[n]! > painted[best]! ? n : best),
    options[0] ?? 1
  );
  const all = [0, 1, 2, 3, 4, 5].filter(n => n !== answer);
  const distractors = all.slice(0, 3);
  const choices = [...distractors, answer];
  const seed = cubes.reduce((acc, c) => acc + c.x + c.y + c.z, 1);
  for (let i = choices.length - 1; i > 0; i--) {
    const j = (seed * (i + 1)) % (i + 1);
    [choices[i], choices[j]] = [choices[j]!, choices[i]!];
  }
  return { cubes, painted, answer, choices };
}
