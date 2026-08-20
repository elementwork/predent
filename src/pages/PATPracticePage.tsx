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
  readonly userAnswer: number | null;
  readonly timeSpent: number;
  readonly flagged: boolean;
}

interface SessionState {
  readonly sessionId: string;
  readonly mode: PracticeMode;
  readonly category: PredentCategory | null;
  readonly difficulty: Difficulty;
  readonly questions: readonly SessionQuestion[];
  readonly sessionTimeLimitSeconds: number | null;
  readonly engineVersion: string;
}

interface SessionPayload extends SessionState {
  readonly remainingSeconds: number | null;
  readonly expired: boolean;
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
  const [results, setResults] = useState<readonly SessionResult[]>([]);
  const [finishing, setFinishing] = useState(false);
  const timeSpent = useRef<Record<number, number>>({});
  const answersRef = useRef<Record<number, number>>({});
  const flaggedRef = useRef<Set<number>>(new Set());
  const progressQueue = useRef<Promise<void>>(Promise.resolve());
  const hydratedSessionId = useRef<string | null>(null);

  const quota = trpc.pat.getQuota.useQuery(undefined, { enabled: isAuthenticated });
  const activeSession = trpc.pat.getActiveSession.useQuery(undefined, {
    enabled: isAuthenticated,
    refetchOnWindowFocus: true,
  });
  const createSession = trpc.pat.createSession.useMutation();
  const saveProgress = trpc.pat.saveProgress.useMutation();
  const abandonSession = trpc.pat.abandonSession.useMutation();
  const submitSession = trpc.pat.submitSession.useMutation();

  const effectiveCount =
    practiceMode === "quick"
      ? 10
      : practiceMode === "timed"
        ? 15
        : practiceMode === "exam"
          ? 90
          : count;

  const hydrateSession = useCallback((payload: SessionPayload) => {
    const restoredAnswers: Record<number, number> = {};
    const restoredFlags = new Set<number>();
    const restoredTimes: Record<number, number> = {};
    payload.questions.forEach((question, index) => {
      if (question.userAnswer !== null) restoredAnswers[index] = question.userAnswer;
      if (question.flagged) restoredFlags.add(index);
      restoredTimes[index] = question.timeSpent;
    });
    const firstUnanswered = payload.questions.findIndex(
      question => question.userAnswer === null
    );

    answersRef.current = restoredAnswers;
    flaggedRef.current = restoredFlags;
    timeSpent.current = restoredTimes;
    progressQueue.current = Promise.resolve();
    setSession({
      sessionId: payload.sessionId,
      mode: payload.mode,
      category: payload.category,
      difficulty: payload.difficulty,
      questions: payload.questions,
      sessionTimeLimitSeconds: payload.sessionTimeLimitSeconds,
      engineVersion: payload.engineVersion,
    });
    setPracticeMode(payload.mode);
    if (payload.category) setCategory(payload.category);
    setDifficulty(payload.difficulty);
    setAnswers(restoredAnswers);
    setFlagged(restoredFlags);
    setTimeLeft(payload.remainingSeconds);
    setCurrentIndex(firstUnanswered >= 0 ? firstUnanswered : 0);
    setResults([]);
    setPaused(false);
    setFinishing(false);
    hydratedSessionId.current = payload.sessionId;
    setPhase("active");
  }, []);

  useEffect(() => {
    const restored = activeSession.data as SessionPayload | null | undefined;
    if (
      restored &&
      phase === "setup" &&
      !session &&
      hydratedSessionId.current !== restored.sessionId
    ) {
      hydrateSession(restored);
    }
  }, [activeSession.data, hydrateSession, phase, session]);

  const persistQuestion = useCallback(
    (
      index: number,
      patch: {
        userAnswer?: number;
        timeSpent?: number;
        flagged?: boolean;
      } = {}
    ): Promise<void> => {
      if (!session) return Promise.resolve();
      const question = session.questions[index];
      if (!question) return Promise.resolve();
      const payload = {
        sessionId: session.sessionId,
        instanceId: question.instanceId,
        userAnswer: patch.userAnswer ?? answersRef.current[index] ?? -1,
        timeSpent: patch.timeSpent ?? timeSpent.current[index] ?? 0,
        flagged: patch.flagged ?? flaggedRef.current.has(index),
      };
      const task = progressQueue.current
        .catch(() => undefined)
        .then(async () => {
          await saveProgress.mutateAsync(payload);
        });
      progressQueue.current = task.catch(() => undefined);
      return task;
    },
    [saveProgress, session]
  );

