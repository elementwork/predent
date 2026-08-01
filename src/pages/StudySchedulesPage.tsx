import { useState, useMemo } from "react";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Check,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { usePageTitle } from "@/hooks/usePageTitle";

const subjectColors: Record<string, string> = {
  biology: "#10B981",
  chemistry: "#2563EB",
  pat: "#8B5CF6",
  rc: "#F59E0B",
};

const subjectNames: Record<string, string> = {
  biology: "Biology",
  chemistry: "Chemistry",
  pat: "PAT",
  rc: "Reading Comp",
};

interface ScheduleInput {
  testDate: string;
  hoursPerWeek: number;
  comfortLevels: {
    biology: number;
    chemistry: number;
    pat: number;
    rc: number;
  };
}

interface GeneratedSchedule {
  weeks: number;
  totalHours: number;
  dailyPlan: Array<{
    week: number;
    focus: string;
    tasks: string[];
    hours: number;
  }>;
  breakdown: {
    biology: number;
    chemistry: number;
    pat: number;
    rc: number;
  };
}

function generateSchedule(input: ScheduleInput): GeneratedSchedule | null {
  if (!input.testDate) return null;

  const testDate = new Date(input.testDate);
  const today = new Date();
  const diffTime = testDate.getTime() - today.getTime();
  const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));

  if (diffWeeks < 1 || diffWeeks > 52) return null;

  const totalHours = diffWeeks * input.hoursPerWeek;

  // Calculate subject breakdown based on comfort levels
  const comfort = input.comfortLevels;
  const totalComfort = comfort.biology + comfort.chemistry + comfort.pat + comfort.rc;

  // Lower comfort = more study time needed
  const bioWeight = (10 - comfort.biology) / (40 - totalComfort);
  const chemWeight = (10 - comfort.chemistry) / (40 - totalComfort);
  const patWeight = (10 - comfort.pat) / (40 - totalComfort);
  const rcWeight = (10 - comfort.rc) / (40 - totalComfort);

  const breakdown = {
    biology: Math.round(bioWeight * 100),
    chemistry: Math.round(chemWeight * 100),
    pat: Math.round(patWeight * 100),
    rc: Math.round(rcWeight * 100),
  };

  // Normalize to 100%
  const total = breakdown.biology + breakdown.chemistry + breakdown.pat + breakdown.rc;
  breakdown.biology = Math.round((breakdown.biology / total) * 100);
  breakdown.chemistry = Math.round((breakdown.chemistry / total) * 100);
  breakdown.pat = Math.round((breakdown.pat / total) * 100);
  breakdown.rc = 100 - breakdown.biology - breakdown.chemistry - breakdown.pat;

  // Generate weekly plan
  const dailyPlan: GeneratedSchedule["dailyPlan"] = [];

  for (let week = 1; week <= diffWeeks; week++) {
    const weekProgress = week / diffWeeks;
    let focus: string;
    let tasks: string[];
    const hours = input.hoursPerWeek;

    if (weekProgress <= 0.25) {
      // First quarter: Content review
      focus = "Content Review";
      tasks = [
        `Study Biology: ${Math.round(hours * breakdown.biology * 0.4 / 100 * 7)} hrs/week`,
        `Study Chemistry: ${Math.round(hours * breakdown.chemistry * 0.4 / 100 * 7)} hrs/week`,
        `Review fundamentals and key concepts`,
      ];
    } else if (weekProgress <= 0.5) {
      // Second quarter: Practice
      focus = "Practice & Application";
      tasks = [
        `PAT Practice: ${Math.round(hours * breakdown.pat * 0.4 / 100 * 7)} hrs/week`,
        `RC Practice: ${Math.round(hours * breakdown.rc * 0.4 / 100 * 7)} hrs/week`,
        `Continue content review for weak areas`,
      ];
    } else if (weekProgress <= 0.75) {
      // Third quarter: Mixed practice
      focus = "Mixed Practice";
      tasks = [
        `Full practice tests`,
        `Target weak subjects`,
        `Review mistakes and patterns`,
      ];
    } else {
      // Final quarter: Exam simulation
      focus = "Exam Simulation";
      tasks = [
        `Full-length practice exams`,
        `Final review of weak areas`,
        `Mental preparation and rest`,
      ];
    }

    dailyPlan.push({
      week,
      focus,
      tasks,
      hours,
    });
  }

  return {
    weeks: diffWeeks,
    totalHours,
    dailyPlan,
    breakdown,
  };
}

