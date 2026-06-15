import { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  ArrowRight,
  ChevronDown,
  LayoutDashboard,
  Briefcase,
  MessageSquare,
  Settings,
  LogOut,
  PieChart,
  Home,
  Folder,
  PlusCircle,
  Search,
  Mail,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Logo from "@/components/shared/Logo";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { publicService } from "@/services";
import type { CategoryWithSkills } from "@/services";

// Module-level timestamp — persists across component remounts caused by navigation
let menuLastClickTime = 0;

const clientNavItems = [
  { icon: Home, label: "Dashboard", href: "/client/dashboard" },
  { icon: Folder, label: "My Projects", href: "/client/projects" },
  { icon: PlusCircle, label: "Post Project", href: "/client/post-project" },
  { icon: Search, label: "Find Freelancers", href: "/client/freelancers" },
  { icon: Mail, label: "Messages", href: "/client/messages", id: "messages" },
  { icon: Star, label: "Reviews", href: "/client/reviews" },
  { icon: Settings, label: "Settings", href: "/client/settings" },
];

const freelancerNavItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/freelancer/dashboard" },
  { label: "Find Work", icon: Briefcase, href: "/projects" },
  { label: "Messages", icon: MessageSquare, href: "/freelancer/messages" },
  { label: "Subscription", icon: PieChart, href: "/freelancer/subscription" },
  { label: "Profile", icon: Settings, href: "/freelancer/profile" },
];

