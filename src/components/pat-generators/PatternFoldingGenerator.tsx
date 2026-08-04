import { TechNet, TechFoldedCube } from "./shared/tech";
import { usePatGenerator, type PatGeneratorProps } from "./shared/usePatGenerator";
import { GeneratorToolbar, ResultBanner } from "./shared/PatGeneratorUI";
import { generatePatternFoldingProblem } from "./logic/pattern-folding";

export default function PatternFoldingGenerator({
  config,
  onAnswer,
}: PatGeneratorProps) {
  const { controlled, difficulty, setDifficulty, problem, selectedIndex, result, regenerate, checkAnswer } =
    usePatGenerator("pattern_folding", generatePatternFoldingProblem, config, onAnswer);

  const { net, options, correctIndex } = problem;
  const letters = "ABCDEFGH";

  return (
    <div className="bg-[var(--page-surface)] border border-[var(--border-color)] rounded-xl p-5 shadow-sm">
      {!controlled && (
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-[var(--text-primary)] font-semibold">
              Pattern Folding Generator
            </h3>
            <p className="text-xs text-[var(--text-tertiary)]">
              Fold the net into a cube and match the visible faces.
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

      <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
        <div className="rounded-lg border border-[var(--border-color)] overflow-hidden">
          <TechNet net={net} />
        </div>
        <div className="flex-1">
          <p className="text-[var(--text-primary)] text-lg font-medium mb-2">
            Which cube does this net fold into?
          </p>
          <p className="text-xs text-[var(--text-tertiary)]">
            Fold the pattern along the edges. Only the top, left, and right
            faces of the folded cube are visible.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {options.map((marks, i) => (
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
              <TechFoldedCube marks={marks} size={130} />
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