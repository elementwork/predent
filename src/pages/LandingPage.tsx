import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
  BookOpen, Users, BarChart3, Brain,
  Target, School, Check, X, Star, Sparkles,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

/* ─── Animation Wrapper ─── */
function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
    >
      {children}
    </motion.div>
  );
}

/* ─── Animated Counter ─── */
function AnimatedCounter({ end, suffix = '', duration = 2000 }: { end: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, end, duration]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

/* ─── Hero Section ─── */
function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden gradient-hero">
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="section-container max-w-7xl mx-auto w-full py-32 lg:py-40">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/80 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4 text-[#F59E0B]" />
              #1 Platform for Canadian Dental School Admissions
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] mb-6">
              The Operating System for{' '}
              <span className="text-gradient bg-gradient-to-r from-[#60A5FA] to-[#34D399] bg-clip-text text-transparent">
                Canadian Pre-Dental Students
              </span>
            </h1>
            <p className="text-lg text-white/70 max-w-lg mb-8 leading-relaxed">
              Everything you need to conquer the DAT, master the PAT, and get accepted into Canadian dental school — all in one platform built for your success.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold px-8 h-12 text-base"
                onClick={() => alert('Authentication coming in Step 5!')}
              >
                Get Started Free
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 font-semibold px-8 h-12 text-base"
                asChild
              >
                <Link to="/schools">Explore Schools</Link>
              </Button>
            </div>
            <div className="flex items-center gap-6 mt-8">
              <div className="flex -space-x-3">
                {['/testimonial-1.jpg', '/testimonial-2.jpg', '/testimonial-3.jpg'].map((src, i) => (
                  <img key={i} src={src} alt="" className="w-10 h-10 rounded-full border-2 border-[#0F172A] object-cover" />
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-4 h-4 fill-[#F59E0B] text-[#F59E0B]" />
                  ))}
                </div>
                <p className="text-xs text-white/60 mt-1">Trusted by 2,000+ pre-dental students</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="relative">
              <img
                src="/hero-illustration.jpg"
                alt="PreDent Canada Platform"
                className="rounded-2xl shadow-2xl border border-white/10"
              />
              {/* Floating stat cards */}
              <motion.div
                className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg p-3 border border-[#E2E8F0]"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <p className="text-xs text-[#475569]">Predicted PAT Score</p>
                <p className="text-2xl font-bold text-[#2563EB]">22</p>
              </motion.div>
              <motion.div
                className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg p-3 border border-[#E2E8F0]"
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 2.5, repeat: Infinity }}
              >
                <p className="text-xs text-[#475569]">Study Streak</p>
                <div className="flex items-center gap-1">
                  <p className="text-2xl font-bold text-[#10B981]">12</p>
                  <span className="text-sm">days</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Wave divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 80V40C240 80 480 0 720 0C960 0 1200 80 1440 40V80H0Z" fill="white" />
        </svg>
      </div>
    </section>
  );
}

/* ─── Value Proposition Section ─── */
const pillars = [
  {
    icon: Brain,
    title: 'PAT Academy',
    description: '300+ practice questions across all 6 PAT categories with 3D models, generators, and AI-powered explanations.',
    color: '#2563EB',
    bgColor: '#EFF6FF',
  },
  {
    icon: BookOpen,
    title: 'DAT Academy',
    description: 'Complete Biology, Chemistry, and Reading Comprehension modules with flashcards, videos, and practice tests.',
    color: '#10B981',
    bgColor: '#ECFDF5',
  },
  {
    icon: School,
    title: 'School Hub',
    description: 'Detailed profiles for all 10 Canadian dental schools with admission stats, requirements, and 5-year trends.',
    color: '#6366F1',
    bgColor: '#EEF2FF',
  },
  {
    icon: Target,
    title: 'Application Planner',
    description: 'Kanban task manager, document vault, deadline alerts, and calendar to keep your application on track.',
    color: '#F59E0B',
    bgColor: '#FFFBEB',
  },
  {
    icon: Users,
    title: 'Community Intelligence',
    description: 'Aggregated stats from Reddit, interview experiences, DAT breakdowns, and acceptance posts from real students.',
    color: '#14B8A6',
    bgColor: '#F0FDFA',
  },
  {
    icon: BarChart3,
    title: 'Analytics',
    description: 'Predict your PAT score, track your progress, identify weaknesses, and get personalized study recommendations.',
    color: '#8B5CF6',
    bgColor: '#F5F3FF',
  },
];

