import type { GeneratedQuestion } from "../pat-types.js";

interface CubeCoord {
  x: number;
  y: number;
  z: number;
}

interface TFEEdge {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  hidden: boolean;
}

interface TFEView {
  cols: number;
  rows: number;
  edges: TFEEdge[];
}

interface FoldStep {
  axis: "h" | "v" | "d";
  line: number;
}

const INK = "#111111";
const PAPER = "#ffffff";
const GRAY_FILL = "#c8c8c8";
const DASH = "5 3";

function escapeAttr(value: unknown): string {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function svgWrap(inner: string, width: number, height: number, cls = "diagram-svg"): string {
  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" class="${cls}">${inner}</svg>`;
}

/* ─── Isometric cube stack (black-on-white technical style) ─── */

function isoPoints(x: number, y: number, z: number, s: number): {
  top: string;
  left: string;
  right: string;
  cx: number;
  cy: number;
} {
  const px = (x - y) * s * 0.9;
  const py = -(x + y) * s * 0.45 - z * s * 0.9;
  return {
    cx: px,
    cy: py,
    top: `${px},${py - s * 0.45} ${px + s * 0.72},${py - s * 0.72} ${px + s * 1.44},${py - s * 0.45} ${px + s * 0.72},${py - s * 0.18}`,
    left: `${px},${py - s * 0.45} ${px + s * 0.72},${py - s * 0.18} ${px + s * 0.72},${py + s * 0.72} ${px},${py + s * 0.45}`,
    right: `${px + s * 0.72},${py - s * 0.18} ${px + s * 1.44},${py - s * 0.45} ${px + s * 1.44},${py + s * 0.45} ${px + s * 0.72},${py + s * 0.72}`,
  };
}

interface IsoRenderOpts {
  cubeSize?: number;
  pad?: number;
  /** When set, cubes with exactly this many exposed faces are shaded. */
  paintFaces?: boolean;
}

function renderCubeStack(cubes: CubeCoord[], size: number, opts: IsoRenderOpts = {}): string {
  const s = opts.cubeSize ?? 24;
  const pad = opts.pad ?? 18;
  const set = new Set(cubes.map(c => `${c.x},${c.y},${c.z}`));
  const exposed = (c: CubeCoord): number => {
    let n = 0;
    for (const [dx, dy, dz] of [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]]) {
      if (!set.has(`${c.x + dx},${c.y + dy},${c.z + dz}`)) n++;
    }
    return n;
  };
  const sorted = [...cubes].sort((a, b) => a.z - b.z || a.y - b.y || a.x - b.x);

  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const c of sorted) {
    const p = isoPoints(c.x, c.y, c.z, s);
    minX = Math.min(minX, p.cx - s * 0.72);
    maxX = Math.max(maxX, p.cx + s * 1.44);
    minY = Math.min(minY, p.cy - s * 1.0);
    maxY = Math.max(maxY, p.cy + s * 0.8);
  }
  const offX = size / 2 - (minX + maxX) / 2;
  const offY = size / 2 - (minY + maxY) / 2;

  const inner = sorted
    .map(c => {
      const p = isoPoints(c.x, c.y, c.z, s);
      const shade = opts.paintFaces
        ? `<polygon points="${p.top}" fill="${GRAY_FILL}" stroke="${INK}" stroke-width="1.1"/>
           <polygon points="${p.left}" fill="${GRAY_FILL}" stroke="${INK}" stroke-width="1.1"/>
           <polygon points="${p.right}" fill="${GRAY_FILL}" stroke="${INK}" stroke-width="1.1"/>`
        : `<polygon points="${p.top}" fill="${PAPER}" stroke="${INK}" stroke-width="1.1"/>
           <polygon points="${p.left}" fill="${PAPER}" stroke="${INK}" stroke-width="1.1"/>
           <polygon points="${p.right}" fill="${PAPER}" stroke="${INK}" stroke-width="1.1"/>`;
      void exposed(c);
      return shade;
    })
    .join("");

  return svgWrap(
    `<rect width="100%" height="100%" fill="${PAPER}" stroke="${INK}" stroke-width="1.2"/>
     <g transform="translate(${offX}, ${offY})">${inner}</g>`,
    size + pad * 2,
    size + pad * 2
  );
}

