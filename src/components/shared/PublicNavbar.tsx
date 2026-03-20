import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Logo from "@/components/shared/Logo";

export const PublicNavbar = ({ variant = "transparent" }: { variant?: "transparent" | "white" }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
          isWhite
            ? "bg-white backdrop-blur-xl shadow-lg shadow-slate-200/50 py-3"
            : "bg-transparent py-5",
        )}
      >
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Logo isDark={!isWhite} />

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {[
                { label: "Find Talent", href: "/freelancers" },
                { label: "Find Work", href: "/projects" },
                { label: "How It Works", href: "/how-it-works" },
                { label: "Pricing", href: "/pricing" },
                { label: "About", href: "/about" },
              ].map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 relative group",
                    isWhite
                      ? "text-slate-600 hover:text-navy hover:bg-slate-100"
                      : "text-white/80 hover:text-white hover:bg-white/10",
                  )}
                >
                  {item.label}
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-teal group-hover:w-1/2 transition-all duration-300" />
                </Link>
              ))}
            </div>

            {/* Auth Buttons */}
            <div className="hidden lg:flex items-center gap-3">
              <Link to="/login">
                <Button
                  variant="ghost"
                  className={cn(
                    "font-semibold transition-all duration-300",
                    isWhite
                      ? "text-royal-blue hover:bg-royal-blue/10 hover:text-royal-blue"
                      : "text-white hover:bg-white/10 hover:text-white",
                  )}
                >
                  Log In
                </Button>
              </Link>
              <Link to="/register">
                <Button
                  className={cn(
                    "font-semibold px-6 transition-all duration-300 hover:scale-105 hover:shadow-lg",
                    isWhite
                      ? "bg-teal hover:bg-teal-light text-white shadow-teal/25"
                      : "bg-white text-navy hover:bg-white hover:text-navy",
                  )}
                >
                  Get Started
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className={cn(
                "lg:hidden p-2 rounded-lg transition-colors",
                isWhite ? "text-navy hover:bg-slate-100" : "text-white hover:bg-white/10",
              )}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={cn(
          "lg:hidden fixed inset-0 z-[100] bg-white flex flex-col transition-all duration-500 ease-in-out transform",
          mobileMenuOpen ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none",
        )}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-white">
          <Logo isDark={false} />
          <button
            className="p-2 rounded-lg text-navy hover:bg-slate-100"
            onClick={() => setMobileMenuOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col justify-between">
          <div className="space-y-4">
            {[
              { label: "Find Talent", href: "/freelancers" },
              { label: "Find Work", href: "/projects" },
              { label: "How It Works", href: "/how-it-works" },
              { label: "Pricing", href: "/pricing" },
              { label: "About", href: "/about" },
              { label: "Contact", href: "/contact" },
            ].map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className="block px-4 py-3 rounded-xl text-lg text-slate-700 hover:bg-slate-50 hover:text-navy font-semibold transition-all border-b border-slate-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="pt-6 space-y-3 mt-8">
            <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block w-full">
              <Button
                variant="outline"
                className="w-full h-12 border-slate-200 text-slate-700 font-bold text-base"
              >
                Log In
              </Button>
            </Link>
            <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="block w-full">
              <Button className="w-full h-12 bg-teal hover:bg-teal-light text-white font-bold text-base shadow-lg shadow-teal/20">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default PublicNavbar;
