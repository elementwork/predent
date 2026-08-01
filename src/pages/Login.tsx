import { useEffect, useMemo } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  GraduationCap,
  ExternalLink,
  Apple,
  Linkedin,
} from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { events } from "@/lib/analytics";

type Provider = {
  id:
    | "google"
    | "x"
    | "instagram"
    | "linkedin"
    | "apple"
    | "discord"
    | "microsoft"
    | "facebook";
  label: string;
  icon: React.ReactNode;
  className: string;
};

function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function XIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function DiscordIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

function MicrosoftIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 21 21" aria-hidden="true">
      <rect x="1" y="1" width="9" height="9" fill="#f25022" />
      <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
      <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
      <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

const ERROR_MESSAGES: Record<string, string> = {
  access_denied: "You cancelled the login.",
  invalid_state: "Login session expired. Please try again.",
  invalid_provider: "Unsupported login provider.",
  missing_oauth_params: "Invalid login response. Please try again.",
  missing_verifier: "Login session expired. Please try again.",
  provider_not_configured: "This login provider is not configured yet.",
  oauth_callback_failed: "Login failed. Please try again.",
};

export default function Login() {
  usePageTitle("Login");
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (user) {
      events.signupCompleted();
      const redirect = searchParams.get("redirect") || "/dashboard";
      navigate(redirect, { replace: true });
    }
  }, [user, navigate, searchParams]);

  const redirect = searchParams.get("redirect") || "/dashboard";
  const error = searchParams.get("error");
  const errorMessage = error ? ERROR_MESSAGES[error] || "Login failed. Please try again." : null;

  const providers = useMemo<Provider[]>(
    () => [
      {
        id: "google",
        label: "Continue with Google",
        icon: <GoogleIcon />,
        className:
          "w-full h-11 bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 font-semibold",
      },
      {
        id: "apple",
        label: "Continue with Apple",
        icon: <Apple className="w-5 h-5" />,
        className: "w-full h-11 bg-black hover:bg-gray-900 text-white font-semibold",
      },
      {
        id: "microsoft",
        label: "Continue with Microsoft",
        icon: <MicrosoftIcon />,
        className:
          "w-full h-11 bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 font-semibold",
      },
      {
        id: "facebook",
        label: "Continue with Facebook",
        icon: <FacebookIcon />,
        className: "w-full h-11 bg-[#1877F2] hover:bg-[#0E5FC2] text-white font-semibold",
      },
      {
        id: "linkedin",
        label: "Continue with LinkedIn",
        icon: <Linkedin className="w-5 h-5" />,
        className: "w-full h-11 bg-[#0A66C2] hover:bg-[#084482] text-white font-semibold",
      },
      {
        id: "x",
        label: "Continue with X",
        icon: <XIcon />,
        className: "w-full h-11 bg-black hover:bg-gray-900 text-white font-semibold",
      },
      {
        id: "discord",
        label: "Continue with Discord",
        icon: <DiscordIcon />,
        className: "w-full h-11 bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold",
      },
      {
        id: "instagram",
        label: "Continue with Instagram",
        icon: <InstagramIcon />,
        className:
          "w-full h-11 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:opacity-90 text-white font-semibold",
      },
    ],
    []
  );

  const authorizeUrl = (providerId: Provider["id"]) => {
    const params = new URLSearchParams({ redirect });
    return `/api/oauth/authorize/${providerId}?${params.toString()}`;
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[var(--page-bg)] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[var(--border-color)] border-t-[#2563EB] rounded-full animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--page-bg)] flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-[var(--page-surface)] border-[var(--border-color)]">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#10B981] flex items-center justify-center mb-2">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-[var(--text-primary)]">
            Welcome to PreDent Canada
          </CardTitle>
          <CardDescription className="text-[var(--text-secondary)]">
            Sign in to track your DAT progress and access premium features.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {errorMessage && (
            <p className="text-sm text-center text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 rounded-lg py-2 px-3">
              {errorMessage}
            </p>
          )}

          <div className="space-y-3">
            {providers.map((provider) => (
              <Button key={provider.id} asChild className={provider.className}>
                <a href={authorizeUrl(provider.id)}>
                  {provider.icon}
                  <span className="ml-2">{provider.label}</span>
                  <ExternalLink className="w-4 h-4 ml-auto opacity-60" />
                </a>
              </Button>
            ))}
          </div>

          <p className="text-xs text-center text-[var(--text-tertiary)]">
            By continuing, you agree to our{" "}
            <Link to="/legal/terms" className="text-[#2563EB] hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link to="/legal/privacy" className="text-[#2563EB] hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