function DynamicScheduleGenerator() {
  const [input, setInput] = useState<ScheduleInput>({
    testDate: "",
    hoursPerWeek: 15,
    comfortLevels: {
      biology: 5,
      chemistry: 5,
      pat: 5,
      rc: 5,
    },
  });

  const schedule = useMemo(() => generateSchedule(input), [input]);

  return (
    <Card className="mb-8 border-[var(--border-color)] bg-[var(--page-surface)]">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#8B5CF6] flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">
              Personalized Schedule Generator
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">
              Get a custom study plan based on your test date and comfort levels
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Input Form */}
          <div className="space-y-4">
            <div>
              <Label className="text-[var(--text-secondary)]">
                DAT Test Date
              </Label>
              <Input
                type="date"
                value={input.testDate}
                onChange={e =>
                  setInput({ ...input, testDate: e.target.value })
                }
                className="mt-1 bg-[var(--page-muted)] border-[var(--border-color)] text-[var(--text-primary)]"
              />
            </div>

            <div>
              <Label className="text-[var(--text-secondary)]">
                Hours per Week: {input.hoursPerWeek}
              </Label>
              <Slider
                value={[input.hoursPerWeek]}
                onValueChange={([v]) =>
                  setInput({ ...input, hoursPerWeek: v })
                }
                min={5}
                max={40}
                step={5}
                className="mt-2"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-[var(--text-secondary)]">
                Comfort Levels (1 = Low, 10 = High)
              </Label>
              {Object.entries(input.comfortLevels).map(([subject, value]) => (
                <div key={subject} className="flex items-center gap-3">
                  <span className="w-24 text-xs text-[var(--text-secondary)] capitalize">
                    {subjectNames[subject]}
                  </span>
                  <Slider
                    value={[value]}
                    onValueChange={([v]) =>
                      setInput({
                        ...input,
                        comfortLevels: {
                          ...input.comfortLevels,
                          [subject]: v,
                        },
                      })
                    }
                    min={1}
                    max={10}
                    step={1}
                    className="flex-1"
                  />
                  <span className="w-8 text-xs text-[var(--text-secondary)] text-right">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Generated Schedule */}
          {schedule && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[var(--text-tertiary)]" />
                  <span className="text-[var(--text-secondary)]">
                    {schedule.weeks} weeks
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[var(--text-tertiary)]" />
                  <span className="text-[var(--text-secondary)]">
                    {schedule.totalHours} total hours
                  </span>
                </div>
              </div>

              {/* Subject Breakdown */}
              <div>
                <p className="text-xs font-medium text-[var(--text-secondary)] mb-2">
                  Recommended Subject Breakdown
                </p>
                <div className="flex gap-1 h-3 rounded-full overflow-hidden">
                  {Object.entries(schedule.breakdown).map(([sub, pct]) => (
                    <div
                      key={sub}
                      style={{
                        width: `${pct}%`,
                        backgroundColor: subjectColors[sub],
                      }}
                      title={`${sub}: ${pct}%`}
                    />
                  ))}
                </div>
                <div className="flex gap-3 mt-2">
                  {Object.entries(schedule.breakdown).map(([sub, pct]) => (
                    <div key={sub} className="flex items-center gap-1">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: subjectColors[sub] }}
                      />
                      <span className="text-[10px] text-[var(--text-secondary)] capitalize">
                        {subjectNames[sub]} {pct}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weekly Plan Preview */}
              <div>
                <p className="text-xs font-medium text-[var(--text-secondary)] mb-2">
                  Weekly Plan Preview
                </p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {schedule.dailyPlan.slice(0, 4).map(week => (
                    <div
                      key={week.week}
                      className="p-2 rounded-lg bg-[var(--page-muted)] text-xs"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-[var(--text-primary)]">
                          Week {week.week}
                        </span>
                        <Badge variant="outline" className="text-[10px]">
                          {week.focus}
                        </Badge>
                      </div>
                      <ul className="space-y-0.5">
                        {week.tasks.map((task, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-1 text-[var(--text-secondary)]"
                          >
                            <Check className="w-3 h-3 text-[#10B981] mt-0.5 shrink-0" />
                            {task}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

const schedules = [
  {
    weeks: 4,
    title: "Crash Course",
    hoursPerWeek: "20-30",
    totalHours: "80-120",
    description:
      "Intensive review for students with strong foundational knowledge.",
    breakdown: { biology: 35, chemistry: 30, pat: 25, rc: 10 },
    milestones: [
      "Week 1: Content review all subjects",
      "Week 2: PAT intensive + practice tests",
      "Week 3: Weak area focus + full mocks",
      "Week 4: Final review + exam simulation",
    ],
    difficulty: "High",
    color: "#EF4444",
    bgColor: "#FEF2F2",
  },
  {
    weeks: 8,
    title: "Accelerated",
    hoursPerWeek: "15-20",
    totalHours: "120-160",
    description: "Fast-paced schedule for students with moderate preparation.",
    breakdown: { biology: 35, chemistry: 30, pat: 25, rc: 10 },
    milestones: [
      "Weeks 1-2: Biology & Chemistry content",
      "Weeks 3-4: PAT all categories",
      "Weeks 5-6: Reading Comprehension + mixed practice",
      "Weeks 7-8: Full mock exams + review",
    ],
    difficulty: "Medium",
    color: "#F59E0B",
    bgColor: "#FFFBEB",
  },
  {
    weeks: 12,
    title: "Standard",
    hoursPerWeek: "10-15",
    totalHours: "120-180",
    description: "Balanced approach for most pre-dental students.",
    breakdown: { biology: 30, chemistry: 30, pat: 25, rc: 15 },
    milestones: [
      "Weeks 1-4: Biology & Chemistry fundamentals",
      "Weeks 5-8: PAT practice with 3D models",
      "Weeks 9-10: RC strategy + timed practice",
      "Weeks 11-12: Mock exams + final review",
    ],
    difficulty: "Medium",
    color: "#2563EB",
    bgColor: "#EFF6FF",
  },
  {
    weeks: 16,
    title: "Comprehensive",
    hoursPerWeek: "8-12",
    totalHours: "128-192",
    description: "Thorough preparation for students needing content review.",
    breakdown: { biology: 30, chemistry: 25, pat: 25, rc: 20 },
    milestones: [
      "Weeks 1-6: Complete content review all subjects",
      "Weeks 7-10: PAT mastery + generator practice",
      "Weeks 11-13: RC passages + timing drills",
      "Weeks 14-16: Full mocks + weak area polish",
    ],
    difficulty: "Low",
    color: "#10B981",
    bgColor: "#ECFDF5",
  },
];

export default function StudySchedulesPage() {
  usePageTitle("Study Schedules");
  const [selectedWeeks, setSelectedWeeks] = useState<number | null>(null);

  return (
    <main className="min-h-screen bg-[var(--page-bg)]">
      {/* Header */}
      <div className="pt-20 pb-12 bg-gradient-to-br from-[var(--page-bg)] to-[var(--page-surface)]">
        <div className="section-container max-w-7xl mx-auto">
          <a
            href="/guides"
            className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Guides
          </a>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#10B981] to-[#2563EB] flex items-center justify-center">
              <Calendar className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-[var(--text-primary)]">
                DAT Study Schedules
              </h1>
              <p className="text-[var(--text-secondary)]">
                Proven study plans for the Canadian DAT.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="section-container max-w-7xl mx-auto -mt-8 pb-20">
        {/* Dynamic Generator */}
        <DynamicScheduleGenerator />

        {/* Alert */}
        <div className="mb-6 p-4 rounded-lg bg-[var(--page-muted)] border border-[var(--border-color)] flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-[#F59E0B] shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-[var(--text-primary)]">
              Canadian DAT vs American DAT
            </p>
            <p className="text-sm text-[var(--text-secondary)]">
              The Canadian DAT does NOT include Organic Chemistry or
              Quantitative Reasoning. Make sure your study materials are
              Canadian-focused.
            </p>
          </div>
        </div>

        {/* Schedule Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {schedules.map(s => (
            <Card
              key={s.weeks}
              className={`border-[var(--border-color)] cursor-pointer transition-all ${
                selectedWeeks === s.weeks
                  ? "ring-2 ring-[#2563EB] shadow-lg"
                  : "hover:shadow-md"
              }`}
              onClick={() => setSelectedWeeks(s.weeks)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                      style={{ backgroundColor: s.color }}
                    >
                      {s.weeks}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                        {s.title}
                      </h3>
                      <p className="text-xs text-[var(--text-secondary)]">{s.weeks} weeks</p>
                    </div>
                  </div>
                  <Badge
                    style={{
                      backgroundColor: s.bgColor,
                      color: s.color,
                      borderColor: s.color,
                    }}
                    variant="outline"
                  >
                    {s.difficulty} Intensity
                  </Badge>
                </div>

                <p className="text-sm text-[var(--text-secondary)] mb-4">{s.description}</p>

                <div className="flex items-center gap-4 mb-4 text-sm">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[var(--text-tertiary)]" />
                    <span className="text-[var(--text-secondary)]">
                      {s.hoursPerWeek} hrs/week
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-[var(--text-tertiary)]" />
                    <span className="text-[var(--text-secondary)]">{s.totalHours} total</span>
                  </div>
                </div>

                {/* Subject Breakdown */}
                <div className="mb-4">
                  <p className="text-xs font-medium text-[var(--text-secondary)] mb-2">
                    Subject Breakdown
                  </p>
                  <div className="flex gap-1 h-3 rounded-full overflow-hidden">
                    {Object.entries(s.breakdown).map(([sub, pct]) => (
                      <div
                        key={sub}
                        style={{
                          width: `${pct}%`,
                          backgroundColor: subjectColors[sub],
                        }}
                        title={`${sub}: ${pct}%`}
                      />
                    ))}
                  </div>
                  <div className="flex gap-3 mt-2">
                    {Object.entries(s.breakdown).map(([sub, pct]) => (
                      <div key={sub} className="flex items-center gap-1">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: subjectColors[sub] }}
                        />
                        <span className="text-[10px] text-[var(--text-secondary)] capitalize">
                          {sub} {pct}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedWeeks === s.weeks && (
                  <div className="mt-4 pt-4 border-t border-[var(--border-color)] animate-fade-in">
                    <p className="text-xs font-semibold text-[var(--text-primary)] mb-2">
                      Milestones
                    </p>
                    <ul className="space-y-2">
                      {s.milestones.map((m, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-xs text-[var(--text-secondary)]"
                        >
                          <Check className="w-3.5 h-3.5 text-[#10B981] mt-0.5 shrink-0" />
                          {m}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
