import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Flag,
  Home,
  Loader2,
  Pause,
  RotateCcw,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  ManipATExplanation,
  ManipATQuestionRenderer,
  type PatSolutionPayload,
  type PublicPatQuestion,
} from "@/components/pat/ManipatQuestionRenderer";
import { useAuth } from "@/hooks/useAuth";
import { usePageTitle } from "@/hooks/usePageTitle";
import { events } from "@/lib/analytics";
import { trpc } from "@/providers/trpc";

type PracticeMode = "quick" | "category" | "timed" | "mixed" | "exam";
type Difficulty = "beginner" | "intermediate" | "advanced" | "elite";
type PredentCategory =
  | "keyholes"
  | "tfe"
  | "angle_ranking"
  | "hole_punching"
  | "cube_counting"
  | "pattern_folding";

interface SessionQuestion {
  readonly instanceId: string;
  readonly publicQuestion: PublicPatQuestion;
}

interface SessionState {
  readonly sessionId: string;
  readonly questions: readonly SessionQuestion[];
  readonly sessionTimeLimitSeconds: number | null;
  readonly engineVersion: string;
}

interface SessionResult {
  readonly instanceId: string;
  readonly category: PredentCategory;
  readonly difficulty: Difficulty;
  readonly difficultyBand: number;
  readonly canonicalQuestionId: string;
  readonly userAnswer: number;
  readonly isCorrect: boolean;
  readonly correctChoiceIndex: number;
  readonly solution: PatSolutionPayload;
}

const categories: readonly PredentCategory[] = [
  "keyholes",
  "tfe",
  "angle_ranking",
  "hole_punching",
  "cube_counting",
  "pattern_folding",
];

const categoryMeta: Record<PredentCategory, { name: string; color: string }> = {
  keyholes: { name: "Keyholes", color: "#14B8A6" },
  tfe: { name: "Top-Front-End", color: "#6366F1" },
  angle_ranking: { name: "Angle Ranking", color: "#F59E0B" },
  hole_punching: { name: "Hole Punching", color: "#F43F5E" },
  cube_counting: { name: "Cube Counting", color: "#10B981" },
  pattern_folding: { name: "Pattern Folding", color: "#8B5CF6" },
};

const canonicalToPredent: Record<PublicPatQuestion["category"], PredentCategory> = {
  aperture: "keyholes",
  "view-recognition": "tfe",
  angle: "angle_ranking",
  "paper-folding": "hole_punching",
  "cube-counting": "cube_counting",
  "form-development": "pattern_folding",
};

const formatTime = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

