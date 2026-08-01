import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import {
  ArrowLeft,
  Users,
  BookOpen,
  BarChart3,
  Shield,
  Trash2,
  RefreshCw,
  Loader2,
  Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { toast } from "sonner";

function StatCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <Card className="bg-[var(--page-surface)] border-[var(--border-color)]">
      <CardContent className="p-5 flex items-center gap-4">
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
        <div>
          <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wide">
            {title}
          </p>
          <p className="text-2xl font-bold text-[var(--text-primary)]">
            {value.toLocaleString()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboardPage() {
  usePageTitle("Admin Dashboard");
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  const statsQuery = trpc.admin.stats.useQuery(undefined, {
    enabled: user?.role === "admin",
  });
  const usersQuery = trpc.admin.listUsers.useQuery(
    { limit: 25 },
    {
      enabled: user?.role === "admin" && activeTab === "users",
    }
  );
  const questionsQuery = trpc.admin.listQuestions.useQuery(
    { type: "dat", limit: 25 },
    {
      enabled: user?.role === "admin" && activeTab === "questions",
    }
  );

  const updateRole = trpc.admin.updateUserRole.useMutation({
    onSuccess: () => {
      toast.success("User role updated");
      usersQuery.refetch();
    },
    onError: err => toast.error(err.message),
  });

  const deleteQuestion = trpc.admin.deleteQuestion.useMutation({
    onSuccess: () => {
      toast.success("Question deleted");
      questionsQuery.refetch();
    },
    onError: err => toast.error(err.message),
  });

  const seedDat = trpc.admin.seedDatQuestions.useMutation({
    onSuccess: () => {
      toast.success("DAT questions seeded");
      questionsQuery.refetch();
      statsQuery.refetch();
    },
    onError: err => toast.error(err.message),
  });

  const sendReminders = trpc.admin.sendTaskDueReminders.useMutation({
    onSuccess: data => {
      toast.success(`Sent ${data.notified} task reminder(s)`);
    },
    onError: err => toast.error(err.message),
  });

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[var(--page-bg)] pt-24 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#2563EB]" />
      </main>
    );
  }

  if (!user || user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  const stats = statsQuery.data;

  return (
    <main className="min-h-screen bg-[var(--page-bg)] pt-20 pb-12">
      <div className="section-container max-w-7xl mx-auto px-4">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[var(--text-primary)]">
              Admin Dashboard
            </h1>
            <p className="text-[var(--text-secondary)]">
              Manage users, content, and platform stats.
            </p>
          </div>
          <Badge className="bg-[#2563EB] text-white">
            <Shield className="w-3 h-3 mr-1" /> Admin
          </Badge>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-[var(--page-surface)] border border-[var(--border-color)] mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="questions">Questions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {stats && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <StatCard
                  title="Users"
                  value={stats.users}
                  icon={Users}
                  color="#2563EB"
                />
                <StatCard
                  title="PAT Questions"
                  value={stats.patQuestions}
                  icon={BookOpen}
                  color="#F59E0B"
                />
                <StatCard
                  title="PAT Attempts"
                  value={stats.patAttempts}
                  icon={BarChart3}
                  color="#10B981"
                />
                <StatCard
                  title="DAT Questions"
                  value={stats.datQuestions}
                  icon={BookOpen}
                  color="#8B5CF6"
                />
                <StatCard
                  title="DAT Attempts"
                  value={stats.datAttempts}
                  icon={BarChart3}
                  color="#14B8A6"
                />
              </div>
            )}

            <Card className="bg-[var(--page-surface)] border-[var(--border-color)]">
              <CardHeader>
                <CardTitle className="text-[var(--text-primary)]">
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-3">
                <Button
                  onClick={() => seedDat.mutate()}
                  disabled={seedDat.isPending}
                  className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white"
                >
                  {seedDat.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-1" />
                  ) : (
                    <RefreshCw className="w-4 h-4 mr-1" />
                  )}
                  Seed DAT Questions
                </Button>
                <Button
                  onClick={() => sendReminders.mutate()}
                  disabled={sendReminders.isPending}
                  variant="outline"
                  className="border-[var(--border-color)] text-[var(--text-primary)]"
                >
                  {sendReminders.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-1" />
                  ) : (
                    <Bell className="w-4 h-4 mr-1" />
                  )}
                  Send Task Due Reminders
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card className="bg-[var(--page-surface)] border-[var(--border-color)]">
              <CardHeader>
                <CardTitle className="text-[var(--text-primary)]">
                  Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[var(--border-color)]">
                        <th className="text-left py-2 text-[var(--text-tertiary)]">
                          Name
                        </th>
                        <th className="text-left py-2 text-[var(--text-tertiary)]">
                          Email
                        </th>
                        <th className="text-left py-2 text-[var(--text-tertiary)]">
                          Role
                        </th>
                        <th className="text-left py-2 text-[var(--text-tertiary)]">
                          Tier
                        </th>
                        <th className="text-left py-2 text-[var(--text-tertiary)]">
                          Joined
                        </th>
                        <th className="text-left py-2 text-[var(--text-tertiary)]">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {usersQuery.data?.map(u => (
                        <tr
                          key={u.id}
                          className="border-b border-[var(--border-color)]/50"
                        >
                          <td className="py-2 text-[var(--text-primary)]">
                            {u.name ?? "Unnamed"}
                          </td>
                          <td className="py-2 text-[var(--text-secondary)]">
                            {u.email ?? "-"}
                          </td>
                          <td className="py-2">
                            <Badge
                              className={
                                u.role === "admin"
                                  ? "bg-[#F59E0B] text-white"
                                  : "bg-[var(--page-muted)] text-[var(--text-secondary)]"
                              }
                            >
                              {u.role}
                            </Badge>
                          </td>
                          <td className="py-2 text-[var(--text-secondary)] capitalize">
                            {u.tier}
                          </td>
                          <td className="py-2 text-[var(--text-tertiary)] text-xs">
                            {u.createdAt
                              ? new Date(u.createdAt).toLocaleDateString()
                              : "-"}
                          </td>
                          <td className="py-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs border-[var(--border-color)] text-[var(--text-secondary)]"
                              onClick={() =>
                                updateRole.mutate({
                                  userId: u.id,
                                  role: u.role === "admin" ? "user" : "admin",
                                })
                              }
                              disabled={
                                updateRole.isPending || u.id === user.id
                              }
                            >
                              {u.role === "admin" ? "Demote" : "Make Admin"}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="questions">
            <Card className="bg-[var(--page-surface)] border-[var(--border-color)]">
              <CardHeader>
                <CardTitle className="text-[var(--text-primary)]">
                  DAT Questions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[var(--border-color)]">
                        <th className="text-left py-2 text-[var(--text-tertiary)]">
                          Public ID
                        </th>
                        <th className="text-left py-2 text-[var(--text-tertiary)]">
                          Subject
                        </th>
                        <th className="text-left py-2 text-[var(--text-tertiary)]">
                          Topic
                        </th>
                        <th className="text-left py-2 text-[var(--text-tertiary)]">
                          Difficulty
                        </th>
                        <th className="text-left py-2 text-[var(--text-tertiary)]">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {questionsQuery.data?.map(q => (
                        <tr
                          key={q.id}
                          className="border-b border-[var(--border-color)]/50"
                        >
                          <td className="py-2 text-[var(--text-primary)] font-mono text-xs">
                            {q.publicId}
                          </td>
                          <td className="py-2 text-[var(--text-secondary)] capitalize">
                            {"subject" in q ? q.subject : q.category}
                          </td>
                          <td className="py-2 text-[var(--text-secondary)]">
                            {"topic" in q ? q.topic : "-"}
                          </td>
                          <td className="py-2">
                            <Badge className="bg-[var(--page-muted)] text-[var(--text-secondary)] capitalize">
                              {q.difficulty}
                            </Badge>
                          </td>
                          <td className="py-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs border-[var(--border-color)] text-[#EF4444] hover:bg-[#EF4444]/10"
                              onClick={() =>
                                deleteQuestion.mutate({ type: "dat", id: q.id })
                              }
                              disabled={deleteQuestion.isPending}
                            >
                              <Trash2 className="w-3 h-3 mr-1" /> Delete
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
