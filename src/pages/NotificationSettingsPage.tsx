import { useState } from "react";
import { Link } from "react-router-dom";
import { usePageTitle } from "@/hooks/usePageTitle";
import { trpc } from "@/providers/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, BookOpen, Users, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import PushNotificationToggle from "@/components/PushNotificationToggle";

export default function NotificationSettingsPage() {
  usePageTitle("Notification Settings");

  const { data: prefs, isLoading } = trpc.notification.getPreferences.useQuery();
  const updatePrefs = trpc.notification.updatePreferences.useMutation({
    onSuccess: () => toast.success("Preferences saved"),
    onError: () => toast.error("Failed to save preferences"),
  });

  const [localPrefs, setLocalPrefs] = useState({
    emailTaskDue: true,
    emailStudyReminder: true,
    emailCommunity: true,
  });

  // Sync from server
  const effectivePrefs = prefs ?? localPrefs;

  const toggle = (key: keyof typeof localPrefs) => {
    const newValue = !effectivePrefs[key];
    setLocalPrefs(prev => ({ ...prev, [key]: newValue }));
    updatePrefs.mutate({ [key]: newValue });
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[var(--page-bg)] pt-20">
        <div className="section-container max-w-7xl mx-auto pb-20">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-[var(--page-muted)] rounded w-48" />
            <div className="h-32 bg-[var(--page-muted)] rounded" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--page-bg)] pt-20">
      <div className="section-container max-w-7xl mx-auto pb-20">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <div className="flex items-center gap-3 mb-8">
          <Bell className="w-6 h-6 text-[#2563EB]" />
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Notification Settings
          </h1>
        </div>

        <Card className="bg-[var(--page-surface)] border-[var(--border-color)]">
          <CardHeader>
            <CardTitle className="text-[var(--text-primary)]">
              Email Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ToggleRow
              icon={<Bell className="w-4 h-4" />}
              label="Task Due Reminders"
              description="Get notified when tasks are approaching their due date"
              enabled={effectivePrefs.emailTaskDue}
              onToggle={() => toggle("emailTaskDue")}
            />
            <ToggleRow
              icon={<BookOpen className="w-4 h-4" />}
              label="Study Reminders"
              description="Weekly study reminders for upcoming tasks"
              enabled={effectivePrefs.emailStudyReminder}
              onToggle={() => toggle("emailStudyReminder")}
            />
            <ToggleRow
              icon={<Users className="w-4 h-4" />}
              label="Community Activity"
              description="Notifications when someone interacts with your posts"
              enabled={effectivePrefs.emailCommunity}
              onToggle={() => toggle("emailCommunity")}
            />
          </CardContent>
        </Card>

        <Card className="bg-[var(--page-surface)] border-[var(--border-color)] mt-6">
          <CardHeader>
            <CardTitle className="text-[var(--text-primary)]">
              Push Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PushNotificationToggle />
          </CardContent>
        </Card>

        <p className="text-xs text-[var(--text-tertiary)] mt-4">
          In-app notifications are always enabled. These settings only control
          email and push delivery.
        </p>
      </div>
    </main>
  );
}

function ToggleRow({
  icon,
  label,
  description,
  enabled,
  onToggle,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-3">
        <div className="text-[var(--text-tertiary)]">{icon}</div>
        <div>
          <p className="text-sm font-medium text-[var(--text-primary)]">
            {label}
          </p>
          <p className="text-xs text-[var(--text-tertiary)]">{description}</p>
        </div>
      </div>
      <button
        onClick={onToggle}
        className={`relative w-11 h-6 rounded-full transition-colors ${
          enabled ? "bg-[#2563EB]" : "bg-[var(--border-color)]"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
            enabled ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}
