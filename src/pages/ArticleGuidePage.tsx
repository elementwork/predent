import { Link, useParams } from "react-router-dom";
import { usePageTitle } from "@/hooks/usePageTitle";
import { ArrowLeft, BookOpen, Calendar, GraduationCap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const articles: Record<
  string,
  {
    title: string;
    badge: string;
    readTime: string;
    content: { heading: string; paragraphs: string[] }[];
  }
> = {
  "canadian-dat-vs-american-dat": {
    title: "Canadian DAT vs American DAT",
    badge: "Article",
    readTime: "5 min read",
    content: [
      {
        heading: "Overview",
        paragraphs: [
          "The Canadian Dental Aptitude Test (DAT) and the American DAT share a similar purpose—assessing readiness for dental school—but they differ in content, timing, and scoring. Understanding these differences helps you choose the right prep materials and avoid studying topics you will not see.",
        ],
      },
      {
        heading: "Test Sections",
        paragraphs: [
          "The Canadian DAT includes Survey of Natural Sciences (Biology and Chemistry), Perceptual Ability Test (PAT), and Reading Comprehension. It does NOT include Organic Chemistry or Quantitative Reasoning. The American DAT includes Organic Chemistry and Quantitative Reasoning in addition to the sections found on the Canadian DAT.",
        ],
      },
      {
        heading: "Scoring",
        paragraphs: [
          "Both exams report scores on a 1–30 scale. Canadian DAT scores are generally reported as Academic Average, PAT, and Reading Comprehension. American DAT scores also include sections for Organic Chemistry and Quantitative Reasoning.",
        ],
      },
      {
        heading: "Which resources should I use?",
        paragraphs: [
          "Use Canadian-focused resources for Biology, Chemistry, PAT, and Reading Comprehension. Be cautious of American DAT books and practice tests that emphasize Organic Chemistry or advanced math, since those topics are not tested on the Canadian DAT.",
        ],
      },
    ],
  },
  "how-to-choose-dat-date": {
    title: "How to Choose Your DAT Date",
    badge: "Article",
    readTime: "4 min read",
    content: [
      {
        heading: "Start with application deadlines",
        paragraphs: [
          "Most Canadian dental schools accept DAT scores from tests taken within two or three years of application. Check each school's website for the latest admission cycle dates and the last accepted test date.",
        ],
      },
      {
        heading: "Build backwards from test day",
        paragraphs: [
          "Plan for 8–16 weeks of focused prep, depending on your starting point. Add buffer time in case you want to retake the exam. Many students write the DAT in the spring or summer before their application year.",
        ],
      },
      {
        heading: "Consider your course load",
        paragraphs: [
          "Avoid scheduling the DAT during heavy exam periods. The DAT is a long, mentally demanding test, so give yourself lighter commitments in the week leading up to it.",
        ],
      },
    ],
  },
  "application-timeline": {
    title: "Building a Dental School Application Timeline",
    badge: "Article",
    readTime: "6 min read",
    content: [
      {
        heading: "12+ months before applying",
        paragraphs: [
          "Research each Canadian dental school's requirements, prerequisites, and admission statistics. Begin building relationships with professors and dentists who can write reference letters. Start DAT prep if you have not already.",
        ],
      },
      {
        heading: "6–9 months before applying",
        paragraphs: [
          "Write your DAT and finalize your score. Continue volunteering, shadowing, or research to strengthen your extracurricular profile. Draft your personal statement early and ask mentors for feedback.",
        ],
      },
      {
        heading: "3–6 months before applying",
        paragraphs: [
          "Confirm each school's application portal and deadlines. Request transcripts and reference letters well in advance. Submit your application as early as possible within the submission window.",
        ],
      },
      {
        heading: "After submission",
        paragraphs: [
          "Prepare for CASPer and interviews. Continue shadowing or volunteering so you have recent experiences to discuss. Practice mock interviews with peers or mentors.",
        ],
      },
    ],
  },
};

export default function ArticleGuidePage() {
  const { slug } = useParams<{ slug: string }>();
  const article = slug ? articles[slug] : undefined;

  usePageTitle(article?.title ?? "Article");

  if (!article) {
    return (
      <main className="min-h-screen bg-[var(--page-bg)] pt-24 pb-20">
        <div className="section-container max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
            Article not found
          </h1>
          <Link
            to="/guides"
            className="text-[#2563EB] hover:underline inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Guides
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--page-bg)]">
      <div className="pt-20 pb-12 bg-gradient-to-br from-[var(--page-bg)] to-[var(--page-surface)]">
        <div className="section-container max-w-7xl mx-auto px-4">
          <Link
            to="/guides"
            className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Guides
          </Link>
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="outline" className="text-[var(--text-secondary)] border-[var(--border-color)]">
              {article.badge}
            </Badge>
            <span className="text-xs text-[var(--text-tertiary)]">{article.readTime}</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-[var(--text-primary)] mb-4">
            {article.title}
          </h1>
        </div>
      </div>

      <div className="section-container max-w-7xl mx-auto px-4 -mt-8 pb-20">
        <Card className="bg-[var(--page-surface)] border-[var(--border-color)]">
          <CardContent className="p-6 lg:p-8 space-y-8">
            {article.content.map((section, i) => (
              <section key={i}>
                <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                  {i === 0 ? (
                    <BookOpen className="w-5 h-5 text-[#2563EB]" />
                  ) : i === 1 ? (
                    <Calendar className="w-5 h-5 text-[#2563EB]" />
                  ) : (
                    <GraduationCap className="w-5 h-5 text-[#2563EB]" />
                  )}
                  {section.heading}
                </h2>
                <div className="space-y-3">
                  {section.paragraphs.map((p, j) => (
                    <p
                      key={j}
                      className="text-sm text-[var(--text-secondary)] leading-relaxed"
                    >
                      {p}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
