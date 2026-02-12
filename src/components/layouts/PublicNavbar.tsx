import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PublicNavbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Find Talent", href: "/freelancers" },
    { name: "Find Work", href: "/find-work" },
    { name: "Post Project", href: "/client/post-project" },
    { name: "How It Works", href: "/how-it-works" },
    { name: "Pricing", href: "/pricing" },
  ];

  return (
    <nav
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300 bg-white border-b border-transparent",
        isScrolled ? "shadow-md border-slate-200/50" : "",
      )}
      style={{ height: "64px" }}
    >
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-navy flex items-center justify-center text-white font-bold text-xl">
            C
          </div>
          <span className="font-bold text-xl text-navy hidden sm:block tracking-tight">
            ConnectMe
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className="text-sm font-medium text-slate-500 hover:text-navy transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <Link to="/login">
            <Button
              variant="outline"
              className="border-royal-blue text-royal-blue hover:bg-royal-blue/5 hover:text-royal-blue"
            >
              Log In
            </Button>
          </Link>
          <Link to="/register">
            <Button className="bg-teal hover:bg-teal/90 text-white">
              Sign Up
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden p-2 text-slate-500 hover:text-navy"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-[64px] left-0 w-full bg-white border-b border-slate-100 shadow-lg animate-in slide-in-from-top-5">
          <div className="flex flex-col p-4 gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="text-base font-medium text-slate-500 hover:text-navy py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-slate-100">
              <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                <Button
                  variant="outline"
                  className="w-full border-royal-blue text-royal-blue hover:bg-royal-blue/5"
                >
                  Log In
                </Button>
              </Link>
              <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                <Button className="w-full bg-teal hover:bg-teal/90 text-white">
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default PublicNavbar;
