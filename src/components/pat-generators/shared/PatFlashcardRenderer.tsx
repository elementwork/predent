import type { ProblemData, PatCategory } from "../logic";
import {
  TechIsoStack,
  TechSilhouette,
  TechTFEView,
  TechAngle,
  TechFoldedPaper,
  TechHoleGrid,
  TechNet,
  TechFoldedCube,
  type TFEViewData,
} from "./tech";
import type { CubeCoord } from "./IsoCube";

interface PatFlashcardRendererProps {
  category: PatCategory;
  problem: ProblemData;
  correctIndex: number;
  revealAnswer?: boolean;
}

const LETTERS = "ABCDEFGHIJ";

function optionCount(category: PatCategory): number {
  switch (category) {
    case "keyholes":
    case "hole_punching":
    case "cube_counting":
      return 5;
    default:
      return 4;
  }
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
  const meta = problem as unknown as {
    cubes?: CubeCoord[];
    views?: Record<string, TFEViewData>;
    missingView?: string;
    angles?: number[];
    foldSteps?: { axis: "h" | "v" | "d"; line: number }[];
    punch?: { x: number; y: number };
    net?: string[];
    options?: unknown[];
    choices?: number[];
  };
  const count = optionCount(category);

  const renderStem = () => {
    switch (category) {
      case "keyholes":
        return (
          <TechIsoStack
            cubes={(meta.cubes ?? []) as CubeCoord[]}
            size={180}
            cubeSize={26}
          />
        );
      case "tfe": {
        const views = (meta.views ?? {}) as Record<string, TFEViewData>;
        const missing = String(meta.missingView ?? "?");
        return (
          <div className="flex items-center gap-4">
            <TechIsoStack
              cubes={(meta.cubes ?? []) as CubeCoord[]}
              size={140}
              cubeSize={22}
            />
            <div className="flex gap-2">
              {["top", "front", "end"]
                .filter(v => v !== missing)
                .map(view => (
                  <div key={view} className="flex flex-col items-center gap-1">
                    <TechTFEView
                      view={views[view] ?? { cols: 2, rows: 2, edges: [] }}
                      size={78}
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
                <TechAngle angle={a} label={i + 1} size={100} />
              </div>
            ))}
          </div>
        );
      case "hole_punching":
        return (
          <TechFoldedPaper
            steps={(meta.foldSteps ?? []) as { axis: "h" | "v" | "d"; line: number }[]}
            punch={(meta.punch ?? { x: 0, y: 0 }) as { x: number; y: number }}
            size={170}
          />
        );
      case "cube_counting":
        return (
          <TechIsoStack
            cubes={(meta.cubes ?? []) as CubeCoord[]}
            size={220}
            cubeSize={26}
            paintFaces
          />
        );
      case "pattern_folding":
        return <TechNet net={(meta.net ?? []) as string[]} />;
    }
  };

  const renderOption = (index: number) => {
    switch (category) {
      case "keyholes":
        return (
          <TechSilhouette
            grid={((meta.options ?? []) as boolean[][][])[index] ?? []}
            size={84}
          />
        );
      case "tfe":
        return (
          <TechTFEView
            view={
              ((meta.options ?? []) as TFEViewData[])[index] ?? {
                cols: 2,
                rows: 2,
                edges: [],
              }
            }
            size={84}
          />
        );
      case "angle_ranking":
        return (
          <span className="text-lg font-bold font-mono tracking-widest text-[var(--text-primary)]">
            {((meta.options ?? []) as string[])[index] ?? "?"}
          </span>
        );
      case "hole_punching":
        return (
          <TechHoleGrid
            holes={((meta.options ?? []) as { x: number; y: number }[][])[index] ?? []}
            size={90}
          />
        );
      case "cube_counting":
        return (
          <span className="text-2xl font-bold text-[var(--text-primary)]">
            {((meta.choices ?? [1, 2, 3, 4, 5]) as number[])[index] ?? "?"}
          </span>
        );
      case "pattern_folding":
        return (
          <TechFoldedCube
            marks={((meta.options ?? []) as string[])[index] ?? ""}
            size={110}
          />
        );
    }
  };

  const answerLabel = () => {
    const letter = LETTERS[correctIndex];
    switch (category) {
      case "angle_ranking":
        return `${letter} — ${((meta.options ?? []) as string[])[correctIndex] ?? "?"}`;
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
      <div className={`grid gap-3 ${count === 5 ? "grid-cols-5" : "grid-cols-4"}`}>
        {Array.from({ length: count }, (_, i) => (
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
