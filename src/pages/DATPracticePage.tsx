import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  FlaskConical,
  Glasses,
  Check,
  X,
  ArrowRight,
  Loader2,
  Bookmark,
  BookmarkCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { usePageTitle } from "@/hooks/usePageTitle";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { useTier } from "@/hooks/useTier";
import { PremiumLock } from "@/components/PremiumCTA";
import { toast } from "sonner";
import { events } from "@/lib/analytics";

const subjects = [
  { id: "biology", title: "Biology", icon: BookOpen, color: "#10B981" },
  { id: "chemistry", title: "Chemistry", icon: FlaskConical, color: "#2563EB" },
  {
    id: "reading",
    title: "Reading Comprehension",
    icon: Glasses,
    color: "#8B5CF6",
  },
] as const;

type Subject = (typeof subjects)[number]["id"];
type Difficulty = "beginner" | "intermediate" | "advanced" | "elite";

interface Question {
  id: number;
  publicId: string;
  subject: Subject;
  topic: string;
  difficulty: Difficulty;
  questionText: string;
  options: string[];
}

interface AttemptResult {
  correctAnswer: number;
  explanation: string;
}

export default function DATPracticePage() {
  usePageTitle("DAT Practice");
  const { isAuthenticated } = useAuth();
  const { isPremium } = useTier();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty | undefined>(
    undefined
  );
  const [question, setQuestion] = useState<Question | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<"correct" | "incorrect" | null>(null);
  const [attemptResult, setAttemptResult] = useState<AttemptResult | null>(
    null
  );
  const [seenIds, setSeenIds] = useState<number[]>([]);
  const startTimeRef = useRef<number>(0);
  useEffect(() => {
    startTimeRef.current = Date.now();
  }, []);

  const toggleSave = trpc.saved.toggle.useMutation();
  const isSaved = trpc.saved.isSaved.useQuery(
    { source: "dat", questionId: question?.id ?? 0 },
    { enabled: !!question && isAuthenticated }
  );

  const listQuery = trpc.dat.listQuestions.useQuery(
    { subject: subject!, difficulty, limit: 1, excludeIds: seenIds },
    { enabled: !!subject && isPremium }
  );

  const recordAttempt = trpc.dat.recordAttempt.useMutation({
    onSuccess: data => {
      setResult(data.isCorrect ? "correct" : "incorrect");
      setAttemptResult({
        correctAnswer: data.correctAnswer,
        explanation: data.explanation,
      });
      events.datQuestionAnswered(
        question?.subject ?? "unknown",
        question?.difficulty ?? "unknown",
        data.isCorrect
      );
    },
    onError: error => toast.error(error.message),
  });

  const loadNext = (nextQuestion?: Question) => {
    const q = nextQuestion ?? listQuery.data?.[0] ?? null;
    if (q) {
      setQuestion(q);
      setSeenIds(prev => [...prev, q.id]);
      setSelected(null);
      setResult(null);
      setAttemptResult(null);
      startTimeRef.current = Date.now();
    } else if (!listQuery.isLoading) {
      toast.info("No more questions available for this filter.");
      setQuestion(null);
    }
  };

  const startSubject = (s: Subject) => {
    setSubject(s);
    setSeenIds([]);
    setQuestion(null);
    setSelected(null);
    setResult(null);
    setAttemptResult(null);
  };

  const submitAnswer = (idx: number) => {
    if (!question || result) return;
    setSelected(idx);

    if (isAuthenticated) {
      recordAttempt.mutate({
        questionId: question.id,
        userAnswer: idx,
        // eslint-disable-next-line react-hooks/purity
        timeSpent: Math.round((Date.now() - startTimeRef.current) / 1000),
      });
    }
  };

  const nextQuestion = () => {
    const next = listQuery.data?.[0];
    if (next && next.id !== question?.id) {
      loadNext(next);
    } else {
      listQuery.refetch().then(({ data }) => loadNext(data?.[0]));
    }
  };

  return (
    <main className="min-h-screen bg-[var(--page-bg)] pt-20 pb-12">
      <div className="section-container max-w-7xl mx-auto px-4">
        <Link
          to="/dat-academy"
          className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to DAT Academy
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
            DAT Practice
          </h1>
          <p className="text-[var(--text-secondary)]">
            Practice Biology, Chemistry, and Reading Comprehension questions for
            the Canadian DAT.
          </p>
        </div>

        {!isPremium ? (
          <PremiumLock
            title="Premium DAT Practice"
            description="An active Premium subscription is required for the DAT question bank and progress tracking."
          />
        ) : !subject ? (
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            {subjects.map(s => (
              <Card
                key={s.id}
                className="bg-[var(--page-surface)] border-[var(--border-color)] hover:border-[var(--text-tertiary)] transition-all cursor-pointer"
                onClick={() => startSubject(s.id)}
              >
                <CardContent className="p-6 text-center">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3"
                    style={{ backgroundColor: `${s.color}15` }}
                  >
                    <s.icon className="w-6 h-6" style={{ color: s.color }} />
                  </div>
                  <h3 className="font-semibold text-[var(--text-primary)]">
                    {s.title}
                  </h3>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-2">
                {subjects.map(s => (
                  <button
                    key={s.id}
                    onClick={() => startSubject(s.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      subject === s.id
                        ? "text-white"
                        : "bg-[var(--page-muted)] text-[var(--text-secondary)] hover:bg-[var(--border-color)]"
                    }`}
                    style={
                      subject === s.id
                        ? { backgroundColor: s.color }
                        : undefined
                    }
                  >
                    {s.title}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                {(
                  [
                    "beginner",
                    "intermediate",
                    "advanced",
                    "elite",
                  ] as Difficulty[]
                ).map(d => (
                  <button
                    key={d}
                    onClick={() => {
                      setDifficulty(difficulty === d ? undefined : d);
                      setSeenIds([]);
                      setQuestion(null);
                    }}
                    className={`px-2.5 py-1 rounded text-xs font-medium capitalize transition-colors ${
                      difficulty === d
                        ? "bg-[#2563EB] text-white"
                        : "bg-[var(--page-muted)] text-[var(--text-secondary)] hover:bg-[var(--border-color)]"
                    }`}
                  >
                    {d}
                  </button>
                ))}
                <Button
                  size="sm"
                  variant="outline"
                  className="border-[var(--border-color)] text-[var(--text-secondary)]"
                  onClick={nextQuestion}
                  disabled={listQuery.isLoading}
                >
                  {listQuery.isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Next"
                  )}
                </Button>
              </div>
            </div>

            {!question && listQuery.isLoading && (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[#2563EB]" />
              </div>
            )}

            {!question && !listQuery.isLoading && (
              <div className="text-center py-12">
                {listQuery.error && (
                  <p className="text-sm text-[#EF4444] mb-4">
                    {listQuery.error.message}
                  </p>
                )}
                <Button
                  onClick={nextQuestion}
                  className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
                >
                  Start {subjects.find(s => s.id === subject)?.title} Practice
                </Button>
              </div>
            )}

            {question && (
              <Card className="bg-[var(--page-surface)] border-[var(--border-color)]">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Badge className="bg-[var(--page-muted)] text-[var(--text-secondary)] border-[var(--border-color)] capitalize">
                      {question.topic}
                    </Badge>
                    <Badge className="bg-[var(--page-muted)] text-[var(--text-secondary)] border-[var(--border-color)] capitalize">
                      {question.difficulty}
                    </Badge>
                    <div className="ml-auto">
                      <button
                        onClick={() => {
                          if (!question) return;
                          toggleSave.mutate(
                            { source: "dat", questionId: question.id },
                            { onSuccess: () => isSaved.refetch() }
                          );
                        }}
                        className="p-1.5 rounded-md transition-colors hover:bg-[var(--page-muted)]"
                        title={
                          isSaved.data?.saved ? "Unsave" : "Save for later"
                        }
                      >
                        {isSaved.data?.saved ? (
                          <BookmarkCheck className="w-4 h-4 text-[#2563EB]" />
                        ) : (
                          <Bookmark className="w-4 h-4 text-[var(--text-tertiary)]" />
                        )}
                      </button>
                    </div>
                  </div>

                  <p className="text-[var(--text-primary)] text-base font-medium mb-6 whitespace-pre-line">
                    {question.questionText}
                  </p>

                  <div className="space-y-2 mb-6">
                    {question.options.map((opt, i) => {
                      const isSelected = selected === i;
                      const isCorrectOption = attemptResult
                        ? i === attemptResult.correctAnswer
                        : false;
                      let btnClass =
                        "border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--page-muted)]";
                      if (result && isCorrectOption)
                        btnClass = "bg-[#10B981] text-white border-[#10B981]";
                      else if (result && isSelected && !isCorrectOption)
                        btnClass = "bg-[#EF4444] text-white border-[#EF4444]";
                      else if (isSelected)
                        btnClass = "bg-[#2563EB] text-white border-[#2563EB]";

                      return (
                        <button
                          key={i}
                          onClick={() => submitAnswer(i)}
                          disabled={!!result}
                          className={`w-full text-left px-4 py-3 rounded-lg border transition-colors flex items-center gap-3 ${btnClass}`}
                        >
                          <span className="w-6 h-6 rounded-full bg-[var(--page-muted)] text-[var(--text-secondary)] flex items-center justify-center text-xs font-semibold shrink-0">
                            {String.fromCharCode(65 + i)}
                          </span>
                          <span className="text-sm">{opt}</span>
                          {result && isCorrectOption && (
                            <Check className="w-4 h-4 ml-auto" />
                          )}
                          {result && isSelected && !isCorrectOption && (
                            <X className="w-4 h-4 ml-auto" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {result && (
                    <div
                      className={`p-4 rounded-lg mb-4 ${result === "correct" ? "bg-[#10B981]/10 text-[#10B981]" : "bg-[#EF4444]/10 text-[#EF4444]"}`}
                    >
                      <p className="font-medium mb-1">
                        {result === "correct" ? "Correct!" : "Incorrect"}
                      </p>
                      <p className="text-sm opacity-90">
                        {attemptResult?.explanation}
                      </p>
                    </div>
                  )}

                  <Button
                    onClick={nextQuestion}
                    className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
                    disabled={listQuery.isLoading}
                  >
                    Next Question <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            )}

            {!isAuthenticated && (
              <p className="text-center text-xs text-[var(--text-tertiary)] mt-4">
                <Link to="/login" className="text-[#2563EB] hover:underline">
                  Log in
                </Link>{" "}
                to save your progress.
              </p>
            )}
          </>
        )}
      </div>
    </main>
  );
}
