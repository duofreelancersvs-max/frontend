import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Home,
  User,
  FolderOpen,
  Search,
  FileText,
  Mail,
  CreditCard,
  DollarSign,
  Star,
  Settings,
  LogOut,
  Award,
  X,
  Menu,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Download,
  Wallet,
  Building2,
  ChevronRight,
  ArrowUpRight,
  Eye,
  EyeOff,
  FileDown,
  Receipt,
  PieChart,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Sidebar Navigation Items for Freelancer
const sidebarNavItems = [
  {
    icon: Home,
    label: "Dashboard",
    href: "/freelancer/dashboard",
    active: false,
  },
  { icon: User, label: "My Profile", href: "/freelancer/profile", badge: null },
  {
    icon: FolderOpen,
    label: "Portfolio",
    href: "/freelancer/portfolio",
    badge: null,
  },
  { icon: Search, label: "Browse Projects", href: "/projects", badge: null },
  {
    icon: FileText,
    label: "My Applications",
    href: "/freelancer/applications",
    badge: "3",
  },
  { icon: Mail, label: "Messages", href: "/freelancer/messages", badge: "5" },
  {
    icon: CreditCard,
    label: "Subscription",
    href: "/freelancer/subscription",
    badge: null,
  },
  {
    icon: DollarSign,
    label: "Earnings",
    href: "/freelancer/earnings",
    active: true,
    badge: null,
  },
  { icon: Star, label: "Reviews", href: "/freelancer/reviews", badge: null },
  {
    icon: Settings,
    label: "Settings",
    href: "/freelancer/settings",
    badge: null,
  },
];

// Date range options
const dateRanges = [
  { value: "this-month", label: "This Month" },
  { value: "last-3-months", label: "Last 3 Months" },
  { value: "this-year", label: "This Year" },
  { value: "custom", label: "Custom" },
];

// Mock earnings data for chart
const monthlyEarnings = [
  { month: "Jan", earnings: 12000 },
  { month: "Feb", earnings: 18000 },
  { month: "Mar", earnings: 15000 },
  { month: "Apr", earnings: 22000 },
  { month: "May", earnings: 19000 },
  { month: "Jun", earnings: 25000 },
  { month: "Jul", earnings: 28000 },
  { month: "Aug", earnings: 24000 },
  { month: "Sep", earnings: 30000 },
  { month: "Oct", earnings: 27000 },
  { month: "Nov", earnings: 32000 },
  { month: "Dec", earnings: 8000 },
];

// Category breakdown data
const categoryBreakdown = [
  {
    category: "Video Editing",
    amount: 85000,
    percentage: 42,
    color: "#0D9488",
  },
  {
    category: "Motion Graphics",
    amount: 55000,
    percentage: 27,
    color: "#1E40AF",
  },
  {
    category: "Color Grading",
    amount: 35000,
    percentage: 17,
    color: "#F59E0B",
  },
  { category: "VFX", amount: 28000, percentage: 14, color: "#10B981" },
];

// Recent transactions
const recentTransactions = [
  {
    id: 1,
    date: "Dec 15, 2024",
    project: "E-commerce Product Video",
    client: "TechMart Solutions",
    amount: 18000,
    status: "completed",
  },
  {
    id: 2,
    date: "Dec 12, 2024",
    project: "Corporate Explainer",
    client: "InnovateCorp",
    amount: 32000,
    status: "completed",
  },
  {
    id: 3,
    date: "Dec 10, 2024",
    project: "Social Media Ads",
    client: "Brand Boost Agency",
    amount: 12000,
    status: "pending",
  },
  {
    id: 4,
    date: "Dec 5, 2024",
    project: "Wedding Highlight Reel",
    client: "Moments Photography",
    amount: 15000,
    status: "completed",
  },
  {
    id: 5,
    date: "Dec 1, 2024",
    project: "YouTube Intro Animation",
    client: "TechReview Pro",
    amount: 8000,
    status: "completed",
  },
];

// Withdrawal history
const withdrawalHistory = [
  {
    date: "Nov 30, 2024",
    amount: 25000,
    status: "completed",
    method: "Bank Transfer",
  },
  {
    date: "Oct 31, 2024",
    amount: 20000,
    status: "completed",
    method: "Bank Transfer",
  },
  { date: "Sep 30, 2024", amount: 18000, status: "completed", method: "UPI" },
];