  const startSession = useCallback(async () => {
    try {
      const created = await createSession.mutateAsync({
        mode: practiceMode,
        ...(practiceMode === "category" ? { category } : {}),
        difficulty,
        count,
        timeLimit: practiceMode === "exam" ? true : timeLimit,
      });
      hydratedSessionId.current = null;
      hydrateSession(created as SessionPayload);
      await Promise.all([quota.refetch(), activeSession.refetch()]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to create PAT session");
    }
  }, [
    activeSession,
    category,
    count,
    createSession,
    difficulty,
    hydrateSession,
    practiceMode,
    quota,
    timeLimit,
  ]);

  const finishSession = useCallback(async () => {
    if (!session || finishing || submitSession.isPending) return;
    setFinishing(true);
    try {
      try {
        await persistQuestion(currentIndex, {
          userAnswer: answersRef.current[currentIndex] ?? -1,
          timeSpent: timeSpent.current[currentIndex] ?? 0,
          flagged: flaggedRef.current.has(currentIndex),
        });
      } catch (error) {
        if (session.mode !== "exam") throw error;
        // At the immutable exam deadline the server rejects late progress.
        // Submission scores the last state persisted before expiry.
      }

      const submitted = await submitSession.mutateAsync({
        sessionId: session.sessionId,
      });
      setResults(submitted.results as readonly SessionResult[]);
      submitted.results.forEach(result =>
        events.patQuestionAnswered(result.category, result.difficulty, result.isCorrect)
      );
      setPhase("review");
      hydratedSessionId.current = null;
      await Promise.all([
        utils.pat.getStats.invalidate(),
        utils.pat.getAnalytics.invalidate(),
        utils.pat.getActiveSession.invalidate(),
      ]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to score PAT session");
    } finally {
      setFinishing(false);
    }
  }, [
    currentIndex,
    finishing,
    persistQuestion,
    session,
    submitSession,
    utils.pat,
  ]);

  useEffect(() => {
    if (phase !== "active" || paused || finishing || !session) return;
    const timer = window.setInterval(() => {
      const nextTime = (timeSpent.current[currentIndex] ?? 0) + 1;
      timeSpent.current[currentIndex] = nextTime;
      if (nextTime % 5 === 0) {
        void persistQuestion(currentIndex, { timeSpent: nextTime }).catch(() => {
          // Deadline expiry is handled by the countdown submission path.
        });
      }
      setTimeLeft(previous =>
        previous === null ? null : Math.max(0, previous - 1)
      );
    }, 1000);
    return () => window.clearInterval(timer);
  }, [currentIndex, finishing, paused, persistQuestion, phase, session]);

  useEffect(() => {
    if (phase === "active" && timeLeft === 0) void finishSession();
  }, [finishSession, phase, timeLeft]);

  const discardSession = useCallback(async () => {
    if (!session) return;
    if (!window.confirm("Discard this PAT session? Generated-question quota will not be refunded.")) {
      return;
    }
    try {
      await progressQueue.current.catch(() => undefined);
      await abandonSession.mutateAsync({ sessionId: session.sessionId });
      setSession(null);
      setResults([]);
      setAnswers({});
      setFlagged(new Set());
      answersRef.current = {};
      flaggedRef.current = new Set();
      timeSpent.current = {};
      progressQueue.current = Promise.resolve();
      hydratedSessionId.current = null;
      setPhase("setup");
      await utils.pat.getActiveSession.invalidate();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to discard PAT session");
    }
  }, [abandonSession, session, utils.pat]);

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

  if (isAuthLoading || (isAuthenticated && activeSession.isLoading && !session)) {
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
                  Exam mode is fixed at 90 questions in 60 minutes. The server deadline cannot be paused or extended by refreshing or switching devices.
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

    if (paused && session.mode !== "exam") {
      return (
        <main className="min-h-screen bg-[var(--page-bg)] flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-[var(--page-surface)]">
            <CardContent className="p-8 text-center space-y-3">
              <Pause className="w-10 h-10 mx-auto text-[#F59E0B]" />
              <h2 className="text-xl font-bold">Practice paused</h2>
              <p className="text-sm text-[var(--text-secondary)]">
                Your answers, flags, and timing are saved to your account and can be resumed on another device.
              </p>
              <Button className="w-full" onClick={() => setPaused(false)}>Resume</Button>
              <Button variant="outline" className="w-full" onClick={() => void discardSession()}>
                Discard Session
              </Button>
            </CardContent>
          </Card>
        </main>
      );
    }

    return (
      <main className="min-h-screen bg-[var(--page-bg)] pb-10">
        <header className="sticky top-0 z-20 bg-[var(--page-surface)] border-b border-[var(--border-color)] px-3 sm:px-4 py-3">
          <div className="max-w-5xl mx-auto flex flex-wrap items-center gap-2 sm:gap-3">
            {session.mode !== "exam" && (
              <button
                type="button"
                onClick={() => {
                  void persistQuestion(currentIndex, {
                    timeSpent: timeSpent.current[currentIndex] ?? 0,
                  });
                  setPaused(true);
                }}
                aria-label="Pause"
              >
                <Pause className="w-4 h-4" />
              </button>
            )}
            <button type="button" onClick={() => void discardSession()} aria-label="Discard session">
              <X className="w-4 h-4" />
            </button>
            <span className="text-xs sm:text-sm">{currentIndex + 1}/{session.questions.length}</span>
            <Badge variant="outline" className="text-xs" style={{ color: meta.color, borderColor: meta.color }}>
              {meta.name}
            </Badge>
            <Badge variant="outline" className="text-xs">Band {question.publicQuestion.difficultyBand}</Badge>
            <div className="ml-auto flex items-center gap-2 sm:gap-3">
              {timeLeft !== null && (
                <span className={`text-xs sm:text-sm ${timeLeft <= 60 ? "text-[#EF4444] font-mono" : "font-mono"}`}>
                  <Clock className="w-4 h-4 inline mr-1" />{formatTime(timeLeft)}
                </span>
              )}
              <button
                type="button"
                onClick={() => {
                  const nextFlagged = !flaggedRef.current.has(currentIndex);
                  const next = new Set(flaggedRef.current);
                  if (nextFlagged) next.add(currentIndex);
                  else next.delete(currentIndex);
                  flaggedRef.current = next;
                  setFlagged(next);
                  void persistQuestion(currentIndex, { flagged: nextFlagged });
                }}
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
                disabled={finishing}
                onSelect={answer => {
                  const next = { ...answersRef.current, [currentIndex]: answer };
                  answersRef.current = next;
                  setAnswers(next);
                  void persistQuestion(currentIndex, { userAnswer: answer });
                }}
              />
            </CardContent>
          </Card>
          <div className="flex items-center justify-between mt-5 gap-3">
            <Button
              variant="outline"
              disabled={currentIndex === 0 || finishing}
              onClick={() => {
                void persistQuestion(currentIndex, {
                  timeSpent: timeSpent.current[currentIndex] ?? 0,
                });
                setCurrentIndex(index => index - 1);
              }}
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Previous
            </Button>
            <span className="text-xs text-[var(--text-tertiary)] text-center">
              {Object.keys(answers).length} answered · {flagged.size} flagged
            </span>
            {currentIndex < session.questions.length - 1 ? (
              <Button
                disabled={finishing}
                onClick={() => {
                  void persistQuestion(currentIndex, {
                    timeSpent: timeSpent.current[currentIndex] ?? 0,
                  });
                  setCurrentIndex(index => index + 1);
                }}
              >
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button
                className="bg-[#10B981] hover:bg-[#059669] text-white"
                disabled={finishing}
                onClick={() => void finishSession()}
              >
                {finishing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-1" />}
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
              answersRef.current = {};
              flaggedRef.current = new Set();
              timeSpent.current = {};
              progressQueue.current = Promise.resolve();
              hydratedSessionId.current = null;
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
