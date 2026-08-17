import { Link, useSearchParams } from "react-router-dom";
import { useState } from "react";
import {
  ArrowLeft,
  Check,
  X,
  Shield,
  Zap,
  CalendarRange,
  Infinity as InfinityIcon,
  Crown,
  Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { toast } from "sonner";
import { events } from "@/lib/analytics";

type Plan = "premium_monthly" | "premium_3month" | "premium_yearly";

const PLAN_RANK: Record<Plan, number> = {
  premium_monthly: 1,
  premium_3month: 2,
  premium_yearly: 3,
};

const features = [
  { name: "School Database Access", free: true, premium: true },
  { name: "Basic GPA Calculator", free: true, premium: true },
  { name: "PAT Practice Questions", free: true, premium: true },
  { name: "Angle Ranking Generator", free: true, premium: true },
  { name: "Application Tracker (3 schools)", free: true, premium: true },
  { name: "Read-Only Community Access", free: true, premium: true },
  { name: "Unlimited PAT Question Bank", free: false, premium: true },
  { name: "All 6 PAT Generators (Unlimited)", free: false, premium: true },
  { name: "Interactive PAT Diagrams", free: false, premium: true },
  {
    name: "DAT Biology, Chemistry & Reading Practice",
    free: false,
    premium: true,
  },
  { name: "Study Schedule Generator", free: false, premium: true },
  { name: "Unlimited Application Tracker", free: false, premium: true },
  { name: "Full Interview Question Bank", free: false, premium: true },
  { name: "Multi-School Competitiveness Calculator", free: false, premium: true },
  { name: "Progress Analytics", free: false, premium: true },
  { name: "Priority Email Support", free: false, premium: true },
];

const plans: {
  key: Plan | null;
  name: string;
  price: string;
  cadence: string;
  blurb: string;
  badge?: string;
  icon: typeof Zap;
  highlighted?: boolean;
  cta: string;
}[] = [
  {
    key: null,
    name: "Free",
    price: "$0",
    cadence: "forever",
    blurb: "Perfect for exploring and getting started.",
    icon: Zap,
    cta: "Start Free",
  },
  {
    key: "premium_monthly",
    name: "Monthly",
    price: "$39",
    cadence: "per month",
    blurb: "Full access, month to month. Cancel anytime.",
    icon: CalendarRange,
    cta: "Get Monthly",
  },
  {
    key: "premium_3month",
    name: "3-Month",
    price: "$99",
    cadence: "90 days",
    blurb: "One payment for an exam-window sprint.",
    icon: Crown,
    badge: "EXAM WINDOW",
    cta: "Get 3-Month",
  },
  {
    key: "premium_yearly",
    name: "Annual",
    price: "$249",
    cadence: "per year",
    blurb: "Best value for a full test + application cycle.",
    icon: InfinityIcon,
    badge: "BEST VALUE",
    highlighted: true,
    cta: "Get Annual",
  },
];

export default function PricingPage() {
  const { isAuthenticated, user } = useAuth();
  const currentPlan = (user?.plan ?? null) as Plan | null;
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

  const upgrade = trpc.payment.upgrade.useMutation({
    onSuccess: data => {
      if (data.applied) {
        toast.success("Your account has been upgraded!");
      } else if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error("Unable to start checkout. Please try again.");
      }
      setLoadingPlan(null);
    },
    onError: err => {
      toast.error(err.message || "Upgrade failed. Please try again.");
      setLoadingPlan(null);
    },
  });

  const handleCheckout = (plan: Plan) => {
    if (!isAuthenticated) {
      toast.info("Please log in to upgrade.");
      return;
    }
    setLoadingPlan(plan);
    if (currentPlan && PLAN_RANK[plan] > PLAN_RANK[currentPlan]) {
      upgrade.mutate({
        plan: plan as "premium_3month" | "premium_yearly",
      });
      events.upgradeClicked("premium");
      return;
    }
    checkout.mutate({ plan });
    events.upgradeClicked("premium");
  };

  const isCurrent = (key: Plan | null) =>
    key !== null && currentPlan === key;

  return (
    <main className="min-h-screen bg-[var(--page-bg)]">
      <div className="section-container max-w-6xl mx-auto pt-24 pb-20">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] text-sm mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="text-center mb-10">
          <h1 className="text-3xl lg:text-4xl font-bold text-[var(--text-primary)] mb-3">
            DAT Prep Plans: Free, Monthly, 3-Month & Annual
          </h1>
          <p className="text-[var(--text-tertiary)] max-w-lg mx-auto mb-2">
            Start free. Upgrade to unlock unlimited PAT generators, DAT
            practice, and the school competitiveness calculator.
          </p>
          <p className="text-xs text-[var(--text-tertiary)]">
            All prices in CAD. Every paid plan is upgradable — pay only the
            difference.
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
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {plans.map(plan => {
            const current = isCurrent(plan.key);
            const canUpgrade =
              plan.key !== null &&
              currentPlan !== null &&
              PLAN_RANK[plan.key] > PLAN_RANK[currentPlan];
            const Icon = plan.icon;
            return (
              <Card
                key={plan.name}
                className={
                  plan.highlighted
                    ? "bg-[var(--page-surface)] border-[#2563EB]/50 relative"
                    : "bg-[var(--page-surface)] border-[var(--border-color)]"
                }
              >
                <CardContent className="p-6">
                  {plan.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-[#2563EB] text-white text-[10px] font-bold rounded-full whitespace-nowrap">
                      {plan.badge}
                    </div>
                  )}
                  <div className="flex items-center gap-2 mb-4">
                    <Icon
                      className={`w-5 h-5 ${plan.highlighted ? "text-[#F59E0B]" : "text-[#94A3B8]"}`}
                    />
                    <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                      {plan.name}
                    </h3>
                  </div>
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-[var(--text-primary)]">
                      {plan.price}
                    </span>
                    <span className="text-sm text-[var(--text-tertiary)] ml-1">
                      {plan.cadence}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-tertiary)] mb-6 min-h-8">
                    {plan.blurb}
                  </p>
                  {plan.key === null ? (
                    <Button
                      variant="outline"
                      className="w-full h-10 border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--page-muted)] mb-4"
                      asChild
                    >
                      <Link to={isAuthenticated ? "/pat-academy" : "/login"}>
                        {plan.cta}
                      </Link>
                    </Button>
                  ) : current ? (
                    <Button
                      className="w-full h-10 mb-4 bg-[var(--page-muted)] text-[var(--text-secondary)] cursor-default"
                      disabled
                    >
                      Current Plan
                    </Button>
                  ) : (
                    <Button
                      className={`w-full h-10 mb-4 font-semibold ${plan.highlighted ? "bg-[#2563EB] hover:bg-[#1D4ED8]" : "bg-[#92400E] hover:bg-[#78350F]"} text-white`}
                      onClick={() => handleCheckout(plan.key!)}
                      disabled={!!loadingPlan}
                    >
                      {loadingPlan === plan.key ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : canUpgrade ? (
                        "Upgrade"
                      ) : (
                        plan.cta
                      )}
                    </Button>
                  )}
                  {plan.key === "premium_yearly" && (
                    <p className="flex items-center justify-center gap-1 text-[10px] text-[#047857]">
                      <Shield className="w-3 h-3" /> Higher Score Guarantee
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
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
              Score higher on the DAT or get your money back on the Annual plan.
              See{" "}
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
