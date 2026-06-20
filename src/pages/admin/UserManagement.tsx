import { useState, useEffect, useRef, useCallback } from "react";
import { adminService } from "@/services";
import { format } from "date-fns";
import { DayPicker, type DateRange } from "react-day-picker";
import {
  Users,
  UserPlus,
  Download,
  Filter,
  Settings,
  Search,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Eye,
  Edit,
  MessageSquare,
  AlertTriangle,
  Trash2,
  Mail,
  Ban,
  SearchX,
  Calendar,
  MapPin,
  Activity,
  Clock,
  Zap,
  Check,
  type LucideIcon,
} from "lucide-react";

// ============ TYPES ============

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  initials: string;
  role: "client" | "freelancer" | "admin";
  status: "active" | "suspended" | "pending";
  location: string;
  state: string;
  joinedDate: string;
  lastActive: string;
  lastActiveRecent: boolean;
  revenue: string;
  /** Mirrors FreelancerProfile.isProActive — only meaningful for freelancers. */
  isProActive?: boolean;
  createdAt: string;
  projectsCount: number;
  rating: number;
}

type TabType = "all" | "clients" | "freelancers" | "admins";

// ============ MOCK DATA ============

const statsData = [
  {
    label: "Total Users",
    value: "...",
    color: "indigo" as const,
    icon: Users,
  },
  {
    label: "Active",
    value: "...",
    color: "emerald" as const,
    icon: Activity,
  },
  { label: "Pending", value: "...", color: "amber" as const, icon: Clock },
  { label: "Suspended", value: "...", color: "rose" as const, icon: Ban },
];

const tabsData: { key: TabType; label: string; count: number }[] = [
  { key: "all", label: "All Users", count: 0 },
  { key: "clients", label: "Clients", count: 0 },
  { key: "freelancers", label: "Freelancers", count: 0 },
  { key: "admins", label: "Admins", count: 0 },
];

// ============ COMPONENTS ============

const StatCard = ({
  stat,
}: {
  stat: {
    label: string;
    value: string;
    color: "indigo" | "emerald" | "amber" | "rose";
    icon: LucideIcon;
  };
}) => {
  const Icon = stat.icon;
  return (
    <div className={`um-stat-card ${stat.color}`}>
      <div className="um-stat-icon">
        <Icon size={20} />
      </div>
      <div className="um-stat-info">
        <div className="um-stat-value">{stat.value}</div>
        <div className="um-stat-label">{stat.label}</div>
      </div>
    </div>
  );
};

const RoleBadge = ({ role }: { role: User["role"] }) => {
  const roleConfig = {
    client: { label: "Client", className: "indigo" },
    freelancer: { label: "Freelancer", className: "cyan" },
    admin: { label: "Admin", className: "violet" },
  };
  const config = roleConfig[role];
  return (
    <span className={`um-role-badge ${config.className}`}>{config.label}</span>
  );
};

const StatusBadge = ({ status }: { status: User["status"] }) => {
  const statusConfig = {
    active: { label: "Active", className: "emerald" },
    suspended: { label: "Suspended", className: "rose" },
    pending: { label: "Pending", className: "amber" },
  };
  const config = statusConfig[status];
  return (
    <span className={`um-status-badge ${config.className}`}>
      <span className="um-status-dot"></span>
      {config.label}
    </span>
  );
};

const ProBadge = () => (
  <span className="um-pro-badge" title="Active Pro subscription">
    <Zap size={10} className="fill-current" />
    Pro
  </span>
);

