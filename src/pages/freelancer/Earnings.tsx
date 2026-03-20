import { useState, useEffect } from "react";
import { Link, useOutletContext } from "react-router-dom";
import {
  Menu,
  TrendingUp,
  Clock,
  CheckCircle,
  ChevronRight,
  ArrowUpRight,
  PieChart,
  BarChart3,
  DollarSign,
  MessageSquare,
  Bell,
  User,
  Settings,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import type { FreelancerLayoutContext } from "@/layouts/FreelancerLayout";
import { useUnreadStore } from "@/stores/unread.store";
import { projectService } from "@/services/project.service";

// Date range options
const dateRanges = [
  { value: "this-month", label: "This Month" },
  { value: "last-3-months", label: "Last 3 Months" },
  { value: "this-year", label: "This Year" },
  { value: "custom", label: "Custom" },
];

const FreelancerEarnings = () => {
  const totalUnreadCount = useUnreadStore((s) => s.totalUnreadCount);
  const { setSidebarOpen } = useOutletContext<FreelancerLayoutContext>();
  const [selectedDateRange, setSelectedDateRange] = useState("this-month");
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await projectService.getMyFreelancerProjects();
        setProjects(res.projects || []);
      } catch (error) {
        console.error("Error fetching earnings:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const completedProjectsList = (projects || []).filter(
    (p) => p.status === "completed",
  );
  const pendingProjectsList = (projects || []).filter(
    (p) => p.status === "in-progress" || p.status === "open",
  );

  const totalEarnings = completedProjectsList.reduce(
    (acc, p) => acc + (p.budget?.maxAmount || 0),
    0,
  );
  const pendingEarnings = pendingProjectsList.reduce(
    (acc, p) => acc + (p.budget?.maxAmount || 0),
    0,
  );

  const stats = {
    totalEarnings,
    thisMonth: completedProjectsList
      .filter((p) => {
        const date = p.completedAt
          ? new Date(p.completedAt)
          : new Date(p.updatedAt);
        const now = new Date();
        return (
          date.getMonth() === now.getMonth() &&
          date.getFullYear() === now.getFullYear()
        );
      })
      .reduce((acc, p) => acc + (p.budget?.maxAmount || 0), 0),
    pending: pendingEarnings,
    projectsCompleted: completedProjectsList.length,
  };

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const monthlyEarningsData = months.map((m, idx) => {
    const total = completedProjectsList
      .filter((p) => {
        const date = p.completedAt
          ? new Date(p.completedAt)
          : new Date(p.updatedAt);
        return (
          date.getMonth() === idx &&
          date.getFullYear() === new Date().getFullYear()
        );
      })
      .reduce((acc, p) => acc + (p.budget?.maxAmount || 0), 0);
    return { month: m, earnings: total };
  });

  const maxEarning = Math.max(
    ...monthlyEarningsData.map((m) => m.earnings || 0),
    1000,
  );

  const recentTransactionsData = (projects || [])
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    )
    .slice(0, 5)
    .map((p) => ({
      id: p._id,
      date: new Date(p.completedAt || p.updatedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      project: p.title,
      client: p.client?.fullName || "Client",
      amount: p.budget?.maxAmount || 0,
      status: p.status === "completed" ? "completed" : "pending",
    }));

  const categoryMap: any = {};
  completedProjectsList.forEach((p) => {
    const cat = p.category || "Other";
    categoryMap[cat] = (categoryMap[cat] || 0) + (p.budget?.maxAmount || 0);
  });

  const colors = ["#0D9488", "#1E40AF", "#F59E0B", "#10B981"];
  const categoryBreakdownData = Object.entries(categoryMap).map(
    ([cat, amount]: any, idx) => ({
      category: cat,
      amount,
      percentage: Math.round((amount / (totalEarnings || 1)) * 100),
      color: colors[idx % colors.length],
    }),
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal"></div>
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-50">
      <div className="w-full">
        {/* Header Bar */}
        <header className="sticky top-0 z-20 bg-white border-b border-slate-200 px-4 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 w-full">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                <Menu size={24} />
              </button>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-navy">
                  Earnings
                </h1>
                <p className="text-sm text-slate-500 hidden sm:block">
                  Track your income and manage withdrawals
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 lg:gap-4">
              {/* Date Range Selector */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                {dateRanges.map((range) => (
                  <button
                    key={range.value}
                    onClick={() => setSelectedDateRange(range.value)}
                    className={cn(
                      "px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-all",
                      selectedDateRange === range.value
                        ? "bg-white text-navy shadow-sm"
                        : "text-slate-500 hover:text-navy",
                    )}
                  >
                    {range.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to="/freelancer/messages"
                  className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-lg flex"
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
                          {user?.fullName ||
                            user?.email?.split("@")[0] ||
                            "Freelancer"}
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
          </div>
        </header>

        {/* Main Content Area */}
        <main className="p-4 lg:p-8 space-y-6">
          {/* STATS CARDS */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {/* Total Earnings */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-success-green/10 flex items-center justify-center">
                  <DollarSign size={20} className="text-success-green" />
                </div>
                <span className="flex items-center gap-1 text-success-green text-xs font-medium">
                  <ArrowUpRight size={14} />
                  +18%
                </span>
              </div>
              <p className="text-sm text-slate-500 mb-1">Total Earnings</p>
              <p className="text-2xl font-bold text-navy">
                ₹{stats.totalEarnings.toLocaleString()}
              </p>
            </div>

            {/* This Month */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-royal-blue/10 flex items-center justify-center">
                  <TrendingUp size={20} className="text-royal-blue" />
                </div>
                <span className="flex items-center gap-1 text-success-green text-xs font-medium">
                  <ArrowUpRight size={14} />
                  +12%
                </span>
              </div>
              <p className="text-sm text-slate-500 mb-1">This Month</p>
              <p className="text-2xl font-bold text-navy">
                ₹{stats.thisMonth.toLocaleString()}
              </p>
            </div>

            {/* Pending */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
                  <Clock size={20} className="text-gold" />
                </div>
              </div>
              <p className="text-sm text-slate-500 mb-1">Pending</p>
              <p className="text-2xl font-bold text-navy">
                ₹{stats.pending.toLocaleString()}
              </p>
            </div>

            {/* Projects Completed */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-teal/10 flex items-center justify-center">
                  <CheckCircle size={20} className="text-teal" />
                </div>
              </div>
              <p className="text-sm text-slate-500 mb-1">Projects Completed</p>
              <p className="text-2xl font-bold text-navy">
                {stats.projectsCompleted}
              </p>
            </div>
          </section>

          {/* CHARTS ROW */}
          <section className="grid lg:grid-cols-3 gap-6">
            {/* EARNINGS CHART (2 columns) */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-navy">
                  Earnings Overview
                </h2>
                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-lg bg-teal/10 text-teal">
                    <BarChart3 size={16} />
                  </button>
                </div>
              </div>

              {/* Bar Chart */}
              <div className="h-64 flex items-end gap-2 px-2">
                {monthlyEarningsData.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex-1 flex flex-col items-center gap-2"
                  >
                    <div className="relative w-full group">
                      {/* Tooltip */}
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-navy text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                        ₹{item.earnings.toLocaleString()}
                      </div>
                      {/* Bar */}
                      <div
                        className={cn(
                          "w-full rounded-t-lg transition-all cursor-pointer",
                          idx === monthlyEarningsData.length - 1
                            ? "bg-teal"
                            : "bg-teal/30 group-hover:bg-teal/50",
                        )}
                        style={{
                          height: `${(item.earnings / maxEarning) * 200}px`,
                        }}
                      />
                    </div>
                    <span className="text-xs text-slate-500">{item.month}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* EARNINGS BREAKDOWN (1 column) */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-navy">By Category</h2>
                <PieChart size={18} className="text-slate-400" />
              </div>

              {/* Pie Chart Visual */}
              <div className="relative w-32 h-32 mx-auto mb-6">
                <svg viewBox="0 0 100 100" className="transform -rotate-90">
                  {categoryBreakdownData.map((cat, idx) => {
                    const previousPercentages = categoryBreakdownData
                      .slice(0, idx)
                      .reduce((acc: number, c: any) => acc + c.percentage, 0);
                    const circumference = 2 * Math.PI * 40;
                    const strokeDasharray = `${(cat.percentage / 100) * circumference} ${circumference}`;
                    const strokeDashoffset =
                      -(previousPercentages / 100) * circumference;

                    return (
                      <circle
                        key={cat.category}
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke={cat.color}
                        strokeWidth="20"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                      />
                    );
                  })}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-navy">100%</span>
                </div>
              </div>

              {/* Legend */}
              <div className="space-y-3">
                {categoryBreakdownData.map((cat) => (
                  <div
                    key={cat.category}
                    className="flex items-center justify-between w-full min-w-0"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="text-sm text-slate-600">
                        {cat.category}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium text-navy">
                        ₹{cat.amount.toLocaleString()}
                      </span>
                      <span className="text-xs text-slate-400 ml-2">
                        {cat.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* RECENT TRANSACTIONS */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-navy">
                Recent Transactions
              </h2>
              <button className="text-sm text-teal font-medium hover:underline flex items-center gap-1">
                View All
                <ChevronRight size={16} />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left text-xs font-semibold text-slate-500 px-6 py-3">
                      Date
                    </th>
                    <th className="text-left text-xs font-semibold text-slate-500 px-6 py-3">
                      Project
                    </th>
                    <th className="text-left text-xs font-semibold text-slate-500 px-6 py-3">
                      Client
                    </th>
                    <th className="text-right text-xs font-semibold text-slate-500 px-6 py-3">
                      Amount
                    </th>
                    <th className="text-center text-xs font-semibold text-slate-500 px-6 py-3">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentTransactionsData.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {tx.date}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-navy">
                          {tx.project}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {tx.client}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-semibold text-navy">
                          ₹{tx.amount.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium",
                            tx.status === "completed"
                              ? "bg-success-green/10 text-success-green"
                              : "bg-gold/10 text-gold",
                          )}
                        >
                          {tx.status === "completed" ? (
                            <CheckCircle size={12} />
                          ) : (
                            <Clock size={12} />
                          )}
                          {tx.status === "completed" ? "Completed" : "Pending"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default FreelancerEarnings;
