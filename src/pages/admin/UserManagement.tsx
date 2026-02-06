import { useState, useEffect, useRef } from "react";
import AdminLayout from "@/components/layouts/AdminLayout";
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
  Briefcase,
  Clock,
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
}

type TabType = "all" | "clients" | "freelancers" | "admins";

// ============ MOCK DATA ============

const mockUsers: User[] = [
  {
    id: "1",
    name: "Rahul Sharma",
    email: "rahul.sharma@gmail.com",
    phone: "+91 98765 43210",
    initials: "RS",
    role: "client",
    status: "active",
    location: "Hyderabad",
    state: "TG",
    joinedDate: "Jan 15, 2024",
    lastActive: "2 hours ago",
    lastActiveRecent: true,
    revenue: "₹1,45,000",
  },
  {
    id: "2",
    name: "Priya Menon",
    email: "priya.menon@outlook.com",
    phone: "+91 87654 32109",
    initials: "PM",
    role: "freelancer",
    status: "active",
    location: "Vijayawada",
    state: "AP",
    joinedDate: "Dec 8, 2023",
    lastActive: "5 minutes ago",
    lastActiveRecent: true,
    revenue: "₹2,85,000",
  },
  {
    id: "3",
    name: "Amit Kumar",
    email: "amit.kumar@yahoo.com",
    phone: "+91 76543 21098",
    initials: "AK",
    role: "freelancer",
    status: "pending",
    location: "Warangal",
    state: "TG",
    joinedDate: "Feb 1, 2024",
    lastActive: "1 day ago",
    lastActiveRecent: false,
    revenue: "₹0",
  },
  {
    id: "4",
    name: "Sneha Reddy",
    email: "sneha.reddy@gmail.com",
    phone: "+91 65432 10987",
    initials: "SR",
    role: "client",
    status: "suspended",
    location: "Visakhapatnam",
    state: "AP",
    joinedDate: "Nov 20, 2023",
    lastActive: "3 days ago",
    lastActiveRecent: false,
    revenue: "₹45,000",
  },
  {
    id: "5",
    name: "Vikram Patel",
    email: "vikram.p@techcorp.in",
    phone: "+91 54321 09876",
    initials: "VP",
    role: "client",
    status: "active",
    location: "Hyderabad",
    state: "TG",
    joinedDate: "Oct 5, 2023",
    lastActive: "30 minutes ago",
    lastActiveRecent: true,
    revenue: "₹3,20,000",
  },
  {
    id: "6",
    name: "Meera Krishnan",
    email: "meera.k@creative.io",
    phone: "+91 43210 98765",
    initials: "MK",
    role: "freelancer",
    status: "active",
    location: "Guntur",
    state: "AP",
    joinedDate: "Sep 12, 2023",
    lastActive: "1 hour ago",
    lastActiveRecent: true,
    revenue: "₹4,15,000",
  },
  {
    id: "7",
    name: "Super Admin",
    email: "admin@connectmeindia.com",
    phone: "+91 90000 00001",
    initials: "SA",
    role: "admin",
    status: "active",
    location: "Hyderabad",
    state: "TG",
    joinedDate: "Jan 1, 2023",
    lastActive: "Just now",
    lastActiveRecent: true,
    revenue: "—",
  },
  {
    id: "8",
    name: "Arjun Singh",
    email: "arjun.singh@motionlab.in",
    phone: "+91 32109 87654",
    initials: "AS",
    role: "freelancer",
    status: "active",
    location: "Secunderabad",
    state: "TG",
    joinedDate: "Aug 28, 2023",
    lastActive: "4 hours ago",
    lastActiveRecent: true,
    revenue: "₹1,95,000",
  },
  {
    id: "9",
    name: "Kavitha Nair",
    email: "kavitha.nair@gmail.com",
    phone: "+91 21098 76543",
    initials: "KN",
    role: "client",
    status: "pending",
    location: "Tirupati",
    state: "AP",
    joinedDate: "Feb 3, 2024",
    lastActive: "2 days ago",
    lastActiveRecent: false,
    revenue: "₹0",
  },
  {
    id: "10",
    name: "Ravi Teja",
    email: "ravi.teja@filmworks.com",
    phone: "+91 10987 65432",
    initials: "RT",
    role: "client",
    status: "active",
    location: "Hyderabad",
    state: "TG",
    joinedDate: "Jul 15, 2023",
    lastActive: "6 hours ago",
    lastActiveRecent: true,
    revenue: "₹5,60,000",
  },
];

