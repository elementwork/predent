import type { PRNG } from "./prng";

export type FoldAxis = "h" | "v" | "d";

/**
 * One fold of the paper. `line` is the grid line the fold happens along,
 * measured in the original 4x4 grid coordinates:
 * - "h": fold the part with y >= line down over y < line.
 * - "v": fold the part with x >= line left over x < line.
 * - "d": diagonal fold of a square region; line 0 = main diagonal
 *   (x < y folds over x >= y), line 1 = anti-diagonal (x + y >= n folds over).
 */
export interface FoldStep {
  axis: FoldAxis;
  line: number;
}

export interface Punch {
  x: number;
  y: number;
}

export interface HolePunchingProblem {
  foldSteps: FoldStep[];
  /** Punch position on the final folded paper (cells of the original 4x4 grid). */
  punch: Punch;
  correctHoles: Punch[];
  options: Punch[][];
  correctIndex: number;
}

export const HOLE_PUNCHING_OPTION_COUNT = 5;
const GRID = 4;

type Region =
  | { kind: "rect"; w: number; h: number }
  | { kind: "tri"; main: boolean; n: number };

function generateFoldSteps(random: PRNG, difficulty: "easy" | "medium" | "hard"): FoldStep[] {
  const count = difficulty === "easy" ? 1 : difficulty === "medium" ? 2 : 3;
  const steps: FoldStep[] = [];
  let region = { kind: "rect", w: GRID, h: GRID } as Region;

  for (let i = 0; i < count; i++) {
    if (region.kind === "tri") break;
    const rect = region;
    const isLast = i === count - 1;
    // Authentic DAT convention: the paper is always folded in half
    // (half-fold: line = ceil(dim / 2)), which keeps every reflection
    // on the original sheet and doubles the hole positions exactly.
    const canH = rect.h >= 2;
    const canV = rect.w >= 2;
    const canD = rect.w === rect.h && rect.w >= 2 && (isLast || random() < 0.3);

    if (canD) {
      const main = random() < 0.5;
      steps.push({ axis: "d", line: main ? 0 : 1 });
      region = { kind: "tri", main, n: rect.w };
      break; // diagonal fold always ends the sequence
    }

    const choices: FoldAxis[] = [];
    if (canH) choices.push("h");
    if (canV) choices.push("v");
    if (choices.length === 0) break;

    const axis = choices[Math.floor(random() * choices.length)]!;
    if (axis === "h") {
      const line = Math.ceil(rect.h / 2);
      steps.push({ axis, line });
      region = { kind: "rect", w: rect.w, h: line };
    } else {
      const line = Math.ceil(rect.w / 2);
      steps.push({ axis, line });
      region = { kind: "rect", w: line, h: rect.h };
    }
  }
  return steps;
}

function pickPunch(random: PRNG, region: Region): Punch {
  if (region.kind === "rect") {
    const x = Math.floor(random() * region.w);
    const y = Math.floor(random() * region.h);
    return { x, y };
  }
  if (region.main) {
    const x = Math.floor(random() * region.n);
    const y = Math.floor(random() * (x + 1));
    return { x, y };
  }
  const x = Math.floor(random() * region.n);
  const y = Math.floor(random() * (region.n - x));
  return { x, y };
}

function reflect(p: Punch, step: FoldStep, regionBefore: Region): Punch {
  switch (step.axis) {
    case "h":
      return { x: p.x, y: 2 * step.line - 1 - p.y };
    case "v":
      return { x: 2 * step.line - 1 - p.x, y: p.y };
    case "d": {
      // The diagonal fold only ever applies to a square region.
      const n = regionBefore.kind === "rect" ? regionBefore.w : regionBefore.n;
      if (step.line === 0) {
        return { x: p.y, y: p.x };
      }
      return { x: n - 1 - p.y, y: n - 1 - p.x };
    }
  }
}

function inGrid(p: Punch): boolean {
  return p.x >= 0 && p.x < GRID && p.y >= 0 && p.y < GRID;
}

function dotKey(p: Punch): string {
  return `${p.x},${p.y}`;
}

