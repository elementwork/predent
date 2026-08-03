import type { GeneratedQuestion } from "../pat-types.js";

interface CubeCoord {
  x: number;
  y: number;
  z: number;
}

const EMPTY_CELL = "#f1f5f9";
const BORDER = "#e2e8f0";

function escapeAttr(value: unknown): string {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderCubeStack(
  cubes: CubeCoord[],
  size: number,
  cubeSize: number,
  spacing: number,
  color: string
): string {
  const sorted = [...cubes].sort(
    (a, b) => a.z - b.z || a.y - b.y || a.x - b.x
  );
  const iso = (x: number, y: number, z: number) => ({
    px: (x - y) * (cubeSize + spacing) * 0.72,
    py:
      -(x + y) * (cubeSize + spacing) * 0.36 -
      z * (cubeSize + spacing) * 0.72,
  });

  let minX = Infinity,
    maxX = -Infinity,
    minY = Infinity,
    maxY = -Infinity;
  for (const c of sorted) {
    const { px, py } = iso(c.x, c.y, c.z);
    minX = Math.min(minX, px - cubeSize * 0.2);
    maxX = Math.max(maxX, px + cubeSize * 1.4);
    minY = Math.min(minY, py - cubeSize * 1.2);
    maxY = Math.max(maxY, py + cubeSize * 0.8);
  }
  const offX = size / 2 - (minX + maxX) / 2;
  const offY = size / 2 - (minY + maxY) / 2;

  const faces = sorted
    .map((c) => {
      const { px, py } = iso(c.x, c.y, c.z);
      const s = cubeSize;
      return `<g stroke="${color}" stroke-width="1" stroke-linejoin="round">
        <polygon points="${px},${py - s * 0.5} ${px + s * 0.72},${py - s * 0.86} ${px + s * 1.44},${py - s * 0.5} ${px + s * 0.72},${py - s * 0.14}" fill="${color}" fill-opacity="0.35"/>
        <polygon points="${px},${py - s * 0.5} ${px + s * 0.72},${py - s * 0.14} ${px + s * 0.72},${py + s * 0.86} ${px},${py + s * 0.5}" fill="${color}" fill-opacity="0.28"/>
        <polygon points="${px + s * 0.72},${py - s * 0.14} ${px + s * 1.44},${py - s * 0.5} ${px + s * 1.44},${py + s * 0.5} ${px + s * 0.72},${py + s * 0.86}" fill="${color}" fill-opacity="0.22"/>
      </g>`;
    })
    .join("");

  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg" class="diagram-svg">
    <rect width="100%" height="100%" fill="${EMPTY_CELL}" rx="8"/>
    <g transform="translate(${offX}, ${offY})">${faces}</g>
  </svg>`;
}

function renderGrid(
  grid: boolean[][],
  size: number,
  filledColor: string
): string {
  if (!Array.isArray(grid) || grid.length === 0) {
    return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg" class="diagram-svg"><rect width="100%" height="100%" fill="${EMPTY_CELL}" rx="8"/></svg>`;
  }
  const dim = grid.length;
  const cell = (size - 16) / dim;
  const cells = grid
    .map((row, y) =>
      row
        .map((filled, x) => {
          const fill = filled ? filledColor : EMPTY_CELL;
          return `<rect x="${8 + x * cell}" y="${8 + y * cell}" width="${cell - 2}" height="${cell - 2}" rx="${cell * 0.12}" fill="${fill}" stroke="${BORDER}" stroke-width="1"/>`;
        })
        .join("")
    )
    .join("");

  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg" class="diagram-svg">
    <rect width="100%" height="100%" fill="${EMPTY_CELL}" rx="8"/>
    ${cells}
  </svg>`;
}

function renderAngleDiagram(angle: number, size: number): string {
  const center = size / 2;
  const radius = size * 0.38;
  const rad = (angle * Math.PI) / 180;
  const x2 = center + radius * Math.cos(rad);
  const y2 = center - radius * Math.sin(rad);
  const arcR = radius * 0.28;
  const largeArc = angle > 180 ? 1 : 0;
  const arcEndX = center + arcR * Math.cos(rad);
  const arcEndY = center - arcR * Math.sin(rad);

  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg" class="diagram-svg">
    <rect width="100%" height="100%" fill="${EMPTY_CELL}" rx="8"/>
    <line x1="${center}" y1="${center}" x2="${center + radius}" y2="${center}" stroke="#64748b" stroke-width="2" stroke-linecap="round"/>
    <line x1="${center}" y1="${center}" x2="${x2}" y2="${y2}" stroke="#64748b" stroke-width="2" stroke-linecap="round"/>
    <path d="M ${center + arcR} ${center} A ${arcR} ${arcR} 0 ${largeArc} 0 ${arcEndX} ${arcEndY}" fill="rgba(245, 158, 11, 0.15)" stroke="#F59E0B" stroke-width="2"/>
  </svg>`;
}

