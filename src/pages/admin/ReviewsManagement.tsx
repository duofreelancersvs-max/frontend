import { useState, useEffect, useCallback } from "react";
import AdminLayout from "@/components/layouts/AdminLayout";
import { adminService } from "@/services";
import type { AdminReview, PaginationMeta } from "@/services";
import {
  Star,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Eye,
  EyeOff,
  Trash2,
  Flag,
  Loader2,
  MessageSquareText,
  CheckCircle,
} from "lucide-react";

const ReviewsManagement = () => {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);
  const limit = 15;

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = { page: currentPage, limit };
      if (statusFilter !== "all") params.status = statusFilter;
      if (ratingFilter !== "all") params.rating = parseInt(ratingFilter);
      if (searchQuery.trim()) params.search = searchQuery.trim();
      const data = await adminService.getAllReviews(params);
      setReviews(data.reviews || []);
      setPagination(data.pagination || null);
    } catch (err) {
      console.error("Failed to load reviews:", err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, statusFilter, ratingFilter]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);
  useEffect(() => { setCurrentPage(1); }, [searchQuery, statusFilter, ratingFilter]);

  const handleModerate = async (reviewId: string, action: "visible" | "hidden" | "flagged") => {
    try {
      setProcessing(reviewId);
      await adminService.moderateReview(reviewId, action);
      setActionMenuId(null);
      fetchReviews();
    } catch (err) {
      console.error("Failed to moderate review:", err);
    } finally {
      setProcessing(null);
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!window.confirm("Delete this review permanently? This action cannot be undone.")) return;
    try {
      setProcessing(reviewId);
      await adminService.deleteReview(reviewId);
      setActionMenuId(null);
      fetchReviews();
    } catch (err) {
      console.error("Failed to delete review:", err);
    } finally {
      setProcessing(null);
    }
  };

  const renderStars = (rating: number) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={14}
          className={star <= rating ? "fill-amber-400 text-amber-400" : "text-[#475569]"}
        />
      ))}
    </div>
  );

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const statsCards = [
    { label: "Total Reviews", value: pagination?.totalItems ?? reviews.length, icon: MessageSquareText, color: "indigo" },
    { label: "Flagged", value: reviews.filter(r => r.status === "flagged").length, icon: Flag, color: "rose" },
    { label: "Hidden", value: reviews.filter(r => r.status === "hidden").length, icon: EyeOff, color: "amber" },
    { label: "Visible", value: reviews.filter(r => r.status === "visible" || !r.status).length, icon: CheckCircle, color: "emerald" },
  ];

  return (
    <AdminLayout title="Reviews Management" breadcrumb="Moderate Reviews">
      <div className="admin-content">
        {/* Stats */}
        <div className="admin-metrics-grid" style={{ marginBottom: "1.5rem" }}>
          {statsCards.map((s) => (
            <div key={s.label} className={`um-stat-card ${s.color}`}>
              <div className="um-stat-icon"><s.icon size={20} /></div>
              <div className="um-stat-info">
                <div className="um-stat-value">{s.value}</div>
                <div className="um-stat-label">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="um-filter-bar" style={{ marginBottom: "1.25rem" }}>
          <div className="um-filter-row">
            <div className="um-search-wrapper" style={{ flex: 1, maxWidth: 320 }}>
              <Search size={18} className="um-search-icon" />
              <input
                type="text"
                placeholder="Search reviews..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="um-search-input"
              />
              {searchQuery && (
                <button className="um-search-clear" onClick={() => setSearchQuery("")}>
                  <X size={16} />
                </button>
              )}
            </div>
            <div className="um-filter-select">
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">All Status</option>
                <option value="visible">Visible</option>
                <option value="hidden">Hidden</option>
                <option value="flagged">Flagged</option>
              </select>
            </div>
            <div className="um-filter-select">
              <select value={ratingFilter} onChange={(e) => setRatingFilter(e.target.value)}>
                <option value="all">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="admin-card" style={{ padding: 0, overflow: "hidden" }}>
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "4rem 0" }}>
              <Loader2 size={32} style={{ color: "var(--admin-indigo)", animation: "spin 1s linear infinite" }} />
            </div>
          ) : reviews.length === 0 ? (
            <div style={{ textAlign: "center", padding: "4rem 1.5rem" }}>
              <MessageSquareText size={48} style={{ color: "var(--admin-cloud-gray)", margin: "0 auto 1rem", display: "block" }} />
              <p style={{ color: "var(--admin-white)", fontSize: "1.125rem", fontWeight: 600, marginBottom: "0.5rem" }}>No reviews found</p>
              <p style={{ color: "var(--admin-cloud-gray)", fontSize: "0.875rem" }}>Try adjusting your search or filter criteria.</p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="admin-table" style={{ minWidth: 800 }}>
                <thead>
                  <tr>
                    <th>Reviewer</th>
                    <th>Freelancer</th>
                    <th>Project</th>
                    <th>Rating</th>
                    <th>Review</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map((review) => {
                    const reviewerName = review.reviewerId?.fullName || review.reviewerId?.email || "Unknown";
                    const freelancerName = review.freelancerId?.fullName || review.freelancerId?.email || "Unknown";
                    const projectTitle = review.projectId?.title || "—";
                    const status = review.status || "visible";
                    const initials = (reviewerName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2));

                    return (
                      <tr key={review._id}>
                        <td>
                          <div className="um-user-cell">
                            <div className="um-user-avatar" style={{ width: 32, height: 32, fontSize: "0.75rem" }}>{initials}</div>
                            <div className="um-user-info">
                              <div className="um-user-name" style={{ fontSize: "0.8125rem" }}>{reviewerName}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ color: "var(--admin-cloud-gray)", fontSize: "0.875rem" }}>{freelancerName}</td>
                        <td style={{ color: "var(--admin-white)", fontSize: "0.875rem", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{projectTitle}</td>
                        <td>{renderStars(review.rating)}</td>
                        <td style={{ color: "var(--admin-cloud-gray)", fontSize: "0.8125rem", maxWidth: 250, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{review.review || "—"}</td>
                        <td>
                          <span className={`admin-status-badge ${status === "visible" ? "completed" : status === "flagged" ? "cancelled" : "pending"}`}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </span>
                        </td>
                        <td style={{ color: "var(--admin-cloud-gray)", fontSize: "0.8125rem" }}>{formatDate(review.createdAt)}</td>
                        <td>
                          <ActionMenu
                            reviewId={review._id}
                            status={status as "visible" | "hidden" | "flagged"}
                            actionMenuId={actionMenuId}
                            setActionMenuId={setActionMenuId}
                            onModerate={handleModerate}
                            onDelete={handleDelete}
                            processing={processing === review._id}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {pagination && pagination.totalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 1.5rem", borderTop: "1px solid var(--admin-border)" }}>
              <span style={{ color: "var(--admin-cloud-gray)", fontSize: "0.875rem" }}>
                Page {pagination.page} of {pagination.totalPages} ({pagination.totalItems} total)
              </span>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button className="admin-btn admin-btn-outline admin-btn-sm" disabled={currentPage <= 1} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}>
                  <ChevronLeft size={16} /> Prev
                </button>
                <button className="admin-btn admin-btn-outline admin-btn-sm" disabled={currentPage >= pagination.totalPages} onClick={() => setCurrentPage((p) => p + 1)}>
                  Next <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

const ActionMenu = ({
  reviewId, status, actionMenuId, setActionMenuId, onModerate, onDelete, processing
}: {
  reviewId: string; status: "visible" | "hidden" | "flagged";
  actionMenuId: string | null; setActionMenuId: (id: string | null) => void;
  onModerate: (id: string, action: "visible" | "hidden" | "flagged") => void;
  onDelete: (id: string) => void; processing: boolean;
}) => {
  return (
    <div className="um-actions-wrapper" style={{ position: "relative", display: "flex", justifyContent: "flex-end" }}>
      <button className="um-actions-btn" onClick={() => setActionMenuId(actionMenuId === reviewId ? null : reviewId)}>
        <MoreHorizontal size={18} />
      </button>
      {actionMenuId === reviewId && (
        <div className="um-actions-dropdown" style={{ right: 0, left: "auto" }}>
          {status !== "visible" && (
            <button onClick={() => onModerate(reviewId, "visible")} disabled={processing}>
              <Eye size={14} /> Show Review
            </button>
          )}
          {status !== "hidden" && (
            <button onClick={() => onModerate(reviewId, "hidden")} disabled={processing}>
              <EyeOff size={14} /> Hide Review
            </button>
          )}
          {status !== "flagged" && (
            <button onClick={() => onModerate(reviewId, "flagged")} disabled={processing}>
              <Flag size={14} /> Flag Review
            </button>
          )}
          <div className="um-actions-divider"></div>
          <button className="danger" onClick={() => onDelete(reviewId)} disabled={processing}>
            {processing ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Trash2 size={14} />}
            {processing ? "Deleting…" : "Delete Review"}
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewsManagement;