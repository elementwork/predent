import { Link } from 'react-router-dom';
import { GraduationCap, Mail, MapPin } from 'lucide-react';

const schools = [
  { name: 'University of Toronto', province: 'ON', slug: 'uoft' },
  { name: 'Western (Schulich)', province: 'ON', slug: 'western' },
  { name: 'McGill University', province: 'QC', slug: 'mcgill' },
  { name: 'Université de Montréal', province: 'QC', slug: 'udem' },
  { name: 'Université Laval', province: 'QC', slug: 'laval' },
  { name: 'UBC', province: 'BC', slug: 'ubc' },
  { name: 'University of Alberta', province: 'AB', slug: 'alberta' },
  { name: 'University of Saskatchewan', province: 'SK', slug: 'saskatchewan' },
  { name: 'University of Manitoba', province: 'MB', slug: 'manitoba' },
  { name: 'Dalhousie University', province: 'NS', slug: 'dalhousie' },
];

const quickLinks = [
  { name: 'PAT Academy', href: '/pat-academy' },
  { name: 'DAT Academy', href: '/dat-academy' },
  { name: 'GPA Calculator', href: '/tools/gpa-calculator' },
  { name: 'Competitiveness Calculator', href: '/tools/competitiveness' },
  { name: 'Study Schedules', href: '/guides/dat-study-schedules' },
  { name: 'Interview Prep', href: '/guides/dental-school-interview' },
];

const resources = [
  { name: 'DAT Study Guide', href: '/guides/canadian-dat-guide' },
  { name: 'PAT Strategy Guides', href: '/guides/pat-keyholes' },
  { name: 'CASPer Preparation', href: '/guides/casper-dental-school' },
  { name: 'School Comparison', href: '/compare' },
  { name: 'Community Hub', href: '/community' },
  { name: 'Blog', href: '/blog' },
];

export default function Footer() {
  return (
    <footer className="bg-[#0F172A] text-white">
      {/* School Links Bar */}
      <div className="border-b border-white/10">
        <div className="section-container max-w-7xl mx-auto py-6">
          <p className="text-xs font-medium text-white/50 uppercase tracking-wider mb-3">Canadian Dental Schools</p>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {schools.map((school) => (
              <Link
                key={school.slug}
                to={`/school/${school.slug}`}
                className="text-xs text-white/60 hover:text-[#2563EB] transition-colors"
              >
                {school.name} ({school.province})
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="section-container max-w-7xl mx-auto py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg bg-[#2563EB] flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold leading-tight text-white">PreDent</span>
                <span className="text-[10px] font-medium uppercase tracking-wider leading-tight text-white/50">Canada</span>
              </div>
            </Link>
            <p className="text-sm text-white/60 max-w-sm mb-6 leading-relaxed">
              The operating system for Canadian pre-dental students. Everything you need to get into dental school — in one platform.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-white/50">
                <Mail className="w-4 h-4" />
                <span>support@predentcanada.ca</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-white/50">
                <MapPin className="w-4 h-4" />
                <span>Canada</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold mb-4 text-white/90">Platform</h4>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-white/50 hover:text-[#2563EB] transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-sm font-semibold mb-4 text-white/90">Resources</h4>
            <ul className="space-y-2.5">
              {resources.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-white/50 hover:text-[#2563EB] transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold mb-4 text-white/90">Legal</h4>
            <ul className="space-y-2.5">
              <li><button onClick={() => alert('Coming soon!')} className="text-sm text-white/50 hover:text-[#2563EB] transition-colors">Privacy Policy</button></li>
              <li><button onClick={() => alert('Coming soon!')} className="text-sm text-white/50 hover:text-[#2563EB] transition-colors">Terms of Service</button></li>
              <li><button onClick={() => alert('Coming soon!')} className="text-sm text-white/50 hover:text-[#2563EB] transition-colors">Refund Policy</button></li>
              <li><button onClick={() => alert('Coming soon!')} className="text-sm text-white/50 hover:text-[#2563EB] transition-colors">Higher Score Guarantee</button></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/40">
            &copy; {new Date().getFullYear()} PreDent Canada. All rights reserved.
          </p>
          <p className="text-xs text-white/40">
            Not affiliated with the Canadian Dental Association or any dental school.
          </p>
        </div>
      </div>
    </footer>
  );
}
