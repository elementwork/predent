import { Link, useSearchParams } from "react-router-dom";
import { useState } from "react";
import {
  ArrowLeft,
  Check,
  X,
  Shield,
  Sparkles,
  Zap,
  Crown,
  Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { toast } from "sonner";
import { events } from "@/lib/analytics";

const features = [
  { name: "School Database Access", free: true, premium: true, plus: true },
  { name: "Basic GPA Calculator", free: true, premium: true, plus: true },
  { name: "PAT Practice Questions", free: true, premium: true, plus: true },
  {
    name: "Angle Ranking Generator",
    free: true,
    premium: true,
    plus: true,
  },
  {
    name: "Application Tracker (3 schools)",
    free: true,
    premium: true,
    plus: true,
  },
  { name: "Read-Only Community Access", free: true, premium: true, plus: true },
  {
    name: "Unlimited PAT Question Bank",
    free: false,
    premium: true,
    plus: true,
  },
  {
    name: "All 6 PAT Generators (Unlimited)",
    free: false,
    premium: true,
    plus: true,
  },
  {
    name: "Interactive PAT Diagrams",
    free: false,
    premium: true,
    plus: true,
  },
  {
    name: "DAT Biology, Chemistry & Reading Practice",
    free: false,
    premium: true,
    plus: true,
  },
  {
    name: "Study Schedule Generator",
    free: false,
    premium: true,
    plus: true,
  },
  {
    name: "Unlimited Application Tracker",
    free: false,
    premium: true,
    plus: true,
  },
  {
    name: "Full Interview Question Bank",
    free: false,
    premium: true,
    plus: true,
  },
  {
    name: "Multi-School Competitiveness Calculator",
    free: false,
    premium: true,
    plus: true,
  },
  { name: "Progress Analytics", free: false, premium: true, plus: true },
  { name: "Priority Email Support", free: false, premium: true, plus: true },
  {
    name: "Lifetime Access (No Recurring)",
    free: false,
    premium: false,
    plus: true,
  },
  {
    name: "Early Access to New Features",
    free: false,
    premium: false,
    plus: true,
  },
];

export default function PricingPage() {
  const { isAuthenticated } = useAuth();
  const [isAnnual, setIsAnnual] = useState(true);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const success = searchParams.get("success");
  const canceled = searchParams.get("canceled");

  const checkout = trpc.payment.createCheckoutSession.useMutation({
    onSuccess: data => {
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error("Unable to start checkout. Please try again.");
      }
      setLoadingPlan(null);
    },
    onError: err => {
      toast.error(err.message || "Checkout failed. Please try again.");
      setLoadingPlan(null);
    },
  });

  const handleCheckout = (
    plan: "premium_monthly" | "premium_yearly" | "plus_lifetime"
  ) => {
    if (!isAuthenticated) {
      toast.info("Please log in to upgrade.");
      return;
    }
    setLoadingPlan(plan);
    checkout.mutate({ plan });
    events.upgradeClicked(
      plan === "plus_lifetime" ? "premium_plus" : "premium"
    );
  };

  return (
    <main className="min-h-screen bg-[var(--page-bg)]">
      <div className="section-container max-w-7xl mx-auto pt-24 pb-20">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] text-sm mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="text-center mb-10">
          <h1 className="text-3xl lg:text-4xl font-bold text-[var(--text-primary)] mb-3">
            DAT Prep Plans: Free, Premium & Premium Plus
          </h1>
          <p className="text-[var(--text-tertiary)] max-w-lg mx-auto mb-6">
            Start free. Upgrade to unlock unlimited PAT generators, DAT
            practice, and the school competitiveness calculator.
          </p>

          {success && (
            <div className="mb-6 p-4 rounded-lg bg-[#10B981]/10 border border-[#10B981]/30 text-[#047857] text-sm">
              Thanks for your purchase! Your account has been upgraded.
            </div>
          )}
          {canceled && (
            <div className="mb-6 p-4 rounded-lg bg-[#F59E0B]/10 border border-[#F59E0B]/30 text-[#92400E] text-sm">
              Checkout canceled. You can upgrade anytime.
            </div>
          )}

          {/* Toggle */}
          <div className="inline-flex items-center gap-3 p-1 rounded-lg bg-[var(--page-surface)] border border-[var(--border-color)]">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${!isAnnual ? "bg-[#2563EB] text-white" : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-1.5 ${isAnnual ? "bg-[#2563EB] text-white" : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"}`}
            >
              Annual
              <span className="px-1.5 py-0.5 rounded bg-[#047857] text-white text-[10px] font-bold">
                SAVE 28%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {/* Free */}
          <Card className="bg-[var(--page-surface)] border-[var(--border-color)]">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-[#94A3B8]" />
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                  Free
                </h3>
              </div>
              <div className="mb-4">
                <span className="text-3xl font-bold text-[var(--text-primary)]">
                  $0
                </span>
                <span className="text-sm text-[var(--text-tertiary)] ml-1">
                  forever
                </span>
              </div>
              <p className="text-xs text-[var(--text-tertiary)] mb-6">
                Perfect for exploring and getting started.
              </p>
              <Button
                variant="outline"
                className="w-full h-10 border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--page-muted)] mb-4"
                asChild
              >
                <Link to={isAuthenticated ? "/pat-academy" : "/login"}>
                  Start Free
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Premium */}
          <Card className="bg-[var(--page-surface)] border-[#2563EB]/50 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-[#2563EB] text-white text-[10px] font-bold rounded-full">
              MOST POPULAR
            </div>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-[#F59E0B]" />
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                  Premium
                </h3>
              </div>
              <div className="mb-4">
                <span className="text-3xl font-bold text-[var(--text-primary)]">
                  {isAnnual ? "$249" : "$29"}
                </span>
                <span className="text-sm text-[var(--text-tertiary)] ml-1">
                  {isAnnual ? "/year" : "/month"}
                </span>
              </div>
              <p className="text-xs text-[var(--text-tertiary)] mb-6">
                Everything you need for serious DAT prep.
              </p>
              <Button
                className="w-full h-10 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold mb-4"
                onClick={() =>
                  handleCheckout(
                    isAnnual ? "premium_yearly" : "premium_monthly"
                  )
                }
                disabled={!!loadingPlan}
              >
                {loadingPlan ===
                (isAnnual ? "premium_yearly" : "premium_monthly") ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Get Premium"
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Premium Plus */}
          <Card className="bg-gradient-to-br from-[#F59E0B]/10 to-[#8B5CF6]/10 border-[#F59E0B]/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Crown className="w-5 h-5 text-[#F59E0B]" />
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                  Premium Plus
                </h3>
              </div>
              <div className="mb-4">
                <span className="text-3xl font-bold text-[var(--text-primary)]">
                  $149
                </span>
                <span className="text-sm text-[var(--text-tertiary)] ml-1">
                  one-time
                </span>
              </div>
              <p className="text-xs text-[var(--text-tertiary)] mb-6">
                Lifetime access + personal coaching.
              </p>
              <Button
                className="w-full h-10 bg-[#92400E] hover:bg-[#78350F] text-white font-semibold mb-4"
                onClick={() => handleCheckout("plus_lifetime")}
                disabled={!!loadingPlan}
              >
                {loadingPlan === "plus_lifetime" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Get Premium Plus"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Feature Comparison */}
        <Card className="bg-[var(--page-surface)] border-[var(--border-color)] mb-8">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
              Feature Comparison
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--border-color)]">
                    <th className="text-left py-2 px-3 text-xs font-semibold text-[var(--text-tertiary)]">
                      Feature
                    </th>
                    <th className="text-center py-2 px-3 text-xs font-semibold text-[var(--text-tertiary)] w-20">
                      Free
                    </th>
                    <th className="text-center py-2 px-3 text-xs font-semibold text-[#2563EB] w-24">
                      Premium
                    </th>
                    <th className="text-center py-2 px-3 text-xs font-semibold text-[#92400E] w-24">
                      Plus
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {features.map((f, i) => (
                    <tr
                      key={i}
                      className="border-b border-[var(--border-color)] hover:bg-[var(--page-muted)]"
                    >
                      <td className="py-2 px-3 text-xs text-[var(--text-secondary)]">
                        {f.name}
                      </td>
                      <td className="text-center py-2 px-3">
                        {f.free ? (
                          <Check className="w-3.5 h-3.5 text-[#10B981] mx-auto" />
                        ) : (
                          <X className="w-3.5 h-3.5 text-[var(--text-tertiary)] mx-auto" />
                        )}
                      </td>
                      <td className="text-center py-2 px-3">
                        {f.premium ? (
                          <Check className="w-3.5 h-3.5 text-[#10B981] mx-auto" />
                        ) : (
                          <X className="w-3.5 h-3.5 text-[var(--text-tertiary)] mx-auto" />
                        )}
                      </td>
                      <td className="text-center py-2 px-3">
                        {f.plus ? (
                          <Check className="w-3.5 h-3.5 text-[#10B981] mx-auto" />
                        ) : (
                          <X className="w-3.5 h-3.5 text-[var(--text-tertiary)] mx-auto" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Guarantee */}
        <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-[#10B981]/10 border border-[#10B981]/20">
          <Shield className="w-6 h-6 text-[#10B981]" />
          <div>
            <p className="text-sm font-semibold text-[#047857]">
              Higher Score Guarantee
            </p>
            <p className="text-xs text-[#475569]">
              Score higher on the DAT or get your money back. See{" "}
              <Link
                to="/legal/guarantee"
                className="underline hover:text-[#2563EB]"
              >
                guarantee terms
              </Link>{" "}
              for details.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
