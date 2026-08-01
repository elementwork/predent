import { useMemo, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { usePageTitle } from "@/hooks/usePageTitle";
import { getSchoolById, schools } from "@contracts/schools";
import {
  ArrowLeft,
  MapPin,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  DollarSign,
  FileText,
  CheckCircle2,
  XCircle,
  Award,
  TrendingUp,
  Lightbulb,
  Building2,
  ChevronRight,
  Lock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import { events } from "@/lib/analytics";

const chartConfig = {
  gpa: {
    label: "Avg GPA",
    color: "#2563EB",
  },
  datAa: {
    label: "DAT AA",
    color: "#10B981",
  },
  datPat: {
    label: "DAT PAT",
    color: "#F59E0B",
  },
};

function normalizeTrendValue(schoolId: string, value?: number) {
  if (value === undefined || value === null) return null;
  // Normalize 100-scale GPAs so they fit on the same chart as 4.0-scale GPAs
  if (
    schoolId === "western" ||
    schoolId === "ubc" ||
    schoolId === "saskatchewan"
  ) {
    return value / 25; // 100 -> 4.0
  }
  return value;
}

export default function SchoolDetailPage() {
  const { id } = useParams<{ id: string }>();
  const school = id ? getSchoolById(id) : undefined;

  usePageTitle(
    school ? `${school.name} | Dental School Requirements` : "School Not Found"
  );

  useEffect(() => {
    if (id) events.schoolViewed(id);
  }, [id]);

  const relatedSchools = useMemo(() => {
    if (!school) return [];
    return schools.filter(s => s.id !== school.id).slice(0, 3);
  }, [school]);

  const trendData = useMemo(() => {
    if (!school) return [];
    return school.trendStats.map(s => ({
      year: s.year,
      gpa: normalizeTrendValue(school.id, s.avgGpa),
      datAa: s.avgDatAa,
      datPat: s.avgDatPat,
    }));
  }, [school]);

  if (!school) {
    return (
      <main className="min-h-screen bg-[var(--page-bg)] pt-24 pb-20">
        <div className="section-container max-w-7xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
            School Not Found
          </h1>
          <p className="text-[var(--text-secondary)] mb-6">
            We couldn't find a dental school with that ID.
          </p>
          <Button asChild>
            <Link to="/schools">Back to School Hub</Link>
          </Button>
        </div>
      </main>
    );
  }

  const stats = [
    { label: "Seats", value: school.seats, icon: Users },
    { label: "Avg Admitted GPA", value: school.avgAdmittedGpa, icon: Award },
    { label: "Avg DAT AA", value: school.avgDatAa, icon: TrendingUp },
    { label: "Avg DAT PAT", value: school.avgDatPat, icon: TrendingUp },
  ];

  return (
    <main className="min-h-screen bg-[var(--page-bg)]">
      {/* Hero */}
      <div className="pt-20 pb-12 bg-gradient-to-br from-[var(--page-bg)] to-[var(--page-surface)]">
        <div className="section-container max-w-7xl mx-auto px-4">
          <Link
            to="/schools"
            className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to School Hub
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex items-start gap-4">
              <div
                className="w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold text-2xl shrink-0"
                style={{ backgroundColor: school.color }}
              >
                {school.name.charAt(0)}
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-[var(--text-primary)] mb-1">
                  {school.name}
                </h1>
                <p className="text-[var(--text-secondary)]">{school.faculty}</p>
                <div className="flex flex-wrap items-center gap-3 mt-3">
                  <Badge className="bg-[var(--page-muted)] text-[var(--text-primary)] border-0">
                    <MapPin className="w-3 h-3 mr-1" />
                    {school.city}, {school.province}
                  </Badge>
                  <Badge className="bg-[var(--page-muted)] text-[var(--text-primary)] border-0">
                    <GraduationCap className="w-3 h-3 mr-1" />
                    {school.program}
                  </Badge>
                  <Badge className="bg-[var(--page-muted)] text-[var(--text-primary)] border-0">
                    <Users className="w-3 h-3 mr-1" />
                    {school.seats} seats
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                className="border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--page-muted)]"
                asChild
              >
                <Link to="/compare">Compare</Link>
              </Button>
              <Button
                className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
                asChild
              >
                <Link to="/tools/competitiveness">Am I Competitive?</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="section-container max-w-7xl mx-auto px-4 -mt-8 pb-20">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="bg-[var(--page-surface)] border-[var(--border-color)]">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <stat.icon className="w-4 h-4 text-[#2563EB]" />
                    <span className="text-xs text-[var(--text-tertiary)]">
                      {stat.label}
                    </span>
                  </div>
                  <p className="text-xl font-bold text-[var(--text-primary)]">
                    {stat.value}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Overview */}
            <Card className="bg-[var(--page-surface)] border-[var(--border-color)]">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-[var(--text-primary)]">
                  <Building2 className="w-5 h-5 text-[#2563EB]" />
                  Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-[var(--text-secondary)] leading-relaxed">
                  {school.overview}
                </p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {school.highlights.map(highlight => (
                    <div key={highlight} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#10B981] mt-0.5 shrink-0" />
                      <span className="text-sm text-[var(--text-secondary)]">
                        {highlight}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Admission Snapshot */}
            <Card className="bg-[var(--page-surface)] border-[var(--border-color)]">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-[var(--text-primary)]">
                  <FileText className="w-5 h-5 text-[#2563EB]" />
                  Admission Requirements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-4">
                  <div>
                    <dt className="text-xs text-[var(--text-tertiary)] uppercase tracking-wide">
                      Minimum GPA
                    </dt>
                    <dd className="text-sm font-medium text-[var(--text-primary)]">
                      {school.minGpa}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-[var(--text-tertiary)] uppercase tracking-wide">
                      GPA Calculation
                    </dt>
                    <dd className="text-sm font-medium text-[var(--text-primary)]">
                      {school.gpaMethod}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-[var(--text-tertiary)] uppercase tracking-wide">
                      Average Admitted GPA
                    </dt>
                    <dd className="text-sm font-medium text-[var(--text-primary)]">
                      {school.avgAdmittedGpa}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-[var(--text-tertiary)] uppercase tracking-wide">
                      Degree Required
                    </dt>
                    <dd className="text-sm font-medium text-[var(--text-primary)]">
                      {school.degreeRequired}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-[var(--text-tertiary)] uppercase tracking-wide">
                      Minimum DAT
                    </dt>
                    <dd className="text-sm font-medium text-[var(--text-primary)]">
                      {school.minDat}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-[var(--text-tertiary)] uppercase tracking-wide">
                      Average Admitted DAT
                    </dt>
                    <dd className="text-sm font-medium text-[var(--text-primary)]">
                      AA {school.avgDatAa} / PAT {school.avgDatPat} / RC{" "}
                      {school.avgDatRc}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-[var(--text-tertiary)] uppercase tracking-wide">
                      CASPer
                    </dt>
                    <dd className="text-sm font-medium text-[var(--text-primary)] flex items-center gap-1.5">
                      {school.casperRequired ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />{" "}
                          Required
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5 text-[var(--text-tertiary)]" /> Not
                          required
                        </>
                      )}
                    </dd>
                    {school.casperDetails && (
                      <dd className="text-xs text-[var(--text-tertiary)] mt-1">
                        {school.casperDetails}
                      </dd>
                    )}
                  </div>
                  <div>
                    <dt className="text-xs text-[var(--text-tertiary)] uppercase tracking-wide">
                      Interview Format
                    </dt>
                    <dd className="text-sm font-medium text-[var(--text-primary)]">
                      {school.interviewFormat}
                    </dd>
                    {school.interviewTiming && (
                      <dd className="text-xs text-[var(--text-tertiary)] mt-1">
                        {school.interviewTiming}
                      </dd>
                    )}
                  </div>
                  <div>
                    <dt className="text-xs text-[var(--text-tertiary)] uppercase tracking-wide">
                      Application Fee
                    </dt>
                    <dd className="text-sm font-medium text-[var(--text-primary)]">
                      {school.applicationFee}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-[var(--text-tertiary)] uppercase tracking-wide">
                      Application Deadline
                    </dt>
                    <dd className="text-sm font-medium text-[var(--text-primary)] flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#F59E0B]" />
                      {school.applicationDeadline}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-[var(--text-tertiary)] uppercase tracking-wide">
                      Tuition (Domestic)
                    </dt>
                    <dd className="text-sm font-medium text-[var(--text-primary)] flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5 text-[#10B981]" />
                      {school.tuitionDomestic}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-[var(--text-tertiary)] uppercase tracking-wide">
                      Tuition (International)
                    </dt>
                    <dd className="text-sm font-medium text-[var(--text-primary)] flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                      {school.tuitionInternational}
                    </dd>
                  </div>
                </dl>

                <div className="mt-6 pt-6 border-t border-[var(--border-color)]">
                  <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
                    Prerequisites
                  </h4>
                  <ul className="grid sm:grid-cols-2 gap-2">
                    {school.prerequisites.map(prereq => (
                      <li
                        key={prereq}
                        className="flex items-start gap-2 text-sm text-[var(--text-secondary)]"
                      >
                        <BookOpen className="w-4 h-4 text-[#2563EB] mt-0.5 shrink-0" />
                        {prereq}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* 5-Year Trends */}
            <Card className="bg-[var(--page-surface)] border-[var(--border-color)]">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-[var(--text-primary)]">
                  <TrendingUp className="w-5 h-5 text-[#2563EB]" />
                  5-Year Admission Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                {trendData.length > 0 ? (
                  <ChartContainer
                    config={chartConfig}
                    className="min-h-[300px]"
                  >
                    <LineChart data={trendData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="var(--border-color)"
                      />
                      <XAxis
                        dataKey="year"
                        stroke="var(--text-tertiary)"
                        fontSize={12}
                      />
                      <YAxis
                        stroke="var(--text-tertiary)"
                        fontSize={12}
                        domain={[0, "auto"]}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <ChartLegend content={<ChartLegendContent />} />
                      <Line
                        type="monotone"
                        dataKey="gpa"
                        stroke={chartConfig.gpa.color}
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="datAa"
                        stroke={chartConfig.datAa.color}
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="datPat"
                        stroke={chartConfig.datPat.color}
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                    </LineChart>
                  </ChartContainer>
                ) : (
                  <p className="text-[var(--text-secondary)] text-sm">
                    Trend data not available.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Admissions Tips */}
            <Card className="bg-[var(--page-surface)] border-[var(--border-color)]">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-[var(--text-primary)]">
                  <Lightbulb className="w-5 h-5 text-[#F59E0B]" />
                  Admissions Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {school.admissionsTips.map(tip => (
                    <li key={tip} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#F59E0B]/10 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-[#F59E0B] text-xs font-bold">
                          ✓
                        </span>
                      </div>
                      <span className="text-sm text-[var(--text-secondary)]">
                        {tip}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Calculator Teaser */}
            <Card className="bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] border-0 text-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Lock className="w-4 h-4 text-white/70" />
                  <span className="text-xs font-medium text-white/70 uppercase tracking-wide">
                    Free Tool
                  </span>
                </div>
                <h3 className="text-lg font-bold mb-2">Am I Competitive?</h3>
                <p className="text-sm text-white/80 mb-4">
                  Enter your GPA and DAT scores to see how you compare to
                  admitted students at {school.name}.
                </p>
                <Button
                  className="w-full bg-white text-[#2563EB] hover:bg-white/90"
                  asChild
                >
                  <Link to="/tools/competitiveness">Calculate My Chances</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Campus Life */}
            <Card className="bg-[var(--page-surface)] border-[var(--border-color)]">
              <CardHeader>
                <CardTitle className="text-base text-[var(--text-primary)]">
                  Campus Life
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  {school.campusLife}
                </p>
              </CardContent>
            </Card>

            {/* Acceptance Rates */}
            <Card className="bg-[var(--page-surface)] border-[var(--border-color)]">
              <CardHeader>
                <CardTitle className="text-base text-[var(--text-primary)]">
                  Acceptance Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-[var(--text-secondary)]">
                      Application/Seat Ratio
                    </span>
                    <span className="font-semibold text-[var(--text-primary)]">
                      {school.applicationSeatRatio}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-[var(--text-secondary)]">
                      Interview Rate
                    </span>
                    <span className="font-semibold text-[var(--text-primary)]">
                      {school.interviewRate}%
                    </span>
                  </div>
                  <div className="h-2 bg-[var(--page-muted)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#2563EB] rounded-full"
                      style={{ width: `${school.interviewRate}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-[var(--text-secondary)]">
                      In-Province Acceptance
                    </span>
                    <span className="font-semibold text-[#10B981]">
                      {school.ipAcceptanceRate}%
                    </span>
                  </div>
                  <div className="h-2 bg-[var(--page-muted)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#10B981] rounded-full"
                      style={{ width: `${school.ipAcceptanceRate}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-[var(--text-secondary)]">
                      Out-of-Province Acceptance
                    </span>
                    <span className="font-semibold text-[#F59E0B]">
                      {school.oopAcceptanceRate}%
                    </span>
                  </div>
                  <div className="h-2 bg-[var(--page-muted)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#F59E0B] rounded-full"
                      style={{ width: `${school.oopAcceptanceRate}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Related Schools */}
            <Card className="bg-[var(--page-surface)] border-[var(--border-color)]">
              <CardHeader>
                <CardTitle className="text-base text-[var(--text-primary)]">
                  Related Schools
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {relatedSchools.map(s => (
                  <Link
                    key={s.id}
                    to={`/school/${s.id}`}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--page-muted)] transition-colors group"
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0"
                      style={{ backgroundColor: s.color }}
                    >
                      {s.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--text-primary)] group-hover:text-[#2563EB] transition-colors truncate">
                        {s.name}
                      </p>
                      <p className="text-xs text-[var(--text-tertiary)]">
                        {s.province} • {s.program}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[var(--text-tertiary)]" />
                  </Link>
                ))}
              </CardContent>
            </Card>

            {/* External Link */}
            <a
              href={school.website}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center text-sm text-[#2563EB] hover:underline"
            >
              Visit official admissions website →
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
