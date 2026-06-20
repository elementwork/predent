import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Construction } from 'lucide-react';
import { Button } from '@/components/ui/button';

const comingSoonFeatures: Record<string, { title: string; description: string; step: string }> = {
  '/pat-academy': {
    title: 'PAT Academy',
    description: 'Interactive practice engine with 300+ questions, 3D models, and unlimited generators.',
    step: 'Step 4 & 8',
  },
  '/dat-academy': {
    title: 'DAT Academy',
    description: 'Biology, Chemistry, and Reading Comprehension modules with flashcards and study schedules.',
    step: 'Step 10',
  },
  '/guides/dat-study-schedules': {
    title: 'DAT Study Schedules',
    description: 'Personalized 4, 8, 12, and 16-week study schedules.',
    step: 'Step 3',
  },
  '/guides/canadian-dat-guide': {
    title: 'Canadian DAT Guide',
    description: 'The complete guide to the Canadian Dental Aptitude Test.',
    step: 'Step 3',
  },
  '/guides/pat-keyholes': {
    title: 'PAT Keyhole Strategy Guide',
    description: 'Master the keyhole section with proven strategies.',
    step: 'Step 3',
  },
  '/guides/casper-dental-school': {
    title: 'CASPer Preparation Guide',
    description: 'Everything you need to know about the CASPer test.',
    step: 'Step 3',
  },
  '/guides/dental-school-interview': {
    title: 'Interview Preparation',
    description: 'MMI and Panel interview preparation guides.',
    step: 'Step 3',
  },
  '/tools/gpa-calculator': {
    title: 'GPA Calculator',
    description: 'Calculate your GPA and see where you stand.',
    step: 'Step 3',
  },
  '/tools/competitiveness': {
    title: 'Competitiveness Calculator',
    description: 'Calculate your chances at each Canadian dental school.',
    step: 'Step 12',
  },
  '/community': {
    title: 'Community Hub',
    description: 'Join the community of pre-dental students.',
    step: 'Step 13',
  },
  '/compare': {
    title: 'School Comparison Tool',
    description: 'Compare dental schools side-by-side.',
    step: 'Step 2',
  },
};

export default function PlaceholderPage() {
  const location = useLocation();
  const info = comingSoonFeatures[location.pathname] || {
    title: 'Coming Soon',
    description: 'This feature is under development.',
    step: 'Upcoming',
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-6">
        <div className="w-16 h-16 rounded-2xl bg-[#F1F5F9] flex items-center justify-center mx-auto mb-6">
          <Construction className="w-8 h-8 text-[#2563EB]" />
        </div>
        <h1 className="text-2xl font-bold text-[#0F172A] mb-2">{info.title}</h1>
        <p className="text-[#475569] mb-2">{info.description}</p>
        <p className="text-xs text-[#94A3B8] mb-8 uppercase tracking-wider font-medium">
          Coming in {info.step}
        </p>
        <Button asChild className="bg-[#2563EB] hover:bg-[#1D4ED8]">
          <Link to="/" className="inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </Button>
      </div>
    </main>
  );
}