export default function PATPracticePage() {
  usePageTitle("PAT Practice");
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const utils = trpc.useUtils();
  const initialCategory = categories.includes(
    searchParams.get("category") as PredentCategory
  )
    ? (searchParams.get("category") as PredentCategory)
    : "keyholes";

  const [phase, setPhase] = useState<"setup" | "active" | "review">("setup");
  const [practiceMode, setPracticeMode] = useState<PracticeMode>(
    searchParams.has("category") ? "category" : "quick"
  );
  const [category, setCategory] = useState<PredentCategory>(initialCategory);
  const [difficulty, setDifficulty] = useState<Difficulty>("intermediate");
  const [count, setCount] = useState(10);
  const [timeLimit, setTimeLimit] = useState(true);
  const [session, setSession] = useState<SessionState | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [flagged, setFlagged] = useState<Set<number>>(new Set());
  const [paused, setPaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const timeSpent = useRef<Record<number, number>>({});
  const [results, setResults] = useState<readonly SessionResult[]>([]);

  const quota = trpc.pat.getQuota.useQuery(undefined, { enabled: isAuthenticated });
  const createSession = trpc.pat.createSession.useMutation();
  const submitSession = trpc.pat.submitSession.useMutation();

  const effectiveCount =
    practiceMode === "quick"
      ? 10
      : practiceMode === "timed"
        ? 15
        : practiceMode === "exam"
          ? 90
          : count;

  const startSession = useCallback(async () => {
    try {
      const created = await createSession.mutateAsync({
        mode: practiceMode,
        ...(practiceMode === "category" ? { category } : {}),
        difficulty,
        count,
        timeLimit: practiceMode === "exam" ? true : timeLimit,
      });
      setSession({
        sessionId: created.sessionId,
        questions: created.questions,
        sessionTimeLimitSeconds: created.sessionTimeLimitSeconds,
        engineVersion: created.engineInfo.engineVersion,
      });
      setAnswers({});
      setFlagged(new Set());
      timeSpent.current = {};
      setCurrentIndex(0);
      setTimeLeft(created.sessionTimeLimitSeconds);
      setResults([]);
      setPaused(false);
      setPhase("active");
      await quota.refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to create PAT session");
    }
  }, [category, count, createSession, difficulty, practiceMode, quota, timeLimit]);

  const finishSession = useCallback(async () => {
    if (!session || submitSession.isPending) return;
    try {
      const submitted = await submitSession.mutateAsync({
        sessionId: session.sessionId,
        answers: session.questions.map((question, index) => ({
          instanceId: question.instanceId,
          userAnswer: answers[index] ?? -1,
          timeSpent: timeSpent.current[index] ?? 0,
        })),
      });
      setResults(submitted.results as readonly SessionResult[]);
      submitted.results.forEach(result =>
        events.patQuestionAnswered(result.category, result.difficulty, result.isCorrect)
      );
      setPhase("review");
      await Promise.all([
        utils.pat.getStats.invalidate(),
        utils.pat.getAnalytics.invalidate(),
      ]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to score PAT session");
    }
  }, [answers, session, submitSession, utils.pat]);

  useEffect(() => {
    if (phase !== "active" || paused || submitSession.isPending || !session) return;
    const timer = window.setInterval(() => {
      timeSpent.current[currentIndex] = (timeSpent.current[currentIndex] ?? 0) + 1;
      setTimeLeft(previous =>
        previous === null ? null : Math.max(0, previous - 1)
      );
    }, 1000);
    return () => window.clearInterval(timer);
  }, [currentIndex, paused, phase, session, submitSession.isPending]);

  useEffect(() => {
    if (phase === "active" && timeLeft === 0) void finishSession();
  }, [finishSession, phase, timeLeft]);

  const categoryStats = useMemo(() => {
    const map = new Map<PredentCategory, { correct: number; total: number }>();
    for (const result of results) {
      const current = map.get(result.category) ?? { correct: 0, total: 0 };
      current.total += 1;
      if (result.isCorrect) current.correct += 1;
      map.set(result.category, current);
    }
    return [...map.entries()];
  }, [results]);

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[var(--page-bg)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#2563EB]" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-[var(--page-bg)] pt-20">
        <div className="section-container max-w-xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-3">PAT Practice</h1>
          <p className="text-[var(--text-secondary)] mb-6">
            Sign in to generate validated ManipAT sessions and track your progress.
          </p>
          <Button asChild className="bg-[#2563EB] text-white">
            <Link to="/login">Sign In</Link>
          </Button>
        </div>
      </main>
    );
  }

  if (phase === "setup") {
    return (
      <main className="min-h-screen bg-[var(--page-bg)] pt-20 pb-16">
        <div className="section-container max-w-4xl mx-auto">
          <Link
            to="/pat-academy"
            className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Back to PAT Academy
          </Link>
          <div className="flex items-end justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-[var(--text-primary)]">PAT Practice</h1>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                Server-generated, independently validated questions using ManipAT.
              </p>
            </div>
            {quota.data && (
              <Badge variant="outline">
                {quota.data.remaining}/{quota.data.quota} remaining
              </Badge>
            )}
          </div>

          <Card className="bg-[var(--page-surface)] border-[var(--border-color)]">
            <CardContent className="p-6 space-y-7">
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)] mb-3">Mode</p>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {(["quick", "category", "timed", "mixed", "exam"] as const).map(mode => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setPracticeMode(mode)}
                      className={`rounded-lg border px-3 py-2 text-sm capitalize ${
                        practiceMode === mode
                          ? "border-[#2563EB] bg-[#2563EB]/10 text-[#2563EB]"
                          : "border-[var(--border-color)] text-[var(--text-secondary)]"
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {practiceMode === "category" && (
                <div>
                  <p className="text-sm font-semibold text-[var(--text-primary)] mb-3">Category</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {categories.map(item => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setCategory(item)}
                        className={`rounded-lg border px-3 py-2 text-sm ${
                          category === item
                            ? "border-[#2563EB] bg-[#2563EB]/10"
                            : "border-[var(--border-color)]"
                        }`}
                      >
                        {categoryMeta[item].name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)] mb-3">Difficulty</p>
                <div className="grid grid-cols-4 gap-2">
                  {(["beginner", "intermediate", "advanced", "elite"] as const).map(level => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setDifficulty(level)}
                      className={`rounded-lg border px-2 py-2 text-xs sm:text-sm capitalize ${
                        difficulty === level
                          ? "border-[#2563EB] bg-[#2563EB]/10"
                          : "border-[var(--border-color)]"
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {practiceMode !== "quick" && practiceMode !== "timed" && practiceMode !== "exam" && (
                <label className="block text-sm text-[var(--text-secondary)]">
                  Questions: <strong>{count}</strong>
                  <input
                    type="range"
                    min={5}
                    max={50}
                    step={5}
                    value={count}
                    onChange={event => setCount(Number(event.target.value))}
                    className="block w-full mt-2 accent-[#2563EB]"
                  />
                </label>
              )}

              {practiceMode === "exam" ? (
                <div className="flex items-center gap-3 rounded-lg border border-[var(--border-color)] bg-[var(--page-muted)] px-3 py-2 text-sm text-[var(--text-secondary)]">
                  <Clock className="w-4 h-4 shrink-0" />
                  Exam mode is fixed at 90 questions in 60 minutes. The timer cannot be paused.
                </div>
              ) : (
                <label className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                  <input
                    type="checkbox"
                    checked={timeLimit}
                    onChange={event => setTimeLimit(event.target.checked)}
                  />
                  Use time limit
                </label>
              )}

              <Button
                className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
                disabled={
                  createSession.isPending ||
                  (!!quota.data && effectiveCount > quota.data.remaining)
                }
                onClick={() => void startSession()}
              >
                {createSession.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Start {effectiveCount}-Question Session
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  if (phase === "active" && session) {
    const question = session.questions[currentIndex];
    if (!question) return null;
    const predentCategory = canonicalToPredent[question.publicQuestion.category];
    const meta = categoryMeta[predentCategory];

    if (paused && practiceMode !== "exam") {
      return (
        <main className="min-h-screen bg-[var(--page-bg)] flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-[var(--page-surface)]">
            <CardContent className="p-8 text-center">
              <Pause className="w-10 h-10 mx-auto text-[#F59E0B] mb-3" />
              <h2 className="text-xl font-bold mb-4">Practice paused</h2>
              <Button className="w-full" onClick={() => setPaused(false)}>Resume</Button>
            </CardContent>
          </Card>
        </main>
      );
    }

    return (
      <main className="min-h-screen bg-[var(--page-bg)] pb-10">
        <header className="sticky top-0 z-20 bg-[var(--page-surface)] border-b border-[var(--border-color)] px-4 py-3">
          <div className="max-w-5xl mx-auto flex items-center gap-3">
            {practiceMode !== "exam" && (
              <button type="button" onClick={() => setPaused(true)} aria-label="Pause">
                <Pause className="w-4 h-4" />
              </button>
            )}
            <span className="text-sm">{currentIndex + 1}/{session.questions.length}</span>
            <Badge variant="outline" style={{ color: meta.color, borderColor: meta.color }}>
              {meta.name}
            </Badge>
            <Badge variant="outline">Band {question.publicQuestion.difficultyBand}</Badge>
            <div className="ml-auto flex items-center gap-3">
              {timeLeft !== null && (
                <span className={timeLeft <= 60 ? "text-[#EF4444] font-mono" : "font-mono"}>
                  <Clock className="w-4 h-4 inline mr-1" />{formatTime(timeLeft)}
                </span>
              )}
              <button
                type="button"
                onClick={() =>
                  setFlagged(previous => {
                    const next = new Set(previous);
                    if (next.has(currentIndex)) next.delete(currentIndex);
                    else next.add(currentIndex);
                    return next;
                  })
                }
                aria-label="Flag question"
              >
                <Flag className={`w-4 h-4 ${flagged.has(currentIndex) ? "text-[#F59E0B]" : ""}`} />
              </button>
            </div>
          </div>
          <Progress value={((currentIndex + 1) / session.questions.length) * 100} className="h-1 mt-2 max-w-5xl mx-auto" />
        </header>

        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card className="bg-[var(--page-surface)] border-[var(--border-color)]">
            <CardContent className="p-4 sm:p-6">
              <ManipATQuestionRenderer
                question={question.publicQuestion}
                selectedIndex={answers[currentIndex]}
                onSelect={answer => setAnswers(previous => ({ ...previous, [currentIndex]: answer }))}
              />
            </CardContent>
          </Card>
          <div className="flex items-center justify-between mt-5 gap-3">
            <Button
              variant="outline"
              disabled={currentIndex === 0 || submitSession.isPending}
              onClick={() => setCurrentIndex(index => index - 1)}
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Previous
            </Button>
            <span className="text-xs text-[var(--text-tertiary)]">
              {Object.keys(answers).length} answered · {flagged.size} flagged
            </span>
            {currentIndex < session.questions.length - 1 ? (
              <Button
                disabled={submitSession.isPending}
                onClick={() => setCurrentIndex(index => index + 1)}
              >
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button
                className="bg-[#10B981] hover:bg-[#059669] text-white"
                disabled={submitSession.isPending}
                onClick={() => void finishSession()}
              >
                {submitSession.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-1" />}
                Submit
              </Button>
            )}
          </div>
        </div>
      </main>
    );
  }

  if (!session) return null;
  const correct = results.filter(result => result.isCorrect).length;
  const accuracy = results.length ? Math.round((correct / results.length) * 100) : 0;

  return (
    <main className="min-h-screen bg-[var(--page-bg)] pt-20 pb-16">
      <div className="section-container max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">Session Results</h1>
        <p className="text-xs text-[var(--text-tertiary)] mt-1 mb-6">
          Scored server-side with ManipAT engine {session.engineVersion}
        </p>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card><CardContent className="p-6 text-center"><p className="text-4xl font-bold text-[#2563EB]">{accuracy}%</p><p className="text-xs text-[var(--text-tertiary)]">Accuracy</p></CardContent></Card>
          <Card><CardContent className="p-6 text-center"><p className="text-4xl font-bold">{correct}/{results.length}</p><p className="text-xs text-[var(--text-tertiary)]">Correct</p></CardContent></Card>
        </div>

        <Card className="mb-6 bg-[var(--page-surface)] border-[var(--border-color)]">
          <CardContent className="p-6">
            <h2 className="font-semibold mb-4">Category Breakdown</h2>
            <div className="space-y-2">
              {categoryStats.map(([item, stats]) => (
                <div key={item} className="flex justify-between text-sm">
                  <span>{categoryMeta[item].name}</span>
                  <span>{stats.correct}/{stats.total} ({Math.round((stats.correct / stats.total) * 100)}%)</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3 mb-6">
          {results.map((result, index) => {
            const question = session.questions[index];
            if (!question) return null;
            return (
              <Card key={result.canonicalQuestionId} className="bg-[var(--page-surface)] border-[var(--border-color)]">
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    {result.isCorrect ? <Check className="w-4 h-4 text-[#10B981]" /> : <X className="w-4 h-4 text-[#EF4444]" />}
                    Question {index + 1} · {categoryMeta[result.category].name} · Band {result.difficultyBand}
                  </div>
                  <ManipATQuestionRenderer
                    question={question.publicQuestion}
                    selectedIndex={result.userAnswer >= 0 ? result.userAnswer : undefined}
                    correctIndex={result.correctChoiceIndex}
                    disabled
                    compact
                  />
                  <ManipATExplanation solution={result.solution} />
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="flex gap-3">
          <Button
            className="flex-1 bg-[#2563EB] text-white"
            onClick={() => {
              setPhase("setup");
              setSession(null);
              setResults([]);
            }}
          >
            <RotateCcw className="w-4 h-4 mr-2" /> Practice Again
          </Button>
          <Button variant="outline" asChild>
            <Link to="/pat-academy"><Home className="w-4 h-4 mr-2" /> PAT Home</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
