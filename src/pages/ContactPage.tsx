import { Link } from "react-router-dom";
import { ArrowLeft, Mail, MessageCircle, Clock } from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Card, CardContent } from "@/components/ui/card";

const contactMethods = [
  {
    icon: Mail,
    title: "Email Support",
    description:
      "For account, billing, or study questions, reach us at support@predentcanada.ca.",
  },
  {
    icon: MessageCircle,
    title: "Community Forum",
    description:
      "Ask questions and connect with other pre-dental students in our Community Hub.",
  },
  {
    icon: Clock,
    title: "Response Time",
    description:
      "We typically respond to email within 1–2 business days. Premium members receive priority support.",
  },
];

export default function ContactPage() {
  usePageTitle("Contact PreDent Canada");

  return (
    <main className="min-h-screen bg-[var(--page-bg)]">
      <div className="pt-20 pb-12 bg-gradient-to-br from-[var(--page-bg)] to-[var(--page-surface)]">
        <div className="section-container max-w-7xl mx-auto px-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-[var(--text-primary)] mb-2">
              Contact & Support
            </h1>
            <p className="text-[var(--text-secondary)]">
              We're here to help with your DAT prep and application questions.
            </p>
          </div>
        </div>
      </div>

      <div className="section-container max-w-7xl mx-auto px-4 -mt-8 pb-20">
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {contactMethods.map(method => (
            <Card
              key={method.title}
              className="h-full bg-[var(--page-surface)] border-[var(--border-color)]"
            >
              <CardContent className="p-5">
                <div className="w-10 h-10 rounded-lg bg-[#2563EB]/10 flex items-center justify-center mb-3">
                  <method.icon className="w-5 h-5 text-[#2563EB]" />
                </div>
                <h3 className="font-semibold text-[var(--text-primary)] mb-2">
                  {method.title}
                </h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  {method.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-[var(--border-color)]">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">
              Before You Email
            </h2>
            <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
              <li>
                • Billing questions? Visit{" "}
                <Link
                  to="/legal/refund"
                  className="text-[#2563EB] hover:underline"
                >
                  Refund Policy
                </Link>{" "}
                or{" "}
                <Link
                  to="/legal/guarantee"
                  className="text-[#2563EB] hover:underline"
                >
                  Higher Score Guarantee
                </Link>
                .
              </li>
              <li>
                • Privacy questions? Read our{" "}
                <Link
                  to="/legal/privacy"
                  className="text-[#2563EB] hover:underline"
                >
                  Privacy Policy
                </Link>
                .
              </li>
              <li>
                • Study help? Browse our{" "}
                <Link to="/guides" className="text-[#2563EB] hover:underline">
                  Guides
                </Link>{" "}
                or ask the{" "}
                <Link
                  to="/community"
                  className="text-[#2563EB] hover:underline"
                >
                  Community
                </Link>
                .
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
