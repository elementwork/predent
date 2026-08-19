import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Brain,
  CheckCircle2,
  ExternalLink,
  Shield,
  Sparkles,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePageTitle } from "@/hooks/usePageTitle";

const generators = [
  {
    id: "keyholes",
    category: "Keyholes",
    color: "#14B8A6",
    description:
      "Geometry-first 3D objects scored against exact aperture silhouettes.",
  },
  {
    id: "tfe",
    category: "Top-Front-End",
    color: "#6366F1",
    description:
      "Strict orthographic views with visible and hidden edge reasoning.",
  },
  {
    id: "angle_ranking",
    category: "Angle Ranking",
    color: "#F59E0B",
    description:
      "Deterministic angle sets with controlled separation and full ranking choices.",
  },
  {
    id: "hole_punching",
    category: "Hole Punching",
    color: "#F43F5E",
    description:
      "Canonical fold sequences, punches, reverse unfolding, and validated hole patterns.",
  },
  {
    id: "cube_counting",
    category: "Cube Counting",
    color: "#10B981",
    description:
      "3D cube stacks scored from exposed-face painting rules, including shared figures.",
  },
  {
    id: "pattern_folding",
    category: "Pattern Folding",
    color: "#8B5CF6",
    description:
      "Validated nets, face adjacency, orientation, chirality, and 3D choices.",
  },
] as const;

const features = [
  {
    icon: Shield,
    title: "Server-authoritative",
    desc: "Seeds, solver output, validation data, and answer keys stay off the active-question client.",
  },
  {
    icon: CheckCircle2,
    title: "Independently validated",
    desc: "ManipAT validates every generated question before Predent issues it.",
  },
  {
    icon: Sparkles,
    title: "Canonical SVG",
    desc: "Predent displays the exact scored artwork produced by the ManipAT engine.",
  },
];

export default function PATGeneratorsPage() {
  usePageTitle("PAT Generators");

  return (
    <main className="min-h-screen bg-[var(--page-bg)]">
      <div className="pt-20 pb-12">
        <div className="section-container max-w-6xl mx-auto px-4">
          <Link
            to="/pat-academy"
            className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to PAT Academy
          </Link>

          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2563EB]/10 border border-[#2563EB]/30 text-[#2563EB] text-sm font-medium mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              Powered by ManipAT
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-[var(--text-primary)] mb-3">
              Validated PAT Generators
            </h1>
            <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">
              Choose a category to launch a server-generated drill. The browser
              receives only scored SVG artwork and answer choices; grading
              remains on the server.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
            {generators.map(generator => (
              <Card
                key={generator.id}
                className="bg-[var(--page-surface)] border-[var(--border-color)] hover:border-[var(--text-tertiary)] transition-all"
              >
                <CardContent className="p-5 h-full flex flex-col">
                  <div className="flex items-center gap-2 mb-3">
                    <Brain
                      className="w-5 h-5"
                      style={{ color: generator.color }}
                    />
                    <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                      {generator.category}
                    </h2>
                  </div>
                  <p className="text-xs leading-relaxed text-[var(--text-tertiary)] flex-1 mb-5">
                    {generator.description}
                  </p>
                  <Button
                    variant="outline"
                    className="w-full border-[var(--border-color)]"
                    asChild
                  >
                    <Link
                      to={`/pat-academy/practice?category=${generator.id}`}
                    >
                      Start Category Drill
                      <ExternalLink className="w-3.5 h-3.5 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            {features.map(feature => (
              <div
                key={feature.title}
                className="p-4 rounded-xl bg-[var(--page-surface)] border border-[var(--border-color)] text-center"
              >
                <feature.icon className="w-6 h-6 text-[#2563EB] mx-auto mb-2" />
                <p className="text-sm font-medium text-[var(--text-primary)] mb-1">
                  {feature.title}
                </p>
                <p className="text-xs text-[var(--text-tertiary)]">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
