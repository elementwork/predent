import { Link } from "react-router-dom";
import { usePageTitle } from "@/hooks/usePageTitle";
import { ArrowLeft, TrendingUp, Target, Flame, BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/providers/trpc";
import { useTier } from "@/hooks/useTier";
import { PremiumLock } from "@/components/PremiumCTA";

const categoryMeta: Record<
  string,
  { label: string; color: string; targetTime: number }
> = {
  keyholes: { label: "Keyholes", color: "#14B8A6", targetTime: 30 },
  tfe: { label: "Top-Front-End", color: "#6366F1", targetTime: 45 },
  angle_ranking: { label: "Angle Ranking", color: "#F59E0B", targetTime: 25 },
  hole_punching: { label: "Hole Punching", color: "#F43F5E", targetTime: 40 },
  cube_counting: { label: "Cube Counting", color: "#10B981", targetTime: 35 },
  pattern_folding: {
    label: "Pattern Folding",
    color: "#8B5CF6",
    targetTime: 50,
  },
};

const difficultyLabels = ["Beginner", "Int.", "Adv.", "Elite"];
const difficultyKeys = [
  "beginner",
  "intermediate",
  "advanced",
  "elite",
] as const;

function getHeatColor(value: number) {
  if (value >= 85) return "#10B981";
  if (value >= 70) return "#F59E0B";
  if (value >= 55) return "#F97316";
  return "#EF4444";
}

export default function PATAnalyticsPage() {
  usePageTitle("PAT Analytics");
  const { isPremium } = useTier();
  const { data, isLoading, error } = trpc.pat.getAnalytics.useQuery(undefined, {
    enabled: isPremium,
  });

  const hasData = data && data.totalAttempts > 0;

  const overview = [
    {
      label: "Overall Accuracy",
      value: hasData ? `${data!.overallAccuracy}%` : "—",
      change: hasData ? `${data!.totalAttempts} attempts` : "No data yet",
      icon: TrendingUp,
      color: "#10B981",
    },
    {
      label: "Avg Time/Q",
      value: hasData ? `${data!.avgTime}s` : "—",
      change: "Target: 40s",
      icon: Target,
      color: "#2563EB",
    },
    {
      label: "Predicted PAT",
      value: hasData
        ? `${data!.predictedScore} ±${data!.predictedConfidence}`
        : "—",
      change: hasData
        ? `${data!.predictedConfidence}% confidence`
        : "Keep practicing",
      icon: BookOpen,
      color: "#8B5CF6",
    },
    {
      label: "Study Streak",
      value: hasData ? `${Math.min(12, data!.totalAttempts)} days` : "—",
      change: hasData ? "Keep it up!" : "Start a session",
      icon: Flame,
      color: "#F59E0B",
    },
  ];

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

          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">
            Performance Analytics
          </h1>

          {!isPremium ? (
            <PremiumLock
              title="Premium PAT Analytics"
              description="Upgrade to unlock score predictions, category trends, and personalized recommendations."
            />
          ) : (
            <>
              {error && (
                <Card className="bg-[var(--page-surface)] border-[#EF4444]/30 mb-8">
                  <CardContent className="p-6 text-center text-sm text-[#EF4444]">
                    {error.message}
                  </CardContent>
                </Card>
              )}

              {/* Overview Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {overview.map(stat => (
                  <Card
                    key={stat.label}
                    className="bg-[var(--page-surface)] border-[var(--border-color)]"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <stat.icon
                          className="w-4 h-4"
                          style={{ color: stat.color }}
                        />
                        <span className="text-xs text-[var(--text-tertiary)]">
                          {stat.label}
                        </span>
                      </div>
                      {isLoading ? (
                        <Skeleton className="h-8 w-20 bg-[var(--page-muted)]" />
                      ) : (
                        <>
                          <p className="text-2xl font-bold text-[var(--text-primary)]">
                            {stat.value}
                          </p>
                          <p
                            className="text-[10px] mt-1"
                            style={{ color: stat.color }}
                          >
                            {stat.change}
                          </p>
                        </>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {!isLoading && !hasData && (
                <Card className="bg-[var(--page-surface)] border-[var(--border-color)] mb-8">
                  <CardContent className="p-8 text-center">
                    <p className="text-[var(--text-secondary)] text-sm mb-2">
                      No practice data yet.
                    </p>
                    <p className="text-[var(--text-tertiary)] text-xs mb-4">
                      Complete a PAT practice session to see your analytics.
                    </p>
                    <Link
                      to="/pat-academy/practice"
                      className="inline-flex items-center justify-center px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-[var(--text-primary)] text-sm font-medium rounded-lg transition-colors"
                    >
                      Start Practicing
                    </Link>
                  </CardContent>
                </Card>
              )}

              {hasData && (
                <>
                  <div className="grid lg:grid-cols-2 gap-6 mb-8">
                    {/* Accuracy by Category */}
                    <Card className="bg-[var(--page-surface)] border-[var(--border-color)]">
                      <CardContent className="p-5">
                        <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-4">
                          Accuracy by Category
                        </h2>
                        <div className="space-y-3">
                          {data!.categoryStats.map(cat => {
                            const meta = categoryMeta[cat.category];
                            return (
                              <div key={cat.category}>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs text-[var(--text-secondary)]">
                                    {meta?.label ?? cat.category}
                                  </span>
                                  <span
                                    className="text-xs font-medium"
                                    style={{ color: meta?.color ?? "#2563EB" }}
                                  >
                                    {cat.accuracy}%
                                  </span>
                                </div>
                                <div className="h-2 bg-[var(--page-muted)] rounded-full overflow-hidden">
                                  <div
                                    className="h-full rounded-full transition-all"
                                    style={{
                                      width: `${cat.accuracy}%`,
                                      backgroundColor: meta?.color ?? "#2563EB",
                                    }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Time Distribution */}
                    <Card className="bg-[var(--page-surface)] border-[var(--border-color)]">
                      <CardContent className="p-5">
                        <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-4">
                          Avg Time per Category
                        </h2>
                        <div className="space-y-3">
                          {data!.categoryStats.map(cat => {
                            const meta = categoryMeta[cat.category];
                            const target = meta?.targetTime ?? 40;
                            return (
                              <div key={cat.category}>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs text-[var(--text-secondary)]">
                                    {meta?.label ?? cat.category}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-[var(--text-tertiary)]">
                                      Target: {target}s
                                    </span>
                                    <span
                                      className="text-xs font-medium"
                                      style={{
                                        color:
                                          cat.avgTime <= target
                                            ? "#10B981"
                                            : "#EF4444",
                                      }}
                                    >
                                      {cat.avgTime}s
                                    </span>
                                  </div>
                                </div>
                                <div className="h-2 bg-[var(--page-muted)] rounded-full overflow-hidden">
                                  <div
                                    className="h-full rounded-full transition-all"
                                    style={{
                                      width: `${Math.min(100, (cat.avgTime / target) * 100)}%`,
                                      backgroundColor:
                                        cat.avgTime <= target
                                          ? "#10B981"
                                          : "#EF4444",
                                    }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid lg:grid-cols-2 gap-6 mb-8">
                    {/* Progress Trend */}
                    <Card className="bg-[var(--page-surface)] border-[var(--border-color)]">
                      <CardContent className="p-5">
                        <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-4">
                          Progress Trend (Last{" "}
                          {Math.min(10, data!.trend.length)} Sessions)
                        </h2>
                        {data!.trend.length === 0 ? (
                          <p className="text-xs text-[var(--text-tertiary)]">
                            Complete more sessions to see trends.
                          </p>
                        ) : (
                          <div className="flex items-end gap-2 h-40">
                            {data!.trend.map(pt => (
                              <div
                                key={pt.session}
                                className="flex-1 flex flex-col items-center gap-1"
                              >
                                <div className="w-full relative">
                                  <div
                                    className="w-full rounded-t-sm bg-[#2563EB]/60 transition-all"
                                    style={{
                                      height: `${(pt.accuracy / 100) * 120}px`,
                                    }}
                                  />
                                </div>
                                <span className="text-[9px] text-[var(--text-tertiary)]">
                                  {pt.session}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center justify-between mt-2 text-[10px] text-[var(--text-tertiary)]">
                          <span>
                            Sessions ago: {Math.min(10, data!.trend.length)}
                          </span>
                          <span>Latest</span>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Weakness Heatmap */}
                    <Card className="bg-[var(--page-surface)] border-[var(--border-color)]">
                      <CardContent className="p-5">
                        <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-4">
                          Weakness Heatmap
                        </h2>
                        <div className="space-y-2">
                          <div className="flex gap-1 ml-16">
                            {difficultyLabels.map(label => (
                              <div
                                key={label}
                                className="flex-1 text-[9px] text-[var(--text-tertiary)] text-center"
                              >
                                {label}
                              </div>
                            ))}
                          </div>
                          {data!.heatmap.map(row => (
                            <div
                              key={row.category}
                              className="flex items-center gap-2"
                            >
                              <span className="text-[10px] text-[var(--text-secondary)] w-14 text-right truncate">
                                {categoryMeta[row.category]?.label ??
                                  row.category}
                              </span>
                              <div className="flex gap-1 flex-1">
                                {difficultyKeys.map(key => {
                                  const val = row[key] ?? 0;
                                  return (
                                    <div
                                      key={key}
                                      className="flex-1 h-6 rounded-sm flex items-center justify-center text-[9px] font-bold"
                                      style={{
                                        backgroundColor: `${getHeatColor(val)}30`,
                                        color: getHeatColor(val),
                                      }}
                                    >
                                      {val}%
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center gap-3 mt-3 justify-end">
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-sm bg-[#10B981]/30" />
                            <span className="text-[9px] text-[var(--text-tertiary)]">
                              Strong
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-sm bg-[#F59E0B]/30" />
                            <span className="text-[9px] text-[var(--text-tertiary)]">
                              Okay
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-sm bg-[#EF4444]/30" />
                            <span className="text-[9px] text-[var(--text-tertiary)]">
                              Weak
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Recommendations */}
                  <Card className="bg-gradient-to-r from-[#10B981]/10 to-[#F59E0B]/10 border-[#10B981]/30">
                    <CardContent className="p-5">
                      <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
                        AI-Generated Recommendations
                      </h2>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-medium text-[#10B981] mb-2">
                            Strengths
                          </p>
                          <ul className="space-y-1">
                            {data!.strengths.length === 0 ? (
                              <li className="text-xs text-[var(--text-secondary)]">
                                Keep practicing to reveal your strengths.
                              </li>
                            ) : (
                              data!.strengths.map(s => (
                                <li
                                  key={s.category}
                                  className="text-xs text-[var(--text-secondary)] flex items-center gap-1.5"
                                >
                                  <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                                  {categoryMeta[s.category]?.label ??
                                    s.category}{" "}
                                  ({s.accuracy}% accuracy)
                                </li>
                              ))
                            )}
                          </ul>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-[#F59E0B] mb-2">
                            Priority Improvements
                          </p>
                          <ul className="space-y-1">
                            {data!.weaknesses.length === 0 ? (
                              <li className="text-xs text-[var(--text-secondary)]">
                                Great work — no major weaknesses yet.
                              </li>
                            ) : (
                              data!.weaknesses.map(w => (
                                <li
                                  key={w.category}
                                  className="text-xs text-[var(--text-secondary)] flex items-center gap-1.5"
                                >
                                  <div className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
                                  {categoryMeta[w.category]?.label ??
                                    w.category}{" "}
                                  ({w.accuracy}%) - {w.action}
                                </li>
                              ))
                            )}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}
