import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usePageTitle } from "@/hooks/usePageTitle";
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Flag,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type Subject = "biology" | "chemistry" | "reading";

interface ExamQuestion {
  id: number;
  publicId: string;
  subject: Subject;
  topic: string;
  difficulty: string;
  questionText: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface SectionConfig {
  key: Subject;
  label: string;
  count: number;
  color: string;
}

const SECTIONS: SectionConfig[] = [
  { key: "biology", label: "Biology", count: 40, color: "#10B981" },
  { key: "chemistry", label: "Chemistry", count: 40, color: "#2563EB" },
  { key: "reading", label: "Reading Comprehension", count: 20, color: "#8B5CF6" },
];

const EXAM_DURATION = 60 * 60;

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function predictedDATScore(percentage: number): number {
  if (percentage >= 95) return 30;
  if (percentage >= 90) return 28;
  if (percentage >= 85) return 26;
  if (percentage >= 80) return 24;
  if (percentage >= 75) return 22;
  if (percentage >= 70) return 20;
  if (percentage >= 65) return 18;
  if (percentage >= 60) return 16;
  if (percentage >= 55) return 14;
  if (percentage >= 50) return 12;
  if (percentage >= 45) return 10;
  if (percentage >= 40) return 8;
  return 6;
}

type Phase = "setup" | "loading" | "exam" | "results";

export default function MockExamPage() {
  usePageTitle("Mock DAT Exam");
  const navigate = useNavigate();

  const [phase, setPhase] = useState<Phase>("setup");
  const [selectedSections, setSelectedSections] = useState<Record<Subject, boolean>>({
    biology: true,
    chemistry: true,
    reading: true,
  });
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [flagged, setFlagged] = useState<Set<number>>(new Set());
  const [timeLeft, setTimeLeft] = useState(EXAM_DURATION);
  const [showNav, setShowNav] = useState(false);

  const getExamQuestions = trpc.dat.getExamQuestions.useQuery;

  const bioQ = getExamQuestions(
    { subject: "biology", limit: 40 },
    { enabled: false }
  );
  const chemQ = getExamQuestions(
    { subject: "chemistry", limit: 40 },
    { enabled: false }
  );
  const readQ = getExamQuestions(
    { subject: "reading", limit: 20 },
    { enabled: false }
  );

  useEffect(() => {
    if (phase !== "exam") return;
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const id = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(id);
  }, [phase, timeLeft]);

  const toggleSection = (key: Subject) => {
    setSelectedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const totalQuestions = SECTIONS.filter(s => selectedSections[s.key]).reduce(
    (sum, s) => sum + s.count,
    0
  );

  const startExam = async () => {
    if (totalQuestions === 0) return;
    setPhase("loading");

    const promises: Promise<{ data: ExamQuestion[] | undefined }>[] = [];
    if (selectedSections.biology)
      promises.push(bioQ.refetch() as Promise<{ data: ExamQuestion[] | undefined }>);
    if (selectedSections.chemistry)
      promises.push(chemQ.refetch() as Promise<{ data: ExamQuestion[] | undefined }>);
    if (selectedSections.reading)
      promises.push(readQ.refetch() as Promise<{ data: ExamQuestion[] | undefined }>);

    const results = await Promise.all(promises);
    const all: ExamQuestion[] = [];
    for (const r of results) {
      if (r.data) all.push(...r.data);
    }

    const shuffled = all.sort(() => Math.random() - 0.5);
    setQuestions(shuffled);
    setCurrentIndex(0);
    setAnswers({});
    setFlagged(new Set());
    setTimeLeft(EXAM_DURATION);
    setPhase("exam");
  };

  const current = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const flaggedCount = flagged.size;

  const selectAnswer = (optionIndex: number) => {
    if (!current) return;
    setAnswers(prev => ({ ...prev, [current.id]: optionIndex }));
  };

  const toggleFlag = () => {
    if (!current) return;
    setFlagged(prev => {
      const next = new Set(prev);
      if (next.has(current.id)) next.delete(current.id);
      else next.add(current.id);
      return next;
    });
  };

  const handleSubmit = useCallback(() => {
    setPhase("results");
  }, []);

  if (phase === "setup") {
    return (
      <main className="min-h-screen bg-[var(--page-bg)] pt-20 pb-12">
        <div className="section-container max-w-3xl mx-auto px-4">
          <button
            onClick={() => navigate("/dat-academy")}
            className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm mb-6 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to DAT Academy
          </button>

          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
              Mock DAT Exam
            </h1>
            <p className="text-[var(--text-secondary)] max-w-lg mx-auto">
              Simulate a full-length DAT practice exam with a 60-minute timer.
              Select which sections to include below.
            </p>
          </div>

          <Card className="bg-[var(--page-surface)] border-[var(--border-color)] p-6 mb-8">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
              Select Sections
            </h2>
            <div className="space-y-3">
              {SECTIONS.map(s => (
                <label
                  key={s.key}
                  className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedSections[s.key]
                      ? "border-[var(--text-tertiary)] bg-[var(--page-muted)]"
                      : "border-[var(--border-color)] hover:border-[var(--text-tertiary)]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedSections[s.key]}
                      onChange={() => toggleSection(s.key)}
                      className="w-4 h-4 rounded border-[var(--border-color)]"
                    />
                    <span className="font-medium text-[var(--text-primary)]">
                      {s.label}
                    </span>
                  </div>
                  <Badge
                    variant="outline"
                    className="border-[var(--border-color)] text-[var(--text-secondary)]"
                  >
                    {s.count} questions
                  </Badge>
                </label>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-[var(--border-color)] flex items-center justify-between">
              <span className="text-sm text-[var(--text-secondary)]">
                Total: <strong className="text-[var(--text-primary)]">{totalQuestions}</strong> questions
                &middot; 60 minutes
              </span>
              <Button
                onClick={startExam}
                disabled={totalQuestions === 0}
                className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
              >
                Start Exam
              </Button>
            </div>
          </Card>
        </div>
      </main>
    );
  }

  if (phase === "loading") {
    return (
      <main className="min-h-screen bg-[var(--page-bg)] pt-20 pb-12 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[var(--border-color)] border-t-[#2563EB] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[var(--text-secondary)]">Loading exam questions...</p>
        </div>
      </main>
    );
  }

  if (phase === "results") {
    const timeTaken = EXAM_DURATION - timeLeft;
    const sectionStats: Record<Subject, { correct: number; total: number }> = {
      biology: { correct: 0, total: 0 },
      chemistry: { correct: 0, total: 0 },
      reading: { correct: 0, total: 0 },
    };

    for (const q of questions) {
      sectionStats[q.subject].total++;
      if (answers[q.id] === q.correctAnswer) {
        sectionStats[q.subject].correct++;
      }
    }

    const totalCorrect = questions.filter(q => answers[q.id] === q.correctAnswer).length;
    const totalAnswered = Object.keys(answers).length;
    const percentage = questions.length > 0 ? Math.round((totalCorrect / questions.length) * 100) : 0;
    const predicted = predictedDATScore(percentage);

    const missedQuestions = questions.filter(q => answers[q.id] !== q.correctAnswer);

    return (
      <main className="min-h-screen bg-[var(--page-bg)] pt-20 pb-12">
        <div className="section-container max-w-4xl mx-auto px-4">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
              Exam Results
            </h1>
            <p className="text-[var(--text-secondary)]">
              Here&apos;s how you performed on your mock DAT exam.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            <Card className="bg-[var(--page-surface)] border-[var(--border-color)] p-6 text-center">
              <p className="text-sm text-[var(--text-secondary)] mb-1">Overall Score</p>
              <p className="text-4xl font-bold text-[var(--text-primary)]">{percentage}%</p>
              <p className="text-sm text-[var(--text-tertiary)] mt-1">
                Predicted DAT: <span className="font-semibold text-[var(--text-primary)]">{predicted}</span>/30
              </p>
            </Card>
            <Card className="bg-[var(--page-surface)] border-[var(--border-color)] p-6 text-center">
              <p className="text-sm text-[var(--text-secondary)] mb-1">Correct / Answered</p>
              <p className="text-4xl font-bold text-[var(--text-primary)]">
                {totalCorrect}/{totalAnswered}
              </p>
              <p className="text-sm text-[var(--text-tertiary)] mt-1">
                {questions.length - totalAnswered} unanswered
              </p>
            </Card>
            <Card className="bg-[var(--page-surface)] border-[var(--border-color)] p-6 text-center">
              <p className="text-sm text-[var(--text-secondary)] mb-1">Time Taken</p>
              <p className="text-4xl font-bold text-[var(--text-primary)]">
                {formatTime(timeTaken)}
              </p>
              <p className="text-sm text-[var(--text-tertiary)] mt-1">
                of {formatTime(EXAM_DURATION)} allotted
              </p>
            </Card>
          </div>

          <Card className="bg-[var(--page-surface)] border-[var(--border-color)] p-6 mb-8">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
              Section Breakdown
            </h2>
            <div className="space-y-4">
              {SECTIONS.filter(s => selectedSections[s.key]).map(s => {
                const stats = sectionStats[s.key];
                const acc = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
                return (
                  <div key={s.key}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-[var(--text-primary)]">
                        {s.label}
                      </span>
                      <span className="text-sm text-[var(--text-secondary)]">
                        {stats.correct}/{stats.total} ({acc}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-[var(--page-muted)] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${acc}%`, backgroundColor: s.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {missedQuestions.length > 0 && (
            <Card className="bg-[var(--page-surface)] border-[var(--border-color)] p-6 mb-8">
              <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
                Missed Questions ({missedQuestions.length})
              </h2>
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {missedQuestions.map((q, i) => {
                  const userAnswer = answers[q.id];
                  return (
                    <div
                      key={q.id}
                      className="p-4 rounded-lg border border-[var(--border-color)] bg-[var(--page-bg)]"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Badge
                          variant="outline"
                          className="border-[var(--border-color)] text-[var(--text-secondary)] text-xs capitalize"
                        >
                          {q.subject}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="border-[var(--border-color)] text-[var(--text-secondary)] text-xs capitalize"
                        >
                          {q.difficulty}
                        </Badge>
                        <span className="text-xs text-[var(--text-tertiary)] ml-auto">
                          Q{i + 1}
                        </span>
                      </div>
                      <p className="text-sm text-[var(--text-primary)] mb-3 whitespace-pre-line">
                        {q.questionText}
                      </p>
                      <div className="space-y-1 mb-3">
                        {q.options.map((opt, oi) => {
                          const isCorrect = oi === q.correctAnswer;
                          const isUserWrong = oi === userAnswer && !isCorrect;
                          return (
                            <div
                              key={oi}
                              className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm ${
                                isCorrect
                                  ? "bg-[#10B981]/10 text-[#10B981] font-medium"
                                  : isUserWrong
                                    ? "bg-[#EF4444]/10 text-[#EF4444]"
                                    : "text-[var(--text-secondary)]"
                              }`}
                            >
                              {isCorrect && <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
                              {isUserWrong && <XCircle className="w-3.5 h-3.5 shrink-0" />}
                              {!isCorrect && !isUserWrong && (
                                <span className="w-3.5 h-3.5 shrink-0" />
                              )}
                              <span>
                                {String.fromCharCode(65 + oi)}. {opt}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                      <p className="text-xs text-[var(--text-tertiary)] italic">
                        {q.explanation}
                      </p>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          <div className="flex justify-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate("/dat-academy")}
              className="border-[var(--border-color)] text-[var(--text-secondary)]"
            >
              Back to DAT Academy
            </Button>
            <Button
              onClick={() => {
                setPhase("setup");
                setQuestions([]);
                setAnswers({});
                setFlagged(new Set());
                setTimeLeft(EXAM_DURATION);
              }}
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
            >
              Retake Exam
            </Button>
          </div>
        </div>
      </main>
    );
  }

  const sectionColor =
    current?.subject === "biology"
      ? "#10B981"
      : current?.subject === "chemistry"
        ? "#2563EB"
        : "#8B5CF6";

  const sectionLabel =
    current?.subject === "biology"
      ? "Biology"
      : current?.subject === "chemistry"
        ? "Chemistry"
        : "Reading Comprehension";

  return (
    <main className="min-h-screen bg-[var(--page-bg)] pt-20 pb-12">
      <div className="section-container max-w-5xl mx-auto px-4">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[var(--border-color)] text-[var(--text-secondary)]"
                >
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  Submit Exam
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-[var(--page-surface)] border-[var(--border-color)]">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-[var(--text-primary)]">
                    Submit Exam?
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-[var(--text-secondary)]">
                    You have answered {answeredCount} of {questions.length} questions.
                    {flaggedCount > 0 && ` ${flaggedCount} question(s) are flagged for review.`}
                    {" "}This cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="border-[var(--border-color)] text-[var(--text-secondary)]">
                    Continue Exam
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleSubmit}
                    className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
                  >
                    Submit
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm text-[var(--text-secondary)]">
              {answeredCount}/{questions.length} answered
              {flaggedCount > 0 && (
                <span className="ml-2 text-[#F59E0B]">
                  <Flag className="w-3.5 h-3.5 inline mr-0.5" />
                  {flaggedCount}
                </span>
              )}
            </div>
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-lg font-bold ${
                timeLeft <= 300
                  ? "bg-[#EF4444]/10 text-[#EF4444]"
                  : "bg-[var(--page-surface)] text-[var(--text-primary)] border border-[var(--border-color)]"
              }`}
            >
              <Clock className="w-4 h-4" />
              {formatTime(timeLeft)}
            </div>
          </div>
        </div>

        {current && (
          <div className="grid lg:grid-cols-[1fr_280px] gap-6">
            {/* Question area */}
            <div>
              <Card className="bg-[var(--page-surface)] border-[var(--border-color)] p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Badge
                    className="text-white text-xs capitalize"
                    style={{ backgroundColor: sectionColor }}
                  >
                    {sectionLabel}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="border-[var(--border-color)] text-[var(--text-secondary)] text-xs capitalize"
                  >
                    {current.difficulty}
                  </Badge>
                  <span className="ml-auto text-xs text-[var(--text-tertiary)]">
                    Question {currentIndex + 1} of {questions.length}
                  </span>
                </div>

                <p className="text-[var(--text-primary)] text-base font-medium mb-6 whitespace-pre-line">
                  {current.questionText}
                </p>

                <div className="space-y-2 mb-6">
                  {current.options.map((opt, i) => {
                    const isSelected = answers[current.id] === i;
                    return (
                      <button
                        key={i}
                        onClick={() => selectAnswer(i)}
                        className={`w-full text-left px-4 py-3 rounded-lg border transition-colors flex items-center gap-3 ${
                          isSelected
                            ? "bg-[#2563EB] text-white border-[#2563EB]"
                            : "border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--page-muted)]"
                        }`}
                      >
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${
                            isSelected
                              ? "bg-white/20 text-white"
                              : "bg-[var(--page-muted)] text-[var(--text-secondary)]"
                          }`}
                        >
                          {String.fromCharCode(65 + i)}
                        </span>
                        <span className="text-sm">{opt}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleFlag}
                    className={`border-[var(--border-color)] ${
                      flagged.has(current.id)
                        ? "text-[#F59E0B] border-[#F59E0B]"
                        : "text-[var(--text-secondary)]"
                    }`}
                  >
                    <Flag className="w-4 h-4 mr-1" />
                    {flagged.has(current.id) ? "Unflag" : "Flag for Review"}
                  </Button>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}
                      disabled={currentIndex === 0}
                      className="border-[var(--border-color)] text-[var(--text-secondary)]"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() =>
                        setCurrentIndex(i => Math.min(questions.length - 1, i + 1))
                      }
                      disabled={currentIndex === questions.length - 1}
                      className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

            {/* Question navigator sidebar */}
            <div className="hidden lg:block">
              <Card className="bg-[var(--page-surface)] border-[var(--border-color)] p-4 sticky top-24">
                <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
                  Question Navigator
                </h3>
                <div className="grid grid-cols-5 gap-1.5">
                  {questions.map((q, i) => {
                    const isAnswered = answers[q.id] !== undefined;
                    const isFlagged = flagged.has(q.id);
                    const isCurrent = i === currentIndex;
                    return (
                      <button
                        key={q.id}
                        onClick={() => setCurrentIndex(i)}
                        className={`w-full aspect-square rounded text-xs font-medium flex items-center justify-center transition-colors ${
                          isCurrent
                            ? "bg-[#2563EB] text-white ring-2 ring-[#2563EB] ring-offset-1 ring-offset-[var(--page-surface)]"
                            : isFlagged
                              ? "bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]"
                              : isAnswered
                                ? "bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/50"
                                : "bg-[var(--page-muted)] text-[var(--text-tertiary)] border border-[var(--border-color)] hover:border-[var(--text-tertiary)]"
                        }`}
                      >
                        {i + 1}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-3 space-y-1 text-xs text-[var(--text-tertiary)]">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-[#10B981]/20 border border-[#10B981]/50" />
                    Answered
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-[#F59E0B]/20 border border-[#F59E0B]" />
                    Flagged
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-[var(--page-muted)] border border-[var(--border-color)]" />
                    Unanswered
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Mobile nav toggle */}
        <div className="lg:hidden fixed bottom-4 right-4 z-50">
          <Button
            onClick={() => setShowNav(!showNav)}
            className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-full w-12 h-12 shadow-lg"
          >
            {questions.length - currentIndex}
          </Button>
        </div>

        {showNav && (
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowNav(false)}
          >
            <div
              className="absolute bottom-16 right-4 bg-[var(--page-surface)] border border-[var(--border-color)] rounded-lg p-4 shadow-xl max-h-[60vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
                Questions
              </h3>
              <div className="grid grid-cols-5 gap-1.5">
                {questions.map((q, i) => {
                  const isAnswered = answers[q.id] !== undefined;
                  const isFlagged = flagged.has(q.id);
                  const isCurrent = i === currentIndex;
                  return (
                    <button
                      key={q.id}
                      onClick={() => {
                        setCurrentIndex(i);
                        setShowNav(false);
                      }}
                      className={`w-8 h-8 rounded text-xs font-medium flex items-center justify-center ${
                        isCurrent
                          ? "bg-[#2563EB] text-white"
                          : isFlagged
                            ? "bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]"
                            : isAnswered
                              ? "bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/50"
                              : "bg-[var(--page-muted)] text-[var(--text-tertiary)] border border-[var(--border-color)]"
                      }`}
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
