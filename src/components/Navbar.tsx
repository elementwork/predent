import { useState, useEffect, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  GraduationCap,
  ChevronDown,
  LogOut,
  User,
  LayoutDashboard,
  Sun,
  Moon,
  Settings,
  Search,
  School,
  Calculator,
  BookOpen,
  Trophy,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/providers/theme";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
} from "@/components/ui/command";
import { schools } from "@contracts/schools";
import NotificationBell from "./NotificationBell";

const navLinks = [
  { name: "School Hub", href: "/schools" },
  { name: "PAT Academy", href: "/pat-academy" },
  { name: "DAT Academy", href: "/dat-academy" },
  { name: "Guides", href: "/guides" },
  { name: "Tools", href: "/tools" },
  { name: "Community", href: "/community" },
];

const pageRoutes = [
  { name: "School Hub", href: "/schools", icon: School },
  { name: "PAT Academy", href: "/pat-academy", icon: Trophy },
  { name: "DAT Academy", href: "/dat-academy", icon: GraduationCap },
  { name: "Guides", href: "/guides", icon: BookOpen },
  { name: "Tools", href: "/tools", icon: Calculator },
  { name: "Community", href: "/community", icon: MessageSquare },
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Profile", href: "/dashboard/profile", icon: User },
  {
    name: "Settings",
    href: "/dashboard/settings/notifications",
    icon: Settings,
  },
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const filteredSchools = schools.filter(
    s =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.province.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPages = pageRoutes.filter(r =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNavigate = useCallback(
    (href: string) => {
      navigate(href);
      setSearchOpen(false);
      setSearchQuery("");
    },
    [navigate]
  );

  useEffect(() => {
    // Close menus when navigating to a new page
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  }, [location]);

  const navTextClass =
    "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--page-muted)]";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-[var(--page-bg)]/95 backdrop-blur-md shadow-md border-b border-[var(--border-color)]">
      <div className="section-container max-w-7xl mx-auto">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-lg bg-[#2563EB] flex items-center justify-center group-hover:bg-[#1D4ED8] transition-colors">
              <GraduationCap className="w-5 h-5 text-[var(--text-primary)]" />
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

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.name}
                to={link.href}
                className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${navTextClass}`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Search Button */}
          <button
            onClick={() => setSearchOpen(true)}
            className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-md text-sm text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-[var(--page-muted)] transition-colors border border-[var(--border-color)]"
            aria-label="Search"
          >
            <Search className="w-4 h-4" />
            <span className="text-xs">Search</span>
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-0.5 rounded border border-[var(--border-color)] bg-[var(--page-muted)] px-1.5 text-[10px] font-medium text-[var(--text-tertiary)]">
              <span className="text-xs">&#8984;</span>K
            </kbd>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="hidden lg:flex items-center justify-center w-9 h-9 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--page-muted)] transition-colors"
            aria-label="Toggle theme"
          >
            {resolvedTheme === "dark" ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>

          {/* Auth Section */}
          <div className="hidden lg:flex items-center gap-3">
            <NotificationBell />
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-[var(--page-muted)] transition-colors"
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt=""
                      className="w-7 h-7 rounded-full"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-[#2563EB] flex items-center justify-center">
                      <User className="w-4 h-4 text-[var(--text-primary)]" />
                    </div>
                  )}
                  <span className="text-sm text-[var(--text-secondary)]">
                    {user.name || "User"}
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-[var(--text-tertiary)] transition-transform ${userMenuOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-1 w-48 bg-[var(--page-surface)] rounded-lg shadow-lg border border-[var(--border-color)] py-1 animate-fade-in">
                    <Link
                      to="/dashboard"
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--page-muted)] transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4" /> Dashboard
                    </Link>
                    <Link
                      to="/dashboard/settings/notifications"
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--page-muted)] transition-colors"
                    >
                      <Settings className="w-4 h-4" /> Notifications
                    </Link>
                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[#EF4444] hover:bg-[var(--page-muted)] transition-colors"
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Button
                  variant="ghost"
                  className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--page-muted)]"
                  asChild
                >
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button
                  className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold px-5"
                  asChild
                >
                  <Link to="/register">Get Started Free</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <div className="lg:hidden flex items-center gap-1">
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--page-muted)] transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              className="p-2 rounded-md"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="text-[var(--text-primary)]" />
              ) : (
                <Menu className="text-[var(--text-primary)]" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[var(--page-surface)] rounded-lg shadow-lg border border-[var(--border-color)] mt-2 p-4 animate-fade-in">
            {navLinks.map(link => (
              <Link
                key={link.name}
                to={link.href}
                className="block py-2.5 px-3 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--page-muted)] rounded-md transition-colors"
              >
                {link.name}
              </Link>
            ))}
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 w-full py-2.5 px-3 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--page-muted)] rounded-md transition-colors mt-1"
            >
              {resolvedTheme === "dark" ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
              Toggle theme
            </button>
            <div className="mt-4 pt-4 border-t border-[var(--border-color)]">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    className="block py-2.5 px-3 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-md"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={logout}
                    className="block w-full text-left py-2.5 px-3 text-sm text-[#EF4444]"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    className="w-full border-[var(--border-color)] text-[var(--text-primary)]"
                    asChild
                  >
                    <Link to="/login">Sign In</Link>
                  </Button>
                  <Button
                    className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-[var(--text-primary)]"
                    asChild
                  >
                    <Link to="/register">Get Started Free</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Search Command Palette */}
      <CommandDialog
        open={searchOpen}
        onOpenChange={setSearchOpen}
        title="Search"
        description="Search schools, pages, and more"
      >
        <CommandInput
          placeholder="Search schools, pages..."
          value={searchQuery}
          onValueChange={setSearchQuery}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          {filteredPages.length > 0 && (
            <CommandGroup heading="Pages">
              {filteredPages.map(route => (
                <CommandItem
                  key={route.href}
                  onSelect={() => handleNavigate(route.href)}
                >
                  <route.icon className="w-4 h-4" />
                  <span>{route.name}</span>
                  <CommandShortcut>{route.href}</CommandShortcut>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {filteredSchools.length > 0 && (
            <CommandGroup heading="Schools">
              {filteredSchools.map(school => (
                <CommandItem
                  key={school.id}
                  onSelect={() => handleNavigate(`/schools/${school.id}`)}
                >
                  <School className="w-4 h-4" />
                  <span>{school.name}</span>
                  <CommandShortcut>{school.province}</CommandShortcut>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </nav>
  );
}
