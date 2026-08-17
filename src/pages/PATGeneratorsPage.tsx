import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Sparkles,
  Brain,
  Infinity as InfinityIcon,
  Zap,
  Shield,
  Lock,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AngleRankingGenerator from "@/components/pat-generators/AngleRankingGenerator";
import KeyholesGenerator from "@/components/pat-generators/KeyholesGenerator";
import TopFrontEndGenerator from "@/components/pat-generators/TopFrontEndGenerator";
import HolePunchingGenerator from "@/components/pat-generators/HolePunchingGenerator";
import CubeCountingGenerator from "@/components/pat-generators/CubeCountingGenerator";
import PatternFoldingGenerator from "@/components/pat-generators/PatternFoldingGenerator";
import { PremiumCTA, PremiumLock } from "@/components/PremiumCTA";
import { useTier } from "@/hooks/useTier";

const generators = [
  {
    id: "angle_ranking",
    category: "Angle Ranking",
    color: "#F59E0B",
    variations: "3.2M+",
    description:
      "Parametric angles with controlled separation from >15° (easy) to <5° (hard).",
    free: true,
  },
  {
    id: "keyholes",
    category: "Keyholes",
    color: "#14B8A6",
    variations: "2.5M+",
    description:
      "Procedural 3D objects with varying face count, curves, and proportions.",
    free: false,
  },
  {
    id: "tfe",
    category: "Top-Front-End",
    color: "#6366F1",
    variations: "1.8M+",
    description:
      "Orthographic projection puzzles with configurable missing views and edge complexity.",
    free: false,
  },
  {
    id: "hole_punching",
    category: "Hole Punching",
    color: "#F43F5E",
    variations: "1.5M+",
    description:
      "Fold sequences from 1-4 folds with deterministic unfold validation.",
    free: false,
  },
  {
    id: "cube_counting",
    category: "Cube Counting",
    color: "#10B981",
    variations: "800K+",
    description:
      "Stacked configurations with 3-5 layers and random paint patterns.",
    free: false,
  },
  {
    id: "pattern_folding",
    category: "Pattern Folding",
    color: "#8B5CF6",
    variations: "1.2M+",
    description: "2D nets with symbol placement and validated 3D form options.",
    free: false,
  },
];

const features = [
  {
    icon: InfinityIcon,
    title: "Unlimited Questions",
    desc: "Never run out of practice material. Our algorithms generate unique questions every time.",
  },
  {
    icon: Zap,
    title: "<2s Generation",
    desc: "Questions generate instantly. No waiting, no loading screens.",
  },
  {
    icon: Shield,
    title: "Validated Answers",
    desc: "Every generated question is verified to have exactly one correct answer.",
  },
];

export default function PATGeneratorsPage() {
  const { isFree } = useTier();
  const [active, setActive] = useState<string | null>("angle_ranking");

  const isGeneratorAvailable = (id: string) => {
    if (!isFree) return true;
    const gen = generators.find(g => g.id === id);
    return gen?.free ?? false;
  };

  const handleSelect = (id: string) => {
    if (isGeneratorAvailable(id)) {
      setActive(id);
    }
  };

  const activeGenerator = generators.find(g => g.id === active);
  const activeLocked = active ? !isGeneratorAvailable(active) : false;

  return (
    <main className="min-h-screen bg-[var(--page-bg)]">
      <div className="pt-20 pb-12">
        <div className="section-container max-w-7xl mx-auto px-4">
          <Link
            to="/pat-academy"
            className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to PAT Academy
          </Link>

          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F59E0B]/10 border border-[#F59E0B]/30 text-[#F59E0B] text-sm font-medium mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              Premium Feature
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-[var(--text-primary)] mb-3">
              Unlimited PAT Generators
            </h1>
            <p className="text-[var(--text-secondary)] max-w-xl mx-auto">
              Our proprietary algorithms create an infinite supply of practice
              questions, each validated to have exactly one correct answer.
            </p>
          </div>

          {/* Generator Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {generators.map(gen => {
              const available = isGeneratorAvailable(gen.id);
              return (
                <Card
                  key={gen.id}
                  className={`bg-[var(--page-surface)] border-[var(--border-color)] hover:border-[var(--text-tertiary)] transition-all ${available ? "cursor-pointer" : "opacity-75"} ${active === gen.id ? "ring-2 ring-[#F59E0B]" : ""}`}
                  onClick={() => handleSelect(gen.id)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <Brain className="w-5 h-5" style={{ color: gen.color }} />
                      <span className="text-xs font-medium text-[var(--text-tertiary)]">
                        {gen.variations} variations
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">
                      {gen.category} Generator
                    </h3>
                    <p className="text-xs text-[var(--text-tertiary)] leading-relaxed mb-4">
                      {gen.description}
                    </p>
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-[var(--page-surface)] border border-[var(--border-color)]">
                      {available ? (
                        <>
                          <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                          <span className="text-[10px] text-[var(--text-tertiary)]">
                            Generator ready
                          </span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-3 h-3 text-[var(--text-tertiary)]" />
                          <span className="text-[10px] text-[var(--text-tertiary)]">
                            Premium only
                          </span>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Active Generator */}
          <div className="mb-12">
            {activeLocked && activeGenerator && (
              <PremiumLock
                title={`${activeGenerator.category} Generator`}
                description="Upgrade to Premium to unlock this generator and 5 more."
              />
            )}
            {!activeLocked && active === "angle_ranking" && (
              <AngleRankingGenerator />
            )}
            {!activeLocked && active === "keyholes" && <KeyholesGenerator />}
            {!activeLocked && active === "tfe" && <TopFrontEndGenerator />}
            {!activeLocked && active === "hole_punching" && (
              <HolePunchingGenerator />
            )}
            {!activeLocked && active === "cube_counting" && (
              <CubeCountingGenerator />
            )}
            {!activeLocked && active === "pattern_folding" && (
              <PatternFoldingGenerator />
            )}
          </div>

          {/* Features */}
          <div className="grid sm:grid-cols-3 gap-4 mb-12">
            {features.map(f => (
              <div
                key={f.title}
                className="p-4 rounded-xl bg-[var(--page-surface)] border border-[var(--border-color)] text-center"
              >
                <f.icon className="w-6 h-6 text-[#2563EB] mx-auto mb-2" />
                <p className="text-sm font-medium text-[var(--text-primary)] mb-1">
                  {f.title}
                </p>
                <p className="text-xs text-[var(--text-tertiary)]">{f.desc}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          {isFree && (
            <div className="text-center p-8 rounded-2xl bg-gradient-to-r from-[#F59E0B]/20 to-[#2563EB]/20 border border-[#F59E0B]/30">
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                Unlock All 6 Generators
              </h2>
              <p className="text-sm text-[var(--text-secondary)] mb-6">
                Upgrade to Premium for $29/month and get access to all
                generators with unlimited usage.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <PremiumCTA buttonText="Get Premium $29/mo" size="lg" />
                <Button
                  variant="outline"
                  className="border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] h-11"
                  asChild
                >
                  <Link to="/pat-academy/practice">Try Regular Practice</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
