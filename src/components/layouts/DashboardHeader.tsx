import React from "react";
import { Link } from "react-router-dom";
import { Search, Bell, MessageSquare, Menu } from "lucide-react";
import Breadcrumb, {
  type BreadcrumbItem,
} from "@/components/common/Breadcrumb";
import { cn } from "@/lib/utils";

interface DashboardHeaderProps {
  title: string;
  breadcrumbItems: BreadcrumbItem[];
  onMenuClick?: () => void;
  className?: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  title,
  breadcrumbItems,
  onMenuClick,
  className,
}) => {
  return (
    <header
      className={cn(
        "h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-30 transition-shadow",
        className,
      )}
    >
      {/* Left Section: Title & Breadcrumb */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          {/* Mobile Menu Trigger (Visible only on mobile/tablet) */}
          <button
            onClick={onMenuClick}
            className="lg:hidden text-slate-500 hover:text-navy"
          >
            <Menu size={24} />
          </button>
          <h1 className="text-xl font-bold text-navy tracking-tight">
            {title}
          </h1>
        </div>
        <div className="hidden sm:block">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>

      {/* Right Section: Actions & Profile */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <button className="p-2 text-slate-400 hover:text-navy hover:bg-slate-50 rounded-full transition-all">
          <Search size={20} />
        </button>

        {/* Notifications */}
        <div className="relative">
          <button className="p-2 text-slate-400 hover:text-navy hover:bg-slate-50 rounded-full transition-all">
            <Bell size={20} />
          </button>
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        </div>

        {/* Messages */}
        <Link to="/freelancer/messages" className="relative">
          <button className="p-2 text-slate-400 hover:text-navy hover:bg-slate-50 rounded-full transition-all">
            <MessageSquare size={20} />
          </button>
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-teal rounded-full border-2 border-white"></span>
        </Link>

        <div className="h-8 w-[1px] bg-slate-200 mx-1 hidden sm:block"></div>

        {/* Profile Dropdown Trigger */}
        <Link
          to="/freelancer/profile"
          className="flex items-center gap-3 hover:bg-slate-50 p-1.5 rounded-lg transition-colors"
        >
          <div className="w-9 h-9 rounded-full bg-slate-200 overflow-hidden border border-slate-100">
            <img
              src="https://ui-avatars.com/api/?name=Alex+Johnson&background=0D9488&color=fff"
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="hidden md:block text-left">
            <p className="text-sm font-semibold text-slate-700 leading-none">
              Alex Johnson
            </p>
            <p className="text-xs text-slate-500 mt-1">Freelancer</p>
          </div>
        </Link>
      </div>
    </header>
  );
};

export default DashboardHeader;
