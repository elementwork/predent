import type { PRNG } from "@/lib/prng";
import type { CubeCoord } from "./keyholes";

export type ViewType = "top" | "front" | "end";

export interface TFEEdge {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  hidden: boolean;
}

/**
 * One orthographic view of the object.
 * `cols` and `rows` describe the projection grid (cells). Edges are unit
 * segments along grid lines in drawing coordinates (y grows downward; the
 * vertical axis is flipped by the renderer so row 0 sits at the bottom).
 */
export interface TFEView {
  cols: number;
  rows: number;
  edges: TFEEdge[];
}

export interface TFEProblem {
  cubes: CubeCoord[];
  missingView: ViewType;
  givenViews: [ViewType, ViewType];
  views: Record<ViewType, TFEView>;
  options: TFEView[];
  correctIndex: number;
}

export const TFE_OPTION_COUNT = 4;

interface GridData {
  cols: number;
  rows: number;
  depth: number[][]; // depth[col][row] = max extent along viewing axis (0 = base layer)
  present: boolean[][]; // present[col][row] = any cube at that cell (even flat)
}

function makeGrid(cubes: CubeCoord[], pick: (c: CubeCoord) => [number, number, number]): GridData {
  let maxCol = 0;
  let maxRow = 0;
  for (const c of cubes) {
    const [, col, row] = pick(c);
    if (col > maxCol) maxCol = col;
    if (row > maxRow) maxRow = row;
  }
  const depth: number[][] = Array.from({ length: maxCol + 1 }, () =>
    Array.from({ length: maxRow + 1 }, () => 0)
  );
  const present: boolean[][] = Array.from({ length: maxCol + 1 }, () =>
    Array.from({ length: maxRow + 1 }, () => false)
  );
  for (const c of cubes) {
    const [d, col, row] = pick(c);
    present[col]![row] = true;
    if (d > (depth[col]?.[row] ?? 0)) depth[col]![row] = d;
  }
  return { cols: maxCol + 1, rows: maxRow + 1, depth, present };
}

function occupied(g: GridData, col: number, row: number): boolean {
  if (col < 0 || col >= g.cols || row < 0 || row >= g.rows) return false;
  return (g.present[col]?.[row] ?? false) === true;
}

function depthAt(g: GridData, col: number, row: number): number {
  if (col < 0 || col >= g.cols || row < 0 || row >= g.rows) return 0;
  return g.depth[col]?.[row] ?? 0;
}

export function computeFrontEdges(cubes: CubeCoord[]): TFEView {
  const g = makeGrid(cubes, c => [
    c.z, // depth (viewing along z)
    c.x, // col (left-right)
    c.y, // row (bottom-top)
  ]);
  return buildRectViewEdges(g, "front");
}

export function computeEndEdges(cubes: CubeCoord[]): TFEView {
  const g = makeGrid(cubes, c => [
    c.x, // depth (viewing along x)
    c.z, // col (depth for a right-side view; front edge on the left of the grid)
    c.y, // row (bottom-up)
  ]);
  return buildRectViewEdges(g, "front");
}

export function computeTopEdges(cubes: CubeCoord[]): TFEView {
  const g = makeGrid(cubes, c => [
    c.y, // depth (viewing from above)
    c.x, // col (left-right)
    c.z, // row (front = row 0)
  ]);
  return buildRectViewEdges(g, "top");
}

/**
 * Convert the depth grid into the visible/hidden edge set for a view.
 * - The silhouette outline is always solid.
 * - Interior vertical walls at depth discontinuities are solid (the exposed
 *   wall of the deeper cell).
 * - Interior horizontal seams between stacked cells are dashed where the
 *   depth changes (a hidden step). For the top view a deeper cell in front
 *   exposes a solid wall instead.
 */
