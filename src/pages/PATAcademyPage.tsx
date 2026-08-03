import { Link } from "react-router-dom";
import { usePageTitle } from "@/hooks/usePageTitle";
import { motion } from "framer-motion";
import {
  Brain,
  Lock,
  TrendingUp,
  Play,
  BarChart3,
  Sparkles,
  ChevronRight,
  Target,
  Zap,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/providers/trpc";
import { Badge } from "@/components/ui/badge";
import { PAT_QUESTION_COUNTS } from "@contracts/pat-stats";

const CATEGORY_META: Record<
  string,
  { name: string; color: string; bgColor: string }
> = {
  keyholes: { name: "Keyholes", color: "#14B8A6", bgColor: "#F0FDFA" },
  tfe: { name: "Top-Front-End", color: "#6366F1", bgColor: "#EEF2FF" },
  angle_ranking: {
    name: "Angle Ranking",
    color: "#F59E0B",
    bgColor: "#FFFBEB",
  },
  hole_punching: {
    name: "Hole Punching",
    color: "#F43F5E",
    bgColor: "#FFF1F2",
  },
  cube_counting: {
    name: "Cube Counting",
    color: "#10B981",
    bgColor: "#ECFDF5",
  },
  pattern_folding: {
    name: "Pattern Folding",
    color: "#8B5CF6",
    bgColor: "#F5F3FF",
  },
};

const TIER_LABELS: Record<string, string> = {
  free: "Free",
  premium: "Premium",
  premium_plus: "Premium Plus",
};

function CircularProgress({
  value,
  color,
  size = 56,
}: {
  value: number;
  color: string;
  size?: number;
}) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#E2E8F0"
        strokeWidth={4}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={4}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        transform={`rotate(90, ${size / 2}, ${size / 2})`}
        className="text-xs font-bold"
        fill={color}
      >
        {value}%
      </text>
    </svg>
  );
}

