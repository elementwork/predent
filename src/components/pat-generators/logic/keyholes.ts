import type { PRNG } from "@/lib/prng";

export interface CubeCoord {
  x: number;
  y: number;
  z: number;
}

/**
 * Silhouette of the object projected along one axis.
 * Rows run top-down; row 0 is the top of the silhouette when drawn.
 */
export type Silhouette = boolean[][];

export interface KeyholesProblem {
  cubes: CubeCoord[];
  /** Axis the correct aperture is projected along. */
  correctAxis: "x" | "y" | "z";
  correctSilhouette: Silhouette;
  options: Silhouette[];
  correctIndex: number;
}

export const KEYHOLES_OPTION_COUNT = 5;

function buildObject(
  random: PRNG,
  difficulty: "easy" | "medium" | "hard"
): CubeCoord[] {
  const dim = difficulty === "easy" ? 2 : difficulty === "medium" ? 3 : 4;
  const count = difficulty === "easy" ? 3 : difficulty === "medium" ? 6 : 8;
  const cubes: CubeCoord[] = [{ x: 0, y: 0, z: 0 }];

  // Add a base row so the object sits on a platform.
  const baseRow: CubeCoord[] = [{ x: 1, y: 0, z: 0 }];
  for (const b of baseRow) {
    if (!cubes.some(c => c.x === b.x && c.y === b.y && c.z === b.z)) {
      cubes.push(b);
    }
  }

  let guard = 0;
  while (cubes.length < count && guard++ < 300) {
    const base = cubes[Math.floor(random() * cubes.length)]!;
    const dirs = [
      { x: 1, y: 0, z: 0 },
      { x: -1, y: 0, z: 0 },
      { x: 0, y: 1, z: 0 },
      { x: 0, y: 0, z: 1 },
    ];
    const dir = dirs[Math.floor(random() * dirs.length)]!;
    const next = { x: base.x + dir.x, y: base.y + dir.y, z: base.z + dir.z };
    if (
      next.x >= 0 &&
      next.x < dim &&
      next.y >= 0 &&
      next.y < dim &&
      next.z >= 0 &&
      next.z < 2 &&
      !cubes.some(c => c.x === next.x && c.y === next.y && c.z === next.z)
    ) {
      cubes.push(next);
    }
  }

  // Normalize so the object starts at the origin.
  return normalize(cubes);
}

function normalize(cubes: CubeCoord[]): CubeCoord[] {
  const minX = Math.min(...cubes.map(c => c.x));
  const minY = Math.min(...cubes.map(c => c.y));
  const minZ = Math.min(...cubes.map(c => c.z));
  return cubes.map(c => ({ x: c.x - minX, y: c.y - minY, z: c.z - minZ }));
}

function trim(sil: boolean[][]): boolean[][] {
  let minRow = sil.length;
  let maxRow = -1;
  let minCol = Infinity;
  let maxCol = -1;
  sil.forEach((row, r) =>
    row.forEach((v, c) => {
      if (v) {
        if (r < minRow) minRow = r;
        if (r > maxRow) maxRow = r;
        if (c < minCol) minCol = c;
        if (c > maxCol) maxCol = c;
      }
    })
  );
  if (maxRow < 0) return [];
  const out: boolean[][] = [];
  for (let r = minRow; r <= maxRow; r++) {
    const row: boolean[] = [];
    for (let c = minCol; c <= maxCol; c++) {
      row.push(sil[r]?.[c] ?? false);
    }
    out.push(row);
  }
  return out;
}

