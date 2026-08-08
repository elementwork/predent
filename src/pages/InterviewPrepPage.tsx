import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { usePageTitle } from "@/hooks/usePageTitle";
import {
  ArrowLeft,
  MessageSquare,
  Users,
  Clock,
  Check,
  Play,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/providers/trpc";
import { useTier } from "@/hooks/useTier";
import { PremiumLock } from "@/components/PremiumCTA";

const mmiStations = [
  {
    type: "Ethical Scenario",
    description:
      "Navigate complex ethical dilemmas involving patient care, confidentiality, and professional boundaries.",
  },
  {
    type: "Communication",
    description:
      "Demonstrate effective communication with patients, families, or healthcare team members.",
  },
  {
    type: "Problem Solving",
    description:
      "Analyze a problem and propose logical, practical solutions under time pressure.",
  },
  {
    type: "Collaboration",
    description:
      "Show ability to work effectively in teams and resolve interpersonal conflicts.",
  },
  {
    type: "Self-Reflection",
    description:
      "Discuss personal experiences, failures, growth, and motivation for dentistry.",
  },
  {
    type: "Critical Thinking",
    description:
      "Evaluate arguments, identify assumptions, and construct logical reasoning.",
  },
];

const panelCategories = [
  { category: "Motivation for Dentistry", frequency: 95 },
  { category: "Knowledge of Profession", frequency: 80 },
  { category: "Personal Strengths/Weaknesses", frequency: 75 },
  { category: "Ethical Scenarios", frequency: 70 },
  { category: "School-Specific", frequency: 60 },
  { category: "Current Events", frequency: 50 },
];

const schoolFormats = [
  {
    school: "University of Toronto",
    format: "Panel",
    duration: "~30-45 min",
    notes: "2-3 interviewers, traditional questions",
  },
  {
    school: "Western University",
    format: "Panel",
    duration: "~30 min",
    notes: "Conversational style",
  },
  {
    school: "McGill University",
    format: "MMI",
    duration: "~60 min",
    notes: "8-10 stations",
  },
  {
    school: "UBC",
    format: "MMI + SGI",
    duration: "~90 min",
    notes: "Multiple Mini Interview + Small Group Interaction",
  },
  {
    school: "Alberta",
    format: "MMI",
    duration: "~60 min",
    notes: "8 stations",
  },
  {
    school: "Saskatchewan",
    format: "MMI",
    duration: "~60 min",
    notes: "Multiple stations",
  },
  {
    school: "Manitoba",
    format: "Panel",
    duration: "~30 min",
    notes: "Traditional panel format",
  },
  {
    school: "Dalhousie",
    format: "Panel",
    duration: "~30 min",
    notes: "Conversational panel",
  },
];

const prepTimeline = [
  {
    when: "3+ Months Before",
    tasks: [
      "Research each school's interview format",
      "Reflect on your experiences and motivations",
      "Practice answering common questions out loud",
      "Join a mock interview group",
    ],
  },
  {
    when: "1 Month Before",
    tasks: [
      "Schedule mock interviews",
      "Prepare 3-5 key stories from your experiences",
      "Research current healthcare topics",
      "Review school-specific programs and values",
    ],
  },
  {
    when: "1 Week Before",
    tasks: [
      "Do 2-3 full mock interviews",
      "Prepare thoughtful questions to ask interviewers",
      "Plan your outfit and travel logistics",
      "Get good sleep and stay hydrated",
    ],
  },
  {
    when: "Day Of",
    tasks: [
      "Arrive 15-30 minutes early",
      "Bring copies of your application materials",
      "Be authentic and let your personality shine",
      "Send thank-you notes within 24 hours",
    ],
  },
];

const rubric = [
  {
    criterion: "Clarity of Communication",
    desc: "Speaking clearly and concisely",
  },
  { criterion: "Relevance of Content", desc: "Answering what was asked" },
  { criterion: "Structure of Response", desc: "Logical flow and organization" },
  { criterion: "Empathy & Professionalism", desc: "Showing care and maturity" },
  { criterion: "Self-Awareness", desc: "Knowing strengths and weaknesses" },
  { criterion: "Critical Thinking", desc: "Analyzing scenarios logically" },
];

export default function InterviewPrepPage() {
  usePageTitle("Interview Preparation");
  const { isPremium } = useTier();
  const [tab, setTab] = useState<"guide" | "bank" | "practice">("guide");
  const [bankFormat, setBankFormat] = useState<"MMI" | "Panel">("Panel");
  const [practiceFormat, setPracticeFormat] = useState<"MMI" | "Panel">("MMI");
  const [activeIndex, setActiveIndex] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);

  const {
    data: questions,
    isLoading: bankLoading,
    error: bankError,
  } = trpc.interview.getQuestions.useQuery(
    { format: bankFormat },
    { enabled: isPremium && tab === "bank" }
  );
  const {
    data: practiceSet,
    isLoading: practiceLoading,
    error: practiceError,
    refetch: refetchPractice,
  } = trpc.interview.getRandomSet.useQuery(
    { format: practiceFormat, count: practiceFormat === "MMI" ? 8 : 6 },
    { enabled: isPremium && tab === "practice" }
  );

  const currentQuestion = practiceSet?.[activeIndex];
  const timerLimit = practiceFormat === "MMI" ? 480 : 2700;

  useEffect(() => {
    if (!isTimerRunning) return;
    const interval = setInterval(() => {
      setTimer(t => {
        if (t >= timerLimit) {
          clearInterval(interval);
          setIsTimerRunning(false);
          return t;
        }
        return t + 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning, timerLimit]);

  const startTimer = () => {
    setTimer(0);
    setHasStarted(true);
    setIsTimerRunning(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <main className="min-h-screen bg-[var(--page-bg)]">
      <div className="pt-20 pb-12 bg-gradient-to-br from-[var(--page-bg)] to-[var(--page-surface)]">
        <div className="section-container max-w-7xl mx-auto px-4">
          <Link
            to="/guides"
            className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Guides
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#8B5CF6] to-[#F59E0B] flex items-center justify-center">
              <MessageSquare className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-[var(--text-primary)]">
                Interview Preparation
              </h1>
              <p className="text-[var(--text-secondary)]">
                Master MMI and Panel interview formats for Canadian dental
                schools.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="section-container max-w-7xl mx-auto -mt-8 pb-20 px-4">
        <Card className="border-[var(--border-color)] mb-6">
          <CardContent className="p-2">
            <div className="flex gap-1">
              {[
                { id: "guide", label: "Guide" },
                { id: "bank", label: "Question Bank" },
                { id: "practice", label: "Practice Simulator" },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id as typeof tab)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    tab === t.id
                      ? "bg-[#2563EB] text-white"
                      : "text-[var(--text-secondary)] hover:bg-[var(--page-muted)]"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {tab === "guide" && (
          <div className="space-y-6">
            <Card className="border-[#2563EB]/30 bg-[#2563EB]/5">
              <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-[var(--text-primary)] mb-1">
                    Ready to practice?
                  </h2>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Browse real interview questions or run a timed mock
                    interview.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setTab("bank")}
                    className="border-[#2563EB] text-[#2563EB] hover:bg-[#2563EB]/10"
                  >
                    Browse Question Bank
                  </Button>
                  <Button
                    onClick={() => setTab("practice")}
                    className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
                  >
                    Start Practice
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-[var(--border-color)]">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="w-5 h-5 text-[#2563EB]" />
                    <h2 className="text-lg font-bold text-[var(--text-primary)]">
                      MMI Format
                    </h2>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] mb-4">
                    Multiple Mini Interview consists of 8-10 short stations,
                    each with a different scenario or task.
                  </p>
                  <div className="space-y-2">
                    {mmiStations.map(station => (
                      <div
                        key={station.type}
                        className="p-3 rounded-lg bg-[var(--page-bg)] border border-[var(--border-color)]"
                      >
                        <p className="text-sm font-medium text-[var(--text-primary)]">
                          {station.type}
                        </p>
                        <p className="text-xs text-[var(--text-secondary)]">
                          {station.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-[var(--border-color)]">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <MessageSquare className="w-5 h-5 text-[#10B981]" />
                    <h2 className="text-lg font-bold text-[var(--text-primary)]">
                      Panel Format
                    </h2>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] mb-4">
                    Traditional interview with 2-3 faculty members. Lasts 30-45
                    minutes with conversational questions.
                  </p>
                  <div className="space-y-3">
                    {panelCategories.map(q => (
                      <div
                        key={q.category}
                        className="p-3 rounded-lg bg-[var(--page-bg)] border border-[var(--border-color)]"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium text-[var(--text-primary)]">
                            {q.category}
                          </p>
                          <Badge className="text-[10px] bg-[var(--page-muted)] text-[#F59E0B]">
                            {q.frequency}% freq
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-[var(--border-color)]">
              <CardContent className="p-6">
                <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">
                  Interview Format by School
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[var(--border-color)]">
                        <th className="text-left py-2 px-3 text-xs font-semibold text-[var(--text-secondary)]">
                          School
                        </th>
                        <th className="text-center py-2 px-3 text-xs font-semibold text-[var(--text-secondary)]">
                          Format
                        </th>
                        <th className="text-center py-2 px-3 text-xs font-semibold text-[var(--text-secondary)]">
                          Duration
                        </th>
                        <th className="text-left py-2 px-3 text-xs font-semibold text-[var(--text-secondary)]">
                          Notes
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {schoolFormats.map(s => (
                        <tr
                          key={s.school}
                          className="border-b border-[var(--border-color)]/50 hover:bg-[var(--page-bg)]"
                        >
                          <td className="py-2.5 px-3 text-sm text-[var(--text-primary)]">
                            {s.school}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <Badge
                              className={
                                s.format === "MMI"
                                  ? "bg-[var(--page-muted)] text-[#2563EB]"
                                  : "bg-[var(--page-muted)] text-[#10B981]"
                              }
                            >
                              {s.format}
                            </Badge>
                          </td>
                          <td className="py-2.5 px-3 text-sm text-center text-[var(--text-secondary)]">
                            {s.duration}
                          </td>
                          <td className="py-2.5 px-3 text-xs text-[var(--text-secondary)]">
                            {s.notes}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[var(--border-color)]">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-[#F59E0B]" />
                  <h2 className="text-lg font-bold text-[var(--text-primary)]">
                    Preparation Timeline
                  </h2>
                </div>
                <div className="space-y-4">
                  {prepTimeline.map((phase, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-[#2563EB] text-white text-xs font-bold flex items-center justify-center shrink-0">
                          {i + 1}
                        </div>
                        {i < prepTimeline.length - 1 && (
                          <div className="w-0.5 h-full bg-[#E2E8F0] my-1" />
                        )}
                      </div>
                      <div className="pb-4">
                        <p className="text-sm font-semibold text-[var(--text-primary)] mb-1">
                          {phase.when}
                        </p>
                        <ul className="space-y-1">
                          {phase.tasks.map((task, j) => (
                            <li
                              key={j}
                              className="flex items-start gap-1.5 text-xs text-[var(--text-secondary)]"
                            >
                              <Check className="w-3.5 h-3.5 text-[#10B981] mt-0.5 shrink-0" />
                              {task}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-[var(--border-color)]">
              <CardContent className="p-6">
                <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">
                  Self-Assessment Rubric
                </h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {rubric.map(item => (
                    <div
                      key={item.criterion}
                      className="p-3 rounded-lg bg-[var(--page-bg)] border border-[var(--border-color)]"
                    >
                      <p className="text-sm font-medium text-[var(--text-primary)]">
                        {item.criterion}
                      </p>
                      <p className="text-xs text-[var(--text-secondary)]">
                        {item.desc}
                      </p>
                      <div className="flex gap-1 mt-2">
                        {[1, 2, 3, 4, 5].map(n => (
                          <div
                            key={n}
                            className="w-6 h-6 rounded border border-[var(--border-color)] flex items-center justify-center text-[10px] text-[var(--text-tertiary)]"
                          >
                            {n}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {tab === "bank" &&
          (!isPremium ? (
            <PremiumLock
              title="Premium Interview Question Bank"
              description="Upgrade to browse the interview bank and model answers."
            />
          ) : (
            <Card className="border-[var(--border-color)]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-[var(--text-primary)]">
                    Question Bank
                  </h2>
                  <div className="flex gap-2">
                    {(["Panel", "MMI"] as const).map(f => (
                      <button
                        key={f}
                        onClick={() => setBankFormat(f)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          bankFormat === f
                            ? "bg-[#2563EB] text-white"
                            : "bg-[var(--page-muted)] text-[var(--text-secondary)] hover:bg-[var(--border-color)]"
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                {bankLoading && (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                )}

                {!bankLoading && bankError && (
                  <div className="p-8 text-center">
                    <p className="text-sm text-[#EF4444]">
                      Failed to load questions. Please try again.
                    </p>
                  </div>
                )}

                {!bankLoading && !bankError && questions?.length === 0 && (
                  <div className="p-8 text-center">
                    <p className="text-sm text-[var(--text-secondary)]">
                      No questions found for {bankFormat} format.
                    </p>
                  </div>
                )}

                <div className="space-y-3">
                  {questions?.map(q => (
                    <div
                      key={q.id}
                      className="p-4 rounded-lg bg-[var(--page-bg)] border border-[var(--border-color)]"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Badge
                          className={
                            q.format === "MMI"
                              ? "bg-[var(--page-muted)] text-[#2563EB]"
                              : "bg-[var(--page-muted)] text-[#10B981]"
                          }
                        >
                          {q.format}
                        </Badge>
                        <span className="text-xs text-[var(--text-tertiary)]">
                          {q.category}
                        </span>
                        {q.frequency && (
                          <span className="text-[10px] text-[#F59E0B]">
                            ★ {q.frequency}%
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-[var(--text-primary)]">
                        {q.question}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

        {tab === "practice" &&
          (!isPremium ? (
            <PremiumLock
              title="Premium Interview Simulator"
              description="Upgrade to run timed MMI and panel interview practice sets."
            />
          ) : (
            <Card className="border-[var(--border-color)]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-[var(--text-primary)]">
                    Practice Simulator
                  </h2>
                  <div className="flex items-center gap-2">
                    {(["MMI", "Panel"] as const).map(f => (
                      <button
                        key={f}
                        onClick={() => {
                          setPracticeFormat(f);
                          setActiveIndex(0);
                          setTimer(0);
                          setIsTimerRunning(false);
                          setHasStarted(false);
                          setShowAnswer(false);
                          refetchPractice();
                        }}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          practiceFormat === f
                            ? "bg-[#2563EB] text-white"
                            : "bg-[var(--page-muted)] text-[var(--text-secondary)] hover:bg-[var(--border-color)]"
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                {practiceLoading && (
                  <div className="text-center py-10">
                    <div className="w-8 h-8 border-2 border-[var(--border-color)] border-t-[#2563EB] rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-[var(--text-secondary)] text-sm">
                      Loading questions...
                    </p>
                  </div>
                )}

                {!practiceLoading && practiceError && (
                  <div className="text-center py-10">
                    <p className="text-sm text-[#EF4444] mb-4">
                      Failed to load practice questions.
                    </p>
                    <Button
                      onClick={() => refetchPractice()}
                      className="bg-[#2563EB] hover:bg-[#1D4ED8]"
                    >
                      Try Again
                    </Button>
                  </div>
                )}

                {!practiceLoading &&
                  !practiceError &&
                  practiceSet?.length === 0 && (
                    <div className="text-center py-10">
                      <p className="text-[var(--text-secondary)] text-sm">
                        No practice questions available for {practiceFormat}{" "}
                        format.
                      </p>
                    </div>
                  )}

                {!practiceLoading &&
                  !practiceError &&
                  practiceSet &&
                  practiceSet.length > 0 &&
                  !hasStarted && (
                    <div className="text-center py-10">
                      <Play className="w-10 h-10 text-[#2563EB] mx-auto mb-3" />
                      <p className="text-[var(--text-secondary)] text-sm mb-4">
                        {practiceFormat === "MMI"
                          ? `${practiceSet.length} stations • 2 min prep + 5-8 min response each`
                          : `${practiceSet.length} questions • practice with a 45-min timer`}
                      </p>
                      <Button
                        onClick={startTimer}
                        className="bg-[#2563EB] hover:bg-[#1D4ED8]"
                      >
                        Start Mock Interview
                      </Button>
                    </div>
                  )}

                {currentQuestion && (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-xs text-[var(--text-tertiary)]">
                          Question {activeIndex + 1} of {practiceSet?.length}
                        </p>
                        <p className="text-xs text-[var(--text-tertiary)]">
                          {currentQuestion.category}
                        </p>
                      </div>
                      <div
                        className={`text-xl font-mono font-bold ${timer > (practiceFormat === "MMI" ? 360 : 2400) ? "text-[#EF4444]" : "text-[var(--text-primary)]"}`}
                      >
                        {formatTime(timer)}
                      </div>
                    </div>

                    <div className="p-5 rounded-lg bg-[var(--page-bg)] border border-[var(--border-color)] mb-4">
                      <p className="text-base text-[var(--text-primary)] leading-relaxed">
                        {currentQuestion.question}
                      </p>
                    </div>

                    {showAnswer && currentQuestion.modelAnswer && (
                      <div className="p-4 rounded-lg bg-[var(--page-muted)] border border-[var(--border-color)] mb-4">
                        <p className="text-xs font-medium text-[#10B981] mb-1">
                          Model Answer
                        </p>
                        <p className="text-sm text-[var(--text-primary)]">
                          {currentQuestion.modelAnswer}
                        </p>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setShowAnswer(s => !s)}
                        className="text-sm"
                      >
                        {showAnswer ? "Hide Model Answer" : "Show Model Answer"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setActiveIndex(i => Math.max(0, i - 1));
                          setShowAnswer(false);
                        }}
                        disabled={activeIndex === 0}
                        className="text-sm"
                      >
                        Previous
                      </Button>
                      <Button
                        onClick={() => {
                          if (activeIndex < (practiceSet?.length ?? 1) - 1) {
                            setActiveIndex(i => i + 1);
                            setShowAnswer(false);
                          } else {
                            setIsTimerRunning(false);
                            setActiveIndex(0);
                          }
                        }}
                        className="bg-[#2563EB] hover:bg-[#1D4ED8] text-sm"
                      >
                        {activeIndex < (practiceSet?.length ?? 1) - 1
                          ? "Next Question"
                          : "Finish"}
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setActiveIndex(0);
                          setTimer(0);
                          setIsTimerRunning(false);
                          setHasStarted(false);
                          setShowAnswer(false);
                          refetchPractice();
                        }}
                        className="text-sm ml-auto"
                      >
                        <RefreshCw className="w-4 h-4 mr-1" /> New Set
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
      </div>
    </main>
  );
}
