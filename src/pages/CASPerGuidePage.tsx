import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Shield,
  AlertTriangle,
  Check,
  BookOpen,
  Clock,
  Users,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const casperSchools = [
  "University of Toronto",
  "Western University",
  "McGill University",
  "Université de Montréal",
  "Université Laval",
  "University of Alberta",
  "University of Saskatchewan",
];

const tips = [
  {
    title: "Understand the Format",
    description:
      "CASPer is a situational judgment test with 12 sections: 8 video-based and 4 word-based scenarios. You have 5 minutes to answer 3 open-ended questions per section.",
    icon: BookOpen,
  },
  {
    title: "Time Management is Critical",
    description:
      "With only 5 minutes for 3 questions, you have roughly 90 seconds per response. Practice typing speed and concise answering.",
    icon: Clock,
  },
  {
    title: "Use the SEE Framework",
    description:
      "Sensitivity, Empathy, and Effectiveness. Structure your answers to show you understand all perspectives, then propose a practical solution.",
    icon: Users,
  },
  {
    title: "Practice with Scenarios",
    description:
      "The more scenarios you practice, the more comfortable you become with the format. Focus on ethical dilemmas, conflict resolution, and teamwork situations.",
    icon: Shield,
  },
];

const scenarios = [
  {
    type: "Ethical Dilemma",
    prompt: "You notice a classmate cheating on an exam. What do you do?",
    framework:
      "Acknowledge the complexity: cheating undermines academic integrity but reporting a peer is difficult. Consider: speaking to the classmate first, reporting to the professor, or seeking guidance from an advisor.",
  },
  {
    type: "Conflict Resolution",
    prompt:
      "Your lab partner is not contributing equally to a group project. How do you handle this?",
    framework:
      "Address directly with empathy: schedule a conversation, express your feelings without blame, ask if there are underlying issues, propose a clear division of remaining work, offer support if needed.",
  },
  {
    type: "Teamwork",
    prompt:
      "You disagree with your team's approach to a presentation. What steps do you take?",
    framework:
      "Listen first: understand the rationale behind their approach. Present your concerns constructively with evidence. Seek compromise or take a vote. Support the final decision even if it was not your preference.",
  },
];

export default function CASPerGuidePage() {
  return (
    <main className="min-h-screen bg-[var(--page-bg)]">
      <div className="pt-20 pb-12 bg-gradient-to-br from-[var(--page-bg)] to-[var(--page-surface)]">
        <div className="section-container max-w-7xl mx-auto">
          <Link
            to="/guides"
            className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Guides
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#14B8A6] to-[#2563EB] flex items-center justify-center">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-[var(--text-primary)]">
                CASPer Preparation Guide
              </h1>
              <p className="text-[var(--text-secondary)]">
                Complete guide to the CASPer test for Canadian dental schools.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="section-container max-w-7xl mx-auto -mt-8 pb-20">
        {/* Alert */}
        <div className="mb-6 p-4 rounded-lg bg-[var(--page-muted)] border border-[var(--border-color)] flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-[#2563EB] shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-[#2563EB]">
              7 of 10 Canadian dental schools require CASPer
            </p>
            <p className="text-sm text-[var(--text-secondary)]">
              Make sure you check your target schools&apos; requirements early
              and register for a test date.
            </p>
          </div>
        </div>

        {/* Schools Requiring CASPer */}
        <Card className="border-[var(--border-color)] mb-8">
          <CardContent className="p-6">
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">
              Schools That Require CASPer
            </h2>
            <div className="flex flex-wrap gap-2">
              {casperSchools.map(school => (
                <Badge
                  key={school}
                  className="bg-[var(--page-muted)] text-[#F59E0B] hover:bg-[var(--page-muted)]"
                >
                  {school}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-3">
              Note: UBC, Manitoba, and Dalhousie do not currently require
              CASPer.
            </p>
          </CardContent>
        </Card>

        {/* Tips */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {tips.map(tip => (
            <Card key={tip.title} className="border-[var(--border-color)]">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <tip.icon className="w-5 h-5 text-[#2563EB]" />
                  <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                    {tip.title}
                  </h3>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {tip.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Practice Scenarios */}
        <Card className="border-[var(--border-color)] mb-8">
          <CardContent className="p-6">
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">
              Practice Scenarios
            </h2>
            <div className="space-y-4">
              {scenarios.map((s, i) => (
                <div
                  key={i}
                  className="p-4 rounded-lg bg-[var(--page-bg)] border border-[var(--border-color)]"
                >
                  <Badge className="mb-2 bg-[var(--page-muted)] text-[#2563EB]">
                    {s.type}
                  </Badge>
                  <p className="text-sm font-medium text-[var(--text-primary)] mb-2">
                    {s.prompt}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    {s.framework}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Test Day Tips */}
        <Card className="border-[var(--border-color)]">
          <CardContent className="p-6">
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">
              Test Day Checklist
            </h2>
            <ul className="space-y-2">
              {[
                "Find a quiet, private room with no distractions",
                "Test your webcam and internet connection beforehand",
                "Have a valid photo ID ready",
                "Use a wired internet connection if possible",
                "Close all other applications on your computer",
                "Have a glass of water nearby",
                "Take a deep breath before each section - you have limited time",
                "Answer all questions even if briefly - partial answers are better than blank",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#10B981] mt-0.5 shrink-0" />
                  <span className="text-sm text-[var(--text-secondary)]">{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