const UserRow = ({
  user,
  isSelected,
  onSelect,
  onViewDetails,
  onProOverride,
}: {
  user: User;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onViewDetails: (user: User) => void;
  onProOverride: (user: User, next: boolean) => void;
}) => {
  const [showActions, setShowActions] = useState(false);
  const actionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        actionsRef.current &&
        !actionsRef.current.contains(event.target as Node)
      ) {
        setShowActions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <tr className={isSelected ? "selected" : ""}>
      <td>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(user.id)}
          className="um-checkbox"
        />
      </td>
      <td>
        <div className="um-user-cell">
          <div className="um-user-avatar">{user.initials}</div>
          <div className="um-user-info">
            <div className="um-user-name">
              {user.name}
              {user.isProActive && <ProBadge />}
            </div>
            <div className="um-user-email">{user.email}</div>
            <RoleBadge role={user.role} />
          </div>
        </div>
      </td>
      <td>
        <StatusBadge status={user.status} />
      </td>
      <td>
        <span className="um-location">
          {user.location}, {user.state}
        </span>
      </td>
      <td>
        <span className="um-date">{user.joinedDate}</span>
      </td>
      <td>
        <span
          className={`um-last-active ${user.lastActiveRecent ? "recent" : ""}`}
        >
          {user.lastActive}
        </span>
      </td>
      <td>
        <span className="um-revenue">{user.revenue}</span>
      </td>
      <td>
        <div className="um-actions-wrapper" ref={actionsRef}>
          <button
            className="um-actions-btn"
            onClick={() => setShowActions(!showActions)}
          >
            <MoreHorizontal size={18} />
          </button>
          {showActions && (
            <div className="um-actions-dropdown">
              <button onClick={() => onViewDetails(user)}>
                <Eye size={14} />
                View Profile
              </button>
              <button>
                <Edit size={14} />
                Edit User
              </button>
              <button>
                <MessageSquare size={14} />
                Send Message
              </button>
              {user.role === "freelancer" && (
                <>
                  <div className="um-actions-divider"></div>
                  <button
                    className="pro"
                    onClick={() => {
                      setShowActions(false);
                      onProOverride(user, !user.isProActive);
                    }}
                  >
                    {user.isProActive ? (
                      <>
                        <X size={14} />
                        Revoke Pro
                      </>
                    ) : (
                      <>
                        <Zap size={14} />
                        Grant Pro
                      </>
                    )}
                  </button>
                </>
              )}
              <div className="um-actions-divider"></div>
              <button className="warning">
                <AlertTriangle size={14} />
                Suspend Account
              </button>
              <button className="danger">
                <Trash2 size={14} />
                Delete User
              </button>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
};

const UserDetailSlideOver = ({
  user,
  isOpen,
  onClose,
}: {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [activeTab, setActiveTab] = useState<
    "overview" | "activity" | "projects" | "settings"
  >("overview");

  if (!user) return null;

  const recentActivity = [
    { action: "Joined the platform", time: user.joinedDate, type: "info" },
  ];

  return (
    <div
      className={`um-slideover-overlay ${isOpen ? "open" : ""}`}
      onClick={onClose}
    >
      <div
        className={`um-slideover ${isOpen ? "open" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="um-slideover-header">
          <button className="um-slideover-close" onClick={onClose}>
            <X size={20} />
          </button>
          <div className="um-slideover-profile">
            <div className="um-slideover-avatar">{user.initials}</div>
            <div className="um-slideover-info">
              <h3>{user.name}</h3>
              <p>{user.email}</p>
              <div className="um-slideover-badges">
                <RoleBadge role={user.role} />
                <StatusBadge status={user.status} />
              </div>
            </div>
          </div>
          <div className="um-slideover-quick-actions">
            <button className="admin-btn admin-btn-primary admin-btn-sm">
              <MessageSquare size={14} />
              Message
            </button>
            <button className="admin-btn admin-btn-outline admin-btn-sm">
              <Edit size={14} />
              Edit
            </button>
            <button className="admin-btn admin-btn-outline admin-btn-sm warning">
              <Ban size={14} />
              Suspend
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="um-slideover-tabs">
          {(["overview", "activity", "projects", "settings"] as const).map(
            (tab) => (
              <button
                key={tab}
                className={activeTab === tab ? "active" : ""}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ),
          )}
        </div>

        {/* Content */}
        <div className="um-slideover-content">
          {activeTab === "overview" && (
            <div className="um-slideover-overview">
              {/* Stats */}
              <div className="um-slideover-stats">
                <div className="um-slideover-stat">
                  <div className="value">{user.revenue}</div>
                  <div className="label">
                    {user.role === "client" ? "Total Spent" : "Total Earned"}
                  </div>
                </div>
                <div className="um-slideover-stat">
                  <div className="value">{user.projectsCount || 0}</div>
                  <div className="label">Projects</div>
                </div>
                <div className="um-slideover-stat">
                  <div className="value">
                    {user.rating > 0 ? user.rating.toFixed(1) : "—"}
                  </div>
                  <div className="label">Rating</div>
                </div>
              </div>

              {/* Details */}
              <div className="um-slideover-details">
                <h4>Contact Information</h4>
                <div className="um-detail-row">
                  <Mail size={16} />
                  <span>{user.email}</span>
                </div>
                <div className="um-detail-row">
                  <MapPin size={16} />
                  <span>
                    {user.location}, {user.state}
                  </span>
                </div>
                <div className="um-detail-row">
                  <Calendar size={16} />
                  <span>Joined {user.joinedDate}</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "activity" && (
            <div className="um-slideover-activity">
              <h4>Recent Activity</h4>
              <div className="um-activity-timeline">
                {recentActivity.map((item, index) => (
                  <div key={index} className="um-activity-item">
                    <div className={`um-activity-dot ${item.type}`}></div>
                    <div className="um-activity-content">
                      <p>{item.action}</p>
                      <span>{item.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "projects" && (
            <div className="um-slideover-projects">
              <h4>Recent Projects</h4>
              <div className="um-project-list">
                <p className="text-slate-500 text-sm">
                  No recent projects to display.
                </p>
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="um-slideover-settings">
              <h4>Account Settings</h4>
              <div className="um-setting-item">
                <span>Email Notifications</span>
                <div className="um-toggle active"></div>
              </div>
              <div className="um-setting-item">
                <span>Two-Factor Auth</span>
                <div className="um-toggle"></div>
              </div>
              <div className="um-setting-item">
                <span>Profile Visibility</span>
                <div className="um-toggle active"></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============ MAIN COMPONENT ============

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUserData, setNewUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    role: "client",
  });
  useEffect(() => {
    document.body.style.overflow = isAddUserModalOpen ? "hidden" : "";
  }, [isAddUserModalOpen]);

  const [isSubmittingNewUser, setIsSubmittingNewUser] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [slideOverUser, setSlideOverUser] = useState<User | null>(null);
  const [totalItems, setTotalItems] = useState(0);
  const [liveStats, setLiveStats] = useState(statsData);
  const [liveTabs, setLiveTabs] = useState(tabsData);
  const [proTarget, setProTarget] = useState<{
    user: User;
    next: boolean;
  } | null>(null);
  const [proReason, setProReason] = useState("");
  const [proSubmitting, setProSubmitting] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(e.target as Node)) {
        setIsDatePickerOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleDateRangeSelect = (range: DateRange | undefined) => {
    if (range?.from) {
      setStartDate(format(range.from, "yyyy-MM-dd"));
    } else {
      setStartDate("");
    }
    if (range?.to) {
      setEndDate(format(range.to, "yyyy-MM-dd"));
    } else {
      setEndDate("");
    }
  };

  const selectedRange = {
    from: startDate ? new Date(startDate + "T00:00:00") : undefined,
    to: endDate ? new Date(endDate + "T00:00:00") : undefined,
  };

  // Toast import via existing toastify is not present — log to console.
  const handleProOverride = (user: User, next: boolean) => {
    setProTarget({ user, next });
    setProReason("");
  };

  const submitProOverride = async () => {
    if (!proTarget) return;
    setProSubmitting(true);
    try {
      await adminService.setProStatus(proTarget.user.id, {
        isProActive: proTarget.next,
        reason: proReason || undefined,
        durationDays: proTarget.next ? 365 : undefined,
      });
      // Optimistic local update so the UI reflects the new state without a refetch
      setUsers((prev) =>
        prev.map((u) =>
          u.id === proTarget.user.id
            ? { ...u, isProActive: proTarget.next }
            : u,
        ),
      );
      setProTarget(null);
      setProReason("");
    } catch (err) {
      console.error("[Admin] Pro override failed", err);
      // Don't close the modal on failure — let the admin retry
    } finally {
      setProSubmitting(false);
    }
  };

  const handleAddUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingNewUser(true);
    try {
      await adminService.createUser(newUserData);
      setIsAddUserModalOpen(false);
      setNewUserData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        password: "",
        role: "client",
      });
      fetchUsers(); // Refresh the list
      fetchStats();
    } catch (err) {
      console.error("[Admin] Failed to create user", err);
    } finally {
      setIsSubmittingNewUser(false);
    }
  };

  // Fetch users from API
  const fetchUsers = useCallback(async () => {
    try {
      const roleParam =
        activeTab === "clients"
          ? "client"
          : activeTab === "freelancers"
            ? "freelancer"
            : activeTab === "admins"
              ? "admin"
              : roleFilter !== "all"
                ? roleFilter
                : undefined;
      const statusParam = statusFilter !== "all" ? statusFilter : undefined;

      const result = await adminService.getAllUsers({
        page: currentPage,
        limit: itemsPerPage,
        search: searchQuery || undefined,
        role: roleParam,
        status: statusParam,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });

      const mapped: User[] = (result.users || []).map((u: any) => {
        const name = u.fullName || u.email?.split("@")[0] || "Unknown";
        const initials = name
          .split(" ")
          .map((n: string) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2);
        const city = u.address?.city || u.profile?.location?.city || "";
        const state = u.address?.state || u.profile?.location?.state || "";
        const earnings =
          u.profile?.totalEarnings ?? u.profile?.totalProjectsPosted ?? 0;
        const lastLogin = u.lastLoginAt
          ? getTimeAgo(new Date(u.lastLoginAt))
          : "—";
        const isRecent = u.lastLoginAt
          ? Date.now() - new Date(u.lastLoginAt).getTime() < 3600000
          : false;

        const projectsCount =
          u.profile?.completedProjects ?? u.profile?.totalProjectsPosted ?? 0;
        const rating = u.profile?.rating ?? 0;

        return {
          id: u._id || u.id,
          name,
          email: u.email,
          phone: u.phone || "—",
          initials,
          role: u.role as User["role"],
          status: u.status as User["status"],
          location: city || "—",
          state: state || "—",
          joinedDate: new Date(u.createdAt).toLocaleDateString("en-IN", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          lastActive: lastLogin,
          lastActiveRecent: isRecent,
          revenue: earnings > 0 ? `₹${earnings.toLocaleString("en-IN")}` : "—",
          isProActive: u.profile?.isProActive === true,
          createdAt: u.createdAt || "",
          projectsCount,
          rating,
        };
      });

      setUsers(mapped);
      setTotalItems(result.pagination?.totalItems ?? mapped.length);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }, [
    activeTab,
    searchQuery,
    roleFilter,
    statusFilter,
    currentPage,
    itemsPerPage,
    startDate,
    endDate,
  ]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const statsResult = await adminService.getDashboardStats();
      setLiveStats([
        {
          label: "Total Users",
          value: String(statsResult.totalUsers || 0),
          color: "indigo" as const,
          icon: Users,
        },
        {
          label: "Active",
          value: String(statsResult.activeUsers || 0),
          color: "emerald" as const,
          icon: Activity,
        },
        {
          label: "Pending",
          value: String(statsResult.pendingUsers || 0),
          color: "amber" as const,
          icon: Clock,
        },
        {
          label: "Suspended",
          value: String(statsResult.suspendedUsers || 0),
          color: "rose" as const,
          icon: Ban,
        },
      ]);
      setLiveTabs([
        { key: "all", label: "All Users", count: statsResult.totalUsers || 0 },
        {
          key: "clients",
          label: "Clients",
          count: statsResult.totalClients || 0,
        },
        {
          key: "freelancers",
          label: "Freelancers",
          count: statsResult.totalFreelancers || 0,
        },
        { key: "admins", label: "Admins", count: statsResult.totalAdmins || 0 },
      ]);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setCurrentPage(1);
    }, 300);
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [searchQuery]);

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

  // Filter users based on active tab and filters (client-side for location only)
  const filteredUsers = users
    .filter((user) => {
      // Location filter (client-side since API may not have it)
      if (locationFilter === "TG" && user.state !== "TG") return false;
      if (locationFilter === "AP" && user.state !== "AP") return false;
      return true;
    })
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const paginatedUsers = filteredUsers;

  const handleSelectAll = () => {
    if (selectedUsers.size === paginatedUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(paginatedUsers.map((u) => u.id)));
    }
  };

  const handleSelectUser = (id: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedUsers(newSelected);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setRoleFilter("all");
    setStatusFilter("all");
    setLocationFilter("all");
    setStartDate("");
    setEndDate("");
  };

  const hasActiveFilters =
    searchQuery ||
    roleFilter !== "all" ||
    statusFilter !== "all" ||
    locationFilter !== "all" ||
    startDate ||
    endDate;

  return (
    <>
      {/* Page Header */}
      <div className="um-page-header">
        <div className="um-header-left">
          <h2>User Management</h2>
          <p>Manage clients, freelancers, and admins</p>
        </div>
        <div className="um-header-right">
          <button
            className="admin-btn admin-btn-primary"
            onClick={() => setIsAddUserModalOpen(true)}
          >
            <UserPlus size={18} />
            Add User
          </button>
          <button className="admin-btn admin-btn-outline">
            <Download size={18} />
            Export CSV
          </button>
          <button className="um-icon-btn">
            <Filter size={18} />
          </button>
          <button className="um-icon-btn">
            <Settings size={18} />
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="um-stats-grid">
        {liveStats.map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </div>

      {/* Filter Bar */}
      <div className="um-filter-bar">
        <div className="um-filter-row">
          <div className="um-search-wrapper">
            <Search size={18} className="um-search-icon" />
            <input
              type="text"
              placeholder="Search by name, email, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="um-search-input"
            />
            {searchQuery && (
              <button
                className="um-search-clear"
                onClick={() => setSearchQuery("")}
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="um-filter-select">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="client">Clients</option>
              <option value="freelancer">Freelancers</option>
              <option value="admin">Admins</option>
            </select>
            <ChevronDown size={16} />
          </div>

          <div className="um-filter-select">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="pending">Pending Verification</option>
            </select>
            <ChevronDown size={16} />
          </div>

          <div className="um-filter-select">
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
            >
              <option value="all">All Locations</option>
              <option value="TG">Telangana</option>
              <option value="AP">Andhra Pradesh</option>
            </select>
            <ChevronDown size={16} />
          </div>

          <div className="relative" ref={datePickerRef}>
            <button
              type="button"
              onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-300 min-w-[220px]"
            >
              <Calendar size={16} className="text-slate-400" />
              <span className="flex-1 text-left">
                {startDate && endDate 
                  ? `${format(new Date(startDate + "T00:00:00"), "MMM dd, yyyy")} - ${format(new Date(endDate + "T00:00:00"), "MMM dd, yyyy")}`
                  : startDate 
                    ? format(new Date(startDate + "T00:00:00"), "MMM dd, yyyy") 
                    : "Select Date Range"}
              </span>
              <ChevronDown size={14} className="text-slate-500" />
            </button>

            {isDatePickerOpen && (
              <div className="absolute z-50 top-full mt-2 right-0 bg-[#09090b] border border-slate-700 rounded-2xl shadow-2xl p-3 animate-in slide-in-from-top-2 duration-150">
                <DayPicker
                  mode="range"
                  selected={selectedRange}
                  onSelect={handleDateRangeSelect}
                  classNames={{
                    root: "rdp-custom",
                    months: "flex",
                    month: "space-y-3",
                    month_caption: "flex justify-center items-center relative h-9",
                    caption_label: "text-sm font-semibold text-slate-200",
                    nav: "flex items-center gap-1",
                    button_previous: "h-7 w-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-white/10 transition-colors absolute left-1",
                    button_next: "h-7 w-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-white/10 transition-colors absolute right-1",
                    month_grid: "w-full border-collapse",
                    weekdays: "flex",
                    weekday: "text-slate-500 text-xs font-medium w-9 text-center py-1",
                    week: "flex w-full mt-1",
                    day: "w-9 text-center text-sm p-0",
                    day_button: "h-9 w-9 rounded-lg font-medium transition-all text-sm text-slate-300 hover:bg-indigo-500/20 focus:outline-none focus:ring-2 focus:ring-indigo-500",
                    range_start: "!bg-indigo-500 !text-white hover:!bg-indigo-600 rounded-l-lg rounded-r-none",
                    range_end: "!bg-indigo-500 !text-white hover:!bg-indigo-600 rounded-r-lg rounded-l-none",
                    range_middle: "!bg-indigo-500/10 !text-indigo-200 !rounded-none",
                    selected: "!bg-indigo-500 !text-white shadow-md shadow-indigo-500/20",
                    today: "text-indigo-400 font-bold border border-indigo-500/40",
                    outside: "text-slate-700 opacity-50",
                    disabled: "text-slate-700 opacity-40 cursor-not-allowed hover:bg-transparent",
                  }}
                  components={{
                    Chevron: (props) => {
                      if (props.orientation === "left") return <ChevronLeft size={16} />;
                      return <ChevronRight size={16} />;
                    },
                  }}
                />
              </div>
            )}
          </div>

          {hasActiveFilters && (
            <button className="um-clear-filters" onClick={clearFilters}>
              Clear Filters
            </button>
          )}
        </div>

        <div className="um-results-count">
          Showing 1-{Math.min(itemsPerPage, filteredUsers.length)} of{" "}
          {filteredUsers.length} users
        </div>
      </div>

      {/* Tabs */}
      <div className="um-tabs">
        {liveTabs.map((tab) => (
          <button
            key={tab.key}
            className={activeTab === tab.key ? "active" : ""}
            onClick={() => {
              setActiveTab(tab.key);
              setCurrentPage(1);
            }}
          >
            {tab.label}
            <span className="um-tab-count">{tab.count.toLocaleString()}</span>
          </button>
        ))}
      </div>

      {/* Bulk Actions Bar */}
      {selectedUsers.size > 0 && (
        <div className="um-bulk-actions">
          <span className="um-bulk-count">
            {selectedUsers.size} users selected
          </span>
          <div className="um-bulk-buttons">
            <button>
              <Mail size={14} />
              Send Email
            </button>
            <button>
              <Download size={14} />
              Export
            </button>
            <button className="warning">
              <Ban size={14} />
              Suspend
            </button>
            <button className="danger">
              <Trash2 size={14} />
              Delete
            </button>
          </div>
          <button
            className="um-bulk-close"
            onClick={() => setSelectedUsers(new Set())}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Data Table */}
      <div className="um-table-wrapper">
        {paginatedUsers.length > 0 ? (
          <table className="um-table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={
                      selectedUsers.size === paginatedUsers.length &&
                      paginatedUsers.length > 0
                    }
                    onChange={handleSelectAll}
                    className="um-checkbox"
                  />
                </th>
                <th>User</th>
                <th>Status</th>
                <th>Location</th>
                <th>Joined Date</th>
                <th>Last Active</th>
                <th>Revenue/Spent</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map((user) => (
                <UserRow
                  key={user.id}
                  user={user}
                  isSelected={selectedUsers.has(user.id)}
                  onSelect={handleSelectUser}
                  onViewDetails={(u) => setSlideOverUser(u)}
                  onProOverride={handleProOverride}
                />
              ))}
            </tbody>
          </table>
        ) : (
          <div className="um-empty-state">
            <SearchX size={64} />
            <h3>No users found</h3>
            <p>Try adjusting your filters</p>
            <button
              className="admin-btn admin-btn-primary"
              onClick={clearFilters}
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Pagination */}
      {paginatedUsers.length > 0 && (
        <div className="um-pagination">
          <div className="um-pagination-info">
            <span>Items per page:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          <div className="um-pagination-controls">
            <button
              className="um-pagination-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              <ChevronLeft size={18} />
              Previous
            </button>

            <div className="um-pagination-pages">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let page;
                if (totalPages <= 5) {
                  page = i + 1;
                } else if (currentPage <= 3) {
                  page = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  page = totalPages - 4 + i;
                } else {
                  page = currentPage - 2 + i;
                }
                return (
                  <button
                    key={page}
                    className={currentPage === page ? "active" : ""}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                );
              })}
              {totalPages > 5 && currentPage < totalPages - 2 && (
                <>
                  <span>...</span>
                  <button onClick={() => setCurrentPage(totalPages)}>
                    {totalPages}
                  </button>
                </>
              )}
            </div>

            <button
              className="um-pagination-btn"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Next
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* User Detail Slide-Over */}
      <UserDetailSlideOver
        user={slideOverUser}
        isOpen={!!slideOverUser}
        onClose={() => setSlideOverUser(null)}
      />

      {/* Pro Override Confirmation */}
      {proTarget && (
        <div
          className="um-slideover-overlay open"
          onClick={() => !proSubmitting && setProTarget(null)}
        >
          <div className="um-pro-modal" onClick={(e) => e.stopPropagation()}>
            <div className="um-pro-modal-header">
              <div className="um-pro-modal-icon">
                {proTarget.next ? (
                  <Zap size={20} className="fill-current" />
                ) : (
                  <X size={20} />
                )}
              </div>
              <div>
                <h3>{proTarget.next ? "Grant Pro plan" : "Revoke Pro plan"}</h3>
                <p>
                  {proTarget.user.name} · {proTarget.user.email}
                </p>
              </div>
            </div>

            <div className="um-pro-modal-body">
              {proTarget.next ? (
                <p className="um-pro-modal-warning">
                  This will manually set the freelancer to <strong>Pro</strong>{" "}
                  for <strong>365 days</strong> without a Razorpay payment. The
                  freelancer will get the Pro Member badge, top search priority,
                  and the Featured ribbon. Use this for support comps, beta
                  testers, or VIPs.
                </p>
              ) : (
                <p className="um-pro-modal-warning">
                  This will cancel any active Pro subscription for this
                  freelancer and clear the Pro Member badge, search priority,
                  and Featured ribbon. Use this for support refunds or reverts.
                </p>
              )}

              <label className="um-pro-modal-label">
                Reason (optional, for the audit log)
              </label>
              <textarea
                value={proReason}
                onChange={(e) => setProReason(e.target.value)}
                rows={3}
                maxLength={500}
                placeholder="e.g. Customer support comp — failed payment #razorpay_xyz"
                className="um-pro-modal-textarea"
              />
            </div>

            <div className="um-pro-modal-footer">
              <button
                className="admin-btn admin-btn-outline"
                onClick={() => setProTarget(null)}
                disabled={proSubmitting}
              >
                Cancel
              </button>
              <button
                className={`admin-btn ${proTarget.next ? "admin-btn-pro" : "admin-btn-danger"}`}
                onClick={submitProOverride}
                disabled={proSubmitting}
              >
                {proSubmitting ? (
                  "Working..."
                ) : proTarget.next ? (
                  <>
                    <Check size={14} />
                    Confirm grant
                  </>
                ) : (
                  <>
                    <X size={14} />
                    Confirm revoke
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {isAddUserModalOpen && (
        <div
          className="um-slideover-overlay open fixed inset-0 overflow-y-hidden flex items-center justify-center"
          onClick={() => !isSubmittingNewUser && setIsAddUserModalOpen(false)}
        >
          <div
            className="um-pro-modal mx-auto w-full max-w-md p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg"
            style={{}}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="um-pro-modal-header flex flex-col items-center text-center">
              <div className="um-pro-modal-icon">
                <UserPlus size={20} />
              </div>
              <div>
                <h3>Add New User</h3>
                <p>Create an active account immediately</p>
              </div>
            </div>

            <form onSubmit={handleAddUserSubmit}>
              <div
                className="um-pro-modal-body"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                <div style={{ display: "flex", gap: "1rem" }}>
                  <div style={{ flex: 1 }}>
                    <label className="um-pro-modal-label">First Name</label>
                    <input
                      required
                      type="text"
                      className="um-search-input w-full"
                      value={newUserData.firstName}
                      onChange={(e) =>
                        setNewUserData({
                          ...newUserData,
                          firstName: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label className="um-pro-modal-label">Last Name</label>
                    <input
                      required
                      type="text"
                      className="um-search-input w-full"
                      value={newUserData.lastName}
                      onChange={(e) =>
                        setNewUserData({
                          ...newUserData,
                          lastName: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="um-pro-modal-label">Email</label>
                  <input
                    required
                    type="email"
                    className="um-search-input w-full"
                    value={newUserData.email}
                    onChange={(e) =>
                      setNewUserData({ ...newUserData, email: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="um-pro-modal-label">Phone</label>
                  <input
                    required
                    type="tel"
                    className="um-search-input w-full"
                    placeholder="10 digit number"
                    pattern="[0-9]{10}"
                    value={newUserData.phone}
                    onChange={(e) =>
                      setNewUserData({ ...newUserData, phone: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="um-pro-modal-label">Password</label>
                  <input
                    required
                    type="password"
                    className="um-search-input w-full"
                    value={newUserData.password}
                    onChange={(e) =>
                      setNewUserData({
                        ...newUserData,
                        password: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="um-pro-modal-label">Role</label>
                  <select
                    className="um-search-input w-full"
                    value={newUserData.role}
                    onChange={(e) =>
                      setNewUserData({ ...newUserData, role: e.target.value })
                    }
                    style={{
                      width: "100%",
                      padding: "0.5rem",
                      borderRadius: "0.375rem",
                      border: "1px solid var(--border-color)",
                      background: "var(--bg-secondary)",
                      color: "var(--text-primary)",
                    }}
                  >
                    <option value="client">Client</option>
                    <option value="freelancer">Freelancer</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div
                className="um-pro-modal-footer flex justify-center gap-4"
                style={{ marginTop: "1rem" }}
              >
                <button
                  type="button"
                  className="admin-btn admin-btn-outline"
                  onClick={() => setIsAddUserModalOpen(false)}
                  disabled={isSubmittingNewUser}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-btn admin-btn-primary"
                  disabled={isSubmittingNewUser}
                >
                  {isSubmittingNewUser ? "Creating..." : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default UserManagement;