function dedupeDots(dots: Punch[]): Punch[] {
  const seen = new Set<string>();
  return dots.filter(d => {
    const key = dotKey(d);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function applyFold(region: Region, step: FoldStep): Region {
  if (region.kind === "tri") return region;
  if (step.axis === "h") return { kind: "rect", w: region.w, h: step.line };
  if (step.axis === "v") return { kind: "rect", w: step.line, h: region.h };
  return { kind: "tri", main: step.line === 0, n: region.w };
}

function computeHolePositions(problem: HolePunchingProblem): Punch[] {
  // Record the region before each fold so the diagonal reflection knows its size.
  const regions: Region[] = [];
  let region = { kind: "rect", w: GRID, h: GRID } as Region;
  for (const step of problem.foldSteps) {
    regions.push(region);
    region = applyFold(region, step);
  }

  let dots = [problem.punch];
  // Unfold in reverse order; each fold mirrors every existing dot.
  for (let i = problem.foldSteps.length - 1; i >= 0; i--) {
    const step = problem.foldSteps[i]!;
    const mirrored = dots
      .map(d => reflect(d, step, regions[i]!))
      .filter(inGrid);
    dots = dedupeDots([...dots, ...mirrored]);
  }
  return dots;
}

function dotsEqual(a: Punch[], b: Punch[]): boolean {
  const keyA = a.map(dotKey).sort().join("|");
  const keyB = b.map(dotKey).sort().join("|");
  return keyA === keyB;
}

function generateDistractors(random: PRNG, correctHoles: Punch[]): Punch[][] {
  const tagged: Punch[][] = [];

  const mirrorV = correctHoles.map(h => ({ x: GRID - 1 - h.x, y: h.y }));
  const mirrorH = correctHoles.map(h => ({ x: h.x, y: GRID - 1 - h.y }));
  const mirrorDiag = correctHoles.map(h => ({ x: h.y, y: h.x }));

  const candidates: Punch[][] = [mirrorV, mirrorH, mirrorDiag];

  if (correctHoles.length >= 2) {
    const removed = correctHoles.slice(0, correctHoles.length - 1);
    candidates.push(removed);
  } else {
    // Single hole: shift it instead.
    const shifted = correctHoles.map(h => ({
      x: Math.min(GRID - 1, h.x + 1),
      y: h.y,
    }));
    candidates.push(shifted);
  }

  const seen = new Set<string>();
  const correctKey = correctHoles.map(dotKey).sort().join("|");
  seen.add(correctKey);

  for (const c of candidates) {
    const key = c.map(dotKey).sort().join("|");
    if (!seen.has(key) && !dotsEqual(c, correctHoles)) {
      seen.add(key);
      tagged.push(c);
    }
    if (tagged.length >= HOLE_PUNCHING_OPTION_COUNT - 1) break;
  }

  // Pad with a single-dot variant or a moved dot if needed.
  let guard = 0;
  while (tagged.length < HOLE_PUNCHING_OPTION_COUNT - 1 && guard++ < 30) {
    const base = correctHoles[Math.floor(random() * correctHoles.length)]!;
    const dx = random() < 0.5 ? 1 : -1;
    const dy = random() < 0.5 ? 1 : -1;
    const moved: Punch = {
      x: Math.min(GRID - 1, Math.max(0, base.x + dx)),
      y: Math.min(GRID - 1, Math.max(0, base.y + dy)),
    };
    const variant = dedupeDots([
      ...correctHoles.filter(h => !(h.x === base.x && h.y === base.y)),
      moved,
    ]);
    const key = variant.map(dotKey).sort().join("|");
    if (!seen.has(key) && !dotsEqual(variant, correctHoles)) {
      seen.add(key);
      tagged.push(variant);
    }
  }

  return tagged;
}

export function generateHolePunchingProblem(
  random: PRNG,
  difficulty: "easy" | "medium" | "hard"
): HolePunchingProblem {
  const foldSteps = generateFoldSteps(random, difficulty);
  let region = { kind: "rect", w: GRID, h: GRID } as Region;
  for (const step of foldSteps) {
    region = applyFold(region, step);
  }
  const punch = pickPunch(random, region);

  const problem: HolePunchingProblem = { foldSteps, punch, correctHoles: [], options: [], correctIndex: 0 };
  const correctHoles = computeHolePositions(problem);
  const distractors = generateDistractors(random, correctHoles);

  const tagged = [
    { holes: correctHoles, isCorrect: true },
    ...distractors.map(d => ({ holes: d, isCorrect: false })),
  ];
  for (let i = tagged.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [tagged[i], tagged[j]] = [tagged[j]!, tagged[i]!];
  }

  const options = tagged.map(t => t.holes);
  const correctIndex = tagged.findIndex(t => t.isCorrect);
  return { foldSteps, punch, correctHoles, options, correctIndex };
}