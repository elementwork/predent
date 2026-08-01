import { useState } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  User,
  Target,
  BookOpen,
  TrendingUp,
  Check,
  School,
  Shield,
  Lightbulb,
  ArrowRight,
  Calendar,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { provinces } from "@contracts/schools";

export default function DashboardPage() {
  usePageTitle("Dashboard");
  const { user } = useAuth({ redirectOnUnauthenticated: true });
  const utils = trpc.useUtils();

  const { data: profile } = trpc.profile.get.useQuery();
  const { data: dashboardStats } = trpc.task.dashboardStats.useQuery();
  const { data: recommendations } = trpc.task.getRecommendations.useQuery();
  const upsertProfile = trpc.profile.upsert.useMutation({
    onSuccess: () => utils.profile.invalidate(),
  });

  const [form, setForm] = useState({
    firstName: profile?.firstName || "",
    lastName: profile?.lastName || "",
    province: profile?.province || "",
    currentGpa: profile?.currentGpa || "",
    gpaScale: (profile?.gpaScale || "4.0") as "4.0" | "100",
    yearLevel: profile?.yearLevel || 3,
    targetYear: profile?.targetYear || 2026,
    degreeStatus: (profile?.degreeStatus || "in_progress") as
      | "in_progress"
      | "completed",
    undergradSchool: profile?.undergradSchool || "",
  });

  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    await upsertProfile.mutateAsync({
      ...form,
      currentGpa: form.currentGpa || undefined,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const completionPercent =
    [
      form.firstName,
      form.lastName,
      form.province,
      form.currentGpa,
      form.undergradSchool,
    ].filter(Boolean).length * 20;

  if (!user) return null;

  return (
    <main key={profile ? "loaded" : "loading"} className="min-h-screen bg-[var(--page-bg)] pt-20">
      <div className="section-container max-w-7xl mx-auto pb-20">
        <div className="flex items-center gap-3 mb-8">
          <LayoutDashboard className="w-6 h-6 text-[#2563EB]" />
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Dashboard
          </h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Sidebar */}
          <div className="space-y-4">
            {/* User Card */}
            <Card className="bg-[var(--page-surface)] border-[var(--border-color)]">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt=""
                      className="w-14 h-14 rounded-full"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-[#2563EB] flex items-center justify-center">
                      <User className="w-7 h-7 text-white" />
                    </div>
                  )}
                  <div>
                    <p className="text-base font-semibold text-[var(--text-primary)]">
                      {user.name || "Pre-Dental Student"}
                    </p>
                    <p className="text-xs text-[var(--text-tertiary)]">
                      {user.email}
                    </p>
                    <span
                      className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        user.role === "admin"
                          ? "bg-[#F59E0B]/20 text-[#F59E0B]"
                          : "bg-[#2563EB]/20 text-[#2563EB]"
                      }`}
                    >
                      {user.tier || "free"}
                    </span>
                  </div>
                </div>

                {/* Profile Completion */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-[var(--text-tertiary)]">
                      Profile Completion
                    </span>
                    <span className="text-xs font-medium text-[#10B981]">
                      {completionPercent}%
                    </span>
                  </div>
                  <div className="h-2 bg-[var(--page-muted)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#10B981] rounded-full transition-all"
                      style={{ width: `${completionPercent}%` }}
                    />
                  </div>
                </div>

                {user.role === "admin" && (
                  <Link
                    to="/admin"
                    className="mt-4 flex items-center gap-2 text-xs font-medium text-[#F59E0B] hover:underline"
                  >
                    <Shield className="w-3.5 h-3.5" /> Admin Dashboard
                  </Link>
                )}
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card className="bg-[var(--page-surface)] border-[var(--border-color)]">
              <CardContent className="p-4">
                <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
                  Quick Links
                </h3>
                <div className="space-y-1">
                  {[
                    {
                      icon: Target,
                      label: "PAT Academy",
                      href: "/pat-academy",
                      color: "#8B5CF6",
                    },
                    {
                      icon: BookOpen,
                      label: "DAT Academy",
                      href: "/dat-academy",
                      color: "#10B981",
                    },
                    {
                      icon: School,
                      label: "School Hub",
                      href: "/schools",
                      color: "#2563EB",
                    },
                    {
                      icon: TrendingUp,
                      label: "Application Planner",
                      href: "/dashboard/planner",
                      color: "#F59E0B",
                    },
                  ].map(link => (
                    <Link
                      key={link.label}
                      to={link.href}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-[var(--page-muted)] transition-colors group"
                    >
                      <link.icon
                        className="w-4 h-4"
                        style={{ color: link.color }}
                      />
                      <span className="text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
                        {link.label}
                      </span>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Profile Form */}
          <div className="lg:col-span-2">
            <Card className="bg-[var(--page-surface)] border-[var(--border-color)]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                    My Profile
                  </h2>
                  {saved && (
                    <span className="flex items-center gap-1 text-xs text-[#10B981]">
                      <Check className="w-3.5 h-3.5" /> Saved
                    </span>
                  )}
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-[var(--text-tertiary)] mb-1.5 block">
                      First Name
                    </label>
                    <Input
                      value={form.firstName}
                      onChange={e =>
                        setForm({ ...form, firstName: e.target.value })
                      }
                      className="bg-[var(--page-muted)] border-[var(--border-color)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[var(--text-tertiary)] mb-1.5 block">
                      Last Name
                    </label>
                    <Input
                      value={form.lastName}
                      onChange={e =>
                        setForm({ ...form, lastName: e.target.value })
                      }
                      className="bg-[var(--page-muted)] border-[var(--border-color)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]"
                      placeholder="Doe"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[var(--text-tertiary)] mb-1.5 block">
                      Province
                    </label>
                    <select
                      value={form.province}
                      onChange={e =>
                        setForm({ ...form, province: e.target.value })
                      }
                      className="w-full h-10 px-3 rounded-md bg-[var(--page-muted)] border border-[var(--border-color)] text-[var(--text-primary)] text-sm"
                    >
                      <option value="" className="bg-[var(--page-surface)]">
                        Select province
                      </option>
                      {provinces.map(p => (
                        <option
                          key={p}
                          value={p}
                          className="bg-[var(--page-surface)]"
                        >
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-[var(--text-tertiary)] mb-1.5 block">
                      Current GPA
                    </label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        step="0.01"
                        value={form.currentGpa}
                        onChange={e =>
                          setForm({ ...form, currentGpa: e.target.value })
                        }
                        className="bg-[var(--page-muted)] border-[var(--border-color)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] flex-1"
                        placeholder="3.50"
                      />
                      <select
                        value={form.gpaScale}
                        onChange={e =>
                          setForm({
                            ...form,
                            gpaScale: e.target.value as "4.0" | "100",
                          })
                        }
                        className="h-10 px-2 rounded-md bg-[var(--page-muted)] border border-[var(--border-color)] text-[var(--text-primary)] text-sm"
                      >
                        <option
                          value="4.0"
                          className="bg-[var(--page-surface)]"
                        >
                          4.0
                        </option>
                        <option
                          value="100"
                          className="bg-[var(--page-surface)]"
                        >
                          100
                        </option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-[var(--text-tertiary)] mb-1.5 block">
                      Year Level
                    </label>
                    <Input
                      type="number"
                      min={1}
                      max={7}
                      value={form.yearLevel}
                      onChange={e =>
                        setForm({ ...form, yearLevel: Number(e.target.value) })
                      }
                      className="bg-[var(--page-muted)] border-[var(--border-color)] text-[var(--text-primary)]"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[var(--text-tertiary)] mb-1.5 block">
                      Target Application Year
                    </label>
                    <Input
                      type="number"
                      value={form.targetYear}
                      onChange={e =>
                        setForm({ ...form, targetYear: Number(e.target.value) })
                      }
                      className="bg-[var(--page-muted)] border-[var(--border-color)] text-[var(--text-primary)]"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[var(--text-tertiary)] mb-1.5 block">
                      Degree Status
                    </label>
                    <select
                      value={form.degreeStatus}
                      onChange={e =>
                        setForm({
                          ...form,
                          degreeStatus: e.target.value as
                            | "in_progress"
                            | "completed",
                        })
                      }
                      className="w-full h-10 px-3 rounded-md bg-[var(--page-muted)] border border-[var(--border-color)] text-[var(--text-primary)] text-sm"
                    >
                      <option
                        value="in_progress"
                        className="bg-[var(--page-surface)]"
                      >
                        In Progress
                      </option>
                      <option
                        value="completed"
                        className="bg-[var(--page-surface)]"
                      >
                        Completed
                      </option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-[var(--text-tertiary)] mb-1.5 block">
                      Undergrad School
                    </label>
                    <Input
                      value={form.undergradSchool}
                      onChange={e =>
                        setForm({ ...form, undergradSchool: e.target.value })
                      }
                      className="bg-[var(--page-muted)] border-[var(--border-color)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]"
                      placeholder="University of Toronto"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <Button
                    onClick={handleSave}
                    className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold px-6"
                    disabled={upsertProfile.isPending}
                  >
                    {upsertProfile.isPending ? "Saving..." : "Save Profile"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Stats Overview */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              {[
                {
                  label: "PAT Questions",
                  value: dashboardStats?.patQuestions ?? 0,
                  icon: Target,
                  color: "#8B5CF6",
                },
                {
                  label: "Study Streak",
                  value: `${dashboardStats?.studyStreakDays ?? 0} days`,
                  icon: TrendingUp,
                  color: "#F59E0B",
                },
                {
                  label: "Tasks",
                  value: dashboardStats?.taskCount ?? 0,
                  icon: BookOpen,
                  color: "#10B981",
                },
              ].map(stat => (
                <Card
                  key={stat.label}
                  className="bg-[var(--page-surface)] border-[var(--border-color)]"
                >
                  <CardContent className="p-4 text-center">
                    <stat.icon
                      className="w-5 h-5 mx-auto mb-2"
                      style={{ color: stat.color }}
                    />
                    <p className="text-xl font-bold text-[var(--text-primary)]">
                      {stat.value}
                    </p>
                    <p className="text-[10px] text-[var(--text-tertiary)]">
                      {stat.label}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Personalized Recommendations */}
            {recommendations && recommendations.recommendations.length > 0 && (
              <Card className="bg-[var(--page-surface)] border-[var(--border-color)] mt-6">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Lightbulb className="w-4 h-4 text-[#F59E0B]" />
                    <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                      Recommended for You
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {recommendations.recommendations.map((rec, i) => {
                      const iconMap = {
                        study: BookOpen,
                        practice: Target,
                        task: Calendar,
                      };
                      const colorMap = {
                        high: "#EF4444",
                        medium: "#F59E0B",
                        low: "#10B981",
                      };
                      const Icon = iconMap[rec.type];
                      return (
                        <Link
                          key={i}
                          to={rec.link}
                          className="flex items-start gap-3 p-3 rounded-lg hover:bg-[var(--page-muted)] transition-colors group"
                        >
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                            style={{ backgroundColor: `${colorMap[rec.priority]}15` }}
                          >
                            <Icon className="w-4 h-4" style={{ color: colorMap[rec.priority] }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[var(--text-primary)]">
                              {rec.title}
                            </p>
                            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                              {rec.description}
                            </p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)] shrink-0 mt-1 transition-colors" />
                        </Link>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
