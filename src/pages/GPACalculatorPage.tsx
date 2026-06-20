import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Calculator, Info, AlertTriangle, Check, BookOpen } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const schools = [
  { name: 'University of Toronto', avgGPA: 3.96, scale: '4.0', method: 'Lowest year dropped (4+ years)' },
  { name: 'Western University', avgGPA: 89.85, scale: '100', method: 'Best 2 years' },
  { name: 'McGill University', avgGPA: 3.83, scale: '4.0', method: 'IP: 3.83 avg / OOP: 3.92 avg' },
  { name: 'UBC', avgGPA: 86.24, scale: '100', method: '2.8 minimum (70%)' },
  { name: 'Alberta', avgGPA: 3.94, scale: '4.0', method: 'Minimum 3.5' },
  { name: 'Saskatchewan', avgGPA: 88.82, scale: '100', method: 'IP: 88.82% / OOP: 93.66%' },
  { name: 'Manitoba', avgGPA: 3.75, scale: '4.0', method: 'IP: 3.75 / OOP: 4.0' },
  { name: 'Dalhousie', avgGPA: 0, scale: '4.0', method: 'Not reported' },
  { name: 'Université de Montréal', avgGPA: 0, scale: '4.0', method: 'Not reported' },
  { name: 'Université Laval', avgGPA: 0, scale: '4.0', method: 'Not reported' },
];

function getRating(gpa: number, scale: string, schoolAvg: number, schoolScale: string) {
  let normalizedGPA = gpa;
  let normalizedAvg = schoolAvg;

  if (scale === '100' && schoolScale === '4.0') {
    normalizedGPA = (gpa / 100) * 4.0;
  } else if (scale === '4.0' && schoolScale === '100') {
    normalizedGPA = (gpa / 4.0) * 100;
  }

  if (normalizedAvg === 0) return { label: 'Unknown', color: 'bg-gray-100 text-gray-600' };

  const diff = normalizedGPA - normalizedAvg;
  if (diff >= 0.1) return { label: 'Competitive', color: 'bg-green-100 text-green-700' };
  if (diff >= -0.15) return { label: 'Reach', color: 'bg-yellow-100 text-yellow-700' };
  return { label: 'Below Average', color: 'bg-red-100 text-red-700' };
}

