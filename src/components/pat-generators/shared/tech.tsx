import type { CubeCoord } from "./IsoCube";

export interface TFEEdge {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  hidden: boolean;
}

export interface TFEViewData {
  cols: number;
  rows: number;
  edges: TFEEdge[];
}

export interface FoldStepData {
  axis: "h" | "v" | "d";
  line: number;
}

const INK = "currentColor";
const DASH = "5 3";

function isoPoints(x: number, y: number, z: number, s: number) {
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

interface TechIsoStackProps {
  cubes: CubeCoord[];
  size?: number;
  cubeSize?: number;
  pad?: number;
  paintFaces?: boolean;
  className?: string;
}

export function TechIsoStack({
  cubes,
  size = 180,
  cubeSize = 26,
  pad = 18,
  paintFaces = false,
  className = "",
}: TechIsoStackProps) {
  const set = new Set(cubes.map(c => `${c.x},${c.y},${c.z}`));
  const sorted = [...cubes].sort((a, b) => a.z - b.z || a.y - b.y || a.x - b.x);

  let minX = Infinity,
    maxX = -Infinity,
    minY = Infinity,
    maxY = -Infinity;
  for (const c of sorted) {
    const p = isoPoints(c.x, c.y, c.z, cubeSize);
    minX = Math.min(minX, p.cx - cubeSize * 0.72);
    maxX = Math.max(maxX, p.cx + cubeSize * 1.44);
    minY = Math.min(minY, p.cy - cubeSize * 1.0);
    maxY = Math.max(maxY, p.cy + cubeSize * 0.8);
  }
  const offX = size / 2 - (minX + maxX) / 2;
  const offY = size / 2 - (minY + maxY) / 2;

  const fill = paintFaces ? "var(--text-tertiary)" : "transparent";

  return (
    <svg
      width={size + pad * 2}
      height={size + pad * 2}
      className={`block text-[var(--text-primary)] ${className}`}
    >
      <rect width="100%" height="100%" fill="var(--page-surface)" stroke="var(--border-color)" strokeWidth="1.2" />
      <g transform={`translate(${offX}, ${offY})`}>
        {sorted.map((c, i) => {
          const p = isoPoints(c.x, c.y, c.z, cubeSize);
          void set;
          return (
            <g key={i} stroke={INK} strokeWidth="1.1" strokeLinejoin="round">
              <polygon points={p.top} fill={fill} />
              <polygon points={p.left} fill={fill} />
              <polygon points={p.right} fill={fill} />
            </g>
          );
        })}
      </g>
    </svg>
  );
}

interface TechSilhouetteProps {
  grid: boolean[][];
  size?: number;
  className?: string;
}

export function TechSilhouette({ grid, size = 100, className = "" }: TechSilhouetteProps) {
  if (!Array.isArray(grid) || grid.length === 0) {
    return (
      <svg width={size} height={size} className={`block text-[var(--text-primary)] ${className}`}>
        <rect width="100%" height="100%" fill="var(--page-surface)" stroke="var(--border-color)" strokeWidth="1.2" />
      </svg>
    );
  }
  const rows = grid.length;
  const cols = grid[0]?.length ?? rows;
  const pad = 6;
  const cell = (size - pad * 2) / Math.max(rows, cols);
  const offX = (size - cell * cols) / 2;
  const offY = (size - cell * rows) / 2;

  return (
    <svg width={size} height={size} className={`block text-[var(--text-primary)] ${className}`}>
      <rect width="100%" height="100%" fill="var(--page-surface)" stroke="var(--border-color)" strokeWidth="1.2" />
      {grid.map((row, r) =>
        row.map((filled, c) => {
          const x = offX + c * cell;
          const y = offY + r * cell;
          return (
            <rect
              key={`${r}-${c}`}
              x={x}
              y={y}
              width={cell - 1}
              height={cell - 1}
              fill={filled ? INK : "var(--page-surface)"}
              stroke="var(--border-color)"
              strokeWidth="0.8"
            />
          );
        })
      )}
    </svg>
  );
}

interface TechTFEViewProps {
  view: TFEViewData;
  size?: number;
  className?: string;
}

export function TechTFEView({ view, size = 100, className = "" }: TechTFEViewProps) {
  const pad = 10;
  const cell = (size - pad * 2) / Math.max(view.cols, view.rows);
  const offX = (size - cell * view.cols) / 2;
  const offY = (size - cell * view.rows) / 2;
  return (
    <svg width={size} height={size} className={`block text-[var(--text-primary)] ${className}`}>
      <rect
        x={pad - 4}
        y={pad - 4}
        width={size - pad * 2 + 8}
        height={size - pad * 2 + 8}
        fill="var(--page-surface)"
        stroke="var(--border-color)"
        strokeWidth="1"
        opacity="0.35"
      />
      {view.edges.map((e, i) => (
        <line
          key={i}
          x1={offX + e.x1 * cell}
          y1={offY + e.y1 * cell}
          x2={offX + e.x2 * cell}
          y2={offY + e.y2 * cell}
          stroke={INK}
          strokeWidth="1.6"
          strokeDasharray={e.hidden ? DASH : undefined}
        />
      ))}
    </svg>
  );
}

interface TechAngleProps {
  angle: number;
  label?: number;
  size?: number;
  className?: string;
}

export function TechAngle({ angle, label, size = 120, className = "" }: TechAngleProps) {
  const center = size / 2;
  const radius = size * 0.36;
  const rad = (angle * Math.PI) / 180;
  const x2 = center + radius * Math.cos(rad);
  const y2 = center - radius * Math.sin(rad);
  const arcR = radius * 0.3;
  const sweep = angle <= 180 ? 0 : 1;
  return (
    <svg width={size} height={size} className={`block text-[var(--text-primary)] ${className}`}>
      <rect width="100%" height="100%" fill="var(--page-surface)" stroke="var(--border-color)" strokeWidth="1" />
      <line x1={center} y1={center} x2={center + radius} y2={center} stroke={INK} strokeWidth="2" />
      <line x1={center} y1={center} x2={x2} y2={y2} stroke={INK} strokeWidth="2" />
      <path
        d={`M ${center + arcR} ${center} A ${arcR} ${arcR} 0 0 ${sweep} ${center + arcR * Math.cos(rad)} ${center - arcR * Math.sin(rad)}`}
        fill="none"
        stroke={INK}
        strokeWidth="1.4"
      />
      {label !== undefined && (
        <text x={center} y={size - 8} textAnchor="middle" fontSize="14" fontWeight="bold" fill={INK}>
          {label}
        </text>
      )}
    </svg>
  );
}

interface TechFoldedPaperProps {
  steps: FoldStepData[];
  punch: { x: number; y: number };
  size?: number;
  className?: string;
}

export function TechFoldedPaper({ steps, punch, size = 200, className = "" }: TechFoldedPaperProps) {
  const pad = 24;
  const paper = size - pad * 2;
  const GRID = 4;
  const cell = paper / GRID;

  const foldPaths = (steps ?? []).map((f, i) => {
    if (f.axis === "h") {
      const y = pad + (GRID - f.line) * cell;
      return <line key={i} x1={pad} y1={y} x2={pad + paper} y2={y} stroke={INK} strokeWidth="1.2" strokeDasharray={DASH} />;
    }
    if (f.axis === "v") {
      const x = pad + f.line * cell;
      return <line key={i} x1={x} y1={pad} x2={x} y2={pad + paper} stroke={INK} strokeWidth="1.2" strokeDasharray={DASH} />;
    }
    const main = f.line === 0;
    return (
      <line
        key={i}
        x1={main ? pad : pad + paper}
        y1={main ? pad + paper : pad}
        x2={main ? pad + paper : pad}
        y2={main ? pad : pad + paper}
        stroke={INK}
        strokeWidth="1.2"
        strokeDasharray={DASH}
      />
    );
  });

  const px = pad + punch.x * cell;
  const py = pad + (GRID - 1 - punch.y) * cell;

  return (
    <svg width={size} height={size} className={`block text-[var(--text-primary)] ${className}`}>
      <rect width="100%" height="100%" fill="var(--page-surface)" stroke="var(--border-color)" strokeWidth="1" />
      <rect x={pad} y={pad} width={paper} height={paper} fill="var(--page-surface)" stroke="var(--border-color)" strokeWidth="1.4" />
      {foldPaths}
      <circle cx={px} cy={py} r={cell * 0.16} fill="var(--page-surface)" stroke={INK} strokeWidth="1.6" />
    </svg>
  );
}

interface TechHoleGridProps {
  holes: { x: number; y: number }[];
  size?: number;
  className?: string;
}

export function TechHoleGrid({ holes, size = 120, className = "" }: TechHoleGridProps) {
  const GRID = 4;
  const pad = 8;
  const cell = (size - pad * 2) / GRID;
  return (
    <svg width={size} height={size} className={`block text-[var(--text-primary)] ${className}`}>
      <rect width="100%" height="100%" fill="var(--page-surface)" stroke="var(--border-color)" strokeWidth="1" />
      <rect
        x={pad}
        y={pad}
        width={cell * GRID}
        height={cell * GRID}
        fill="var(--page-surface)"
        stroke="var(--border-color)"
        strokeWidth="1.4"
      />
      {[1, 2, 3].map(i => (
        <g key={i} stroke="var(--border-color)" strokeWidth="0.6">
          <line x1={pad + i * cell} y1={pad} x2={pad + i * cell} y2={pad + cell * GRID} />
          <line x1={pad} y1={pad + i * cell} x2={pad + cell * GRID} y2={pad + i * cell} />
        </g>
      ))}
      {(holes ?? []).map((h, i) => (
        <circle
          key={i}
          cx={pad + (h.x + 0.5) * cell}
          cy={pad + (GRID - 1 - h.y + 0.5) * cell}
          r={cell * 0.14}
          fill={INK}
          stroke={INK}
        />
      ))}
    </svg>
  );
}

const NET_POSITIONS: [number, number][] = [
  [1, 1], // front
  [1, 0], // top
  [1, 2], // bottom
  [0, 1], // left
  [2, 1], // right
  [1, 3], // back
];

interface TechNetProps {
  net: string[];
  className?: string;
}

export function TechNet({ net, className = "" }: TechNetProps) {
  const cell = 36;
  const w = 170;
  const h = 190;
  const x0 = (w - 3 * cell) / 2;
  const y0 = (h - 4 * cell) / 2;
  return (
    <svg width={w} height={h} className={`block text-[var(--text-primary)] ${className}`}>
      <rect width="100%" height="100%" fill="var(--page-surface)" stroke="var(--border-color)" strokeWidth="1" />
      {NET_POSITIONS.map(([gx, gy], i) => {
        const x = x0 + gx * cell;
        const y = y0 + gy * cell;
        const symbol = net[i] ?? "";
        const shaded = symbol === "#";
        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={cell - 3}
              height={cell - 3}
              fill={shaded ? "var(--text-tertiary)" : "var(--page-surface)"}
              stroke="var(--border-color)"
              strokeWidth="1.3"
            />
            {symbol && !shaded && (
              <text x={x + cell / 2} y={y + cell / 2 + 6} textAnchor="middle" fontSize="20" fill={INK}>
                {symbol}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

interface TechFoldedCubeProps {
  marks: string;
  size?: number;
  className?: string;
}

export function TechFoldedCube({ marks, size = 130, className = "" }: TechFoldedCubeProps) {
  const s = size * 0.34;
  const cx = size / 2;
  const cy = size / 2 + size * 0.06;
  const parts = marks.split("|");
  const top = parts[0] ?? "";
  const left = parts[1] ?? "";
  const right = parts[2] ?? "";
  const p = (dx: number, dy: number) => `${cx + dx},${cy + dy}`;
  const faceTop = `${p(0, -s * 0.45)} ${p(s * 0.72, -s * 0.72)} ${p(s * 1.44, -s * 0.45)} ${p(s * 0.72, -s * 0.18)}`;
  const faceLeft = `${p(0, -s * 0.45)} ${p(s * 0.72, -s * 0.18)} ${p(s * 0.72, s * 0.72)} ${p(0, s * 0.45)}`;
  const faceRight = `${p(s * 0.72, -s * 0.18)} ${p(s * 1.44, -s * 0.45)} ${p(s * 1.44, s * 0.45)} ${p(s * 0.72, s * 0.72)}`;
  const label = (mark: string, lx: number, ly: number) =>
    mark ? (
      <text x={lx} y={ly} textAnchor="middle" fontSize="18" fill={INK}>
        {mark}
      </text>
    ) : null;
  const fillOf = (mark: string) => (mark === "#" ? "var(--text-tertiary)" : "var(--page-surface)");
  return (
    <svg width={size} height={size} className={`block text-[var(--text-primary)] ${className}`}>
      <rect width="100%" height="100%" fill="var(--page-surface)" stroke="var(--border-color)" strokeWidth="1" />
      <polygon points={faceTop} fill={fillOf(top)} stroke="var(--border-color)" strokeWidth="1.4" />
      <polygon points={faceLeft} fill={fillOf(left)} stroke="var(--border-color)" strokeWidth="1.4" />
      <polygon points={faceRight} fill={fillOf(right)} stroke="var(--border-color)" strokeWidth="1.4" />
      {label(top, cx + s * 0.72, cy - s * 0.45)}
      {label(left, cx + s * 0.36, cy + s * 0.36)}
      {label(right, cx + s * 1.08, cy + s * 0.36)}
    </svg>
  );
}
