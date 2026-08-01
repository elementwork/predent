import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Brain,
  BookOpen,
  School,
  Target,
  ChevronRight,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const ONBOARDING_KEY = "predent_onboarding_complete";

const steps = [
  {
    title: "Welcome to PreDent Canada",
    description:
      "The all-in-one platform for Canadian dental school admissions. Let's get you set up in under a minute.",
  },
  {
    title: "Tell us about yourself",
    description:
      "Help us personalize your experience. You can always update this later in your Dashboard.",
  },
  {
    title: "Where would you like to start?",
    description:
      "Pick an area to explore first. You can always come back to the others.",
  },
];

const startOptions = [
  {
    id: "pat",
    title: "PAT Academy",
    description: "Practice perceptual ability questions",
    icon: Brain,
    color: "#2563EB",
    href: "/pat-academy",
  },
  {
    id: "dat",
    title: "DAT Academy",
    description: "Biology, Chemistry, and Reading practice",
    icon: BookOpen,
    color: "#10B981",
    href: "/dat-academy",
  },
  {
    id: "schools",
    title: "School Hub",
    description: "Research Canadian dental schools",
    icon: School,
    color: "#6366F1",
    href: "/schools",
  },
  {
    id: "calculator",
    title: "Competitiveness Calculator",
    description: "Check your chances at each school",
    icon: Target,
    color: "#F59E0B",
    href: "/tools/competitiveness",
  },
];

export default function OnboardingModal() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    province: "",
    targetYear: new Date().getFullYear() + 1,
  });

  const profileQuery = trpc.profile.get.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const upsertProfile = trpc.profile.upsert.useMutation({
    onSuccess: () => {
      setStep(2);
    },
    onError: (err) => toast.error(err.message),
  });

  const hasCompletedOnboarding =
    !!localStorage.getItem(ONBOARDING_KEY) ||
    (profileQuery.isSuccess && !!profileQuery.data?.firstName);
  const showModal =
    !dismissed && isAuthenticated && !!user && !hasCompletedOnboarding && profileQuery.isSuccess;

  const handleProfileSubmit = () => {
    if (!profile.firstName.trim()) return;
    upsertProfile.mutate({
      firstName: profile.firstName,
      lastName: profile.lastName || undefined,
      province: profile.province || undefined,
      targetYear: profile.targetYear,
    });
  };

  const handleStartOption = (href: string) => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    navigate(href);
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem(ONBOARDING_KEY, "true");
  };

  if (!isAuthenticated) return null;

  return (
    <Dialog open={showModal} onOpenChange={(v) => { if (!v) handleDismiss(); }}>
      <DialogContent className="bg-[var(--page-surface)] border-[var(--border-color)] text-[var(--text-primary)] max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">{steps[step].title}</DialogTitle>
          <p className="text-sm text-[var(--text-secondary)]">
            {steps[step].description}
          </p>
        </DialogHeader>

        {/* Step indicators */}
        <div className="flex gap-2 my-2">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i <= step ? "bg-[#2563EB]" : "bg-[var(--page-muted)]"
              }`}
            />
          ))}
        </div>

        {/* Step 0: Welcome */}
        {step === 0 && (
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-3">
              {startOptions.map((opt) => (
                <div
                  key={opt.id}
                  className="p-3 rounded-lg bg-[var(--page-bg)] border border-[var(--border-color)] flex items-center gap-3"
                >
                  <div
                    className="w-8 h-8 rounded-md flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${opt.color}15` }}
                  >
                    <opt.icon className="w-4 h-4" style={{ color: opt.color }} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[var(--text-primary)]">
                      {opt.title}
                    </p>
                    <p className="text-[10px] text-[var(--text-tertiary)]">
                      {opt.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <Button
                className="flex-1 bg-[#2563EB] hover:bg-[#1D4ED8]"
                onClick={() => setStep(1)}
              >
                Set Up Profile
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
              <Button
                variant="outline"
                className="border-[var(--border-color)]"
                onClick={handleDismiss}
              >
                Skip
              </Button>
            </div>
          </div>
        )}

        {/* Step 1: Profile */}
        {step === 1 && (
          <div className="space-y-3 mt-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-[var(--text-tertiary)] mb-1 block">
                  First Name *
                </label>
                <Input
                  value={profile.firstName}
                  onChange={(e) =>
                    setProfile({ ...profile, firstName: e.target.value })
                  }
                  placeholder="Your first name"
                  className="bg-[var(--page-muted)] border-[var(--border-color)]"
                />
              </div>
              <div>
                <label className="text-xs text-[var(--text-tertiary)] mb-1 block">
                  Last Name
                </label>
                <Input
                  value={profile.lastName}
                  onChange={(e) =>
                    setProfile({ ...profile, lastName: e.target.value })
                  }
                  placeholder="Your last name"
                  className="bg-[var(--page-muted)] border-[var(--border-color)]"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-[var(--text-tertiary)] mb-1 block">
                Province
              </label>
              <Select
                value={profile.province}
                onValueChange={(v) => setProfile({ ...profile, province: v })}
              >
                <SelectTrigger className="bg-[var(--page-muted)] border-[var(--border-color)]">
                  <SelectValue placeholder="Select province" />
                </SelectTrigger>
                <SelectContent className="bg-[var(--page-surface)] border-[var(--border-color)]">
                  {["AB", "BC", "MB", "NB", "NL", "NS", "NT", "NU", "ON", "PE", "QC", "SK", "YT"].map(
                    (p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-[var(--text-tertiary)] mb-1 block">
                Target Application Year
              </label>
              <Select
                value={String(profile.targetYear)}
                onValueChange={(v) =>
                  setProfile({ ...profile, targetYear: parseInt(v) })
                }
              >
                <SelectTrigger className="bg-[var(--page-muted)] border-[var(--border-color)]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[var(--page-surface)] border-[var(--border-color)]">
                  {[0, 1, 2].map((offset) => (
                    <SelectItem
                      key={offset}
                      value={String(new Date().getFullYear() + offset)}
                    >
                      {new Date().getFullYear() + offset}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              className="w-full bg-[#2563EB] hover:bg-[#1D4ED8]"
              onClick={handleProfileSubmit}
              disabled={!profile.firstName.trim() || upsertProfile.isPending}
            >
              {upsertProfile.isPending ? "Saving..." : "Continue"}
            </Button>
          </div>
        )}

        {/* Step 2: Pick a start */}
        {step === 2 && (
          <div className="space-y-3 mt-4">
            {startOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleStartOption(opt.href)}
                className="w-full p-4 rounded-lg bg-[var(--page-bg)] border border-[var(--border-color)] hover:border-[#2563EB]/50 transition-colors flex items-center gap-4 text-left group"
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${opt.color}15` }}
                >
                  <opt.icon className="w-5 h-5" style={{ color: opt.color }} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[#2563EB] transition-colors">
                    {opt.title}
                  </p>
                  <p className="text-xs text-[var(--text-tertiary)]">
                    {opt.description}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-[var(--text-tertiary)] group-hover:text-[#2563EB] transition-colors" />
              </button>
            ))}
            <Button
              variant="outline"
              className="w-full border-[var(--border-color)]"
              onClick={handleDismiss}
            >
              I'll explore on my own
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
