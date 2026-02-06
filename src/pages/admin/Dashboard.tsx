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
  DollarSign,
  Send,
  Download,
  CheckCircle,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

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

const metricsData: MetricData[] = [
  {
    id: "users",
    label: "Total Users",
    value: "2,840",
    icon: Users,
    iconColor: "indigo",
    trend: "+12% this month",
    trendType: "positive",
  },
  {
    id: "revenue",
    label: "Monthly Revenue",
    value: "₹1,85,000",
    icon: Wallet,
    iconColor: "cyan",
    trend: "+8% from last month",
    trendType: "positive",
  },
  {
    id: "projects",
    label: "Active Projects",
    value: "156",
    icon: Briefcase,
    iconColor: "violet",
    trend: "+23 new this week",
    trendType: "positive",
  },
  {
    id: "pending",
    label: "Pending Actions",
    value: "28",
    icon: AlertCircle,
    iconColor: "amber",
    trend: "Requires attention",
    trendType: "warning",
  },
];

interface RecentProject {
  id: string;
  name: string;
  client: string;
  budget: string;
  status: "open" | "in-progress" | "completed";
  date: string;
}

const recentProjects: RecentProject[] = [
  {
    id: "1",
    name: "Wedding Video Edit",
    client: "Rahul S.",
    budget: "₹25,000",
    status: "open",
    date: "Feb 4",
  },
  {
    id: "2",
    name: "VFX for Short Film",
    client: "Priya M.",
    budget: "₹45,000",
    status: "in-progress",
    date: "Feb 3",
  },
  {
    id: "3",
    name: "Youtube Intro Motion",
    client: "Amit K.",
    budget: "₹8,000",
    status: "completed",
    date: "Feb 2",
  },
  {
    id: "4",
    name: "3D Product Animation",
    client: "Tech Solutions",
    budget: "₹75,000",
    status: "in-progress",
    date: "Feb 1",
  },
  {
    id: "5",
    name: "Color Grading Package",
    client: "Filmworks",
    budget: "₹18,000",
    status: "open",
    date: "Jan 31",
  },
];

interface Verification {
  id: string;
  name: string;
  initials: string;
  docType: string;
  time: string;
}

const verifications: Verification[] = [
  {
    id: "1",
    name: "Vikram Patel",
    initials: "VP",
    docType: "Portfolio Review",
    time: "2h ago",
  },
  {
    id: "2",
    name: "Sneha Reddy",
    initials: "SR",
    docType: "ID Verification",
    time: "3h ago",
  },
  {
    id: "3",
    name: "Arjun Singh",
    initials: "AS",
    docType: "Skill Certificate",
    time: "5h ago",
  },
  {
    id: "4",
    name: "Megha Sharma",
    initials: "MS",
    docType: "Business License",
    time: "6h ago",
  },
];

interface ActivityItem {
  id: string;
  type: "registration" | "project" | "verification" | "payment";
  text: string;
  time: string;
}

const activityFeed: ActivityItem[] = [
  {
    id: "1",
    type: "registration",
    text: "New freelancer Akash Kumar joined the platform",
    time: "5 min ago",
  },
  {
    id: "2",
    type: "project",
    text: 'Project "Corporate Video Edits" posted by TechCorp',
    time: "15 min ago",
  },
  {
    id: "3",
    type: "verification",
    text: "Sneha Reddy submitted ID verification documents",
    time: "1 hour ago",
  },
  {
    id: "4",
    type: "payment",
    text: "Payment of ₹45,000 received from Priya M.",
    time: "2 hours ago",
  },
  {
    id: "5",
    type: "project",
    text: 'Project "Animation Reel" marked as completed',
    time: "3 hours ago",
  },
];

// Revenue data for chart
const revenueData = [
  { month: "Sep", value: 125000 },
  { month: "Oct", value: 148000 },
  { month: "Nov", value: 162000 },
  { month: "Dec", value: 155000 },
  { month: "Jan", value: 172000 },
  { month: "Feb", value: 185000 },
];

// User growth data
const userGrowthData = [
  { month: "Sep", newUsers: 180, activeUsers: 420 },
  { month: "Oct", newUsers: 210, activeUsers: 480 },
  { month: "Nov", newUsers: 245, activeUsers: 510 },
  { month: "Dec", newUsers: 198, activeUsers: 545 },
  { month: "Jan", newUsers: 280, activeUsers: 580 },
  { month: "Feb", newUsers: 310, activeUsers: 620 },
];

