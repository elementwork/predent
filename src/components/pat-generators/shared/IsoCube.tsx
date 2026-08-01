import { useMemo } from "react";

export interface CubeCoord {
  x: number;
  y: number;
  z: number;
}

interface IsoCubeProps {
  cubes: CubeCoord[];
  size?: number;
  cubeSize?: number;
  spacing?: number;
  className?: string;
  highlightFaces?: boolean;
}

export function IsoCubeStack({
  cubes,
  size = 200,
  cubeSize = 24,
  spacing = 2,
  className = "",
  highlightFaces = false,
}: IsoCubeProps) {
  const { sorted, iso, centerOffset } = useMemo(() => {
    const sorted = [...cubes].sort(
      (a, b) => a.z - b.z || a.y - b.y || a.x - b.x
    );
    const iso = (x: number, y: number, z: number) => ({
      px: (x - y) * (cubeSize + spacing) * 0.72,
      py:
        -(x + y) * (cubeSize + spacing) * 0.36 -
        z * (cubeSize + spacing) * 0.72,
    });

    // Compute bounding box to center the stack
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
    const centerOffset = {
      x: size / 2 - (minX + maxX) / 2,
      y: size / 2 - (minY + maxY) / 2,
    };
    return { sorted, iso, centerOffset };
  }, [cubes, cubeSize, spacing, size]);

  const s = cubeSize;

  return (
    <svg
      width={size}
      height={size}
      className={`rounded-lg border border-[var(--border-color)] bg-[var(--page-muted)] ${className}`}
    >
      <defs>
        <linearGradient id="cubeTop" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.35" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.25" />
        </linearGradient>
        <linearGradient id="cubeLeft" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.28" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.18" />
        </linearGradient>
        <linearGradient id="cubeRight" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.22" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.12" />
        </linearGradient>
        <filter id="cubeShadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow
            dx="0"
            dy="2"
            stdDeviation="2"
            floodColor="var(--shadow-color, #000)"
            floodOpacity="0.25"
          />
        </filter>
      </defs>
      <g
        className="text-[#2563EB]"
        transform={`translate(${centerOffset.x}, ${centerOffset.y})`}
        filter="url(#cubeShadow)"
      >
        {sorted.map((c, i) => {
          const { px, py } = iso(c.x, c.y, c.z);
          const stroke = highlightFaces ? "#F59E0B" : "currentColor";
          return (
            <g key={i} stroke={stroke} strokeWidth={1} strokeLinejoin="round">
              <polygon
                points={`${px},${py - s * 0.5} ${px + s * 0.72},${py - s * 0.86} ${px + s * 1.44},${py - s * 0.5} ${px + s * 0.72},${py - s * 0.14}`}
                fill="url(#cubeTop)"
              />
              <polygon
                points={`${px},${py - s * 0.5} ${px + s * 0.72},${py - s * 0.14} ${px + s * 0.72},${py + s * 0.86} ${px},${py + s * 0.5}`}
                fill="url(#cubeLeft)"
              />
              <polygon
                points={`${px + s * 0.72},${py - s * 0.14} ${px + s * 1.44},${py - s * 0.5} ${px + s * 1.44},${py + s * 0.5} ${px + s * 0.72},${py + s * 0.86}`}
                fill="url(#cubeRight)"
              />
            </g>
          );
        })}
      </g>
    </svg>
  );
}

interface GridSvgProps {
  grid: boolean[][];
  size?: number;
  className?: string;
  filledColor?: string;
  emptyColor?: string;
}

export function GridSvg({
  grid,
  size = 120,
  className = "",
  filledColor = "#F59E0B",
  emptyColor = "var(--page-muted)",
}: GridSvgProps) {
  const dim = grid.length;
  const cell = (size - 16) / dim;

  return (
    <svg
      width={size}
      height={size}
      className={`rounded-lg border border-[var(--border-color)] bg-[var(--page-muted)] ${className}`}
    >
      {grid.map((row, y) =>
        row.map((filled, x) => (
          <rect
            key={`${x}-${y}`}
            x={8 + x * cell}
            y={8 + y * cell}
            width={cell - 2}
            height={cell - 2}
            rx={cell * 0.12}
            fill={filled ? filledColor : emptyColor}
            stroke="var(--border-color)"
            strokeWidth={1}
          />
        ))
      )}
    </svg>
  );
}

interface AngleSvgProps {
  angle: number;
  size?: number;
  className?: string;
}

export function AngleSvg({ angle, size = 130, className = "" }: AngleSvgProps) {
  const center = size / 2;
  const radius = size * 0.38;
  const rad = (angle * Math.PI) / 180;
  const x2 = center + radius * Math.cos(rad);
  const y2 = center - radius * Math.sin(rad);
  const arcR = radius * 0.28;
  const largeArc = angle > 180 ? 1 : 0;

  return (
    <svg
      width={size}
      height={size}
      className={`rounded-lg border border-[var(--border-color)] bg-[var(--page-muted)] ${className}`}
    >
      <line
        x1={center}
        y1={center}
        x2={center + radius}
        y2={center}
        stroke="var(--text-secondary)"
        strokeWidth={2}
        strokeLinecap="round"
      />
      <line
        x1={center}
        y1={center}
        x2={x2}
        y2={y2}
        stroke="var(--text-secondary)"
        strokeWidth={2}
        strokeLinecap="round"
      />
      <path
        d={`M ${center + arcR} ${center} A ${arcR} ${arcR} 0 ${largeArc} 0 ${center + arcR * Math.cos(rad)} ${center - arcR * Math.sin(rad)}`}
        fill="rgba(245, 158, 11, 0.15)"
        stroke="#F59E0B"
        strokeWidth={2}
      />
    </svg>
  );
}
