import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, GraduationCap, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

const navLinks = [
  { name: 'School Hub', href: '/schools', dropdown: ['All Schools', 'Compare Schools'] },
  { name: 'PAT Academy', href: '/pat-academy' },
  { name: 'DAT Academy', href: '/dat-academy' },
  { name: 'Guides', href: '/guides', dropdown: ['DAT Study Schedules', 'PAT Strategy', 'CASPer Guide', 'Interview Prep'] },
  { name: 'Tools', href: '/tools', dropdown: ['GPA Calculator', 'Competitiveness Calculator'] },
  { name: 'Community', href: '/community' },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-md'
          : 'bg-transparent'
      }`}
    >
      <div className="section-container max-w-7xl mx-auto">
        <div className="flex items-center justify-between h-16 lg:h-18">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-lg bg-[#2563EB] flex items-center justify-center group-hover:bg-[#1D4ED8] transition-colors">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className={`text-lg font-bold leading-tight transition-colors ${isScrolled ? 'text-[#0F172A]' : 'text-white'}`}>
                PreDent
              </span>
              <span className={`text-[10px] font-medium uppercase tracking-wider leading-tight transition-colors ${isScrolled ? 'text-[#475569]' : 'text-white/70'}`}>
                Canada
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <div key={link.name} className="relative group">
                <Link
                  to={link.href}
                  className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isScrolled
                      ? 'text-[#475569] hover:text-[#2563EB] hover:bg-[#F1F5F9]'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {link.name}
                  {link.dropdown && <ChevronDown className="w-3.5 h-3.5" />}
                </Link>
                {link.dropdown && (
                  <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-lg shadow-lg border border-[#E2E8F0] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2">
                    {link.dropdown.map((item) => (
                      <button
                        key={item}
                        onClick={() => alert('Coming in the next update!')}
                        className="block w-full text-left px-4 py-2.5 text-sm text-[#475569] hover:text-[#2563EB] hover:bg-[#F8FAFC] transition-colors"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <Button
              variant="ghost"
              className={`text-sm font-medium ${isScrolled ? 'text-[#475569] hover:text-[#0F172A]' : 'text-white/80 hover:text-white hover:bg-white/10'}`}
              onClick={() => alert('Authentication coming in Step 5!')}
            >
              Sign In
            </Button>
            <Button
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold px-5"
              onClick={() => alert('Authentication coming in Step 5!')}
            >
              Get Started Free
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden p-2 rounded-md"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className={isScrolled ? 'text-[#0F172A]' : 'text-white'} />
            ) : (
              <Menu className={isScrolled ? 'text-[#0F172A]' : 'text-white'} />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white rounded-lg shadow-lg border border-[#E2E8F0] mt-2 p-4 animate-fade-in">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="block py-2.5 px-3 text-sm font-medium text-[#475569] hover:text-[#2563EB] hover:bg-[#F8FAFC] rounded-md transition-colors"
              >
                {link.name}
              </Link>
            ))}
            <div className="mt-4 pt-4 border-t border-[#E2E8F0] flex flex-col gap-2">
              <Button
                variant="outline"
                className="w-full text-[#475569]"
                onClick={() => alert('Authentication coming in Step 5!')}
              >
                Sign In
              </Button>
              <Button
                className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
                onClick={() => alert('Authentication coming in Step 5!')}
              >
                Get Started Free
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