/* ─── Silhouette grid (black-on-white) ─── */

function renderSilhouette(grid: boolean[][], size: number): string {
  if (!Array.isArray(grid) || grid.length === 0) {
    return svgWrap(`<rect width="100%" height="100%" fill="${PAPER}" stroke="${INK}" stroke-width="1.2"/>`, size, size);
  }
  const rows = grid.length;
  const cols = grid[0]?.length ?? rows;
  const pad = 6;
  const cell = (size - pad * 2) / Math.max(rows, cols);
  const offX = (size - cell * cols) / 2;
  const offY = (size - cell * rows) / 2;

  const cells = grid
    .map((row, r) =>
      row
        .map((filled, c) => {
          const x = offX + c * cell;
          const y = offY + r * cell;
          return `<rect x="${x}" y="${y}" width="${cell - 1}" height="${cell - 1}" fill="${filled ? INK : PAPER}" stroke="${INK}" stroke-width="0.8"/>`;
        })
        .join("")
    )
    .join("");

  return svgWrap(
    `<rect width="100%" height="100%" fill="${PAPER}" stroke="${INK}" stroke-width="1.2"/>
     ${cells}`,
    size,
    size
  );
}

/* ─── TFE view (solid + dashed edges) ─── */

function renderTFEView(view: TFEView, size: number): string {
  const pad = 10;
  const cell = (size - pad * 2) / Math.max(view.cols, view.rows);
  const offX = (size - cell * view.cols) / 2;
  const offY = (size - cell * view.rows) / 2;
  const lines = view.edges
    .map(e => {
      const dash = e.hidden ? ` stroke-dasharray="${DASH}"` : "";
      return `<line x1="${offX + e.x1 * cell}" y1="${offY + e.y1 * cell}" x2="${offX + e.x2 * cell}" y2="${offY + e.y2 * cell}" stroke="${INK}" stroke-width="1.6"${dash}/>`;
    })
    .join("");
  return svgWrap(
    `<rect x="${pad - 4}" y="${pad - 4}" width="${size - pad * 2 + 8}" height="${size - pad * 2 + 8}" fill="${PAPER}" stroke="${INK}" stroke-width="1" opacity="0.35"/>
     ${lines}`,
    size,
    size
  );
}

/* ─── Angle diagram ─── */

function renderAngleDiagram(angle: number, label: number, size: number): string {
  const center = size / 2;
  const radius = size * 0.36;
  const rad = (angle * Math.PI) / 180;
  const x2 = center + radius * Math.cos(rad);
  const y2 = center - radius * Math.sin(rad);
  const arcR = radius * 0.3;
  const sweep = angle <= 180 ? 0 : 1;
  return svgWrap(
    `<rect width="100%" height="100%" fill="${PAPER}" stroke="${INK}" stroke-width="1"/>
     <line x1="${center}" y1="${center}" x2="${center + radius}" y2="${center}" stroke="${INK}" stroke-width="2"/>
     <line x1="${center}" y1="${center}" x2="${x2}" y2="${y2}" stroke="${INK}" stroke-width="2"/>
     <path d="M ${center + arcR} ${center} A ${arcR} ${arcR} 0 0 ${sweep} ${center + arcR * Math.cos(rad)} ${center - arcR * Math.sin(rad)}" fill="none" stroke="${INK}" stroke-width="1.4"/>
     <text x="${center}" y="${size - 8}" text-anchor="middle" font-size="14" font-weight="bold" fill="${INK}">${label}</text>`,
    size,
    size
  );
}

/* ─── Hole punching: folded paper stem ─── */

