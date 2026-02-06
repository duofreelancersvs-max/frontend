import { useState, useEffect } from "react";
import AdminLayout from "@/components/layouts/AdminLayout";
import {
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  CreditCard,
  Briefcase,
  Building2,
  Filter,
  LayoutGrid,
  List,
  Columns,
  ChevronDown,
  Eye,
  Check,
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Calendar,
  AlertTriangle,
  MessageSquare,
  Crown,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

// ============ TYPES ============

interface VerificationItem {
  id: string;
  freelancerName: string;
  freelancerInitials: string;
  freelancerEmail: string;
  freelancerLocation: string;
  isPremiumApplicant: boolean;
  documentType: "aadhaar" | "pan" | "portfolio" | "gst";
  documentNumber: string;
  submittedAt: string;
  submittedDate: string;
  status: "pending" | "approved" | "rejected";
  isUrgent: boolean;
  documentImage: string;
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

type ViewMode = "list" | "grid" | "kanban";
type DocumentFilter = "all" | "aadhaar" | "pan" | "portfolio" | "gst";
type DateFilter = "today" | "week" | "month";
type SortOrder = "newest" | "oldest";

// ============ MOCK DATA ============

const mockVerifications: VerificationItem[] = [
  {
    id: "1",
    freelancerName: "Vikram Patel",
    freelancerInitials: "VP",
    freelancerEmail: "vikram.p@gmail.com",
    freelancerLocation: "Hyderabad, TG",
    isPremiumApplicant: true,
    documentType: "aadhaar",
    documentNumber: "****4523",
    submittedAt: "2 hours ago",
    submittedDate: "Feb 6, 2024",
    status: "pending",
    isUrgent: true,
    documentImage: "/placeholder-doc.png",
  },
  {
    id: "2",
    freelancerName: "Sneha Reddy",
    freelancerInitials: "SR",
    freelancerEmail: "sneha.reddy@outlook.com",
    freelancerLocation: "Vijayawada, AP",
    isPremiumApplicant: false,
    documentType: "pan",
    documentNumber: "****7891",
    submittedAt: "3 hours ago",
    submittedDate: "Feb 6, 2024",
    status: "pending",
    isUrgent: false,
    documentImage: "/placeholder-doc.png",
  },
  {
    id: "3",
    freelancerName: "Arjun Singh",
    freelancerInitials: "AS",
    freelancerEmail: "arjun.singh@gmail.com",
    freelancerLocation: "Secunderabad, TG",
    isPremiumApplicant: true,
    documentType: "portfolio",
    documentNumber: "N/A",
    submittedAt: "5 hours ago",
    submittedDate: "Feb 6, 2024",
    status: "pending",
    isUrgent: false,
    documentImage: "/placeholder-doc.png",
  },
  {
    id: "4",
    freelancerName: "Meera Krishnan",
    freelancerInitials: "MK",
    freelancerEmail: "meera.k@creative.io",
    freelancerLocation: "Guntur, AP",
    isPremiumApplicant: false,
    documentType: "gst",
    documentNumber: "****9876",
    submittedAt: "6 hours ago",
    submittedDate: "Feb 6, 2024",
    status: "pending",
    isUrgent: true,
    documentImage: "/placeholder-doc.png",
  },
  {
    id: "5",
    freelancerName: "Rahul Sharma",
    freelancerInitials: "RS",
    freelancerEmail: "rahul.sharma@gmail.com",
    freelancerLocation: "Hyderabad, TG",
    isPremiumApplicant: false,
    documentType: "aadhaar",
    documentNumber: "****3456",
    submittedAt: "1 day ago",
    submittedDate: "Feb 5, 2024",
    status: "approved",
    isUrgent: false,
    documentImage: "/placeholder-doc.png",
    reviewedBy: "Super Admin",
    reviewedAt: "Feb 5, 2024 at 4:30 PM",
  },
  {
    id: "6",
    freelancerName: "Priya Menon",
    freelancerInitials: "PM",
    freelancerEmail: "priya.menon@outlook.com",
    freelancerLocation: "Visakhapatnam, AP",
    isPremiumApplicant: true,
    documentType: "pan",
    documentNumber: "****5678",
    submittedAt: "1 day ago",
    submittedDate: "Feb 5, 2024",
    status: "rejected",
    isUrgent: false,
    documentImage: "/placeholder-doc.png",
    rejectionReason: "Document unclear",
    reviewedBy: "Super Admin",
    reviewedAt: "Feb 5, 2024 at 3:15 PM",
  },
  {
    id: "7",
    freelancerName: "Kavitha Nair",
    freelancerInitials: "KN",
    freelancerEmail: "kavitha.nair@gmail.com",
    freelancerLocation: "Tirupati, AP",
    isPremiumApplicant: false,
    documentType: "portfolio",
    documentNumber: "N/A",
    submittedAt: "8 hours ago",
    submittedDate: "Feb 6, 2024",
    status: "pending",
    isUrgent: false,
    documentImage: "/placeholder-doc.png",
  },
  {
    id: "8",
    freelancerName: "Ravi Teja",
    freelancerInitials: "RT",
    freelancerEmail: "ravi.teja@filmworks.com",
    freelancerLocation: "Hyderabad, TG",
    isPremiumApplicant: true,
    documentType: "gst",
    documentNumber: "****2468",
    submittedAt: "10 hours ago",
    submittedDate: "Feb 6, 2024",
    status: "pending",
    isUrgent: false,
    documentImage: "/placeholder-doc.png",
  },
];

const recentDecisions = [
  {
    id: "1",
    freelancer: "Rahul Sharma",
    document: "Aadhaar",
    decision: "Approved",
    admin: "Super Admin",
    time: "Feb 5, 4:30 PM",
  },
  {
    id: "2",
    freelancer: "Priya Menon",
    document: "PAN Card",
    decision: "Rejected",
    admin: "Super Admin",
    time: "Feb 5, 3:15 PM",
  },
  {
    id: "3",
    freelancer: "Amit Kumar",
    document: "Portfolio",
    decision: "Approved",
    admin: "Super Admin",
    time: "Feb 5, 2:00 PM",
  },
  {
    id: "4",
    freelancer: "Neha Gupta",
    document: "GST Certificate",
    decision: "Approved",
    admin: "Super Admin",
    time: "Feb 5, 11:45 AM",
  },
  {
    id: "5",
    freelancer: "Suresh Patel",
    document: "Aadhaar",
    decision: "Rejected",
    admin: "Super Admin",
    time: "Feb 4, 5:30 PM",
  },
];

const rejectionReasons = [
  "Document unclear or illegible",
  "Information mismatch with profile",
  "Invalid or expired document",
  "Suspected fraudulent document",
  "Document not as specified type",
  "Other (specify in notes)",
];

// ============ COMPONENTS ============

const StatCard = ({
  stat,
}: {
  stat: {
    label: string;
    value: number;
    color: "amber" | "emerald" | "rose";
    icon: LucideIcon;
    pulse?: boolean;
  };
}) => {
  const Icon = stat.icon;
  return (
    <div className={`vq-stat-card ${stat.color}`}>
      <div className="vq-stat-icon">
        <Icon size={22} />
        {stat.pulse && <span className="vq-pulse-dot"></span>}
      </div>
      <div className="vq-stat-info">
        <div className="vq-stat-value">{stat.value}</div>
        <div className="vq-stat-label">{stat.label}</div>
      </div>
    </div>
  );
};

const DocumentBadge = ({
  type,
}: {
  type: VerificationItem["documentType"];
}) => {
  const config = {
    aadhaar: { label: "Aadhaar", className: "indigo", icon: CreditCard },
    pan: { label: "PAN Card", className: "cyan", icon: FileText },
    portfolio: { label: "Portfolio", className: "violet", icon: Briefcase },
    gst: { label: "GST", className: "emerald", icon: Building2 },
  };
  const { label, className, icon: Icon } = config[type];
  return (
    <span className={`vq-doc-badge ${className}`}>
      <Icon size={12} />
      {label}
    </span>
  );
};

const StatusBadge = ({ status }: { status: VerificationItem["status"] }) => {
  const config = {
    pending: { label: "Pending", className: "amber" },
    approved: { label: "Approved", className: "emerald" },
    rejected: { label: "Rejected", className: "rose" },
  };
  const { label, className } = config[status];
  return <span className={`vq-status-badge ${className}`}>{label}</span>;
};

const VerificationCard = ({
  item,
  isSelected,
  onSelect,
  onReview,
  onQuickApprove,
  onQuickReject,
}: {
  item: VerificationItem;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onReview: (item: VerificationItem) => void;
  onQuickApprove: (id: string) => void;
  onQuickReject: (id: string) => void;
}) => {
  return (
    <div className={`vq-card ${item.status} ${isSelected ? "selected" : ""}`}>
      <div className={`vq-card-stripe ${item.status}`}></div>

      {/* Header */}
      <div className="vq-card-header">
        <DocumentBadge type={item.documentType} />
        <div className="vq-card-meta">
          {item.isUrgent && (
            <span className="vq-urgent-badge">
              <AlertTriangle size={12} />
              Urgent
            </span>
          )}
          <span className="vq-time">{item.submittedAt}</span>
        </div>
      </div>

      {/* Freelancer Info */}
      <div className="vq-freelancer">
        <div className="vq-avatar">{item.freelancerInitials}</div>
        <div className="vq-freelancer-info">
          <div className="vq-freelancer-name">{item.freelancerName}</div>
          {item.isPremiumApplicant && (
            <span className="vq-premium-badge">
              <Crown size={12} />
              Premium Applicant
            </span>
          )}
        </div>
        {item.status === "pending" && (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelect(item.id)}
            className="vq-checkbox"
          />
        )}
      </div>

      {/* Document Preview */}
      <div className="vq-doc-preview" onClick={() => onReview(item)}>
        <div className="vq-doc-placeholder">
          <FileText size={32} />
          <span>Document Preview</span>
        </div>
        <div className="vq-doc-overlay">
          <Eye size={20} />
          <span>Click to review</span>
        </div>
      </div>

      {/* Quick Info */}
      <div className="vq-quick-info">
        <div className="vq-info-row">
          <span className="vq-info-label">Doc Number:</span>
          <span className="vq-info-value">{item.documentNumber}</span>
        </div>
        <div className="vq-info-row">
          <MapPin size={14} />
          <span className="vq-info-value">{item.freelancerLocation}</span>
        </div>
      </div>

      {/* Actions */}
      {item.status === "pending" ? (
        <div className="vq-card-actions">
          <button className="vq-review-btn" onClick={() => onReview(item)}>
            <Eye size={16} />
            Review
          </button>
          <div className="vq-quick-actions">
            <button
              className="vq-quick-btn approve"
              onClick={() => onQuickApprove(item.id)}
              title="Quick Approve"
            >
              <Check size={16} />
            </button>
            <button
              className="vq-quick-btn reject"
              onClick={() => onQuickReject(item.id)}
              title="Quick Reject"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ) : (
        <div className="vq-decision-info">
          <StatusBadge status={item.status} />
          <span className="vq-reviewed-by">by {item.reviewedBy}</span>
        </div>
      )}
    </div>
  );
};

const ReviewModal = ({
  item,
  isOpen,
  onClose,
  onApprove,
  onRequestInfo,
  onReject,
}: {
  item: VerificationItem | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (id: string) => void;
  onRequestInfo: (id: string) => void;
  onReject: (id: string, reason: string, notes: string) => void;
}) => {
  const [checklist, setChecklist] = useState({
    visible: false,
    nameMatch: false,
    valid: false,
    photoMatch: false,
  });
  const [adminNotes, setAdminNotes] = useState("");
  const [selectedReason, setSelectedReason] = useState("");
  const [showRejectOptions, setShowRejectOptions] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setChecklist({
        visible: false,
        nameMatch: false,
        valid: false,
        photoMatch: false,
      });
      setAdminNotes("");
      setSelectedReason("");
      setShowRejectOptions(false);
      setZoom(1);
      setShowConfetti(false);
    }
  }, [isOpen, item]);

  if (!item) return null;

  const allChecked = Object.values(checklist).every(Boolean);

  const handleApprove = () => {
    setShowConfetti(true);
    setTimeout(() => {
      onApprove(item.id);
      setShowConfetti(false);
    }, 1500);
  };

  const handleReject = () => {
    if (selectedReason) {
      onReject(item.id, selectedReason, adminNotes);
    }
  };

  return (
    <div
      className={`vq-modal-overlay ${isOpen ? "open" : ""}`}
      onClick={onClose}
    >
      <div
        className={`vq-modal ${isOpen ? "open" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        {showConfetti && (
          <div className="vq-confetti">
            {Array.from({ length: 50 }).map((_, i) => (
              <div
                key={i}
                className="vq-confetti-piece"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 0.5}s`,
                  backgroundColor: ["#10B981", "#6366F1", "#06B6D4", "#F59E0B"][
                    Math.floor(Math.random() * 4)
                  ],
                }}
              ></div>
            ))}
          </div>
        )}

        {/* Left - Document Viewer */}
        <div className="vq-modal-viewer">
          <div className="vq-viewer-header">
            <div className="vq-viewer-title">
              <DocumentBadge type={item.documentType} />
              <span>Submitted {item.submittedDate}</span>
            </div>
            <div className="vq-viewer-controls">
              <button onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}>
                <ZoomOut size={18} />
              </button>
              <span>{Math.round(zoom * 100)}%</span>
              <button onClick={() => setZoom((z) => Math.min(2, z + 0.25))}>
                <ZoomIn size={18} />
              </button>
              <button onClick={() => setZoom(1)}>
                <RotateCw size={18} />
              </button>
            </div>
          </div>
          <div className="vq-viewer-content">
            <div
              className="vq-document-display"
              style={{ transform: `scale(${zoom})` }}
            >
              <div className="vq-doc-placeholder-large">
                <FileText size={64} />
                <span>{item.documentType.toUpperCase()} Document</span>
                <span className="vq-doc-number">
                  Number: {item.documentNumber}
                </span>
              </div>
            </div>
          </div>
          <div className="vq-viewer-nav">
            <button disabled>
              <ChevronLeft size={18} />
              Previous
            </button>
            <span>1 of 1</span>
            <button disabled>
              Next
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Right - Verification Panel */}
        <div className="vq-modal-panel">
          <button className="vq-modal-close" onClick={onClose}>
            <X size={20} />
          </button>

          {/* Freelancer Summary */}
          <div className="vq-panel-summary">
            <div className="vq-panel-avatar">{item.freelancerInitials}</div>
            <div className="vq-panel-info">
              <h3>{item.freelancerName}</h3>
              <p>{item.freelancerEmail}</p>
              <div className="vq-panel-badges">
                {item.isPremiumApplicant && (
                  <span className="vq-premium-badge">
                    <Crown size={12} />
                    Premium Applicant
                  </span>
                )}
                <span className="vq-location-badge">
                  <MapPin size={12} />
                  {item.freelancerLocation}
                </span>
              </div>
            </div>
          </div>

          {/* Verification Checklist */}
          <div className="vq-checklist">
            <h4>Verification Checklist</h4>
            <label className={checklist.visible ? "checked" : ""}>
              <input
                type="checkbox"
                checked={checklist.visible}
                onChange={(e) =>
                  setChecklist({ ...checklist, visible: e.target.checked })
                }
              />
              <span className="checkmark"></span>
              Document is clearly visible
            </label>
            <label className={checklist.nameMatch ? "checked" : ""}>
              <input
                type="checkbox"
                checked={checklist.nameMatch}
                onChange={(e) =>
                  setChecklist({ ...checklist, nameMatch: e.target.checked })
                }
              />
              <span className="checkmark"></span>
              Name matches profile
            </label>
            <label className={checklist.valid ? "checked" : ""}>
              <input
                type="checkbox"
                checked={checklist.valid}
                onChange={(e) =>
                  setChecklist({ ...checklist, valid: e.target.checked })
                }
              />
              <span className="checkmark"></span>
              Document is valid (not expired)
            </label>
            <label className={checklist.photoMatch ? "checked" : ""}>
              <input
                type="checkbox"
                checked={checklist.photoMatch}
                onChange={(e) =>
                  setChecklist({ ...checklist, photoMatch: e.target.checked })
                }
              />
              <span className="checkmark"></span>
              Photo matches profile picture
            </label>
          </div>

          {/* AI Suggestion */}
          <div className="vq-ai-suggestion">
            <Sparkles size={16} />
            <div>
              <span className="vq-ai-label">AI Analysis</span>
              <p>Document appears valid (98% confidence)</p>
            </div>
          </div>

          {/* Admin Notes */}
          <div className="vq-admin-notes">
            <h4>Admin Notes</h4>
            <textarea
              placeholder="Add notes about this verification..."
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
            ></textarea>
          </div>

          {/* Rejection Options */}
          {showRejectOptions && (
            <div className="vq-reject-options">
              <h4>Rejection Reason</h4>
              <select
                value={selectedReason}
                onChange={(e) => setSelectedReason(e.target.value)}
              >
                <option value="">Select a reason...</option>
                {rejectionReasons.map((reason) => (
                  <option key={reason} value={reason}>
                    {reason}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Action Buttons */}
          <div className="vq-panel-actions">
            <button
              className="vq-action-btn approve"
              onClick={handleApprove}
              disabled={!allChecked}
            >
              <CheckCircle size={18} />
              Approve & Grant Badge
            </button>
            <button
              className="vq-action-btn request"
              onClick={() => onRequestInfo(item.id)}
            >
              <MessageSquare size={18} />
              Request More Info
            </button>
            {!showRejectOptions ? (
              <button
                className="vq-action-btn reject-outline"
                onClick={() => setShowRejectOptions(true)}
              >
                <XCircle size={18} />
                Reject
              </button>
            ) : (
              <button
                className="vq-action-btn reject"
                onClick={handleReject}
                disabled={!selectedReason}
              >
                <XCircle size={18} />
                Confirm Rejection
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============ MAIN COMPONENT ============

const VerificationQueue = () => {
  const [items, setItems] = useState<VerificationItem[]>(mockVerifications);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [documentFilter, setDocumentFilter] = useState<DocumentFilter>("all");
  const [dateFilter, setDateFilter] = useState<DateFilter>("week");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const [reviewItem, setReviewItem] = useState<VerificationItem | null>(null);
  const [activeTab, setActiveTab] = useState<"queue" | "history">("queue");

  const pendingCount = items.filter((i) => i.status === "pending").length;
  const approvedToday = items.filter((i) => i.status === "approved").length;
  const rejectedToday = items.filter((i) => i.status === "rejected").length;

  const statsData = [
    {
      label: "Pending Review",
      value: pendingCount,
      color: "amber" as const,
      icon: Clock,
      pulse: true,
    },
    {
      label: "Approved Today",
      value: approvedToday,
      color: "emerald" as const,
      icon: CheckCircle,
    },
    {
      label: "Rejected Today",
      value: rejectedToday,
      color: "rose" as const,
      icon: XCircle,
    },
  ];

  const filteredItems = items.filter((item) => {
    if (documentFilter !== "all" && item.documentType !== documentFilter)
      return false;
    return true;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    // Pending first
    if (a.status === "pending" && b.status !== "pending") return -1;
    if (a.status !== "pending" && b.status === "pending") return 1;
    return 0;
  });

  const handleSelect = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const handleApprove = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: "approved" as const,
              reviewedBy: "Super Admin",
              reviewedAt: "Just now",
            }
          : item,
      ),
    );
    setReviewItem(null);
  };

  const handleReject = (id: string, reason: string, _notes: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: "rejected" as const,
              rejectionReason: reason,
              reviewedBy: "Super Admin",
              reviewedAt: "Just now",
            }
          : item,
      ),
    );
    setReviewItem(null);
  };

  const handleBulkApprove = () => {
    setItems((prev) =>
      prev.map((item) =>
        selectedItems.has(item.id)
          ? {
              ...item,
              status: "approved" as const,
              reviewedBy: "Super Admin",
              reviewedAt: "Just now",
            }
          : item,
      ),
    );
    setSelectedItems(new Set());
  };

  return (
    <AdminLayout title="Verification Queue" breadcrumb="Review Documents">
      {/* Page Header */}
      <div className="vq-page-header">
        <div className="vq-header-left">
          <h2>Verification Queue</h2>
          <p>Review and approve freelancer verifications</p>
        </div>
        <div className="vq-header-right">
          {selectedItems.size > 0 && (
            <button
              className="admin-btn admin-btn-primary"
              onClick={handleBulkApprove}
            >
              <CheckCircle size={18} />
              Bulk Approve ({selectedItems.size})
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="vq-stats-grid">
        {statsData.map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </div>

      {/* Tabs */}
      <div className="vq-tabs">
        <button
          className={activeTab === "queue" ? "active" : ""}
          onClick={() => setActiveTab("queue")}
        >
          <Clock size={16} />
          Queue
          <span className="vq-tab-count">{pendingCount}</span>
        </button>
        <button
          className={activeTab === "history" ? "active" : ""}
          onClick={() => setActiveTab("history")}
        >
          <Calendar size={16} />
          Recent Decisions
        </button>
      </div>

      {activeTab === "queue" ? (
        <>
          {/* Controls Bar */}
          <div className="vq-controls">
            <div className="vq-view-toggle">
              <button
                className={viewMode === "list" ? "active" : ""}
                onClick={() => setViewMode("list")}
              >
                <List size={18} />
              </button>
              <button
                className={viewMode === "grid" ? "active" : ""}
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid size={18} />
              </button>
              <button
                className={viewMode === "kanban" ? "active" : ""}
                onClick={() => setViewMode("kanban")}
              >
                <Columns size={18} />
              </button>
            </div>

            <div className="vq-filters">
              <div className="vq-filter-select">
                <Filter size={16} />
                <select
                  value={documentFilter}
                  onChange={(e) =>
                    setDocumentFilter(e.target.value as DocumentFilter)
                  }
                >
                  <option value="all">All Documents</option>
                  <option value="aadhaar">Aadhaar</option>
                  <option value="pan">PAN Card</option>
                  <option value="portfolio">Portfolio</option>
                  <option value="gst">GST Certificate</option>
                </select>
                <ChevronDown size={14} />
              </div>

              <div className="vq-filter-select">
                <Calendar size={16} />
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value as DateFilter)}
                >
                  <option value="today">Today</option>
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last 30 Days</option>
                </select>
                <ChevronDown size={14} />
              </div>

              <div className="vq-filter-select">
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
                <ChevronDown size={14} />
              </div>
            </div>
          </div>

          {/* Cards Grid */}
          <div className={`vq-cards-container ${viewMode}`}>
            {sortedItems.map((item) => (
              <VerificationCard
                key={item.id}
                item={item}
                isSelected={selectedItems.has(item.id)}
                onSelect={handleSelect}
                onReview={setReviewItem}
                onQuickApprove={handleApprove}
                onQuickReject={(id) => handleReject(id, "Quick rejection", "")}
              />
            ))}
          </div>
        </>
      ) : (
        /* History Tab */
        <div className="vq-history">
          <table className="vq-history-table">
            <thead>
              <tr>
                <th>Freelancer</th>
                <th>Document</th>
                <th>Decision</th>
                <th>Reviewed By</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {recentDecisions.map((decision) => (
                <tr key={decision.id}>
                  <td className="vq-history-name">{decision.freelancer}</td>
                  <td>{decision.document}</td>
                  <td>
                    <span
                      className={`vq-decision-badge ${decision.decision.toLowerCase()}`}
                    >
                      {decision.decision}
                    </span>
                  </td>
                  <td className="vq-history-admin">{decision.admin}</td>
                  <td className="vq-history-time">{decision.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Review Modal */}
      <ReviewModal
        item={reviewItem}
        isOpen={!!reviewItem}
        onClose={() => setReviewItem(null)}
        onApprove={handleApprove}
        onRequestInfo={(id) => {
          console.log("Request info for", id);
          setReviewItem(null);
        }}
        onReject={handleReject}
      />
    </AdminLayout>
  );
};

export default VerificationQueue;
