import { Link } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Users, Clock, Check, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const mmiStations = [
  { type: 'Ethical Scenario', description: 'Navigate complex ethical dilemmas involving patient care, confidentiality, and professional boundaries.' },
  { type: 'Communication', description: 'Demonstrate effective communication with patients, families, or healthcare team members.' },
  { type: 'Problem Solving', description: 'Analyze a problem and propose logical, practical solutions under time pressure.' },
  { type: 'Collaboration', description: 'Show ability to work effectively in teams and resolve interpersonal conflicts.' },
  { type: 'Self-Reflection', description: 'Discuss personal experiences, failures, growth, and motivation for dentistry.' },
  { type: 'Critical Thinking', description: 'Evaluate arguments, identify assumptions, and construct logical reasoning.' },
];

const panelQuestions = [
  { category: 'Motivation for Dentistry', frequency: 95, questions: ['Why dentistry and not medicine?', 'When did you first consider dentistry?', 'What would you do if you could not be a dentist?'] },
  { category: 'Knowledge of Profession', frequency: 80, questions: ['What challenges does dentistry face today?', 'How do you see the future of dentistry?', 'What are the biggest rewards of being a dentist?'] },
  { category: 'Personal Strengths/Weaknesses', frequency: 75, questions: ['What is your greatest weakness?', 'Tell us about a time you failed and what you learned.', 'What unique qualities do you bring?'] },
  { category: 'Ethical Scenarios', frequency: 70, questions: ['A patient refuses treatment you recommend. What do you do?', 'How would you handle a mistake in patient care?', 'A colleague is impaired at work. What is your responsibility?'] },
  { category: 'School-Specific', frequency: 60, questions: ['Why do you want to attend our school?', 'How will you contribute to our community?', 'What research interests do you have?'] },
  { category: 'Current Events', frequency: 50, questions: ['What healthcare issue concerns you most?', 'How should dentistry address access to care?', 'Thoughts on AI in dentistry?'] },
];

const schoolFormats = [
  { school: 'University of Toronto', format: 'Panel', duration: '~30-45 min', notes: '2-3 interviewers, traditional questions' },
  { school: 'Western University', format: 'Panel', duration: '~30 min', notes: 'Conversational style' },
  { school: 'McGill University', format: 'MMI', duration: '~60 min', notes: '8-10 stations' },
  { school: 'UBC', format: 'MMI + SGI', duration: '~90 min', notes: 'Multiple Mini Interview + Small Group Interaction' },
  { school: 'Alberta', format: 'MMI', duration: '~60 min', notes: '8 stations' },
  { school: 'Saskatchewan', format: 'MMI', duration: '~60 min', notes: 'Multiple stations' },
  { school: 'Manitoba', format: 'Panel', duration: '~30 min', notes: 'Traditional panel format' },
  { school: 'Dalhousie', format: 'Panel', duration: '~30 min', notes: 'Conversational panel' },
];

const prepTimeline = [
  { when: '3+ Months Before', tasks: ['Research each school\'s interview format', 'Reflect on your experiences and motivations', 'Practice answering common questions out loud', 'Join a mock interview group'] },
  { when: '1 Month Before', tasks: ['Schedule mock interviews', 'Prepare 3-5 key stories from your experiences', 'Research current healthcare topics', 'Review school-specific programs and values'] },
  { when: '1 Week Before', tasks: ['Do 2-3 full mock interviews', 'Prepare thoughtful questions to ask interviewers', 'Plan your outfit and travel logistics', 'Get good sleep and stay hydrated'] },
  { when: 'Day Of', tasks: ['Arrive 15-30 minutes early', 'Bring copies of your application materials', 'Be authentic and let your personality shine', 'Send thank-you notes within 24 hours'] },
];