function buildRectViewEdges(g: GridData, kind: "front" | "top"): TFEView {
  const { cols, rows } = g;
  const edges: TFEEdge[] = [];
  const scaleX = (c: number) => c;
  const scaleY = (rowFromTop: number) => rowFromTop;

  // Outline: boundary edges of the occupied region.
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      if (!occupied(g, c, r)) continue;
      if (!occupied(g, c - 1, r)) edges.push({ x1: scaleX(c), y1: scaleY(r), x2: scaleX(c), y2: scaleY(r + 1), hidden: false });
      if (!occupied(g, c + 1, r)) edges.push({ x1: scaleX(c + 1), y1: scaleY(r), x2: scaleX(c + 1), y2: scaleY(r + 1), hidden: false });
      if (!occupied(g, c, r - 1)) edges.push({ x1: scaleX(c), y1: scaleY(r), x2: scaleX(c + 1), y2: scaleY(r), hidden: false });
      if (!occupied(g, c, r + 1)) edges.push({ x1: scaleX(c), y1: scaleY(r + 1), x2: scaleX(c + 1), y2: scaleY(r + 1), hidden: false });
    }
  }

  // Interior horizontal seams between vertically stacked cells.
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows - 1; r++) {
      if (!occupied(g, c, r) || !occupied(g, c, r + 1)) continue;
      const dLow = depthAt(g, c, r);
      const dHigh = depthAt(g, c, r + 1);
      if (dLow === dHigh) continue; // flush -> no visible seam
      let hidden: boolean;
      if (kind === "top") {
        // Cell at r is closer to the viewer (front). A deeper front cell
        // reveals a solid back wall; a deeper back cell hides a dashed wall.
        hidden = dHigh > dLow;
      } else {
        hidden = true;
      }
      edges.push({
        x1: scaleX(c),
        y1: scaleY(r + 1),
        x2: scaleX(c + 1),
        y2: scaleY(r + 1),
        hidden,
      });
    }
  }

  // Interior vertical walls at horizontal depth discontinuities.
  for (let c = 0; c < cols - 1; c++) {
    for (let r = 0; r < rows; r++) {
      if (!occupied(g, c, r) || !occupied(g, c + 1, r)) continue;
      if (depthAt(g, c, r) === depthAt(g, c + 1, r)) continue;
      edges.push({
        x1: scaleX(c + 1),
        y1: scaleY(r),
        x2: scaleX(c + 1),
        y2: scaleY(r + 1),
        hidden: false,
      });
    }
  }

  return { cols, rows, edges };
}

function dedupeEdges(a: TFEView, b: TFEView): boolean {
  if (a.cols !== b.cols || a.rows !== b.rows || a.edges.length !== b.edges.length) {
    return false;
  }
  const key = (e: TFEEdge) =>
    `${e.x1},${e.y1},${e.x2},${e.y2},${e.hidden ? "h" : "s"}`;
  const set = new Set(b.edges.map(key));
  return a.edges.every(e => set.has(key(e)));
}

function mirrorView(v: TFEView): TFEView {
  return {
    cols: v.cols,
    rows: v.rows,
    edges: v.edges.map(e => ({
      x1: v.cols - e.x1,
      x2: v.cols - e.x2,
      y1: e.y1,
      y2: e.y2,
      hidden: e.hidden,
    })),
  };
}

function toggleEdge(v: TFEView, random: PRNG): TFEView {
  const edges = v.edges.map(e => ({ ...e }));
  const solid = edges.filter(e => !e.hidden);
  if (solid.length === 0) return mirrorView(v);
  // Change one hidden line into a solid line or ghost one solid line, which
  // creates a plausible distractor while keeping the silhouette intact.
  const idx = edges.indexOf(solid[Math.floor(random() * solid.length)]!);
  edges[idx] = { ...edges[idx]!, hidden: true };
  return { cols: v.cols, rows: v.rows, edges };
}

function viewFromGrid(g: GridData): TFEView {
  return buildRectViewEdges(g, "front");
}

function addCell(g: GridData, random: PRNG): GridData | null {
  const empty: Array<[number, number]> = [];
  for (let c = 0; c < g.cols; c++) {
    for (let r = 0; r < g.rows; r++) {
      if (occupied(g, c, r)) continue;
      const n =
        (occupied(g, c - 1, r) ? 1 : 0) +
        (occupied(g, c + 1, r) ? 1 : 0) +
        (occupied(g, c, r - 1) ? 1 : 0) +
        (occupied(g, c, r + 1) ? 1 : 0);
      if (n > 0) empty.push([c, r]);
    }
  }
  if (empty.length === 0) return null;
  const [c, r] = empty[Math.floor(random() * empty.length)]!;
  const depth = g.depth.map(row => [...row]);
  const present = g.present.map(row => [...row]);
  depth[c]![r] = 1;
  present[c]![r] = true;
  return { cols: g.cols, rows: g.rows, depth, present };
}

