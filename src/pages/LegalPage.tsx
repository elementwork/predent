import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";

const legalContent: Record<
  string,
  {
    title: string;
    lastUpdated: string;
    sections: { heading: string; body: string }[];
  }
> = {
  privacy: {
    title: "Privacy Policy",
    lastUpdated: "August 2026",
    sections: [
      {
        heading: "Information We Collect",
        body: "We collect information you provide directly, such as your name, email, and profile details. We also collect usage data, performance analytics, and device information to improve the platform.",
      },
      {
        heading: "How We Use Your Information",
        body: "Your information is used to provide and improve PreDent Canada services, personalize your study experience, process payments, and communicate important updates.",
      },
      {
        heading: "Data Sharing",
        body: "We do not sell your personal data. We share data only with trusted service providers necessary for hosting, payment processing, and analytics, under strict confidentiality agreements.",
      },
      {
        heading: "Cookies",
        body: "Essential cookies maintain your session and preferences. Optional product analytics and masked error replay remain disabled unless you select Allow analytics. You can change this decision at any time through Privacy Choices in the footer.",
      },
      {
        heading: "Your Rights",
        body: "You may request access to, correction of, or deletion of your personal data by contacting support@predentcanada.ca.",
      },
      {
        heading: "Analytics Retention",
        body: "When you opt in, product analytics are retained for no more than 12 months and masked error replay for no more than 30 days. You may withdraw consent through Privacy Choices and request deletion by contacting support.",
      },
    ],
  },
  terms: {
    title: "Terms of Service",
    lastUpdated: "June 2026",
    sections: [
      {
        heading: "Acceptance of Terms",
        body: "By accessing or using PreDent Canada, you agree to be bound by these Terms of Service. If you do not agree, please do not use the platform.",
      },
      {
        heading: "Use of Platform",
        body: "You agree to use the platform only for lawful purposes and in accordance with these terms. You may not attempt to disrupt service, scrape content, or share account credentials.",
      },
      {
        heading: "Subscriptions and Payments",
        body: "Premium subscriptions are billed according to the plan selected. You may cancel at any time; access continues until the end of the current billing period.",
      },
      {
        heading: "Intellectual Property",
        body: "All content, designs, code, and materials on PreDent Canada are the property of PreDent Canada or its licensors and are protected by intellectual property laws.",
      },
      {
        heading: "Limitation of Liability",
        body: "PreDent Canada is provided as-is without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages arising from your use of the platform.",
      },
    ],
  },
  refund: {
    title: "Refund Policy",
    lastUpdated: "June 2026",
    sections: [
      {
        heading: "Higher Score Guarantee",
        body: "Premium Annual subscribers may request a full refund if their official DAT score does not improve after meeting the guarantee requirements. See our Higher Score Guarantee page for details.",
      },
      {
        heading: "Subscription Refunds",
        body: "Monthly and 3-Month plans can be canceled anytime but are generally not refunded for partial periods. Refund requests are reviewed on a case-by-case basis within 14 days of purchase.",
      },
      {
        heading: "Contact Us",
        body: "For refund inquiries, contact support@predentcanada.ca with your account email and order details.",
      },
    ],
  },
  guarantee: {
    title: "Higher Score Guarantee",
    lastUpdated: "July 2026",
    sections: [
      {
        heading: "Eligibility",
        body: "The Higher Score Guarantee applies to Premium Annual subscribers who use PreDent Canada to prepare for their official Canadian DAT.",
      },
      {
        heading: "Requirements",
        body: "To qualify, you must have an active Premium Annual subscription at the time of your official DAT, use the platform consistently for at least 30 days before your test date, and submit your official DAT score report within 60 days of receiving it.",
      },
      {
        heading: "Refund Process",
        body: "If your official DAT total science score or PAT score does not improve from a previous official DAT attempt or a documented baseline, contact support@predentcanada.ca within 60 days of receiving your score report to request a full refund. Documentation may be required.",
      },
      {
        heading: "Exclusions",
        body: "The guarantee does not apply to monthly or 3-Month plans, free accounts, or accounts that violate our Terms of Service. Refunds are limited to one per customer.",
      },
    ],
  },
};

export default function LegalPage() {
  const { topic } = useParams<{ topic: string }>();
  const content = topic ? legalContent[topic] : undefined;

  usePageTitle(content?.title ?? "Legal");

  if (!content) {
    return (
      <main className="min-h-screen bg-[var(--page-bg)] pt-24 pb-20">
        <div className="section-container max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
            Page Not Found
          </h1>
          <Link to="/" className="text-[#2563EB] hover:underline">
            Back to Home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--page-bg)] pt-24 pb-20">
      <div className="section-container max-w-7xl mx-auto px-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
          {content.title}
        </h1>
        <p className="text-sm text-[var(--text-tertiary)] mb-8">
          Last updated: {content.lastUpdated}
        </p>

        <div className="space-y-8">
          {content.sections.map(section => (
            <section key={section.heading}>
              <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                {section.heading}
              </h2>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                {section.body}
              </p>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
