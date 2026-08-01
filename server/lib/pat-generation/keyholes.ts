import type { PRNG } from "./prng";

export interface CubeCoord {
  x: number;
  y: number;
  z: number;
}

export interface KeyholesProblem {
  cubes: CubeCoord[];
  projection: boolean[][];
  options: boolean[][][];
  correctIndex: number;
}

function generateObject(random: PRNG, difficulty: "easy" | "medium" | "hard"): CubeCoord[] {
  const dim = difficulty === "easy" ? 2 : difficulty === "medium" ? 3 : 4;
  const cubes: CubeCoord[] = [];
  const start = { x: 0, y: 0, z: 0 };
  cubes.push(start);

  const count = difficulty === "easy" ? 3 : difficulty === "medium" ? 5 : 7;
  while (cubes.length < count) {
    const base = cubes[Math.floor(random() * cubes.length)]!;
    const dir = [
      { x: 1, y: 0, z: 0 },
      { x: 0, y: 1, z: 0 },
      { x: 0, y: 0, z: 1 },
    ][Math.floor(random() * 3)]!;
    const next = { x: base.x + dir.x, y: base.y + dir.y, z: base.z + dir.z };
    if (
      next.x >= 0 &&
      next.x < dim &&
      next.y >= 0 &&
      next.y < dim &&
      next.z >= 0 &&
      next.z < dim &&
      !cubes.some(c => c.x === next.x && c.y === next.y && c.z === next.z)
    ) {
      cubes.push(next);
    }
  }
  return cubes;
}

function getProjection(cubes: CubeCoord[], axis: "x" | "y" | "z"): boolean[][] {
  const dim =
    Math.max(
      ...cubes.map(c => c.x),
      ...cubes.map(c => c.y),
      ...cubes.map(c => c.z)
    ) + 1;
  const grid = Array.from({ length: dim }, () =>
    Array.from({ length: dim }, () => false)
  );

  for (const c of cubes) {
    let u = 0,
      v = 0;
    if (axis === "x") {
      u = c.y;
      v = c.z;
    } else if (axis === "y") {
      u = c.x;
      v = c.z;
    } else {
      u = c.x;
      v = c.y;
    }
    grid[v]![u] = true;
  }
  return grid;
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

function generateOptions(projection: boolean[][]): {
  options: boolean[][][];
  correctIndex: number;
} {
  const tagged: { grid: boolean[][]; isCorrect: boolean }[] = [
    { grid: projection, isCorrect: true },
    { grid: rotateGrid(projection), isCorrect: false },
    { grid: flipGrid(projection), isCorrect: false },
  ];
  const modified = projection.map(row => [...row]);
  modified[0] = [...(modified[0] ?? [])];
  modified[0]![0] = !(modified[0]![0] ?? false);
  tagged.push({ grid: modified, isCorrect: false });

  const seed = projection
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

export function generateKeyholesProblem(
  random: PRNG,
  difficulty: "easy" | "medium" | "hard"
): KeyholesProblem {
  const cubes = generateObject(random, difficulty);
  const projection = getProjection(cubes, "y");
  const { options, correctIndex } = generateOptions(projection);
  return { cubes, projection, options, correctIndex };
}