function renderFoldedPaper(
  fold: string,
  punch: { x: number; y: number },
  size: number
): string {
  const margin = 14;
  const paper = size - margin * 2;
  const foldLine =
    fold === "horizontal"
      ? `M ${margin} ${margin + paper / 2} L ${margin + paper} ${margin + paper / 2}`
      : fold === "vertical"
        ? `M ${margin + paper / 2} ${margin} L ${margin + paper / 2} ${margin + paper}`
        : `M ${margin} ${margin + paper} L ${margin + paper} ${margin}`;
  const px = margin + punch.x * paper;
  const py = margin + punch.y * paper;

  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg" class="diagram-svg">
    <rect width="100%" height="100%" fill="${EMPTY_CELL}" rx="8"/>
    <rect x="${margin}" y="${margin}" width="${paper}" height="${paper}" fill="#ffffff" stroke="#475569" stroke-width="1"/>
    <path d="${foldLine}" stroke="#D97706" stroke-width="1.5" stroke-dasharray="5 3" fill="none"/>
    <circle cx="${px + 1}" cy="${py + 1}" r="5" fill="rgba(0,0,0,0.15)"/>
    <circle cx="${px}" cy="${py}" r="5" fill="#EF4444"/>
  </svg>`;
}

function renderUnfoldedPaper(
  holes: { x: number; y: number }[],
  size: number
): string {
  const margin = 10;
  const paper = size - margin * 2;
  const dots = (holes ?? [])
    .map((h) => {
      const px = margin + h.x * paper;
      const py = margin + h.y * paper;
      return `<circle cx="${px}" cy="${py}" r="5" fill="#EF4444"/>`;
    })
    .join("");

  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg" class="diagram-svg">
    <rect width="100%" height="100%" fill="${EMPTY_CELL}" rx="8"/>
    <rect x="${margin}" y="${margin}" width="${paper}" height="${paper}" fill="#ffffff" stroke="#475569" stroke-width="1"/>
    ${dots}
  </svg>`;
}

function renderNet(symbols: string[]): string {
  const cell = 38;
  const positions = [
    { x: 1, y: 1 },
    { x: 1, y: 0 },
    { x: 1, y: 2 },
    { x: 0, y: 1 },
    { x: 2, y: 1 },
    { x: 1, y: 3 },
  ];
  const cells = positions
    .map((p, i) => {
      const symbol = symbols[i] ?? "";
      return `<rect x="${12 + p.x * cell}" y="${12 + p.y * cell}" width="${cell - 3}" height="${cell - 3}" rx="4" fill="#ffffff" stroke="#8B5CF6" stroke-width="1.5"/>
        <text x="${12 + p.x * cell + cell / 2 - 1}" y="${12 + p.y * cell + cell / 2 + 7}" fill="#8B5CF6" font-size="20" text-anchor="middle">${escapeAttr(symbol)}</text>`;
    })
    .join("");

  return `<svg width="160" height="210" viewBox="0 0 160 210" xmlns="http://www.w3.org/2000/svg" class="diagram-svg">
    <rect width="100%" height="100%" fill="${EMPTY_CELL}" rx="8"/>
    ${cells}
  </svg>`;
}

function renderCube3D(symbols: string[]): string {
  const size = 26;
  const cx = 70;
  const cy = 80;
  const faces = [
    { x: cx - size, y: cy, s: symbols[0] ?? "" },
    { x: cx - size, y: cy - size * 0.5, s: symbols[1] ?? "" },
    { x: cx, y: cy - size * 0.5, s: symbols[4] ?? "" },
  ]
    .map((f) => {
      return `<polygon points="${f.x},${f.y} ${f.x + size},${f.y - size * 0.5} ${f.x + size * 2},${f.y} ${f.x + size},${f.y + size * 0.5}" fill="#ffffff" stroke="#8B5CF6" stroke-width="1.2"/>
        <text x="${f.x + size}" y="${f.y + 5}" fill="#8B5CF6" font-size="16" text-anchor="middle">${escapeAttr(f.s)}</text>`;
    })
    .join("");

  return `<svg width="150" height="130" viewBox="0 0 150 130" xmlns="http://www.w3.org/2000/svg" class="diagram-svg">
    <rect width="100%" height="100%" fill="${EMPTY_CELL}" rx="8"/>
    ${faces}
  </svg>`;
}

