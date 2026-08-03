import { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { usePageTitle } from "@/hooks/usePageTitle";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import {
  RotateCcw,
  CheckCircle,
  Brain,
  BookOpen,
  Clock,
  Play,
  Trophy,
  Sparkles,
} from "lucide-react";
import type { PatCategory } from "@/components/pat-generators/logic";
import { PatFlashcardRenderer } from "@/components/pat-generators/shared/PatFlashcardRenderer";

type ViewMode = "dashboard" | "review" | "complete";

interface NormalizedCard {
  source: "pat" | "dat";
  questionId: number;
  questionText: string;
  answerText: string;
  category?: string;
  difficulty?: string;
  problem?: unknown;
  correctIndex?: number;
}

const qualityLabels: Record<number, { label: string; color: string }> = {
  0: { label: "Again", color: "#EF4444" },
  2: { label: "Hard", color: "#F59E0B" },
  3: { label: "Good", color: "#10B981" },
  5: { label: "Easy", color: "#2563EB" },
};

const qualityKeys: Record<string, number> = {
  "1": 0,
  "2": 2,
  "3": 3,
  "4": 5,
};

/* eslint-disable @typescript-eslint/no-explicit-any */
function normalizeCard(raw: any): NormalizedCard {
  if (raw.source === "pat") {
    const data = raw.questionData as Record<string, any>;
    return {
      source: "pat",
      questionId: raw.questionId,
      questionText: "PAT question",
      answerText: "Flip to see the diagram answer",
      category: raw.category,
      difficulty: raw.difficulty,
      problem: data,
      correctIndex: data?.correctIndex ?? 0,
    };
  }
  const data = raw.questionData as {
    questionText?: string;
    options?: string[];
  };
  return {
    source: "dat",
    questionId: raw.questionId,
    questionText: data?.questionText ?? "Question",
    answerText: data?.options?.join(" / ") ?? "Answer",
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

function DashboardView({
  stats,
  dueCount,
  onStart,
  sourceFilter,
  setSourceFilter,
}: {
  stats?: {
    totalReviewed: number;
    cardsDueToday: number;
    mastery: {
      new: number;
      learning: number;
      review: number;
      mastered: number;
    };
  };
  dueCount: number;
  onStart: () => void;
  sourceFilter: "all" | "pat" | "dat";
  setSourceFilter: (f: "all" | "pat" | "dat") => void;
}) {
  const masteryItems = [
    { label: "New", count: stats?.mastery?.new ?? 0, color: "#2563EB" },
    {
      label: "Learning",
      count: stats?.mastery?.learning ?? 0,
      color: "#F59E0B",
    },
    { label: "Review", count: stats?.mastery?.review ?? 0, color: "#8B5CF6" },
    {
      label: "Mastered",
      count: stats?.mastery?.mastered ?? 0,
      color: "#10B981",
    },
  ];

  const totalMastery = masteryItems.reduce((s, m) => s + m.count, 0);

  return (
    <div className="min-h-screen bg-[var(--page-bg)] pt-20">
      <div className="section-container max-w-4xl mx-auto pb-20">
        <div className="flex items-center gap-3 mb-8">
          <Brain className="w-6 h-6 text-[#8B5CF6]" />
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Flashcards
          </h1>
        </div>

        {/* Source Filter */}
        <div className="flex gap-2 mb-6">
          {(["all", "pat", "dat"] as const).map(f => (
            <button
              key={f}
              onClick={() => setSourceFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                sourceFilter === f
                  ? "bg-[#8B5CF6] text-white"
                  : "bg-[var(--page-surface)] text-[var(--text-secondary)] hover:bg-[var(--page-muted)] border border-[var(--border-color)]"
              }`}
            >
              {f === "all" ? "All" : f.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="bg-[var(--page-surface)] border-[var(--border-color)]">
            <CardContent className="p-4 text-center">
              <Clock className="w-5 h-5 mx-auto mb-2 text-[#F59E0B]" />
              <p className="text-2xl font-bold text-[var(--text-primary)]">
                {dueCount}
              </p>
              <p className="text-xs text-[var(--text-tertiary)]">Due Today</p>
            </CardContent>
          </Card>
          <Card className="bg-[var(--page-surface)] border-[var(--border-color)]">
            <CardContent className="p-4 text-center">
              <CheckCircle className="w-5 h-5 mx-auto mb-2 text-[#10B981]" />
              <p className="text-2xl font-bold text-[var(--text-primary)]">
                {stats?.totalReviewed ?? 0}
              </p>
              <p className="text-xs text-[var(--text-tertiary)]">
                Total Reviewed
              </p>
            </CardContent>
          </Card>
          <Card className="bg-[var(--page-surface)] border-[var(--border-color)]">
            <CardContent className="p-4 text-center">
              <Sparkles className="w-5 h-5 mx-auto mb-2 text-[#8B5CF6]" />
              <p className="text-2xl font-bold text-[var(--text-primary)]">
                {stats?.mastery?.mastered ?? 0}
              </p>
              <p className="text-xs text-[var(--text-tertiary)]">Mastered</p>
            </CardContent>
          </Card>
        </div>

        {/* Mastery Breakdown */}
        <Card className="bg-[var(--page-surface)] border-[var(--border-color)] mb-6">
          <CardContent className="p-5">
            <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-4">
              Mastery Breakdown
            </h2>
            {totalMastery > 0 ? (
              <div className="space-y-3">
                <div className="h-3 bg-[var(--page-muted)] rounded-full overflow-hidden flex">
                  {masteryItems.map(m => (
                    <div
                      key={m.label}
                      className="h-full transition-all"
                      style={{
                        width: `${(m.count / totalMastery) * 100}%`,
                        backgroundColor: m.color,
                      }}
                    />
                  ))}
                </div>
                <div className="flex justify-between">
                  {masteryItems.map(m => (
                    <div key={m.label} className="flex items-center gap-1.5">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: m.color }}
                      />
                      <span className="text-xs text-[var(--text-secondary)]">
                        {m.label}
                      </span>
                      <span className="text-xs font-medium text-[var(--text-primary)]">
                        {m.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-[var(--text-tertiary)] text-center py-4">
                No cards reviewed yet. Start your first session!
              </p>
            )}
          </CardContent>
        </Card>

        {/* Start Button */}
        <Button
          className="w-full h-12 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-semibold text-base"
          onClick={onStart}
          disabled={dueCount === 0}
        >
          {dueCount > 0 ? (
            <>
              <Play className="w-4 h-4 mr-2" />
              Start Review ({dueCount} cards)
            </>
          ) : (
            "No Cards Due Today"
          )}
        </Button>
      </div>
    </div>
  );
}

function ReviewView({
  cards,
  currentIndex,
  flipped,
  onFlip,
  onRate,
}: {
  cards: NormalizedCard[];
  currentIndex: number;
  flipped: boolean;
  onFlip: () => void;
  onRate: (quality: number) => void;
}) {
  const card = cards[currentIndex];

  useEffect(() => {
    if (!card) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        if (!flipped) onFlip();
      } else if (flipped && qualityKeys[e.key] !== undefined) {
        onRate(qualityKeys[e.key]);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [card, flipped, onFlip, onRate]);

  if (!card) return null;

  const total = cards.length;
  const remaining = total - currentIndex;
  const progress = (currentIndex / total) * 100;

  return (
    <div className="min-h-screen bg-[var(--page-bg)] flex flex-col">
      {/* Top Bar */}
      <div className="bg-[var(--page-surface)] border-b border-[var(--border-color)] px-4 py-3">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[var(--text-secondary)]">
              {currentIndex + 1}{" "}
              <span className="text-[var(--text-tertiary)]">/ {total}</span>
            </span>
            <Badge
              variant="outline"
              className={`text-xs ${
                card.source === "pat"
                  ? "text-[#8B5CF6] border-[#8B5CF6]"
                  : "text-[#10B981] border-[#10B981]"
              }`}
            >
              {card.source.toUpperCase()}
            </Badge>
          </div>
          <Progress
            value={progress}
            className="h-1.5 bg-[var(--page-muted)]"
          />
          <p className="text-xs text-[var(--text-tertiary)] mt-1.5">
            {remaining} card{remaining !== 1 ? "s" : ""} remaining
          </p>
        </div>
      </div>

      {/* Card Area */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div
          className="w-full max-w-2xl cursor-pointer"
          onClick={!flipped ? onFlip : undefined}
        >
          <Card
            className={`bg-[var(--page-surface)] border-[var(--border-color)] transition-all duration-300 ${
              flipped
                ? "ring-2 ring-[#8B5CF6]"
                : "hover:border-[#8B5CF6]/50"
            }`}
          >
            <CardContent className="p-8 min-h-[320px] flex flex-col items-center justify-center text-center">
              {!flipped ? (
                card.source === "pat" ? (
                  <>
                    <BookOpen className="w-8 h-8 text-[var(--text-tertiary)] mb-4" />
                    <PatFlashcardRenderer
                      category={(card.category ?? "keyholes") as PatCategory}
                      problem={card.problem as never}
                      correctIndex={card.correctIndex ?? 0}
                    />
                    <p className="text-xs text-[var(--text-tertiary)] mt-4">
                      Click or press Space to reveal answer
                    </p>
                  </>
                ) : (
                  <>
                    <BookOpen className="w-8 h-8 text-[var(--text-tertiary)] mb-4" />
                    <p className="text-lg text-[var(--text-primary)] leading-relaxed">
                      {card.questionText}
                    </p>
                    <p className="text-xs text-[var(--text-tertiary)] mt-6">
                      Click or press Space to reveal answer
                    </p>
                  </>
                )
              ) : card.source === "pat" ? (
                <>
                  <CheckCircle className="w-8 h-8 text-[#10B981] mb-4" />
                  <PatFlashcardRenderer
                    category={(card.category ?? "keyholes") as PatCategory}
                    problem={card.problem as never}
                    correctIndex={card.correctIndex ?? 0}
                    revealAnswer
                  />
                </>
              ) : (
                <>
                  <CheckCircle className="w-8 h-8 text-[#10B981] mb-4" />
                  <p className="text-xs text-[var(--text-tertiary)] mb-2 uppercase tracking-wider">
                    Answer
                  </p>
                  <p className="text-lg text-[var(--text-primary)] leading-relaxed">
                    {card.answerText}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Rating Buttons */}
        {flipped && (
          <div className="mt-8 w-full max-w-2xl">
            <p className="text-sm text-[var(--text-tertiary)] text-center mb-3">
              How well did you know this?
            </p>
            <div className="grid grid-cols-4 gap-3">
              {([0, 2, 3, 5] as const).map(quality => {
                const q = qualityLabels[quality];
                return (
                  <Button
                    key={quality}
                    variant="outline"
                    className="h-14 flex flex-col gap-0.5 border-2 hover:bg-opacity-10 transition-all"
                    style={{
                      borderColor: q.color,
                      color: q.color,
                    }}
                    onClick={() => onRate(quality)}
                  >
                    <span className="text-sm font-semibold">{q.label}</span>
                    <span className="text-[10px] opacity-60">
                      [{Object.keys(qualityKeys).find(
                        k => qualityKeys[k] === quality
                      )}]
                    </span>
                  </Button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CompleteView({
  reviewedCount,
  againCount,
  hardCount,
  goodCount,
  easyCount,
  onRestart,
  onDashboard,
}: {
  reviewedCount: number;
  againCount: number;
  hardCount: number;
  goodCount: number;
  easyCount: number;
  onRestart: () => void;
  onDashboard: () => void;
}) {
  return (
    <div className="min-h-screen bg-[var(--page-bg)] pt-20">
      <div className="section-container max-w-2xl mx-auto pb-20 text-center">
        <Trophy className="w-16 h-16 text-[#F59E0B] mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
          Session Complete!
        </h1>
        <p className="text-[var(--text-secondary)] mb-8">
          You reviewed {reviewedCount} card
          {reviewedCount !== 1 ? "s" : ""}. Keep up the great work!
        </p>

        <Card className="bg-[var(--page-surface)] border-[var(--border-color)] mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: "Again", count: againCount, color: "#EF4444" },
                { label: "Hard", count: hardCount, color: "#F59E0B" },
                { label: "Good", count: goodCount, color: "#10B981" },
                { label: "Easy", count: easyCount, color: "#2563EB" },
              ].map(item => (
                <div key={item.label}>
                  <p
                    className="text-2xl font-bold"
                    style={{ color: item.color }}
                  >
                    {item.count}
                  </p>
                  <p className="text-xs text-[var(--text-tertiary)]">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button
            className="flex-1 h-11 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-semibold"
            onClick={onRestart}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Review Again
          </Button>
          <Button
            variant="outline"
            className="h-11 border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            onClick={onDashboard}
          >
            Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function FlashcardsPage() {
  usePageTitle("Flashcards");
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const utils = trpc.useUtils();

  const [view, setView] = useState<ViewMode>("dashboard");
  const [sourceFilter, setSourceFilter] = useState<"all" | "pat" | "dat">(
    "all"
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [ratings, setRatings] = useState<Record<number, number>>({});

  const { data: stats, isLoading: statsLoading } =
    trpc.flash.getStats.useQuery();
  const { data: dueCardsData, isLoading: cardsLoading } =
    trpc.flash.getDueCards.useQuery({ limit: 50 });
  const recordReview = trpc.flash.recordReview.useMutation({
    onSuccess: () => {
      utils.flash.invalidate();
    },
  });

  const allDueCards = dueCardsData ?? [];
  const filteredCards = useMemo(
    () =>
      sourceFilter === "all"
        ? allDueCards
        : allDueCards.filter((c: { source?: string }) => c.source === sourceFilter),
    [allDueCards, sourceFilter]
  );

  const normalizedCards: NormalizedCard[] = useMemo(
    () => filteredCards.map(normalizeCard),
    [filteredCards]
  );

  const handleStart = useCallback(() => {
    if (normalizedCards.length === 0) return;
    setView("review");
    setCurrentIndex(0);
    setFlipped(false);
    setRatings({});
  }, [normalizedCards.length]);

  const handleFlip = useCallback(() => {
    setFlipped(true);
  }, []);

  const handleRate = useCallback(
    (quality: number) => {
      const raw = filteredCards[currentIndex];
      if (!raw) return;

      recordReview.mutate({
        source: raw.source,
        questionId: raw.questionId,
        quality,
        category: raw.category as "keyholes" | "tfe" | "angle_ranking" | "hole_punching" | "cube_counting" | "pattern_folding" | undefined,
        difficulty: raw.difficulty as "easy" | "medium" | "hard" | undefined,
      });

      setRatings(prev => ({ ...prev, [currentIndex]: quality }));

      if (currentIndex < normalizedCards.length - 1) {
        setFlipped(false);
        setCurrentIndex(prev => prev + 1);
      } else {
        setView("complete");
      }
    },
    [currentIndex, normalizedCards.length, filteredCards, recordReview]
  );

  const handleRestart = useCallback(() => {
    setView("dashboard");
    setCurrentIndex(0);
    setFlipped(false);
    setRatings({});
  }, []);

  if (isAuthLoading || statsLoading || cardsLoading) {
    return (
      <div className="min-h-screen bg-[var(--page-bg)] pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-white/20 border-t-[#8B5CF6] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[var(--text-secondary)] text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[var(--page-bg)] pt-20">
        <div className="section-container max-w-7xl mx-auto pb-20 text-center">
          <Brain className="w-12 h-12 text-[#8B5CF6] mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
            Flashcards
          </h1>
          <p className="text-[var(--text-secondary)] mb-6">
            Sign in to track your flashcard progress and mastery.
          </p>
          <Button
            className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white"
            asChild
          >
            <Link to="/login">Sign In</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (view === "review") {
    return (
      <ReviewView
        cards={normalizedCards}
        currentIndex={currentIndex}
        flipped={flipped}
        onFlip={handleFlip}
        onRate={handleRate}
      />
    );
  }

  if (view === "complete") {
    const againCount = Object.values(ratings).filter(q => q === 0).length;
    const hardCount = Object.values(ratings).filter(q => q === 2).length;
    const goodCount = Object.values(ratings).filter(q => q === 3).length;
    const easyCount = Object.values(ratings).filter(q => q === 5).length;

    return (
      <CompleteView
        reviewedCount={Object.keys(ratings).length}
        againCount={againCount}
        hardCount={hardCount}
        goodCount={goodCount}
        easyCount={easyCount}
        onRestart={handleRestart}
        onDashboard={handleRestart}
      />
    );
  }

  return (
    <DashboardView
      stats={stats}
      dueCount={normalizedCards.length}
      onStart={handleStart}
      sourceFilter={sourceFilter}
      setSourceFilter={setSourceFilter}
    />
  );
}
