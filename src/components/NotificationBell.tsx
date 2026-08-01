import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Bell, Check, Loader2, BookOpen, Users, CreditCard, Info, Settings } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";

const typeIcons: Record<string, typeof Bell> = {
  task_due: Bell,
  study_reminder: BookOpen,
  community: Users,
  payment: CreditCard,
  system: Info,
};

export default function NotificationBell() {
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const { data: unreadCount = 0, refetch: refetchCount } =
    trpc.notification.unreadCount.useQuery(undefined, {
      enabled: isAuthenticated,
      refetchInterval: 60_000,
    });
  const { data: notifications = [], refetch: refetchNotifications } =
    trpc.notification.list.useQuery(
      { limit: 10 },
      { enabled: isAuthenticated && open }
    );

  const markRead = trpc.notification.markRead.useMutation({
    onSuccess: () => {
      refetchCount();
      refetchNotifications();
    },
  });

  const markAllRead = trpc.notification.markAllRead.useMutation({
    onSuccess: () => {
      refetchCount();
      refetchNotifications();
    },
  });

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isAuthenticated) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative flex items-center justify-center w-9 h-9 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--page-muted)] transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-[#EF4444] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-[var(--page-surface)] rounded-xl shadow-lg border border-[var(--border-color)] py-2 z-50 animate-fade-in">
          <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--border-color)]">
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              Notifications
            </p>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllRead.mutate()}
                className="text-xs text-[#2563EB] hover:underline flex items-center gap-1"
                disabled={markAllRead.isPending}
              >
                {markAllRead.isPending ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Check className="w-3 h-3" />
                )}
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-72 overflow-y-auto">
            {notifications.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-[var(--text-tertiary)]">
                No notifications yet.
              </div>
            )}

            {notifications.map(n => {
              const TypeIcon = typeIcons[n.type] ?? Bell;
              return (
                <div
                  key={n.id}
                  className={`px-4 py-3 border-b border-[var(--border-color)]/50 hover:bg-[var(--page-muted)] transition-colors cursor-pointer ${
                    n.read ? "opacity-70" : ""
                  }`}
                  onClick={() => {
                    if (!n.read) markRead.mutate({ notificationId: n.id });
                    if (n.link) {
                      window.location.href = n.link;
                      setOpen(false);
                    }
                  }}
                >
                  <div className="flex items-start gap-2">
                    <TypeIcon className={`w-4 h-4 mt-0.5 shrink-0 ${n.read ? "text-[var(--text-tertiary)]" : "text-[#2563EB]"}`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[var(--text-primary)]">
                        {n.title}
                      </p>
                      <p className="text-xs text-[var(--text-secondary)] line-clamp-2">
                        {n.message}
                      </p>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-[10px] text-[var(--text-tertiary)]">
                          {new Date(n.createdAt).toLocaleDateString()}
                        </span>
                        {!n.read && (
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              markRead.mutate({ notificationId: n.id });
                            }}
                            className="text-[10px] text-[var(--text-tertiary)] hover:text-[#2563EB]"
                            disabled={markRead.isPending}
                          >
                            Mark read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <Link
            to="/dashboard/settings/notifications"
            onClick={() => setOpen(false)}
            className="flex items-center justify-center gap-2 px-4 py-2 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--page-muted)] border-t border-[var(--border-color)] transition-colors"
          >
            <Settings className="w-3.5 h-3.5" />
            Manage notifications
          </Link>
        </div>
      )}
    </div>
  );
}
