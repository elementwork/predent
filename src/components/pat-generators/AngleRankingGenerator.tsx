import { TechAngle } from "./shared/tech";
import { usePatGenerator, type PatGeneratorProps } from "./shared/usePatGenerator";
import { GeneratorToolbar, ResultBanner } from "./shared/PatGeneratorUI";
import { generateAngleRankingProblem } from "./logic/angle-ranking";

export default function AngleRankingGenerator({
  config,
  onAnswer,
}: PatGeneratorProps) {
  const { controlled, difficulty, setDifficulty, problem, selectedIndex, result, regenerate, checkAnswer } =
    usePatGenerator("angle_ranking", generateAngleRankingProblem, config, onAnswer);

  const { angles, options, correctIndex } = problem;
  const letters = "ABCDEFGH";

  return (
    <div className="bg-[var(--page-surface)] border border-[var(--border-color)] rounded-xl p-5 shadow-sm">
      {!controlled && (
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-[var(--text-primary)] font-semibold">
              Angle Ranking Generator
            </h3>
            <p className="text-xs text-[var(--text-tertiary)]">
              Rank the four angles from smallest to largest.
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

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {angles.map((a, i) => (
          <div key={i} className="rounded-lg border border-[var(--border-color)] overflow-hidden">
            <TechAngle angle={a} label={i + 1} size={120} />
          </div>
        ))}
      </div>

      <p className="text-[var(--text-primary)] text-base font-medium mb-3">
        Rank the angles from smallest to largest.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {options.map((perm, i) => (
          <button
            key={i}
            onClick={() => checkAnswer(i, correctIndex)}
            disabled={!!result}
            className={`rounded-lg border-2 px-4 py-3 text-center font-mono text-sm font-bold tracking-widest transition-colors ${
              result && i === correctIndex
                ? "border-emerald-500 bg-emerald-500/10 text-emerald-500"
                : selectedIndex === i && result === "incorrect"
                  ? "border-red-500 bg-red-500/10 text-red-500"
                  : selectedIndex === i
                    ? "border-[#2563EB] bg-[#2563EB]/10 text-[var(--text-primary)]"
                    : "border-[var(--border-color)] bg-[var(--page-surface)] text-[var(--text-primary)] hover:border-[var(--text-tertiary)]"
            }`}
          >
            {perm}
          </button>
        ))}
      </div>

      {result && (
        <ResultBanner result={result} correctLabel={`option ${letters[correctIndex]} (${options[correctIndex]})`} />
      )}
    </div>
  );
}