import { useState } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Link } from "react-router-dom";
import {
  BookOpen,
  FlaskConical,
  Glasses,
  Calendar,
  Layers,
  Check,
  Brain,
  Dices,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import FlashcardStudyModal, {
  type Flashcard,
} from "@/components/FlashcardStudyModal";
import { trpc } from "@/providers/trpc";

const baseModules = [
  {
    id: "biology",
    title: "Biology",
    icon: BookOpen,
    color: "#10B981",
    units: 7,
    subjectKey: "biology" as const,
    hours: 40,
    description: "Cell biology, physiology, microbiology, anatomy, and more.",
  },
  {
    id: "chemistry",
    title: "Chemistry",
    icon: FlaskConical,
    color: "#2563EB",
    units: 9,
    subjectKey: "chemistry" as const,
    hours: 45,
    description:
      "General chemistry only — Canadian DAT does NOT include Organic Chemistry.",
  },
  {
    id: "reading",
    title: "Reading Comprehension",
    icon: Glasses,
    color: "#8B5CF6",
    units: 5,
    subjectKey: "reading" as const,
    hours: 20,
    description: "Skim-scan-deep read, keyword mapping, and timing strategies.",
  },
];

const biologyUnits = [
  { name: "Cell Biology", hours: 5 },
  { name: "Molecular Biology", hours: 7 },
  { name: "Evolution & Ecology", hours: 4 },
  { name: "Physiology", hours: 9 },
  { name: "Microbiology", hours: 5 },
  { name: "Plant Biology", hours: 3 },
  { name: "Anatomy", hours: 7 },
];

const chemistryUnits = [
  { name: "Atomic Structure", hours: 4 },
  { name: "Bonding", hours: 5 },
  { name: "Stoichiometry", hours: 6 },
  { name: "Gases", hours: 4 },
  { name: "Solutions", hours: 5 },
  { name: "Equilibrium", hours: 6 },
  { name: "Thermodynamics", hours: 5 },
  { name: "Electrochemistry", hours: 5 },
  { name: "Kinetics", hours: 5 },
];

const flashcardData: Record<string, Flashcard[]> = {
  Biology: [
    { front: "What is the powerhouse of the cell?", back: "Mitochondria" },
    { front: "What molecule carries genetic information?", back: "DNA" },
    { front: "What is the primary function of ribosomes?", back: "Protein synthesis" },
    { front: "What type of biomolecule are enzymes?", back: "Proteins" },
    { front: "What gas do plants take in during photosynthesis?", back: "Carbon dioxide" },
  ],
  Chemistry: [
    { front: "What is the chemical formula for water?", back: "H₂O" },
    { front: "What is the pH of pure water at 25°C?", back: "7" },
    { front: "What is the charge of a proton?", back: "Positive (+1)" },
    { front: "What type of bond involves sharing electrons?", back: "Covalent bond" },
    { front: "What is Avogadro's number (approximate)?", back: "6.022 × 10²³" },
  ],
  "PAT Concepts": [
    { front: "What should you identify first in Keyholes?", back: "Deepest concave/convex features" },
    { front: "What does TFE stand for?", back: "Top-Front-End" },
    { front: "What should you ignore in Angle Ranking?", back: "Line length" },
    { front: "How many new hole positions can each unfold create?", back: "Up to 2 (mirror image)" },
    { front: "In Cube Counting, how many painted faces does a corner cube have?", back: "3" },
  ],
};

const flashcardDecks = [
  { subject: "Biology", cards: flashcardData["Biology"]?.length ?? 0, color: "#10B981" },
  { subject: "Chemistry", cards: flashcardData["Chemistry"]?.length ?? 0, color: "#2563EB" },
  { subject: "PAT Concepts", cards: flashcardData["PAT Concepts"]?.length ?? 0, color: "#F59E0B" },
];

export default function DATAcademyPage() {
  usePageTitle("DAT Academy");
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [testDate, setTestDate] = useState<string>("");
  const [hoursPerWeek, setHoursPerWeek] = useState<number>(15);
  const [comfort, setComfort] = useState({
    biology: 3,
    chemistry: 3,
    pat: 3,
    rc: 3,
  });
  const [studyDeck, setStudyDeck] = useState<string | null>(null);
  const [schedule, setSchedule] = useState<Array<{
    week: number;
    biology: number;
    chemistry: number;
    pat: number;
    rc: number;
    total: number;
  }> | null>(null);

  const questionCountQuery = trpc.dat.questionCount.useQuery();
  const counts = questionCountQuery.data?.bySubject ?? {};
  const modules = baseModules.map(m => ({
    ...m,
    questions: counts[m.subjectKey] ?? 0,
  }));

  const generateSchedule = () => {
    if (!testDate) return;
    const weeks = Math.max(4, Math.min(24, Math.ceil(hoursPerWeek / 4)));
    const plan = [];
    for (let week = 1; week <= weeks; week++) {
      const total = hoursPerWeek;
      const biology = Math.round(total * (0.35 + (4 - comfort.biology) * 0.03));
      const chemistry = Math.round(
        total * (0.35 + (4 - comfort.chemistry) * 0.03)
      );
      const pat = Math.round(total * (0.2 + (4 - comfort.pat) * 0.02));
      const rc = Math.max(2, total - biology - chemistry - pat);
      plan.push({
        week,
        biology,
        chemistry,
        pat,
        rc,
        total: biology + chemistry + pat + rc,
      });
    }
    setSchedule(plan);
  };

  return (
    <main className="min-h-screen bg-[var(--page-bg)]">
      <div className="pt-20 pb-12 bg-gradient-to-br from-[var(--page-bg)] to-[var(--page-surface)]">
        <div className="section-container max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#10B981] to-[#2563EB] flex items-center justify-center">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-[var(--text-primary)]">
                DAT Academy
              </h1>
              <p className="text-[var(--text-secondary)]">
                Structured Biology, Chemistry, and Reading Comprehension prep.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="section-container max-w-7xl mx-auto -mt-8 pb-20 px-4 space-y-8">
        {/* Module Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {modules.map(mod => (
            <Card
              key={mod.id}
              className={`border-[var(--border-color)] hover:shadow-lg transition-all cursor-pointer ${activeModule === mod.id ? "ring-2 ring-[#2563EB]" : ""}`}
              onClick={() =>
                setActiveModule(activeModule === mod.id ? null : mod.id)
              }
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${mod.color}15` }}
                  >
                    <mod.icon
                      className="w-5 h-5"
                      style={{ color: mod.color }}
                    />
                  </div>
                  <h2 className="text-lg font-bold text-[var(--text-primary)]">
                    {mod.title}
                  </h2>
                </div>
                <p className="text-sm text-[var(--text-secondary)] mb-4">{mod.description}</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="text-[10px]">
                    {mod.units} units
                  </Badge>
                  <Badge variant="secondary" className="text-[10px]">
                    {mod.questions} questions
                  </Badge>
                  <Badge variant="secondary" className="text-[10px]">
                    {mod.hours} hrs
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Practice CTA */}
        <Card className="border-[#2563EB]/30 bg-[#2563EB]/5">
          <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#2563EB] flex items-center justify-center">
                <Dices className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">
                  Practice Question Bank
                </h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  Try Biology, Chemistry, and Reading Comprehension questions
                  with instant feedback.
                </p>
              </div>
            </div>
            <Button
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
              asChild
            >
              <Link to="/dat-academy/practice">Start Practice</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Module Detail */}
        {activeModule && (
          <Card className="border-[var(--border-color)]">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">
                {modules.find(m => m.id === activeModule)?.title} Units
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {(activeModule === "biology"
                  ? biologyUnits
                  : activeModule === "chemistry"
                    ? chemistryUnits
                    : [
                        { name: "Skim-Scan-Deep Read", hours: 4 },
                        { name: "Keyword Mapping", hours: 3 },
                        { name: "Question-First Method", hours: 4 },
                        { name: "Elimination Technique", hours: 3 },
                        { name: "Timing Trainer", hours: 6 },
                      ]
                ).map((unit, i) => (
                  <div
                    key={unit.name}
                    className="p-3 rounded-lg bg-[var(--page-bg)] border border-[var(--border-color)]"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-[var(--text-primary)]">
                        {i + 1}. {unit.name}
                      </span>
                      <span className="text-[10px] text-[var(--text-tertiary)]">
                        {unit.hours}h
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Flashcards */}
        <Card className="border-[var(--border-color)]">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Layers className="w-5 h-5 text-[#F59E0B]" />
              <h2 className="text-lg font-bold text-[var(--text-primary)]">
                Flashcard Decks
              </h2>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              {flashcardDecks.map(deck => (
                <div
                  key={deck.subject}
                  className="p-4 rounded-lg bg-[var(--page-bg)] border border-[var(--border-color)] flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">
                      {deck.subject}
                    </p>
                    <p className="text-xs text-[var(--text-secondary)]">{deck.cards} cards</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    onClick={() => setStudyDeck(deck.subject)}
                  >
                    Study
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Study Schedule Generator */}
        <Card className="border-[var(--border-color)]">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-[#2563EB]" />
              <h2 className="text-lg font-bold text-[var(--text-primary)]">
                Study Schedule Generator
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="text-sm font-medium text-[var(--text-secondary)] mb-2 block">
                  DAT Test Date
                </label>
                <input
                  type="date"
                  value={testDate}
                  onChange={e => setTestDate(e.target.value)}
                  className="w-full h-11 rounded-lg border border-[var(--border-color)] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-[var(--text-secondary)] mb-2 block">
                  Hours per week: {hoursPerWeek}
                </label>
                <Slider
                  value={[hoursPerWeek]}
                  onValueChange={v => setHoursPerWeek(v[0])}
                  min={5}
                  max={40}
                  step={1}
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {(["biology", "chemistry", "pat", "rc"] as const).map(subject => (
                <div key={subject} className="p-3 rounded-lg bg-[var(--page-bg)]">
                  <p className="text-xs font-medium text-[var(--text-secondary)] capitalize mb-2">
                    {subject} comfort
                  </p>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map(n => (
                      <button
                        key={n}
                        onClick={() =>
                          setComfort(c => ({ ...c, [subject]: n }))
                        }
                        className={`flex-1 h-7 rounded text-[10px] font-medium transition-colors ${
                          comfort[subject] === n
                            ? "bg-[#2563EB] text-white"
                            : "bg-[var(--page-surface)] border border-[var(--border-color)] text-[var(--text-tertiary)] hover:bg-[var(--border-color)]"
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <Button
              onClick={generateSchedule}
              className="bg-[#2563EB] hover:bg-[#1D4ED8]"
            >
              Generate Schedule
            </Button>

            {schedule && (
              <div className="mt-6 space-y-2">
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                  Your {schedule.length}-Week Plan
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[var(--border-color)]">
                        <th className="text-left py-2 text-xs text-[var(--text-secondary)]">
                          Week
                        </th>
                        <th className="text-center py-2 text-xs text-[var(--text-secondary)]">
                          Biology
                        </th>
                        <th className="text-center py-2 text-xs text-[var(--text-secondary)]">
                          Chemistry
                        </th>
                        <th className="text-center py-2 text-xs text-[var(--text-secondary)]">
                          PAT
                        </th>
                        <th className="text-center py-2 text-xs text-[var(--text-secondary)]">
                          RC
                        </th>
                        <th className="text-center py-2 text-xs text-[var(--text-secondary)]">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {schedule.map(week => (
                        <tr
                          key={week.week}
                          className="border-b border-[var(--border-color)]/50"
                        >
                          <td className="py-2 text-xs font-medium text-[var(--text-primary)]">
                            {week.week}
                          </td>
                          <td className="py-2 text-center text-xs text-[var(--text-secondary)]">
                            {week.biology}h
                          </td>
                          <td className="py-2 text-center text-xs text-[var(--text-secondary)]">
                            {week.chemistry}h
                          </td>
                          <td className="py-2 text-center text-xs text-[var(--text-secondary)]">
                            {week.pat}h
                          </td>
                          <td className="py-2 text-center text-xs text-[var(--text-secondary)]">
                            {week.rc}h
                          </td>
                          <td className="py-2 text-center text-xs font-medium text-[var(--text-primary)]">
                            {week.total}h
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Flashcard Study Modal */}
        <FlashcardStudyModal
          title={`${studyDeck ?? ""} Flashcards`}
          cards={studyDeck ? flashcardData[studyDeck] ?? [] : []}
          isOpen={studyDeck !== null}
          onClose={() => setStudyDeck(null)}
        />

        {/* Canadian DAT Note */}
        <Card className="border-[#F59E0B]/30 bg-[var(--page-muted)]">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-[#F59E0B] mt-0.5 shrink-0" />
              <div>
                <h3 className="text-sm font-bold text-[var(--text-primary)] mb-1">
                  Canadian DAT Specifics
                </h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  The Canadian DAT includes Survey of Natural Sciences (Biology
                  + Chemistry), Perceptual Ability Test, and Reading
                  Comprehension. It does <strong>not</strong> include Organic
                  Chemistry or Quantitative Reasoning, unlike the American DAT.
                  Be cautious of US-focused resources.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