function ValuePropSection() {
  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="section-container max-w-7xl mx-auto">
        <FadeIn>
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-[#2563EB] uppercase tracking-wider mb-2">Why PreDent Canada</p>
            <h2 className="text-3xl lg:text-4xl font-bold text-[#0F172A] mb-4">Everything You Need, One Platform</h2>
            <p className="text-[#475569] max-w-2xl mx-auto">
              Stop jumping between 10 different resources. We built the platform we wished we had when applying to dental school.
            </p>
          </div>
        </FadeIn>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {pillars.map((pillar, i) => (
            <FadeIn key={pillar.title} delay={i * 0.1}>
              <Card className="group card-hover border-[#E2E8F0] cursor-pointer h-full">
                <CardContent className="p-6">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                    style={{ backgroundColor: pillar.bgColor }}
                  >
                    <pillar.icon className="w-6 h-6" style={{ color: pillar.color }} />
                  </div>
                  <h3 className="text-lg font-semibold text-[#0F172A] mb-2">{pillar.title}</h3>
                  <p className="text-sm text-[#475569] leading-relaxed">{pillar.description}</p>
                </CardContent>
              </Card>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Social Proof / Stats Section ─── */
const stats = [
  { value: 900, suffix: '+', label: 'Applications per UofT seat', sub: 'Competition is fierce. Prepare smarter.' },
  { value: 10, suffix: '', label: 'Canadian Dental Schools', sub: 'Comprehensive profiles and data for all.' },
  { value: 5000, suffix: '+', label: 'PAT Questions Available', sub: 'Including unlimited AI-generated variations.' },
  { value: 96, suffix: '%', label: 'User Satisfaction', sub: 'Students love our platform.' },
];

function StatsSection() {
  return (
    <section className="py-20 lg:py-28 bg-[#F8FAFC]">
      <div className="section-container max-w-7xl mx-auto">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <FadeIn key={stat.label} delay={i * 0.1}>
              <div className="text-center">
                <p className="text-4xl lg:text-5xl font-extrabold text-[#2563EB] mb-2">
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                </p>
                <p className="text-sm font-semibold text-[#0F172A] mb-1">{stat.label}</p>
                <p className="text-xs text-[#475569]">{stat.sub}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Competitive Comparison Section ─── */
const comparisonFeatures = [
  { name: 'Canadian DAT Focus', predent: true, crusher: true, bootcamp: false },
  { name: 'School Database', predent: true, crusher: false, bootcamp: false },
  { name: 'Admissions Tools', predent: true, crusher: false, bootcamp: false },
  { name: 'Interview Preparation', predent: true, crusher: false, bootcamp: false },
  { name: 'Application Tracking', predent: true, crusher: false, bootcamp: false },
  { name: 'AI-Powered Features', predent: true, crusher: false, bootcamp: false },
  { name: 'PAT Generators (All 6)', predent: true, crusher: true, bootcamp: false },
  { name: '3D PAT Models', predent: true, crusher: true, bootcamp: true },
  { name: 'Community Intelligence', predent: true, crusher: false, bootcamp: false },
  { name: 'Progress Analytics', predent: true, crusher: false, bootcamp: true },
  { name: 'Free Tier Available', predent: true, crusher: false, bootcamp: false },
  { name: 'Price (Starting)', predent: '$0', crusher: '$499', bootcamp: '$519' },
];

function ComparisonSection() {
  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="section-container max-w-5xl mx-auto">
        <FadeIn>
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-[#2563EB] uppercase tracking-wider mb-2">Competitive Comparison</p>
            <h2 className="text-3xl lg:text-4xl font-bold text-[#0F172A] mb-4">Why Students Choose PreDent Canada</h2>
            <p className="text-[#475569] max-w-2xl mx-auto">
              The only platform built exclusively for Canadian dental school admissions.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={0.2}>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-[#E2E8F0]">
                  <th className="text-left py-4 px-4 text-sm font-semibold text-[#0F172A]">Feature</th>
                  <th className="text-center py-4 px-4">
                    <div className="flex flex-col items-center">
                      <span className="text-sm font-bold text-[#2563EB]">PreDent Canada</span>
                    </div>
                  </th>
                  <th className="text-center py-4 px-4 text-sm font-semibold text-[#475569]">DATCrusher</th>
                  <th className="text-center py-4 px-4 text-sm font-semibold text-[#475569]">DAT Bootcamp</th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((feature, i) => (
                  <tr key={i} className="border-b border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors">
                    <td className="py-3.5 px-4 text-sm text-[#0F172A]">{feature.name}</td>
                    <td className="text-center py-3.5 px-4">
                      {typeof feature.predent === 'boolean' ? (
                        feature.predent ? (
                          <Check className="w-5 h-5 text-[#10B981] mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-[#EF4444] mx-auto" />
                        )
                      ) : (
                        <span className="text-sm font-bold text-[#10B981]">{feature.predent}</span>
                      )}
                    </td>
                    <td className="text-center py-3.5 px-4">
                      {typeof feature.crusher === 'boolean' ? (
                        feature.crusher ? (
                          <Check className="w-5 h-5 text-[#10B981] mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-[#CBD5E1] mx-auto" />
                        )
                      ) : (
                        <span className="text-sm text-[#475569]">{feature.crusher}</span>
                      )}
                    </td>
                    <td className="text-center py-3.5 px-4">
                      {typeof feature.bootcamp === 'boolean' ? (
                        feature.bootcamp ? (
                          <Check className="w-5 h-5 text-[#10B981] mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-[#CBD5E1] mx-auto" />
                        )
                      ) : (
                        <span className="text-sm text-[#475569]">{feature.bootcamp}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

/* ─── Testimonials Section ─── */
const testimonials = [
  {
    name: 'Priya Sharma',
    program: 'UofT Dentistry DDS 2026',
    image: '/testimonial-1.jpg',
    quote: 'PreDent Canada was a game-changer for my PAT preparation. The generators gave me unlimited practice, and the 3D models helped me visualize cube counting like never before. Scored a 24 on PAT!',
    score: 'PAT: 24 | AA: 23',
  },
  {
    name: 'Jason Kim',
    program: 'UBC DMD 2025',
    image: '/testimonial-2.jpg',
    quote: 'The school comparison tool saved me hours of research. Being able to see all admission requirements side-by-side helped me focus my efforts on schools where I was most competitive.',
    score: 'PAT: 22 | AA: 24',
  },
  {
    name: 'Emily Watson',
    program: 'Western Schulich DDS 2026',
    image: '/testimonial-3.jpg',
    quote: 'I used the application planner to track every deadline and document. The task manager kept me organized through the most stressful application season of my life. Highly recommend!',
    score: 'PAT: 21 | AA: 22',
  },
];

function TestimonialsSection() {
  return (
    <section className="py-20 lg:py-28 bg-[#F8FAFC]">
      <div className="section-container max-w-7xl mx-auto">
        <FadeIn>
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-[#2563EB] uppercase tracking-wider mb-2">Success Stories</p>
            <h2 className="text-3xl lg:text-4xl font-bold text-[#0F172A] mb-4">Students Who Made It</h2>
            <p className="text-[#475569] max-w-2xl mx-auto">
              Join thousands of pre-dental students who achieved their dream of getting into Canadian dental school.
            </p>
          </div>
        </FadeIn>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <FadeIn key={t.name} delay={i * 0.15}>
              <Card className="card-hover border-[#E2E8F0] h-full">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="flex items-center gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-4 h-4 fill-[#F59E0B] text-[#F59E0B]" />
                    ))}
                  </div>
                  <p className="text-sm text-[#475569] leading-relaxed mb-6 flex-1">&ldquo;{t.quote}&rdquo;</p>
                  <div className="flex items-center gap-3 pt-4 border-t border-[#E2E8F0]">
                    <img src={t.image} alt={t.name} className="w-12 h-12 rounded-full object-cover" />
                    <div>
                      <p className="text-sm font-semibold text-[#0F172A]">{t.name}</p>
                      <p className="text-xs text-[#475569]">{t.program}</p>
                      <p className="text-xs font-medium text-[#10B981]">{t.score}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Pricing Section ─── */
const pricingTiers = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for exploring and getting started.',
    features: [
      'Full school database access',
      'Basic GPA calculator',
      '500 PAT practice questions',
      '10 keyhole generators/day',
      'Limited 3D models',
      '1 free mock exam',
      'Basic error analysis',
      'Application tracker (3 schools)',
      'Read-only community content',
    ],
    cta: 'Start Free',
    ctaStyle: 'outline' as const,
    popular: false,
  },
  {
    name: 'Premium',
    price: '$29',
    period: '/month',
    description: 'Everything you need for serious DAT prep.',
    features: [
      'Unlimited PAT question bank',
      'All 6 PAT generators (unlimited)',
      'Full 3D model access',
      'Unlimited mock exams',
      'Advanced AI error analysis',
      'Personalized study schedule',
      'Unlimited application tracker',
      'Full interview question bank',
      'Multi-school competitiveness calc',
      'AI tutor (basic)',
      'Progress analytics',
      'Anki export',
      'Priority email support',
    ],
    cta: 'Get Premium',
    ctaStyle: 'filled' as const,
    popular: true,
  },
  {
    name: 'Premium Plus',
    price: '$149',
    period: 'one-time',
    description: 'Lifetime access + personal coaching.',
    features: [
      'Everything in Premium',
      '1 personal statement review',
      '1-on-1 admissions consultation',
      'Advanced AI tutor',
      'Application document review',
      'Lifetime access (no recurring)',
    ],
    cta: 'Get Premium Plus',
    ctaStyle: 'outline' as const,
    popular: false,
  },
];

function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="section-container max-w-7xl mx-auto">
        <FadeIn>
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-[#2563EB] uppercase tracking-wider mb-2">Pricing</p>
            <h2 className="text-3xl lg:text-4xl font-bold text-[#0F172A] mb-4">Invest in Your Dental Future</h2>
            <p className="text-[#475569] max-w-2xl mx-auto mb-8">
              Start free, upgrade when you are ready. No hidden fees, cancel anytime.
            </p>

            {/* Toggle */}
            <div className="inline-flex items-center gap-3 p-1 rounded-lg bg-[#F1F5F9]">
              <button
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${!isAnnual ? 'bg-white text-[#0F172A] shadow-sm' : 'text-[#475569]'}`}
                onClick={() => setIsAnnual(false)}
              >
                Monthly
              </button>
              <button
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-1.5 ${isAnnual ? 'bg-white text-[#0F172A] shadow-sm' : 'text-[#475569]'}`}
                onClick={() => setIsAnnual(true)}
              >
                Annual
                <span className="px-1.5 py-0.5 rounded bg-[#10B981] text-white text-[10px] font-bold">SAVE 28%</span>
              </button>
            </div>
          </div>
        </FadeIn>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {pricingTiers.map((tier, i) => (
            <FadeIn key={tier.name} delay={i * 0.1}>
              <Card
                className={`relative h-full ${
                  tier.popular
                    ? 'border-2 border-[#2563EB] shadow-lg shadow-[#2563EB]/10'
                    : 'border-[#E2E8F0]'
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#2563EB] text-white text-xs font-bold rounded-full">
                    Most Popular
                  </div>
                )}
                <CardContent className="p-6 lg:p-8 flex flex-col h-full">
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-[#0F172A] mb-1">{tier.name}</h3>
                    <p className="text-xs text-[#475569] mb-4">{tier.description}</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-extrabold text-[#0F172A]">
                        {tier.name === 'Premium' && isAnnual ? '$249' : tier.price}
                      </span>
                      <span className="text-sm text-[#475569]">
                        {tier.name === 'Premium' && isAnnual ? '/year' : tier.period}
                      </span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-8 flex-1">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-[#10B981] mt-0.5 shrink-0" />
                        <span className="text-sm text-[#475569]">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className={`w-full h-11 font-semibold ${
                      tier.popular
                        ? 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white'
                        : 'border-[#E2E8F0] text-[#0F172A] hover:bg-[#F8FAFC]'
                    }`}
                    variant={tier.popular ? 'default' : 'outline'}
                    onClick={() => alert('Payment integration coming in Step 6!')}
                  >
                    {tier.cta}
                  </Button>
                </CardContent>
              </Card>
            </FadeIn>
          ))}
        </div>

        {/* Guarantee badge */}
        <FadeIn delay={0.4}>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
            <Shield className="w-8 h-8 text-[#10B981]" />
            <div className="text-center sm:text-left">
              <p className="text-sm font-semibold text-[#0F172A]">Higher Score Guarantee</p>
              <p className="text-xs text-[#475569]">If your official DAT score doesn&apos;t improve after completing our program, we&apos;ll refund your Premium subscription in full.</p>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

/* ─── FAQ Section ─── */
const faqs = [
  {
    question: 'Is PreDent Canada only for Canadian dental schools?',
    answer: 'Yes, PreDent Canada is specifically designed for the Canadian Dental Aptitude Test (DAT) and Canadian dental school admissions. Our content, school database, and tools are tailored to the unique requirements of Canadian schools like UofT, UBC, McGill, and others.',
  },
  {
    question: 'How is the Canadian DAT different from the American DAT?',
    answer: 'The Canadian DAT does NOT include Organic Chemistry or Quantitative Reasoning. It focuses on Biology (40 questions), Chemistry (30 questions), PAT (90 questions), and Reading Comprehension (50 questions). Our platform is built specifically for this format.',
  },
  {
    question: 'Can I really use the platform for free?',
    answer: 'Absolutely! Our Free tier gives you access to the full school database, 500 PAT practice questions, basic GPA calculator, 10 keyhole generators per day, and 1 mock exam. Upgrade to Premium when you are ready for unlimited access.',
  },
  {
    question: 'How do the PAT generators work?',
    answer: 'Our procedural generation algorithms create unique, valid PAT questions on-demand. Each generated question is verified to have exactly one correct answer. Premium members get unlimited access to all 6 category generators.',
  },
  {
    question: 'What is the Higher Score Guarantee?',
    answer: 'If you complete our Premium program and your official DAT score does not improve compared to your first mock exam baseline, we will refund your Premium subscription in full. No questions asked.',
  },
];

function FAQSection() {
  return (
    <section className="py-20 lg:py-28 bg-[#F8FAFC]">
      <div className="section-container max-w-3xl mx-auto">
        <FadeIn>
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-[#2563EB] uppercase tracking-wider mb-2">FAQ</p>
            <h2 className="text-3xl lg:text-4xl font-bold text-[#0F172A] mb-4">Frequently Asked Questions</h2>
          </div>
        </FadeIn>

        <FadeIn delay={0.2}>
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="bg-white rounded-lg border border-[#E2E8F0] px-6">
                <AccordionTrigger className="text-left text-sm font-semibold text-[#0F172A] hover:text-[#2563EB] py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-[#475569] leading-relaxed pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </FadeIn>
      </div>
    </section>
  );
}

/* ─── CTA Section ─── */
function CTASection() {
  return (
    <section className="py-20 lg:py-28 gradient-blue">
      <div className="section-container max-w-4xl mx-auto text-center">
        <FadeIn>
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Ready to Start Your Dental School Journey?
          </h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            Join 2,000+ pre-dental students using PreDent Canada to prepare smarter, track their progress, and get accepted into dental school.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-[#2563EB] hover:bg-white/90 font-semibold px-8 h-12 text-base"
              onClick={() => alert('Authentication coming in Step 5!')}
            >
              Create Free Account
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 font-semibold px-8 h-12 text-base"
              asChild
            >
              <Link to="/schools">Explore Schools</Link>
            </Button>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

/* ─── Main Landing Page ─── */
export default function LandingPage() {
  return (
    <main>
      <HeroSection />
      <ValuePropSection />
      <StatsSection />
      <ComparisonSection />
      <TestimonialsSection />
      <PricingSection />
      <FAQSection />
      <CTASection />
    </main>
  );
}
