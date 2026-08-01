import { useState } from "react";
import { Link } from "react-router-dom";
import { usePageTitle } from "@/hooks/usePageTitle";
import { ArrowLeft, Calculator, Info, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/providers/trpc";
import { events } from "@/lib/analytics";

const provinces = [
  "Ontario",
  "Quebec",
  "British Columbia",
  "Alberta",
  "Saskatchewan",
  "Manitoba",
  "Nova Scotia",
  "Other",
];

const ratingStyles = {
  Safety: "bg-[var(--page-muted)] text-[#10B981]",
  Competitive: "bg-[var(--page-muted)] text-[#F59E0B]",
  Reach: "bg-[var(--page-muted)] text-[#EF4444]",
};

const ratingBarColors = {
  Safety: "bg-green-500",
  Competitive: "bg-yellow-500",
  Reach: "bg-red-500",
};

export default function CompetitivenessCalculatorPage() {
  usePageTitle("Competitiveness Calculator");
  const [gpa, setGpa] = useState<string>("3.5");
  const [scale, setScale] = useState<"4.0" | "100">("4.0");
  const [datAa, setDatAa] = useState<number>(22);
  const [datPat, setDatPat] = useState<number>(21);
  const [datRc, setDatRc] = useState<number>(21);
  const [province, setProvince] = useState<string>("Ontario");
  const [degreeStatus, setDegreeStatus] = useState<"in_progress" | "completed">(
    "in_progress"
  );
  const [casperQuartile, setCasperQuartile] = useState<number>(0);
  const [ecScore, setEcScore] = useState<number>(5);

  const { data, isFetching, refetch } =
    trpc.tools.calculateCompetitiveness.useQuery(
      {
        gpa: parseFloat(gpa) || 0,
        gpaScale: scale,
        datAa,
        datPat,
        datRc,
        province,
        degreeStatus,
        casperQuartile,
        extracurricularScore: ecScore,
      },
      { enabled: false }
    );

  const handleCalculate = () => {
    refetch();
    events.calculatorUsed("competitiveness");
  };

  return (
    <main className="min-h-screen bg-[var(--page-bg)]">
      {/* Header */}
      <div className="pt-20 pb-12 bg-gradient-to-br from-[var(--page-bg)] to-[var(--page-surface)]">
        <div className="section-container max-w-7xl mx-auto px-4">
          <Link
            to="/tools"
            className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Tools
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#10B981] flex items-center justify-center">
              <Calculator className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-[var(--text-primary)]">
                Competitiveness Calculator
              </h1>
              <p className="text-[var(--text-secondary)]">
                Estimate your chances at each Canadian dental school.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="section-container max-w-7xl mx-auto -mt-8 px-4">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Input Panel */}
          <Card className="border-[var(--border-color)] shadow-lg lg:col-span-1 h-fit">
            <CardContent className="p-6 space-y-5">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                Your Profile
              </h2>

              <div>
                <label className="text-sm font-medium text-[var(--text-secondary)] mb-2 block">
                  Current GPA
                </label>
                <Input
                  type="number"
                  step={scale === "4.0" ? "0.01" : "0.1"}
                  value={gpa}
                  onChange={e => setGpa(e.target.value)}
                  className="h-11"
                  placeholder={scale === "4.0" ? "3.50" : "85.0"}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-[var(--text-secondary)] mb-2 block">
                  GPA Scale
                </label>
                <div className="flex gap-2">
                  {(["4.0", "100"] as const).map(s => (
                    <button
                      key={s}
                      onClick={() => setScale(s)}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        scale === s
                          ? "bg-[#2563EB] text-white"
                          : "bg-[var(--page-muted)] text-[var(--text-secondary)] hover:bg-[var(--border-color)]"
                      }`}
                    >
                      {s === "4.0" ? "4.0 Scale" : "Percentage"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-[var(--text-secondary)] mb-1 block">
                    DAT AA
                  </label>
                  <Input
                    type="number"
                    min={1}
                    max={30}
                    value={datAa}
                    onChange={e => setDatAa(Number(e.target.value) || 0)}
                    className="h-10"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--text-secondary)] mb-1 block">
                    DAT PAT
                  </label>
                  <Input
                    type="number"
                    min={1}
                    max={30}
                    value={datPat}
                    onChange={e => setDatPat(Number(e.target.value) || 0)}
                    className="h-10"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--text-secondary)] mb-1 block">
                    DAT RC
                  </label>
                  <Input
                    type="number"
                    min={1}
                    max={30}
                    value={datRc}
                    onChange={e => setDatRc(Number(e.target.value) || 0)}
                    className="h-10"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-[var(--text-secondary)] mb-2 block">
                  Province of Residence
                </label>
                <select
                  value={province}
                  onChange={e => setProvince(e.target.value)}
                  className="w-full h-11 rounded-lg border border-[var(--border-color)] bg-[var(--page-surface)] px-3 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                >
                  {provinces.map(p => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-[var(--text-secondary)] mb-2 block">
                  Degree Status
                </label>
                <div className="flex gap-2">
                  {(["in_progress", "completed"] as const).map(s => (
                    <button
                      key={s}
                      onClick={() => setDegreeStatus(s)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                        degreeStatus === s
                          ? "bg-[#2563EB] text-white"
                          : "bg-[var(--page-muted)] text-[var(--text-secondary)] hover:bg-[var(--border-color)]"
                      }`}
                    >
                      {s === "in_progress" ? "In Progress" : "Completed"}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-[var(--text-secondary)] mb-2 block">
                  CASPer Quartile {casperQuartile > 0 && `(${casperQuartile})`}
                </label>
                <Slider
                  value={[casperQuartile]}
                  onValueChange={v => setCasperQuartile(v[0])}
                  min={0}
                  max={4}
                  step={1}
                />
                <p className="text-[10px] text-[var(--text-tertiary)] mt-1">
                  Set to 0 if not taken yet
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-[var(--text-secondary)] mb-2 block">
                  Extracurricular Score {`(${ecScore}/10)`}
                </label>
                <Slider
                  value={[ecScore]}
                  onValueChange={v => setEcScore(v[0])}
                  min={1}
                  max={10}
                  step={1}
                />
              </div>

              <Button
                onClick={handleCalculate}
                disabled={isFetching}
                className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] h-11"
              >
                {isFetching ? "Calculating..." : "Calculate My Chances"}
              </Button>

              <div className="p-4 rounded-lg bg-[var(--page-muted)] border border-[var(--border-color)]">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-[#2563EB] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-[#2563EB] mb-1">
                      About this calculator
                    </p>
                    <p className="text-xs text-[var(--text-secondary)]">
                      This is an estimate based on historical averages.
                      Admissions also consider CASPer, interviews, and personal
                      statements.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              Competitiveness by School
            </h2>

            {!data && !isFetching && (
              <Card className="border-[var(--border-color)] bg-[var(--page-surface)]">
                <CardContent className="p-8 text-center">
                  <Calculator className="w-10 h-10 text-[var(--text-tertiary)] mx-auto mb-3" />
                  <p className="text-[var(--text-secondary)] text-sm">
                    Enter your stats and click Calculate to see your chances.
                  </p>
                </CardContent>
              </Card>
            )}

            {isFetching && (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            )}

            {data?.results.map(school => (
              <Card
                key={school.schoolId}
                className="border-[var(--border-color)] hover:shadow-md transition-shadow bg-[var(--page-surface)]"
              >
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                        {school.schoolName}
                      </h3>
                      <p className="text-xs text-[var(--text-secondary)]">
                        {school.program} • {school.seats} seats •{" "}
                        {school.province}
                        {school.isIp && (
                          <span className="ml-2 text-[#10B981] font-medium">
                            In-Province
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge className={ratingStyles[school.rating]}>
                        {school.rating}
                      </Badge>
                      <p className="text-xs text-[var(--text-tertiary)] mt-1">
                        {school.probability}% estimated
                      </p>
                    </div>
                  </div>

                  <div className="w-full h-2 bg-[var(--page-muted)] rounded-full overflow-hidden mb-3">
                    <div
                      className={`h-full rounded-full transition-all ${ratingBarColors[school.rating]}`}
                      style={{ width: `${Math.min(100, school.probability)}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] text-[var(--text-secondary)]">
                    <div className="p-2 rounded bg-[var(--page-bg)]">
                      <span className="block text-[var(--text-tertiary)]">GPA</span>
                      <span className="font-medium">
                        {school.breakdown.gpa.your.toFixed(2)} /{" "}
                        {school.breakdown.gpa.schoolAvg.toFixed(2)}
                      </span>
                    </div>
                    <div className="p-2 rounded bg-[var(--page-bg)]">
                      <span className="block text-[var(--text-tertiary)]">DAT AA</span>
                      <span className="font-medium">
                        {school.breakdown.datAa.your} /{" "}
                        {school.breakdown.datAa.schoolAvg}
                      </span>
                    </div>
                    <div className="p-2 rounded bg-[var(--page-bg)]">
                      <span className="block text-[var(--text-tertiary)]">DAT PAT</span>
                      <span className="font-medium">
                        {school.breakdown.datPat.your} /{" "}
                        {school.breakdown.datPat.schoolAvg}
                      </span>
                    </div>
                    <div className="p-2 rounded bg-[var(--page-bg)]">
                      <span className="block text-[var(--text-tertiary)]">
                        Acceptance Rate
                      </span>
                      <span className="font-medium">
                        {school.acceptanceRate}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Guide Section */}
        <div className="mt-12 mb-20">
          <Card className="border-[var(--border-color)]">
            <CardContent className="p-6 lg:p-8">
              <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
                How We Calculate Your Chances
              </h2>
              <div className="grid md:grid-cols-2 gap-6 text-sm text-[var(--text-secondary)] leading-relaxed">
                <div>
                  <h3 className="font-semibold text-[var(--text-primary)] mb-2">
                    Weighted Scoring Model
                  </h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#10B981] mt-0.5 shrink-0" />
                      <span>
                        <strong>GPA:</strong> 25% — compared to each school's
                        admitted average
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#10B981] mt-0.5 shrink-0" />
                      <span>
                        <strong>DAT AA:</strong> 20% — critical for most schools
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#10B981] mt-0.5 shrink-0" />
                      <span>
                        <strong>DAT PAT:</strong> 15% — especially important for
                        UofT
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#10B981] mt-0.5 shrink-0" />
                      <span>
                        <strong>DAT RC:</strong> 10% — reading comprehension
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#10B981] mt-0.5 shrink-0" />
                      <span>
                        <strong>Province:</strong> 15% — in-province advantage
                        is significant
                      </span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--text-primary)] mb-2">
                    Other Factors
                  </h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#2563EB] mt-0.5 shrink-0" />
                      <span>
                        <strong>Degree Status:</strong> 5% — completed degree
                        slight advantage
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#2563EB] mt-0.5 shrink-0" />
                      <span>
                        <strong>CASPer:</strong> 5% — quartile 4 is ideal
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#2563EB] mt-0.5 shrink-0" />
                      <span>
                        <strong>Extracurriculars:</strong> 5% — research,
                        volunteering, leadership
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#2563EB] mt-0.5 shrink-0" />
                      <span>
                        <strong>Interview:</strong> not included — often the
                        final deciding factor
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