function renderFoldedPaper(steps: FoldStep[], punch: { x: number; y: number }, size: number): string {
  const pad = 24;
  const paper = size - pad * 2;
  const GRID = 4;
  const cell = paper / GRID;

  // Fold lines: rendered in the original 4x4 grid coordinates.
  const foldPaths: string[] = [];
  for (const f of steps) {
    if (f.axis === "h") {
      const y = pad + (GRID - f.line) * cell;
      foldPaths.push(`<line x1="${pad}" y1="${y}" x2="${pad + paper}" y2="${y}" stroke="${INK}" stroke-width="1.2" stroke-dasharray="${DASH}"/>`);
    } else if (f.axis === "v") {
      const x = pad + f.line * cell;
      foldPaths.push(`<line x1="${x}" y1="${pad}" x2="${x}" y2="${pad + paper}" stroke="${INK}" stroke-width="1.2" stroke-dasharray="${DASH}"/>`);
    } else {
      const main = f.line === 0;
      foldPaths.push(
        main
          ? `<line x1="${pad}" y1="${pad + paper}" x2="${pad + paper}" y2="${pad}" stroke="${INK}" stroke-width="1.2" stroke-dasharray="${DASH}"/>`
          : `<line x1="${pad}" y1="${pad}" x2="${pad + paper}" y2="${pad + paper}" stroke="${INK}" stroke-width="1.2" stroke-dasharray="${DASH}"/>`
      );
    }
  }

  const px = pad + punch.x * cell;
  const py = pad + (GRID - 1 - punch.y) * cell;

  return svgWrap(
    `<rect width="100%" height="100%" fill="${PAPER}" stroke="${INK}" stroke-width="1"/>
     <rect x="${pad}" y="${pad}" width="${paper}" height="${paper}" fill="${PAPER}" stroke="${INK}" stroke-width="1.4"/>
     ${foldPaths.join("")}
     <circle cx="${px}" cy="${py}" r="${cell * 0.16}" fill="${PAPER}" stroke="${INK}" stroke-width="1.6"/>`,
    size,
    size
  );
}

/* ─── Hole punching: unfolded grid option ─── */

function renderHoleGrid(holes: { x: number; y: number }[], size: number): string {
  const GRID = 4;
  const pad = 8;
  const cell = (size - pad * 2) / GRID;
  const dots = (holes ?? [])
    .map(h => {
      const cx = pad + (h.x + 0.5) * cell;
      const cy = pad + (GRID - 1 - h.y + 0.5) * cell;
      return `<circle cx="${cx}" cy="${cy}" r="${cell * 0.14}" fill="${INK}" stroke="${INK}"/>`;
    })
    .join("");
  const lines: string[] = [];
  for (let i = 1; i < GRID; i++) {
    const x = pad + i * cell;
    const y = pad + i * cell;
    lines.push(
      `<line x1="${x}" y1="${pad}" x2="${x}" y2="${pad + cell * GRID}" stroke="${INK}" stroke-width="0.6"/>`,
      `<line x1="${pad}" y1="${y}" x2="${pad + cell * GRID}" y2="${y}" stroke="${INK}" stroke-width="0.6"/>`
    );
  }
  return svgWrap(
    `<rect width="100%" height="100%" fill="${PAPER}" stroke="${INK}" stroke-width="1"/>
     <rect x="${pad}" y="${pad}" width="${cell * GRID}" height="${cell * GRID}" fill="${PAPER}" stroke="${INK}" stroke-width="1.4"/>
     ${lines.join("")}${dots}`,
    size,
    size
  );
}

/* ─── Pattern folding ─── */

const NET_POSITIONS: [number, number][] = [
  [1, 1], // front
  [1, 0], // top
  [1, 2], // bottom
  [0, 1], // left
  [2, 1], // right
  [1, 3], // back
];

