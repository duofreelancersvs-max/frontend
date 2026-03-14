import { useState, useEffect } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { useUnreadStore } from "@/stores/unread.store";
import { useAuth } from "@/hooks/useAuth";
import {
  Menu,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  Search,
  Mail,
  FileText,
  X,
  Eye,
  MessageSquare,
  Bell,
  User,
  Settings,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { getCategoryStyle } from "@/lib/category-styles";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { applicationService } from "@/services";
import type { Application } from "@/services";
import type { FreelancerLayoutContext } from "@/layouts/FreelancerLayout";

const FreelancerApplications = () => {
  const { setSidebarOpen } = useOutletContext<FreelancerLayoutContext>();
  const totalUnreadCount = useUnreadStore((s) => s.totalUnreadCount);
  const [activeTab, setActiveTab] = useState("all");
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApplication, setSelectedApplication] =
    useState<Application | null>(null);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const fetchApplications = async () => {
    try {
      const data = await applicationService.getMyApplications();
      setApplications(data.applications || []);
    } catch (error) {
      console.error("Error fetching applications:", error);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleWithdraw = async (id: string) => {
    if (!window.confirm("Are you sure you want to withdraw this application?"))
      return;
    try {
      await applicationService.withdraw(id);
      await fetchApplications(); // Refresh the list
    } catch (error) {
      console.error("Error withdrawing application:", error);
      alert("Failed to withdraw application. Please try again.");
    }
  };

  const filteredApplications =
    activeTab === "all"
      ? applications
      : applications.filter((app) => app.status === activeTab);

  const statusTabs = [
    { id: "all", label: "All", count: applications.length },
    {
      id: "pending",
      label: "Pending",
      count: applications.filter((a) => a.status === "pending").length,
    },
    {
      id: "accepted",
      label: "Accepted",
      count: applications.filter((a) => a.status === "accepted").length,
    },
    {
      id: "rejected",
      label: "Rejected",
      count: applications.filter((a) => a.status === "rejected").length,
    },
  ];

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "pending":
        return { bg: "bg-gold/10", text: "text-gold", icon: Clock };
      case "accepted":
        return {
          bg: "bg-success-green/10",
          text: "text-success-green",
          icon: CheckCircle,
        };
      case "rejected":
        return { bg: "bg-red-100", text: "text-red-500", icon: XCircle };
      case "withdrawn":
        return {
          bg: "bg-slate-100",
          text: "text-slate-500",
          icon: AlertCircle,
        };
      default:
        return {
          bg: "bg-slate-100",
          text: "text-slate-500",
          icon: AlertCircle,
        };
    }
  };

  return (
    <div className="w-full bg-slate-50">
      <div className="w-full">
        {/* Header Bar */}
        <header className="sticky top-0 z-20 bg-white border-b border-slate-200 px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                <Menu size={24} />
              </button>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-navy">
                  My Applications
                </h1>
                <p className="text-sm text-slate-500 hidden sm:block">
                  Track and manage your project applications
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 lg:gap-4">
              <Link to="/freelancer/messages" className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-lg hidden sm:flex">
                <MessageSquare size={20} />
                {totalUnreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-teal rounded-full border-2 border-white" />
                )}
              </Link>
              <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-lg hidden sm:flex">
                <Bell size={20} />
              </button>
              <Link to="/projects" className="hidden sm:flex">
                <Button className="bg-teal hover:bg-teal-light text-white">
                  <Search size={18} className="mr-2" />
                  Browse Projects
                </Button>
              </Link>

              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 p-1 pr-2 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-royal-blue to-teal flex items-center justify-center text-white font-bold text-sm">
                    {user?.fullName
                      ? user.fullName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                      : (user?.email?.[0] || "U").toUpperCase()}
                  </div>
                  <ChevronDown
                    size={16}
                    className="text-slate-500 hidden sm:block"
                  />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="font-semibold text-navy">
                        {user?.fullName || user?.email?.split("@")[0] || "Freelancer"}
                      </p>
                      <p className="text-sm text-slate-500 truncate">
                        {user?.email}
                      </p>
                    </div>
                    <Link
                      to="/freelancer/profile"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                    >
                      <User size={16} />
                      My Profile
                    </Link>
                    <Link
                      to="/freelancer/settings"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                    >
                      <Settings size={16} />
                      Settings
                    </Link>
                    <hr className="my-2 border-slate-100" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="p-4 lg:p-8 space-y-6">
          {/* Status Tabs */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
            <div className="flex overflow-x-auto scrollbar-hide">
              {statusTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-5 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-all",
                    activeTab === tab.id
                      ? "border-teal text-teal"
                      : "border-transparent text-slate-500 hover:text-navy hover:border-slate-200",
                  )}
                >
                  {tab.label}
                  <span
                    className={cn(
                      "px-2 py-0.5 text-xs font-bold rounded-full",
                      activeTab === tab.id
                        ? "bg-teal/10 text-teal"
                        : "bg-slate-100 text-slate-500",
                    )}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Applications List */}
          <div className="space-y-4">
            {filteredApplications.map((application) => {
              const statusStyle = getStatusStyles(application.status);
              const StatusIcon = statusStyle.icon;

              return (
                <div
                  key={application.id}
                  className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-all"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        {(() => {
                          const category = (application.project as any)?.category || (application.project as any)?.skills?.[0] || "Default";
                          const style = getCategoryStyle(category);
                          const Icon = style.icon;
                          return (
                            <div className={cn(
                              "w-12 h-12 rounded-xl flex items-center justify-center text-white bg-gradient-to-br transition-all duration-300",
                              style.gradient
                            )}>
                              <Icon size={20} className="opacity-90" />
                            </div>
                          );
                        })()}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-navy">
                              {application.project?.title || "Untitled Project"}
                            </h3>
                            <span
                              className={cn(
                                "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium capitalize",
                                statusStyle.bg,
                                statusStyle.text,
                              )}
                            >
                              <StatusIcon size={12} />
                              {application.status}
                            </span>
                          </div>
                          <p className="text-sm text-slate-500 mt-1">
                            {(application.project as any)?.client?.companyName ||
                              (application.project as any)?.client?.fullName ||
                              (application.project as any)?.client?.name ||
                              (application.project as any)?.clientName ||
                              (application.project?.clientId as any)?.companyName ||
                              (application.project?.clientId as any)?.fullName ||
                              (application.project?.clientId
                                ? [
                                    application.project.clientId.firstName,
                                    application.project.clientId.lastName,
                                  ]
                                    .filter(Boolean)
                                    .join(" ")
                                : "") ||
                              "Client"}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                            <span className="flex items-center gap-1">
                              <Calendar size={14} />
                              Applied:{" "}
                              {new Date(
                                application.createdAt,
                              ).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock size={14} />
                              Deadline:{" "}
                              {application.project?.deadline
                                ? new Date(application.project.deadline).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })
                                : "N/A"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <div className="text-right">
                        <p className="text-xs text-slate-500">Duration</p>
                        <p className="text-lg font-bold text-navy">
                          {application.estimatedDuration
                            ? `${application.estimatedDuration} days`
                            : "N/A"}
                        </p>
                        <p className="text-xs text-slate-400">
                          Budget: ₹
                          {(
                            application.project?.budget?.minAmount || 0
                          ).toLocaleString()}{" "}
                          - ₹
                          {(
                            application.project?.budget?.maxAmount || 0
                          ).toLocaleString()}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-slate-200"
                          onClick={() => setSelectedApplication(application)}
                        >
                          <Eye size={14} className="mr-1" />
                          View Details
                        </Button>
                        {application.status === "pending" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-red-200 text-red-500 hover:bg-red-50"
                            onClick={() =>
                              handleWithdraw(application._id || application.id)
                            }
                          >
                            Withdraw
                          </Button>
                        )}
                        {application.status === "accepted" && (
                          <Link to="/freelancer/messages">
                            <Button
                              size="sm"
                              className="bg-teal hover:bg-teal-light text-white"
                            >
                              <Mail size={14} className="mr-1" />
                              Message
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredApplications.length === 0 && (
            <div className="text-center py-12">
              <FileText size={48} className="mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-semibold text-navy mb-2">
                No applications found
              </h3>
              <p className="text-slate-500 mb-4">
                Start applying to projects to see them here
              </p>
              <Link to="/projects">
                <Button className="bg-teal hover:bg-teal-light text-white">
                  <Search size={18} className="mr-2" />
                  Browse Projects
                </Button>
              </Link>
            </div>
          )}
        </main>
      </div>

      {selectedApplication && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between p-6 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-bold text-navy">
                  Application Details
                </h2>
                <p className="text-sm text-slate-500 mt-1 line-clamp-1">
                  {selectedApplication.project?.title || "Untitled Project"}
                </p>
              </div>
              <button
                onClick={() => setSelectedApplication(null)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors -mr-2 -mt-2"
              >
                <X size={20} className="text-slate-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Cover Letter */}
              <div>
                <h3 className="text-sm font-semibold text-navy mb-3">
                  Cover Letter
                </h3>
                <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-600 whitespace-pre-wrap">
                  {selectedApplication.coverLetter}
                </div>
              </div>

              {/* Application Details */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-500 mb-1">
                    Estimated Duration
                  </p>
                  <div className="flex items-center gap-1.5 font-medium text-navy text-sm">
                    <Clock size={14} className="text-slate-400" />
                    {selectedApplication.estimatedDuration
                      ? `${selectedApplication.estimatedDuration} days`
                      : "Not specified"}
                  </div>
                </div>
                {/* Status card */}
                <div className="bg-slate-50 rounded-xl p-4 sm:col-span-2">
                  <p className="text-xs text-slate-500 mb-1">Status</p>
                  <div className="flex items-center gap-1.5 font-medium text-navy capitalize text-sm">
                    {selectedApplication.status}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-5 lg:p-6 border-t border-slate-100 bg-slate-50 flex justify-end">
              <Button
                variant="outline"
                onClick={() => setSelectedApplication(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FreelancerApplications;