/** Project the object along the given axis onto the perpendicular plane. */
export function computeSilhouette(
  cubes: CubeCoord[],
  axis: "x" | "y" | "z"
): Silhouette {
  const set = new Set(cubes.map(c => `${c.x},${c.y},${c.z}`));
  let cols: (c: CubeCoord) => number;
  let rows: (c: CubeCoord) => number;
  if (axis === "x") {
    // Project onto the y-z plane (view along x).
    cols = c => c.z;
    rows = c => c.y;
  } else if (axis === "y") {
    // Project onto the x-z plane (view along y, from above).
    cols = c => c.x;
    rows = c => c.z;
  } else {
    // Project onto the x-y plane (view along z, from the front).
    cols = c => c.x;
    rows = c => c.y;
  }

  const maxCol = Math.max(0, ...cubes.map(cols));
  const maxRow = Math.max(0, ...cubes.map(rows));
  const grid: boolean[][] = Array.from({ length: maxRow + 1 }, () =>
    Array.from({ length: maxCol + 1 }, () => false)
  );
  for (const c of cubes) {
    // Front-most cell along the axis wins; cells already in the set are unique.
    void set;
    grid[rows(c)]![cols(c)] = true;
  }
  return trim(grid);
}

function silhouetteKey(sil: Silhouette): string {
  return sil.map(row => row.map(v => (v ? "#" : ".")).join("")).join("/");
}

function flipH(sil: Silhouette): Silhouette {
  return sil.map(row => [...row].reverse());
}

function flipV(sil: Silhouette): Silhouette {
  return [...sil].reverse();
}

function rotate90(sil: Silhouette): Silhouette {
  const rows = sil.length;
  const cols = sil[0]?.length ?? 0;
  const out: boolean[][] = Array.from({ length: cols }, () =>
    Array.from({ length: rows }, () => false)
  );
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      out[c]![rows - 1 - r] = sil[r]![c] ?? false;
    }
  }
  return out;
}

/** Add a bump to an empty cell that neighbours a filled cell. */
function addBump(sil: Silhouette, random: PRNG): Silhouette {
  const rows = sil.length;
  const cols = sil[0]?.length ?? 0;
  const candidates: { r: number; c: number }[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (sil[r]![c]) continue;
      const near =
        (sil[r]?.[c - 1] ?? false) ||
        (sil[r]?.[c + 1] ?? false) ||
        (sil[r - 1]?.[c] ?? false) ||
        (sil[r + 1]?.[c] ?? false);
      if (near) {
        // Prefer cells that would extend an outside corner.
        if (
          ((sil[r]?.[c - 1] ?? false) && (sil[r + 1]?.[c] ?? false)) ||
          ((sil[r]?.[c + 1] ?? false) && (sil[r - 1]?.[c] ?? false))
        ) {
          candidates.unshift({ r, c });
        } else {
          candidates.push({ r, c });
        }
      }
    }
  }
  if (candidates.length === 0) {
    // Dense silhouette: grow the grid by one row/col and add a cell there.
    const grow = sil.map(row => [...row]);
    if (random() < 0.5) {
      const newRow: boolean[] = Array.from({ length: cols }, () => false);
      const insertAt = random() < 0.5 ? 0 : rows;
      grow.splice(insertAt, 0, newRow);
      newRow[Math.floor(random() * cols)] = true;
      return trim(grow);
    }
    for (const row of grow) row.push(false);
    grow[Math.floor(random() * rows)]![cols] = true;
    return trim(grow);
  }
  const pick = candidates[Math.floor(random() * candidates.length)]!;
  const out = sil.map(row => [...row]);
  out[pick.r]![pick.c] = true;
  return out;
}

/** Remove a filled cell that is an outside corner or tip. */
function removeBump(sil: Silhouette, random: PRNG): Silhouette {
  const rows = sil.length;
  const cols = sil[0]?.length ?? 0;
  const tips: { r: number; c: number }[] = [];
  const corners: { r: number; c: number }[] = [];
  const any: { r: number; c: number }[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!sil[r]![c]) continue;
      const eq = (r2: number, c2: number) =>
        r2 < 0 || r2 >= rows || c2 < 0 || c2 >= cols
          ? false
          : sil[r2]![c2];
      const n =
        (eq(r - 1, c) ? 1 : 0) +
        (eq(r + 1, c) ? 1 : 0) +
        (eq(r, c - 1) ? 1 : 0) +
        (eq(r, c + 1) ? 1 : 0);
      any.push({ r, c });
      if (n <= 1) tips.push({ r, c });
      else if (n <= 2) corners.push({ r, c });
    }
  }
  const pool = tips.length > 0 ? tips : corners.length > 0 ? corners : any;
  if (pool.length === 0) return flipV(sil);
  const pick = pool[Math.floor(random() * pool.length)]!;
  const out = sil.map(row => [...row]);
  out[pick.r]![pick.c] = false;
  return trim(out);
}

