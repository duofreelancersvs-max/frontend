import { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Logo from "@/components/shared/Logo";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export const PublicNavbar = ({ 
  variant = "transparent",
  dark = false // If true, navbar text will be dark (navy) instead of white when transparent
}: { 
  variant?: "transparent" | "white",
  dark?: boolean
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  const isWhite = variant === "white" || isScrolled || mobileMenuOpen;

  return (
    <>
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        isScrolled
          ? "bg-white/80 dark:bg-[#050B15]/80 backdrop-blur-lg shadow-lg shadow-slate-200/20 dark:shadow-none py-4"
          : variant === "white"
            ? "bg-white dark:bg-[#050B15] py-4 dark:shadow-none"
            : "bg-transparent py-4",
      )}
    >
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Logo isDark={!isWhite && !dark} />

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-4">
              {[
                { label: "Find Talent", href: "/freelancers" },
                { label: "Find Work", href: "/projects" },
                { label: "Categories", href: "/categories" },
                { label: "How It Works", href: "/how-it-works" },
                { label: "Pricing", href: "/pricing" },
                { label: "About", href: "/about" },
              ].map((item) => (
                <NavLink
                  key={item.label}
                  to={item.href}
                  className={({ isActive }) => cn(
                    "px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 relative group truncate",
                    isWhite || dark
                      ? (isActive ? "text-teal dark:text-teal-light font-bold" : "text-slate-600 dark:text-white/80 hover:text-navy dark:hover:text-white")
                      : (isActive ? "text-teal-light font-bold" : "text-white/90 hover:text-white"),
                  )}
                >
                  {item.label}
                </NavLink>
              ))}
            </div>

            {/* Auth Buttons */}
            <div className="hidden lg:flex items-center gap-3">
              <ThemeToggle className="mr-2" />
              {isAuthenticated ? (
                <div className="flex items-center gap-4">
                  <Link
                    to={
                      user?.role === "client"
                        ? "/client/dashboard"
                        : "/freelancer/dashboard"
                    }
                  >
                    <Button
                      variant="ghost"
                      className={cn(
                        "font-semibold transition-all duration-300 rounded-lg",
                        isWhite || dark
                          ? "!text-navy dark:!text-white hover:bg-slate-100 dark:hover:bg-white/10"
                          : "!text-white hover:bg-white/10",
                      )}
                    >
                      Dashboard
                    </Button>
                  </Link>
                  <div className="relative">
                    <button
                      onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                      className={cn(
                        "flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300",
                        isWhite || dark
                          ? "hover:bg-slate-100"
                          : "hover:bg-white/10",
                        profileDropdownOpen && "ring-2 ring-teal ring-offset-2 dark:ring-offset-[#050B15]"
                      )}
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-royal-blue to-teal flex items-center justify-center text-white font-bold text-xs shadow-lg">
                        {user?.fullName
                          ? user.fullName
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")
                              .toUpperCase()
                          : (user?.email?.[0] || "U").toUpperCase()}
                      </div>
                    </button>

                    {/* Profile Dropdown */}
                    {profileDropdownOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setProfileDropdownOpen(false)}
                        />
                        <div 
                          className="absolute right-0 mt-3 w-56 bg-white dark:bg-[#111827] rounded-2xl shadow-2xl border border-slate-100 dark:border-white/10 py-2 z-20 animate-in fade-in zoom-in-95 duration-100 origin-top-right overflow-hidden"
                          onClick={() => setProfileDropdownOpen(false)}
                        >
                          <div className="px-4 py-3 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
                            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                              Logged in as
                            </p>
                            <p className="font-bold text-navy dark:text-white truncate">
                              {user?.fullName || user?.email?.split('@')[0]}
                            </p>
                          </div>
                          
                          <div className="p-1.5">
                            <Link
                              to={user?.role === "client" ? "/client/dashboard" : "/freelancer/dashboard"}
                              className="flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-slate-600 dark:text-white/80 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl transition-colors"
                            >
                              <div className="w-8 h-8 rounded-lg bg-teal/10 flex items-center justify-center text-teal">
                                <Menu size={16} />
                              </div>
                              Dashboard
                            </Link>

                            <Link
                              to={user?.role === "client" ? "/client/settings" : "/freelancer/profile"}
                              className="flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-slate-600 dark:text-white/80 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl transition-colors"
                            >
                              <div className="w-8 h-8 rounded-lg bg-royal-blue/10 flex items-center justify-center text-royal-blue">
                                <X size={16} className="rotate-45" />
                              </div>
                              Profile Settings
                            </Link>

                            <hr className="my-1.5 border-slate-100 dark:border-white/5" />

                            <button
                              onClick={() => logout()}
                              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors"
                            >
                              <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-500/10 flex items-center justify-center">
                                <Menu size={16} className="rotate-90" />
                              </div>
                              Sign Out
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <Link to="/login">
                    <Button
                      variant="ghost"
                      className={cn(
                        "font-bold transition-all duration-300 rounded-xl px-6",
                        isWhite || dark
                          ? "text-navy dark:text-white hover:bg-slate-100 dark:hover:bg-white/10"
                          : "text-white hover:bg-white/10",
                      )}
                    >
                      Log In
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button
                      className={cn(
                        "font-bold px-8 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-xl",
                        isWhite || dark
                          ? "bg-teal text-white shadow-teal/20 hover:bg-[#128a7f]"
                          : "bg-white text-navy shadow-white/10 hover:bg-slate-100",
                      )}
                    >
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>

            <div className="lg:hidden flex items-center gap-2">
              <button
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  isWhite || dark ? "text-navy dark:text-white hover:bg-slate-100 dark:hover:bg-white/5" : "text-white hover:bg-white/10",
                )}
                onClick={() => {
                  setMobileMenuOpen(!mobileMenuOpen);
                }}
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={cn(
          "lg:hidden fixed inset-0 z-[100] bg-white dark:bg-[#050B15] flex flex-col transition-all duration-500 ease-in-out transform",
          mobileMenuOpen ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none",
        )}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-white/5 bg-white dark:bg-[#050B15]">
          <Logo isDark={!isWhite} />
          <button
            className="p-2 rounded-lg text-navy dark:text-white hover:bg-slate-100 dark:hover:bg-white/5"
            onClick={() => setMobileMenuOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-8 flex flex-col">
          {isAuthenticated && (
            <div className="mb-8 p-5 rounded-[2rem] bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-royal-blue to-teal flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  {user?.fullName
                    ? user.fullName.split(" ").map((n: string) => n[0]).join("").toUpperCase().substring(0, 2)
                    : (user?.email?.[0] || "U").toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-navy dark:text-white truncate text-lg">{user?.fullName || "User"}</p>
                  <p className="text-xs text-slate-500 dark:text-white/60 truncate">{user?.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to={user?.role === "client" ? "/client/dashboard" : "/freelancer/dashboard"}
                  className="flex items-center justify-center h-11 text-xs font-bold bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 rounded-xl text-navy dark:text-white shadow-sm"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="flex items-center justify-center h-11 text-xs font-bold text-red-500 border border-red-100 dark:border-red-500/20 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 shadow-sm"
                >
                  Log Out
                </button>
              </div>
            </div>
          )}

          <div className="space-y-1">
            {[
              { label: "Find Talent", href: "/freelancers" },
              { label: "Find Work", href: "/projects" },
              { label: "Categories", href: "/categories" },
              { label: "How It Works", href: "/how-it-works" },
              { label: "Pricing", href: "/pricing" },
              { label: "About", href: "/about" },
              { label: "Support & Contact", href: "/contact" },
            ].map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className="flex items-center justify-between p-4 rounded-2xl text-lg font-bold text-navy dark:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition-all group"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
                <ArrowRight size={18} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-teal" />
              </Link>
            ))}
          </div>

          <div className="mt-auto pt-8 border-t border-slate-100 dark:border-white/5 space-y-6">
            <div className="flex items-center justify-between p-5 bg-slate-50 dark:bg-white/5 rounded-[1.5rem] border border-slate-100 dark:border-white/10">
              <div>
                <p className="font-bold text-navy dark:text-white">Interface Theme</p>
                <p className="text-xs text-slate-500 dark:text-slate-500">Switch between light & dark</p>
              </div>
              <ThemeToggle />
            </div>

            {!isAuthenticated && (
              <div className="grid grid-cols-2 gap-4">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block">
                  <Button variant="outline" className="w-full h-16 rounded-2xl border-slate-200 dark:border-white/10 text-navy dark:text-white font-bold text-base">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="block">
                  <Button className="w-full h-16 rounded-2xl bg-teal text-white font-bold text-base shadow-xl shadow-teal/20">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default PublicNavbar;
