import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import type { ClientLayoutContext } from "@/layouts/ClientLayout";
import {
  CreditCard,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { projectService } from "@/services";
import DashboardHeader from "@/components/layouts/DashboardHeader";

// Static payments simulation removed

const ClientPayments = () => {
  const { setSidebarOpen } = useOutletContext<ClientLayoutContext>();
  
  const [activeTab, setActiveTab] = useState("all");
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const projectsData = await projectService.getMyClientProjects({ limit: 100 });
        const mappedPayments = (projectsData.projects || [])
          .filter((p: any) => p.hiredFreelancerId || p.status === "completed" || p.status === "in-progress" || p.status === "cancelled")
          .map((p: any, index: number) => ({
            id: p._id || p.id,
            projectTitle: p.title,
            freelancer: p.freelancer?.fullName || "Assigned Freelancer",
            amount: 0,
            status: p.status === "completed" ? "completed" : p.status === "in-progress" ? "pending" : p.status === "cancelled" ? "failed" : "pending",
            date: new Date(p.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }),
            invoiceId: `INV-${new Date(p.createdAt).getFullYear()}-${String(index + 1).padStart(3, "0")}`,
          }));
        setPayments(mappedPayments);
      } catch (error) {
        console.error("Failed to fetch payments:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  const paymentsData = payments;


  const tabs = [
    { id: "all", label: "All", count: paymentsData.length },
    {
      id: "completed",
      label: "Completed",
      count: paymentsData.filter((p) => p.status === "completed").length,
    },
    {
      id: "pending",
      label: "Pending",
      count: paymentsData.filter((p) => p.status === "pending").length,
    },
    {
      id: "failed",
      label: "Failed",
      count: paymentsData.filter((p) => p.status === "failed").length,
    },
  ];
  const filteredPayments =
    activeTab === "all"
      ? paymentsData
      : paymentsData.filter((p) => p.status === activeTab);
  const totalPaid = paymentsData
    .filter((p) => p.status === "completed")
    .reduce((acc, p) => acc + p.amount, 0);
  const totalPending = paymentsData
    .filter((p) => p.status === "pending")
    .reduce((acc, p) => acc + p.amount, 0);

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "completed":
        return {
          bg: "bg-success-green/10",
          text: "text-success-green",
          icon: CheckCircle,
        };
      case "pending":
        return { bg: "bg-gold/10", text: "text-gold", icon: Clock };
      case "failed":
        return { bg: "bg-red-100", text: "text-red-500", icon: AlertCircle };
      default:
        return { bg: "bg-slate-100", text: "text-slate-500", icon: Clock };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 h-full overflow-y-auto bg-slate-50 dark:bg-background font-sans">
        <DashboardHeader
          title="Payments"
          onMenuClick={() => setSidebarOpen(true)}
        />
      <main className="px-6 lg:px-8 py-6 lg:py-8 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/10 p-5 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-success-green/10 flex items-center justify-center mb-3">
              <CreditCard size={20} className="text-success-green" />
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Total Paid</p>
            <p className="text-2xl font-bold text-navy dark:text-white">
              ₹{totalPaid.toLocaleString()}
            </p>
          </div>
          <div className="bg-white dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/10 p-5 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center mb-3">
              <Clock size={20} className="text-gold" />
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Pending</p>
            <p className="text-2xl font-bold text-navy dark:text-white">
              ₹{totalPending.toLocaleString()}
            </p>
          </div>
          <div className="bg-white dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/10 p-5 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-teal/10 flex items-center justify-center mb-3">
              <FileText size={20} className="text-teal" />
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Transactions</p>
            <p className="text-2xl font-bold text-navy dark:text-white">
              {paymentsData.length}
            </p>
          </div>
          <div className="bg-white dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/10 p-5 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-royal-blue/10 flex items-center justify-center mb-3">
              <CheckCircle size={20} className="text-royal-blue" />
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Success Rate</p>
            <p className="text-2xl font-bold text-navy dark:text-white">
              {Math.round(
                (paymentsData.filter((p) => p.status === "completed").length /
                  paymentsData.length) *
                  100,
              )}
              %
            </p>
          </div>
        </div>
        <div className="bg-white dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/10 shadow-sm">
          <div className="flex overflow-x-auto scrollbar-hide border-b border-slate-100 dark:border-white/10">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-5 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-all",
                  activeTab === tab.id
                    ? "border-teal text-teal"
                    : "border-transparent text-slate-500 dark:text-slate-400 hover:text-navy dark:hover:text-white",
                )}
              >
                {tab.label}
                 <span
                  className={cn(
                    "px-2 py-0.5 text-xs font-bold rounded-full",
                    activeTab === tab.id
                      ? "bg-teal/10 text-teal"
                      : "bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400",
                  )}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-white/5">
                <tr>
                  <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 px-6 py-4">
                    Project
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 px-6 py-4">
                    Freelancer
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 px-6 py-4">
                    Date
                  </th>
                  <th className="text-right text-xs font-semibold text-slate-500 dark:text-slate-400 px-6 py-4">
                    Amount
                  </th>
                  <th className="text-center text-xs font-semibold text-slate-500 dark:text-slate-400 px-6 py-4">
                    Status
                  </th>

                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPayments.map((payment) => {
                  const statusStyle = getStatusStyles(payment.status);
                  const StatusIcon = statusStyle.icon;
                  return (
                    <tr key={payment.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors border-b border-slate-100 dark:border-white/5 last:border-0">
                      <td className="px-6 py-4">
                        <p className="font-medium text-navy dark:text-white">
                          {payment.projectTitle}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                        {payment.freelancer}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                        {payment.date}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-semibold text-navy dark:text-white">
                          ₹{payment.amount.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium capitalize",
                            statusStyle.bg,
                            statusStyle.text,
                          )}
                        >
                          <StatusIcon size={12} />
                          {payment.status}
                        </span>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ClientPayments;
