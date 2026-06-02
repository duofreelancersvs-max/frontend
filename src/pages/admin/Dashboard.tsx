import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Wallet,
  Briefcase,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  MessageSquare,
  UserPlus,
  FileCheck,
  Send,
  Download,
  CheckCircle,
  Star,
  FileText,
  FolderTree,
  History,
  DollarSign,
  type LucideIcon,
} from "lucide-react";
import { adminService } from "@/services";
import type { AdminStats, AdminProject, AuditLogEntry } from "@/services";

// ============ DATA ============

interface MetricData {
  id: string;
  label: string;
  value: string;
  icon: LucideIcon;
  iconColor: "indigo" | "cyan" | "violet" | "amber";
  trend: string;
  trendType: "positive" | "warning" | "negative";
}

const getTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
};

type ActivityType = "registration" | "project" | "verification" | "payment";

// ============ COMPONENTS ============

const AnimatedNumber = ({
  value,
  prefix = "",
  suffix = "",
}: {
  value: string;
  prefix?: string;
  suffix?: string;
}) => {
  const [displayValue, setDisplayValue] = useState("0");
  const numericValue = parseInt(value.replace(/[^0-9]/g, "")) || 0;

  useEffect(() => {
    const duration = 1000;
    const steps = 30;
    const stepValue = numericValue / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += stepValue;
      if (current >= numericValue) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        const formatted = Math.floor(current).toLocaleString("en-IN");
        setDisplayValue(formatted);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value, numericValue]);

  return (
    <span>
      {prefix}
      {displayValue}
      {suffix}
    </span>
  );
};

const MetricCard = ({ metric }: { metric: MetricData }) => {
  const Icon = metric.icon;
  const TrendIcon =
    metric.trendType === "positive"
      ? TrendingUp
      : metric.trendType === "negative"
        ? TrendingDown
        : AlertCircle;

  const colorStyles = {
    indigo: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20 shadow-[0_0_15px_-3px_rgba(99,102,241,0.2)]",
    cyan: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20 shadow-[0_0_15px_-3px_rgba(6,182,212,0.2)]",
    violet: "bg-violet-500/10 text-violet-400 border-violet-500/20 shadow-[0_0_15px_-3px_rgba(139,92,246,0.2)]",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_15px_-3px_rgba(245,158,11,0.2)]",
  };

  return (
    <div className="bg-[#18181b] border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-colors relative overflow-hidden group">
      {/* Glow effect */}
      <div className={`absolute -top-10 -right-10 w-32 h-32 blur-3xl opacity-20 rounded-full transition-opacity group-hover:opacity-40 ${metric.iconColor === 'indigo' ? 'bg-indigo-500' : metric.iconColor === 'cyan' ? 'bg-cyan-500' : 'bg-violet-500'}`}></div>
      
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${colorStyles[metric.iconColor]}`}>
          <Icon size={22} />
        </div>
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold
          ${metric.trendType === "positive" ? "bg-emerald-500/10 text-emerald-400" :
            metric.trendType === "negative" ? "bg-rose-500/10 text-rose-400" :
              "bg-amber-500/10 text-amber-400"}`}>
          <TrendIcon size={12} />
          <span>{metric.trend.split(" ")[0]}</span>
        </div>
      </div>
      
      <div className="relative z-10">
        <h3 className="text-slate-400 text-sm font-medium mb-1">{metric.label}</h3>
        <div className="text-3xl font-bold text-white tracking-tight">
          <AnimatedNumber value={metric.value} />
        </div>
        <div className="text-slate-500 text-xs mt-2">{metric.trend}</div>
      </div>
    </div>
  );
};

