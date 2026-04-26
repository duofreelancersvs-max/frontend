import { useState } from "react";
import AdminLayout from "@/components/layouts/AdminLayout";
import {
  Plus,
  Crown,
  Check,
  X,
  Edit3,
  BarChart3,
  Users,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Wallet,
  Calendar,
  Download,
  Filter,
  ChevronDown,
  Eye,
  RefreshCw,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Shield,
  Star,
  Settings,
  PieChart,
  Activity,
  type LucideIcon,
} from "lucide-react";

// ============ TYPES ============

interface Plan {
  id: string;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  yearlyDiscount: number;
  subscribers: number;
  mrr: number;
  features: { name: string; included: boolean }[];
  badge?: string;
  badgeColor?: "indigo" | "gold" | "emerald";
  isPopular?: boolean;
  conversionRate?: string;
  color: "gray" | "indigo" | "gold";
}

interface Transaction {
  id: string;
  transactionId: string;
  freelancerName: string;
  freelancerEmail: string;
  plan: string;
  amount: number;
  date: string;
  status: "successful" | "failed" | "refunded";
  paymentMethod: "UPI" | "Card" | "Netbanking";
}

type TabType = "plans" | "transactions" | "analytics" | "settings";

// ============ MOCK DATA ============

const plans: Plan[] = [
  {
    id: "1",
    name: "Free",
    monthlyPrice: 0,
    yearlyPrice: 0,
    yearlyDiscount: 0,
    subscribers: 200,
    mrr: 0,
    color: "gray",
    features: [
      { name: "Basic profile", included: true },
      { name: "5 portfolio items", included: true },
      { name: "10 applications/month", included: true },
      { name: "Standard search visibility", included: false },
      { name: "Priority support", included: false },
      { name: "Verified badge", included: false },
    ],
  },
  {
    id: "2",
    name: "Pro",
    monthlyPrice: 499,
    yearlyPrice: 4999,
    yearlyDiscount: 17,
    subscribers: 250,
    mrr: 124750,
    color: "indigo",
    badge: "Most Popular",
    badgeColor: "indigo",
    isPopular: true,
    conversionRate: "12% from Free",
    features: [
      { name: "Enhanced profile", included: true },
      { name: "25 portfolio items", included: true },
      { name: "Unlimited applications", included: true },
      { name: "Featured in search", included: true },
      { name: "Pro badge", included: true },
      { name: "Priority support", included: false },
    ],
  },
  {
    id: "3",
    name: "Premium",
    monthlyPrice: 999,
    yearlyPrice: 9999,
    yearlyDiscount: 17,
    subscribers: 50,
    mrr: 49950,
    color: "gold",
    badge: "High Value",
    badgeColor: "gold",
    features: [
      { name: "Premium profile", included: true },
      { name: "Unlimited portfolio", included: true },
      { name: "Unlimited applications", included: true },
      { name: "Top search visibility", included: true },
      { name: "Verified badge", included: true },
      { name: "24/7 Priority support", included: true },
    ],
  },
];

const transactions: Transaction[] = [
  {
    id: "1",
    transactionId: "pay_Np8L4x2C9k3M5n7Q",
    freelancerName: "Vikram Patel",
    freelancerEmail: "vikram.p@gmail.com",
    plan: "Pro",
    amount: 499,
    date: "Feb 6, 2024",
    status: "successful",
    paymentMethod: "UPI",
  },
  {
    id: "2",
    transactionId: "pay_Np8K3w1B8j2L4m6P",
    freelancerName: "Sneha Reddy",
    freelancerEmail: "sneha.r@outlook.com",
    plan: "Premium",
    amount: 999,
    date: "Feb 6, 2024",
    status: "successful",
    paymentMethod: "Card",
  },
  {
    id: "3",
    transactionId: "pay_Np8J2v0A7i1K3l5O",
    freelancerName: "Arjun Singh",
    freelancerEmail: "arjun.s@gmail.com",
    plan: "Pro",
    amount: 4999,
    date: "Feb 5, 2024",
    status: "successful",
    paymentMethod: "Netbanking",
  },
  {
    id: "4",
    transactionId: "pay_Np8I1u9z6h0J2k4N",
    freelancerName: "Priya Menon",
    freelancerEmail: "priya.m@creative.io",
    plan: "Pro",
    amount: 499,
    date: "Feb 5, 2024",
    status: "failed",
    paymentMethod: "Card",
  },
  {
    id: "5",
    transactionId: "pay_Np8H0t8y5g9I1j3M",
    freelancerName: "Rahul Kumar",
    freelancerEmail: "rahul.k@gmail.com",
    plan: "Premium",
    amount: 999,
    date: "Feb 4, 2024",
    status: "refunded",
    paymentMethod: "UPI",
  },
];

