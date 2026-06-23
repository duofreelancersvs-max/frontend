import { useState, useEffect, useCallback } from "react";
import { adminService } from "@/services";
import type { AdminReport, PaginationMeta } from "@/services/admin.service";
import {
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Flag,
  Loader2,
  AlertTriangle,
  CheckCircle,
  EyeOff
} from "lucide-react";
import { Link } from "react-router-dom";

const ReportsManagement = () => {
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);
  const limit = 15;

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = { page: currentPage, limit };
      if (statusFilter !== "all") params.status = statusFilter;
      // We don't have search by keyword backend yet for reports, so we'll just skip passing searchQuery to API for now or handle it on frontend
      const data = await adminService.getReports(params);
      let loadedReports = data.reports || [];
      
      // Simple frontend search since backend search isn't implemented for reports
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        loadedReports = loadedReports.filter((r) => 
          r.reason.toLowerCase().includes(q) || 
          r.description.toLowerCase().includes(q) ||
          r.reporter?.email?.toLowerCase().includes(q) ||
          r.reportedUser?.email?.toLowerCase().includes(q)
        );
      }
      
      setReports(loadedReports);
      setPagination(data.pagination || null);
    } catch (err) {
      console.error("Failed to load reports:", err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, statusFilter]);

  useEffect(() => { fetchReports(); }, [fetchReports]);
  useEffect(() => { setCurrentPage(1); }, [searchQuery, statusFilter]);

  const handleUpdateStatus = async (reportId: string, status: "pending" | "reviewed" | "dismissed") => {
    try {
      setProcessing(reportId);
      await adminService.updateReportStatus(reportId, status);
      setActionMenuId(null);
      fetchReports();
    } catch (err) {
      console.error("Failed to update report status:", err);
    } finally {
      setProcessing(null);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const statsCards = [
    { label: "Total Reports", value: pagination?.totalItems ?? reports.length, icon: AlertTriangle, color: "indigo" },
    { label: "Pending", value: reports.filter(r => r.status === "pending").length, icon: Flag, color: "amber" },
    { label: "Reviewed", value: reports.filter(r => r.status === "reviewed").length, icon: CheckCircle, color: "emerald" },
    { label: "Dismissed", value: reports.filter(r => r.status === "dismissed").length, icon: EyeOff, color: "slate" },
  ];

  return (
    <>
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
                placeholder="Search reason or email..."
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
                <option value="pending">Pending</option>
                <option value="reviewed">Reviewed</option>
                <option value="dismissed">Dismissed</option>
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
          ) : reports.length === 0 ? (
            <div style={{ textAlign: "center", padding: "4rem 1.5rem" }}>
              <AlertTriangle size={48} style={{ color: "var(--admin-cloud-gray)", margin: "0 auto 1rem", display: "block" }} />
              <p style={{ color: "var(--admin-white)", fontSize: "1.125rem", fontWeight: 600, marginBottom: "0.5rem" }}>No reports found</p>
              <p style={{ color: "var(--admin-cloud-gray)", fontSize: "0.875rem" }}>There are no reports matching your filters.</p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="um-table admin-table-responsive" style={{ minWidth: 800 }}>
                <thead>
                  <tr>
                    <th>Reported User</th>
                    <th>Reporter</th>
                    <th>Reason</th>
                    <th>Description</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report) => {
                    const reportedName = report.reportedUser?.fullName || report.reportedUser?.email || "Unknown";
                    const reporterName = report.reporter?.fullName || report.reporter?.email || "Unknown";
                    const status = report.status || "pending";
                    const initials = (reportedName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2));

                    return (
                      <tr key={report._id}>
                        <td data-label="Reported User">
                          <div className="um-user-cell">
                            <div className="um-user-avatar" style={{ width: 32, height: 32, fontSize: "0.75rem" }}>
                                {report.reportedUser?.avatar ? (
                                    <img src={report.reportedUser.avatar} alt="avatar" className="w-full h-full object-cover rounded-full" />
                                ) : initials}
                            </div>
                            <div className="um-user-info">
                              <Link to={`/admin/users?search=${encodeURIComponent(report.reportedUser?.email || '')}`} className="um-user-name hover:underline" style={{ fontSize: "0.8125rem" }}>
                                {reportedName}
                              </Link>
                            </div>
                          </div>
                        </td>
                        <td data-label="Reporter">
                            <Link to={`/admin/users?search=${encodeURIComponent(report.reporter?.email || '')}`} className="hover:underline text-slate-300" style={{ fontSize: "0.875rem" }}>
                                {reporterName}
                            </Link>
                        </td>
                        <td data-label="Reason" style={{ color: "var(--admin-white)", fontSize: "0.875rem", fontWeight: 500 }}>{report.reason}</td>
                        <td data-label="Description">
                          <span style={{ color: "var(--admin-cloud-gray)", fontSize: "0.8125rem", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "inline-block", verticalAlign: "bottom" }}>
                            {report.description || "—"}
                          </span>
                        </td>
                        <td data-label="Date" style={{ color: "var(--admin-cloud-gray)", fontSize: "0.8125rem" }}>{formatDate(report.createdAt)}</td>
                        <td data-label="Status">
                          <span className={`admin-status-badge ${status === "reviewed" ? "completed" : status === "dismissed" ? "cancelled" : "pending"}`}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </span>
                        </td>
                        <td data-label="Actions">
                          <ActionMenu
                            reportId={report._id}
                            status={status as "pending" | "reviewed" | "dismissed"}
                            actionMenuId={actionMenuId}
                            setActionMenuId={setActionMenuId}
                            onUpdateStatus={handleUpdateStatus}
                            processing={processing === report._id}
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
    </>
  );
};

const ActionMenu = ({
  reportId, status, actionMenuId, setActionMenuId, onUpdateStatus, processing
}: {
  reportId: string; status: "pending" | "reviewed" | "dismissed";
  actionMenuId: string | null; setActionMenuId: (id: string | null) => void;
  onUpdateStatus: (id: string, action: "pending" | "reviewed" | "dismissed") => void;
  processing: boolean;
}) => {
  return (
    <div className="um-actions-wrapper" style={{ position: "relative", display: "flex", justifyContent: "flex-end" }}>
      <button className="um-actions-btn" onClick={() => setActionMenuId(actionMenuId === reportId ? null : reportId)}>
        {processing ? <Loader2 size={18} className="animate-spin" /> : <MoreHorizontal size={18} />}
      </button>
      {actionMenuId === reportId && !processing && (
        <div className="um-actions-dropdown" style={{ right: 0, left: "auto", minWidth: "150px" }}>
          {status !== "pending" && (
            <button onClick={() => onUpdateStatus(reportId, "pending")}>
              <Flag size={14} /> Mark Pending
            </button>
          )}
          {status !== "reviewed" && (
            <button onClick={() => onUpdateStatus(reportId, "reviewed")} style={{ color: "var(--admin-emerald)" }}>
              <CheckCircle size={14} /> Mark Reviewed
            </button>
          )}
          {status !== "dismissed" && (
            <button onClick={() => onUpdateStatus(reportId, "dismissed")} style={{ color: "var(--admin-rose)" }}>
              <EyeOff size={14} /> Dismiss Report
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ReportsManagement;