const RevenueChart = ({ monthly, yearly }: { monthly: number; yearly: number }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const data = [
    { label: "Monthly", value: monthly || 1 },
    { label: "Yearly", value: yearly || 1 },
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const padding = { top: 20, right: 20, bottom: 40, left: 60 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    ctx.clearRect(0, 0, width, height);

    const maxValue = Math.max(...data.map((d) => d.value)) * 1.1;

    ctx.strokeStyle = "rgba(255,255,255,0.05)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = padding.top + (chartHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();

      const value = Math.round(maxValue - (maxValue / 5) * i);
      ctx.fillStyle = "#64748b";
      ctx.font = "11px Inter";
      ctx.textAlign = "right";
      ctx.fillText(`₹${(value / 1000).toFixed(0)}k`, padding.left - 10, y + 4);
    }

    const barWidth = (chartWidth / data.length) * 0.4;
    data.forEach((d, i) => {
      const x = padding.left + (chartWidth / (data.length - 1 || 1)) * i + (chartWidth / data.length - barWidth) / 2;
      const barH = (d.value / maxValue) * chartHeight;
      
      const gradient = ctx.createLinearGradient(0, padding.top + chartHeight - barH, 0, padding.top + chartHeight);
      if (i === 0) {
        gradient.addColorStop(0, "#6366F1");
        gradient.addColorStop(1, "rgba(99,102,241,0.2)");
      } else {
        gradient.addColorStop(0, "#06B6D4");
        gradient.addColorStop(1, "rgba(6,182,212,0.2)");
      }
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.roundRect(x, padding.top + chartHeight - barH, barWidth, barH, 6);
      ctx.fill();

      ctx.fillStyle = "#94A3B8";
      ctx.font = "12px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(d.label, x + barWidth / 2, height - 15);
    });
  }, [monthly, yearly]);

  return <canvas ref={canvasRef} className="w-full h-full" style={{ width: "100%", height: "100%" }} />;
};

const UserGrowthChart = ({ activeUsers, totalUsers }: { activeUsers: number; totalUsers: number }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const padding = { top: 20, right: 20, bottom: 40, left: 50 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    ctx.clearRect(0, 0, width, height);

    const maxValue = Math.max(totalUsers, activeUsers) * 1.1;
    const barWidth = chartWidth * 0.2;
    const gap = (chartWidth - 2 * barWidth) / 3;

    ctx.strokeStyle = "rgba(255,255,255,0.05)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartHeight / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();
    }

    const labels = [
      { label: "Total", value: totalUsers, color1: "#8B5CF6", color2: "rgba(139,92,246,0.2)" },
      { label: "Active", value: activeUsers, color1: "#10B981", color2: "rgba(16,185,129,0.2)" },
    ];

    labels.forEach((d, i) => {
      const x = padding.left + gap + (barWidth + gap) * i;
      const barH = (d.value / maxValue) * chartHeight;
      
      const gradient = ctx.createLinearGradient(0, padding.top + chartHeight - barH, 0, padding.top + chartHeight);
      gradient.addColorStop(0, d.color1);
      gradient.addColorStop(1, d.color2);

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.roundRect(x, padding.top + chartHeight - barH, barWidth, barH, 6);
      ctx.fill();

      ctx.fillStyle = "#94A3B8";
      ctx.font = "12px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(d.label, x + barWidth / 2, height - 15);
    });
  }, [activeUsers, totalUsers]);

  return (
    <div>
      <canvas ref={canvasRef} className="w-full" style={{ width: "100%", height: "240px" }} />
      <div className="flex justify-center gap-6 mt-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-violet-500"></div>
          <span className="text-sm text-slate-400">Total Users</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
          <span className="text-sm text-slate-400">Active Users</span>
        </div>
      </div>
    </div>
  );
};

const CircularProgress = ({ percentage }: { percentage: number }) => {
  const [animatedPercentage, setAnimatedPercentage] = useState(0);
  const size = 160;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (animatedPercentage / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedPercentage(percentage), 100);
    return () => clearTimeout(timer);
  }, [percentage]);

  return (
    <div className="relative flex justify-center items-center py-6">
      <svg width={size} height={size} className="transform -rotate-90 filter drop-shadow-[0_0_8px_rgba(99,102,241,0.4)]">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#6366F1"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)" }}
        />
      </svg>
      <div
        className="absolute flex flex-col items-center justify-center"
        style={{ width: size, height: size }}
      >
        <span className="text-3xl font-bold text-white tracking-tight">{animatedPercentage}%</span>
        <span className="text-xs font-medium text-slate-400 uppercase tracking-widest mt-1">Rate</span>
      </div>
    </div>
  );
};

