import { Link } from "react-router-dom";
import { ArrowLeft, GraduationCap, Target, Users, Shield } from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Card, CardContent } from "@/components/ui/card";

const values = [
  {
    icon: Target,
    title: "Canadian-First",
    description:
      "Every tool, question, and guide is built specifically for the Canadian DAT and Canadian dental school admissions.",
  },
  {
    icon: Users,
    title: "Student-Driven",
    description:
      "We listen to pre-dental students and iterate based on real feedback from the application journey.",
  },
  {
    icon: Shield,
    title: "Transparent",
    description:
      "No inflated claims. Clear pricing. Honest stats. We show you exactly what you get before you upgrade.",
  },
];

export default function AboutPage() {
  usePageTitle("About PreDent Canada");

  return (
    <main className="min-h-screen bg-[var(--page-bg)]">
      <div className="pt-20 pb-12 bg-gradient-to-br from-[var(--page-bg)] to-[var(--page-surface)]">
        <div className="section-container max-w-7xl mx-auto px-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#10B981] flex items-center justify-center">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-[var(--text-primary)]">
                About PreDent Canada
              </h1>
              <p className="text-[var(--text-secondary)]">
                Built by Canadians, for Canadian pre-dental students.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="section-container max-w-7xl mx-auto px-4 -mt-8 pb-20">
        <Card className="border-[var(--border-color)] mb-8">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">
              Our Mission
            </h2>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4">
              PreDent Canada exists to simplify the path to Canadian dental
              school. We bring together Canadian DAT practice, school research,
              application planning, and peer community in one place — so you can
              spend less time navigating scattered resources and more time
              studying.
            </p>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              We are not affiliated with the Canadian Dental Association or any
              dental school. We are an independent team of builders, educators,
              and former applicants who know how stressful the process can be.
            </p>
          </CardContent>
        </Card>

        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">
          What We Value
        </h2>
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {values.map(value => (
            <Card
              key={value.title}
              className="h-full bg-[var(--page-surface)] border-[var(--border-color)]"
            >
              <CardContent className="p-5">
                <div className="w-10 h-10 rounded-lg bg-[#2563EB]/10 flex items-center justify-center mb-3">
                  <value.icon className="w-5 h-5 text-[#2563EB]" />
                </div>
                <h3 className="font-semibold text-[var(--text-primary)] mb-2">
                  {value.title}
                </h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  {value.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-[var(--border-color)]">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">
              Have Questions?
            </h2>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4">
              We are always happy to hear from students, parents, educators, and
              admissions teams.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#2563EB] hover:underline"
            >
              Contact us →
            </Link>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
