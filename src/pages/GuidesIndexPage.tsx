import { Link } from "react-router-dom";
import { usePageTitle } from "@/hooks/usePageTitle";
import { motion } from "framer-motion";
import {
  BookOpen,
  Calendar,
  FileText,
  Brain,
  Users,
  ChevronRight,
  GraduationCap,
  Newspaper,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const guideGroups = [
  {
    title: "DAT Preparation",
    icon: GraduationCap,
    guides: [
      {
        title: "Canadian DAT Guide",
        description:
          "Everything you need to know about registering, scoring, and structuring your DAT prep.",
        to: "/guides/canadian-dat-guide",
        badge: "Beginner",
      },
      {
        title: "DAT Study Schedules",
        description:
          "8-week, 12-week, and 16-week study plans tailored to Canadian DAT timing.",
        to: "/guides/dat-study-schedules",
        badge: "Planning",
      },
    ],
  },
  {
    title: "PAT Strategy",
    icon: Brain,
    guides: [
      {
        title: "Keyhole Strategy",
        description:
          "Master 2D to 3D projection and eliminate trap answers quickly.",
        to: "/guides/pat/keyholes",
        badge: "PAT",
      },
      {
        title: "Top-Front-End Strategy",
        description:
          "Decode orthographic projections using cross-reference and silhouette rules.",
        to: "/guides/pat/tfe",
        badge: "PAT",
      },
      {
        title: "Angle Ranking Strategy",
        description:
          "Learn the eyeballing and comparison tricks used by top scorers.",
        to: "/guides/pat/angle-ranking",
        badge: "PAT",
      },
      {
        title: "Hole Punching Strategy",
        description:
          "Fold paper mentally and track hole placement after unfolding.",
        to: "/guides/pat/hole-punching",
        badge: "PAT",
      },
      {
        title: "Cube Counting Strategy",
        description:
          "Build 3D block diagrams and answer surface-exposed questions fast.",
        to: "/guides/pat/cube-counting",
        badge: "PAT",
      },
      {
        title: "Pattern Folding Strategy",
        description:
          "Match 2D nets to 3D shapes using edge-pairing and face orientation.",
        to: "/guides/pat/pattern-folding",
        badge: "PAT",
      },
    ],
  },
  {
    title: "Application & Interviews",
    icon: Users,
    guides: [
      {
        title: "CASPer for Dental School",
        description:
          "How CASPer fits into Canadian dental admissions and how to prepare.",
        to: "/guides/casper-dental-school",
        badge: "Admissions",
      },
      {
        title: "Dental School Interview",
        description:
          "Panel vs MMI formats, common questions, and practice frameworks.",
        to: "/guides/dental-school-interview",
        badge: "Interview",
      },
    ],
  },
  {
    title: "Articles",
    icon: Newspaper,
    guides: [
      {
        title: "Canadian DAT vs American DAT",
        description:
          "Key differences in content, scoring, and timing between the two exams.",
        to: "/guides/article/canadian-dat-vs-american-dat",
        badge: "Article",
      },
      {
        title: "How to Choose Your DAT Date",
        description:
          "Plan your test date around application deadlines and prep time.",
        to: "/guides/article/how-to-choose-dat-date",
        badge: "Article",
      },
      {
        title: "Building a Dental School Application Timeline",
        description:
          "A month-by-month roadmap from research to interview invites.",
        to: "/guides/article/application-timeline",
        badge: "Article",
      },
    ],
  },
];

export default function GuidesIndexPage() {
  usePageTitle("Guides & Resources");

  return (
    <main className="min-h-screen bg-[var(--page-bg)]">
      <div className="pt-20 pb-12 bg-gradient-to-br from-[var(--page-bg)] to-[var(--page-surface)]">
        <div className="section-container max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#8B5CF6] flex items-center justify-center">
              <BookOpen className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-[var(--text-primary)]">
                Guides & Resources
              </h1>
              <p className="text-[var(--text-secondary)]">
                Step-by-step guides, strategy breakdowns, and schedules.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="section-container max-w-7xl mx-auto px-4 -mt-8 pb-20">
        <div className="space-y-10">
          {guideGroups.map((group, groupIndex) => (
            <motion.section
              key={group.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: groupIndex * 0.1 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-[#2563EB]/10 flex items-center justify-center">
                  <group.icon className="w-5 h-5 text-[#2563EB]" />
                </div>
                <h2 className="text-xl font-bold text-[var(--text-primary)]">
                  {group.title}
                </h2>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {group.guides.map(guide => (
                  <Link key={guide.to} to={guide.to}>
                    <Card className="h-full bg-[var(--page-surface)] border-[var(--border-color)] hover:border-[#2563EB]/50 transition-colors group">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <Badge variant="outline" className="text-xs">
                            {guide.badge}
                          </Badge>
                          <ChevronRight className="w-4 h-4 text-[var(--text-tertiary)] group-hover:text-[#2563EB] transition-colors" />
                        </div>
                        <h3 className="font-semibold text-[var(--text-primary)] mb-2 group-hover:text-[#2563EB] transition-colors">
                          {guide.title}
                        </h3>
                        <p className="text-sm text-[var(--text-secondary)]">
                          {guide.description}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </motion.section>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/dat-academy"
            className="inline-flex items-center gap-2 text-sm text-[#2563EB] hover:underline"
          >
            <Calendar className="w-4 h-4" />
            Explore DAT Academy study schedules →
          </Link>
          <Link
            to="/pat-academy"
            className="inline-flex items-center gap-2 text-sm text-[#2563EB] hover:underline"
          >
            <FileText className="w-4 h-4" />
            Practice PAT questions →
          </Link>
        </div>
      </div>
    </main>
  );
}