/** Random polyomino filler used to guarantee a full set of options. */
function randomFiller(random: PRNG): Silhouette {
  const w = 1 + Math.floor(random() * 3);
  const h = 1 + Math.floor(random() * 3);
  const cells: { x: number; y: number }[] = [{ x: 0, y: 0 }];
  let guard = 0;
  while (cells.length < 3 + Math.floor(random() * 3) && guard++ < 60) {
    const base = cells[Math.floor(random() * cells.length)]!;
    const dirs = [
      { x: 1, y: 0 },
      { x: -1, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: -1 },
    ];
    const dir = dirs[Math.floor(random() * dirs.length)]!;
    const nx = base.x + dir.x;
    const ny = base.y + dir.y;
    if (nx >= 0 && nx < w && ny >= 0 && ny < h && !cells.some(c => c.x === nx && c.y === ny)) {
      cells.push({ x: nx, y: ny });
    }
  }
  const grid: boolean[][] = Array.from({ length: h }, () =>
    Array.from({ length: w }, () => false)
  );
  for (const c of cells) grid[c.y]![c.x] = true;
  return trim(grid);
}

export function generateKeyholesProblem(
  random: PRNG,
  difficulty: "easy" | "medium" | "hard"
): KeyholesProblem {
  const cubes = buildObject(random, difficulty);
  const axes: ("x" | "y" | "z")[] = ["x", "y", "z"];
  const unique: { axis: "x" | "y" | "z"; sil: Silhouette }[] = [];
  const seen = new Set<string>();
  for (const axis of axes) {
    const sil = trim(computeSilhouette(cubes, axis));
    const key = silhouetteKey(sil);
    if (!seen.has(key)) {
      seen.add(key);
      unique.push({ axis, sil });
    }
  }

  const correctPick = Math.floor(random() * unique.length);
  const correct = unique[correctPick]!;
  const tagged: { sil: Silhouette; isCorrect: boolean }[] = [
    { sil: correct.sil, isCorrect: true },
  ];
  for (const other of unique) {
    if (other !== correct) {
      tagged.push({ sil: other.sil, isCorrect: false });
    }
  }

  let guard = 0;
  while (tagged.length < KEYHOLES_OPTION_COUNT && guard++ < 60) {
    const kind = random() < 0.5 ? "add" : "remove";
    const base: Silhouette =
      tagged.length >= 2
        ? (tagged.find(t => !t.isCorrect)?.sil ?? correct.sil)
        : correct.sil;
    const mutated =
      kind === "add" ? addBump(base, random) : removeBump(base, random);
    const variants = [mutated, flipH(mutated), flipV(mutated), rotate90(mutated)];
    for (const v of variants) {
      const key = silhouetteKey(v);
      if (!seen.has(key)) {
        seen.add(key);
        tagged.push({ sil: v, isCorrect: false });
        break;
      }
    }
  }

  // Guarantee a full option set with random polyomino fillers.
  guard = 0;
  while (tagged.length < KEYHOLES_OPTION_COUNT && guard++ < 100) {
    const filler = randomFiller(random);
    const key = silhouetteKey(filler);
    if (!seen.has(key) && filler.length > 0) {
      seen.add(key);
      tagged.push({ sil: filler, isCorrect: false });
    }
  }

  const options = tagged.map(t => t.sil);
  const correctIndex = tagged.findIndex(t => t.isCorrect);
  return {
    cubes,
    correctAxis: correct.axis,
    correctSilhouette: correct.sil,
    options,
    correctIndex,
  };
}