import type { ProblemData, PatCategory } from "../logic";
import {
  IsoCubeStack,
  GridSvg,
  AngleSvg,
  type CubeCoord,
} from "./IsoCube";

interface PatFlashcardRendererProps {
  category: PatCategory;
  problem: ProblemData;
  correctIndex: number;
  revealAnswer?: boolean;
}

const LETTERS = ["A", "B", "C", "D"];

function FoldedPaper({
  fold,
  punch,
  size = 160,
}: {
  fold: string;
  punch: { x: number; y: number };
  size?: number;
}) {
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

  return (
    <svg
      width={size}
      height={size}
      className="rounded-lg border border-[var(--border-color)] bg-[var(--page-muted)]"
    >
      <rect
        x={margin}
        y={margin}
        width={paper}
        height={paper}
        fill="#ffffff"
        stroke="var(--text-secondary)"
        strokeWidth={1}
      />
      <path
        d={foldLine}
        stroke="#D97706"
        strokeWidth={1.5}
        strokeDasharray="5 3"
        fill="none"
      />
      <circle cx={px + 1} cy={py + 1} r={5} fill="rgba(0,0,0,0.15)" />
      <circle cx={px} cy={py} r={5} fill="#EF4444" />
    </svg>
  );
}

function UnfoldedPaper({
  holes,
  size = 100,
}: {
  holes: { x: number; y: number }[];
  size?: number;
}) {
  const margin = 10;
  const paper = size - margin * 2;
  return (
    <svg
      width={size}
      height={size}
      className="rounded-lg border border-[var(--border-color)] bg-[var(--page-muted)]"
    >
      <rect
        x={margin}
        y={margin}
        width={paper}
        height={paper}
        fill="#ffffff"
        stroke="var(--text-secondary)"
        strokeWidth={1}
      />
      {(holes ?? []).map((h, i) => (
        <circle
          key={i}
          cx={margin + h.x * paper}
          cy={margin + h.y * paper}
          r={5}
          fill="#EF4444"
        />
      ))}
    </svg>
  );
}

const NET_POSITIONS = [
  { x: 1, y: 1 },
  { x: 1, y: 0 },
  { x: 1, y: 2 },
  { x: 0, y: 1 },
  { x: 2, y: 1 },
  { x: 1, y: 3 },
];

function NetSvg({ symbols }: { symbols: string[] }) {
  const cell = 34;
  return (
    <svg
      width={150}
      height={190}
      className="rounded-lg border border-[var(--border-color)] bg-[var(--page-muted)]"
    >
      {NET_POSITIONS.map((p, i) => (
        <g key={i}>
          <rect
            x={10 + p.x * cell}
            y={10 + p.y * cell}
            width={cell - 3}
            height={cell - 3}
            rx={4}
            fill="#ffffff"
            stroke="#8B5CF6"
            strokeWidth={1.5}
          />
          <text
            x={10 + p.x * cell + cell / 2 - 1}
            y={10 + p.y * cell + cell / 2 + 7}
            fill="#8B5CF6"
            fontSize={18}
            textAnchor="middle"
          >
            {symbols[i] ?? ""}
          </text>
        </g>
      ))}
    </svg>
  );
}

function Cube3DSvg({ symbols }: { symbols: string[] }) {
  const size = 24;
  const cx = 62;
  const cy = 68;
  const faces = [
    { x: cx - size, y: cy, s: symbols[0] ?? "" },
    { x: cx - size, y: cy - size * 0.5, s: symbols[1] ?? "" },
    { x: cx, y: cy - size * 0.5, s: symbols[4] ?? "" },
  ];
  return (
    <svg
      width={140}
      height={120}
      className="rounded-lg border border-[var(--border-color)] bg-[var(--page-muted)]"
    >
      {faces.map((f, i) => (
        <g key={i}>
          <polygon
            points={`${f.x},${f.y} ${f.x + size},${f.y - size * 0.5} ${f.x + size * 2},${f.y} ${f.x + size},${f.y + size * 0.5}`}
            fill="#ffffff"
            stroke="#8B5CF6"
            strokeWidth={1.2}
          />
          <text
            x={f.x + size}
            y={f.y + 5}
            fill="#8B5CF6"
            fontSize={15}
            textAnchor="middle"
          >
            {f.s}
          </text>
        </g>
      ))}
    </svg>
  );
}

const PROMPTS: Record<PatCategory, string> = {
  keyholes: "Which keyhole does this object pass through?",
  tfe: "Which view is missing?",
  angle_ranking: "Rank the angles from smallest to largest.",
  hole_punching: "Which option shows the unfolded paper?",
  cube_counting: "How many cubes are painted on the asked number of sides?",
  pattern_folding: "Which cube does this net fold into?",
};

