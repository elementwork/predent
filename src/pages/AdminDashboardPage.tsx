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
  CreditCard,
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
  const [stripeAuditAfterId, setStripeAuditAfterId] = useState<
    number | undefined
  >();

  const statsQuery = trpc.admin.stats.useQuery(undefined, {
    enabled: user?.role === "admin",
  });
  const usersQuery = trpc.admin.listUsersPage.useInfiniteQuery(
    { limit: 25 },
    {
      enabled: user?.role === "admin" && activeTab === "users",
      getNextPageParam: page => page.nextCursor ?? undefined,
    }
  );
  const questionsQuery = trpc.admin.listQuestionsPage.useInfiniteQuery(
    { type: "dat", limit: 25 },
    {
      enabled: user?.role === "admin" && activeTab === "questions",
      getNextPageParam: page => page.nextCursor ?? undefined,
    }
  );
  const stripeAuditQuery = trpc.admin.auditStripeEntitlements.useQuery(
    { limit: 50, afterId: stripeAuditAfterId },
    {
      enabled: user?.role === "admin" && activeTab === "billing",
      retry: false,
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
  const reconcileStripe = trpc.admin.reconcileStripeEntitlements.useMutation({
    onSuccess: data => {
      toast.success(`Reconciled ${data.summary.applied} entitlement(s)`);
      stripeAuditQuery.refetch();
      usersQuery.refetch();
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
  const listedUsers = usersQuery.data?.pages.flatMap(page => page.items) ?? [];
  const listedQuestions =
    questionsQuery.data?.pages.flatMap(page => page.items) ?? [];

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
            <TabsTrigger value="billing">Billing</TabsTrigger>
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
                  className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white"
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
                      {listedUsers.map(u => (
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
                                  ? "bg-[#92400E] text-white"
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
                {usersQuery.hasNextPage && (
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => usersQuery.fetchNextPage()}
                    disabled={usersQuery.isFetchingNextPage}
                  >
                    {usersQuery.isFetchingNextPage
                      ? "Loading…"
                      : "Load more users"}
                  </Button>
                )}
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
                      {listedQuestions.map(q => (
                        <tr
                          key={q.id}
                          className="border-b border-[var(--border-color)]/50"
                        >
                          <td className="py-2 text-[var(--text-primary)] font-mono text-xs">
                            {q.publicId}
                          </td>
                          <td className="py-2 text-[var(--text-secondary)] capitalize">
                            {q.subject}
                          </td>
                          <td className="py-2 text-[var(--text-secondary)]">
                            {q.topic ?? "-"}
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
                {questionsQuery.hasNextPage && (
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => questionsQuery.fetchNextPage()}
                    disabled={questionsQuery.isFetchingNextPage}
                  >
                    {questionsQuery.isFetchingNextPage
                      ? "Loading…"
                      : "Load more questions"}
                  </Button>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="billing">
            <Card className="bg-[var(--page-surface)] border-[var(--border-color)]">
              <CardHeader>
                <CardTitle className="text-[var(--text-primary)] flex items-center gap-2">
                  <CreditCard className="w-5 h-5" /> Stripe Entitlement Audit
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <p className="text-sm text-[var(--text-secondary)]">
                  Compare paid local entitlements with current Stripe
                  subscription state. Lifetime Premium Plus access is never
                  downgraded automatically.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="outline"
                    className="border-[var(--border-color)] text-[var(--text-primary)]"
                    onClick={() => {
                      setStripeAuditAfterId(undefined);
                      if (stripeAuditAfterId === undefined) {
                        stripeAuditQuery.refetch();
                      }
                    }}
                    disabled={stripeAuditQuery.isFetching}
                  >
                    {stripeAuditQuery.isFetching && (
                      <Loader2 className="w-4 h-4 animate-spin mr-1" />
                    )}
                    Run Dry Audit
                  </Button>
                  <Button
                    className="bg-[#DC2626] hover:bg-[#B91C1C] text-white"
                    disabled={
                      reconcileStripe.isPending ||
                      !stripeAuditQuery.data?.summary.drift
                    }
                    onClick={() => {
                      if (
                        window.confirm(
                          "Apply Stripe as the source of truth for every detected entitlement drift in this batch?"
                        )
                      ) {
                        reconcileStripe.mutate({
                          limit: 50,
                          afterId: stripeAuditAfterId,
                          confirmation: "RECONCILE_STRIPE_ENTITLEMENTS",
                        });
                      }
                    }}
                  >
                    {reconcileStripe.isPending && (
                      <Loader2 className="w-4 h-4 animate-spin mr-1" />
                    )}
                    Apply Detected Drift
                  </Button>
                </div>

                {stripeAuditQuery.error && (
                  <p role="alert" className="text-sm text-[#DC2626]">
                    {stripeAuditQuery.error.message}
                  </p>
                )}

                {stripeAuditQuery.data && (
                  <>
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                      {Object.entries(stripeAuditQuery.data.summary).map(
                        ([label, value]) => (
                          <div
                            key={label}
                            className="rounded-lg border border-[var(--border-color)] p-3"
                          >
                            <p className="text-xs capitalize text-[var(--text-tertiary)]">
                              {label.replace(/([A-Z])/g, " $1")}
                            </p>
                            <p className="text-xl font-bold text-[var(--text-primary)]">
                              {value}
                            </p>
                          </div>
                        )
                      )}
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-[var(--border-color)]">
                            <th className="text-left py-2">User</th>
                            <th className="text-left py-2">Status</th>
                            <th className="text-left py-2">Local</th>
                            <th className="text-left py-2">Stripe</th>
                            <th className="text-left py-2">Reason</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stripeAuditQuery.data.items.map(row => (
                            <tr
                              key={row.userId}
                              className="border-b border-[var(--border-color)]/50"
                            >
                              <td className="py-2 text-[var(--text-primary)]">
                                #{row.userId}
                              </td>
                              <td className="py-2">
                                <Badge
                                  className={
                                    row.status === "in_sync"
                                      ? "bg-[#059669] text-white"
                                      : row.status === "drift"
                                        ? "bg-[#DC2626] text-white"
                                        : "bg-[#D97706] text-white"
                                  }
                                >
                                  {row.status.replace("_", " ")}
                                </Badge>
                              </td>
                              <td className="py-2 text-[var(--text-secondary)]">
                                {row.local.tier}
                              </td>
                              <td className="py-2 text-[var(--text-secondary)]">
                                {row.stripe?.tier ?? row.stripe?.status ?? "—"}
                              </td>
                              <td className="py-2 text-[var(--text-tertiary)] max-w-sm">
                                {row.reason}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {stripeAuditQuery.data.nextCursor && (
                      <div className="flex justify-end">
                        <Button
                          variant="outline"
                          onClick={() =>
                            setStripeAuditAfterId(
                              stripeAuditQuery.data.nextCursor ?? undefined
                            )
                          }
                        >
                          Audit next batch
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
