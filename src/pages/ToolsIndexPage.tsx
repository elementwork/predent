import { Link } from "react-router-dom";
import { usePageTitle } from "@/hooks/usePageTitle";
import { motion } from "framer-motion";
import {
  Calculator,
  Trophy,
  GraduationCap,
  ChevronRight,
  Sparkles,
  Brain,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const tools = [
  {
    title: "GPA Calculator",
    description:
      "Convert between 4.0, percentage, and letter grade scales. Estimate your dental-school-ready GPA.",
    to: "/tools/gpa-calculator",
    icon: Calculator,
    badge: "Free",
  },
  {
    title: "Competitiveness Calculator",
    description:
      "Enter your GPA, DAT scores, province, and ECs to see your chances at each Canadian dental school.",
    to: "/tools/competitiveness",
    icon: Trophy,
    badge: "Free",
  },
  {
    title: "PAT Score Calculator",
    description:
      "Estimate your overall PAT score from category sub-scores for Keyholes, TFE, Angle Ranking, and more.",
    to: "/tools/pat-calculator",
    icon: Brain,
    badge: "Free",
  },
  {
    title: "School Comparison",
    description:
      "Compare admission requirements, tuition, and interview formats side-by-side for up to 4 schools.",
    to: "/compare",
    icon: GraduationCap,
    badge: "Free",
  },
  {
    title: "PAT Generators",
    description:
      "Unlimited practice for Angle Ranking, Hole Punching, Cube Counting, and more PAT categories.",
    to: "/pat-academy/generators",
    icon: Sparkles,
    badge: "Premium",
  },
];

export default function ToolsIndexPage() {
  usePageTitle("Free Tools for Pre-Dental Students");

  return (
    <main className="min-h-screen bg-[var(--page-bg)]">
      <div className="pt-20 pb-12 bg-gradient-to-br from-[var(--page-bg)] to-[var(--page-surface)]">
        <div className="section-container max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#10B981] flex items-center justify-center">
              <Calculator className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-[var(--text-primary)]">
                Free Pre-Dental Tools
              </h1>
              <p className="text-[var(--text-secondary)]">
                Calculators, comparators, and practice generators.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="section-container max-w-7xl mx-auto px-4 -mt-8 pb-20">
        <div className="grid md:grid-cols-2 gap-6">
          {tools.map((tool, i) => (
            <motion.div
              key={tool.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Link to={tool.to}>
                <Card className="h-full bg-[var(--page-surface)] border-[var(--border-color)] hover:border-[#2563EB]/50 transition-colors group">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-[#2563EB]/10 flex items-center justify-center">
                        <tool.icon className="w-6 h-6 text-[#2563EB]" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{tool.badge}</Badge>
                        <ChevronRight className="w-4 h-4 text-[var(--text-tertiary)] group-hover:text-[#2563EB] transition-colors" />
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2 group-hover:text-[#2563EB] transition-colors">
                      {tool.title}
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)]">
                      {tool.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-[var(--text-secondary)] mb-4">
            Want unlimited PAT generators, advanced analytics, and
            school-specific mock interviews?
          </p>
          <Link
            to="/pricing"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#2563EB] hover:underline"
          >
            View PreDent Premium →
          </Link>
        </div>
      </div>
    </main>
  );
}