const analyticsData = {
  mrr: 174700,
  arr: 2096400,
  churnRate: 2.4,
  ltv: 3450,
  freeToProConversion: 12,
  proToPremiumConversion: 8,
  avgTimeToUpgrade: 14,
  mrrGrowth: [
    { month: "Sep", value: 125000 },
    { month: "Oct", value: 138000 },
    { month: "Nov", value: 152000 },
    { month: "Dec", value: 161000 },
    { month: "Jan", value: 168000 },
    { month: "Feb", value: 174700 },
  ],
  revenueByPlan: [
    { month: "Sep", free: 0, pro: 95000, premium: 30000 },
    { month: "Oct", free: 0, pro: 105000, premium: 33000 },
    { month: "Nov", free: 0, pro: 115000, premium: 37000 },
    { month: "Dec", free: 0, pro: 120000, premium: 41000 },
    { month: "Jan", free: 0, pro: 122000, premium: 46000 },
    { month: "Feb", free: 0, pro: 124750, premium: 49950 },
  ],
};

// ============ COMPONENTS ============

const StatCard = ({
  label,
  value,
  icon: Icon,
  color,
  trend,
  trendValue,
  large,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  color: string;
  trend?: "up" | "down";
  trendValue?: string;
  large?: boolean;
}) => (
  <div className={`sm-stat-card ${color} ${large ? "large" : ""}`}>
    <div className="sm-stat-icon">
      <Icon size={large ? 28 : 22} />
    </div>
    <div className="sm-stat-info">
      <div className={`sm-stat-value ${large ? "large" : ""}`}>{value}</div>
      <div className="sm-stat-label">{label}</div>
      {trend && trendValue && (
        <div className={`sm-stat-trend ${trend}`}>
          {trend === "up" ? (
            <ArrowUpRight size={14} />
          ) : (
            <ArrowDownRight size={14} />
          )}
          {trendValue}
        </div>
      )}
    </div>
  </div>
);

const PlanCard = ({
  plan,
  onEdit,
  onViewSubscribers,
}: {
  plan: Plan;
  onEdit: (plan: Plan) => void;
  onViewSubscribers: (plan: Plan) => void;
}) => (
  <div
    className={`sm-plan-card ${plan.color} ${plan.isPopular ? "popular" : ""}`}
  >
    {plan.badge && (
      <div className={`sm-plan-badge ${plan.badgeColor}`}>
        {plan.color === "gold" && <Crown size={12} />}
        {plan.badge}
      </div>
    )}

    <div className="sm-plan-header">
      <h3 className={`sm-plan-name ${plan.color}`}>
        {plan.color === "gold" && <Crown size={20} />}
        {plan.name}
      </h3>
    </div>

    <div className="sm-plan-pricing">
      <span className="sm-price">₹{plan.monthlyPrice.toLocaleString()}</span>
      <span className="sm-period">/month</span>
    </div>

    {plan.yearlyPrice > 0 && (
      <div className="sm-yearly-price">
        ₹{plan.yearlyPrice.toLocaleString()}/year (Save {plan.yearlyDiscount}%)
      </div>
    )}

    <div className="sm-plan-stats">
      <div className="sm-plan-stat">
        <Users size={16} />
        <span className={plan.subscribers > 100 ? "highlight" : ""}>
          {plan.subscribers} active
        </span>
      </div>
      <div className="sm-plan-stat">
        <Wallet size={16} />
        <span>MRR: ₹{plan.mrr.toLocaleString()}</span>
      </div>
      {plan.conversionRate && (
        <div className="sm-conversion">
          <TrendingUp size={14} />
          {plan.conversionRate}
        </div>
      )}
    </div>

    <div className="sm-plan-features">
      {plan.features.map((feature, idx) => (
        <div
          key={idx}
          className={`sm-feature ${feature.included ? "included" : "excluded"}`}
        >
          {feature.included ? <Check size={14} /> : <X size={14} />}
          {feature.name}
        </div>
      ))}
    </div>

    <div className="sm-plan-actions">
      <button className="sm-plan-btn outline" onClick={() => onEdit(plan)}>
        <Edit3 size={14} />
        Edit Plan
      </button>
      {plan.subscribers > 0 && (
        <button
          className={`sm-plan-btn ${plan.isPopular ? "primary" : "outline"}`}
          onClick={() => onViewSubscribers(plan)}
        >
          <BarChart3 size={14} />
          {plan.isPopular ? "Analytics" : "View"}
        </button>
      )}
    </div>
  </div>
);

