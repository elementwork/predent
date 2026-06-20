import { Link } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Target, Flame, BookOpen } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';


const categories = [
  { name: 'Keyholes', color: '#14B8A6', accuracy: 78, avgTime: 32, targetTime: 30 },
  { name: 'Top-Front-End', color: '#6366F1', accuracy: 64, avgTime: 48, targetTime: 45 },
  { name: 'Angle Ranking', color: '#F59E0B', accuracy: 82, avgTime: 22, targetTime: 24 },
  { name: 'Hole Punching', color: '#F43F5E', accuracy: 71, avgTime: 42, targetTime: 40 },
  { name: 'Cube Counting', color: '#10B981', accuracy: 89, avgTime: 28, targetTime: 36 },
  { name: 'Pattern Folding', color: '#8B5CF6', accuracy: 58, avgTime: 68, targetTime: 66 },
];

const weaknessHeatmap = [
  { category: 'Keyholes', beginner: 92, intermediate: 80, advanced: 65, elite: 50 },
  { category: 'TFE', beginner: 85, intermediate: 68, advanced: 52, elite: 38 },
  { category: 'Angle Ranking', beginner: 95, intermediate: 86, advanced: 72, elite: 60 },
  { category: 'Hole Punching', beginner: 88, intermediate: 74, advanced: 58, elite: 42 },
  { category: 'Cube Counting', beginner: 96, intermediate: 90, advanced: 78, elite: 65 },
  { category: 'Pattern Folding', beginner: 80, intermediate: 62, advanced: 45, elite: 30 },
];

const progressTrend = [
  { session: 1, accuracy: 55 },
  { session: 2, accuracy: 58 },
  { session: 3, accuracy: 60 },
  { session: 4, accuracy: 59 },
  { session: 5, accuracy: 63 },
  { session: 6, accuracy: 65 },
  { session: 7, accuracy: 68 },
  { session: 8, accuracy: 70 },
  { session: 9, accuracy: 72 },
  { session: 10, accuracy: 75 },
];

function getHeatColor(value: number) {
  if (value >= 85) return '#10B981';
  if (value >= 70) return '#F59E0B';
  if (value >= 55) return '#F97316';
  return '#EF4444';
}

export default function PATAnalyticsPage() {
  const overallAccuracy = Math.round(categories.reduce((s, c) => s + c.accuracy, 0) / categories.length);

  return (
    <main className="min-h-screen bg-[#0F172A]">
      <div className="pt-20 pb-12">
        <div className="section-container max-w-6xl mx-auto">
          <Link to="/pat-academy" className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to PAT Academy
          </Link>

          <h1 className="text-2xl font-bold text-white mb-6">Performance Analytics</h1>

          {/* Overview Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Overall Accuracy', value: `${overallAccuracy}%`, change: '+12%', icon: TrendingUp, color: '#10B981' },
              { label: 'Avg Time/Q', value: '40s', change: 'Target: 40s', icon: Target, color: '#2563EB' },
              { label: 'Predicted PAT', value: '22 ±2', change: '80th percentile', icon: BookOpen, color: '#8B5CF6' },
              { label: 'Study Streak', value: '12 days', change: 'Keep it up!', icon: Flame, color: '#F59E0B' },
            ].map((stat) => (
              <Card key={stat.label} className="bg-white/5 border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
                    <span className="text-xs text-white/40">{stat.label}</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-[10px] mt-1" style={{ color: stat.color }}>{stat.change}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            {/* Accuracy by Category */}
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-5">
                <h2 className="text-sm font-semibold text-white mb-4">Accuracy by Category</h2>
                <div className="space-y-3">
                  {categories.map((cat) => (
                    <div key={cat.name}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-white/60">{cat.name}</span>
                        <span className="text-xs font-medium" style={{ color: cat.color }}>{cat.accuracy}%</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${cat.accuracy}%`, backgroundColor: cat.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Time Distribution */}
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-5">
                <h2 className="text-sm font-semibold text-white mb-4">Avg Time per Category</h2>
                <div className="space-y-3">
                  {categories.map((cat) => (
                    <div key={cat.name}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-white/60">{cat.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-white/40">Target: {cat.targetTime}s</span>
                          <span className="text-xs font-medium" style={{ color: cat.avgTime <= cat.targetTime ? '#10B981' : '#EF4444' }}>
                            {cat.avgTime}s
                          </span>
                        </div>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${Math.min(100, (cat.avgTime / cat.targetTime) * 100)}%`,
                            backgroundColor: cat.avgTime <= cat.targetTime ? '#10B981' : '#EF4444',
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            {/* Progress Trend */}
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-5">
                <h2 className="text-sm font-semibold text-white mb-4">Progress Trend (Last 10 Sessions)</h2>
                <div className="flex items-end gap-2 h-40">
                  {progressTrend.map((pt) => (
                    <div key={pt.session} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full relative">
                        <div
                          className="w-full rounded-t-sm bg-[#2563EB]/60 transition-all"
                          style={{ height: `${(pt.accuracy / 100) * 120}px` }}
                        />
                      </div>
                      <span className="text-[9px] text-white/30">{pt.session}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-2 text-[10px] text-white/30">
                  <span>Sessions ago: 10</span>
                  <span>Latest</span>
                </div>
              </CardContent>
            </Card>

            {/* Weakness Heatmap */}
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-5">
                <h2 className="text-sm font-semibold text-white mb-4">Weakness Heatmap</h2>
                <div className="space-y-2">
                  <div className="flex gap-1 ml-16">
                    {['Beginner', 'Int.', 'Adv.', 'Elite'].map((label) => (
                      <div key={label} className="flex-1 text-[9px] text-white/30 text-center">{label}</div>
                    ))}
                  </div>
                  {weaknessHeatmap.map((row) => (
                    <div key={row.category} className="flex items-center gap-2">
                      <span className="text-[10px] text-white/50 w-14 text-right truncate">{row.category}</span>
                      <div className="flex gap-1 flex-1">
                        {[row.beginner, row.intermediate, row.advanced, row.elite].map((val, i) => (
                          <div
                            key={i}
                            className="flex-1 h-6 rounded-sm flex items-center justify-center text-[9px] font-bold"
                            style={{ backgroundColor: `${getHeatColor(val)}30`, color: getHeatColor(val) }}
                          >
                            {val}%
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-3 mt-3 justify-end">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-sm bg-[#10B981]/30" />
                    <span className="text-[9px] text-white/30">Strong</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-sm bg-[#F59E0B]/30" />
                    <span className="text-[9px] text-white/30">Okay</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-sm bg-[#EF4444]/30" />
                    <span className="text-[9px] text-white/30">Weak</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recommendations */}
          <Card className="bg-gradient-to-r from-[#10B981]/10 to-[#F59E0B]/10 border-[#10B981]/30">
            <CardContent className="p-5">
              <h2 className="text-sm font-semibold text-white mb-3">AI-Generated Recommendations</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-[#10B981] mb-2">Strengths</p>
                  <ul className="space-y-1">
                    <li className="text-xs text-white/60 flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />Cube Counting (89% accuracy)</li>
                    <li className="text-xs text-white/60 flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />Angle Ranking (82% accuracy)</li>
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-medium text-[#F59E0B] mb-2">Priority Improvements</p>
                  <ul className="space-y-1">
                    <li className="text-xs text-white/60 flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />Pattern Folding (58%) - Practice 20 min daily</li>
                    <li className="text-xs text-white/60 flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />TFE (64%) - Use 3D model viewer</li>
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