const statsData = [
  {
    label: "Total Users",
    value: "2,840",
    color: "indigo" as const,
    icon: Users,
  },
  {
    label: "Active",
    value: "2,600",
    color: "emerald" as const,
    icon: Activity,
  },
  { label: "Pending", value: "120", color: "amber" as const, icon: Clock },
  { label: "Suspended", value: "45", color: "rose" as const, icon: Ban },
];

const tabsData: { key: TabType; label: string; count: number }[] = [
  { key: "all", label: "All Users", count: 2840 },
  { key: "clients", label: "Clients", count: 1680 },
  { key: "freelancers", label: "Freelancers", count: 1150 },
  { key: "admins", label: "Admins", count: 10 },
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

const UserRow = ({
  user,
  isSelected,
  onSelect,
  onViewDetails,
}: {
  user: User;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onViewDetails: (user: User) => void;
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
            <div className="um-user-name">{user.name}</div>
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
    {
      action: "Updated profile information",
      time: "2 hours ago",
      type: "info",
    },
    {
      action: "Completed project 'Brand Video Edit'",
      time: "1 day ago",
      type: "success",
    },
    {
      action: "Submitted verification documents",
      time: "3 days ago",
      type: "warning",
    },
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
                  <div className="value">12</div>
                  <div className="label">Projects</div>
                </div>
                <div className="um-slideover-stat">
                  <div className="value">4.8</div>
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
                <div className="um-project-item">
                  <Briefcase size={16} />
                  <div>
                    <p>Wedding Video Edit</p>
                    <span>Completed • ₹25,000</span>
                  </div>
                </div>
                <div className="um-project-item">
                  <Briefcase size={16} />
                  <div>
                    <p>Corporate Promo</p>
                    <span>In Progress • ₹45,000</span>
                  </div>
                </div>
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
  const [users] = useState<User[]>(mockUsers);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [slideOverUser, setSlideOverUser] = useState<User | null>(null);

  // Filter users based on active tab and filters
  const filteredUsers = users.filter((user) => {
    // Tab filter
    if (activeTab === "clients" && user.role !== "client") return false;
    if (activeTab === "freelancers" && user.role !== "freelancer") return false;
    if (activeTab === "admins" && user.role !== "admin") return false;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (
        !user.name.toLowerCase().includes(query) &&
        !user.email.toLowerCase().includes(query) &&
        !user.phone.includes(query)
      ) {
        return false;
      }
    }

    // Role filter
    if (roleFilter !== "all" && user.role !== roleFilter) return false;

    // Status filter
    if (statusFilter !== "all" && user.status !== statusFilter) return false;

    // Location filter
    if (locationFilter === "TG" && user.state !== "TG") return false;
    if (locationFilter === "AP" && user.state !== "AP") return false;

    return true;
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

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
  };

  const hasActiveFilters =
    searchQuery ||
    roleFilter !== "all" ||
    statusFilter !== "all" ||
    locationFilter !== "all";

  return (
    <AdminLayout title="User Management" breadcrumb="Manage Users">
      {/* Page Header */}
      <div className="um-page-header">
        <div className="um-header-left">
          <h2>User Management</h2>
          <p>Manage clients, freelancers, and admins</p>
        </div>
        <div className="um-header-right">
          <button className="admin-btn admin-btn-primary">
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
        {statsData.map((stat) => (
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

          <button className="um-date-picker">
            <Calendar size={16} />
            Date Range
          </button>

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
        {tabsData.map((tab) => (
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
    </AdminLayout>
  );
};

export default UserManagement;
