import { useState, useEffect } from "react";
import { Link, useOutletContext, useLocation } from "react-router-dom";
import {
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
} from "lucide-react";
import { getCategoryStyle } from "@/lib/category-styles";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { applicationService } from "@/services";
import type { Application } from "@/services";
import type { FreelancerLayoutContext } from "@/layouts/FreelancerLayout";
import DashboardHeader from "@/components/layouts/DashboardHeader";
import { ReportModal } from "@/components/common/ReportModal";
import { useFeatureGate } from "@/hooks/useFeatureGate";

const FreelancerApplications = () => {
  const { setSidebarOpen } = useOutletContext<FreelancerLayoutContext>();
  const { refetch: refetchUsage } = useFeatureGate();

  const [activeTab, setActiveTab] = useState("all");
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApplication, setSelectedApplication] =
    useState<Application | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [withdrawAppId, setWithdrawAppId] = useState<string | null>(null);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const fetchApplications = async () => {
    try {
      const data = await applicationService.getMyApplications();
      setApplications(data.applications || []);
    } catch (error) {
      console.error("Error fetching applications:", error);
    }
  };

  const location = useLocation();
  const openAppId = (location.state as any)?.openApplicationId;

  useEffect(() => {
    const loadAndSelect = async () => {
      await fetchApplications();
    };
    loadAndSelect();
  }, []);

  useEffect(() => {
    if (openAppId && applications.length > 0) {
      const app = applications.find((a) => (a._id || a.id) === openAppId);
      if (app) setSelectedApplication(app);
    }
  }, [openAppId, applications]);

  const handleWithdraw = async () => {
    if (!withdrawAppId) return;
    try {
      setIsWithdrawing(true);
      await applicationService.withdraw(withdrawAppId);
      await fetchApplications(); // Refresh the list
      refetchUsage(); // Refresh usage limits so the sidebar updates
      setWithdrawAppId(null);
    } catch (error) {
      console.error("Error withdrawing application:", error);
      alert("Failed to withdraw application. Please try again.");
    } finally {
      setIsWithdrawing(false);
    }
  };

  const filteredApplications =
    activeTab === "all"
      ? applications
      : activeTab === "completed"
      ? applications.filter(
          (app) => app.status === "accepted" && app.project?.status === "completed"
        )
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
      id: "completed",
      label: "Completed",
      count: applications.filter((a) => a.status === "accepted" && a.project?.status === "completed").length,
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
      case "completed":
        return {
          bg: "bg-teal/10",
          text: "text-teal",
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
    <div className="w-full bg-slate-50 dark:bg-background">
      <div className="w-full">
        {/* Header Bar */}
      <DashboardHeader
        title="My Applications"
        onMenuClick={() => setSidebarOpen(true)}
      />

        {/* Main Content Area */}
        <main className="px-6 lg:px-8 py-6 lg:py-8 space-y-6">
          {/* Status Tabs */}
          <div className="bg-white dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5 shadow-sm">
            <div className="flex overflow-x-auto scrollbar-hide">
              {statusTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-5 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-all",
                    activeTab === tab.id
                      ? "border-teal text-teal dark:text-teal-light"
                      : "border-transparent text-slate-500 hover:text-navy dark:hover:text-white hover:border-slate-200 dark:hover:border-white/20",
                  )}
                >
                  {tab.label}
                  <span
                    className={cn(
                      "px-2 py-0.5 text-xs font-bold rounded-full",
                      activeTab === tab.id
                        ? "bg-teal/10 text-teal dark:text-teal-light"
                        : "bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400",
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
              return (
                <div
                  key={application._id || application.id}
                  className="bg-white dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5 shadow-sm p-5 hover:shadow-md transition-all"
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
                            <h3 className="font-semibold text-navy dark:text-white">
                              {application.project?.title || "Untitled Project"}
                            </h3>
                            {(() => {
                              const displayStatus = (application.status === "accepted" && application.project?.status === "completed") 
                                ? "completed" 
                                : application.status;
                              const style = getStatusStyles(displayStatus);
                              const Icon = style.icon;
                              return (
                                <span
                                  className={cn(
                                    "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium capitalize",
                                    style.bg,
                                    style.text,
                                  )}
                                >
                                  <Icon size={12} />
                                  {displayStatus}
                                </span>
                              );
                            })()}
                          </div>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            {(application.project as any)?.client?.fullName ||
                              (application.project as any)?.client?.name ||
                              (application.project as any)?.clientName ||
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
                          <div className="flex items-center gap-4 mt-2 text-sm text-slate-500 dark:text-slate-400">
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

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between lg:justify-end gap-4 w-full lg:w-auto mt-4 lg:mt-0 border-t border-slate-50 pt-4 lg:border-t-0 lg:pt-0">
                      <div className="text-left sm:text-right">
                        <p className="text-xs text-slate-500 dark:text-slate-400">Target Date</p>
                        <p className="text-lg font-bold text-navy dark:text-white">
                          {application.estimatedCompletionDate
                            ? new Date(application.estimatedCompletionDate).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' })
                            : "N/A"}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-slate-200 flex-1 sm:flex-none"
                          onClick={() => setSelectedApplication(application)}
                        >
                          <Eye size={14} className="mr-1" />
                          View Details
                        </Button>
                        {application.status === "pending" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-red-200 text-red-500 hover:bg-red-50 flex-1 sm:flex-none"
                            onClick={() => setWithdrawAppId(application._id || application.id)}
                          >
                            Withdraw
                          </Button>
                        )}
                        {application.status === "accepted" && application.project?.status !== "completed" && (
                          <Link to="/freelancer/messages" className="flex-1 sm:flex-none">
                            <Button
                              size="sm"
                              className="w-full bg-teal hover:bg-teal-light text-white"
                            >
                              <Mail size={14} className="mr-1" />
                              Message
                            </Button>
                          </Link>
                        )}
                        {application.project?.status === "completed" && application.status === "accepted" && (
                          <div className="flex-1 sm:flex-none">
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full border-teal text-teal hover:bg-teal/5 bg-teal/5 cursor-default"
                            >
                              <CheckCircle size={14} className="mr-1" />
                              Job Completed
                            </Button>
                          </div>
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
              <FileText size={48} className="mx-auto text-slate-300 dark:text-slate-700 mb-4" />
              <h3 className="text-lg font-semibold text-navy dark:text-white mb-2">
                No applications found
              </h3>
              <p className="text-slate-500 mb-4">
                Start applying to projects to see them here
              </p>
              <Link to="/freelancer/projects">
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
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between p-4 sm:p-6 border-b border-slate-100 dark:border-white/5">
              <div>
                <h2 className="text-xl font-bold text-navy dark:text-white">
                  Application Details
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                  {selectedApplication.project?.title || "Untitled Project"}
                </p>
              </div>
              <button
                onClick={() => setSelectedApplication(null)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors -mr-2 -mt-2"
              >
                <X size={20} className="text-slate-500 dark:text-slate-400" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              {/* Cover Letter */}
              <div>
                <h3 className="text-sm font-semibold text-navy dark:text-white mb-3">
                  Cover Letter
                </h3>
                <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-4 text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                  {selectedApplication.coverLetter}
                </div>
              </div>

              {/* Application Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-4">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                    Target Date
                  </p>
                  <div className="flex items-center gap-1.5 font-medium text-navy dark:text-white text-sm">
                    <Clock size={14} className="text-slate-400 dark:text-slate-500" />
                    {selectedApplication.estimatedCompletionDate
                      ? new Date(selectedApplication.estimatedCompletionDate).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' })
                      : "Not specified"}
                  </div>
                </div>
                {/* Status card */}
                <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-4 sm:col-span-2">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Status</p>
                  <div className="flex items-center gap-1.5 font-medium text-navy dark:text-white capitalize text-sm">
                    {selectedApplication.status}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-5 lg:p-6 border-t border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 flex justify-end gap-3">
              <Button
                variant="outline"
                className="text-red-500 border-red-200 hover:bg-red-50 dark:border-red-900/30 dark:hover:bg-red-900/20"
                onClick={() => setIsReportModalOpen(true)}
              >
                Report Client
              </Button>
              <Button
                variant="outline"
                className="dark:border-white/10 dark:text-slate-400"
                onClick={() => setSelectedApplication(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {selectedApplication && selectedApplication.project?.clientId && (
        <ReportModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          reportedUserId={typeof selectedApplication.project.clientId === 'string' ? selectedApplication.project.clientId : (selectedApplication.project.clientId as any)._id || (selectedApplication.project as any).client?._id}
          reportedUserName={(selectedApplication.project.clientId as any)?.firstName ? `${(selectedApplication.project.clientId as any).firstName} ${(selectedApplication.project.clientId as any).lastName}` : (selectedApplication.project as any).client?.fullName || 'Client'}
        />
      )}

      {withdrawAppId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 p-6">
            <h3 className="text-xl font-bold text-navy dark:text-white mb-2">Withdraw Application</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
              Are you sure you want to withdraw your application for this project? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                className="dark:border-white/10 dark:text-slate-400"
                onClick={() => setWithdrawAppId(null)}
                disabled={isWithdrawing}
              >
                Cancel
              </Button>
              <Button
                className="bg-red-500 hover:bg-red-600 text-white"
                onClick={handleWithdraw}
                disabled={isWithdrawing}
              >
                {isWithdrawing ? "Withdrawing..." : "Withdraw"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FreelancerApplications;
