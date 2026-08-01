import { Link } from "react-router-dom";
import { GraduationCap, Mail, MapPin } from "lucide-react";

const schools = [
  { name: "University of Toronto", province: "ON", slug: "uoft" },
  { name: "Western (Schulich)", province: "ON", slug: "western" },
  { name: "McGill University", province: "QC", slug: "mcgill" },
  { name: "Université de Montréal", province: "QC", slug: "udem" },
  { name: "Université Laval", province: "QC", slug: "laval" },
  { name: "UBC", province: "BC", slug: "ubc" },
  { name: "University of Alberta", province: "AB", slug: "alberta" },
  { name: "University of Saskatchewan", province: "SK", slug: "saskatchewan" },
  { name: "University of Manitoba", province: "MB", slug: "manitoba" },
  { name: "Dalhousie University", province: "NS", slug: "dalhousie" },
];

const quickLinks = [
  { name: "PAT Academy", href: "/pat-academy" },
  { name: "DAT Academy", href: "/dat-academy" },
  { name: "GPA Calculator", href: "/tools/gpa-calculator" },
  { name: "Competitiveness Calculator", href: "/tools/competitiveness" },
  { name: "PAT Score Calculator", href: "/tools/pat-calculator" },
  { name: "Study Schedules", href: "/guides/dat-study-schedules" },
  { name: "Interview Prep", href: "/guides/dental-school-interview" },
];

const resources = [
  { name: "DAT Study Guide", href: "/guides/canadian-dat-guide" },
  { name: "PAT Strategy Guides", href: "/guides" },
  { name: "CASPer Preparation", href: "/guides/casper-dental-school" },
  { name: "School Comparison", href: "/compare" },
  { name: "Community Hub", href: "/community" },
];

const company = [
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

export default function Footer() {
  return (
    <footer className="bg-[var(--page-surface)] text-[var(--text-primary)] border-t border-[var(--border-color)]">
      {/* School Links Bar */}
      <div className="border-b border-[var(--border-color)]">
        <div className="section-container max-w-7xl mx-auto py-6">
          <p className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider mb-3">
            Canadian Dental Schools
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {schools.map(school => (
              <Link
                key={school.slug}
                to={`/school/${school.slug}`}
                className="text-xs text-[var(--text-secondary)] hover:text-[#2563EB] transition-colors"
              >
                {school.name} ({school.province})
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="section-container max-w-7xl mx-auto py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg bg-[#2563EB] flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold leading-tight text-[var(--text-primary)]">
                  PreDent
                </span>
                <span className="text-[10px] font-medium uppercase tracking-wider leading-tight text-[var(--text-tertiary)]">
                  Canada
                </span>
              </div>
            </Link>
            <p className="text-sm text-[var(--text-secondary)] max-w-sm mb-6 leading-relaxed">
              Everything you need to prepare for the Canadian DAT and plan your
              application — in one place.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-[var(--text-tertiary)]">
                <Mail className="w-4 h-4" />
                <span>support@predentcanada.ca</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[var(--text-tertiary)]">
                <MapPin className="w-4 h-4" />
                <span>Canada</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold mb-4 text-[var(--text-primary)]">
              Platform
            </h4>
            <ul className="space-y-2.5">
              {quickLinks.map(link => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-[var(--text-secondary)] hover:text-[#2563EB] transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-sm font-semibold mb-4 text-[var(--text-primary)]">
              Resources
            </h4>
            <ul className="space-y-2.5">
              {resources.map(link => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-[var(--text-secondary)] hover:text-[#2563EB] transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold mb-4 text-[var(--text-primary)]">
              Company
            </h4>
            <ul className="space-y-2.5">
              {company.map(link => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-[var(--text-secondary)] hover:text-[#2563EB] transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold mb-4 text-[var(--text-primary)]">Legal</h4>
            <ul className="space-y-2.5">
              <li>
                <Link
                  to="/legal/privacy"
                  className="text-sm text-[var(--text-secondary)] hover:text-[#2563EB] transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/legal/terms"
                  className="text-sm text-[var(--text-secondary)] hover:text-[#2563EB] transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  to="/legal/refund"
                  className="text-sm text-[var(--text-secondary)] hover:text-[#2563EB] transition-colors"
                >
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/legal/guarantee"
                  className="text-sm text-[var(--text-secondary)] hover:text-[#2563EB] transition-colors"
                >
                  Higher Score Guarantee
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-[var(--border-color)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[var(--text-tertiary)]">
            &copy; {new Date().getFullYear()} PreDent Canada. All rights
            reserved.
          </p>
          <p className="text-xs text-[var(--text-tertiary)]">
            Not affiliated with the Canadian Dental Association or any dental
            school.
          </p>
        </div>
      </div>
    </footer>
  );
}
