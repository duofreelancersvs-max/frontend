import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "@/components/layouts/AdminLayout";
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
  ShieldCheck,
  Star,
  FileText,
  FolderTree,
  History,
  DollarSign,
  type LucideIcon,
} from "lucide-react";
import { adminService } from "@/services";
import type { AdminStats, AdminProject, VerificationItem, AuditLogEntry } from "@/services";

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
  const numericValue = parseInt(value.replace(/[^0-9]/g, ""));

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
        // Format the number with commas
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

  return (
    <div className="admin-card admin-metric-card">
      <div className={`admin-metric-icon ${metric.iconColor}`}>
        <Icon size={24} />
      </div>
      <div className="admin-metric-number">
        <AnimatedNumber value={metric.value} />
      </div>
      <div className="admin-metric-label">{metric.label}</div>
      <div className={`admin-metric-trend ${metric.trendType}`}>
        <TrendIcon size={14} />
        <span>{metric.trend}</span>
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

    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = padding.top + (chartHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();

      const value = Math.round(maxValue - (maxValue / 5) * i);
      ctx.fillStyle = "#94A3B8";
      ctx.font = "11px Inter";
      ctx.textAlign = "right";
      ctx.fillText(`₹${(value / 1000).toFixed(0)}k`, padding.left - 10, y + 4);
    }

    const barWidth = (chartWidth / data.length) * 0.4;
    data.forEach((d, i) => {
      const x = padding.left + (chartWidth / (data.length - 1 || 1)) * i + (chartWidth / data.length - barWidth) / 2;
      const barH = (d.value / maxValue) * chartHeight;
      ctx.fillStyle = i === 0 ? "#6366F1" : "#06B6D4";
      ctx.beginPath();
      ctx.roundRect(x, padding.top + chartHeight - barH, barWidth, barH, 6);
      ctx.fill();

      ctx.fillStyle = "#94A3B8";
      ctx.font = "11px Inter";
      ctx.textAlign = "center";
      ctx.fillText(d.label, x + barWidth / 2, height - 15);
    });
  }, [monthly, yearly]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ width: "100%", height: "100%" }}
    />
  );
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

    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartHeight / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();
    }

    const labels = [
      { label: "Total", value: totalUsers, color: "#6366F1" },
      { label: "Active", value: activeUsers, color: "#06B6D4" },
    ];

    labels.forEach((d, i) => {
      const x = padding.left + gap + (barWidth + gap) * i;
      const barH = (d.value / maxValue) * chartHeight;
      ctx.fillStyle = d.color;
      ctx.beginPath();
      ctx.roundRect(x, padding.top + chartHeight - barH, barWidth, barH, 6);
      ctx.fill();

      ctx.fillStyle = "#94A3B8";
      ctx.font = "11px Inter";
      ctx.textAlign = "center";
      ctx.fillText(d.label, x + barWidth / 2, height - 15);
    });
  }, [activeUsers, totalUsers]);

  return (
    <div>
      <canvas
        ref={canvasRef}
        className="w-full"
        style={{ width: "100%", height: "240px" }}
      />
      <div className="admin-chart-legend">
        <div className="admin-legend-item">
          <div className="admin-legend-dot indigo"></div>
          <span>Total Users</span>
        </div>
        <div className="admin-legend-item">
          <div className="admin-legend-dot cyan"></div>
          <span>Active Users</span>
        </div>
      </div>
    </div>
  );
};

