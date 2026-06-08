import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import {
  TrendingUp,
  Clock,
  CheckCircle,
  ChevronRight,
  ArrowUpRight,
  PieChart,
  BarChart3,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { projectService } from "@/services/project.service";
import DashboardHeader from "@/components/layouts/DashboardHeader";
import type { FreelancerLayoutContext } from "@/layouts/FreelancerLayout";

// Date range options
const dateRanges = [
  { value: "this-month", label: "This Month" },
  { value: "last-3-months", label: "Last 3 Months" },
  { value: "this-year", label: "This Year" },
  { value: "custom", label: "Custom" },
];

const FreelancerEarnings = () => {
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


  const completedProjectsList = (projects || []).filter(
    (p) => p.status === "completed",
  );
  const pendingProjectsList = (projects || []).filter(
    (p) => p.status === "in-progress" || p.status === "open",
  );

  const totalEarnings = completedProjectsList.reduce(
    (acc, _p) => acc + 0,
    0,
  );
  const pendingEarnings = pendingProjectsList.reduce(
    (acc, _p) => acc + 0,
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
      .reduce((acc, _p) => acc + 0, 0),
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
      .reduce((acc, _p) => acc + 0, 0);
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
      amount: 0,
      status: p.status === "completed" ? "completed" : "pending",
    }));

  const categoryMap: any = {};
  completedProjectsList.forEach((p) => {
    const cat = p.category || "Other";
    categoryMap[cat] = (categoryMap[cat] || 0) + 0;
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
      <div className="min-h-screen bg-slate-50 dark:bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal"></div>
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-50 dark:bg-background">
      <div className="w-full">
        {/* Header Bar */}
        <DashboardHeader
          title="Earnings"
          onMenuClick={() => setSidebarOpen(true)}
        >
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/5 p-1 rounded-xl ml-auto">
            {dateRanges.map((range) => (
              <button
                key={range.value}
                onClick={() => setSelectedDateRange(range.value)}
                className={cn(
                  "px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-all",
                  selectedDateRange === range.value
                    ? "bg-white dark:bg-teal text-navy dark:text-white shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:text-navy dark:hover:text-white",
                )}
              >
                {range.label}
              </button>
            ))}
          </div>
        </DashboardHeader>

        {/* Main Content Area */}
        <main className="px-6 lg:px-8 py-6 lg:py-8 space-y-6">
          {/* STATS CARDS */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {/* Total Earnings */}
            <div className="bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-success-green/10 flex items-center justify-center">
                  <Wallet size={20} className="text-success-green" />
                </div>
                <span className="flex items-center gap-1 text-success-green text-xs font-medium">
                  <ArrowUpRight size={14} />
                  +18%
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Total Earnings</p>
              <p className="text-2xl font-bold text-navy dark:text-white">
                ₹{stats.totalEarnings.toLocaleString()}
              </p>
            </div>

            {/* This Month */}
            <div className="bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-royal-blue/10 flex items-center justify-center">
                  <TrendingUp size={20} className="text-royal-blue" />
                </div>
                <span className="flex items-center gap-1 text-success-green text-xs font-medium">
                  <ArrowUpRight size={14} />
                  +12%
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">This Month</p>
              <p className="text-2xl font-bold text-navy dark:text-white">
                ₹{stats.thisMonth.toLocaleString()}
              </p>
            </div>

            {/* Pending */}
            <div className="bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
                  <Clock size={20} className="text-gold" />
                </div>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Pending</p>
              <p className="text-2xl font-bold text-navy dark:text-white">
                ₹{stats.pending.toLocaleString()}
              </p>
            </div>

            {/* Projects Completed */}
            <div className="bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-teal/10 flex items-center justify-center">
                  <CheckCircle size={20} className="text-teal" />
                </div>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Projects Completed</p>
              <p className="text-2xl font-bold text-navy dark:text-white">
                {stats.projectsCompleted}
              </p>
            </div>
          </section>

          {/* CHARTS ROW */}
          <section className="grid lg:grid-cols-3 gap-6">
            {/* EARNINGS CHART (2 columns) */}
            <div className="lg:col-span-2 bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-navy dark:text-white">
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
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-navy dark:bg-teal text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
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
                    <span className="text-xs text-slate-500 dark:text-slate-400">{item.month}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* EARNINGS BREAKDOWN (1 column) */}
            <div className="bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-navy dark:text-white">By Category</h2>
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
                  <span className="text-lg font-bold text-navy dark:text-white">100%</span>
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
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {cat.category}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium text-navy dark:text-white">
                        ₹{cat.amount.toLocaleString()}
                      </span>
                      <span className="text-xs text-slate-400 dark:text-slate-500 ml-2">
                        {cat.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* RECENT TRANSACTIONS */}
          <div className="bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-white/5">
              <h2 className="text-lg font-bold text-navy dark:text-white">
                Recent Transactions
              </h2>
              <button className="text-sm text-teal font-medium hover:underline flex items-center gap-1">
                View All
                <ChevronRight size={16} />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-white/5">
                  <tr>
                    <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 px-6 py-3">
                      Date
                    </th>
                    <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 px-6 py-3">
                      Project
                    </th>
                    <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 px-6 py-3">
                      Client
                    </th>
                    <th className="text-right text-xs font-semibold text-slate-500 dark:text-slate-400 px-6 py-3">
                      Amount
                    </th>
                    <th className="text-center text-xs font-semibold text-slate-500 dark:text-slate-400 px-6 py-3">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {recentTransactionsData.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                        {tx.date}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-navy dark:text-white">
                          {tx.project}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                        {tx.client}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-semibold text-navy dark:text-white">
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
