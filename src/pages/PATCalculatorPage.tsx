import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { usePageTitle } from "@/hooks/usePageTitle";
import {
  ArrowLeft,
  Calculator,
  Brain,
  Target,
  Info,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";

const categories = [
  { id: "keyholes", name: "Keyholes", questions: 15, color: "#14B8A6" },
  { id: "tfe", name: "Top-Front-End", questions: 15, color: "#6366F1" },
  { id: "angle_ranking", name: "Angle Ranking", questions: 15, color: "#F59E0B" },
  { id: "hole_punching", name: "Hole Punching", questions: 15, color: "#F43F5E" },
  { id: "cube_counting", name: "Cube Counting", questions: 15, color: "#10B981" },
  { id: "pattern_folding", name: "Pattern Folding", questions: 15, color: "#8B5CF6" },
];

const totalQuestions = categories.reduce((s, c) => s + c.questions, 0);

export default function PATCalculatorPage() {
  usePageTitle("PAT Score Calculator");
  const [scores, setScores] = useState<Record<string, number>>({
    keyholes: 20,
    tfe: 18,
    angle_ranking: 22,
    hole_punching: 19,
    cube_counting: 21,
    pattern_folding: 17,
  });

  const overall = useMemo(() => {
    const weighted = categories.reduce(
      (sum, cat) => sum + (scores[cat.id] ?? 0) * cat.questions,
      0
    );
    return Math.round(weighted / totalQuestions);
  }, [scores]);

  const percentile = useMemo(() => {
    // Rough mapping: 30 → 99th, 20 → 50th, 15 → 20th
    if (overall >= 28) return 95;
    if (overall >= 25) return 80;
    if (overall >= 22) return 60;
    if (overall >= 19) return 40;
    if (overall >= 16) return 20;
    return 5;
  }, [overall]);

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
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#8B5CF6] flex items-center justify-center">
              <Calculator className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-[var(--text-primary)]">
                PAT Score Calculator
              </h1>
              <p className="text-[var(--text-secondary)]">
                Estimate your PAT score from category sub-scores.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="section-container max-w-7xl mx-auto -mt-8 px-4 pb-20">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Inputs */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="bg-[var(--page-surface)] border-[var(--border-color)]">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Brain className="w-5 h-5 text-[#2563EB]" />
                  <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                    Category Sub-scores
                  </h2>
                </div>
                <div className="space-y-6">
                  {categories.map(cat => (
                    <div key={cat.id}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: cat.color }}
                          />
                          <span className="text-sm font-medium text-[var(--text-primary)]">
                            {cat.name}
                          </span>
                          <span className="text-xs text-[var(--text-tertiary)]">
                            ({cat.questions} questions)
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min={1}
                            max={30}
                            value={scores[cat.id] ?? 0}
                            onChange={e =>
                              setScores(prev => ({
                                ...prev,
                                [cat.id]: Math.min(
                                  30,
                                  Math.max(1, Number(e.target.value) || 0)
                                ),
                              }))
                            }
                            className="w-16 h-8 text-center text-sm"
                          />
                        </div>
                      </div>
                      <Slider
                        value={[scores[cat.id] ?? 0]}
                        onValueChange={v =>
                          setScores(prev => ({ ...prev, [cat.id]: v[0] }))
                        }
                        min={1}
                        max={30}
                        step={1}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="space-y-4">
            <Card className="bg-[var(--page-surface)] border-[var(--border-color)]">
              <CardContent className="p-6 text-center">
                <div className="w-14 h-14 rounded-full bg-[#2563EB]/10 flex items-center justify-center mx-auto mb-3">
                  <Target className="w-7 h-7 text-[#2563EB]" />
                </div>
                <p className="text-sm text-[var(--text-secondary)] mb-1">
                  Estimated PAT Score
                </p>
                <p className="text-5xl font-bold text-[var(--text-primary)] mb-2">
                  {overall}
                </p>
                <p className="text-sm text-[var(--text-tertiary)]">
                  ~{percentile}th percentile
                </p>
              </CardContent>
            </Card>

            <Card className="bg-[var(--page-surface)] border-[var(--border-color)]">
              <CardContent className="p-6">
                <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
                  Score Breakdown
                </h3>
                <div className="space-y-2">
                  {categories.map(cat => (
                    <div
                      key={cat.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-[var(--text-secondary)]">
                        {cat.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <span
                          className="font-medium"
                          style={{ color: cat.color }}
                        >
                          {scores[cat.id] ?? 0}
                        </span>
                        <Badge variant="outline" className="text-[10px]">
                          {cat.questions}
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
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                    This is an estimate based on category weighting. Your actual
                    PAT score depends on the specific test form and scaling
                    used by the Canadian Dental Association.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
