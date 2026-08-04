import { RefreshCw } from "lucide-react";
import type { Difficulty } from "../logic";

/** Difficulty selector row + regenerate button (uncontrolled mode only). */
export function GeneratorToolbar({
  difficulty,
  onDifficulty,
  onRegenerate,
}: {
  difficulty: Difficulty;
  onDifficulty: (d: Difficulty) => void;
  onRegenerate: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      {(["easy", "medium", "hard"] as Difficulty[]).map(d => (
        <button
          key={d}
          onClick={() => onDifficulty(d)}
          className={`px-2.5 py-1 rounded text-xs font-medium capitalize transition-colors ${
            difficulty === d
              ? "bg-[var(--text-primary)] text-[var(--page-bg)]"
              : "bg-[var(--page-muted)] text-[var(--text-secondary)] hover:bg-[var(--border-color)]"
          }`}
        >
          {d}
        </button>
      ))}
      <button
        onClick={onRegenerate}
        className="p-1.5 rounded bg-[var(--page-muted)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-color)] transition-colors"
        title="New question"
      >
        <RefreshCw className="w-4 h-4" />
      </button>
    </div>
  );
}

/** Feedback banner shown after answering. */
export function ResultBanner({
  result,
  correctLabel,
}: {
  result: "correct" | "incorrect";
  correctLabel: string;
}) {
  return (
    <div
      className={`p-3 rounded-lg text-sm ${
        result === "correct"
          ? "bg-emerald-500/10 text-emerald-500"
          : "bg-red-500/10 text-red-500"
      }`}
    >
      {result === "correct" ? (
        <span>Correct! {correctLabel}</span>
      ) : (
        <span>Incorrect. The correct answer is {correctLabel}.</span>
      )}
    </div>
  );
}