// Category data for donut chart
const categoryData = [
  { name: "Video Editing", value: 35, color: "#6366F1" },
  { name: "VFX", value: 28, color: "#06B6D4" },
  { name: "3D Design", value: 22, color: "#8B5CF6" },
  { name: "Color Grading", value: 15, color: "#10B981" },
];

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

const RevenueChart = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // High DPI support
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

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Find max value
    const maxValue = Math.max(...revenueData.map((d) => d.value)) * 1.1;

    // Draw grid lines
    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = padding.top + (chartHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();

      // Y-axis labels
      const value = Math.round(maxValue - (maxValue / 5) * i);
      ctx.fillStyle = "#94A3B8";
      ctx.font = "11px Inter";
      ctx.textAlign = "right";
      ctx.fillText(`₹${(value / 1000).toFixed(0)}k`, padding.left - 10, y + 4);
    }

    // Draw area chart
    const points: { x: number; y: number }[] = [];
    revenueData.forEach((d, i) => {
      const x = padding.left + (chartWidth / (revenueData.length - 1)) * i;
      const y = padding.top + chartHeight - (d.value / maxValue) * chartHeight;
      points.push({ x, y });
    });

    // Fill gradient
    const gradient = ctx.createLinearGradient(
      0,
      padding.top,
      0,
      height - padding.bottom,
    );
    gradient.addColorStop(0, "rgba(99, 102, 241, 0.3)");
    gradient.addColorStop(1, "rgba(99, 102, 241, 0.02)");

    ctx.beginPath();
    ctx.moveTo(points[0].x, height - padding.bottom);
    points.forEach((p) => ctx.lineTo(p.x, p.y));
    ctx.lineTo(points[points.length - 1].x, height - padding.bottom);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw line
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.forEach((p) => ctx.lineTo(p.x, p.y));
    ctx.strokeStyle = "#6366F1";
    ctx.lineWidth = 3;
    ctx.lineJoin = "round";
    ctx.stroke();

    // Draw points
    points.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = "#6366F1";
      ctx.fill();
      ctx.strokeStyle = "#020617";
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // X-axis labels
    revenueData.forEach((d, i) => {
      const x = padding.left + (chartWidth / (revenueData.length - 1)) * i;
      ctx.fillStyle = "#94A3B8";
      ctx.font = "11px Inter";
      ctx.textAlign = "center";
      ctx.fillText(d.month, x, height - 15);
    });
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ width: "100%", height: "100%" }}
    />
  );
};

const UserGrowthChart = () => {
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

    const maxValue =
      Math.max(...userGrowthData.flatMap((d) => [d.newUsers, d.activeUsers])) *
      1.1;
    const barWidth = (chartWidth / userGrowthData.length) * 0.35;
    const barGap = barWidth * 0.4;

    // Grid lines
    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartHeight / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();
    }

    // Draw bars
    userGrowthData.forEach((d, i) => {
      const groupX =
        padding.left +
        (chartWidth / userGrowthData.length) * i +
        chartWidth / userGrowthData.length / 2;

      // New users bar (indigo)
      const newHeight = (d.newUsers / maxValue) * chartHeight;
      ctx.fillStyle = "#6366F1";
      ctx.beginPath();
      ctx.roundRect(
        groupX - barWidth - barGap / 2,
        padding.top + chartHeight - newHeight,
        barWidth,
        newHeight,
        4,
      );
      ctx.fill();

      // Active users bar (cyan)
      const activeHeight = (d.activeUsers / maxValue) * chartHeight;
      ctx.fillStyle = "#06B6D4";
      ctx.beginPath();
      ctx.roundRect(
        groupX + barGap / 2,
        padding.top + chartHeight - activeHeight,
        barWidth,
        activeHeight,
        4,
      );
      ctx.fill();

      // X-axis labels
      ctx.fillStyle = "#94A3B8";
      ctx.font = "11px Inter";
      ctx.textAlign = "center";
      ctx.fillText(d.month, groupX, height - 15);
    });
  }, []);

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
          <span>New Users</span>
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

