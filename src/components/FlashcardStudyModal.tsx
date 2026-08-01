import { useState } from "react";
import { X, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export interface Flashcard {
  front: string;
  back: string;
}

interface FlashcardStudyModalProps {
  title: string;
  cards: Flashcard[];
  isOpen: boolean;
  onClose: () => void;
}

export default function FlashcardStudyModal({
  title,
  cards,
  isOpen,
  onClose,
}: FlashcardStudyModalProps) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  if (!isOpen) return null;

  const current = cards[index];
  const progress = cards.length > 0 ? ((index + 1) / cards.length) * 100 : 0;

  const handleNext = () => {
    if (index < cards.length - 1) {
      setIndex(i => i + 1);
      setFlipped(false);
    }
  };

  const handlePrev = () => {
    if (index > 0) {
      setIndex(i => i - 1);
      setFlipped(false);
    }
  };

  const handleRestart = () => {
    setIndex(0);
    setFlipped(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <Card className="w-full max-w-lg bg-[var(--page-surface)] border-[var(--border-color)]">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">
              {title}
            </h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md hover:bg-[var(--page-muted)] text-[var(--text-tertiary)]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mb-2 flex items-center justify-between text-xs text-[var(--text-tertiary)]">
            <span>
              Card {index + 1} of {cards.length}
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-1.5 mb-6" />

          <div
            onClick={() => setFlipped(f => !f)}
            className="min-h-[180px] flex items-center justify-center p-6 rounded-xl bg-[var(--page-muted)] border border-[var(--border-color)] cursor-pointer transition-all hover:border-[var(--text-tertiary)] mb-6 text-center"
          >
            <p className="text-[var(--text-primary)] font-medium">
              {flipped ? current.back : current.front}
            </p>
          </div>

          <p className="text-center text-xs text-[var(--text-tertiary)] mb-4">
            Click card to flip
          </p>

          <div className="flex items-center justify-between gap-3">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={index === 0}
              className="border-[var(--border-color)] text-[var(--text-secondary)]"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Prev
            </Button>

            {index === cards.length - 1 ? (
              <Button
                variant="outline"
                onClick={handleRestart}
                className="border-[var(--border-color)] text-[var(--text-secondary)]"
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Restart
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
