import { useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import type { ClientLayoutContext } from "@/layouts/ClientLayout";
import { useUnreadStore } from "@/stores/unread.store";
import {
  CreditCard,
  CheckCircle,
  Clock,
  AlertCircle,
  MessageSquare,
  Bell,
  Eye,
  FileText,
  Menu,
  Download,
  User as UserIcon,
  Settings,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

const paymentsData = [
  {
    id: 1,
    projectTitle: "E-commerce Product Video",
    freelancer: "Arun Kumar",
    amount: 22000,
    status: "completed",
    date: "Dec 18, 2024",
    invoiceId: "INV-2024-001",
  },
  {
    id: 2,
    projectTitle: "Corporate Explainer",
    freelancer: "Priya Sharma",
    amount: 40000,
    status: "pending",
    date: "Dec 15, 2024",
    invoiceId: "INV-2024-002",
  },
  {
    id: 3,
    projectTitle: "YouTube Channel Intro",
    freelancer: "Vikram Reddy",
    amount: 8000,
    status: "completed",
    date: "Dec 10, 2024",
    invoiceId: "INV-2024-003",
  },
  {
    id: 4,
    projectTitle: "Wedding Highlight Reel",
    freelancer: "Meera Singh",
    amount: 30000,
    status: "failed",
    date: "Dec 5, 2024",
    invoiceId: "INV-2024-004",
  },
  {
    id: 5,
    projectTitle: "Social Media Ads",
    freelancer: "Rahul Verma",
    amount: 12000,
    status: "completed",
    date: "Nov 28, 2024",
    invoiceId: "INV-2024-005",
  },
];

const ClientPayments = () => {
  const totalUnreadCount = useUnreadStore((s) => s.totalUnreadCount);
  const { setSidebarOpen } = useOutletContext<ClientLayoutContext>();
  const [activeTab, setActiveTab] = useState("all");
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

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

  return (
    <div className="flex-1 h-full overflow-y-auto bg-slate-50 font-sans">
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
                  Payments
                </h1>
                <p className="text-sm text-slate-500 hidden sm:block">
                  Manage your payment history
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 lg:gap-4">
              <Link
                to="/client/messages"
                className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-lg hidden sm:flex"
              >
                <MessageSquare size={20} />
                {totalUnreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-teal rounded-full border-2 border-white" />
                )}
              </Link>
              
              <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-lg hidden sm:flex">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>

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
                        {user?.fullName || user?.email?.split("@")[0] || "Client"}
                      </p>
                      <p className="text-sm text-slate-500 truncate">
                        {user?.email}
                      </p>
                    </div>
                    <Link
                      to="/client/profile"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                    >
                      <UserIcon size={16} />
                      My Profile
                    </Link>
                    <Link
                      to="/client/settings"
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
      <main className="p-4 lg:p-8 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-slate-100 p-5">
            <div className="w-10 h-10 rounded-xl bg-success-green/10 flex items-center justify-center mb-3">
              <CreditCard size={20} className="text-success-green" />
            </div>
            <p className="text-sm text-slate-500 mb-1">Total Paid</p>
            <p className="text-2xl font-bold text-navy">
              ₹{totalPaid.toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 p-5">
            <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center mb-3">
              <Clock size={20} className="text-gold" />
            </div>
            <p className="text-sm text-slate-500 mb-1">Pending</p>
            <p className="text-2xl font-bold text-navy">
              ₹{totalPending.toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 p-5">
            <div className="w-10 h-10 rounded-xl bg-teal/10 flex items-center justify-center mb-3">
              <FileText size={20} className="text-teal" />
            </div>
            <p className="text-sm text-slate-500 mb-1">Transactions</p>
            <p className="text-2xl font-bold text-navy">
              {paymentsData.length}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 p-5">
            <div className="w-10 h-10 rounded-xl bg-royal-blue/10 flex items-center justify-center mb-3">
              <CheckCircle size={20} className="text-royal-blue" />
            </div>
            <p className="text-sm text-slate-500 mb-1">Success Rate</p>
            <p className="text-2xl font-bold text-navy">
              {Math.round(
                (paymentsData.filter((p) => p.status === "completed").length /
                  paymentsData.length) *
                  100,
              )}
              %
            </p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
          <div className="flex overflow-x-auto scrollbar-hide border-b border-slate-100">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-5 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-all",
                  activeTab === tab.id
                    ? "border-teal text-teal"
                    : "border-transparent text-slate-500 hover:text-navy",
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
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left text-xs font-semibold text-slate-500 px-6 py-4">
                    Project
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 px-6 py-4">
                    Freelancer
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 px-6 py-4">
                    Date
                  </th>
                  <th className="text-right text-xs font-semibold text-slate-500 px-6 py-4">
                    Amount
                  </th>
                  <th className="text-center text-xs font-semibold text-slate-500 px-6 py-4">
                    Status
                  </th>
                  <th className="text-center text-xs font-semibold text-slate-500 px-6 py-4">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPayments.map((payment) => {
                  const statusStyle = getStatusStyles(payment.status);
                  const StatusIcon = statusStyle.icon;
                  return (
                    <tr key={payment.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4">
                        <p className="font-medium text-navy">
                          {payment.projectTitle}
                        </p>
                        <p className="text-xs text-slate-500">
                          {payment.invoiceId}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {payment.freelancer}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {payment.date}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-semibold text-navy">
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
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2"
                          >
                            <Eye size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2"
                          >
                            <Download size={16} />
                          </Button>
                        </div>
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