function getMetadata(question: GeneratedQuestion): Record<string, unknown> {
  return (question.metadata ?? {}) as Record<string, unknown>;
}

export function renderStemSVG(question: GeneratedQuestion): string {
  const meta = getMetadata(question);

  switch (question.category) {
    case "keyholes": {
      const cubes = (meta.cubes ?? []) as CubeCoord[];
      return renderCubeStack(cubes, 180, 26, 2, "#2563EB");
    }
    case "tfe": {
      const shape = meta.shape as { cubes: CubeCoord[] } | undefined;
      const cubes = shape?.cubes ?? [];
      const givenViews = (meta.givenViews ?? []) as string[];
      const views = (shape ?? {}) as Record<string, boolean[][]>;
      const viewSvg = givenViews
        .map((view) => {
          const label = view.charAt(0).toUpperCase() + view.slice(1);
          const grid = views[view] ?? [];
          return `<div class="view-grid">
            ${renderGrid(grid, 80, "#6366F1")}
            <span>${label}</span>
          </div>`;
        })
        .join("");
      return `<div class="stem-tfe">
        ${renderCubeStack(cubes, 150, 22, 2, "#2563EB")}
        <div class="stem-views">${viewSvg}</div>
      </div>`;
    }
    case "angle_ranking": {
      const angles = (meta.angles ?? []) as number[];
      const diagram = angles.map((a) => renderAngleDiagram(a, 120)).join("");
      return `<div class="stem-angles">${diagram}</div>`;
    }
    case "hole_punching": {
      const foldProblem = meta.foldProblem as {
        fold: string;
        punch: { x: number; y: number };
      };
      const fold = foldProblem?.fold ?? "horizontal";
      const punch = foldProblem?.punch ?? { x: 0.5, y: 0.5 };
      return renderFoldedPaper(fold, punch, 180);
    }
    case "cube_counting": {
      const cubes = (meta.cubes ?? []) as CubeCoord[];
      return renderCubeStack(cubes, 220, 26, 2, "#2563EB");
    }
    case "pattern_folding": {
      const symbols = (meta.symbols ?? []) as string[];
      return renderNet(symbols);
    }
    default:
      return renderFallback(question);
  }
}

export function renderOptionSVG(
  question: GeneratedQuestion,
  index: number
): string {
  const meta = getMetadata(question);

  switch (question.category) {
    case "keyholes": {
      const options = (meta.options ?? []) as boolean[][][];
      return renderGrid(options[index] ?? [], 90, "#14B8A6");
    }
    case "tfe": {
      const options = (meta.options ?? []) as boolean[][][];
      return renderGrid(options[index] ?? [], 90, "#6366F1");
    }
    case "angle_ranking": {
      const angles = (meta.angles ?? []) as number[];
      return renderAngleDiagram(angles[index] ?? 90, 120);
    }
    case "hole_punching": {
      const options = (meta.options ?? []) as { x: number; y: number }[][];
      return renderUnfoldedPaper(options[index] ?? [], 110);
    }
    case "pattern_folding": {
      const options = (meta.options ?? []) as string[][];
      return renderCube3D(options[index] ?? []);
    }
    default:
      return renderFallback(question);
  }
}

export function renderOptionContent(
  question: GeneratedQuestion,
  index: number
): string {
  if (question.category === "cube_counting") {
    const meta = getMetadata(question);
    const choices = (meta.choices ?? ["A", "B", "C", "D"]) as number[];
    return `<span class="option-number">${choices[index] ?? index + 1}</span>`;
  }
  return renderOptionSVG(question, index);
}

export function renderAnswerText(
  question: GeneratedQuestion,
  index: number
): string {
  const letter = String.fromCharCode(65 + index);
  if (question.category === "cube_counting") {
    const meta = getMetadata(question);
    const choices = (meta.choices ?? ["1", "2", "3", "4"]) as number[];
    return `${letter} (${choices[index] ?? "?"})`;
  }
  return letter;
}

function renderFallback(question: GeneratedQuestion): string {
  return `<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" class="diagram-svg">
    <rect width="100%" height="100%" fill="${EMPTY_CELL}" rx="8"/>
    <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#64748b" font-size="14">${escapeAttr(question.category.replace(/_/g, " "))}</text>
    <text x="50%" y="65%" text-anchor="middle" fill="#94a3b8" font-size="10">Seed: ${question.seed}</text>
  </svg>`;
}