export default function PATAcademyPage() {
  usePageTitle("PAT Academy");
  const { data: quota } = trpc.pat.getQuota.useQuery();
  const { data: stats } = trpc.pat.getStats.useQuery();

  const overallAccuracy = stats?.overallAccuracy ?? 0;
  const totalAttempts = stats?.totalAttempts ?? 0;
  const recentAttempts = stats?.recentAttempts ?? [];
  const categoryStats = stats?.categoryStats ?? [];

  const quotaPct = quota
    ? Math.min(100, Math.round((quota.used / quota.quota) * 100))
    : 0;
  const quotaExhausted = quota ? quota.remaining <= 0 : false;

  const categories = Object.entries(CATEGORY_META).map(([id, meta]) => {
    const catStats = categoryStats.find(s => s.category === id);
    return {
      id,
      ...meta,
      questions: PAT_QUESTION_COUNTS[id] ?? 0,
      accuracy: catStats?.accuracy ?? 0,
      attempts: catStats?.total ?? 0,
    };
  });

  const last7Sessions = recentAttempts.slice(0, 7);

  return (
    <main className="min-h-screen bg-[var(--page-bg)]">
      {/* Header */}
      <div className="pt-20 pb-12 bg-gradient-to-br from-[var(--page-bg)] to-[var(--page-surface)]">
        <div className="section-container max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#8B5CF6] flex items-center justify-center">
              <Brain className="w-7 h-7 text-[var(--text-primary)]" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-[var(--text-primary)]">
                PAT Academy
              </h1>
              <p className="text-[var(--text-secondary)]">
                Master the Perceptual Ability Test
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
            {[
              {
                label: "Overall Accuracy",
                value: `${overallAccuracy}%`,
                icon: Target,
                color: "#10B981",
              },
              {
                label: "Questions Done",
                value: totalAttempts.toLocaleString(),
                icon: Brain,
                color: "#2563EB",
              },
              {
                label: "Generated",
                value: quota ? `${quota.used} / ${quota.quota}` : "—",
                icon: Zap,
                color: quotaExhausted ? "#EF4444" : "#F59E0B",
              },
              {
                label: "Tier",
                value: TIER_LABELS[quota?.tier ?? "free"] ?? "Free",
                icon: Sparkles,
                color: "#8B5CF6",
              },
            ].map(stat => (
              <div
                key={stat.label}
                className="bg-[var(--page-surface)] border border-[var(--border-color)] rounded-xl p-4"
              >
                <div className="flex items-center gap-2 mb-1">
                  <stat.icon
                    className="w-4 h-4"
                    style={{ color: stat.color }}
                  />
                  <span className="text-xs text-[var(--text-secondary)]">
                    {stat.label}
                  </span>
                </div>
                <p className="text-xl font-bold text-[var(--text-primary)]">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          {/* Quota Banner */}
          {quota && (
            <div className="mt-6 bg-[var(--page-surface)] border border-[var(--border-color)] rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Zap
                    className="w-4 h-4"
                    style={{
                      color: quotaExhausted ? "#EF4444" : "#F59E0B",
                    }}
                  />
                  <span className="text-sm font-medium text-[var(--text-primary)]">
                    Generated Questions: {quota.used} / {quota.quota}
                  </span>
                </div>
                <span className="text-xs text-[var(--text-secondary)]">
                  {quota.remaining} remaining
                </span>
              </div>
              <div className="h-2 bg-[var(--page-muted)] rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    backgroundColor: quotaExhausted
                      ? "#EF4444"
                      : quotaPct > 80
                        ? "#F59E0B"
                        : "#10B981",
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${quotaPct}%` }}
                  transition={{ duration: 0.8 }}
                />
              </div>
              {quotaExhausted && (
                <div className="mt-3 flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="text-[#F59E0B] border-[#F59E0B]/40"
                  >
                    <Lock className="w-3 h-3 mr-1" />
                    Upgrade for more
                  </Badge>
                  <Button
                    size="sm"
                    className="h-7 text-xs bg-[#F59E0B] hover:bg-[#D97706] text-white"
                    asChild
                  >
                    <Link to="/pricing">View Plans</Link>
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="section-container max-w-7xl mx-auto py-8 pb-20">
        {/* Category Cards Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {categories.map(cat => (
            <motion.div key={cat.id} whileHover={{ y: -4 }}>
              <Card className="bg-[var(--page-surface)] border-[var(--border-color)] hover:border-[var(--text-tertiary)] transition-all overflow-hidden">
                <CardContent className="p-5">
                  <Link
                    to={`/guides/pat/${cat.id.replace(/_/g, "-")}`}
                    className="block"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${cat.color}20` }}
                        >
                          <Brain
                            className="w-5 h-5"
                            style={{ color: cat.color }}
                          />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[#2563EB] transition-colors">
                            {cat.name}
                          </h3>
                          <p className="text-xs text-[var(--text-tertiary)]">
                            {`${cat.questions.toLocaleString()} questions`}
                          </p>
                        </div>
                      </div>
                      <CircularProgress
                        value={cat.accuracy}
                        color={cat.color}
                        size={48}
                      />
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[var(--text-tertiary)]">
                          Accuracy
                        </span>
                        <span className="text-[var(--text-primary)] font-medium">
                          {cat.accuracy}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-[var(--page-muted)] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${cat.accuracy}%`,
                            backgroundColor: cat.color,
                          }}
                        />
                      </div>
                      {cat.attempts > 0 && (
                        <p className="text-[10px] text-[var(--text-tertiary)]">
                          {cat.attempts} attempts
                        </p>
                      )}
                    </div>
                  </Link>

                  <Link
                    to={`/guides/pat/${cat.id.replace(/_/g, "-")}`}
                    className="inline-flex items-center text-xs font-medium text-[var(--text-secondary)] hover:text-[#2563EB] mb-3 transition-colors"
                  >
                    View details <ChevronRight className="w-3 h-3 ml-0.5" />
                  </Link>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1 h-8 text-xs font-medium"
                      style={{ backgroundColor: cat.color, color: "white" }}
                      asChild
                    >
                      <Link to="/pat-academy/practice">
                        <Play className="w-3 h-3 mr-1" />
                        Practice
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Generators Banner */}
        <Card className="bg-gradient-to-r from-[#F59E0B]/20 to-[#F59E0B]/5 border-[#F59E0B]/30 mb-8">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#F59E0B]/20 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-[#F59E0B]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-[var(--text-primary)]">
                    Unlimited PAT Generators
                  </h3>
                  <Lock className="w-3.5 h-3.5 text-[#F59E0B]" />
                </div>
                <p className="text-xs text-[var(--text-secondary)]">
                  10M+ question variations across all 6 categories
                </p>
              </div>
            </div>
            <Button
              size="sm"
              className="bg-[#F59E0B] hover:bg-[#D97706] text-[var(--text-primary)] h-9"
              asChild
            >
              <Link to="/pat-academy/generators">
                Try Generators <ChevronRight className="w-4 h-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Performance */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="bg-[var(--page-surface)] border-[var(--border-color)]">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-4 h-4 text-[#10B981]" />
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                  Recent Attempts
                </h3>
              </div>
              {last7Sessions.length === 0 ? (
                <p className="text-sm text-[var(--text-tertiary)] py-4 text-center">
                  No attempts yet. Start practicing to see your progress!
                </p>
              ) : (
                <div className="space-y-3">
                  {last7Sessions.map((attempt, i) => {
                    const meta =
                      CATEGORY_META[attempt.category] ?? {
                        name: attempt.category,
                        color: "#6B7280",
                      };
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <div
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{
                            backgroundColor: attempt.isCorrect
                              ? "#10B981"
                              : "#EF4444",
                          }}
                        />
                        <span className="text-xs text-[var(--text-secondary)] flex-1 truncate">
                          {meta.name}
                        </span>
                        <span
                          className="text-xs font-medium"
                          style={{
                            color: attempt.isCorrect
                              ? "#10B981"
                              : "#EF4444",
                          }}
                        >
                          {attempt.isCorrect ? "Correct" : "Incorrect"}
                        </span>
                        <span className="text-xs text-[var(--text-tertiary)] w-10 text-right">
                          {attempt.timeSpent}s
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-[var(--page-surface)] border-[var(--border-color)]">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-4 h-4 text-[#2563EB]" />
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                  Accuracy by Category
                </h3>
              </div>
              <div className="space-y-3">
                {categories.map(cat => (
                  <div key={cat.id}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-[var(--text-secondary)]">
                        {cat.name}
                      </span>
                      <span
                        className="text-xs font-medium"
                        style={{ color: cat.color }}
                      >
                        {cat.accuracy}%
                      </span>
                    </div>
                    <div className="h-2 bg-[var(--page-muted)] rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: cat.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${cat.accuracy}%` }}
                        transition={{ duration: 0.8, delay: 0.1 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
