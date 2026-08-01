import type { PRNG } from "@/lib/prng";
import type { CubeCoord } from "../shared/IsoCube";

export type ViewType = "top" | "front" | "end";

export interface Shape {
  cubes: CubeCoord[];
  top: boolean[][];
  front: boolean[][];
  end: boolean[][];
}

export interface TFEProblem {
  shape: Shape;
  missingView: ViewType;
  givenViews: [ViewType, ViewType];
  correctGrid: boolean[][];
  options: boolean[][][];
  correctIndex: number;
}

function generateShape(random: PRNG, difficulty: "easy" | "medium" | "hard"): Shape {
  const dim = difficulty === "easy" ? 2 : difficulty === "medium" ? 3 : 4;
  const cubes: CubeCoord[] = [];

  for (let x = 0; x < dim; x++) {
    for (let y = 0; y < dim; y++) {
      const height =
        random() > 0.4 ? Math.floor(random() * (dim - 1)) + 1 : 0;
      for (let z = 0; z < height; z++) {
        cubes.push({ x, y, z });
      }
    }
  }

  if (cubes.length < 3) {
    cubes.push(
      { x: 0, y: 0, z: 0 },
      { x: 0, y: 1, z: 0 },
      { x: 1, y: 0, z: 0 }
    );
  }

  const top = Array.from({ length: dim }, (_, y) =>
    Array.from({ length: dim }, (_, x) =>
      cubes.some(c => c.x === x && c.y === y)
    )
  );

  const front = Array.from({ length: dim }, (_, z) =>
    Array.from({ length: dim }, (_, x) =>
      cubes.some(c => c.x === x && c.z === z)
    )
  );

  const end = Array.from({ length: dim }, (_, z) =>
    Array.from({ length: dim }, (_, y) =>
      cubes.some(c => c.y === y && c.z === z)
    )
  );

  return { cubes, top, front, end };
}

function gridsEqual(a: boolean[][], b: boolean[][]): boolean {
  if (a.length !== b.length) return false;
  return a.every((row, i) =>
    row.every((cell, j) => cell === (b[i]?.[j] ?? false))
  );
}

function rotateGrid(grid: boolean[][]): boolean[][] {
  const n = grid.length;
  return Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => grid[n - 1 - j]?.[i] ?? false)
  );
}

function flipGrid(grid: boolean[][]): boolean[][] {
  return grid.map(row => [...row].reverse());
}

function generateDistractors(correct: boolean[][]): boolean[][][] {
  const opts: boolean[][][] = [correct];
  opts.push(rotateGrid(correct));
  opts.push(flipGrid(correct));
  const modified = correct.map(row => [...row]);
  modified[0] = [...(modified[0] ?? [])];
  modified[0]![0] = !(modified[0]![0] ?? false);
  if (gridsEqual(modified, correct)) {
    modified[0]![1] = !(modified[0]![1] ?? false);
  }
  opts.push(modified);
  return opts;
}

function shuffleOptions(correctGrid: boolean[][]): {
  options: boolean[][][];
  correctIndex: number;
} {
  const distractors = generateDistractors(correctGrid);
  const tagged = distractors.map((g, i) => ({ grid: g, isCorrect: i === 0 }));
  const seed = correctGrid
    .flat()
    .reduce((acc, val) => acc * 2 + (val ? 1 : 0), 1);
  for (let i = tagged.length - 1; i > 0; i--) {
    const j = (seed * (i + 1)) % (i + 1);
    [tagged[i], tagged[j]] = [tagged[j]!, tagged[i]!];
  }
  const options = tagged.map(t => t.grid);
  const correctIndex = tagged.findIndex(t => t.isCorrect);
  return { options, correctIndex };
}

export function generateTFEProblem(
  random: PRNG,
  difficulty: "easy" | "medium" | "hard"
): TFEProblem {
  const shape = generateShape(random, difficulty);
  const views: ViewType[] = ["top", "front", "end"];
  const seed = shape.cubes.reduce((acc, c) => acc + c.x + c.y + c.z, 1);
  const missing = views[seed % views.length] ?? "end";
  const correctGrid = shape[missing];
  const givenViews = views.filter(v => v !== missing) as [ViewType, ViewType];
  const { options, correctIndex } = shuffleOptions(correctGrid);
  return {
    shape,
    missingView: missing,
    givenViews,
    correctGrid,
    options,
    correctIndex,
  };
}
