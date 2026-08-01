import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { usePageTitle } from "@/hooks/usePageTitle";
import {
  BookOpen,
  Users,
  BarChart3,
  Brain,
  Target,
  School,
  Check,
  X,
  Sparkles,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

/* ─── Animation Wrapper ─── */
function FadeIn({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
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
function AnimatedCounter({
  end,
  suffix = "",
  duration = 2000,
}: {
  end: number;
  suffix?: string;
  duration?: number;
}) {
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

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

/* ─── Hero Section ─── */
const particles = Array.from({ length: 8 }, () => ({
  left: Math.random() * 100,
  top: Math.random() * 100,
  duration: 3 + Math.random() * 2,
  delay: Math.random() * 2,
}));

function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-[var(--page-bg)] to-[var(--page-surface)]">
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((p, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-[var(--text-primary)]/10 rounded-full"
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
            }}
            whileInView={{
              y: [0, -30, 0],
              opacity: [0.2, 0.6, 0.2],
            }}
            viewport={{ once: false, amount: 0 }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
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
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--page-muted)] border border-[var(--border-color)] text-[var(--text-secondary)] text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4 text-[#F59E0B]" />
              DAT Prep & School Research for Canadian Pre-Dental Students
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[var(--text-primary)] leading-[1.1] mb-6">
              Canadian DAT Prep Built for{" "}
              <span className="text-gradient bg-gradient-to-r from-[#2563EB] to-[#10B981] bg-clip-text text-transparent">
                Dental School Admission
              </span>
            </h1>
            <p className="text-lg text-[var(--text-secondary)] max-w-lg mb-8 leading-relaxed">
              Practice the Canadian DAT, train your PAT skills, and track every
              application deadline — all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold px-8 h-12 text-base"
                asChild
              >
                <Link to="/login">Get Started Free</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--page-muted)] font-semibold px-8 h-12 text-base"
                asChild
              >
                <Link to="/schools">Explore Schools</Link>
              </Button>
            </div>
            <div className="flex items-center gap-6 mt-8">
              <div className="flex -space-x-3">
                {[
                  "/testimonial-1.jpg",
                  "/testimonial-2.jpg",
                  "/testimonial-3.jpg",
                ].map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt=""
                    width="40"
                    height="40"
                    className="w-10 h-10 rounded-full border-2 border-[var(--page-bg)] object-cover"
                  />
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1 text-[#F59E0B]">
                  ★★★★★
                </div>
                <p className="text-xs text-[var(--text-tertiary)] mt-1">
                  Built exclusively for Canadian dental school admissions
                </p>
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
                width="720"
                height="416"
                loading="lazy"
                className="rounded-2xl shadow-2xl border border-[var(--border-color)]"
              />
              {/* Floating stat cards */}
              <motion.div
                className="absolute -bottom-4 -left-4 bg-[var(--page-surface)] rounded-xl shadow-lg p-3 border border-[var(--border-color)]"
                whileInView={{ y: [0, -8, 0] }}
                viewport={{ once: false, amount: 0 }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <p className="text-xs text-[var(--text-secondary)]">
                  Predicted PAT Score
                </p>
                <p className="text-2xl font-bold text-[#2563EB]">22</p>
              </motion.div>
              <motion.div
                className="absolute -top-4 -right-4 bg-[var(--page-surface)] rounded-xl shadow-lg p-3 border border-[var(--border-color)]"
                whileInView={{ y: [0, 8, 0] }}
                viewport={{ once: false, amount: 0 }}
                transition={{ duration: 2.5, repeat: Infinity }}
              >
                <p className="text-xs text-[var(--text-secondary)]">
                  Study Streak
                </p>
                <div className="flex items-center gap-1">
                  <p className="text-2xl font-bold text-[#10B981]">12</p>
                  <span className="text-sm text-[var(--text-primary)]">
                    days
                  </span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Wave divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1440 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0 80V40C240 80 480 0 720 0C960 0 1200 80 1440 40V80H0Z"
            fill="var(--page-surface)"
          />
        </svg>
      </div>
    </section>
  );
}

/* ─── Value Proposition Section ─── */
const pillars = [
  {
    icon: Brain,
    title: "PAT Academy",
    description:
      "360+ practice questions across all 6 PAT categories with interactive generators and tiered explanations.",
    color: "#2563EB",
    bgColor: "rgba(37, 99, 235, 0.1)",
  },
  {
    icon: BookOpen,
    title: "DAT Academy",
    description:
      "Biology, Chemistry, and Reading Comprehension modules with flashcards and practice questions.",
    color: "#10B981",
    bgColor: "rgba(16, 185, 129, 0.1)",
  },
  {
    icon: School,
    title: "School Hub",
    description:
      "Detailed profiles for all 10 Canadian dental schools with admission stats, requirements, and 5-year trends.",
    color: "#6366F1",
    bgColor: "rgba(99, 102, 241, 0.1)",
  },
  {
    icon: Target,
    title: "Application Planner",
    description:
      "Kanban task manager with deadline alerts, calendar view, and scheduling suggestions to keep your application on track.",
    color: "#F59E0B",
    bgColor: "rgba(245, 158, 11, 0.1)",
  },
  {
    icon: Users,
    title: "Student Community",
    description:
      "Admission results, interview experiences, DAT breakdowns, and discussion posts from real students.",
    color: "#14B8A6",
    bgColor: "rgba(20, 184, 166, 0.1)",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    description:
      "Predict your PAT score, track your progress, and see exactly which categories need more practice.",
    color: "#8B5CF6",
    bgColor: "rgba(139, 92, 246, 0.1)",
  },
];

function ValuePropSection() {
  return (
    <section className="py-20 lg:py-28 bg-[var(--page-surface)]">
      <div className="section-container max-w-7xl mx-auto">
        <FadeIn>
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-[#2563EB] uppercase tracking-wider mb-2">
              Why PreDent Canada
            </p>
            <h2 className="text-3xl lg:text-4xl font-bold text-[var(--text-primary)] mb-4">
              Everything You Need, One Platform
            </h2>
            <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">
              Stop jumping between 10 different resources. We built the platform
              we wished we had when applying to dental school.
            </p>
          </div>
        </FadeIn>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {pillars.map((pillar, i) => (
            <FadeIn key={pillar.title} delay={i * 0.1}>
              <Card className="group card-hover border-[var(--border-color)] cursor-pointer h-full bg-[var(--page-surface)]">
                <CardContent className="p-6">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                    style={{ backgroundColor: pillar.bgColor }}
                  >
                    <pillar.icon
                      className="w-6 h-6"
                      style={{ color: pillar.color }}
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                    {pillar.title}
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                    {pillar.description}
                  </p>
                </CardContent>
              </Card>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── How It Works Section ─── */
const howItWorksSteps = [
  {
    step: "01",
    title: "Create your free account",
    description:
      "Sign in with Google and set up your profile in under a minute.",
  },
  {
    step: "02",
    title: "Practice with real questions",
    description:
      "Train with 360+ PAT questions, interactive generators, and DAT Biology, Chemistry, and Reading practice.",
  },
  {
    step: "03",
    title: "Track and apply smarter",
    description:
      "Monitor your progress, research every Canadian dental school, and manage application deadlines in one place.",
  },
];

function HowItWorksSection() {
  return (
    <section className="py-20 lg:py-28 bg-[var(--page-bg)]">
      <div className="section-container max-w-7xl mx-auto">
        <FadeIn>
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-[#2563EB] uppercase tracking-wider mb-2">
              How It Works
            </p>
            <h2 className="text-3xl lg:text-4xl font-bold text-[var(--text-primary)] mb-4">
              Start Preparing in Three Steps
            </h2>
          </div>
        </FadeIn>

        <div className="grid md:grid-cols-3 gap-6">
          {howItWorksSteps.map((item, i) => (
            <FadeIn key={item.title} delay={i * 0.1}>
              <Card className="h-full bg-[var(--page-surface)] border-[var(--border-color)]">
                <CardContent className="p-6">
                  <p className="text-3xl font-extrabold text-[#2563EB]/20 mb-4">
                    {item.step}
                  </p>
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                    {item.description}
                  </p>
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
  {
    value: 900,
    suffix: "+",
    label: "Applications per UofT seat",
    sub: "Competition is fierce. Prepare smarter.",
  },
  {
    value: 10,
    suffix: "",
    label: "Canadian Dental Schools",
    sub: "Comprehensive profiles and data for all.",
  },
  {
    value: 360,
    suffix: "+",
    label: "PAT Practice Questions",
    sub: "Curated across all 6 PAT categories.",
  },
  {
    value: 6,
    suffix: "",
    label: "PAT Categories",
    sub: "Keyholes, TFE, Angle Ranking, Hole Punching, Cube Counting, Pattern Folding.",
  },
];

function StatsSection() {
  return (
    <section className="py-20 lg:py-28 bg-[var(--page-bg)]">
      <div className="section-container max-w-7xl mx-auto">
        <FadeIn>
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-[#2563EB] uppercase tracking-wider mb-2">
              By the Numbers
            </p>
            <h2 className="text-3xl lg:text-4xl font-bold text-[var(--text-primary)]">
              The Canadian Dental School Landscape
            </h2>
          </div>
        </FadeIn>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <FadeIn key={stat.label} delay={i * 0.1}>
              <div className="text-center">
                <p className="text-4xl lg:text-5xl font-extrabold text-[#2563EB] mb-2">
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                </p>
                <p className="text-sm font-semibold text-[var(--text-primary)] mb-1">
                  {stat.label}
                </p>
                <p className="text-xs text-[var(--text-secondary)]">
                  {stat.sub}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Sample Question Section ─── */
function SampleQuestionSection() {
  return (
    <section className="py-20 lg:py-28 bg-[var(--page-surface)]">
      <div className="section-container max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <FadeIn>
            <div>
              <p className="text-sm font-semibold text-[#2563EB] uppercase tracking-wider mb-2">
                Try It Free
              </p>
              <h2 className="text-3xl lg:text-4xl font-bold text-[var(--text-primary)] mb-4">
                See What PAT Practice Looks Like
              </h2>
              <p className="text-[var(--text-secondary)] mb-6 leading-relaxed">
                Every Premium plan includes unlimited access to questions like
                this one. Free users can try the Angle Ranking generator and
                browse the full school database.
              </p>
              <Button
                size="lg"
                className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold px-8 h-12 text-base"
                asChild
              >
                <Link to="/pat-academy/practice">Try a Free PAT Question</Link>
              </Button>
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <Card className="bg-[var(--page-bg)] border-[var(--border-color)]">
              <CardContent className="p-6">
                <p className="text-xs font-semibold text-[#2563EB] uppercase tracking-wider mb-4">
                  Angle Ranking — Sample
                </p>
                <p className="text-sm text-[var(--text-secondary)] mb-6">
                  Rank the four angles below from smallest to largest.
                </p>
                <div className="flex justify-around items-center mb-6">
                  {["A", "B", "C", "D"].map(label => (
                    <div key={label} className="text-center">
                      <div className="w-16 h-16 mx-auto mb-2 rounded-lg bg-[var(--page-muted)] flex items-center justify-center">
                        <span className="text-2xl font-bold text-[var(--text-primary)]">
                          ∠
                        </span>
                      </div>
                      <span className="text-xs font-medium text-[var(--text-secondary)]">
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {["A", "B", "C", "D"].map(label => (
                    <button
                      key={label}
                      className="py-2 rounded-lg border border-[var(--border-color)] text-sm font-medium text-[var(--text-secondary)] hover:border-[#2563EB] hover:text-[#2563EB] transition-colors"
                      disabled
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-[var(--text-tertiary)] mt-4 text-center">
                  Sign up free to answer questions and track your progress.
                </p>
              </CardContent>
            </Card>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

/* ─── Competitive Comparison Section ─── */
const comparisonFeatures = [
  { name: "Canadian DAT Focus", predent: true, crusher: true, bootcamp: false },
  { name: "School Database", predent: true, crusher: false, bootcamp: false },
  { name: "Admissions Tools", predent: true, crusher: false, bootcamp: false },
  {
    name: "Interview Preparation",
    predent: true,
    crusher: false,
    bootcamp: false,
  },
  {
    name: "Application Tracking",
    predent: true,
    crusher: false,
    bootcamp: false,
  },
  {
    name: "AI-Powered Features",
    predent: true,
    crusher: false,
    bootcamp: false,
  },
  {
    name: "PAT Generators (All 6)",
    predent: true,
    crusher: true,
    bootcamp: false,
  },
  {
    name: "Interactive PAT Diagrams",
    predent: true,
    crusher: true,
    bootcamp: true,
  },
  {
    name: "Student Community",
    predent: true,
    crusher: false,
    bootcamp: false,
  },
  { name: "Progress Analytics", predent: true, crusher: false, bootcamp: true },
  {
    name: "Free Tier Available",
    predent: true,
    crusher: false,
    bootcamp: false,
  },
  {
    name: "Price (Starting)",
    predent: "$0",
    crusher: "$499",
    bootcamp: "$519",
  },
];

function ComparisonSection() {
  return (
    <section className="py-20 lg:py-28 bg-[var(--page-surface)]">
      <div className="section-container max-w-7xl mx-auto">
        <FadeIn>
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-[#2563EB] uppercase tracking-wider mb-2">
              Competitive Comparison
            </p>
            <h2 className="text-3xl lg:text-4xl font-bold text-[var(--text-primary)] mb-4">
              Why Students Choose PreDent Canada
            </h2>
            <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">
              The only platform built exclusively for Canadian dental school
              admissions.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={0.2}>
          {/* Mobile card view */}
          <div className="md:hidden space-y-3">
            {comparisonFeatures.map((feature, i) => (
              <div
                key={i}
                className="bg-[var(--page-bg)] rounded-lg border border-[var(--border-color)] p-4"
              >
                <p className="text-sm font-semibold text-[var(--text-primary)] mb-3">
                  {feature.name}
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-[#2563EB]">
                      PreDent Canada
                    </span>
                    {typeof feature.predent === "boolean" ? (
                      feature.predent ? (
                        <Check className="w-4 h-4 text-[#10B981]" />
                      ) : (
                        <X className="w-4 h-4 text-[#EF4444]" />
                      )
                    ) : (
                      <span className="text-xs font-bold text-[#10B981]">
                        {feature.predent}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[var(--text-secondary)]">
                      DATCrusher
                    </span>
                    {typeof feature.crusher === "boolean" ? (
                      feature.crusher ? (
                        <Check className="w-4 h-4 text-[#10B981]" />
                      ) : (
                        <X className="w-4 h-4 text-[var(--text-tertiary)]" />
                      )
                    ) : (
                      <span className="text-xs text-[var(--text-secondary)]">
                        {feature.crusher}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[var(--text-secondary)]">
                      DAT Bootcamp
                    </span>
                    {typeof feature.bootcamp === "boolean" ? (
                      feature.bootcamp ? (
                        <Check className="w-4 h-4 text-[#10B981]" />
                      ) : (
                        <X className="w-4 h-4 text-[var(--text-tertiary)]" />
                      )
                    ) : (
                      <span className="text-xs text-[var(--text-secondary)]">
                        {feature.bootcamp}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table view */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-[var(--border-color)]">
                  <th className="text-left py-4 px-4 text-sm font-semibold text-[var(--text-primary)]">
                    Feature
                  </th>
                  <th className="text-center py-4 px-4">
                    <div className="flex flex-col items-center">
                      <span className="text-sm font-bold text-[#2563EB]">
                        PreDent Canada
                      </span>
                    </div>
                  </th>
                  <th className="text-center py-4 px-4 text-sm font-semibold text-[var(--text-secondary)]">
                    DATCrusher
                  </th>
                  <th className="text-center py-4 px-4 text-sm font-semibold text-[var(--text-secondary)]">
                    DAT Bootcamp
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((feature, i) => (
                  <tr
                    key={i}
                    className="border-b border-[var(--border-color)] hover:bg-[var(--page-bg)] transition-colors"
                  >
                    <td className="py-3.5 px-4 text-sm text-[var(--text-primary)]">
                      {feature.name}
                    </td>
                    <td className="text-center py-3.5 px-4">
                      {typeof feature.predent === "boolean" ? (
                        feature.predent ? (
                          <Check className="w-5 h-5 text-[#10B981] mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-[#EF4444] mx-auto" />
                        )
                      ) : (
                        <span className="text-sm font-bold text-[#10B981]">
                          {feature.predent}
                        </span>
                      )}
                    </td>
                    <td className="text-center py-3.5 px-4">
                      {typeof feature.crusher === "boolean" ? (
                        feature.crusher ? (
                          <Check className="w-5 h-5 text-[#10B981] mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-[var(--text-tertiary)] mx-auto" />
                        )
                      ) : (
                        <span className="text-sm text-[var(--text-secondary)]">
                          {feature.crusher}
                        </span>
                      )}
                    </td>
                    <td className="text-center py-3.5 px-4">
                      {typeof feature.bootcamp === "boolean" ? (
                        feature.bootcamp ? (
                          <Check className="w-5 h-5 text-[#10B981] mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-[var(--text-tertiary)] mx-auto" />
                        )
                      ) : (
                        <span className="text-sm text-[var(--text-secondary)]">
                          {feature.bootcamp}
                        </span>
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
const communityHighlights = [
  {
    title: "Share Admission Results",
    description:
      "Post your acceptance, interview invite, waitlist, or rejection with your GPA and DAT scores to help fellow applicants.",
    stat: "Community-driven",
  },
  {
    title: "School-Specific Questions",
    description:
      "Ask questions about any Canadian dental school and get answers from students who applied there.",
    stat: "10 schools covered",
  },
  {
    title: "Study Together",
    description:
      "Discuss DAT prep strategies, interview experiences, and application timelines with other pre-dental students across Canada.",
    stat: "Active community",
  },
];

function TestimonialsSection() {
  return (
    <section className="py-20 lg:py-28 bg-[var(--page-bg)]">
      <div className="section-container max-w-7xl mx-auto">
        <FadeIn>
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-[#2563EB] uppercase tracking-wider mb-2">
              Community
            </p>
            <h2 className="text-3xl lg:text-4xl font-bold text-[var(--text-primary)] mb-4">
              Join the Pre-Dental Community
            </h2>
            <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">
              Connect with other Canadian pre-dental students, share your
              journey, and learn from those who have been through the process.
            </p>
          </div>
        </FadeIn>

        <div className="grid md:grid-cols-3 gap-6">
          {communityHighlights.map((item, i) => (
            <FadeIn key={item.title} delay={i * 0.15}>
              <Card className="card-hover border-[var(--border-color)] h-full bg-[var(--page-surface)]">
                <CardContent className="p-6 flex flex-col h-full">
                  <Badge className="w-fit mb-4 bg-[#2563EB]/10 text-[#2563EB] border-0">
                    {item.stat}
                  </Badge>
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed flex-1">
                    {item.description}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4 border-[var(--border-color)]"
                    asChild
                  >
                    <Link to="/community">Explore Community</Link>
                  </Button>
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
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for exploring and getting started.",
    features: [
      "Full school database access",
      "Basic GPA calculator",
      "PAT practice questions",
      "Angle ranking generator",
      "Application tracker (3 schools)",
      "Read-only community content",
    ],
    cta: "Start Free",
    ctaStyle: "outline" as const,
    popular: false,
    href: "/login",
  },
  {
    name: "Premium",
    price: "$29",
    period: "/month",
    description: "Everything you need for serious DAT prep.",
    features: [
      "Unlimited PAT question bank",
      "All 6 PAT generators (unlimited)",
      "Interactive PAT diagrams",
      "DAT Biology, Chemistry & Reading practice",
      "Study schedule generator",
      "Unlimited application tracker",
      "Full interview question bank",
      "Multi-school competitiveness calculator",
      "Progress analytics",
      "Priority email support",
    ],
    cta: "Get Premium",
    ctaStyle: "filled" as const,
    popular: true,
    href: "/pricing",
  },
  {
    name: "Premium Plus",
    price: "$149",
    period: "one-time",
    description: "Lifetime access + personal coaching.",
    features: [
      "Everything in Premium",
      "Lifetime access (no recurring)",
      "Early access to new features",
    ],
    cta: "Get Premium Plus",
    ctaStyle: "outline" as const,
    popular: false,
    href: "/pricing",
  },
];

function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <section className="py-20 lg:py-28 bg-[var(--page-surface)]">
      <div className="section-container max-w-7xl mx-auto">
        <FadeIn>
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-[#2563EB] uppercase tracking-wider mb-2">
              Pricing
            </p>
            <h2 className="text-3xl lg:text-4xl font-bold text-[var(--text-primary)] mb-4">
              DAT Prep Plans: Free, Premium & Premium Plus
            </h2>
            <p className="text-[var(--text-secondary)] max-w-2xl mx-auto mb-8">
              Start free. Upgrade to unlock unlimited PAT generators, DAT
              practice, and the school competitiveness calculator.
            </p>

            {/* Toggle */}
            <div className="inline-flex items-center gap-3 p-1 rounded-lg bg-[var(--page-muted)]">
              <button
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)] ${!isAnnual ? "bg-[var(--page-surface)] text-[var(--text-primary)] shadow-sm" : "text-[var(--text-secondary)]"}`}
                onClick={() => setIsAnnual(false)}
              >
                Monthly
              </button>
              <button
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-1.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)] ${isAnnual ? "bg-[var(--page-surface)] text-[var(--text-primary)] shadow-sm" : "text-[var(--text-secondary)]"}`}
                onClick={() => setIsAnnual(true)}
              >
                Annual
                <span className="px-1.5 py-0.5 rounded bg-[#10B981] text-white text-[10px] font-bold">
                  SAVE 28%
                </span>
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
                    ? "border-2 border-[#2563EB] shadow-lg shadow-[#2563EB]/10"
                    : "border-[var(--border-color)]"
                } bg-[var(--page-surface)]`}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#2563EB] text-white text-xs font-bold rounded-full">
                    Most Popular
                  </div>
                )}
                <CardContent className="p-6 lg:p-8 flex flex-col h-full">
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">
                      {tier.name}
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)] mb-4">
                      {tier.description}
                    </p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-extrabold text-[var(--text-primary)]">
                        {tier.name === "Premium" && isAnnual
                          ? "$249"
                          : tier.price}
                      </span>
                      <span className="text-sm text-[var(--text-secondary)]">
                        {tier.name === "Premium" && isAnnual
                          ? "/year"
                          : tier.period}
                      </span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-8 flex-1">
                    {tier.features.map(feature => (
                      <li key={feature} className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-[#10B981] mt-0.5 shrink-0" />
                        <span className="text-sm text-[var(--text-secondary)]">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className={`w-full h-11 font-semibold ${
                      tier.popular
                        ? "bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
                        : "border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--page-bg)]"
                    }`}
                    variant={tier.popular ? "default" : "outline"}
                    asChild
                  >
                    <Link to={tier.href}>{tier.cta}</Link>
                  </Button>
                </CardContent>
              </Card>
            </FadeIn>
          ))}
        </div>

        {/* Guarantee badge */}
        <FadeIn delay={0.4}>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 p-4 rounded-xl bg-[var(--page-bg)] border border-[var(--border-color)]">
            <Shield className="w-8 h-8 text-[#10B981]" />
            <div className="text-center sm:text-left">
              <p className="text-sm font-semibold text-[var(--text-primary)]">
                Higher Score Guarantee
              </p>
              <p className="text-xs text-[var(--text-secondary)]">
                Score higher on the DAT or get your money back. See{" "}
                <Link to="/legal/guarantee" className="underline hover:text-[#2563EB]">
                  guarantee terms
                </Link>{" "}
                for details.
              </p>
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
    question: "Is PreDent Canada only for Canadian dental schools?",
    answer:
      "Yes, PreDent Canada is specifically designed for the Canadian Dental Aptitude Test (DAT) and Canadian dental school admissions. Our content, school database, and tools are tailored to the unique requirements of Canadian schools like UofT, UBC, McGill, and others.",
  },
  {
    question: "How is the Canadian DAT different from the American DAT?",
    answer:
      "The Canadian DAT does NOT include Organic Chemistry or Quantitative Reasoning. It focuses on Biology (40 questions), Chemistry (30 questions), PAT (90 questions), and Reading Comprehension (50 questions). Our platform is built specifically for this format.",
  },
  {
    question: "Can I really use the platform for free?",
    answer:
      "Absolutely! Our Free tier gives you access to the full school database, PAT practice questions, the angle ranking generator, the basic GPA calculator, and read-only community content. Upgrade to Premium when you are ready for unlimited access.",
  },
  {
    question: "How do the PAT generators work?",
    answer:
      "Our procedural generators create interactive PAT practice questions on-demand. Each generated question is verified to have exactly one correct answer. Premium members get unlimited access to all 6 category generators.",
  },
  {
    question: "What is the Higher Score Guarantee?",
    answer:
      "If your official DAT score does not improve after using our Premium program, you may be eligible for a full refund. See our guarantee terms for complete conditions.",
  },
];

function FAQSection() {
  return (
    <section className="py-20 lg:py-28 bg-[var(--page-bg)]">
      <div className="section-container max-w-7xl mx-auto">
        <FadeIn>
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-[#2563EB] uppercase tracking-wider mb-2">
              FAQ
            </p>
            <h2 className="text-3xl lg:text-4xl font-bold text-[var(--text-primary)] mb-4">
              Frequently Asked Questions
            </h2>
          </div>
        </FadeIn>

        <FadeIn delay={0.2}>
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="bg-[var(--page-surface)] rounded-lg border border-[var(--border-color)] px-6"
              >
                <AccordionTrigger className="text-left text-sm font-semibold text-[var(--text-primary)] hover:text-[#2563EB] py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-[var(--text-secondary)] leading-relaxed pb-4">
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
    <section className="py-20 lg:py-28 bg-gradient-to-br from-[var(--page-surface)] to-[var(--page-muted)] border-t border-[var(--border-color)]">
      <div className="section-container max-w-7xl mx-auto text-center">
        <FadeIn>
          <h2 className="text-4xl lg:text-5xl font-extrabold text-[var(--text-primary)] mb-4">
            Ready to Start Your Dental School Journey?
          </h2>
          <p className="text-lg text-[var(--text-secondary)] mb-8 max-w-2xl mx-auto">
            Join pre-dental students using PreDent Canada to prepare
            smarter, track their progress, and get accepted into dental school.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold px-8 h-12 text-base"
              asChild
            >
              <Link to="/login">Create Free Account</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-transparent border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--page-bg)] font-semibold px-8 h-12 text-base"
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
  usePageTitle("Canadian DAT Prep & Dental School Admissions");
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[var(--page-surface)] focus:border focus:border-[var(--border-color)] focus:rounded-lg focus:text-sm focus:font-semibold"
      >
        Skip to main content
      </a>
      <main id="main-content">
      <HeroSection />
      <ValuePropSection />
      <HowItWorksSection />
      <StatsSection />
      <SampleQuestionSection />
      <ComparisonSection />
      <FadeIn>
        <section className="py-12 bg-[var(--page-surface)]">
          <div className="section-container max-w-7xl mx-auto text-center">
            <p className="text-[var(--text-secondary)] mb-4">
              Start practicing for the Canadian DAT today
            </p>
            <Button
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold px-8 h-11"
              asChild
            >
              <Link to="/login">Start Free Today</Link>
            </Button>
          </div>
        </section>
      </FadeIn>
      <TestimonialsSection />
      <PricingSection />
      <FAQSection />
      <CTASection />
      </main>
    </>
  );
}
