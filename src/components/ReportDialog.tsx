import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Flag } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { toast } from "sonner";

const REASONS = [
  { value: "spam", label: "Spam" },
  { value: "harassment", label: "Harassment" },
  { value: "inappropriate", label: "Inappropriate" },
  { value: "other", label: "Other" },
] as const;

interface ReportDialogProps {
  postId?: number;
  commentId?: number;
  onClose: () => void;
}

export default function ReportDialog({
  postId,
  commentId,
  onClose,
}: ReportDialogProps) {
  const [reason, setReason] = useState<string>("");
  const [description, setDescription] = useState("");

  const reportPost = trpc.community.reportPost.useMutation({
    onSuccess: () => {
      toast.success("Report submitted. Thank you!");
      onClose();
    },
    onError: err => toast.error(err.message),
  });

  const reportComment = trpc.community.reportComment.useMutation({
    onSuccess: () => {
      toast.success("Report submitted. Thank you!");
      onClose();
    },
    onError: err => toast.error(err.message),
  });

  const isPending = reportPost.isPending || reportComment.isPending;

  const handleSubmit = () => {
    if (!reason) return;

    if (postId) {
      reportPost.mutate({
        postId,
        reason: reason as "spam" | "harassment" | "inappropriate" | "other",
        description: description.trim() || undefined,
      });
    } else if (commentId) {
      reportComment.mutate({
        commentId,
        reason: reason as "spam" | "harassment" | "inappropriate" | "other",
        description: description.trim() || undefined,
      });
    }
  };

  return (
    <Dialog open onOpenChange={open => !open && onClose()}>
      <DialogContent className="bg-[var(--page-surface)] border-[var(--border-color)] text-[var(--text-primary)] max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="w-4 h-4 text-[#EF4444]" />
            Report {commentId ? "Comment" : "Post"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div>
            <label className="text-xs text-[var(--text-tertiary)] mb-1 block">
              Reason
            </label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger className="bg-[var(--page-muted)] border-[var(--border-color)] text-[var(--text-primary)]">
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent className="bg-[var(--page-surface)] border-[var(--border-color)]">
                {REASONS.map(r => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs text-[var(--text-tertiary)] mb-1 block">
              Additional details (optional)
            </label>
            <Textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Provide more context..."
              rows={3}
              className="bg-[var(--page-muted)] border-[var(--border-color)] text-[var(--text-primary)]"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              className="border-[var(--border-color)] text-[var(--text-secondary)]"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              className="bg-[#EF4444] hover:bg-[#DC2626] text-white"
              onClick={handleSubmit}
              disabled={!reason || isPending}
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-1" />
              ) : (
                "Submit Report"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