export function PatFlashcardRenderer({
  category,
  problem,
  correctIndex,
  revealAnswer = false,
}: PatFlashcardRendererProps) {
  const meta = problem as unknown as Record<string, unknown>;

  const renderStem = () => {
    switch (category) {
      case "keyholes":
        return (
          <IsoCubeStack
            cubes={(meta.cubes ?? []) as CubeCoord[]}
            size={190}
            cubeSize={26}
          />
        );
      case "tfe": {
        const shape = meta.shape as
          | { cubes: CubeCoord[]; top?: boolean[][]; front?: boolean[][]; end?: boolean[][] }
          | undefined;
        const givenViews = (meta.givenViews ?? []) as string[];
        return (
          <div className="flex items-center gap-4">
            <IsoCubeStack
              cubes={shape?.cubes ?? []}
              size={150}
              cubeSize={22}
            />
            <div className="flex gap-2">
              {givenViews.map(view => (
                <div key={view} className="flex flex-col items-center gap-1">
                  <GridSvg
                    grid={(shape?.[view as keyof typeof shape] ?? []) as boolean[][]}
                    size={78}
                    filledColor="#6366F1"
                  />
                  <span className="text-[10px] text-[var(--text-tertiary)] uppercase">
                    {view}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      }
      case "angle_ranking":
        return (
          <div className="grid grid-cols-4 gap-2">
            {((meta.angles ?? []) as number[]).map((a, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <AngleSvg angle={a} size={100} />
                <span className="text-xs font-semibold text-[var(--text-secondary)]">
                  {LETTERS[i]}
                </span>
              </div>
            ))}
          </div>
        );
      case "hole_punching": {
        const fp = meta.foldProblem as
          | { fold: string; punch: { x: number; y: number } }
          | undefined;
        return (
          <FoldedPaper
            fold={fp?.fold ?? "horizontal"}
            punch={fp?.punch ?? { x: 0.5, y: 0.5 }}
          />
        );
      }
      case "cube_counting":
        return (
          <IsoCubeStack
            cubes={(meta.cubes ?? []) as CubeCoord[]}
            size={230}
            cubeSize={28}
          />
        );
      case "pattern_folding":
        return <NetSvg symbols={(meta.symbols ?? []) as string[]} />;
    }
  };

  const renderOption = (index: number) => {
    switch (category) {
      case "keyholes":
        return (
          <GridSvg
            grid={((meta.options ?? []) as boolean[][][])[index] ?? []}
            size={80}
            filledColor="#14B8A6"
          />
        );
      case "tfe":
        return (
          <GridSvg
            grid={((meta.options ?? []) as boolean[][][])[index] ?? []}
            size={80}
            filledColor="#6366F1"
          />
        );
      case "angle_ranking":
        return (
          <AngleSvg
            angle={((meta.angles ?? []) as number[])[index] ?? 90}
            size={80}
          />
        );
      case "hole_punching":
        return (
          <UnfoldedPaper
            holes={((meta.options ?? []) as { x: number; y: number }[][])[index] ?? []}
            size={80}
          />
        );
      case "cube_counting":
        return (
          <span className="text-2xl font-bold text-[var(--text-primary)]">
            {((meta.choices ?? [1, 2, 3, 4]) as number[])[index] ?? "?"}
          </span>
        );
      case "pattern_folding":
        return (
          <Cube3DSvg
            symbols={((meta.options ?? []) as string[][])[index] ?? []}
          />
        );
    }
  };

  const answerLabel = () => {
    const letter = LETTERS[correctIndex];
    switch (category) {
      case "angle_ranking":
        return `Smallest angle: ${letter}`;
      case "cube_counting":
        return `${letter} — ${((meta.choices ?? []) as number[])[correctIndex] ?? "?"} cubes`;
      default:
        return letter;
    }
  };

  return (
    <div className="w-full">
      <p className="text-sm font-semibold text-[var(--text-secondary)] mb-3 uppercase tracking-wide">
        {PROMPTS[category]}
      </p>
      <div className="flex justify-center mb-4">{renderStem()}</div>
      <div className="grid grid-cols-4 gap-3">
        {[0, 1, 2, 3].map(i => (
          <div
            key={i}
            className="flex flex-col items-center gap-1 rounded-lg border border-[var(--border-color)] p-2"
          >
            <span className="text-xs font-bold text-[var(--text-tertiary)]">
              {LETTERS[i]}
            </span>
            {renderOption(i)}
          </div>
        ))}
      </div>
      {revealAnswer ? (
        <p className="text-center text-sm font-bold text-[#10B981] mt-4">
          Correct answer: {answerLabel()}
        </p>
      ) : (
        <p className="text-center text-xs text-[var(--text-tertiary)] mt-4">
          Flip the card to reveal the answer
        </p>
      )}
    </div>
  );
}