function removeCell(g: GridData, random: PRNG): GridData | null {
  const removable: Array<[number, number]> = [];
  let total = 0;
  for (let c = 0; c < g.cols; c++) {
    for (let r = 0; r < g.rows; r++) {
      if (!occupied(g, c, r)) continue;
      total++;
      const n =
        (occupied(g, c - 1, r) ? 1 : 0) +
        (occupied(g, c + 1, r) ? 1 : 0) +
        (occupied(g, c, r - 1) ? 1 : 0) +
        (occupied(g, c, r + 1) ? 1 : 0);
      // Prefer cells that keep the region connected (at least one neighbour left).
      if (n >= 1) removable.push([c, r]);
    }
  }
  if (removable.length === 0 || total <= 1) return null;
  const [c, r] = removable[Math.floor(random() * removable.length)]!;
  const depth = g.depth.map(row => [...row]);
  const present = g.present.map(row => [...row]);
  depth[c]![r] = Math.max(0, (depth[c]![r] ?? 1) - 1);
  if (depth[c]![r] === 0) present[c]![r] = false;
  return { cols: g.cols, rows: g.rows, depth, present };
}

function buildDistractors(
  random: PRNG,
  correct: TFEView,
  correctGrid: GridData
): TFEView[] {
  const out: TFEView[] = [];
  if (!dedupeEdges(correct, mirrorView(correct))) {
    out.push(mirrorView(correct));
  }
  // Edge-level mutations.
  let guard = 0;
  while (out.length < TFE_OPTION_COUNT - 1 && guard++ < 40) {
    const c = toggleEdge(correct, random);
    if (dedupeEdges(correct, c) || out.some(o => dedupeEdges(o, c))) continue;
    out.push(c);
  }
  // Grid-level silhouette mutations (bump / notch) as a second strategy.
  guard = 0;
  let grid = correctGrid;
  while (out.length < TFE_OPTION_COUNT - 1 && guard++ < 40) {
    const variant =
      random() < 0.5 ? addCell(grid, random) : removeCell(grid, random);
    if (!variant) break;
    grid = variant;
    const v = viewFromGrid(grid);
    if (dedupeEdges(correct, v) || out.some(o => dedupeEdges(o, v))) continue;
    out.push(v);
  }
  return out;
}

export function generateTFEProblem(
  random: PRNG,
  difficulty: "easy" | "medium" | "hard"
): TFEProblem {
  const dim = difficulty === "easy" ? 2 : difficulty === "medium" ? 3 : 4;
  const cubes: CubeCoord[] = [];
  for (let x = 0; x < dim; x++) {
    for (let z = 0; z < dim; z++) {
      const height =
        random() > 0.4 ? Math.floor(random() * (dim - 1)) + 1 : 0;
      for (let y = 0; y < height; y++) {
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

  const views: Record<ViewType, TFEView> = {
    top: computeTopEdges(cubes),
    front: computeFrontEdges(cubes),
    end: computeEndEdges(cubes),
  };

  const missingOrder: ViewType[] = ["top", "front", "end"];
  const missing = missingOrder[Math.floor(random() * missingOrder.length)]!;
  const givenViews = missingOrder.filter(v => v !== missing) as [ViewType, ViewType];
  const correctView = views[missing];

  // The grid used to build the correct (missing) view, for silhouette mutation.
  const gridForMissing: GridData =
    missing === "top"
      ? makeGrid(cubes, c => [c.y, c.x, c.z])
      : missing === "front"
        ? makeGrid(cubes, c => [c.z, c.x, c.y])
        : makeGrid(cubes, c => [c.x, c.z, c.y]);

  const distractors = buildDistractors(random, correctView, gridForMissing);
  const tagged = [
    { view: correctView, isCorrect: true },
    ...distractors.map(d => ({ view: d, isCorrect: false })),
  ];
  // Deterministic shuffle with the PRNG.
  for (let i = tagged.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [tagged[i], tagged[j]] = [tagged[j]!, tagged[i]!];
  }

  const options = tagged.map(t => t.view);
  const correctIndex = tagged.findIndex(t => t.isCorrect);
  return {
    cubes,
    missingView: missing,
    givenViews,
    views,
    options,
    correctIndex,
  };
}