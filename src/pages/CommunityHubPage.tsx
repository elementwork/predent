import { useState } from "react";
import { Link } from "react-router-dom";
import { usePageTitle } from "@/hooks/usePageTitle";
import { motion } from "framer-motion";
import {
  MessageSquare,
  Trophy,
  Users,
  GraduationCap,
  ThumbsUp,
  MessageCircle,
  ChevronRight,
  Plus,
  Loader2,
  MoreVertical,
  Pencil,
  Trash2,
  Flag,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { schools } from "@contracts/schools";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { events } from "@/lib/analytics";
import CommentSection from "@/components/CommentSection";
import ReportDialog from "@/components/ReportDialog";

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

function CreatePostDialog({ onCreated }: { onCreated: () => void }) {
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    type: "result" as "result" | "question" | "discussion",
    title: "",
    content: "",
    school: "",
    program: "DDS",
    result: "Accepted" as
      | "Accepted"
      | "Interview Invite"
      | "Waitlisted"
      | "Rejected",
    gpa: "",
    datAa: "",
    datPat: "",
    province: "IP" as "IP" | "OOP",
  });

  const createPost = trpc.community.createPost.useMutation({
    onSuccess: () => {
      toast.success("Post shared!");
      setOpen(false);
      setForm({
        type: "result",
        title: "",
        content: "",
        school: "",
        program: "DDS",
        result: "Accepted",
        gpa: "",
        datAa: "",
        datPat: "",
        province: "IP",
      });
      onCreated();
    },
    onError: err => toast.error(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return;
    createPost.mutate({
      ...form,
      school: form.school || undefined,
      program: form.program || undefined,
      result: form.type === "result" ? form.result : undefined,
      gpa: form.gpa || undefined,
      datAa: form.datAa || undefined,
      datPat: form.datPat || undefined,
      province: form.province || undefined,
    });
    events.communityPostCreated(form.type);
  };

  if (!isAuthenticated) {
    return (
      <Button className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white" asChild>
        <Link to="/login">Log in to Post</Link>
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white">
          <Plus className="w-4 h-4 mr-1" /> Share Result
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[var(--page-surface)] border-[var(--border-color)] text-[var(--text-primary)] max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Share with the Community</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <label className="text-xs text-[var(--text-tertiary)] mb-1 block">
              Post Type
            </label>
            <Select
              value={form.type}
              onValueChange={v =>
                setForm({ ...form, type: v as typeof form.type })
              }
            >
              <SelectTrigger className="bg-[var(--page-muted)] border-[var(--border-color)] text-[var(--text-primary)]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[var(--page-surface)] border-[var(--border-color)]">
                <SelectItem value="result">Admission Result</SelectItem>
                <SelectItem value="question">Question</SelectItem>
                <SelectItem value="discussion">Discussion</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs text-[var(--text-tertiary)] mb-1 block">
              Title
            </label>
            <Input
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="e.g., Accepted to UofT DDS!"
              className="bg-[var(--page-muted)] border-[var(--border-color)] text-[var(--text-primary)]"
            />
          </div>

          {form.type === "result" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-[var(--text-tertiary)] mb-1 block">
                  School
                </label>
                <Select
                  value={form.school}
                  onValueChange={v => setForm({ ...form, school: v })}
                >
                  <SelectTrigger className="bg-[var(--page-muted)] border-[var(--border-color)] text-[var(--text-primary)]">
                    <SelectValue placeholder="Select school" />
                  </SelectTrigger>
                  <SelectContent className="bg-[var(--page-surface)] border-[var(--border-color)]">
                    {schools.map(s => (
                      <SelectItem key={s.id} value={s.name}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-[var(--text-tertiary)] mb-1 block">
                  Result
                </label>
                <Select
                  value={form.result}
                  onValueChange={v =>
                    setForm({ ...form, result: v as typeof form.result })
                  }
                >
                  <SelectTrigger className="bg-[var(--page-muted)] border-[var(--border-color)] text-[var(--text-primary)]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[var(--page-surface)] border-[var(--border-color)]">
                    <SelectItem value="Accepted">Accepted</SelectItem>
                    <SelectItem value="Interview Invite">
                      Interview Invite
                    </SelectItem>
                    <SelectItem value="Waitlisted">Waitlisted</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-[var(--text-tertiary)] mb-1 block">
                  GPA
                </label>
                <Input
                  value={form.gpa}
                  onChange={e => setForm({ ...form, gpa: e.target.value })}
                  placeholder="3.95"
                  className="bg-[var(--page-muted)] border-[var(--border-color)] text-[var(--text-primary)]"
                />
              </div>
              <div>
                <label className="text-xs text-[var(--text-tertiary)] mb-1 block">
                  Province
                </label>
                <Select
                  value={form.province}
                  onValueChange={v =>
                    setForm({ ...form, province: v as "IP" | "OOP" })
                  }
                >
                  <SelectTrigger className="bg-[var(--page-muted)] border-[var(--border-color)] text-[var(--text-primary)]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[var(--page-surface)] border-[var(--border-color)]">
                    <SelectItem value="IP">IP</SelectItem>
                    <SelectItem value="OOP">OOP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-[var(--text-tertiary)] mb-1 block">
                  DAT AA
                </label>
                <Input
                  value={form.datAa}
                  onChange={e => setForm({ ...form, datAa: e.target.value })}
                  placeholder="24"
                  className="bg-[var(--page-muted)] border-[var(--border-color)] text-[var(--text-primary)]"
                />
              </div>
              <div>
                <label className="text-xs text-[var(--text-tertiary)] mb-1 block">
                  DAT PAT
                </label>
                <Input
                  value={form.datPat}
                  onChange={e => setForm({ ...form, datPat: e.target.value })}
                  placeholder="23"
                  className="bg-[var(--page-muted)] border-[var(--border-color)] text-[var(--text-primary)]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs text-[var(--text-tertiary)] mb-1 block">
              Details
            </label>
            <Textarea
              value={form.content}
              onChange={e => setForm({ ...form, content: e.target.value })}
              placeholder="Share your experience or ask a question..."
              rows={4}
              className="bg-[var(--page-muted)] border-[var(--border-color)] text-[var(--text-primary)]"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
            disabled={createPost.isPending}
          >
            {createPost.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-1" />
            ) : (
              "Share Post"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditPostDialog({
  post,
  onClose,
}: {
  post: {
    id: number;
    title: string;
    content: string;
    school?: string | null;
    program?: string | null;
    result?: string | null;
    gpa?: string | null;
    datAa?: string | null;
    datPat?: string | null;
    province?: string | null;
  };
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    title: post.title,
    content: post.content,
    school: post.school ?? "",
    program: post.program ?? "DDS",
    result: (post.result ?? "Accepted") as
      | "Accepted"
      | "Interview Invite"
      | "Waitlisted"
      | "Rejected",
    gpa: post.gpa ?? "",
    datAa: post.datAa ?? "",
    datPat: post.datPat ?? "",
    province: (post.province ?? "IP") as "IP" | "OOP",
  });

  const editPost = trpc.community.editPost.useMutation({
    onSuccess: () => {
      toast.success("Post updated");
      onClose();
    },
    onError: err => toast.error(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return;
    editPost.mutate({
      postId: post.id,
      title: form.title,
      content: form.content,
      school: form.school || undefined,
      program: form.program || undefined,
      result: form.result,
      gpa: form.gpa || undefined,
      datAa: form.datAa || undefined,
      datPat: form.datPat || undefined,
      province: form.province || undefined,
    });
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-[var(--page-surface)] border-[var(--border-color)] text-[var(--text-primary)] max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Post</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <label className="text-xs text-[var(--text-tertiary)] mb-1 block">
              Title
            </label>
            <Input
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="e.g., Accepted to UofT DDS!"
              className="bg-[var(--page-muted)] border-[var(--border-color)] text-[var(--text-primary)]"
            />
          </div>

          <div>
            <label className="text-xs text-[var(--text-tertiary)] mb-1 block">
              Content
            </label>
            <Textarea
              value={form.content}
              onChange={e => setForm({ ...form, content: e.target.value })}
              placeholder="Share your experience, ask a question, or start a discussion..."
              rows={4}
              className="bg-[var(--page-muted)] border-[var(--border-color)] text-[var(--text-primary)]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[var(--text-tertiary)] mb-1 block">
                School
              </label>
              <Select
                value={form.school}
                onValueChange={v => setForm({ ...form, school: v })}
              >
                <SelectTrigger className="bg-[var(--page-muted)] border-[var(--border-color)] text-[var(--text-primary)]">
                  <SelectValue placeholder="Select school" />
                </SelectTrigger>
                <SelectContent className="bg-[var(--page-surface)] border-[var(--border-color)]">
                  {schools.map(s => (
                    <SelectItem key={s.id} value={s.name}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-[var(--text-tertiary)] mb-1 block">
                Program
              </label>
              <Select
                value={form.program}
                onValueChange={v => setForm({ ...form, program: v })}
              >
                <SelectTrigger className="bg-[var(--page-muted)] border-[var(--border-color)] text-[var(--text-primary)]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[var(--page-surface)] border-[var(--border-color)]">
                  <SelectItem value="DDS">DDS</SelectItem>
                  <SelectItem value="DMD">DMD</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[var(--text-tertiary)] mb-1 block">
                Result
              </label>
              <Select
                value={form.result}
                onValueChange={v =>
                  setForm({ ...form, result: v as typeof form.result })
                }
              >
                <SelectTrigger className="bg-[var(--page-muted)] border-[var(--border-color)] text-[var(--text-primary)]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[var(--page-surface)] border-[var(--border-color)]">
                  <SelectItem value="Accepted">Accepted</SelectItem>
                  <SelectItem value="Interview Invite">
                    Interview Invite
                  </SelectItem>
                  <SelectItem value="Waitlisted">Waitlisted</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-[var(--text-tertiary)] mb-1 block">
                Province
              </label>
              <Select
                value={form.province}
                onValueChange={v =>
                  setForm({ ...form, province: v as typeof form.province })
                }
              >
                <SelectTrigger className="bg-[var(--page-muted)] border-[var(--border-color)] text-[var(--text-primary)]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[var(--page-surface)] border-[var(--border-color)]">
                  <SelectItem value="IP">In-Province</SelectItem>
                  <SelectItem value="OOP">Out-of-Province</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-[var(--text-tertiary)] mb-1 block">
                GPA
              </label>
              <Input
                value={form.gpa}
                onChange={e => setForm({ ...form, gpa: e.target.value })}
                placeholder="e.g., 3.9"
                className="bg-[var(--page-muted)] border-[var(--border-color)] text-[var(--text-primary)]"
              />
            </div>
            <div>
              <label className="text-xs text-[var(--text-tertiary)] mb-1 block">
                DAT AA
              </label>
              <Input
                value={form.datAa}
                onChange={e => setForm({ ...form, datAa: e.target.value })}
                placeholder="e.g., 22"
                className="bg-[var(--page-muted)] border-[var(--border-color)] text-[var(--text-primary)]"
              />
            </div>
            <div>
              <label className="text-xs text-[var(--text-tertiary)] mb-1 block">
                DAT PAT
              </label>
              <Input
                value={form.datPat}
                onChange={e => setForm({ ...form, datPat: e.target.value })}
                placeholder="e.g., 20"
                className="bg-[var(--page-muted)] border-[var(--border-color)] text-[var(--text-primary)]"
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-[var(--border-color)] text-[var(--text-secondary)]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
              disabled={editPost.isPending}
            >
              {editPost.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-1" />
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

const TYPE_BADGE_CLASS: Record<string, string> = {
  result: "bg-[#10B981] text-white",
  question: "bg-[#2563EB] text-white",
  discussion: "bg-[#8B5CF6] text-white",
};

const TYPE_LABELS: Record<string, string> = {
  result: "Result",
  question: "Question",
  discussion: "Discussion",
};

export default function CommunityHubPage() {
  usePageTitle("Community Hub");
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("all");
  const [expandedPostId, setExpandedPostId] = useState<number | null>(null);
  const [likedPostIds, setLikedPostIds] = useState<Set<number>>(new Set());
  const [reportTarget, setReportTarget] = useState<{
    postId?: number;
    commentId?: number;
  } | null>(null);
  const [editingPost, setEditingPost] = useState<{
    id: number;
    title: string;
    content: string;
    school?: string | null;
    program?: string | null;
    result?: string | null;
    gpa?: string | null;
    datAa?: string | null;
    datPat?: string | null;
    province?: string | null;
  } | null>(null);

  const typeFilter =
    activeTab === "all"
      ? undefined
      : (activeTab as "result" | "question" | "discussion");

  const postsQuery = trpc.community.listPostsPage.useInfiniteQuery(
    { type: typeFilter, limit: 10 },
    { getNextPageParam: lastPage => lastPage.nextCursor ?? undefined }
  );

  const countQuery = trpc.community.getPostCount.useQuery({});
  const likePost = trpc.community.likePost.useMutation({
    onMutate: ({ postId }) => {
      setLikedPostIds(prev => new Set(prev).add(postId));
    },
    onSuccess: () => postsQuery.refetch(),
    onError: (_err, { postId }) => {
      setLikedPostIds(prev => {
        const next = new Set(prev);
        next.delete(postId);
        return next;
      });
      toast.error("Could not like post. Please try again.");
    },
  });

  const deletePost = trpc.community.deletePost.useMutation({
    onSuccess: () => {
      toast.success("Post deleted");
      postsQuery.refetch();
      countQuery.refetch();
    },
    onError: err => toast.error(err.message),
  });

  const results = postsQuery.data?.pages.flatMap(page => page.items) ?? [];

  const tabs = [
    { value: "all", label: "All" },
    { value: "result", label: "Results" },
    { value: "question", label: "Questions" },
    { value: "discussion", label: "Discussions" },
  ];

  return (
    <main className="min-h-screen bg-[var(--page-bg)]">
      {reportTarget && (
        <ReportDialog
          postId={reportTarget.postId}
          commentId={reportTarget.commentId}
          onClose={() => setReportTarget(null)}
        />
      )}

      {editingPost && (
        <EditPostDialog
          post={editingPost}
          onClose={() => setEditingPost(null)}
        />
      )}

      {/* Hero */}
      <div className="pt-20 pb-12 bg-gradient-to-br from-[var(--page-bg)] to-[var(--page-surface)]">
        <div className="section-container max-w-7xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#8B5CF6] flex items-center justify-center">
                <Users className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-[var(--text-primary)] mb-1">
                  Community Hub
                </h1>
                <p className="text-[var(--text-secondary)] max-w-2xl">
                  Connect with fellow Canadian pre-dental students, share
                  admission results, join study groups, and learn from experts.
                </p>
              </div>
            </div>
            <CreatePostDialog onCreated={() => postsQuery.refetch()} />
          </div>
        </div>
      </div>

      <div className="section-container max-w-7xl mx-auto px-4 -mt-8 pb-20">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "Total Posts",
              value: `${countQuery.data ?? 0}`,
              icon: Trophy,
            },
            {
              label: "Results Shared",
              value: `${countQuery.data ?? 0}`,
              icon: Trophy,
            },
            {
              label: "Schools Covered",
              value: `${schools.length}`,
              icon: GraduationCap,
            },
            {
              label: "Active Discussions",
              value: `${countQuery.data ?? 0}`,
              icon: MessageSquare,
            },
          ].map((stat, i) => (
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
          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="bg-[var(--page-surface)] border-[var(--border-color)]">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-[var(--text-primary)]">
                  <Trophy className="w-5 h-5 text-[#F59E0B]" />
                  Community Feed
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Tab Bar */}
                <div className="flex gap-1 mb-4 p-1 bg-[var(--page-muted)] rounded-lg">
                  {tabs.map(tab => (
                    <button
                      key={tab.value}
                      className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                        activeTab === tab.value
                          ? "bg-[var(--page-surface)] text-[var(--text-primary)] shadow-sm"
                          : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
                      }`}
                      onClick={() => setActiveTab(tab.value)}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="space-y-4">
                  {postsQuery.isLoading && (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-[#2563EB]" />
                    </div>
                  )}

                  {!postsQuery.isLoading && results.length === 0 && (
                    <div className="text-center py-8 text-[var(--text-secondary)] text-sm">
                      No posts yet. Be the first!
                    </div>
                  )}

                  {results.map(post => (
                    <div key={post.id}>
                      <div className="p-4 rounded-xl bg-[var(--page-bg)] border border-[var(--border-color)]">
                        <div className="flex items-start gap-3 mb-3">
                          <Avatar className="w-10 h-10">
                            {post.authorAvatar && (
                              <AvatarImage src={post.authorAvatar} />
                            )}
                            <AvatarFallback className="bg-[#2563EB]/10 text-[#2563EB] text-xs font-bold">
                              {post.authorName?.slice(0, 2).toUpperCase() ??
                                "AN"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-semibold text-[var(--text-primary)]">
                                  {post.authorName ?? "Anonymous"}
                                </p>
                                <Badge
                                  className={`text-[10px] px-1.5 py-0 ${TYPE_BADGE_CLASS[post.type] ?? ""}`}
                                >
                                  {TYPE_LABELS[post.type] ?? post.type}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="text-xs text-[var(--text-tertiary)]">
                                  {timeAgo(post.createdAt)}
                                </span>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <button className="p-1 rounded-md hover:bg-[var(--page-muted)] transition-colors text-[var(--text-tertiary)]">
                                      <MoreVertical className="w-4 h-4" />
                                    </button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent
                                    align="end"
                                    className="bg-[var(--page-surface)] border-[var(--border-color)]"
                                  >
                                    {user?.id === post.userId && (
                                      <>
                                        <DropdownMenuItem
                                          className="text-[var(--text-secondary)] focus:bg-[var(--page-muted)] focus:text-[var(--text-primary)]"
                                          onClick={() =>
                                            setEditingPost({
                                              id: post.id,
                                              title: post.title,
                                              content: post.content ?? "",
                                              school: post.school,
                                              program: post.program,
                                              result: post.result,
                                              gpa: post.gpa,
                                              datAa: post.datAa,
                                              datPat: post.datPat,
                                              province: post.province,
                                            })
                                          }
                                        >
                                          <Pencil className="w-3.5 h-3.5 mr-2" />
                                          Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          className="text-[#EF4444] focus:bg-[#EF4444]/10 focus:text-[#EF4444]"
                                          onClick={() =>
                                            deletePost.mutate({
                                              postId: post.id,
                                            })
                                          }
                                        >
                                          <Trash2 className="w-3.5 h-3.5 mr-2" />
                                          Delete
                                        </DropdownMenuItem>
                                      </>
                                    )}
                                    {user?.id !== post.userId && (
                                      <DropdownMenuItem
                                        className="text-[#EF4444] focus:bg-[#EF4444]/10 focus:text-[#EF4444]"
                                        onClick={() =>
                                          setReportTarget({
                                            postId: post.id,
                                          })
                                        }
                                      >
                                        <Flag className="w-3.5 h-3.5 mr-2" />
                                        Report
                                      </DropdownMenuItem>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                            <p className="text-sm font-medium text-[var(--text-primary)]">
                              {post.title}
                            </p>
                            {post.type === "result" && post.school && (
                              <p className="text-xs text-[var(--text-secondary)]">
                                {post.school} • {post.program ?? "DDS"} •{" "}
                                {post.province}
                              </p>
                            )}
                          </div>
                        </div>
                        {post.content && (
                          <p className="text-sm text-[var(--text-secondary)] mb-3">
                            {post.content}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          {post.result && (
                            <Badge
                              className={
                                post.result === "Accepted"
                                  ? "bg-[#10B981] hover:bg-[#10B981] text-white"
                                  : post.result === "Interview Invite"
                                    ? "bg-[#2563EB] hover:bg-[#2563EB] text-white"
                                    : post.result === "Waitlisted"
                                      ? "bg-[#F59E0B] hover:bg-[#F59E0B] text-white"
                                      : "bg-[#EF4444] hover:bg-[#EF4444] text-white"
                              }
                            >
                              {post.result}
                            </Badge>
                          )}
                          {post.gpa && (
                            <Badge variant="outline" className="text-xs">
                              GPA {post.gpa}
                            </Badge>
                          )}
                          {post.datAa && (
                            <Badge variant="outline" className="text-xs">
                              AA {post.datAa}
                            </Badge>
                          )}
                          {post.datPat && (
                            <Badge variant="outline" className="text-xs">
                              PAT {post.datPat}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-[var(--text-tertiary)]">
                          <button
                            className={`flex items-center gap-1 transition-colors ${
                              likedPostIds.has(post.id) || post.likedByViewer
                                ? "text-[#2563EB]"
                                : "hover:text-[#2563EB]"
                            }`}
                            onClick={() => {
                              if (isAuthenticated) {
                                if (
                                  likedPostIds.has(post.id) ||
                                  post.likedByViewer
                                ) {
                                  toast.info("You already liked this post");
                                  return;
                                }
                                likePost.mutate({ postId: post.id });
                                events.communityPostLiked();
                              } else {
                                toast.info("Log in to like");
                              }
                            }}
                            disabled={likePost.isPending}
                            aria-label="Like post"
                          >
                            <ThumbsUp
                              className={`w-3.5 h-3.5 ${likedPostIds.has(post.id) || post.likedByViewer ? "fill-current" : ""}`}
                            />{" "}
                            {post.likes +
                              (likedPostIds.has(post.id) && !post.likedByViewer
                                ? 1
                                : 0)}
                          </button>
                          <button
                            className="flex items-center gap-1 hover:text-[#2563EB] transition-colors"
                            onClick={() =>
                              setExpandedPostId(
                                expandedPostId === post.id ? null : post.id
                              )
                            }
                          >
                            <MessageCircle className="w-3.5 h-3.5" /> Comments
                          </button>
                        </div>

                        {expandedPostId === post.id && (
                          <CommentSection postId={post.id} />
                        )}
                      </div>
                    </div>
                  ))}

                  {postsQuery.hasNextPage && (
                    <Button
                      variant="outline"
                      className="w-full border-[var(--border-color)]"
                      onClick={() => postsQuery.fetchNextPage()}
                      disabled={postsQuery.isFetchingNextPage}
                    >
                      {postsQuery.isFetchingNextPage ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-1" />
                      ) : (
                        "View More"
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* School Forums */}
            <Card className="bg-[var(--page-surface)] border-[var(--border-color)]">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-[var(--text-primary)]">
                  <GraduationCap className="w-5 h-5 text-[#2563EB]" />
                  School-Specific Forums
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-3">
                  {schools.slice(0, 6).map(school => (
                    <Link
                      key={school.id}
                      to={`/school/${school.id}`}
                      className="flex items-center gap-3 p-3 rounded-lg bg-[var(--page-bg)] border border-[var(--border-color)] hover:border-[#2563EB]/50 transition-colors group"
                    >
                      <div
                        className="w-8 h-8 rounded-md flex items-center justify-center text-white font-bold text-xs shrink-0"
                        style={{ backgroundColor: school.color }}
                      >
                        {school.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--text-primary)] truncate group-hover:text-[#2563EB] transition-colors">
                          {school.name}
                        </p>
                        <p className="text-xs text-[var(--text-tertiary)]">
                          {school.program} • {school.seats} seats
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[var(--text-tertiary)]" />
                    </Link>
                  ))}
                </div>
                <div className="mt-4 text-center">
                  <Link
                    to="/schools"
                    className="text-sm text-[#2563EB] hover:underline inline-flex items-center gap-1"
                  >
                    View all 10 schools <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <Card className="bg-[var(--page-surface)] border-[var(--border-color)]">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2 text-[var(--text-primary)]">
                  <MessageSquare className="w-4 h-4 text-[#2563EB]" />
                  Community Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 rounded-lg bg-[var(--page-bg)] border border-[var(--border-color)]">
                  <p className="text-sm font-medium text-[var(--text-primary)] mb-1">
                    Share your results
                  </p>
                  <p className="text-xs text-[var(--text-tertiary)]">
                    Help fellow applicants by posting your admission outcomes
                    with GPA and DAT scores.
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-[var(--page-bg)] border border-[var(--border-color)]">
                  <p className="text-sm font-medium text-[var(--text-primary)] mb-1">
                    Ask questions
                  </p>
                  <p className="text-xs text-[var(--text-tertiary)]">
                    Got questions about a specific school? Post them and other
                    students who applied there will be notified.
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-[var(--page-bg)] border border-[var(--border-color)]">
                  <p className="text-sm font-medium text-[var(--text-primary)] mb-1">
                    Be respectful
                  </p>
                  <p className="text-xs text-[var(--text-tertiary)]">
                    Keep discussions constructive. Report inappropriate content
                    to help maintain a positive community.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* CTA */}
            <Card className="bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] border-0 text-white">
              <CardContent className="p-6">
                <h3 className="font-bold mb-2">Join the Community</h3>
                <p className="text-sm text-white/80 mb-4">
                  Log in to share your results, ask questions, and join study
                  groups with peers across Canada.
                </p>
                <Button
                  className="w-full bg-white text-[#2563EB] hover:bg-white/90"
                  asChild
                >
                  <Link to="/login">Log In / Sign Up</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
