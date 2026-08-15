import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import {
  ArrowLeft,
  Shield,
  Loader2,
  Eye,
  Trash2,
  XCircle,
  Flag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { toast } from "sonner";

function timeAgo(date: Date | string | null) {
  if (!date) return "";
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function CommunityModerationPage() {
  usePageTitle("Community Moderation");
  const { user, isLoading } = useAuth();
  const [activeStatus, setActiveStatus] = useState<string>("pending");

  const reportsQuery = trpc.community.listReportsPage.useInfiniteQuery(
    {
      status:
        activeStatus === "all"
          ? undefined
          : (activeStatus as "pending" | "reviewed" | "dismissed" | "actioned"),
      limit: 25,
    },
    {
      enabled: user?.role === "admin",
      getNextPageParam: page => page.nextCursor ?? undefined,
    }
  );

  const reviewReport = trpc.community.reviewReport.useMutation({
    onSuccess: () => {
      toast.success("Report reviewed");
      reportsQuery.refetch();
    },
    onError: err => toast.error(err.message),
  });

  const deletePost = trpc.community.deletePost.useMutation({
    onSuccess: () => {
      toast.success("Post deleted");
      reportsQuery.refetch();
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

  const reports = reportsQuery.data?.pages.flatMap(page => page.items) ?? [];

  return (
    <main className="min-h-screen bg-[var(--page-bg)] pt-20 pb-12">
      <div className="section-container max-w-7xl mx-auto px-4">
        <Link
          to="/admin"
          className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Admin
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[var(--text-primary)]">
              Community Moderation
            </h1>
            <p className="text-[var(--text-secondary)]">
              Review and manage reported posts and comments.
            </p>
          </div>
          <Badge className="bg-[#2563EB] text-white">
            <Shield className="w-3 h-3 mr-1" /> Admin
          </Badge>
        </div>

        <Tabs value={activeStatus} onValueChange={setActiveStatus}>
          <TabsList className="bg-[var(--page-surface)] border border-[var(--border-color)] mb-6">
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="reviewed">Reviewed</TabsTrigger>
            <TabsTrigger value="dismissed">Dismissed</TabsTrigger>
            <TabsTrigger value="actioned">Actioned</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>

          <TabsContent value={activeStatus}>
            <Card className="bg-[var(--page-surface)] border-[var(--border-color)]">
              <CardHeader>
                <CardTitle className="text-[var(--text-primary)] flex items-center gap-2">
                  <Flag className="w-5 h-5 text-[#EF4444]" />
                  Reports
                </CardTitle>
              </CardHeader>
              <CardContent>
                {reportsQuery.isLoading && (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-[#2563EB]" />
                  </div>
                )}

                {!reportsQuery.isLoading && reports.length === 0 && (
                  <div className="text-center py-8 text-[var(--text-secondary)] text-sm">
                    No reports found.
                  </div>
                )}

                <div className="space-y-4">
                  {reports.map(report => (
                    <div
                      key={report.id}
                      className="p-4 rounded-xl bg-[var(--page-bg)] border border-[var(--border-color)]"
                    >
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge
                              className={
                                report.reason === "spam"
                                  ? "bg-[#F59E0B] text-white"
                                  : report.reason === "harassment"
                                    ? "bg-[#EF4444] text-white"
                                    : report.reason === "inappropriate"
                                      ? "bg-[#8B5CF6] text-white"
                                      : "bg-[var(--page-muted)] text-[var(--text-secondary)]"
                              }
                            >
                              {report.reason}
                            </Badge>
                            <Badge
                              variant="outline"
                              className="text-xs border-[var(--border-color)]"
                            >
                              {report.commentId ? "Comment" : "Post"}
                            </Badge>
                            <span className="text-xs text-[var(--text-tertiary)]">
                              {timeAgo(report.createdAt)}
                            </span>
                          </div>
                          <p className="text-xs text-[var(--text-tertiary)] mb-1">
                            Reported by:{" "}
                            <span className="text-[var(--text-secondary)]">
                              {report.reporterName ?? "Unknown"}
                            </span>
                          </p>
                          {report.description && (
                            <p className="text-xs text-[var(--text-secondary)] italic mb-1">
                              &ldquo;{report.description}&rdquo;
                            </p>
                          )}
                          {report.postTitle && (
                            <p className="text-sm text-[var(--text-primary)]">
                              {report.postTitle}
                            </p>
                          )}
                          {(report.postContent || report.commentContent) && (
                            <p className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-2">
                              {report.commentContent ?? report.postContent}
                            </p>
                          )}
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            report.status === "pending"
                              ? "border-[#F59E0B] text-[#F59E0B]"
                              : report.status === "actioned"
                                ? "border-[#EF4444] text-[#EF4444]"
                                : report.status === "dismissed"
                                  ? "border-[#10B981] text-[#10B981]"
                                  : "border-[var(--border-color)] text-[var(--text-secondary)]"
                          }
                        >
                          {report.status}
                        </Badge>
                      </div>

                      {report.status === "pending" && (
                        <div className="flex gap-2 flex-wrap">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs border-[var(--border-color)] text-[var(--text-secondary)]"
                            onClick={() =>
                              reviewReport.mutate({
                                reportId: report.id,
                                status: "dismissed",
                              })
                            }
                            disabled={reviewReport.isPending}
                          >
                            <XCircle className="w-3 h-3 mr-1" />
                            Dismiss
                          </Button>
                          {report.postId && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs border-[#F59E0B] text-[#F59E0B] hover:bg-[#F59E0B]/10"
                                onClick={() =>
                                  reviewReport.mutate({
                                    reportId: report.id,
                                    status: "actioned",
                                  })
                                }
                                disabled={reviewReport.isPending}
                              >
                                <Eye className="w-3 h-3 mr-1" />
                                Hide Post
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs border-[#EF4444] text-[#EF4444] hover:bg-[#EF4444]/10"
                                onClick={() => {
                                  deletePost.mutate({
                                    postId: report.postId!,
                                  });
                                  reviewReport.mutate({
                                    reportId: report.id,
                                    status: "actioned",
                                  });
                                }}
                                disabled={
                                  deletePost.isPending || reviewReport.isPending
                                }
                              >
                                <Trash2 className="w-3 h-3 mr-1" />
                                Delete Post
                              </Button>
                            </>
                          )}
                          {!report.postId && report.commentId && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs border-[#EF4444] text-[#EF4444] hover:bg-[#EF4444]/10"
                              onClick={() =>
                                reviewReport.mutate({
                                  reportId: report.id,
                                  status: "actioned",
                                })
                              }
                              disabled={reviewReport.isPending}
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
                              Remove Comment
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {reportsQuery.hasNextPage && (
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => reportsQuery.fetchNextPage()}
                    disabled={reportsQuery.isFetchingNextPage}
                  >
                    {reportsQuery.isFetchingNextPage
                      ? "Loading…"
                      : "Load more reports"}
                  </Button>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
