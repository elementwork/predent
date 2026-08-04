import { TechIsoStack } from "./shared/tech";
import { usePatGenerator, type PatGeneratorProps } from "./shared/usePatGenerator";
import { GeneratorToolbar, ResultBanner } from "./shared/PatGeneratorUI";
import { generateCubeCountingProblem } from "./logic/cube-counting";

export default function CubeCountingGenerator({
  config,
  onAnswer,
}: PatGeneratorProps) {
  const { controlled, difficulty, setDifficulty, problem, selectedIndex, result, regenerate, checkAnswer } =
    usePatGenerator("cube_counting", generateCubeCountingProblem, config, onAnswer);

  const { cubes, targetN, choices, answer } = problem;
  const letters = "ABCDEFGHIJ";
  const correctIndex = choices.indexOf(answer);

  return (
    <div className="bg-[var(--page-surface)] border border-[var(--border-color)] rounded-xl p-5 shadow-sm">
      {!controlled && (
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-[var(--text-primary)] font-semibold">
              Cube Counting Generator
            </h3>
            <p className="text-xs text-[var(--text-tertiary)]">
              Count cubes with the given number of painted sides.
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
        <TechIsoStack cubes={cubes} size={200} cubeSize={26} paintFaces className="shrink-0" />
        <div className="flex-1">
          <p className="text-[var(--text-primary)] text-lg font-medium mb-2">
            How many cubes have exactly{" "}
            <span className="font-semibold">{targetN}</span> painted side
            {targetN === 1 ? "" : "s"}?
          </p>
          <p className="text-xs text-[var(--text-tertiary)]">
            Shaded faces are painted. Count the small cubes with exactly{" "}
            {targetN} painted {targetN === 1 ? "face" : "faces"} — hidden support
            cubes count too.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
        {choices.map((n, i) => (
          <button
            key={i}
            onClick={() => checkAnswer(i, correctIndex)}
            disabled={!!result}
            className={`rounded-lg border-2 py-3 text-center transition-colors ${
              result && i === correctIndex
                ? "border-emerald-500 bg-emerald-500/10"
                : selectedIndex === i && result === "incorrect"
                  ? "border-red-500 bg-red-500/10"
                  : selectedIndex === i
                    ? "border-[#2563EB] bg-[#2563EB]/10"
                    : "border-[var(--border-color)] bg-[var(--page-surface)]"
            }`}
          >
            <span className="text-2xl font-bold text-[var(--text-primary)]">
              {n}
            </span>
            <span className="block text-[10px] text-[var(--text-tertiary)] mt-0.5">
              {letters[i]}
            </span>
          </button>
        ))}
      </div>

      {result && (
        <ResultBanner
          result={result}
          correctLabel={`${answer} — option ${letters[correctIndex]}`}
        />
      )}
    </div>
  );
}