import { TechIsoStack, TechSilhouette } from "./shared/tech";
import { usePatGenerator, type PatGeneratorProps } from "./shared/usePatGenerator";
import { GeneratorToolbar, ResultBanner } from "./shared/PatGeneratorUI";
import { generateKeyholesProblem } from "./logic/keyholes";

export default function KeyholesGenerator({
  config,
  onAnswer,
}: PatGeneratorProps) {
  const { controlled, difficulty, setDifficulty, problem, selectedIndex, result, regenerate, checkAnswer } =
    usePatGenerator("keyholes", generateKeyholesProblem, config, onAnswer);

  const { cubes, options, correctIndex } = problem;
  const letters = "ABCDEFGHIJ";

  return (
    <div className="bg-[var(--page-surface)] border border-[var(--border-color)] rounded-xl p-5 shadow-sm">
      {!controlled && (
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-[var(--text-primary)] font-semibold">
              Keyholes Generator
            </h3>
            <p className="text-xs text-[var(--text-tertiary)]">
              Pick the aperture the object can pass straight through.
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
        <TechIsoStack cubes={cubes} size={170} cubeSize={26} className="shrink-0" />
        <div className="flex-1">
          <p className="text-[var(--text-primary)] text-lg font-medium mb-2">
            Which keyhole matches this object?
          </p>
          <p className="text-xs text-[var(--text-tertiary)]">
            The object rotates through the aperture along the{" "}
            <span className="font-medium text-[var(--text-primary)]">
              {problem.correctAxis}
            </span>{" "}
            axis. Match the silhouette exactly.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
        {options.map((grid, i) => (
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
              <TechSilhouette grid={grid} size={96} />
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