const DonutChart = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
    const total = categoryData.reduce((acc, d) => acc + d.value, 0);

    categoryData.forEach((d) => {
      const sliceAngle = (d.value / total) * Math.PI * 2;
      const endAngle = startAngle + sliceAngle;

      ctx.beginPath();
      ctx.arc(centerX, centerY, outerRadius, startAngle, endAngle);
      ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
      ctx.closePath();
      ctx.fillStyle = d.color;
      ctx.fill();

      startAngle = endAngle;
    });
  }, []);

  return (
    <div className="admin-donut-chart">
      <canvas ref={canvasRef} style={{ width: "160px", height: "160px" }} />
      <div className="admin-donut-legend">
        {categoryData.map((d) => (
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

const getActivityIcon = (type: ActivityItem["type"]) => {
  switch (type) {
    case "registration":
      return { Icon: UserPlus, color: "cyan" };
    case "project":
      return { Icon: Briefcase, color: "indigo" };
    case "verification":
      return { Icon: FileCheck, color: "amber" };
    case "payment":
      return { Icon: DollarSign, color: "emerald" };
  }
};

const getStatusLabel = (status: RecentProject["status"]) => {
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
  return (
    <AdminLayout title="Dashboard" breadcrumb="Overview">
      {/* Welcome Banner */}
      <div className="admin-welcome-banner">
        <div className="admin-welcome-content">
          <h2 className="admin-welcome-title">Welcome back, Admin!</h2>
          <p className="admin-welcome-text">
            Platform is running smoothly. 15 verifications pending review.
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
            <RevenueChart />
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
          <UserGrowthChart />
        </div>
      </div>

      {/* Secondary Charts */}
      <div className="admin-secondary-charts">
        {/* Placeholder for Left Chart */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title">Revenue Sources</h3>
          </div>
          <div className="flex flex-col items-center justify-center py-4">
            <div className="flex gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-white">₹1.2L</div>
                <div className="text-sm text-[#94A3B8]">Subscriptions</div>
              </div>
              <div className="w-px bg-[#334155]"></div>
              <div>
                <div className="text-2xl font-bold text-white">₹65K</div>
                <div className="text-sm text-[#94A3B8]">Commissions</div>
              </div>
            </div>
          </div>
        </div>

        {/* Completion Rate */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title">Project Completion</h3>
          </div>
          <CircularProgress percentage={87} />
        </div>

        {/* Top Categories */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title">Top Categories</h3>
          </div>
          <DonutChart />
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
              {recentProjects.map((project) => (
                <tr key={project.id}>
                  <td className="font-medium">{project.name}</td>
                  <td className="text-[#94A3B8]">{project.client}</td>
                  <td>{project.budget}</td>
                  <td>
                    <span className={`admin-status-badge ${project.status}`}>
                      {getStatusLabel(project.status)}
                    </span>
                  </td>
                  <td className="text-[#94A3B8]">{project.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pending Verifications */}
        <div className="admin-card admin-card-warning">
          <div className="admin-card-header">
            <h3 className="admin-card-title" style={{ color: "#F59E0B" }}>
              Verification Queue (15)
            </h3>
          </div>
          <div>
            {verifications.map((v) => (
              <div key={v.id} className="admin-verification-item">
                <div className="admin-verification-avatar">{v.initials}</div>
                <div className="admin-verification-info">
                  <div className="admin-verification-name">{v.name}</div>
                  <div className="admin-verification-doc">{v.docType}</div>
                </div>
                <div className="admin-verification-time">{v.time}</div>
                <button className="admin-btn admin-btn-primary admin-btn-sm">
                  Review
                </button>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-[#334155]">
            <button className="admin-btn admin-btn-amber w-full">
              Process All Pending
            </button>
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
          {activityFeed.map((activity) => {
            const { Icon, color } = getActivityIcon(activity.type);
            return (
              <div key={activity.id} className="admin-timeline-item">
                <div className={`admin-timeline-icon ${color}`}>
                  <Icon size={10} color="white" />
                </div>
                <div className="admin-timeline-content">
                  <div className="admin-timeline-text">{activity.text}</div>
                  <div className="admin-timeline-time">{activity.time}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="admin-quick-actions">
        <button className="admin-btn admin-btn-primary">
          <MessageSquare size={16} />
          Send Push Notification
        </button>
        <button className="admin-btn admin-btn-outline">
          <Download size={16} />
          Export Report
        </button>
        <div className="admin-quick-actions-spacer"></div>
        <div className="admin-system-status">
          <span className="status-indicator"></span>
          <CheckCircle size={16} />
          <span>System Health: Operational</span>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
