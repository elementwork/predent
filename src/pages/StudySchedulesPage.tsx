import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Check, ChevronRight, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const schedules = [
  {
    weeks: 4,
    title: 'Crash Course',
    hoursPerWeek: '20-30',
    totalHours: '80-120',
    description: 'Intensive review for students with strong foundational knowledge.',
    breakdown: { biology: 35, chemistry: 30, pat: 25, rc: 10 },
    milestones: ['Week 1: Content review all subjects', 'Week 2: PAT intensive + practice tests', 'Week 3: Weak area focus + full mocks', 'Week 4: Final review + exam simulation'],
    difficulty: 'High',
    color: '#EF4444',
    bgColor: '#FEF2F2',
  },
  {
    weeks: 8,
    title: 'Accelerated',
    hoursPerWeek: '15-20',
    totalHours: '120-160',
    description: 'Fast-paced schedule for students with moderate preparation.',
    breakdown: { biology: 35, chemistry: 30, pat: 25, rc: 10 },
    milestones: ['Weeks 1-2: Biology & Chemistry content', 'Weeks 3-4: PAT all categories', 'Weeks 5-6: Reading Comprehension + mixed practice', 'Weeks 7-8: Full mock exams + review'],
    difficulty: 'Medium',
    color: '#F59E0B',
    bgColor: '#FFFBEB',
  },
  {
    weeks: 12,
    title: 'Standard',
    hoursPerWeek: '10-15',
    totalHours: '120-180',
    description: 'Balanced approach for most pre-dental students.',
    breakdown: { biology: 30, chemistry: 30, pat: 25, rc: 15 },
    milestones: ['Weeks 1-4: Biology & Chemistry fundamentals', 'Weeks 5-8: PAT practice with 3D models', 'Weeks 9-10: RC strategy + timed practice', 'Weeks 11-12: Mock exams + final review'],
    difficulty: 'Medium',
    color: '#2563EB',
    bgColor: '#EFF6FF',
  },
  {
    weeks: 16,
    title: 'Comprehensive',
    hoursPerWeek: '8-12',
    totalHours: '128-192',
    description: 'Thorough preparation for students needing content review.',
    breakdown: { biology: 30, chemistry: 25, pat: 25, rc: 20 },
    milestones: ['Weeks 1-6: Complete content review all subjects', 'Weeks 7-10: PAT mastery + generator practice', 'Weeks 11-13: RC passages + timing drills', 'Weeks 14-16: Full mocks + weak area polish'],
    difficulty: 'Low',
    color: '#10B981',
    bgColor: '#ECFDF5',
  },
];

const subjectColors: Record<string, string> = {
  biology: '#10B981',
  chemistry: '#2563EB',
  pat: '#8B5CF6',
  rc: '#F59E0B',
};

export default function StudySchedulesPage() {
  const [selectedWeeks, setSelectedWeeks] = useState<number | null>(null);

  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] pt-24 pb-16">
        <div className="section-container max-w-7xl mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-[#10B981] flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-white">DAT Study Schedules</h1>
          </div>
          <p className="text-white/70 max-w-2xl">
            Proven study plans for the Canadian DAT. Choose the schedule that fits your timeline and goals.
          </p>
        </div>
      </div>

      <div className="section-container max-w-7xl mx-auto -mt-8 pb-20">
        {/* Alert */}
        <div className="mb-6 p-4 rounded-lg bg-yellow-50 border border-yellow-100 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-[#F59E0B] shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-[#0F172A]">Canadian DAT vs American DAT</p>
            <p className="text-sm text-[#475569]">The Canadian DAT does NOT include Organic Chemistry or Quantitative Reasoning. Make sure your study materials are Canadian-focused.</p>
          </div>
        </div>

        {/* Schedule Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {schedules.map((s) => (
            <Card
              key={s.weeks}
              className={`border-[#E2E8F0] cursor-pointer transition-all ${
                selectedWeeks === s.weeks ? 'ring-2 ring-[#2563EB] shadow-lg' : 'hover:shadow-md'
              }`}
              onClick={() => setSelectedWeeks(s.weeks)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: s.color }}>
                      {s.weeks}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[#0F172A]">{s.title}</h3>
                      <p className="text-xs text-[#475569]">{s.weeks} weeks</p>
                    </div>
                  </div>
                  <Badge style={{ backgroundColor: s.bgColor, color: s.color, borderColor: s.color }} variant="outline">
                    {s.difficulty} Intensity
                  </Badge>
                </div>

                <p className="text-sm text-[#475569] mb-4">{s.description}</p>

                <div className="flex items-center gap-4 mb-4 text-sm">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[#94A3B8]" />
                    <span className="text-[#475569]">{s.hoursPerWeek} hrs/week</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-[#94A3B8]" />
                    <span className="text-[#475569]">{s.totalHours} total</span>
                  </div>
                </div>

                {/* Subject Breakdown */}
                <div className="mb-4">
                  <p className="text-xs font-medium text-[#475569] mb-2">Subject Breakdown</p>
                  <div className="flex gap-1 h-3 rounded-full overflow-hidden">
                    {Object.entries(s.breakdown).map(([sub, pct]) => (
                      <div
                        key={sub}
                        style={{ width: `${pct}%`, backgroundColor: subjectColors[sub] }}
                        title={`${sub}: ${pct}%`}
                      />
                    ))}
                  </div>
                  <div className="flex gap-3 mt-2">
                    {Object.entries(s.breakdown).map(([sub, pct]) => (
                      <div key={sub} className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: subjectColors[sub] }} />
                        <span className="text-[10px] text-[#475569] capitalize">{sub} {pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedWeeks === s.weeks && (
                  <div className="mt-4 pt-4 border-t border-[#E2E8F0] animate-fade-in">
                    <p className="text-xs font-semibold text-[#0F172A] mb-2">Milestones</p>
                    <ul className="space-y-2">
                      {s.milestones.map((m, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-[#475569]">
                          <Check className="w-3.5 h-3.5 text-[#10B981] mt-0.5 shrink-0" />
                          {m}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button
            size="lg"
            className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold px-8"
            onClick={() => alert('Personalized schedule generator coming soon!')}
          >
            Generate My Personalized Schedule
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </main>
  );
}
