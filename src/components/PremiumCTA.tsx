import { Link } from "react-router-dom";
import { Crown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { toast } from "sonner";

interface PremiumCTAProps {
  buttonText?: string;
  plan?: "premium_monthly" | "premium_3month" | "premium_yearly";
  size?: "default" | "lg";
}

export function PremiumCTA({
  buttonText = "Get Premium",
  plan = "premium_monthly",
  size = "default",
}: PremiumCTAProps) {
  const { isAuthenticated } = useAuth();

  const checkout = trpc.payment.createCheckoutSession.useMutation({
    onSuccess: data => {
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error("Unable to start checkout. Please try again.");
      }
    },
    onError: err => {
      toast.error(err.message || "Checkout failed. Please try again.");
    },
  });

  const handleClick = () => {
    if (!isAuthenticated) {
      toast.info("Please log in to upgrade.");
      return;
    }
    checkout.mutate({ plan });
  };

  const content = (
    <>
      <Crown className="w-4 h-4" />
      {checkout.isPending ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        buttonText
      )}
    </>
  );

  if (!isAuthenticated) {
    return (
      <Button
        size={size}
        className="bg-[#F59E0B] hover:bg-[#D97706] text-white font-semibold"
        asChild
      >
        <Link to="/login">{content}</Link>
      </Button>
    );
  }

  return (
    <Button
      size={size}
      className="bg-[#F59E0B] hover:bg-[#D97706] text-white font-semibold"
      onClick={handleClick}
      disabled={checkout.isPending}
    >
      {content}
    </Button>
  );
}

export function PremiumLock({
  title = "Premium Feature",
  description = "Upgrade to Premium to unlock this feature.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="rounded-xl border border-[#F59E0B]/30 bg-[#F59E0B]/5 p-6 text-center">
      <Crown className="w-8 h-8 text-[#F59E0B] mx-auto mb-3" />
      <h3 className="text-base font-semibold text-[var(--text-primary)] mb-1">
        {title}
      </h3>
      <p className="text-sm text-[var(--text-secondary)] mb-4">{description}</p>
      <PremiumCTA size="default" />
    </div>
  );
}
