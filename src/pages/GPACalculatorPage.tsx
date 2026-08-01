import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { usePageTitle } from "@/hooks/usePageTitle";
import {
  ArrowLeft,
  Calculator,
  ArrowRightLeft,
  GraduationCap,
  Info,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { events } from "@/lib/analytics";

type Scale = "4.0" | "percentage" | "letter";

const letterTo4: Record<string, number> = {
  "A+": 4.0,
  A: 3.9,
  "A-": 3.7,
  "B+": 3.3,
  B: 3.0,
  "B-": 2.7,
  "C+": 2.3,
  C: 2.0,
  "C-": 1.7,
  "D+": 1.3,
  D: 1.0,
  F: 0.0,
};

const scale4ToPercentage = (gpa: number) => (gpa / 4.0) * 100;
const percentageToScale4 = (pct: number) => (pct / 100) * 4.0;

function formatNumber(n: number, digits = 2) {
  return Number.isInteger(n) ? n.toString() : n.toFixed(digits).replace(/\.00$/, "");
}

function convert(value: number, from: Scale, to: Scale, rawInput = ""): string {
  if (from === to) {
    if (to === "letter") {
      const normalized = rawInput.trim().toUpperCase();
      return letterTo4[normalized] !== undefined ? normalized : "—";
    }
    return formatNumber(Math.min(to === "4.0" ? 4.0 : 100, Math.max(0, value)));
  }

  let scale4 = value;
  if (from === "percentage") scale4 = percentageToScale4(value);
  else if (from === "letter") {
    // value is already the 4.0 mapping from parsed
    scale4 = value;
  }

  if (to === "4.0") return formatNumber(Math.min(4.0, Math.max(0, scale4)));
  if (to === "percentage") return formatNumber(Math.min(100, Math.max(0, scale4ToPercentage(scale4))));

  // to letter
  if (scale4 >= 3.85) return "A+";
  if (scale4 >= 3.75) return "A";
  if (scale4 >= 3.55) return "A-";
  if (scale4 >= 3.15) return "B+";
  if (scale4 >= 2.85) return "B";
  if (scale4 >= 2.55) return "B-";
  if (scale4 >= 2.15) return "C+";
  if (scale4 >= 1.85) return "C";
  if (scale4 >= 1.55) return "C-";
  if (scale4 >= 1.15) return "D+";
  if (scale4 >= 0.85) return "D";
  return "F";
}

const scales: { value: Scale; label: string; placeholder: string; min: number; max: number; step: string }[] = [
  { value: "4.0", label: "4.0 Scale", placeholder: "3.50", min: 0, max: 4, step: "0.01" },
  { value: "percentage", label: "Percentage", placeholder: "85", min: 0, max: 100, step: "0.1" },
  { value: "letter", label: "Letter Grade", placeholder: "B+", min: 0, max: 4, step: "1" },
];

export default function GPACalculatorPage() {
  usePageTitle("GPA Calculator");
  const [input, setInput] = useState<string>("3.5");
  const [scale, setScale] = useState<Scale>("4.0");

  const parsed = useMemo(() => {
    if (scale === "letter") {
      const normalized = input.trim().toUpperCase();
      const val = letterTo4[normalized];
      return val !== undefined ? val : null;
    }
    const num = parseFloat(input);
    return Number.isFinite(num) ? num : null;
  }, [input, scale]);

  const result4 = parsed !== null ? convert(parsed, scale, "4.0", input) : "—";
  const resultPct = parsed !== null ? convert(parsed, scale, "percentage", input) : "—";
  const resultLetter = parsed !== null ? convert(parsed, scale, "letter", input) : "—";

  useEffect(() => {
    if (parsed !== null) {
      events.calculatorUsed("gpa");
    }
  }, [parsed]);

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
                GPA Calculator
              </h1>
              <p className="text-[var(--text-secondary)]">
                Convert between GPA scales and estimate your admissions GPA.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="section-container max-w-7xl mx-auto -mt-8 px-4 pb-20">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Converter */}
          <Card className="bg-[var(--page-surface)] border-[var(--border-color)] h-fit">
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <ArrowRightLeft className="w-5 h-5 text-[#2563EB]" />
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                  Scale Converter
                </h2>
              </div>

              <div>
                <label className="text-sm font-medium text-[var(--text-secondary)] mb-2 block">
                  Your GPA
                </label>
                <Input
                  type={scale === "letter" ? "text" : "number"}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  className="h-11"
                  placeholder={scales.find(s => s.value === scale)?.placeholder}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-[var(--text-secondary)] mb-2 block">
                  Current Scale
                </label>
                <div className="flex gap-2">
                  {scales.map(s => (
                    <button
                      key={s.value}
                      onClick={() => {
                        setScale(s.value);
                        setInput("");
                      }}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        scale === s.value
                          ? "bg-[#2563EB] text-white"
                          : "bg-[var(--page-muted)] text-[var(--text-secondary)] hover:bg-[var(--border-color)]"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-lg bg-[var(--page-muted)] border border-[var(--border-color)]">
                <p className="text-xs text-[var(--text-tertiary)] mb-1">
                  Enter a value above to see conversions.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          <div className="space-y-4">
            <Card className="bg-[var(--page-surface)] border-[var(--border-color)]">
              <CardContent className="p-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-3xl font-bold text-[#2563EB]">{result4}</p>
                    <p className="text-xs text-[var(--text-tertiary)] mt-1">4.0 Scale</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-[#10B981]">{resultPct}</p>
                    <p className="text-xs text-[var(--text-tertiary)] mt-1">Percentage</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-[#F59E0B]">{resultLetter}</p>
                    <p className="text-xs text-[var(--text-tertiary)] mt-1">Letter Grade</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[var(--page-surface)] border-[var(--border-color)]">
              <CardContent className="p-6">
                <div className="flex items-start gap-2 mb-4">
                  <GraduationCap className="w-5 h-5 text-[#2563EB] mt-0.5" />
                  <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                    Canadian Dental School Averages
                  </h2>
                </div>
                <div className="space-y-3">
                  {[
                    { school: "University of Toronto", avg: "3.93", scale: "4.0" },
                    { school: "Western University", avg: "3.85", scale: "4.0" },
                    { school: "McGill University", avg: "3.90", scale: "4.0" },
                    { school: "UBC", avg: "88%", scale: "Percentage" },
                    { school: "University of Alberta", avg: "3.88", scale: "4.0" },
                  ].map(item => (
                    <div
                      key={item.school}
                      className="flex items-center justify-between p-3 rounded-lg bg-[var(--page-muted)]"
                    >
                      <span className="text-sm text-[var(--text-primary)]">
                        {item.school}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-[var(--text-primary)]">
                          {item.avg}
                        </span>
                        <Badge variant="outline" className="text-[10px]">
                          {item.scale}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[var(--page-surface)] border-[var(--border-color)]">
              <CardContent className="p-6">
                <div className="flex items-start gap-2">
                  <Info className="w-5 h-5 text-[#2563EB] mt-0.5" />
                  <div>
                    <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                      About GPA Conversion
                    </h2>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                      Different schools use different GPA scales. This calculator
                      provides approximate conversions between common scales.
                      Always check each dental school's admission requirements for
                      their specific calculation method.
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <Button
                    variant="outline"
                    className="border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    asChild
                  >
                    <Link to="/tools/competitiveness">
                      Estimate my chances →
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