export default function GPACalculatorPage() {
  const [gpa, setGpa] = useState<string>('3.5');
  const [scale, setScale] = useState<'4.0' | '100'>('4.0');

  const gpaNum = parseFloat(gpa) || 0;

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
            <div className="w-10 h-10 rounded-lg bg-[#2563EB] flex items-center justify-center">
              <Calculator className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-white">GPA Calculator</h1>
          </div>
          <p className="text-white/70 max-w-2xl">
            Calculate your competitiveness at each Canadian dental school based on your GPA.
          </p>
        </div>
      </div>

      <div className="section-container max-w-7xl mx-auto -mt-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Input Panel */}
          <Card className="border-[#E2E8F0] shadow-lg lg:col-span-1">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-[#0F172A] mb-4">Your GPA</h2>

              <div className="mb-4">
                <label className="text-sm font-medium text-[#475569] mb-2 block">Current GPA</label>
                <Input
                  type="number"
                  step={scale === '4.0' ? '0.01' : '0.1'}
                  value={gpa}
                  onChange={(e) => setGpa(e.target.value)}
                  className="h-11 text-lg"
                  placeholder={scale === '4.0' ? '3.50' : '85.0'}
                />
              </div>

              <div className="mb-6">
                <label className="text-sm font-medium text-[#475569] mb-2 block">GPA Scale</label>
                <div className="flex gap-2">
                  {(['4.0', '100'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setScale(s)}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        scale === s ? 'bg-[#2563EB] text-white' : 'bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0]'
                      }`}
                    >
                      {s === '4.0' ? '4.0 Scale' : 'Percentage'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-[#2563EB] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-[#2563EB] mb-1">How schools calculate GPA</p>
                    <p className="text-xs text-[#475569]">Each school uses a different method. Hover over each school to see their specific formula.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-semibold text-[#0F172A]">Competitiveness by School</h2>
            {schools.map((school) => {
              const rating = getRating(gpaNum, scale, school.avgGPA, school.scale);
              const pct = school.avgGPA > 0 ? Math.min(100, Math.max(0, (gpaNum / (scale === school.scale ? school.avgGPA : scale === '4.0' ? (school.avgGPA / 100) * 4 : (school.avgGPA / 4) * 100)) * 100)) : 50;

              return (
                <Card key={school.name} className="border-[#E2E8F0] hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="text-sm font-semibold text-[#0F172A]">{school.name}</h3>
                        <p className="text-xs text-[#475569]">Avg admitted: {school.avgGPA > 0 ? `${school.avgGPA} (${school.scale})` : 'Not reported'}</p>
                      </div>
                      <Badge className={rating.color}>{rating.label}</Badge>
                    </div>
                    <div className="w-full h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          rating.label === 'Competitive' ? 'bg-green-500' :
                          rating.label === 'Reach' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-[#94A3B8] mt-1.5">{school.method}</p>
                  </CardContent>
                </Card>
              );
            })}

            <div className="flex items-start gap-2 p-4 rounded-lg bg-yellow-50 border border-yellow-100">
              <AlertTriangle className="w-4 h-4 text-[#F59E0B] mt-0.5 shrink-0" />
              <p className="text-xs text-[#475569]">
                These are general estimates. GPA is only one component of your application. DAT scores, CASPer, interview performance, and extracurriculars also play significant roles.
              </p>
            </div>
          </div>
        </div>

        {/* Guide Section */}
        <div className="mt-12 mb-20">
          <Card className="border-[#E2E8F0]">
            <CardContent className="p-6 lg:p-8">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-5 h-5 text-[#2563EB]" />
                <h2 className="text-lg font-semibold text-[#0F172A]">How Canadian Dental Schools Calculate GPA</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-6 text-sm text-[#475569] leading-relaxed">
                <div>
                  <h3 className="font-semibold text-[#0F172A] mb-2">GPA Calculation Methods</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2"><Check className="w-4 h-4 text-[#10B981] mt-0.5 shrink-0" /><span><strong>UofT:</strong> Lowest year dropped if you have 4+ years of study</span></li>
                    <li className="flex items-start gap-2"><Check className="w-4 h-4 text-[#10B981] mt-0.5 shrink-0" /><span><strong>Western:</strong> Best 2 years (must have minimum 5 courses each)</span></li>
                    <li className="flex items-start gap-2"><Check className="w-4 h-4 text-[#10B981] mt-0.5 shrink-0" /><span><strong>UBC:</strong> Overall GPA with 70% (2.8) minimum requirement</span></li>
                    <li className="flex items-start gap-2"><Check className="w-4 h-4 text-[#10B981] mt-0.5 shrink-0" /><span><strong>McGill:</strong> Different averages for IP vs OOP applicants</span></li>
                    <li className="flex items-start gap-2"><Check className="w-4 h-4 text-[#10B981] mt-0.5 shrink-0" /><span><strong>Alberta:</strong> Minimum 3.5 required to apply</span></li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-[#0F172A] mb-2">Tips to Improve Your GPA</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2"><Check className="w-4 h-4 text-[#2563EB] mt-0.5 shrink-0" /><span>Take a 5th year to drop your lowest year (UofT)</span></li>
                    <li className="flex items-start gap-2"><Check className="w-4 h-4 text-[#2563EB] mt-0.5 shrink-0" /><span>Focus on acing your best 2 years (Western)</span></li>
                    <li className="flex items-start gap-2"><Check className="w-4 h-4 text-[#2563EB] mt-0.5 shrink-0" /><span>Consider a Special Year after your degree</span></li>
                    <li className="flex items-start gap-2"><Check className="w-4 h-4 text-[#2563EB] mt-0.5 shrink-0" /><span>Retake courses where you scored below average</span></li>
                    <li className="flex items-start gap-2"><Check className="w-4 h-4 text-[#2563EB] mt-0.5 shrink-0" /><span>Apply strategically based on your GPA method advantage</span></li>
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
