import { useEffect, useState } from "react";
import { trpc } from "@/providers/trpc";
import { Bell, BellOff, Info } from "lucide-react";
import { toast } from "sonner";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function PushNotificationToggle() {
  const [pushSupported, setPushSupported] = useState(true);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const { data: pushStatus } = trpc.notification.getPushStatus.useQuery();
  const subscribeMutation = trpc.notification.subscribePush.useMutation({
    onSuccess: () => toast.success("Push notifications enabled"),
    onError: () => toast.error("Failed to enable push notifications"),
  });
  const unsubscribeMutation = trpc.notification.unsubscribePush.useMutation({
    onSuccess: () => toast.success("Push notifications disabled"),
    onError: () => toast.error("Failed to disable push notifications"),
  });

  useEffect(() => {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      setPushSupported(false);
      return;
    }
    setPermission(Notification.permission);
    if (pushStatus?.subscribed) {
      setIsSubscribed(true);
    }
  }, [pushStatus]);

  const handleToggle = async () => {
    if (!pushSupported) return;
    setLoading(true);

    try {
      if (isSubscribed) {
        const reg = await navigator.serviceWorker.ready;
        const subscription = await reg.pushManager.getSubscription();
        if (subscription) {
          await subscription.unsubscribe();
          await unsubscribeMutation.mutateAsync({ endpoint: subscription.endpoint });
        }
        setIsSubscribed(false);
      } else {
        const perm = await Notification.requestPermission();
        setPermission(perm);
        if (perm !== "granted") {
          toast.error("Notification permission denied");
          setLoading(false);
          return;
        }

        const reg = await navigator.serviceWorker.ready;
        const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
        if (!vapidKey) {
          toast.error("Push notifications not configured");
          setLoading(false);
          return;
        }

        const subscription = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey),
        });

        const sub = subscription.toJSON();
        await subscribeMutation.mutateAsync({
          endpoint: subscription.endpoint,
          p256dh: sub.keys!.p256dh!,
          auth: sub.keys!.auth!,
          userAgent: navigator.userAgent,
        });
        setIsSubscribed(true);
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!pushSupported) {
    return (
      <div className="flex items-center gap-3 py-3">
        <div className="text-[var(--text-tertiary)]">
          <Info className="w-4 h-4" />
        </div>
        <div>
          <p className="text-sm font-medium text-[var(--text-primary)]">
            Push Notifications
          </p>
          <p className="text-xs text-[var(--text-tertiary)]">
            Not supported in this browser
          </p>
        </div>
      </div>
    );
  }

  if (permission === "denied") {
    return (
      <div className="flex items-center gap-3 py-3">
        <div className="text-[var(--text-tertiary)]">
          <BellOff className="w-4 h-4" />
        </div>
        <div>
          <p className="text-sm font-medium text-[var(--text-primary)]">
            Push Notifications
          </p>
          <p className="text-xs text-[var(--text-tertiary)]">
            Blocked — enable in browser settings
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-3">
        <div className="text-[var(--text-tertiary)]">
          {isSubscribed ? (
            <Bell className="w-4 h-4" />
          ) : (
            <BellOff className="w-4 h-4" />
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-[var(--text-primary)]">
            Push Notifications
          </p>
          <p className="text-xs text-[var(--text-tertiary)]">
            {isSubscribed
              ? "Receiving push notifications"
              : "Get notified even when the app is closed"}
          </p>
        </div>
      </div>
      <button
        onClick={handleToggle}
        disabled={loading}
        className={`relative w-11 h-6 rounded-full transition-colors ${
          isSubscribed ? "bg-[#2563EB]" : "bg-[var(--border-color)]"
        } ${loading ? "opacity-50" : ""}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
            isSubscribed ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}
