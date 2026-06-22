import { useState, useEffect } from "react";
import { Search, Menu, X, ChevronDown, LogOut } from "lucide-react";
import { Outlet, useLocation } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import { useAuth } from "@/hooks/useAuth";
import "@/styles/admin.css";

const getPageTitle = (pathname: string) => {
  const parts = pathname.split('/').filter(Boolean);
  const lastPart = parts[parts.length - 1];
  if (!lastPart || lastPart === 'admin') return { title: 'Dashboard', breadcrumb: 'Overview' };
  
  const title = lastPart.charAt(0).toUpperCase() + lastPart.slice(1).replace(/-/g, ' ');
  return { title, breadcrumb: title };
};

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState("");
  const location = useLocation();
  const { user, logout } = useAuth();

  const { title, breadcrumb } = getPageTitle(location.pathname);

  useEffect(() => {
    const date = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    setCurrentDate(date.toLocaleDateString("en-US", options));
  }, []);

  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isSidebarOpen]);

  return (
    <div className="admin-layout dark min-h-screen bg-[#09090b] text-white selection:bg-indigo-500/30">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* Main Content */}
      <main id="main-content" className="admin-main lg:ml-64 transition-all duration-300">
        {/* Header */}
        <header className="admin-header bg-[#18181b]/80 backdrop-blur-md border-b border-white/5">
          <div className="admin-header-left">
            {/* Mobile Menu Toggle */}
            <button
              className="admin-header-icon lg:hidden mr-2 text-slate-400 hover:text-white transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
              aria-expanded={isSidebarOpen}
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <h1 className="admin-header-title text-white font-semibold tracking-tight">{title}</h1>
            <span className="admin-header-breadcrumb text-slate-500 text-sm hidden sm:inline-block ml-3 before:content-['/'] before:mr-3 before:text-slate-700">{breadcrumb}</span>
          </div>

          {/* Search */}
          <div className="admin-search hidden lg:block w-96">
            <div className="relative group">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors"
                size={16}
              />
              <input
                type="text"
                className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all"
                placeholder="Search users, projects, or transactions..."
              />
            </div>
          </div>

          {/* Right Side */}
          <div className="admin-header-right flex items-center gap-4">
            <span className="text-slate-400 text-xs font-medium uppercase tracking-wider hidden sm:block">{currentDate}</span>

            {/* Profile Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 hover:bg-white/5 p-1.5 rounded-full transition-colors focus:outline-none"
              >
                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-indigo-500/20 ring-2 ring-white/10 relative">
                  {user?.fullName ? user.fullName.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2) : "SA"}
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#18181b]"></span>
                </div>
                <ChevronDown size={14} className="text-slate-400 hidden sm:block" />
              </button>

              {isProfileOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsProfileOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-48 bg-[#18181b] border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-4 py-3 border-b border-white/10">
                      <p className="text-sm font-semibold text-white truncate">{user?.fullName || "Admin"}</p>
                      <p className="text-xs text-slate-400 truncate mt-0.5">{user?.email}</p>
                    </div>
                    <div className="p-1.5">
                      <button 
                        onClick={() => {
                          setIsProfileOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose-400 font-medium rounded-lg hover:bg-rose-500/10 transition-colors text-left"
                      >
                        <LogOut size={16} />
                        Log out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="admin-content p-4 md:p-6 max-w-[1600px] mx-auto w-full">
          <Outlet context={{ setSidebarOpen: setIsSidebarOpen }} />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
