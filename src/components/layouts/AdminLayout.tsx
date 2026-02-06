import { useState, useEffect, type ReactNode } from "react";
import { Search, Bell, Menu, X } from "lucide-react";
import AdminSidebar from "./AdminSidebar";
import "@/styles/admin.css";

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
  breadcrumb?: string;
}

const AdminLayout = ({
  children,
  title,
  breadcrumb = "Overview",
}: AdminLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState("");

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

  return (
    <div className="admin-layout">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`${isSidebarOpen ? "open" : ""}`}>
        <AdminSidebar />
      </div>

      {/* Main Content */}
      <main className="admin-main">
        {/* Header */}
        <header className="admin-header">
          <div className="admin-header-left">
            {/* Mobile Menu Toggle */}
            <button
              className="admin-header-icon lg:hidden mr-2"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <h1 className="admin-header-title">{title}</h1>
            <span className="admin-header-breadcrumb">{breadcrumb}</span>
          </div>

          {/* Search */}
          <div className="admin-search">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]"
                size={18}
              />
              <input
                type="text"
                className="admin-search-input"
                placeholder="Search users, projects..."
              />
            </div>
          </div>

          {/* Right Side */}
          <div className="admin-header-right">
            <span className="admin-header-date">{currentDate}</span>

            <button className="admin-header-icon">
              <Bell size={20} />
              <span className="badge">3</span>
            </button>

            <div className="admin-header-avatar">
              SA
              <span className="status-dot"></span>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="admin-content">{children}</div>
      </main>
    </div>
  );
};

export default AdminLayout;
