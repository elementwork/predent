import {
  ManipATExplanation,
  ManipATQuestionRenderer,
  type PatSolutionPayload,
  type PublicPatQuestion,
} from "@/components/pat/ManipatQuestionRenderer";

interface PatFlashcardData {
  readonly publicQuestion?: PublicPatQuestion;
  readonly solution?: PatSolutionPayload;
}

interface PatFlashcardRendererProps {
  readonly category: string;
  readonly problem: unknown;
  readonly correctIndex: number;
  readonly revealAnswer?: boolean;
}

export function PatFlashcardRenderer({
  problem,
  revealAnswer = false,
}: PatFlashcardRendererProps) {
  const data = problem as PatFlashcardData;
  if (!data.publicQuestion) {
    return (
      <p className="text-sm text-[var(--text-secondary)]">
        This legacy PAT flashcard can no longer be rendered. A new ManipAT card
        will replace it on the next review cycle.
      </p>
    );
  }

  return (
    <div className="w-full">
      <ManipATQuestionRenderer
        question={data.publicQuestion}
        disabled
        correctIndex={
          revealAnswer ? data.solution?.correctChoiceIndex : undefined
        }
        compact
      />
      {revealAnswer && data.solution ? (
        <div className="mt-4 text-left">
          <ManipATExplanation solution={data.solution} />
        </div>
      ) : (
        <p className="text-center text-xs text-[var(--text-tertiary)] mt-4">
          Flip the card to reveal the answer
        </p>
      )}
    </div>
  );
}
