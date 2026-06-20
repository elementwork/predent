
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Brain, Lock, TrendingUp, Play, BarChart3,
  Sparkles, ChevronRight, Target
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';


const categories = [
  { id: 'keyholes', name: 'Keyholes', color: '#14B8A6', bgColor: '#F0FDFA', questions: 847, accuracy: 78, progress: 65 },
  { id: 'tfe', name: 'Top-Front-End', color: '#6366F1', bgColor: '#EEF2FF', questions: 923, accuracy: 64, progress: 42 },
  { id: 'angle-ranking', name: 'Angle Ranking', color: '#F59E0B', bgColor: '#FFFBEB', questions: 756, accuracy: 82, progress: 71 },
  { id: 'hole-punching', name: 'Hole Punching', color: '#F43F5E', bgColor: '#FFF1F2', questions: 891, accuracy: 71, progress: 55 },
  { id: 'cube-counting', name: 'Cube Counting', color: '#10B981', bgColor: '#ECFDF5', questions: 634, accuracy: 89, progress: 83 },
  { id: 'pattern-folding', name: 'Pattern Folding', color: '#8B5CF6', bgColor: '#F5F3FF', questions: 712, accuracy: 58, progress: 37 },
];

const recentSessions = [
  { date: 'Jun 19', correct: 12, total: 15, time: '12:34', category: 'Keyholes' },
  { date: 'Jun 18', correct: 9, total: 15, time: '14:22', category: 'Angle Ranking' },
  { date: 'Jun 17', correct: 11, total: 15, time: '13:45', category: 'Cube Counting' },
  { date: 'Jun 16', correct: 8, total: 15, time: '15:10', category: 'Pattern Folding' },
  { date: 'Jun 15', correct: 13, total: 15, time: '11:58', category: 'TFE' },
  { date: 'Jun 14', correct: 10, total: 15, time: '13:30', category: 'Hole Punching' },
  { date: 'Jun 13', correct: 14, total: 15, time: '12:05', category: 'Keyholes' },
];

function CircularProgress({ value, color, size = 56 }: { value: number; color: string; size?: number }) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#E2E8F0" strokeWidth={4} />
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={4}
        strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" />
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" transform="rotate(90, ${size/2}, ${size/2})"
        className="text-xs font-bold" fill={color}>{value}%</text>
    </svg>
  );
}

export default function PATAcademyPage() {
  const overallAccuracy = Math.round(categories.reduce((s, c) => s + c.accuracy, 0) / categories.length);

  return (
    <main className="min-h-screen bg-[#0F172A]">
      {/* Header */}
      <div className="pt-20 pb-12 bg-gradient-to-br from-[#0F172A] to-[#1E293B]">
        <div className="section-container max-w-7xl mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#8B5CF6] flex items-center justify-center">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-white">PAT Academy</h1>
              <p className="text-white/60">Master the Perceptual Ability Test</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
            {[
              { label: 'Overall Accuracy', value: `${overallAccuracy}%`, icon: Target, color: '#10B981' },
              { label: 'Questions Done', value: '1,247', icon: Brain, color: '#2563EB' },
              { label: 'Study Streak', value: '12 days', icon: TrendingUp, color: '#F59E0B' },
              { label: 'Predicted Score', value: '22 ±2', icon: Sparkles, color: '#8B5CF6' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
                  <span className="text-xs text-white/50">{stat.label}</span>
                </div>
                <p className="text-xl font-bold text-white">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="section-container max-w-7xl mx-auto py-8 pb-20">
        {/* Category Cards Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {categories.map((cat) => (
            <motion.div
              key={cat.id}
              whileHover={{ y: -4 }}
            >
              <Card className="bg-white/5 border-white/10 hover:border-white/20 transition-all cursor-pointer overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${cat.color}20` }}>
                        <Brain className="w-5 h-5" style={{ color: cat.color }} />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-white">{cat.name}</h3>
                        <p className="text-xs text-white/40">{cat.questions.toLocaleString()} questions</p>
                      </div>
                    </div>
                    <CircularProgress value={cat.progress} color={cat.color} size={48} />
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white/40">Accuracy</span>
                      <span className="text-white font-medium">{cat.accuracy}%</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${cat.accuracy}%`, backgroundColor: cat.color }} />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1 h-8 text-xs font-medium" style={{ backgroundColor: cat.color, color: 'white' }} asChild>
                      <Link to="/pat-academy/practice"><Play className="w-3 h-3 mr-1" />Practice</Link>
                    </Button>
                    <Button size="sm" variant="outline" className="h-8 text-xs border-white/10 text-white/60 hover:text-white hover:bg-white/5" asChild>
                      <Link to={`/guides/pat-${cat.id}`}>Guide</Link>
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
                  <h3 className="text-base font-semibold text-white">Unlimited PAT Generators</h3>
                  <Lock className="w-3.5 h-3.5 text-[#F59E0B]" />
                </div>
                <p className="text-xs text-white/50">10M+ question variations across all 6 categories</p>
              </div>
            </div>
            <Button size="sm" className="bg-[#F59E0B] hover:bg-[#D97706] text-white h-9" onClick={() => alert('Premium feature coming in Step 6!')}>
              Upgrade <ChevronRight className="w-4 h-4" />
            </Button>
          </CardContent>
        </Card>

        {/* Recent Performance */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-4 h-4 text-[#10B981]" />
                <h3 className="text-sm font-semibold text-white">Last 7 Sessions</h3>
              </div>
              <div className="space-y-3">
                {recentSessions.map((session, i) => {
                  const pct = (session.correct / session.total) * 100;
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-xs text-white/40 w-12">{session.date}</span>
                      <div className="flex-1 h-6 bg-white/5 rounded-md overflow-hidden relative">
                        <div className="h-full rounded-md flex items-center px-2" style={{ width: `${pct}%`, backgroundColor: pct >= 80 ? '#10B98130' : pct >= 60 ? '#F59E0B30' : '#EF444430' }}>
                          <span className="text-[10px] font-medium" style={{ color: pct >= 80 ? '#10B981' : pct >= 60 ? '#F59E0B' : '#EF4444' }}>
                            {session.correct}/{session.total}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs text-white/40 w-14 text-right">{session.time}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-4 h-4 text-[#2563EB]" />
                <h3 className="text-sm font-semibold text-white">Accuracy by Category</h3>
              </div>
              <div className="space-y-3">
                {categories.map((cat) => (
                  <div key={cat.id}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-white/60">{cat.name}</span>
                      <span className="text-xs font-medium" style={{ color: cat.color }}>{cat.accuracy}%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
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
