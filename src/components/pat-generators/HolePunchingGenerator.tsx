import { TechFoldedPaper, TechHoleGrid } from "./shared/tech";
import { usePatGenerator, type PatGeneratorProps } from "./shared/usePatGenerator";
import { GeneratorToolbar, ResultBanner } from "./shared/PatGeneratorUI";
import { generateHolePunchingProblem } from "./logic/hole-punching";

export default function HolePunchingGenerator({
  config,
  onAnswer,
}: PatGeneratorProps) {
  const { controlled, difficulty, setDifficulty, problem, selectedIndex, result, regenerate, checkAnswer } =
    usePatGenerator("hole_punching", generateHolePunchingProblem, config, onAnswer);

  const { foldSteps, punch, options, correctIndex } = problem;
  const letters = "ABCDEFGHIJ";

  return (
    <div className="bg-[var(--page-surface)] border border-[var(--border-color)] rounded-xl p-5 shadow-sm">
      {!controlled && (
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-[var(--text-primary)] font-semibold">
              Hole Punching Generator
            </h3>
            <p className="text-xs text-[var(--text-tertiary)]">
              Unfold the paper and find the pattern of holes.
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
          <TechFoldedPaper steps={foldSteps} punch={punch} size={190} />
        </div>
        <div className="flex-1">
          <p className="text-[var(--text-primary)] text-lg font-medium mb-2">
            Which option shows the unfolded paper?
          </p>
          <p className="text-xs text-[var(--text-tertiary)]">
            Dashed lines are folds; the circle marks the punch hole. Trace the
            hole through each fold to its final positions.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
        {options.map((holes, i) => (
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
              <TechHoleGrid holes={holes} size={110} />
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