// Invoices
const invoices = [
  {
    id: "INV-2024-012",
    date: "Dec 15, 2024",
    client: "TechMart Solutions",
    amount: 18000,
  },
  {
    id: "INV-2024-011",
    date: "Dec 12, 2024",
    client: "InnovateCorp",
    amount: 32000,
  },
  {
    id: "INV-2024-010",
    date: "Dec 5, 2024",
    client: "Moments Photography",
    amount: 15000,
  },
];

const FreelancerEarnings = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState("this-month");
  const [showBankDetails, setShowBankDetails] = useState(false);

  const [subscriptionPlan] = useState<"Pro" | "Free">("Pro");

  // Stats
  const stats = {
    totalEarnings: 203000,
    thisMonth: 85000,
    pending: 12000,
    projectsCompleted: 24,
  };

  const availableBalance = 45000;
  const maxEarning = Math.max(...monthlyEarnings.map((m) => m.earnings));

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* SIDEBAR */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen w-64 bg-navy transition-transform duration-300 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-6 border-b border-white/10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal to-teal-light flex items-center justify-center text-white font-bold text-lg">
              C
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-white tracking-tight">
                ConnectMe
              </span>
              <span className="text-[10px] font-semibold tracking-widest uppercase -mt-1 text-teal-light">
                India
              </span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden ml-auto text-white/60 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {sidebarNavItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                  item.active
                    ? "bg-white/10 text-white"
                    : "text-white/60 hover:bg-white/5 hover:text-white",
                )}
              >
                <item.icon size={20} />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="px-2 py-0.5 text-xs font-bold bg-teal text-white rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          {/* Subscription Badge */}
          <div className="px-4 pb-2">
            <div
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg",
                subscriptionPlan === "Free" ? "bg-slate-500/20" : "bg-gold/20",
              )}
            >
              <Award
                size={16}
                className={
                  subscriptionPlan === "Free" ? "text-slate-400" : "text-gold"
                }
              />
              <span
                className={cn(
                  "text-xs font-semibold",
                  subscriptionPlan === "Free" ? "text-slate-400" : "text-gold",
                )}
              >
                {subscriptionPlan} Plan
              </span>
            </div>
          </div>

          {/* User Profile Card */}
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-royal-blue to-teal flex items-center justify-center text-white font-bold text-sm">
                AK
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  Arun Kumar
                </p>
                <p className="text-xs text-white/50">Freelancer</p>
              </div>
              <button className="text-white/50 hover:text-white transition-colors">
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* SIDEBAR OVERLAY (Mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* MAIN CONTENT */}
      <div className="lg:ml-64">
        {/* Header Bar */}
        <header className="sticky top-0 z-20 bg-white border-b border-slate-200 px-4 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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

            {/* Date Range Selector */}
            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
              {dateRanges.map((range) => (
                <button
                  key={range.value}
                  onClick={() => setSelectedDateRange(range.value)}
                  className={cn(
                    "px-3 py-2 text-sm font-medium rounded-lg transition-all",
                    selectedDateRange === range.value
                      ? "bg-white text-navy shadow-sm"
                      : "text-slate-500 hover:text-navy",
                  )}
                >
                  {range.label}
                </button>
              ))}
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
                {monthlyEarnings.map((item, idx) => (
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
                          idx === monthlyEarnings.length - 1
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
                  {categoryBreakdown.map((cat, idx) => {
                    const previousPercentages = categoryBreakdown
                      .slice(0, idx)
                      .reduce((acc, c) => acc + c.percentage, 0);
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
                {categoryBreakdown.map((cat) => (
                  <div
                    key={cat.category}
                    className="flex items-center justify-between"
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

          {/* TRANSACTIONS & WITHDRAWAL ROW */}
          <section className="grid lg:grid-cols-3 gap-6">
            {/* RECENT TRANSACTIONS (2 columns) */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
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
                    {recentTransactions.map((tx) => (
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
                            {tx.status === "completed"
                              ? "Completed"
                              : "Pending"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* WITHDRAWAL SECTION (1 column) */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h2 className="text-lg font-bold text-navy mb-6">Withdrawal</h2>

              {/* Available Balance */}
              <div className="bg-gradient-to-r from-teal to-teal-light rounded-xl p-5 text-white mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Wallet size={18} />
                  <span className="text-sm text-white/80">
                    Available Balance
                  </span>
                </div>
                <p className="text-3xl font-bold">
                  ₹{availableBalance.toLocaleString()}
                </p>
              </div>

              {/* Withdraw Button */}
              <Button className="w-full bg-navy hover:bg-navy/90 text-white mb-4">
                <Wallet size={16} className="mr-2" />
                Withdraw Funds
              </Button>

              {/* Bank Account Info */}
              <div className="bg-slate-50 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-500">Bank Account</span>
                  <button
                    onClick={() => setShowBankDetails(!showBankDetails)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    {showBankDetails ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 size={16} className="text-slate-400" />
                  <span className="text-sm font-medium text-navy">
                    {showBankDetails
                      ? "1234 5678 9012 3456"
                      : "XXXX XXXX XXXX 3456"}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  HDFC Bank - Savings
                </p>
              </div>

              {/* Withdrawal History */}
              <div className="border-t border-slate-100 pt-4">
                <h3 className="text-sm font-semibold text-navy mb-3">
                  Recent Withdrawals
                </h3>
                <div className="space-y-3">
                  {withdrawalHistory.slice(0, 2).map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <p className="text-sm font-medium text-navy">
                          ₹{item.amount.toLocaleString()}
                        </p>
                        <p className="text-xs text-slate-400">{item.date}</p>
                      </div>
                      <span className="text-xs text-success-green bg-success-green/10 px-2 py-1 rounded-full">
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* INVOICES & TAX ROW */}
          <section className="grid lg:grid-cols-2 gap-6">
            {/* INVOICES */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-navy">Invoices</h2>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-200"
                >
                  <Download size={14} className="mr-2" />
                  Download All
                </Button>
              </div>

              <div className="space-y-3">
                {invoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center">
                        <Receipt size={18} className="text-slate-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-navy">
                          {invoice.id}
                        </p>
                        <p className="text-xs text-slate-500">
                          {invoice.client} • {invoice.date}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-semibold text-navy">
                        ₹{invoice.amount.toLocaleString()}
                      </span>
                      <button className="p-2 hover:bg-white rounded-lg transition-colors text-slate-400 hover:text-teal">
                        <FileDown size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button className="w-full mt-4 text-sm text-teal font-medium hover:underline">
                View All Invoices
              </button>
            </div>

            {/* TAX INFO */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-navy">Tax Information</h2>
                <span className="text-xs text-slate-400">FY 2024-25</span>
              </div>

              {/* Annual Summary */}
              <div className="bg-slate-50 rounded-xl p-5 mb-6">
                <h3 className="text-sm font-semibold text-navy mb-4">
                  Annual Summary
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">
                      Gross Earnings
                    </p>
                    <p className="text-lg font-bold text-navy">₹2,03,000</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Platform Fees</p>
                    <p className="text-lg font-bold text-navy">₹20,300</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">TDS Deducted</p>
                    <p className="text-lg font-bold text-navy">₹2,030</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Net Earnings</p>
                    <p className="text-lg font-bold text-success-green">
                      ₹1,80,670
                    </p>
                  </div>
                </div>
              </div>

              {/* Tax Documents */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-teal/10 flex items-center justify-center">
                      <FileText size={18} className="text-teal" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-navy">Form 16A</p>
                      <p className="text-xs text-slate-500">TDS Certificate</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-teal text-teal hover:bg-teal hover:text-white"
                  >
                    <Download size={14} className="mr-1" />
                    Download
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-royal-blue/10 flex items-center justify-center">
                      <FileText size={18} className="text-royal-blue" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-navy">
                        Earnings Statement
                      </p>
                      <p className="text-xs text-slate-500">
                        Annual Summary PDF
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-royal-blue text-royal-blue hover:bg-royal-blue hover:text-white"
                  >
                    <Download size={14} className="mr-1" />
                    Download
                  </Button>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gold/10 rounded-xl flex items-start gap-3">
                <AlertCircle size={18} className="text-gold shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-navy">Tax Reminder</p>
                  <p className="text-xs text-slate-600 mt-1">
                    Remember to file your ITR before July 31, 2025. Consult a
                    tax professional for accurate filings.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default FreelancerEarnings;
