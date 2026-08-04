import { TechIsoStack, TechTFEView } from "./shared/tech";
import { usePatGenerator, type PatGeneratorProps } from "./shared/usePatGenerator";
import { GeneratorToolbar, ResultBanner } from "./shared/PatGeneratorUI";
import { generateTFEProblem } from "./logic/tfe";

const VIEW_ORDER = ["top", "front", "end"] as const;
const VIEW_LABELS: Record<string, string> = {
  top: "Top",
  front: "Front",
  end: "End",
};

export default function TopFrontEndGenerator({
  config,
  onAnswer,
}: PatGeneratorProps) {
  const { controlled, difficulty, setDifficulty, problem, selectedIndex, result, regenerate, checkAnswer } =
    usePatGenerator("tfe", generateTFEProblem, config, onAnswer);

  const { cubes, missingView, views, options, correctIndex } = problem;
  const letters = "ABCDEFGH";

  return (
    <div className="bg-[var(--page-surface)] border border-[var(--border-color)] rounded-xl p-5 shadow-sm">
      {!controlled && (
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-[var(--text-primary)] font-semibold">
              Top Front End Generator
            </h3>
            <p className="text-xs text-[var(--text-tertiary)]">
              Identify the missing orthographic view.
            </p>
          </div>
          <GeneratorToolbar
            difficulty={difficulty}
            onDifficulty={d => {
              setDifficulty(d);
              regenerate();
            }}
            onRegenerate={regenerate}
          />
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-start gap-6 mb-6">
        <TechIsoStack cubes={cubes} size={150} cubeSize={24} className="shrink-0" />
        <div className="flex-1">
          <p className="text-[var(--text-primary)] text-lg font-medium mb-3">
            Which is the <span className="uppercase">{missingView}</span> view?
          </p>
          <div className="grid grid-cols-2 gap-3 max-w-sm">
            {VIEW_ORDER.filter(v => v !== missingView).map(v => (
              <div key={v} className="text-center">
                <div className="rounded-lg border border-[var(--border-color)] overflow-hidden">
                  <TechTFEView view={views[v]} size={100} />
                </div>
                <p className="text-xs text-[var(--text-tertiary)] mt-1 font-medium">
                  {VIEW_LABELS[v]}
                </p>
              </div>
            ))}
            <div className="text-center opacity-40">
              <div className="rounded-lg border border-dashed border-[var(--border-color)] overflow-hidden">
                <TechTFEView view={{ cols: 2, rows: 2, edges: [] }} size={100} />
              </div>
              <p className="text-xs text-[var(--text-tertiary)] mt-1 font-medium">
                ? — missing
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {options.map((view, i) => (
          <button
            key={i}
            onClick={() => checkAnswer(i, correctIndex)}
            disabled={!!result}
            className="text-left"
          >
            <div
              className="rounded-lg overflow-hidden"
              style={{
                border: `2px solid ${
                  result && i === correctIndex
                    ? "#10B981"
                    : selectedIndex === i && result === "incorrect"
                      ? "#EF4444"
                      : selectedIndex === i
                        ? "#2563EB"
                        : "var(--border-color)"
                }`,
              }}
            >
              <TechTFEView view={view} size={100} />
            </div>
            <p className="text-center text-xs text-[var(--text-tertiary)] mt-1">
              {letters[i]}
            </p>
          </button>
        ))}
      </div>

      {result && (
        <ResultBanner result={result} correctLabel={`option ${letters[correctIndex]}`} />
      )}
    </div>
  );
}