function renderNet(net: string[], size = 170): string {
  const cell = 36;
  const w = size;
  const h = size + 20;
  const x0 = (w - 3 * cell) / 2;
  const y0 = (h - 4 * cell) / 2;
  const cells = NET_POSITIONS.map(([gx, gy], i) => {
    const x = x0 + gx * cell;
    const y = y0 + gy * cell;
    const symbol = net[i] ?? "";
    const shaded = symbol === "#";
    const fill = shaded ? GRAY_FILL : PAPER;
    const text = shaded
      ? ""
      : symbol
        ? `<text x="${x + cell / 2}" y="${y + cell / 2 + 6}" text-anchor="middle" font-size="20" fill="${INK}">${escapeAttr(symbol)}</text>`
        : "";
    return `<rect x="${x}" y="${y}" width="${cell - 3}" height="${cell - 3}" fill="${fill}" stroke="${INK}" stroke-width="1.3"/>
      ${text}`;
  }).join("");
  return svgWrap(
    `<rect width="100%" height="100%" fill="${PAPER}" stroke="${INK}" stroke-width="1"/>
     ${cells}`,
    w,
    h
  );
}

function renderFoldedCube(markString: string, size = 120): string {
  const s = size * 0.34;
  const cx = size / 2;
  const cy = size / 2 + size * 0.06;
  const marks = markString.split("|");
  const top = marks[0] ?? "";
  const left = marks[1] ?? "";
  const right = marks[2] ?? "";
  const p = (dx: number, dy: number) => `${cx + dx},${cy + dy}`;
  const faceTop = `${p(0, -s * 0.45)} ${p(s * 0.72, -s * 0.72)} ${p(s * 1.44, -s * 0.45)} ${p(s * 0.72, -s * 0.18)}`;
  const faceLeft = `${p(0, -s * 0.45)} ${p(s * 0.72, -s * 0.18)} ${p(s * 0.72, s * 0.72)} ${p(0, s * 0.45)}`;
  const faceRight = `${p(s * 0.72, -s * 0.18)} ${p(s * 1.44, -s * 0.45)} ${p(s * 1.44, s * 0.45)} ${p(s * 0.72, s * 0.72)}`;
  const label = (mark: string, cxm: number, cym: number) =>
    mark
      ? `<text x="${cxm}" y="${cym}" text-anchor="middle" font-size="18" fill="${INK}">${escapeAttr(mark)}</text>`
      : "";
  return svgWrap(
    `<rect width="100%" height="100%" fill="${PAPER}" stroke="${INK}" stroke-width="1"/>
     <polygon points="${faceTop}" fill="${top === "#" ? GRAY_FILL : PAPER}" stroke="${INK}" stroke-width="1.4"/>
     <polygon points="${faceLeft}" fill="${left === "#" ? GRAY_FILL : PAPER}" stroke="${INK}" stroke-width="1.4"/>
     <polygon points="${faceRight}" fill="${right === "#" ? GRAY_FILL : PAPER}" stroke="${INK}" stroke-width="1.4"/>
     ${label(top, cx + s * 0.72, cy - s * 0.45)}
     ${label(left, cx + s * 0.36, cy + s * 0.36)}
     ${label(right, cx + s * 1.08, cy + s * 0.36)}`,
    size,
    size
  );
}

/* ─── Public API ─── */