const CircularProgress = ({ percentage }: { percentage: number }) => {
  const [animatedPercentage, setAnimatedPercentage] = useState(0);
  const size = 160;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (animatedPercentage / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedPercentage(percentage), 100);
    return () => clearTimeout(timer);
  }, [percentage]);

  return (
    <div className="admin-circular-progress">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#334155"
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
          style={{ transition: "stroke-dashoffset 1s ease-out" }}
        />
      </svg>
      <div
        className="absolute flex flex-col items-center justify-center"
        style={{ width: size, height: size, marginTop: `-${size}px` }}
      >
        <span className="admin-circular-value">{animatedPercentage}%</span>
        <span className="admin-circular-label">Completion Rate</span>
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
    const innerRadius = 45;

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

      startAngle = endAngle;
    });
  }, [data]);

  return (
    <div className="admin-donut-chart">
      <canvas ref={canvasRef} style={{ width: "160px", height: "160px" }} />
      <div className="admin-donut-legend">
        {data.map((d) => (
          <div key={d.name} className="admin-legend-item">
            <div
              className="admin-legend-dot"
              style={{ backgroundColor: d.color }}
            ></div>
            <span>
              {d.name} ({d.value}%)
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
      return { Icon: UserPlus, color: "cyan" };
    case "project":
      return { Icon: Briefcase, color: "indigo" };
    case "verification":
      return { Icon: FileCheck, color: "amber" };
    case "payment":
      return { Icon: Wallet, color: "emerald" };
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
  const [verifications, setVerifications] = useState<VerificationItem[]>([]);
  const [activityLogs, setActivityLogs] = useState<AuditLogEntry[]>([]);
  const [categories, setCategories] = useState<{ name: string; count: number }[]>([]);
  const [completionRate, setCompletionRate] = useState(0);
  const [subscriptionRevenue, setSubscriptionRevenue] = useState(0);
  const [_loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [statsData, projectsData, verificationsData, auditData, catsData, subPayments] = await Promise.allSettled([
          adminService.getDashboardStats(),
          adminService.getAllProjects({ page: 1, limit: 5 }),
          adminService.getVerifications({ page: 1, limit: 4, status: "pending" }),
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
        if (verificationsData.status === "fulfilled") setVerifications(verificationsData.value.verifications || []);
        if (auditData.status === "fulfilled") setActivityLogs(auditData.value.logs || []);
        if (catsData.status === "fulfilled") {
          const cats = catsData.value.categories || [];
          setCategories(cats.map((c: any) => ({ name: c.name, count: (c.projectCount || 0) + (c.freelancerCount || 0) })));
        }
        if (subPayments.status === "fulfilled") {
          const pays = subPayments.value.payments || [];
          setSubscriptionRevenue(pays.reduce((sum: number, p: any) => sum + (p.amount || 0), 0));
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
    {
      id: "pending",
      label: "Pending Verifications",
      value: String(stats.pendingVerifications || 0),
      icon: AlertCircle,
      iconColor: "amber" as const,
      trend: "Requires attention",
      trendType: "warning" as const,
    },
  ] : [];

  return (
    <AdminLayout title="Dashboard" breadcrumb="Overview">
      {/* Welcome Banner */}
      <div className="admin-welcome-banner">
        <div className="admin-welcome-content">
          <h2 className="admin-welcome-title">Welcome back, Admin!</h2>
          <p className="admin-welcome-text">
            Platform is running smoothly. {stats?.pendingVerifications ?? 0} verifications pending review.
          </p>
          <div className="admin-welcome-buttons">
            <Link
              to="/admin/verifications"
              className="admin-btn admin-btn-primary"
            >
              <ShieldCheck size={18} />
              Review Queue
            </Link>
            <button className="admin-btn admin-btn-outline-cyan">
              <Send size={18} />
              Send Announcement
            </button>
          </div>
        </div>
        <div className="admin-welcome-illustration">
          <svg
            viewBox="0 0 200 140"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Abstract analytics illustration */}
            <rect
              x="20"
              y="90"
              width="20"
              height="40"
              rx="4"
              fill="#6366F1"
              fillOpacity="0.6"
            />
            <rect
              x="50"
              y="70"
              width="20"
              height="60"
              rx="4"
              fill="#6366F1"
              fillOpacity="0.8"
            />
            <rect x="80" y="50" width="20" height="80" rx="4" fill="#6366F1" />
            <rect
              x="110"
              y="60"
              width="20"
              height="70"
              rx="4"
              fill="#06B6D4"
              fillOpacity="0.8"
            />
            <rect x="140" y="40" width="20" height="90" rx="4" fill="#06B6D4" />
            <circle
              cx="150"
              cy="30"
              r="15"
              fill="#6366F1"
              fillOpacity="0.2"
              stroke="#6366F1"
              strokeWidth="2"
            />
            <path
              d="M145 30L148 33L155 26"
              stroke="#6366F1"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M30 85L90 45L150 35"
              stroke="#10B981"
              strokeWidth="2"
              strokeDasharray="4 4"
            />
          </svg>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="admin-metrics-grid">
        {metricsData.map((metric) => (
          <MetricCard key={metric.id} metric={metric} />
        ))}
      </div>

      {/* Charts Section */}
      <div className="admin-charts-grid">
        {/* Revenue Analytics */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title">Revenue Analytics</h3>
            <select className="admin-select">
              <option>Last 6 Months</option>
              <option>Last Year</option>
              <option>All Time</option>
            </select>
          </div>
          <div className="admin-chart-container">
            <RevenueChart monthly={stats?.revenue?.monthly || 0} yearly={stats?.revenue?.yearly || 0} />
          </div>
        </div>

        {/* User Growth */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title">User Growth</h3>
            <select className="admin-select">
              <option>6 Months</option>
              <option>This Year</option>
            </select>
          </div>
          <UserGrowthChart activeUsers={stats?.activeUsers || 0} totalUsers={stats?.totalUsers || 0} />
        </div>
      </div>

      {/* Secondary Charts */}
      <div className="admin-secondary-charts">
        {/* Revenue Sources */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title">Revenue Sources</h3>
          </div>
          <div className="flex flex-col items-center justify-center py-4">
            <div className="flex gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-white">
                  ₹{(subscriptionRevenue).toLocaleString("en-IN")}
                </div>
                <div className="text-sm text-[#94A3B8]">Subscriptions</div>
              </div>
              <div className="w-px bg-[#334155]"></div>
              <div>
                <div className="text-2xl font-bold text-white">
                  ₹{(stats?.revenue?.yearly || 0).toLocaleString("en-IN")}
                </div>
                <div className="text-sm text-[#94A3B8]">Total Revenue</div>
              </div>
            </div>
          </div>
        </div>

        {/* Completion Rate */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title">Project Completion</h3>
          </div>
          <CircularProgress percentage={completionRate} />
        </div>

        {/* Top Categories */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title">Top Categories</h3>
          </div>
          <DonutChart categories={categories} />
        </div>
      </div>

      {/* Data Tables */}
      <div className="admin-tables-grid">
        {/* Recent Projects */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title">Recent Projects</h3>
            <Link to="/admin/projects" className="admin-card-action">
              View All <ArrowRight size={14} className="inline ml-1" />
            </Link>
          </div>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Project</th>
                <th>Client</th>
                <th>Budget</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentProjects.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-[#94A3B8] py-8">No projects yet</td>
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
                  <tr key={project._id}>
                    <td className="font-medium">{project.title}</td>
                    <td className="text-[#94A3B8]">{project.clientName || "—"}</td>
                    <td>{budgetStr}</td>
                    <td>
                      <span className={`admin-status-badge ${mappedStatus}`}>
                        {getStatusLabel(mappedStatus)}
                      </span>
                    </td>
                    <td className="text-[#94A3B8]">
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

        {/* Pending Verifications */}
        <div className="admin-card admin-card-warning">
          <div className="admin-card-header">
            <h3 className="admin-card-title" style={{ color: "#F59E0B" }}>
              Verification Queue ({stats?.pendingVerifications ?? 0})
            </h3>
          </div>
          <div>
            {verifications.length === 0 && (
              <div className="text-center text-[#94A3B8] py-8">No pending verifications</div>
            )}
            {verifications.map((v) => {
              const name =
                v.freelancerProfile?.displayName ||
                `${v.freelancerProfile?.firstName || ""} ${v.freelancerProfile?.lastName || ""}`.trim() ||
                v.freelancerId?.fullName ||
                v.freelancerId?.email ||
                "Unknown";
              const initials = name
                .split(" ")
                .map((n: string) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);
              const docTypeMap: Record<string, string> = {
                aadhaar: "Aadhaar Verification",
                pan: "PAN Card",
                portfolio_proof: "Portfolio Review",
                certificate: "Skill Certificate",
              };
              const timeAgo = v.submittedAt
                ? getTimeAgo(new Date(v.submittedAt))
                : "";
              return (
                <div key={v._id} className="admin-verification-item">
                  <div className="admin-verification-avatar">{initials}</div>
                  <div className="admin-verification-info">
                    <div className="admin-verification-name">{name}</div>
                    <div className="admin-verification-doc">
                      {docTypeMap[v.documentType] || v.documentType}
                    </div>
                  </div>
                  <div className="admin-verification-time">{timeAgo}</div>
                  <Link
                    to="/admin/verifications"
                    className="admin-btn admin-btn-primary admin-btn-sm"
                  >
                    Review
                  </Link>
                </div>
              );
            })}
          </div>
          <div className="mt-4 pt-4 border-t border-[#334155]">
            <Link
              to="/admin/verifications"
              className="admin-btn admin-btn-amber w-full"
            >
              Process All Pending
            </Link>
          </div>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="admin-card admin-activity-feed">
        <div className="admin-card-header">
          <h3 className="admin-card-title">Recent Activity</h3>
          <Link to="/admin/audit-logs" className="admin-card-action">
            View All Activity <ArrowRight size={14} className="inline ml-1" />
          </Link>
        </div>
        <div className="admin-timeline">
          {activityLogs.length === 0 && (
            <div style={{ textAlign: "center", padding: "1.5rem", color: "var(--admin-cloud-gray)", fontSize: "0.875rem" }}>
              No recent activity
            </div>
          )}
          {activityLogs.slice(0, 8).map((log) => {
            const adminName = log.adminId?.fullName || log.adminId?.email || "System";
            const resource = log.resource?.toLowerCase() || "unknown";
            const type: ActivityType = resource === "payment" ? "payment" : resource === "project" ? "project" : resource === "verification" ? "verification" : "registration";
            const { Icon, color } = getActivityIcon(type);
            return (
              <div key={log._id} className="admin-timeline-item">
                <div className={`admin-timeline-icon ${color}`}>
                  <Icon size={10} color="white" />
                </div>
                <div className="admin-timeline-content">
                  <div className="admin-timeline-text">
                    {adminName} {log.action} {resource}{log.resourceId ? ` #${log.resourceId.slice(-6)}` : ""}
                  </div>
                  <div className="admin-timeline-time">{getTimeAgo(new Date(log.createdAt))}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="admin-metrics-grid" style={{ marginBottom: "1.5rem" }}>
        <div className="admin-card" style={{ padding: "1.25rem" }}>
          <div className="admin-card-header" style={{ marginBottom: "0.75rem" }}>
            <h3 className="admin-card-title" style={{ fontSize: "0.875rem" }}>Quick Actions</h3>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            <Link to="/admin/reviews" className="admin-btn admin-btn-outline admin-btn-sm">
              <Star size={14} /> Review Moderation
            </Link>
            <Link to="/admin/applications" className="admin-btn admin-btn-outline admin-btn-sm">
              <FileText size={14} /> Applications
            </Link>
            <Link to="/admin/categories" className="admin-btn admin-btn-outline admin-btn-sm">
              <FolderTree size={14} /> Categories
            </Link>
            <Link to="/admin/conversations" className="admin-btn admin-btn-outline admin-btn-sm">
              <MessageSquare size={14} /> Conversations
            </Link>
            <Link to="/admin/payments" className="admin-btn admin-btn-outline admin-btn-sm">
              <DollarSign size={14} /> Payments
            </Link>
            <Link to="/admin/audit-logs" className="admin-btn admin-btn-outline admin-btn-sm">
              <History size={14} /> Audit Logs
            </Link>
            <Link to="/admin/notifications" className="admin-btn admin-btn-outline admin-btn-sm">
              <Send size={14} /> Send Notification
            </Link>
          </div>
        </div>
        <div className="admin-card" style={{ padding: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", height: "100%" }}>
            <div className="admin-system-status" style={{ margin: 0 }}>
              <span className="status-indicator"></span>
              <CheckCircle size={16} />
              <span>System Health: Operational</span>
            </div>
            <button className="admin-btn admin-btn-outline admin-btn-sm" style={{ marginLeft: "auto" }}>
              <Download size={14} />
              Export Report
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