const MegaMenu = ({
  label,
  href,
  isActive,
  isWhite,
  dark,
  categories,
  isJobType = false,
  isOpen,
  onOpen,
  onClose,
}: {
  label: string;
  href: string;
  isActive: boolean;
  isWhite: boolean;
  dark: boolean;
  categories: CategoryWithSkills[];
  isJobType?: boolean;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}) => {
  const handleClose = () => {
    menuLastClickTime = Date.now();
    onClose();
  };

  return (
    <div
      className="static"
      onMouseEnter={() => {
        if (Date.now() - menuLastClickTime > 600) onOpen();
      }}
      onMouseLeave={() => onClose()}
    >
      <NavLink
        to={href}
        className={cn(
          "flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300",
          isWhite || dark
            ? isActive
              ? "text-teal dark:text-teal-light font-bold"
              : "text-slate-600 dark:text-white/80 hover:text-navy dark:hover:text-white"
            : isActive
              ? "text-teal-light font-bold"
              : "text-white/90 hover:text-white",
        )}
        onClick={handleClose}
      >
        {label}
        <ChevronDown
          size={14}
          className={cn(
            "transition-transform duration-300",
            isOpen && "rotate-180",
          )}
        />
      </NavLink>

      {/* Full-width Dropdown Content */}
      <div
        className={cn(
          "absolute left-0 top-full w-full bg-white dark:bg-[#050B15] shadow-2xl border-t border-slate-100 dark:border-white/5 transition-all duration-300 ease-out z-[48]",
          isOpen
            ? "opacity-100 visible translate-y-0"
            : "opacity-0 invisible translate-y-2",
        )}
      >
        {/* Invisible bridge to prevent gap triggering mouseLeave */}
        <div className="absolute left-0 -top-8 w-full h-8 bg-transparent" />

        <div className="container mx-auto px-4 lg:px-8 py-10 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-x-8 gap-y-12">
            {categories.map((category) => (
              <div key={category._id} className="space-y-4">
                <Link
                  to={`${href}?category=${encodeURIComponent(category.name)}`}
                  className="block text-navy dark:text-white font-bold mb-3 hover:text-teal dark:hover:text-teal-light transition-colors"
                  onClick={handleClose}
                >
                  {category.name}
                  {isJobType ? " jobs" : ""}
                </Link>
                <ul className="space-y-3">
                  {category.skills.slice(0, 6).map((skill) => {
                    const displayName = isJobType
                      ? skill.skillName.replace(/s$/, "") + " jobs"
                      : skill.skillName;
                    return (
                      <li key={skill._id}>
                        <Link
                          to={`${href}?category=${encodeURIComponent(category.name)}&skill=${encodeURIComponent(skill.skillName)}`}
                          className="text-sm text-slate-600 dark:text-white/60 hover:text-teal dark:hover:text-teal-light hover:underline transition-all block"
                          onClick={handleClose}
                        >
                          {displayName}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const PublicNavbar = ({
  variant = "transparent",
  dark = false,
}: {
  variant?: "transparent" | "white";
  dark?: boolean;
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [categories, setCategories] = useState<CategoryWithSkills[]>([]);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>(
    {},
  );
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    publicService
      .getCategoriesWithSkills()
      .then(setCategories)
      .catch((err) => console.error("Failed to fetch categories", err));
  }, []);

  useEffect(() => {
    const isMenuOpen = mobileMenuOpen || openMenu !== null;
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen, openMenu]);

  const isWhite = variant === "white" || isScrolled || mobileMenuOpen;

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-[50] transition-all duration-500",
          isScrolled
            ? "bg-white/80 dark:bg-[#050B15]/80 backdrop-blur-lg shadow-lg shadow-slate-200/20 dark:shadow-none py-3"
            : variant === "white"
              ? "bg-white dark:bg-[#050B15] py-3 dark:shadow-none"
              : "bg-transparent py-3",
        )}
      >
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center">
            {/* Logo Section - Takes 1/3 space or flex-1 */}
            <div className="flex-1 flex justify-start">
              <Logo size="md" />
            </div>

            {/* Desktop Navigation - Centered */}
            <div className="hidden lg:flex items-center justify-center gap-1">
              {isAuthenticated ? (
                (user?.role === "client"
                  ? clientNavItems
                  : freelancerNavItems
                ).map((item) => (
                  <NavLink
                    key={item.label}
                    to={item.href}
                    className={({ isActive }) =>
                      cn(
                        "px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-300 relative group truncate flex items-center gap-1.5",
                        isWhite || dark
                          ? isActive
                            ? "text-teal dark:text-teal-light font-bold"
                            : "text-slate-600 dark:text-white/80 hover:text-navy dark:hover:text-white"
                          : isActive
                            ? "text-teal-light font-bold"
                            : "text-white/90 hover:text-white",
                      )
                    }
                  >
                    <item.icon
                      size={16}
                      className={cn("hidden xl:block opacity-70")}
                    />
                    <span>{item.label}</span>
                  </NavLink>
                ))
              ) : (
                <>
                  <MegaMenu
                    label="Find Talent"
                    href="/freelancers"
                    isActive={location.pathname.startsWith("/freelancers")}
                    isWhite={isWhite}
                    dark={dark}
                    categories={categories}
                    isJobType={false}
                    isOpen={openMenu === "talent"}
                    onOpen={() => setOpenMenu("talent")}
                    onClose={() => setOpenMenu(null)}
                  />
                  <MegaMenu
                    label="Find Work"
                    href="/projects"
                    isActive={location.pathname.startsWith("/projects")}
                    isWhite={isWhite}
                    dark={dark}
                    categories={categories}
                    isJobType={true}
                    isOpen={openMenu === "work"}
                    onOpen={() => setOpenMenu("work")}
                    onClose={() => setOpenMenu(null)}
                  />
                  {[
                    { label: "Categories", href: "/categories" },
                    { label: "How It Works", href: "/how-it-works" },
                    { label: "Pricing", href: "/pricing" },
                  ].map((item) => (
                    <NavLink
                      key={item.label}
                      to={item.href}
                      className={({ isActive }) =>
                        cn(
                          "px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 relative group truncate",
                          isWhite || dark
                            ? isActive
                              ? "text-teal dark:text-teal-light font-bold"
                              : "text-slate-600 dark:text-white/80 hover:text-navy dark:hover:text-white"
                            : isActive
                              ? "text-teal-light font-bold"
                              : "text-white/90 hover:text-white",
                        )
                      }
                    >
                      {item.label}
                    </NavLink>
                  ))}
                </>
              )}
            </div>

            {/* Auth & Actions Section - Takes 1/3 space or flex-1 */}
            <div className="flex-1 flex justify-end items-center gap-3">
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
                        onClick={() =>
                          setProfileDropdownOpen(!profileDropdownOpen)
                        }
                        className={cn(
                          "flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300",
                          isWhite || dark
                            ? "hover:bg-slate-100"
                            : "hover:bg-white/10",
                          profileDropdownOpen &&
                            "ring-2 ring-teal ring-offset-2 dark:ring-offset-[#050B15]",
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
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                                  Logged in as
                                </p>
                                <span
                                  className={cn(
                                    "text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded",
                                    user?.role === "client"
                                      ? "bg-teal/10 text-teal"
                                      : "bg-royal-blue/10 text-royal-blue",
                                  )}
                                >
                                  {user?.role}
                                </span>
                              </div>
                              <p className="font-bold text-navy dark:text-white truncate">
                                {user?.fullName || user?.email?.split("@")[0]}
                              </p>
                            </div>

                            <div className="p-1.5">
                              {(user?.role === "client"
                                ? clientNavItems
                                : freelancerNavItems
                              ).map((item) => (
                                <Link
                                  key={item.label}
                                  to={item.href}
                                  className="flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-slate-600 dark:text-white/80 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl transition-colors"
                                >
                                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 dark:text-slate-400">
                                    <item.icon size={16} />
                                  </div>
                                  {item.label}
                                </Link>
                              ))}

                              <hr className="my-1.5 border-slate-100 dark:border-white/5" />

                              <button
                                onClick={() => logout()}
                                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors"
                              >
                                <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-500/10 flex items-center justify-center">
                                  <LogOut size={16} />
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

              {/* Mobile Menu Toggle */}
              <div className="lg:hidden flex items-center gap-2">
                <button
                  className={cn(
                    "p-2 rounded-lg transition-colors",
                    isWhite || dark
                      ? "text-navy dark:text-white hover:bg-slate-100 dark:hover:bg-white/5"
                      : "text-white hover:bg-white/10",
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
        </div>
      </nav>

      {/* Backdrop: covers entire page when mega menu is open — locks scroll interactions and closes on click/mouseenter */}
      {openMenu !== null && (
        <div
          className="fixed inset-0 z-[45]"
          onMouseEnter={() => setOpenMenu(null)}
          onClick={() => setOpenMenu(null)}
        />
      )}

      {/* Mobile Menu Overlay */}
      <div
        className={cn(
          "lg:hidden fixed inset-0 z-[100] bg-white dark:bg-[#050B15] flex flex-col transition-all duration-500 ease-in-out transform",
          mobileMenuOpen
            ? "translate-y-0 opacity-100"
            : "-translate-y-full opacity-0 pointer-events-none",
        )}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-white/5 bg-white dark:bg-[#050B15]">
          <Logo />
          <button
            className="p-2 rounded-lg text-navy dark:text-white hover:bg-slate-100 dark:hover:bg-white/5"
            onClick={() => setMobileMenuOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-8 flex flex-col">
          {isAuthenticated && (
            <div className="mb-6 p-5 rounded-[2rem] bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-royal-blue to-teal flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  {user?.fullName
                    ? user.fullName
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .toUpperCase()
                        .substring(0, 2)
                    : (user?.email?.[0] || "U").toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-bold text-navy dark:text-white truncate text-lg">
                      {user?.fullName || "User"}
                    </p>
                    <span
                      className={cn(
                        "text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full shrink-0",
                        user?.role === "client"
                          ? "bg-teal/10 text-teal dark:bg-teal/20"
                          : "bg-royal-blue/10 text-royal-blue dark:bg-royal-blue/20",
                      )}
                    >
                      {user?.role}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-white/60 truncate">
                    {user?.email}
                  </p>
                </div>
              </div>
            </div>
          )}

          {!isAuthenticated && (
            <div className="mb-8 grid grid-cols-2 gap-4">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block"
              >
                <Button
                  variant="outline"
                  className="w-full h-14 rounded-2xl border-slate-200 dark:border-white/10 text-navy dark:text-white font-bold text-base"
                >
                  Login
                </Button>
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block"
              >
                <Button className="w-full h-14 rounded-2xl bg-teal text-white font-bold text-base shadow-xl shadow-teal/20">
                  Create Account
                </Button>
              </Link>
            </div>
          )}

          {isAuthenticated ? (
            <div className="space-y-1">
              {(user?.role === "client"
                ? clientNavItems
                : freelancerNavItems
              ).map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  className="flex items-center gap-4 p-4 rounded-2xl text-lg font-bold text-navy dark:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition-all group"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:bg-white dark:group-hover:bg-white/10 group-hover:text-teal transition-all">
                    <item.icon size={20} />
                  </div>
                  {item.label}
                </Link>
              ))}

              <hr className="my-4 border-slate-100 dark:border-white/5" />

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-4 p-4 rounded-2xl text-lg font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center text-red-500 group-hover:bg-red-100 dark:group-hover:bg-red-500/20 transition-all">
                  <LogOut size={20} />
                </div>
                Log Out
              </button>
            </div>
          ) : (
            <div className="space-y-1">
              {/* Find Talent Mobile Accordion */}
              <div className="rounded-2xl overflow-hidden mb-1">
                <button
                  onClick={() =>
                    setExpandedItems((prev) => ({
                      ...prev,
                      talent: !prev.talent,
                    }))
                  }
                  className={cn(
                    "w-full flex items-center justify-between p-4 text-lg font-bold text-navy dark:text-white transition-all",
                    expandedItems.talent
                      ? "bg-slate-50 dark:bg-white/5 text-teal"
                      : "hover:bg-slate-50 dark:hover:bg-white/5",
                  )}
                >
                  Find Talent
                  <ChevronDown
                    className={cn(
                      "transition-transform duration-300",
                      expandedItems.talent && "rotate-180",
                    )}
                    size={20}
                  />
                </button>
                {expandedItems.talent && (
                  <div className="px-6 py-4 space-y-6 bg-slate-50 dark:bg-white/[0.03] animate-in slide-in-from-top-2 duration-300">
                    {categories.map((category) => (
                      <div key={category._id} className="space-y-3">
                        <Link
                          to={`/freelancers?category=${encodeURIComponent(category.name)}`}
                          onClick={() => setMobileMenuOpen(false)}
                          className="text-sm font-bold text-navy dark:text-white hover:text-teal block"
                        >
                          {category.name}
                        </Link>
                        <div className="grid grid-cols-1 gap-3 pl-3 border-l border-slate-200 dark:border-white/10">
                          {category.skills.slice(0, 5).map((skill) => (
                            <Link
                              key={skill._id}
                              to={`/freelancers?category=${encodeURIComponent(category.name)}&skill=${encodeURIComponent(skill.skillName)}`}
                              onClick={() => setMobileMenuOpen(false)}
                              className="text-xs text-slate-500 dark:text-white/60 hover:text-teal"
                            >
                              {skill.skillName}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Find Work Mobile Accordion */}
              <div className="rounded-2xl overflow-hidden mb-1">
                <button
                  onClick={() =>
                    setExpandedItems((prev) => ({ ...prev, work: !prev.work }))
                  }
                  className={cn(
                    "w-full flex items-center justify-between p-4 text-lg font-bold text-navy dark:text-white transition-all",
                    expandedItems.work
                      ? "bg-slate-50 dark:bg-white/5 text-teal"
                      : "hover:bg-slate-50 dark:hover:bg-white/5",
                  )}
                >
                  Find Work
                  <ChevronDown
                    className={cn(
                      "transition-transform duration-300",
                      expandedItems.work && "rotate-180",
                    )}
                    size={20}
                  />
                </button>
                {expandedItems.work && (
                  <div className="px-6 py-4 space-y-6 bg-slate-50 dark:bg-white/[0.03] animate-in slide-in-from-top-2 duration-300">
                    {categories.map((category) => (
                      <div key={category._id} className="space-y-3">
                        <Link
                          to={`/projects?category=${encodeURIComponent(category.name)}`}
                          onClick={() => setMobileMenuOpen(false)}
                          className="text-sm font-bold text-navy dark:text-white hover:text-teal block"
                        >
                          {category.name} jobs
                        </Link>
                        <div className="grid grid-cols-1 gap-3 pl-3 border-l border-slate-200 dark:border-white/10">
                          {category.skills.slice(0, 5).map((skill) => (
                            <Link
                              key={skill._id}
                              to={`/projects?category=${encodeURIComponent(category.name)}&skill=${encodeURIComponent(skill.skillName)}`}
                              onClick={() => setMobileMenuOpen(false)}
                              className="text-xs text-slate-500 dark:text-white/60 hover:text-teal"
                            >
                              {skill.skillName.replace(/s$/, "")} jobs
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {[
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
                  <ArrowRight
                    size={18}
                    className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-teal"
                  />
                </Link>
              ))}
            </div>
          )}

          <div className="mt-auto pt-8 border-t border-slate-100 dark:border-white/5">
            <div className="flex items-center justify-between p-5 bg-slate-50 dark:bg-white/5 rounded-[1.5rem] border border-slate-100 dark:border-white/10">
              <div>
                <p className="font-bold text-navy dark:text-white">
                  Interface Theme
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-500">
                  Switch between light & dark
                </p>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PublicNavbar;