/* eslint-disable @typescript-eslint/no-explicit-any */
function getMeta(question: GeneratedQuestion): Record<string, any> {
  return (question.metadata ?? {}) as Record<string, any>;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export function renderStemSVG(question: GeneratedQuestion): string {
  const meta = getMeta(question);

  switch (question.category) {
    case "keyholes": {
      const cubes = (meta.cubes ?? []) as CubeCoord[];
      return `<div class="stem-flex">
        ${renderCubeStack(cubes, 150, { cubeSize: 26 })}
        <div class="stem-note">Aperture: ${escapeAttr(meta.correctAxis ?? "?")}-axis view</div>
      </div>`;
    }
    case "tfe": {
      const cubes = (meta.cubes ?? []) as CubeCoord[];
      const missing = String(meta.missingView ?? "?");
      const views = (meta.views ?? {}) as Record<string, TFEView>;
      const given = ["top", "front", "end"]
        .filter(v => v !== missing)
        .map(v => `<div class="view-grid"><span>${v}</span>${renderTFEView(views[v] ?? { cols: 2, rows: 2, edges: [] }, 96)}</div>`)
        .join("");
      return `<div class="stem-tfe">
        <div class="stem-flex">
          ${renderCubeStack(cubes, 140, { cubeSize: 24 })}
          <div class="stem-views">${given}</div>
        </div>
      </div>`;
    }
    case "angle_ranking": {
      const angles = (meta.angles ?? []) as number[];
      const diagram = angles
        .map((a, i) => renderAngleDiagram(a, i + 1, 118))
        .join("");
      return `<div class="stem-angles">${diagram}</div>`;
    }
    case "hole_punching": {
      const steps = (meta.foldSteps ?? []) as FoldStep[];
      const punch = (meta.punch ?? { x: 0, y: 0 }) as { x: number; y: number };
      return renderFoldedPaper(steps, punch, 190);
    }
    case "cube_counting": {
      const cubes = (meta.cubes ?? []) as CubeCoord[];
      const targetN = Number(meta.targetN ?? "?");
      return `<div class="stem-flex">
        ${renderCubeStack(cubes, 190, { cubeSize: 26, paintFaces: true })}
        <div class="stem-note">${escapeAttr(Number.isNaN(targetN) ? "?" : String(targetN))} sides painted</div>
      </div>`;
    }
    case "pattern_folding": {
      const net = (meta.net ?? []) as string[];
      return renderNet(net);
    }
    default:
      return renderFallback(question);
  }
}

export function renderOptionSVG(question: GeneratedQuestion, index: number): string {
  const meta = getMeta(question);

  switch (question.category) {
    case "keyholes": {
      const options = (meta.options ?? []) as boolean[][][];
      return renderSilhouette(options[index] ?? [], 96);
    }
    case "tfe": {
      const options = (meta.options ?? []) as TFEView[];
      return renderTFEView(options[index] ?? { cols: 2, rows: 2, edges: [] }, 96);
    }
    case "hole_punching": {
      const options = (meta.options ?? []) as { x: number; y: number }[][];
      return renderHoleGrid(options[index] ?? [], 110);
    }
    case "pattern_folding": {
      const options = (meta.options ?? []) as string[];
      return renderFoldedCube(options[index] ?? "", 120);
    }
    default:
      return renderFallback(question);
  }
}

export function renderOptionContent(question: GeneratedQuestion, index: number): string {
  const meta = getMeta(question);
  switch (question.category) {
    case "angle_ranking": {
      const options = (meta.options ?? []) as string[];
      return `<span class="option-perm">${escapeAttr(options[index] ?? "?")}</span>`;
    }
    case "cube_counting": {
      const choices = (meta.choices ?? [1, 2, 3, 4, 5]) as number[];
      return `<span class="option-number">${choices[index] ?? index + 1}</span>`;
    }
    default:
      return renderOptionSVG(question, index);
  }
}

export function renderAnswerText(question: GeneratedQuestion, index: number): string {
  const letter = String.fromCharCode(65 + index);
  const meta = getMeta(question);
  switch (question.category) {
    case "angle_ranking": {
      const options = (meta.options ?? []) as string[];
      return `${letter} (${options[index] ?? "?"})`;
    }
    case "cube_counting": {
      const choices = (meta.choices ?? []) as number[];
      return `${letter} (${choices[index] ?? "?"})`;
    }
    default:
      return letter;
  }
}

function renderFallback(question: GeneratedQuestion): string {
  return svgWrap(
    `<rect width="100%" height="100%" fill="${PAPER}" stroke="${INK}" stroke-width="1"/>
     <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="${INK}" font-size="13">${escapeAttr(question.category.replace(/_/g, " "))}</text>
     <text x="50%" y="62%" text-anchor="middle" fill="${INK}" font-size="9">Seed: ${question.seed}</text>`,
    200,
    200
  );
}
