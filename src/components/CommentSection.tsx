import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Trash2, MessageCircle } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Link } from "react-router-dom";

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

export default function CommentSection({ postId }: { postId: number }) {
  const { user, isAuthenticated } = useAuth();
  const [newComment, setNewComment] = useState("");

  const postQuery = trpc.community.getPost.useQuery({ postId });

  const createComment = trpc.community.createComment.useMutation({
    onSuccess: () => {
      setNewComment("");
      postQuery.refetch();
      toast.success("Comment added");
    },
    onError: err => toast.error(err.message),
  });

  const deleteComment = trpc.community.deleteComment.useMutation({
    onSuccess: () => {
      postQuery.refetch();
      toast.success("Comment deleted");
    },
    onError: err => toast.error(err.message),
  });

  if (postQuery.isLoading) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="w-5 h-5 animate-spin text-[#2563EB]" />
      </div>
    );
  }

  const comments = postQuery.data?.comments ?? [];

  return (
    <div className="mt-3 pt-3 border-t border-[var(--border-color)]">
      <div className="flex items-center gap-1.5 mb-3">
        <MessageCircle className="w-4 h-4 text-[var(--text-tertiary)]" />
        <span className="text-sm font-medium text-[var(--text-primary)]">
          {postQuery.data?.commentCount ?? 0} Comments
        </span>
      </div>

      <div className="space-y-3 mb-3">
        {comments.map(comment => (
          <div key={comment.id} className="flex gap-2">
            <Avatar className="w-7 h-7 shrink-0">
              {comment.authorAvatar && (
                <AvatarImage src={comment.authorAvatar} />
              )}
              <AvatarFallback className="bg-[#2563EB]/10 text-[#2563EB] text-[10px] font-bold">
                {comment.authorName?.slice(0, 2).toUpperCase() ?? "AN"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[var(--text-primary)]">
                  {comment.authorName ?? "Anonymous"}
                </span>
                <span className="text-[10px] text-[var(--text-tertiary)]">
                  {timeAgo(comment.createdAt)}
                </span>
                {user?.id === comment.userId && (
                  <button
                    className="ml-auto text-[var(--text-tertiary)] hover:text-[#EF4444] transition-colors"
                    onClick={() =>
                      deleteComment.mutate({ commentId: comment.id })
                    }
                    disabled={deleteComment.isPending}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
              <p className="text-xs text-[var(--text-secondary)]">
                {comment.content}
              </p>
            </div>
          </div>
        ))}

        {comments.length === 0 && (
          <p className="text-xs text-[var(--text-tertiary)] text-center py-2">
            No comments yet
          </p>
        )}
      </div>

      {isAuthenticated ? (
        <div className="flex gap-2">
          <Textarea
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            rows={2}
            className="text-xs bg-[var(--page-muted)] border-[var(--border-color)] text-[var(--text-primary)] min-h-[60px]"
          />
          <Button
            size="sm"
            className="shrink-0 bg-[#2563EB] hover:bg-[#1D4ED8] text-white self-end"
            onClick={() => {
              if (newComment.trim()) {
                createComment.mutate({
                  postId,
                  content: newComment.trim(),
                });
              }
            }}
            disabled={createComment.isPending || !newComment.trim()}
          >
            {createComment.isPending ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              "Post"
            )}
          </Button>
        </div>
      ) : (
        <p className="text-xs text-[var(--text-tertiary)] text-center">
          <Link to="/login" className="text-[#2563EB] hover:underline">
            Log in
          </Link>{" "}
          to comment
        </p>
      )}
    </div>
  );
}