const DonutChart = ({ categories }: { categories: { name: string; count: number }[] }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const colors = ["#6366F1", "#06B6D4", "#8B5CF6", "#10B981", "#F59E0B", "#EF4444"];
  const total = categories.reduce((a, c) => a + c.count, 0) || 1;
  const data = categories.length > 0
    ? categories.slice(0, 6).map((c, i) => ({ name: c.name, value: Math.round((c.count / total) * 100), color: colors[i % colors.length] }))
    : [{ name: "No Data", value: 100, color: "#334155" }];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const size = 160;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const centerX = size / 2;
    const centerY = size / 2;
    const outerRadius = 70;
    const innerRadius = 50;

    let startAngle = -Math.PI / 2;
    const grandTotal = data.reduce((acc, d) => acc + d.value, 0) || 1;

    data.forEach((d) => {
      const sliceAngle = (d.value / grandTotal) * Math.PI * 2;
      const endAngle = startAngle + sliceAngle;

      ctx.beginPath();
      ctx.arc(centerX, centerY, outerRadius, startAngle, endAngle);
      ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
      ctx.closePath();
      ctx.fillStyle = d.color;
      ctx.fill();

      // subtle separator line
      ctx.strokeStyle = "#18181b";
      ctx.lineWidth = 2;
      ctx.stroke();

      startAngle = endAngle;
    });
  }, [data]);

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 py-4">
      <div className="relative">
        <canvas ref={canvasRef} style={{ width: "160px", height: "160px" }} className="filter drop-shadow-[0_0_10px_rgba(0,0,0,0.5)]" />
      </div>
      <div className="flex flex-col gap-2.5">
        {data.map((d) => (
          <div key={d.name} className="flex items-center gap-2.5">
            <div
              className="w-3 h-3 rounded-full shadow-md"
              style={{ backgroundColor: d.color, boxShadow: `0 0 8px ${d.color}80` }}
            ></div>
            <span className="text-sm text-slate-300 font-medium">
              {d.name} <span className="text-slate-500 ml-1">({d.value}%)</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const getActivityIcon = (type: ActivityType) => {
  switch (type) {
    case "registration":
      return { Icon: UserPlus, color: "text-cyan-400 bg-cyan-400/10 shadow-[0_0_10px_rgba(6,182,212,0.2)]" };
    case "project":
      return { Icon: Briefcase, color: "text-indigo-400 bg-indigo-400/10 shadow-[0_0_10px_rgba(99,102,241,0.2)]" };
    case "verification":
      return { Icon: FileCheck, color: "text-amber-400 bg-amber-400/10 shadow-[0_0_10px_rgba(245,158,11,0.2)]" };
    case "payment":
      return { Icon: Wallet, color: "text-emerald-400 bg-emerald-400/10 shadow-[0_0_10px_rgba(16,185,129,0.2)]" };
  }
};

const getStatusLabel = (status: "open" | "in-progress" | "completed") => {
  switch (status) {
    case "open":
      return "Open";
    case "in-progress":
      return "In Progress";
    case "completed":
      return "Completed";
  }
};

// ============ MAIN COMPONENT ============

const AdminDashboard = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentProjects, setRecentProjects] = useState<AdminProject[]>([]);
  const [activityLogs, setActivityLogs] = useState<AuditLogEntry[]>([]);
  const [categories, setCategories] = useState<{ name: string; count: number }[]>([]);
  const [completionRate, setCompletionRate] = useState(0);
  const [subscriptionRevenue, setSubscriptionRevenue] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [statsData, projectsData, auditData, catsData, subPayments] = await Promise.allSettled([
          adminService.getDashboardStats(),
          adminService.getAllProjects({ page: 1, limit: 5 }),
          adminService.getAuditLogs({ page: 1, limit: 8 }),
          adminService.getAllCategories({ page: 1, limit: 10 }),
          adminService.getAllPayments({ page: 1, limit: 100, type: "subscription" }),
        ]);
        if (statsData.status === "fulfilled") setStats(statsData.value);
        if (projectsData.status === "fulfilled") {
          const proj = projectsData.value.projects || [];
          setRecentProjects(proj);
          const completedCount = proj.filter((p: AdminProject) => p.status === "completed").length;
          const totalCount = proj.length || 1;
          setCompletionRate(Math.round((completedCount / totalCount) * 100));
        }

        if (auditData.status === "fulfilled") setActivityLogs(auditData.value.logs || []);
        if (catsData.status === "fulfilled") {
          const cats = catsData.value.categories || [];
          setCategories(cats.map((c: any) => ({ name: c.name, count: (c.projectCount || 0) + (c.freelancerCount || 0) })));
        }
        if (subPayments.status === "fulfilled") {
          const payments = subPayments.value.payments || [];
          const totalSubRevenue = payments
            .filter((p: any) => p.status === "captured")
            .reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
          setSubscriptionRevenue(totalSubRevenue);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const metricsData = stats ? [
    {
      id: "users",
      label: "Total Users",
      value: String(stats.totalUsers || 0),
      icon: Users,
      iconColor: "indigo" as const,
      trend: "+12% this month",
      trendType: "positive" as const,
    },
    {
      id: "revenue",
      label: "Monthly Revenue",
      value: `₹${(stats.revenue?.monthly || 0).toLocaleString()}`,
      icon: Wallet,
      iconColor: "cyan" as const,
      trend: "+8% from last month",
      trendType: "positive" as const,
    },
    {
      id: "projects",
      label: "Active Projects",
      value: String(stats.totalProjects || 0),
      icon: Briefcase,
      iconColor: "violet" as const,
      trend: "+23 new this week",
      trendType: "positive" as const,
    },
  ] : [];

  if (loading && !stats) {
    return (
      <div className="flex h-[80vh] items-center justify-center text-slate-400">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-900/40 via-indigo-800/20 to-transparent border border-indigo-500/20 rounded-3xl p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-8 backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
        <div className="relative z-10 max-w-2xl space-y-4">
          <h2 className="text-3xl font-bold text-white tracking-tight">Welcome back, Super Admin!</h2>
          <p className="text-indigo-200 text-lg">
            Platform is running smoothly. Revenue is up by <span className="text-emerald-400 font-semibold">8%</span> this month.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              to="/admin/users"
              className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-medium transition-colors flex items-center gap-2 shadow-lg shadow-indigo-500/20"
            >
              <Users size={18} />
              Manage Users
            </Link>
            <button className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-medium transition-colors flex items-center gap-2">
              <Send size={18} />
              Send Announcement
            </button>
          </div>
        </div>
        <div className="relative z-10 hidden md:block">
          <div className="w-48 h-48 relative">
            <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-2xl animate-pulse"></div>
            <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-2xl">
              <rect x="40" y="100" width="24" height="60" rx="6" fill="url(#paint0_linear)" />
              <rect x="88" y="60" width="24" height="100" rx="6" fill="url(#paint1_linear)" />
              <rect x="136" y="20" width="24" height="140" rx="6" fill="url(#paint2_linear)" />
              <circle cx="148" cy="20" r="8" fill="#10B981" />
              <circle cx="148" cy="20" r="16" fill="#10B981" fillOpacity="0.2" className="animate-ping" style={{ transformOrigin: '148px 20px' }} />
              <path d="M52 100L100 60L148 20" stroke="white" strokeWidth="3" strokeLinecap="round" strokeDasharray="6 6" strokeOpacity="0.5" />
              <defs>
                <linearGradient id="paint0_linear" x1="52" y1="100" x2="52" y2="160" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#818CF8" />
                  <stop offset="1" stopColor="#4F46E5" />
                </linearGradient>
                <linearGradient id="paint1_linear" x1="100" y1="60" x2="100" y2="160" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#60A5FA" />
                  <stop offset="1" stopColor="#2563EB" />
                </linearGradient>
                <linearGradient id="paint2_linear" x1="148" y1="20" x2="148" y2="160" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#34D399" />
                  <stop offset="1" stopColor="#059669" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {metricsData.map((metric) => (
          <MetricCard key={metric.id} metric={metric} />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Analytics */}
        <div className="bg-[#18181b] border border-white/5 rounded-3xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-white">Revenue Analytics</h3>
            <select className="bg-[#09090b] border border-white/10 text-slate-300 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500">
              <option>Last 6 Months</option>
              <option>Last Year</option>
              <option>All Time</option>
            </select>
          </div>
          <div className="h-64">
            <RevenueChart monthly={stats?.revenue?.monthly || 0} yearly={stats?.revenue?.yearly || 0} />
          </div>
        </div>

        {/* User Growth */}
        <div className="bg-[#18181b] border border-white/5 rounded-3xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-white">User Growth</h3>
            <select className="bg-[#09090b] border border-white/10 text-slate-300 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500">
              <option>6 Months</option>
              <option>This Year</option>
            </select>
          </div>
          <div className="h-64">
            <UserGrowthChart activeUsers={stats?.activeUsers || 0} totalUsers={stats?.totalUsers || 0} />
          </div>
        </div>
      </div>

      {/* Secondary Charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Revenue Sources */}
        <div className="bg-[#18181b] border border-white/5 rounded-3xl p-6 flex flex-col">
          <h3 className="text-lg font-bold text-white mb-6">Revenue Sources</h3>
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="grid grid-cols-2 gap-8 w-full">
              <div className="text-center p-4 bg-white/[0.02] rounded-2xl border border-white/5">
                <div className="text-2xl font-bold text-white mb-1">
                  ₹{(subscriptionRevenue).toLocaleString("en-IN")}
                </div>
                <div className="text-sm font-medium text-indigo-400">Subscriptions</div>
              </div>
              <div className="text-center p-4 bg-white/[0.02] rounded-2xl border border-white/5">
                <div className="text-2xl font-bold text-white mb-1">
                  ₹{(stats?.revenue?.yearly || 0).toLocaleString("en-IN")}
                </div>
                <div className="text-sm font-medium text-emerald-400">Total Revenue</div>
              </div>
            </div>
            <div className="mt-8 text-center text-sm text-slate-500 max-w-[200px]">
              Subscription revenue makes up {Math.round((subscriptionRevenue / (stats?.revenue?.yearly || 1)) * 100)}% of total revenue.
            </div>
          </div>
        </div>

        {/* Completion Rate */}
        <div className="bg-[#18181b] border border-white/5 rounded-3xl p-6">
          <h3 className="text-lg font-bold text-white mb-2">Project Completion</h3>
          <CircularProgress percentage={completionRate} />
        </div>

        {/* Top Categories */}
        <div className="bg-[#18181b] border border-white/5 rounded-3xl p-6">
          <h3 className="text-lg font-bold text-white mb-2">Top Categories</h3>
          <DonutChart categories={categories} />
        </div>
      </div>

      {/* Bottom Grid: Tables and Feed */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Projects Table */}
        <div className="xl:col-span-2 bg-[#18181b] border border-white/5 rounded-3xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-white">Recent Projects</h3>
            <Link to="/admin/projects" className="text-sm text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 transition-colors">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-slate-400 text-sm">
                  <th className="pb-4 font-medium pl-4">Project</th>
                  <th className="pb-4 font-medium">Client</th>
                  <th className="pb-4 font-medium">Budget</th>
                  <th className="pb-4 font-medium">Status</th>
                  <th className="pb-4 font-medium pr-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentProjects.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center text-slate-500 py-8">No projects yet</td>
                  </tr>
                )}
                {recentProjects.map((project) => {
                  const statusMap: Record<string, "open" | "in-progress" | "completed"> = {
                    open: "open",
                    in_progress: "in-progress",
                    completed: "completed",
                  };
                  const mappedStatus = statusMap[project.status] || "open";
                  const budgetStr = project.budget?.maxAmount
                    ? `₹${project.budget.maxAmount.toLocaleString("en-IN")}`
                    : "—";
                  
                  return (
                    <tr key={project._id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                      <td className="py-4 pl-4">
                        <div className="font-semibold text-white group-hover:text-indigo-400 transition-colors">{project.title}</div>
                      </td>
                      <td className="py-4 text-slate-300">{project.clientName || "—"}</td>
                      <td className="py-4 font-medium text-slate-300">{budgetStr}</td>
                      <td className="py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          mappedStatus === 'open' ? 'bg-indigo-500/10 text-indigo-400' :
                          mappedStatus === 'in-progress' ? 'bg-amber-500/10 text-amber-400' :
                          'bg-emerald-500/10 text-emerald-400'
                        }`}>
                          {getStatusLabel(mappedStatus)}
                        </span>
                      </td>
                      <td className="py-4 text-slate-400 pr-4">
                        {new Date(project.createdAt).toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-[#18181b] border border-white/5 rounded-3xl p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-white">Recent Activity</h3>
            <Link to="/admin/audit-logs" className="text-sm text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 transition-colors">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="flex-1 relative">
            <div className="absolute left-[19px] top-4 bottom-4 w-px bg-white/5"></div>
            <div className="space-y-6">
              {activityLogs.length === 0 && (
                <div className="text-center text-slate-500 py-8">No recent activity</div>
              )}
              {activityLogs.slice(0, 8).map((log) => {
                const adminName = log.adminId?.fullName || log.adminId?.email || "System";
                const resource = log.resource?.toLowerCase() || "unknown";
                const type: ActivityType = resource === "payment" ? "payment" : resource === "project" ? "project" : resource === "verification" ? "verification" : "registration";
                const { Icon, color } = getActivityIcon(type);
                
                return (
                  <div key={log._id} className="relative flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center relative z-10 bg-[#18181b] border-4 border-[#18181b] ${color.split(' ')[1]} ${color.split(' ')[0]}`}>
                      <Icon size={14} className="currentColor" />
                    </div>
                    <div className="pt-1.5 flex-1 min-w-0">
                      <div className="text-sm text-slate-300 truncate">
                        <span className="font-semibold text-white">{adminName}</span> {log.action} <span className="text-indigo-300">{resource}</span>
                        {log.resourceId ? ` #${log.resourceId.slice(-6)}` : ""}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">{getTimeAgo(new Date(log.createdAt))}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Footer */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 bg-[#18181b] border border-white/5 rounded-3xl p-6">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Quick Actions</h3>
          <div className="flex flex-wrap gap-3">
            {[
              { path: '/admin/reviews', icon: Star, label: 'Review Moderation' },
              { path: '/admin/applications', icon: FileText, label: 'Applications' },
              { path: '/admin/categories', icon: FolderTree, label: 'Categories' },
              { path: '/admin/conversations', icon: MessageSquare, label: 'Conversations' },
              { path: '/admin/payments', icon: DollarSign, label: 'Payments' },
              { path: '/admin/audit-logs', icon: History, label: 'Audit Logs' },
            ].map((action, i) => (
              <Link 
                key={i}
                to={action.path} 
                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-sm font-medium text-slate-300 hover:text-white transition-all hover:scale-[1.02]"
              >
                <action.icon size={16} className="text-indigo-400" />
                {action.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="bg-gradient-to-br from-emerald-900/20 to-[#18181b] border border-emerald-500/20 rounded-3xl p-6 flex flex-col justify-center relative overflow-hidden group cursor-pointer hover:border-emerald-500/40 transition-colors">
          <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-emerald-500/20 blur-3xl rounded-full group-hover:bg-emerald-500/30 transition-colors"></div>
          <div className="flex items-center gap-3 relative z-10 mb-4">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle size={20} className="text-emerald-400" />
            </div>
            <div>
              <div className="text-white font-bold">System Health</div>
              <div className="text-emerald-400 text-sm font-medium">100% Operational</div>
            </div>
          </div>
          <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium text-white transition-colors relative z-10">
            <Download size={16} />
            Export System Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
