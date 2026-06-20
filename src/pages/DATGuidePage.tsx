import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, AlertTriangle, Info } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const sections = [
  {
    name: 'Survey of Natural Sciences (SNS)',
    questions: 70,
    time: '60 min',
    breakdown: [
      { subject: 'Biology', questions: 40, topics: 'Cell Biology, Physiology, Ecology, Microbiology, Anatomy' },
      { subject: 'Chemistry', questions: 30, topics: 'General Chemistry (NO Organic Chemistry on Canadian DAT)' },
    ],
    tip: 'Biology is the largest section. Focus on physiology and cell biology as they have the highest question density.',
  },
  {
    name: 'Perceptual Ability Test (PAT)',
    questions: 90,
    time: '60 min',
    breakdown: [
      { subject: 'Keyholes', questions: 15, topics: 'Spatial visualization of 3D objects through 2D apertures' },
      { subject: 'Top-Front-End', questions: 15, topics: 'Orthographic projection and visualization' },
      { subject: 'Angle Ranking', questions: 15, topics: 'Compare and rank 4 angles from smallest to largest' },
      { subject: 'Hole Punching', questions: 15, topics: 'Mental unfolding of folded paper with punch marks' },
      { subject: 'Cube Counting', questions: 15, topics: 'Count painted faces on stacked cubes' },
      { subject: 'Pattern Folding', questions: 15, topics: '2D net to 3D form visualization' },
    ],
    tip: 'PAT is often the hardest section to improve. Start practicing early with our 3D models and generators.',
  },
  {
    name: 'Reading Comprehension (RCT)',
    questions: 50,
    time: '60 min',
    breakdown: [
      { subject: '3 Passages', questions: 50, topics: 'Scientific passages, ~16 paragraphs each' },
    ],
    tip: 'Practice with scientific journals. The Skim-Scan-Deep Read method works best for most students.',
  },
];

const scoringScale = [
  { score: '30', percentile: '99.9th', description: 'Perfect score - exceptionally rare' },
  { score: '25-29', percentile: '95-99th', description: 'Excellent - top tier applicants' },
  { score: '22-24', percentile: '80-95th', description: 'Competitive - above average' },
  { score: '20-21', percentile: '65-80th', description: 'Good - meets most school requirements' },
  { score: '18-19', percentile: '45-65th', description: 'Average - acceptable for some schools' },
  { score: 'Below 18', percentile: 'Below 45th', description: 'Below average - consider retaking' },
];

const competitiveScores = [
  { school: 'UofT', minAA: '21+', minPAT: '20+', notes: 'High competition, strong applicants' },
  { school: 'Western', minAA: '20+', minPAT: '19+', notes: 'Balanced evaluation' },
  { school: 'McGill', minAA: '20+', minPAT: '19+', notes: 'MMI interview heavy' },
  { school: 'UBC', minAA: '20+', minPAT: '19+', notes: 'MMI+SGI format' },
  { school: 'Alberta', minAA: '20+', minPAT: '19+', notes: 'Strong IP preference' },
  { school: 'Saskatchewan', minAA: '19+', minPAT: '18+', notes: 'Higher OOP requirements' },
];

export default function DATGuidePage() {
  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      <div className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] pt-24 pb-16">
        <div className="section-container max-w-4xl mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-[#F59E0B] flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-white">Complete Canadian DAT Guide</h1>
          </div>
          <p className="text-white/70">Everything you need to know about the Canadian Dental Aptitude Test.</p>
        </div>
      </div>

      <div className="section-container max-w-4xl mx-auto -mt-8 pb-20">
        {/* Important Alert */}
        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-100 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-[#EF4444] shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-[#EF4444]">Canadian DAT ≠ American DAT</p>
            <p className="text-sm text-[#475569]">The Canadian DAT does NOT include Organic Chemistry or Quantitative Reasoning. Many US prep resources waste your time on these topics. Use Canadian-specific materials.</p>
          </div>
        </div>

        {/* Test Format */}
        <Card className="border-[#E2E8F0] mb-8">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-[#0F172A] mb-4">Canadian DAT Test Format</h2>
            <div className="space-y-6">
              {sections.map((section) => (
                <div key={section.name} className="border-b border-[#E2E8F0] last:border-0 pb-6 last:pb-0">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-semibold text-[#0F172A]">{section.name}</h3>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-xs">{section.questions} questions</Badge>
                      <Badge variant="outline" className="text-xs">{section.time}</Badge>
                    </div>
                  </div>
                  <div className="space-y-2 mb-3">
                    {section.breakdown.map((b) => (
                      <div key={b.subject} className="flex items-start gap-3 p-3 rounded-lg bg-[#F8FAFC]">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-[#0F172A]">{b.subject}</p>
                          <p className="text-xs text-[#475569]">{b.topics}</p>
                        </div>
                        <Badge className="shrink-0 bg-[#EFF6FF] text-[#2563EB]">{b.questions}Q</Badge>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50">
                    <Info className="w-4 h-4 text-[#2563EB] mt-0.5 shrink-0" />
                    <p className="text-xs text-[#475569]">{section.tip}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Scoring Scale */}
        <Card className="border-[#E2E8F0] mb-8">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-[#0F172A] mb-4">Score Scale (1-30)</h2>
            <div className="space-y-2">
              {scoringScale.map((s) => (
                <div key={s.score} className="flex items-center gap-4 p-3 rounded-lg hover:bg-[#F8FAFC] transition-colors">
                  <div className="w-20 text-center">
                    <span className="text-lg font-bold text-[#2563EB]">{s.score}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#0F172A]">{s.percentile}</p>
                    <p className="text-xs text-[#475569]">{s.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Competitive Scores */}
        <Card className="border-[#E2E8F0] mb-8">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-[#0F172A] mb-4">Competitive Scores by School</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#E2E8F0]">
                    <th className="text-left py-2 px-3 text-xs font-semibold text-[#475569]">School</th>
                    <th className="text-center py-2 px-3 text-xs font-semibold text-[#475569]">Min DAT AA</th>
                    <th className="text-center py-2 px-3 text-xs font-semibold text-[#475569]">Min PAT</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-[#475569]">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {competitiveScores.map((s) => (
                    <tr key={s.school} className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC]">
                      <td className="py-2.5 px-3 text-sm font-medium text-[#0F172A]">{s.school}</td>
                      <td className="py-2.5 px-3 text-sm text-center text-[#2563EB] font-semibold">{s.minAA}</td>
                      <td className="py-2.5 px-3 text-sm text-center text-[#8B5CF6] font-semibold">{s.minPAT}</td>
                      <td className="py-2.5 px-3 text-xs text-[#475569]">{s.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Registration */}
        <Card className="border-[#E2E8F0]">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-[#0F172A] mb-4">Registration Process</h2>
            <ol className="space-y-3">
              {[
                'Create an account on the Canadian Dental Association (CDA) website',
                'Select your preferred test date and location',
                'Pay the registration fee (~$495 CAD)',
                'Receive confirmation email with test details',
                'Download your admission ticket 2 weeks before the exam',
                'Bring 2 forms of ID to the test center',
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#2563EB] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <span className="text-sm text-[#475569]">{step}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