export default function InterviewPrepPage() {
  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      <div className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] pt-24 pb-16">
        <div className="section-container max-w-4xl mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-[#8B5CF6] flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-white">Interview Preparation Guide</h1>
          </div>
          <p className="text-white/70">Master both MMI and Panel interview formats for Canadian dental schools.</p>
        </div>
      </div>

      <div className="section-container max-w-4xl mx-auto -mt-8 pb-20">
        {/* Format Selector */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="border-[#E2E8F0]">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-5 h-5 text-[#2563EB]" />
                <h2 className="text-lg font-bold text-[#0F172A]">MMI Format</h2>
              </div>
              <p className="text-sm text-[#475569] mb-4">Multiple Mini Interview consists of 8-10 short stations, each with a different scenario or task. You typically have 2 minutes to read the prompt and 5-8 minutes to respond.</p>
              <div className="space-y-2">
                {mmiStations.map((station) => (
                  <div key={station.type} className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                    <p className="text-sm font-medium text-[#0F172A]">{station.type}</p>
                    <p className="text-xs text-[#475569]">{station.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#E2E8F0]">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="w-5 h-5 text-[#10B981]" />
                <h2 className="text-lg font-bold text-[#0F172A]">Panel Format</h2>
              </div>
              <p className="text-sm text-[#475569] mb-4">Traditional interview with 2-3 faculty members. Lasts 30-45 minutes with conversational questions about your background, motivation, and experiences.</p>
              <div className="space-y-3">
                {panelQuestions.map((q) => (
                  <div key={q.category} className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-[#0F172A]">{q.category}</p>
                      <Badge className="text-[10px] bg-[#FEF3C7] text-[#92400E]">{q.frequency}% freq</Badge>
                    </div>
                    <ul className="space-y-1">
                      {q.questions.slice(0, 2).map((question, i) => (
                        <li key={i} className="text-xs text-[#475569] flex items-start gap-1">
                          <Star className="w-3 h-3 text-[#F59E0B] mt-0.5 shrink-0" />
                          {question}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* School-Specific Formats */}
        <Card className="border-[#E2E8F0] mb-8">
          <CardContent className="p-6">
            <h2 className="text-lg font-bold text-[#0F172A] mb-4">Interview Format by School</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#E2E8F0]">
                    <th className="text-left py-2 px-3 text-xs font-semibold text-[#475569]">School</th>
                    <th className="text-center py-2 px-3 text-xs font-semibold text-[#475569]">Format</th>
                    <th className="text-center py-2 px-3 text-xs font-semibold text-[#475569]">Duration</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-[#475569]">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {schoolFormats.map((s) => (
                    <tr key={s.school} className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC]">
                      <td className="py-2.5 px-3 text-sm text-[#0F172A]">{s.school}</td>
                      <td className="py-2.5 px-3 text-center">
                        <Badge className={s.format === 'MMI' ? 'bg-[#EFF6FF] text-[#2563EB]' : 'bg-[#ECFDF5] text-[#10B981]'}>
                          {s.format}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-3 text-sm text-center text-[#475569]">{s.duration}</td>
                      <td className="py-2.5 px-3 text-xs text-[#475569]">{s.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Preparation Timeline */}
        <Card className="border-[#E2E8F0] mb-8">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-[#F59E0B]" />
              <h2 className="text-lg font-bold text-[#0F172A]">Preparation Timeline</h2>
            </div>
            <div className="space-y-4">
              {prepTimeline.map((phase, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-[#2563EB] text-white text-xs font-bold flex items-center justify-center shrink-0">
                      {i + 1}
                    </div>
                    {i < prepTimeline.length - 1 && <div className="w-0.5 h-full bg-[#E2E8F0] my-1" />}
                  </div>
                  <div className="pb-4">
                    <p className="text-sm font-semibold text-[#0F172A] mb-1">{phase.when}</p>
                    <ul className="space-y-1">
                      {phase.tasks.map((task, j) => (
                        <li key={j} className="flex items-start gap-1.5 text-xs text-[#475569]">
                          <Check className="w-3.5 h-3.5 text-[#10B981] mt-0.5 shrink-0" />
                          {task}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Self-Assessment */}
        <Card className="border-[#E2E8F0]">
          <CardContent className="p-6">
            <h2 className="text-lg font-bold text-[#0F172A] mb-4">Self-Assessment Rubric</h2>
            <p className="text-sm text-[#475569] mb-4">Rate yourself 1-5 on each dimension after mock interviews:</p>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { criterion: 'Clarity of Communication', desc: 'Speaking clearly and concisely' },
                { criterion: 'Relevance of Content', desc: 'Answering what was asked' },
                { criterion: 'Structure of Response', desc: 'Logical flow and organization' },
                { criterion: 'Empathy & Professionalism', desc: 'Showing care and maturity' },
                { criterion: 'Self-Awareness', desc: 'Knowing strengths and weaknesses' },
                { criterion: 'Critical Thinking', desc: 'Analyzing scenarios logically' },
              ].map((item) => (
                <div key={item.criterion} className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                  <p className="text-sm font-medium text-[#0F172A]">{item.criterion}</p>
                  <p className="text-xs text-[#475569]">{item.desc}</p>
                  <div className="flex gap-1 mt-2">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <div key={n} className="w-6 h-6 rounded border border-[#E2E8F0] flex items-center justify-center text-[10px] text-[#94A3B8]">{n}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
