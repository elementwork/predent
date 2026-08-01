import { useState, useCallback, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { usePageTitle } from "@/hooks/usePageTitle";
import { AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Clock,
  Flag,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  RotateCcw,
  Home,
  Pause,
  Filter,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { events } from "@/lib/analytics";
import {
  generateQuestions,
  type GeneratedQuestion,
  type PatCategory,
  type Difficulty as GenDifficulty,
  getCorrectAnswer,
} from "@/components/pat-generators/logic";
import KeyholesGenerator from "@/components/pat-generators/KeyholesGenerator";
import TopFrontEndGenerator from "@/components/pat-generators/TopFrontEndGenerator";
import AngleRankingGenerator from "@/components/pat-generators/AngleRankingGenerator";
import HolePunchingGenerator from "@/components/pat-generators/HolePunchingGenerator";
import CubeCountingGenerator from "@/components/pat-generators/CubeCountingGenerator";
import PatternFoldingGenerator from "@/components/pat-generators/PatternFoldingGenerator";

type PracticeMode = "setup" | "active" | "paused" | "review";
type ApiDifficulty = "beginner" | "intermediate" | "advanced" | "elite";

const modes = [
  { id: "quick", name: "Quick Practice", desc: "10 random questions", icon: Zap },
  { id: "category", name: "Category Drill", desc: "Focus on one category", icon: Filter },
  { id: "timed", name: "Timed Set", desc: "15 questions, 15 minutes", icon: Clock },
  { id: "mixed", name: "Mixed Practice", desc: "All categories mixed", icon: RotateCcw },
  { id: "exam", name: "Exam Mode", desc: "90 questions, 60 minutes", icon: Check },
];

const categoryMeta: Record<
  string,
  { name: string; color: string }
> = {
  keyholes: { name: "Keyholes", color: "#14B8A6" },
  tfe: { name: "Top-Front-End", color: "#6366F1" },
  angle_ranking: { name: "Angle Ranking", color: "#F59E0B" },
  hole_punching: { name: "Hole Punching", color: "#F43F5E" },
  cube_counting: { name: "Cube Counting", color: "#10B981" },
  pattern_folding: { name: "Pattern Folding", color: "#8B5CF6" },
};

const difficultyToGen: Record<ApiDifficulty, GenDifficulty> = {
  beginner: "easy",
  intermediate: "medium",
  advanced: "hard",
  elite: "hard",
};

const genToApi: Record<GenDifficulty, ApiDifficulty> = {
  easy: "beginner",
  medium: "intermediate",
  hard: "advanced",
};

const allCategories: PatCategory[] = [
  "keyholes",
  "tfe",
  "angle_ranking",
  "hole_punching",
  "cube_counting",
  "pattern_folding",
];

function catDisplay(categoryId: string) {
  return categoryMeta[categoryId] ?? { name: categoryId, color: "#2563EB" };
}

function QuestionRenderer({
  question,
  onAnswer,
}: {
  question: GeneratedQuestion;
  onAnswer: (result: {
    isCorrect: boolean;
    timeSpent: number;
    answerIndex: number;
  }) => void;
}) {
  const config = { seed: question.seed, difficulty: question.difficulty };
  const props = { config, onAnswer };
  switch (question.category) {
    case "keyholes":
      return <KeyholesGenerator {...props} />;
    case "tfe":
      return <TopFrontEndGenerator {...props} />;
    case "angle_ranking":
      return <AngleRankingGenerator {...props} />;
    case "hole_punching":
      return <HolePunchingGenerator {...props} />;
    case "cube_counting":
      return <CubeCountingGenerator {...props} />;
    case "pattern_folding":
      return <PatternFoldingGenerator {...props} />;
    default:
      return null;
  }
}

/* ─── Setup Screen ─── */
function SetupScreen({
  onStart,
  quota,
}: {
  onStart: (config: {
    mode: string;
    category?: string;
    difficulty: string;
    count: number;
    timeLimit: boolean;
  }) => void;
  quota?: { tier: string; quota: number; used: number; remaining: number };
}) {
  const [selectedMode, setSelectedMode] = useState("quick");
  const [selectedCategory, setSelectedCategory] = useState<string>("keyholes");
  const [selectedDifficulty, setSelectedDifficulty] =
    useState<string>("INTERMEDIATE");
  const [questionCount, setQuestionCount] = useState(10);
  const [timeLimit, setTimeLimit] = useState(true);

  const effectiveCount =
    selectedMode === "timed"
      ? 15
      : selectedMode === "exam"
        ? 90
        : questionCount;
  const overQuota = quota ? effectiveCount > quota.remaining : false;

  return (
    <div className="min-h-screen bg-[var(--page-bg)] pt-20">
      <div className="section-container max-w-7xl mx-auto pb-20">
        <Link
          to="/pat-academy"
          className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to PAT Academy
        </Link>

        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">
          Practice Setup
        </h1>

        {/* Quota Banner */}
        {quota && (
          <div className="mb-6 p-4 rounded-xl bg-[var(--page-surface)] border border-[var(--border-color)]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-[var(--text-primary)]">
                Questions Remaining
              </span>
              <span className="text-sm text-[var(--text-secondary)]">
                {quota.remaining} / {quota.quota}
              </span>
            </div>
            <Progress
              value={(quota.used / quota.quota) * 100}
              className="h-2 bg-[var(--page-muted)]"
            />
            {overQuota && (
              <p className="text-xs text-[#EF4444] mt-2">
                Not enough questions remaining.{" "}
                <Link to="/pricing" className="underline">
                  Upgrade
                </Link>{" "}
                for more.
              </p>
            )}
          </div>
        )}

        {/* Mode Selection */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-[var(--text-secondary)] mb-3 uppercase tracking-wider">
            Select Mode
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {modes.map(mode => (
              <button
                key={mode.id}
                onClick={() => setSelectedMode(mode.id)}
                className={`flex items-center gap-3 p-4 rounded-xl border transition-all text-left ${
                  selectedMode === mode.id
                    ? "border-[#2563EB] bg-[#2563EB]/10"
                    : "border-[var(--border-color)] bg-[var(--page-surface)] hover:border-[var(--text-tertiary)]"
                }`}
              >
                <mode.icon
                  className={`w-5 h-5 ${selectedMode === mode.id ? "text-[#2563EB]" : "text-[var(--text-tertiary)]"}`}
                />
                <div>
                  <p
                    className={`text-sm font-medium ${selectedMode === mode.id ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]"}`}
                  >
                    {mode.name}
                  </p>
                  <p className="text-xs text-[var(--text-tertiary)]">
                    {mode.desc}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Category Selection */}
        {selectedMode === "category" && (
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-[var(--text-secondary)] mb-3 uppercase tracking-wider">
              Category
            </h2>
            <div className="flex flex-wrap gap-2">
              {allCategories.map(catId => {
                const cat = catDisplay(catId);
                return (
                  <button
                    key={catId}
                    onClick={() => setSelectedCategory(catId)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedCategory === catId
                        ? "text-white"
                        : "bg-[var(--page-surface)] text-[var(--text-secondary)] hover:bg-[var(--page-muted)]"
                    }`}
                    style={
                      selectedCategory === catId
                        ? { backgroundColor: cat.color }
                        : {}
                    }
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Difficulty */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-[var(--text-secondary)] mb-3 uppercase tracking-wider">
            Difficulty
          </h2>
          <div className="flex gap-2">
            {["BEGINNER", "INTERMEDIATE", "ADVANCED", "ELITE"].map(d => (
              <button
                key={d}
                onClick={() => setSelectedDifficulty(d)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  selectedDifficulty === d
                    ? "bg-[#2563EB] text-[var(--text-primary)]"
                    : "bg-[var(--page-surface)] text-[var(--text-secondary)] hover:bg-[var(--page-muted)]"
                }`}
              >
                {d.charAt(0) + d.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Question Count */}
        {selectedMode !== "timed" && selectedMode !== "exam" && (
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-[var(--text-secondary)] mb-3 uppercase tracking-wider">
              Questions: {questionCount}
            </h2>
            <input
              type="range"
              min={5}
              max={50}
              step={5}
              value={questionCount}
              onChange={e => setQuestionCount(Number(e.target.value))}
              className="w-full accent-[#2563EB]"
            />
            <div className="flex justify-between text-xs text-[var(--text-tertiary)] mt-1">
              <span>5</span>
              <span>50</span>
            </div>
          </div>
        )}

        {/* Time Limit Toggle */}
        <div className="mb-8 flex items-center justify-between p-4 rounded-xl bg-[var(--page-surface)] border border-[var(--border-color)]">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-[var(--text-tertiary)]" />
            <div>
              <p className="text-sm font-medium text-[var(--text-primary)]">
                Time Limit
              </p>
              <p className="text-xs text-[var(--text-tertiary)]">
                Use question target time
              </p>
            </div>
          </div>
          <button
            onClick={() => setTimeLimit(!timeLimit)}
            className={`w-12 h-6 rounded-full transition-colors ${timeLimit ? "bg-[#2563EB]" : "bg-white/20"}`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${timeLimit ? "translate-x-6" : "translate-x-0.5"}`}
            />
          </button>
        </div>

        <Button
          className="w-full h-12 bg-[#2563EB] hover:bg-[#1D4ED8] text-[var(--text-primary)] font-semibold text-base"
          onClick={() =>
            onStart({
              mode: selectedMode,
              category: selectedCategory,
              difficulty: selectedDifficulty,
              count: questionCount,
              timeLimit,
            })
          }
          disabled={overQuota}
        >
          {overQuota ? "Upgrade Required" : "Start Practice"}
        </Button>
      </div>
    </div>
  );
}

/* ─── Active Practice Screen ─── */
function ActiveScreen({
  questions,
  onFinish,
  sessionId,
}: {
  questions: GeneratedQuestion[];
  onFinish: (
    answers: Record<number, number>,
    flagged: number[],
    timeSpent: Record<number, number>
  ) => void;
  sessionId: string;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [flagged, setFlagged] = useState<number[]>([]);
  const [mode, setMode] = useState<"active" | "paused" | "review">("active");
  const [timeLeft, setTimeLeft] = useState(questions[0]?.timeTarget ?? 40);
  const timeSpentRef = useRef<Record<number, number>>({});
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recordedRef = useRef<Set<number>>(new Set());
  const recordAttempt = trpc.pat.recordAttempt.useMutation();

  const question = questions[currentIndex];
  const totalQuestions = questions.length;

  const recordCurrentAttempt = useCallback(
    (answerIndex: number) => {
      if (!question || recordedRef.current.has(currentIndex)) return;
      recordedRef.current.add(currentIndex);
      const time = timeSpentRef.current[currentIndex] ?? 0;
      const isCorrect =
        getCorrectAnswer(question.category, {
          seed: question.seed,
          difficulty: question.difficulty,
        }) === answerIndex;
      recordAttempt.mutate({
        category: question.category,
        difficulty: genToApi[question.difficulty],
        seed: question.seed,
        userAnswer: answerIndex,
        timeSpent: time,
        sessionId,
      });
      events.patQuestionAnswered(
        question.category,
        question.difficulty,
        isCorrect
      );
    },
    [question, currentIndex, sessionId, recordAttempt]
  );

  const handleNextInternal = useCallback(() => {
    const answer = answers[currentIndex];
    if (answer !== undefined) recordCurrentAttempt(answer);
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(prev => prev + 1);
      setTimeLeft(questions[currentIndex + 1]?.timeTarget ?? 40);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setMode("review");
      onFinish(answers, flagged, timeSpentRef.current);
    }
  }, [
    recordCurrentAttempt,
    currentIndex,
    totalQuestions,
    answers,
    questions,
    flagged,
    onFinish,
  ]);

  const handleNext = useCallback(
    () => handleNextInternal(),
    [handleNextInternal]
  );

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setTimeLeft(questions[currentIndex - 1]?.timeTarget ?? 40);
    }
  }, [currentIndex, questions]);

  const handleFlag = useCallback(() => {
    setFlagged(prev =>
      prev.includes(currentIndex)
        ? prev.filter(i => i !== currentIndex)
        : [...prev, currentIndex]
    );
  }, [currentIndex]);

  const handleSubmit = useCallback(() => {
    const answer = answers[currentIndex];
    if (answer !== undefined) recordCurrentAttempt(answer);
    if (timerRef.current) clearInterval(timerRef.current);
    setMode("review");
    onFinish(answers, flagged, timeSpentRef.current);
  }, [recordCurrentAttempt, currentIndex, answers, flagged, onFinish]);

  const togglePause = useCallback(() => {
    setMode(prev => (prev === "active" ? "paused" : "active"));
  }, []);

  // Timer effect
  useEffect(() => {
    if (mode === "active" && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          timeSpentRef.current[currentIndex] =
            (timeSpentRef.current[currentIndex] || 0) + 1;
          if (prev <= 1) {
            handleNextInternal();
            return questions[currentIndex]?.timeTarget ?? 40;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, currentIndex, handleNextInternal]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (mode === "review") return;
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrevious();
      if (e.key === " ") {
        e.preventDefault();
        handleFlag();
      }
      if (e.key === "Enter") handleNext();
      if (e.key === "Escape") togglePause();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [mode, handleNext, handlePrevious, handleFlag, togglePause]);

  const catD = catDisplay(question?.category ?? "keyholes");

  if (mode === "paused") {
    return (
      <div className="min-h-screen bg-[var(--page-bg)] flex items-center justify-center">
        <Card className="bg-[var(--page-surface)] border-[var(--border-color)] w-full max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <Pause className="w-12 h-12 text-[#F59E0B] mx-auto mb-4" />
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">
              Practice Paused
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mb-6">
              Question {currentIndex + 1} of {totalQuestions}
            </p>
            <div className="flex flex-col gap-3">
              <Button
                className="bg-[#2563EB] hover:bg-[#1D4ED8] text-[var(--text-primary)]"
                onClick={togglePause}
              >
                Resume
              </Button>
              <Button
                variant="outline"
                className="border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                onClick={() => window.location.reload()}
              >
                Quit & Restart
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--page-bg)] flex flex-col">
      {/* Top Bar */}
      <div className="bg-[var(--page-surface)] border-b border-[var(--border-color)] px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={togglePause}
              className="p-1.5 rounded-md hover:bg-[var(--page-muted)] transition-colors"
            >
              <Pause className="w-4 h-4 text-[var(--text-secondary)]" />
            </button>
            <span className="text-sm text-[var(--text-secondary)]">
              {currentIndex + 1}{" "}
              <span className="text-[var(--text-tertiary)]">
                / {totalQuestions}
              </span>
            </span>
            <Badge
              style={{
                backgroundColor: `${catD.color}20`,
                color: catD.color,
                borderColor: catD.color,
              }}
              variant="outline"
              className="text-xs"
            >
              {catD.name}
            </Badge>
            <Badge
              variant="outline"
              className="text-xs text-[var(--text-tertiary)] border-[var(--border-color)]"
            >
              {question?.difficulty.toUpperCase()}
            </Badge>
          </div>

          <div className="flex items-center gap-4">
            <div
              className={`flex items-center gap-1.5 ${timeLeft <= 10 ? "text-[#EF4444]" : "text-[var(--text-secondary)]"}`}
            >
              <Clock className="w-4 h-4" />
              <span
                className={`text-sm font-mono font-medium ${timeLeft <= 10 ? "animate-pulse" : ""}`}
              >
                {Math.floor(timeLeft / 60)}:
                {(timeLeft % 60).toString().padStart(2, "0")}
              </span>
            </div>
            <button
              onClick={handleFlag}
              className={`p-1.5 rounded-md transition-colors ${flagged.includes(currentIndex) ? "bg-[#F59E0B]/20 text-[#F59E0B]" : "hover:bg-[var(--page-muted)] text-[var(--text-tertiary)]"}`}
            >
              <Flag className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="max-w-5xl mx-auto mt-2">
          <Progress
            value={((currentIndex + 1) / totalQuestions) * 100}
            className="h-1 bg-[var(--page-muted)]"
          />
        </div>
      </div>

      {/* Question Area */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-3xl">
          {question && (
            <QuestionRenderer
              key={`${question.seed}-${currentIndex}`}
              question={question}
              onAnswer={({ answerIndex }) => {
                setAnswers(prev => ({ ...prev, [currentIndex]: answerIndex }));
              }}
            />
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6">
            <Button
              variant="outline"
              className="border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--page-surface)]"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>

            <div className="flex items-center gap-1">
              {questions.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i === currentIndex
                      ? "bg-[#2563EB]"
                      : answers[i] !== undefined
                        ? "bg-[#10B981]"
                        : flagged.includes(i)
                          ? "bg-[#F59E0B]"
                          : "bg-[var(--text-tertiary)]/20"
                  }`}
                />
              ))}
            </div>

            {currentIndex < totalQuestions - 1 ? (
              <Button
                className="bg-[#2563EB] hover:bg-[#1D4ED8] text-[var(--text-primary)]"
                onClick={handleNext}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button
                className="bg-[#10B981] hover:bg-[#059669] text-[var(--text-primary)]"
                onClick={handleSubmit}
              >
                Submit
                <Check className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Results Screen ─── */
function ResultsScreen({
  questions,
  answers,
  timeSpent,
  onRestart,
}: {
  questions: GeneratedQuestion[];
  answers: Record<number, number>;
  timeSpent: Record<number, number>;
  onRestart: () => void;
}) {
  const [expanded, setExpanded] = useState<number | null>(null);

  const correct = questions.filter((q, i) => {
    const correctAnswer = getCorrectAnswer(q.category, {
      seed: q.seed,
      difficulty: q.difficulty,
    });
    return answers[i] === correctAnswer;
  }).length;

  const total = questions.length;
  const accuracy = Math.round((correct / total) * 100);
  const avgTime = Math.round(
    Object.values(timeSpent).reduce((a, b) => a + b, 0) / total
  );

  const categoryStats: Record<string, { correct: number; total: number }> = {};
  questions.forEach((q, i) => {
    if (!categoryStats[q.category])
      categoryStats[q.category] = { correct: 0, total: 0 };
    categoryStats[q.category].total++;
    const correctAnswer = getCorrectAnswer(q.category, {
      seed: q.seed,
      difficulty: q.difficulty,
    });
    if (answers[i] === correctAnswer) categoryStats[q.category].correct++;
  });

  return (
    <div className="min-h-screen bg-[var(--page-bg)] pt-20">
      <div className="section-container max-w-7xl mx-auto pb-20">
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">
          Session Results
        </h1>

        <Card className="bg-[var(--page-surface)] border-[var(--border-color)] mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <p
                  className={`text-4xl font-extrabold ${accuracy >= 80 ? "text-[#10B981]" : accuracy >= 60 ? "text-[#F59E0B]" : "text-[#EF4444]"}`}
                >
                  {accuracy}%
                </p>
                <p className="text-xs text-[var(--text-tertiary)] mt-1">
                  Accuracy
                </p>
              </div>
              <div>
                <p className="text-4xl font-extrabold text-[var(--text-primary)]">
                  {correct}/{total}
                </p>
                <p className="text-xs text-[var(--text-tertiary)] mt-1">
                  Correct
                </p>
              </div>
              <div>
                <p className="text-4xl font-extrabold text-[var(--text-primary)]">
                  {avgTime}s
                </p>
                <p className="text-xs text-[var(--text-tertiary)] mt-1">
                  Avg Time
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[var(--page-surface)] border-[var(--border-color)] mb-6">
          <CardContent className="p-6">
            <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-4">
              Category Breakdown
            </h2>
            <div className="space-y-3">
              {Object.entries(categoryStats).map(([cat, stats]) => {
                const catD = catDisplay(cat);
                const pct = Math.round((stats.correct / stats.total) * 100);
                return (
                  <div key={cat}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-[var(--text-secondary)]">
                        {catD.name}
                      </span>
                      <span
                        className="text-xs font-medium"
                        style={{ color: catD.color }}
                      >
                        {stats.correct}/{stats.total} ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 bg-[var(--page-muted)] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: catD.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[var(--page-surface)] border-[var(--border-color)] mb-6">
          <CardContent className="p-6">
            <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-4">
              Question Review
            </h2>
            <div className="space-y-2">
              {questions.map((q, i) => {
                const correctAnswer = getCorrectAnswer(q.category, {
                  seed: q.seed,
                  difficulty: q.difficulty,
                });
                const isCorrect = answers[i] === correctAnswer;
                const catD = catDisplay(q.category);
                return (
                  <div key={i}>
                    <button
                      onClick={() => setExpanded(expanded === i ? null : i)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg text-left ${isCorrect ? "bg-[#10B981]/10" : "bg-[#EF4444]/10"}`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center ${isCorrect ? "bg-[#10B981]" : "bg-[#EF4444]"}`}
                      >
                        {isCorrect ? (
                          <Check className="w-3.5 h-3.5 text-[var(--text-primary)]" />
                        ) : (
                          <X className="w-3.5 h-3.5 text-[var(--text-primary)]" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[var(--text-primary)] truncate">
                          {catD.name} - {q.difficulty.toUpperCase()}
                        </p>
                        <p className="text-xs text-[var(--text-tertiary)]">
                          Your answer:{" "}
                          {answers[i] !== undefined
                            ? String.fromCharCode(65 + answers[i])
                            : "—"}{" "}
                          | Correct: {String.fromCharCode(65 + correctAnswer)}
                        </p>
                      </div>
                      <span className="text-xs text-[var(--text-tertiary)]">
                        {timeSpent[i] || 0}s
                      </span>
                    </button>
                    {expanded === i && (
                      <div className="mt-2 p-4 rounded-lg bg-[var(--page-surface)] border border-[var(--border-color)]">
                        <p className="text-sm text-[#10B981]">
                          Correct answer: Option{" "}
                          {String.fromCharCode(65 + correctAnswer)}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button
            className="flex-1 h-11 bg-[#2563EB] hover:bg-[#1D4ED8] text-[var(--text-primary)] font-semibold"
            onClick={onRestart}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Practice Again
          </Button>
          <Button
            variant="outline"
            className="h-11 border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            asChild
          >
            <Link to="/pat-academy">
              <Home className="w-4 h-4 mr-2" />
              PAT Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ─── */
export default function PATPracticePage() {
  usePageTitle("PAT Practice");
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [mode, setMode] = useState<PracticeMode>("setup");
  const [questions, setQuestions] = useState<GeneratedQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timeSpent, setTimeSpent] = useState<Record<number, number>>({});
  const [sessionId, setSessionId] = useState("");
  const { data: quota } = trpc.pat.getQuota.useQuery();

  const handleStart = useCallback(
    (config: {
      mode: string;
      category?: string;
      difficulty: string;
      count: number;
      timeLimit: boolean;
    }) => {
      const difficulty = difficultyToGen[config.difficulty as ApiDifficulty] ?? "medium";
      const count =
        config.mode === "timed"
          ? 15
          : config.mode === "exam"
            ? 90
            : config.count;

      const category: PatCategory | "mixed" =
        config.mode === "category" && config.category
          ? (config.category as PatCategory)
          : "mixed";

      const generated = generateQuestions(category, difficulty, count);
      setQuestions(generated);
      setSessionId(crypto.randomUUID());
      setMode("active");
    },
    []
  );

  const handleFinish = useCallback(
    (
      ans: Record<number, number>,
      _flg: number[],
      ts: Record<number, number>
    ) => {
      setAnswers(ans);
      setTimeSpent(ts);
      setMode("review");
    },
    []
  );

  const handleRestart = useCallback(() => {
    setMode("setup");
    setQuestions([]);
    setAnswers({});
    setTimeSpent({});
    setSessionId("");
  }, []);

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[var(--page-bg)] pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-white/20 border-t-[#2563EB] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[var(--text-secondary)] text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated && mode === "setup") {
    return (
      <div className="min-h-screen bg-[var(--page-bg)] pt-20">
        <div className="section-container max-w-7xl mx-auto pb-20 text-center">
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
            PAT Practice
          </h1>
          <p className="text-[var(--text-secondary)] mb-6">
            Sign in to track your progress and unlock more questions.
          </p>
          <Button
            className="bg-[#2563EB] hover:bg-[#1D4ED8] text-[var(--text-primary)]"
            asChild
          >
            <Link to="/login">Sign In</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {mode === "setup" && (
        <SetupScreen
          key="setup"
          onStart={handleStart}
          quota={quota}
        />
      )}
      {mode === "active" && (
        <ActiveScreen
          key="active"
          questions={questions}
          onFinish={handleFinish}
          sessionId={sessionId}
        />
      )}
      {mode === "review" && (
        <ResultsScreen
          key="review"
          questions={questions}
          answers={answers}
          timeSpent={timeSpent}
          onRestart={handleRestart}
        />
      )}
    </AnimatePresence>
  );
}