const TransactionRow = ({
  transaction,
  onViewDetails,
}: {
  transaction: Transaction;
  onViewDetails: (t: Transaction) => void;
}) => {
  const statusConfig = {
    successful: { label: "Successful", className: "emerald" },
    failed: { label: "Failed", className: "rose" },
    refunded: { label: "Refunded", className: "amber" },
  };

  const { label, className } = statusConfig[transaction.status];

  return (
    <tr>
      <td className="sm-tx-id">{transaction.transactionId.slice(0, 15)}...</td>
      <td>
        <div className="sm-tx-user">
          <span className="sm-tx-name">{transaction.freelancerName}</span>
          <span className="sm-tx-email">{transaction.freelancerEmail}</span>
        </div>
      </td>
      <td>
        <span className={`sm-plan-tag ${transaction.plan.toLowerCase()}`}>
          {transaction.plan}
        </span>
      </td>
      <td className="sm-tx-amount">₹{transaction.amount.toLocaleString()}</td>
      <td className="sm-tx-date">{transaction.date}</td>
      <td>
        <span className={`sm-status-badge ${className}`}>{label}</span>
      </td>
      <td>
        <div className="sm-tx-actions">
          <button
            className="sm-tx-btn"
            onClick={() => onViewDetails(transaction)}
          >
            <Eye size={14} />
          </button>
          <button className="sm-tx-btn">
            <FileText size={14} />
          </button>
          {transaction.status === "successful" && (
            <button className="sm-tx-btn refund">
              <RefreshCw size={14} />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

const MiniChart = ({
  data,
  color,
}: {
  data: { month: string; value: number }[];
  color: string;
}) => {
  const maxValue = Math.max(...data.map((d) => d.value));
  const minValue = Math.min(...data.map((d) => d.value));
  const range = maxValue - minValue;

  return (
    <div className="sm-mini-chart">
      <div className="sm-chart-bars">
        {data.map((item, idx) => {
          const height =
            range > 0 ? ((item.value - minValue) / range) * 100 : 50;
          return (
            <div key={idx} className="sm-chart-bar-wrapper">
              <div
                className={`sm-chart-bar ${color}`}
                style={{ height: `${Math.max(20, height)}%` }}
              >
                <div className="sm-chart-tooltip">
                  ₹{item.value.toLocaleString()}
                </div>
              </div>
              <span className="sm-chart-label">{item.month}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const StackedBarChart = ({
  data,
}: {
  data: { month: string; free: number; pro: number; premium: number }[];
}) => {
  const maxTotal = Math.max(...data.map((d) => d.free + d.pro + d.premium));

  return (
    <div className="sm-stacked-chart">
      <div className="sm-chart-bars">
        {data.map((item, idx) => {
          const total = item.free + item.pro + item.premium;
          const proHeight = (item.pro / maxTotal) * 100;
          const premiumHeight = (item.premium / maxTotal) * 100;

          return (
            <div key={idx} className="sm-stacked-wrapper">
              <div className="sm-stacked-bar">
                <div
                  className="sm-stack premium"
                  style={{ height: `${premiumHeight}%` }}
                ></div>
                <div
                  className="sm-stack pro"
                  style={{ height: `${proHeight}%` }}
                ></div>
              </div>
              <span className="sm-chart-label">{item.month}</span>
              <div className="sm-stacked-tooltip">
                <div>Pro: ₹{item.pro.toLocaleString()}</div>
                <div>Premium: ₹{item.premium.toLocaleString()}</div>
                <div>Total: ₹{total.toLocaleString()}</div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="sm-chart-legend">
        <span className="sm-legend-item pro">
          <span className="sm-legend-dot"></span>
          Pro
        </span>
        <span className="sm-legend-item premium">
          <span className="sm-legend-dot"></span>
          Premium
        </span>
      </div>
    </div>
  );
};

const ConversionFunnel = () => (
  <div className="sm-funnel">
    <div className="sm-funnel-step">
      <div className="sm-funnel-bar free" style={{ width: "100%" }}>
        <span>Free Users</span>
        <span>200</span>
      </div>
    </div>
    <div className="sm-funnel-arrow">
      <ArrowDownRight size={16} />
      <span>12% convert</span>
    </div>
    <div className="sm-funnel-step">
      <div className="sm-funnel-bar pro" style={{ width: "70%" }}>
        <span>Pro Users</span>
        <span>250</span>
      </div>
    </div>
    <div className="sm-funnel-arrow">
      <ArrowDownRight size={16} />
      <span>8% upgrade</span>
    </div>
    <div className="sm-funnel-step">
      <div className="sm-funnel-bar premium" style={{ width: "40%" }}>
        <span>Premium Users</span>
        <span>50</span>
      </div>
    </div>
  </div>
);

const PlanEditModal = ({
  plan,
  isOpen,
  onClose,
  onSave,
}: {
  plan: Plan | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (plan: Plan) => void;
}) => {
  if (!plan) return null;

  return (
    <div
      className={`sm-modal-overlay ${isOpen ? "open" : ""}`}
      onClick={onClose}
    >
      <div className="sm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="sm-modal-header">
          <h3>Edit {plan.name} Plan</h3>
          <button className="sm-modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="sm-modal-body">
          <div className="sm-form-group">
            <label>Plan Name</label>
            <input type="text" defaultValue={plan.name} />
          </div>

          <div className="sm-form-row">
            <div className="sm-form-group">
              <label>Monthly Price (₹)</label>
              <input type="number" defaultValue={plan.monthlyPrice} />
            </div>
            <div className="sm-form-group">
              <label>Yearly Price (₹)</label>
              <input type="number" defaultValue={plan.yearlyPrice} />
            </div>
          </div>

          <div className="sm-form-group">
            <label>Features</label>
            <div className="sm-features-builder">
              {plan.features.map((feature, idx) => (
                <div key={idx} className="sm-feature-item">
                  <input type="checkbox" defaultChecked={feature.included} />
                  <input type="text" defaultValue={feature.name} />
                  <button className="sm-remove-feature">
                    <X size={14} />
                  </button>
                </div>
              ))}
              <button className="sm-add-feature">
                <Plus size={14} />
                Add Feature
              </button>
            </div>
          </div>

          <div className="sm-form-group">
            <label>Limits</label>
            <div className="sm-limits-grid">
              <div className="sm-limit-item">
                <span>Portfolio Items</span>
                <input type="number" defaultValue={25} />
              </div>
              <div className="sm-limit-item">
                <span>Applications/month</span>
                <input
                  type="number"
                  defaultValue={-1}
                  placeholder="Unlimited"
                />
              </div>
              <div className="sm-limit-item">
                <span>Featured Duration (days)</span>
                <input type="number" defaultValue={7} />
              </div>
            </div>
          </div>

          <div className="sm-form-row">
            <div className="sm-form-group">
              <label>Badge</label>
              <select defaultValue={plan.badge || "none"}>
                <option value="none">None</option>
                <option value="pro">Pro Badge</option>
                <option value="premium">Premium Badge</option>
                <option value="verified">Verified Badge</option>
              </select>
            </div>
            <div className="sm-form-group">
              <label>Status</label>
              <div className="sm-toggle-wrapper">
                <span>Active</span>
                <label className="sm-toggle">
                  <input type="checkbox" defaultChecked />
                  <span className="sm-toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="sm-modal-footer">
          <button className="sm-btn outline" onClick={onClose}>
            Cancel
          </button>
          <button className="sm-btn primary" onClick={() => onSave(plan)}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

// ============ MAIN COMPONENT ============

const SubscriptionManagement = () => {
  const [activeTab, setActiveTab] = useState<TabType>("plans");
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");

  const filteredTransactions = transactions.filter((t) => {
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    if (planFilter !== "all" && t.plan.toLowerCase() !== planFilter)
      return false;
    return true;
  });

  const tabs = [
    { id: "plans" as TabType, label: "Plans & Pricing", icon: CreditCard },
    { id: "transactions" as TabType, label: "Transactions", icon: FileText },
    { id: "analytics" as TabType, label: "Analytics", icon: BarChart3 },
    { id: "settings" as TabType, label: "Settings", icon: Settings },
  ];

  return (
    <AdminLayout
      title="Subscription Management"
      breadcrumb="Manage Subscriptions"
    >
      {/* Page Header */}
      <div className="sm-page-header">
        <div className="sm-header-left">
          <h2>Subscription Management</h2>
          <p>Manage plans, view transactions, and analyze revenue</p>
        </div>
        <div className="sm-header-right">
          <button className="admin-btn admin-btn-primary">
            <Plus size={18} />
            Create New Plan
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="sm-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={activeTab === tab.id ? "active" : ""}
            onClick={() => setActiveTab(tab.id)}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="sm-tab-content">
        {activeTab === "plans" && (
          <div className="sm-plans-tab">
            <div className="sm-plans-grid">
              {plans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  onEdit={setEditingPlan}
                  onViewSubscribers={() => setActiveTab("analytics")}
                />
              ))}
            </div>
          </div>
        )}

        {activeTab === "transactions" && (
          <div className="sm-transactions-tab">
            {/* Filters */}
            <div className="sm-tx-filters">
              <div className="sm-filter-group">
                <Filter size={16} />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="successful">Successful</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
                <ChevronDown size={14} />
              </div>

              <div className="sm-filter-group">
                <select
                  value={planFilter}
                  onChange={(e) => setPlanFilter(e.target.value)}
                >
                  <option value="all">All Plans</option>
                  <option value="pro">Pro</option>
                  <option value="premium">Premium</option>
                </select>
                <ChevronDown size={14} />
              </div>

              <div className="sm-filter-group">
                <Calendar size={16} />
                <span>Last 30 Days</span>
                <ChevronDown size={14} />
              </div>

              <button className="sm-export-btn">
                <Download size={16} />
                Export CSV
              </button>
            </div>

            {/* Transactions Table */}
            <div className="sm-tx-table-wrapper">
              <table className="sm-tx-table">
                <thead>
                  <tr>
                    <th>Transaction ID</th>
                    <th>Freelancer</th>
                    <th>Plan</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((tx) => (
                    <TransactionRow
                      key={tx.id}
                      transaction={tx}
                      onViewDetails={() => {}}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="sm-pagination">
              <span>Showing 1-5 of 124 transactions</span>
              <div className="sm-pagination-controls">
                <button disabled>Previous</button>
                <button className="active">1</button>
                <button>2</button>
                <button>3</button>
                <button>Next</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="sm-analytics-tab">
            {/* Revenue Stats */}
            <div className="sm-revenue-stats">
              <StatCard
                label="Monthly Recurring Revenue"
                value={`₹${analyticsData.mrr.toLocaleString()}`}
                icon={Wallet}
                color="indigo"
                trend="up"
                trendValue="+4.2%"
                large
              />
              <StatCard
                label="Annual Recurring Revenue"
                value={`₹${analyticsData.arr.toLocaleString()}`}
                icon={TrendingUp}
                color="cyan"
                trend="up"
                trendValue="+12%"
              />
              <StatCard
                label="Churn Rate"
                value={`${analyticsData.churnRate}%`}
                icon={TrendingDown}
                color="emerald"
              />
              <StatCard
                label="Customer LTV"
                value={`₹${analyticsData.ltv.toLocaleString()}`}
                icon={Users}
                color="violet"
              />
            </div>

            {/* Charts Row */}
            <div className="sm-charts-row">
              <div className="sm-chart-card">
                <div className="sm-chart-header">
                  <h4>MRR Growth</h4>
                  <Activity size={18} />
                </div>
                <MiniChart data={analyticsData.mrrGrowth} color="indigo" />
              </div>

              <div className="sm-chart-card">
                <div className="sm-chart-header">
                  <h4>Revenue by Plan</h4>
                  <PieChart size={18} />
                </div>
                <StackedBarChart data={analyticsData.revenueByPlan} />
              </div>
            </div>

            {/* Conversion Metrics */}
            <div className="sm-conversion-section">
              <h4>Conversion Funnel</h4>
              <div className="sm-conversion-grid">
                <div className="sm-conversion-card">
                  <ConversionFunnel />
                </div>
                <div className="sm-conversion-metrics">
                  <div className="sm-metric">
                    <div className="sm-metric-icon indigo">
                      <Zap size={18} />
                    </div>
                    <div className="sm-metric-info">
                      <span className="sm-metric-value">
                        {analyticsData.freeToProConversion}%
                      </span>
                      <span className="sm-metric-label">Free → Pro</span>
                    </div>
                  </div>
                  <div className="sm-metric">
                    <div className="sm-metric-icon gold">
                      <Star size={18} />
                    </div>
                    <div className="sm-metric-info">
                      <span className="sm-metric-value">
                        {analyticsData.proToPremiumConversion}%
                      </span>
                      <span className="sm-metric-label">Pro → Premium</span>
                    </div>
                  </div>
                  <div className="sm-metric">
                    <div className="sm-metric-icon cyan">
                      <Calendar size={18} />
                    </div>
                    <div className="sm-metric-info">
                      <span className="sm-metric-value">
                        {analyticsData.avgTimeToUpgrade} days
                      </span>
                      <span className="sm-metric-label">
                        Avg. Time to Upgrade
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="sm-settings-tab">
            <div className="sm-settings-section">
              <h4>Payment Gateway</h4>
              <div className="sm-settings-card">
                <div className="sm-setting-row">
                  <div className="sm-setting-info">
                    <span className="sm-setting-label">
                      Razorpay Integration
                    </span>
                    <span className="sm-setting-desc">
                      Connected to your Razorpay account
                    </span>
                  </div>
                  <div className="sm-setting-status connected">
                    <Shield size={14} />
                    Connected
                  </div>
                </div>
                <div className="sm-setting-row">
                  <div className="sm-setting-info">
                    <span className="sm-setting-label">Test Mode</span>
                    <span className="sm-setting-desc">
                      Use test credentials for development
                    </span>
                  </div>
                  <label className="sm-toggle">
                    <input type="checkbox" />
                    <span className="sm-toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>

            <div className="sm-settings-section">
              <h4>Subscription Settings</h4>
              <div className="sm-settings-card">
                <div className="sm-setting-row">
                  <div className="sm-setting-info">
                    <span className="sm-setting-label">Auto-renewal</span>
                    <span className="sm-setting-desc">
                      Automatically renew subscriptions
                    </span>
                  </div>
                  <label className="sm-toggle">
                    <input type="checkbox" defaultChecked />
                    <span className="sm-toggle-slider"></span>
                  </label>
                </div>
                <div className="sm-setting-row">
                  <div className="sm-setting-info">
                    <span className="sm-setting-label">Grace Period</span>
                    <span className="sm-setting-desc">
                      Days before subscription expires
                    </span>
                  </div>
                  <select defaultValue="3">
                    <option value="1">1 day</option>
                    <option value="3">3 days</option>
                    <option value="7">7 days</option>
                  </select>
                </div>
                <div className="sm-setting-row">
                  <div className="sm-setting-info">
                    <span className="sm-setting-label">
                      Send Renewal Reminders
                    </span>
                    <span className="sm-setting-desc">
                      Email users before subscription expires
                    </span>
                  </div>
                  <label className="sm-toggle">
                    <input type="checkbox" defaultChecked />
                    <span className="sm-toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>

            <div className="sm-settings-section">
              <h4>Invoice Settings</h4>
              <div className="sm-settings-card">
                <div className="sm-setting-row">
                  <div className="sm-setting-info">
                    <span className="sm-setting-label">GST Number</span>
                    <span className="sm-setting-desc">
                      Include GST on invoices
                    </span>
                  </div>
                  <input
                    type="text"
                    placeholder="Enter GST Number"
                    className="sm-setting-input"
                  />
                </div>
                <div className="sm-setting-row">
                  <div className="sm-setting-info">
                    <span className="sm-setting-label">Invoice Prefix</span>
                    <span className="sm-setting-desc">
                      Prefix for invoice numbers
                    </span>
                  </div>
                  <input
                    type="text"
                    defaultValue="INV-"
                    className="sm-setting-input"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <PlanEditModal
        plan={editingPlan}
        isOpen={!!editingPlan}
        onClose={() => setEditingPlan(null)}
        onSave={() => setEditingPlan(null)}
      />
    </AdminLayout>
  );
};

export default SubscriptionManagement;
