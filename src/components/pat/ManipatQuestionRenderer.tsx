export type ManipATCategory =
  | "aperture"
  | "view-recognition"
  | "angle"
  | "paper-folding"
  | "cube-counting"
  | "form-development";

export interface PublicPatAsset {
  readonly kind: "prompt-svg";
  readonly contentHash: string;
  readonly svg: string;
}

export interface PublicPatChoice {
  readonly index: number;
  readonly label?: string;
  readonly svg?: string;
}

export interface PublicPatQuestion {
  readonly engineVersion: string;
  readonly schemaVersion: number;
  readonly category: ManipATCategory;
  readonly difficultyBand: 1 | 2 | 3 | 4 | 5;
  readonly choiceCount: number;
  readonly promptText: string;
  readonly promptAssets: readonly PublicPatAsset[];
  readonly choices: readonly PublicPatChoice[];
  readonly timeTargetSeconds: number;
}

export interface PatSolutionPayload {
  readonly correctChoiceIndex: number;
  readonly answerDisplay: string;
  readonly explanationHtml: string;
  readonly correctChoiceSvg?: string;
}

interface ManipATQuestionRendererProps {
  readonly question: PublicPatQuestion;
  readonly selectedIndex?: number;
  readonly onSelect?: (index: number) => void;
  readonly disabled?: boolean;
  readonly correctIndex?: number;
  readonly compact?: boolean;
}

const LETTERS = "ABCDE";

function SvgArtwork({
  svg,
  compact = false,
}: {
  readonly svg: string;
  readonly compact?: boolean;
}) {
  return (
    <div
      className={
        compact
          ? "manipat-svg w-full flex items-center justify-center [&_svg]:block [&_svg]:w-full [&_svg]:h-auto [&_svg]:max-h-36 [&_svg]:max-w-full"
          : "manipat-svg w-full flex items-center justify-center [&_svg]:block [&_svg]:w-full [&_svg]:h-auto [&_svg]:max-h-72 [&_svg]:max-w-full"
      }
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

export function ManipATQuestionRenderer({
  question,
  selectedIndex,
  onSelect,
  disabled = false,
  correctIndex,
  compact = false,
}: ManipATQuestionRendererProps) {
  const choiceColumns =
    question.choiceCount === 5
      ? "grid-cols-2 sm:grid-cols-5"
      : "grid-cols-2 sm:grid-cols-4";

  return (
    <div className="w-full">
      <p className="text-sm sm:text-base font-semibold text-[var(--text-primary)] mb-4 text-center">
        {question.promptText}
      </p>

      <div
        className={`grid gap-3 mb-5 ${
          question.promptAssets.length > 1
            ? "grid-cols-1 sm:grid-cols-2"
            : "grid-cols-1"
        }`}
      >
        {question.promptAssets.map((asset, index) => (
          <div
            key={`${asset.contentHash}-${index}`}
            className="rounded-xl bg-white border border-slate-200 p-3 min-h-36 flex items-center justify-center overflow-hidden"
          >
            <SvgArtwork svg={asset.svg} compact={compact} />
          </div>
        ))}
      </div>

      <div className={`grid ${choiceColumns} gap-2 sm:gap-3`}>
        {question.choices.map(choice => {
          const selected = selectedIndex === choice.index;
          const correct = correctIndex === choice.index;
          const wrongSelected =
            correctIndex !== undefined && selected && !correct;

          return (
            <button
              key={choice.index}
              type="button"
              disabled={disabled}
              onClick={() => onSelect?.(choice.index)}
              aria-pressed={selected}
              className={`min-h-24 rounded-xl border p-2 sm:p-3 transition-all bg-[var(--page-surface)] ${
                correct
                  ? "border-[#10B981] ring-2 ring-[#10B981]/30"
                  : wrongSelected
                    ? "border-[#EF4444] ring-2 ring-[#EF4444]/30"
                    : selected
                      ? "border-[#2563EB] ring-2 ring-[#2563EB]/30"
                      : "border-[var(--border-color)] hover:border-[var(--text-tertiary)]"
              } ${disabled ? "cursor-default" : "cursor-pointer"}`}
            >
              <div className="flex items-start gap-2 h-full">
                <span
                  className={`w-6 h-6 shrink-0 rounded-full flex items-center justify-center text-xs font-bold ${
                    correct
                      ? "bg-[#10B981] text-white"
                      : wrongSelected
                        ? "bg-[#EF4444] text-white"
                        : selected
                          ? "bg-[#2563EB] text-white"
                          : "bg-[var(--page-muted)] text-[var(--text-secondary)]"
                  }`}
                >
                  {LETTERS[choice.index] ?? choice.index + 1}
                </span>
                <div className="flex-1 min-w-0 flex items-center justify-center h-full">
                  {choice.svg ? (
                    <SvgArtwork svg={choice.svg} compact />
                  ) : (
                    <span className="font-mono font-semibold text-sm sm:text-base text-[var(--text-primary)]">
                      {choice.label ?? "—"}
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function ManipATExplanation({
  solution,
}: {
  readonly solution: PatSolutionPayload;
}) {
  return (
    <div className="rounded-xl border border-[var(--border-color)] bg-[var(--page-surface)] p-4">
      <p className="text-sm font-semibold text-[#10B981] mb-3">
        Correct answer: {solution.answerDisplay}
      </p>
      {solution.correctChoiceSvg && (
        <div className="rounded-lg bg-white border border-slate-200 p-3 mb-3">
          <SvgArtwork svg={solution.correctChoiceSvg} compact />
        </div>
      )}
      <div
        className="text-sm leading-relaxed text-[var(--text-secondary)] [&_h4]:font-semibold [&_h4]:text-[var(--text-primary)] [&_h4]:mt-3 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:my-1"
        dangerouslySetInnerHTML={{ __html: solution.explanationHtml }}
      />
    </div>
  );
}
