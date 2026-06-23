import { useState, useEffect, useCallback } from "react";
import { adminService } from "@/services";
import type { AdminApplication, PaginationMeta } from "@/services";
import {
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Eye,
  CheckCircle,
  XCircle,
  Loader2,
  FileText,
  Clock,
} from "lucide-react";

const ApplicationsManagement = () => {
  const [applications, setApplications] = useState<AdminApplication[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);
  const [viewApplication, setViewApplication] = useState<AdminApplication | null>(null);
  const limit = 15;

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = { page: currentPage, limit };
      if (statusFilter !== "all") params.status = statusFilter;
      if (searchQuery.trim()) params.search = searchQuery.trim();
      const data = await adminService.getAllApplications(params);
      setApplications(data.applications || []);
      setPagination(data.pagination || null);
    } catch (err) {
      console.error("Failed to load applications:", err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, statusFilter]);

  useEffect(() => { fetchApplications(); }, [fetchApplications]);
  useEffect(() => { setCurrentPage(1); }, [searchQuery, statusFilter]);

  const handleUpdateStatus = async (applicationId: string, status: string) => {
    try {
      setProcessing(applicationId);
      await adminService.updateApplicationStatus(applicationId, status);
      setActionMenuId(null);
      fetchApplications();
    } catch (err) {
      console.error("Failed to update application:", err);
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

  const StatusBadge = ({ status }: { status: string }) => {
    const config: Record<string, { label: string; className: string }> = {
      pending: { label: "Pending", className: "pending" },
      accepted: { label: "Accepted", className: "completed" },
      rejected: { label: "Rejected", className: "cancelled" },
      withdrawn: { label: "Withdrawn", className: "pending" },
    };
    const c = config[status] || { label: status, className: "pending" };
    return <span className={`admin-status-badge ${c.className}`}>{c.label}</span>;
  };

  const stats = [
    { label: "Total Applications", value: pagination?.totalItems ?? applications.length, icon: FileText, color: "indigo" },
    { label: "Pending", value: applications.filter(a => a.status === "pending").length, icon: Clock, color: "amber" },
    { label: "Accepted", value: applications.filter(a => a.status === "accepted").length, icon: CheckCircle, color: "emerald" },
    { label: "Rejected", value: applications.filter(a => a.status === "rejected").length, icon: XCircle, color: "rose" },
  ];

  return (
    <>
      <div className="admin-content">
        <div className="admin-metrics-grid" style={{ marginBottom: "1.5rem" }}>
          {stats.map((s) => (
            <div key={s.label} className={`um-stat-card ${s.color}`}>
              <div className="um-stat-icon"><s.icon size={20} /></div>
              <div className="um-stat-info">
                <div className="um-stat-value">{s.value}</div>
                <div className="um-stat-label">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="um-filter-bar" style={{ marginBottom: "1.25rem" }}>
          <div className="um-filter-row">
            <div className="um-search-wrapper" style={{ flex: 1, maxWidth: 320 }}>
              <Search size={18} className="um-search-icon" />
              <input
                type="text"
                placeholder="Search applications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="um-search-input"
              />
              {searchQuery && (
                <button className="um-search-clear" onClick={() => setSearchQuery("")}><X size={16} /></button>
              )}
            </div>
            <div className="um-filter-select">
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
                <option value="withdrawn">Withdrawn</option>
              </select>
            </div>
          </div>
        </div>

        <div className="admin-card" style={{ padding: 0, overflow: "hidden" }}>
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "4rem 0" }}>
              <Loader2 size={32} style={{ color: "var(--admin-indigo)", animation: "spin 1s linear infinite" }} />
            </div>
          ) : applications.length === 0 ? (
            <div style={{ textAlign: "center", padding: "4rem 1.5rem" }}>
              <FileText size={48} style={{ color: "var(--admin-cloud-gray)", margin: "0 auto 1rem", display: "block" }} />
              <p style={{ color: "var(--admin-white)", fontSize: "1.125rem", fontWeight: 600, marginBottom: "0.5rem" }}>No applications found</p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="um-table admin-table-responsive" style={{ minWidth: 900 }}>
                <thead>
                  <tr>
                    <th>Freelancer</th>
                    <th>Project</th>
                    <th>Client</th>
                    <th>Rate</th>
                    <th>Status</th>
                    <th>Applied</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => {
                    const freelancerName = app.freelancerId?.fullName || app.freelancerId?.email || "Unknown";
                    const clientName = app.projectId?.clientId?.fullName || app.projectId?.clientId?.email || "Unknown";
                    const initials = freelancerName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
                    return (
                      <tr key={app._id}>
                        <td data-label="Freelancer">
                          <div className="um-user-cell">
                            <div className="um-user-avatar" style={{ width: 32, height: 32, fontSize: "0.75rem" }}>{initials}</div>
                            <div className="um-user-info">
                              <div className="um-user-name" style={{ fontSize: "0.8125rem" }}>{freelancerName}</div>
                            </div>
                          </div>
                        </td>
                        <td data-label="Project">
                          <span style={{ color: "var(--admin-white)", fontSize: "0.875rem", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "inline-block", verticalAlign: "bottom" }}>
                            {app.projectId?.title || "—"}
                          </span>
                        </td>
                        <td data-label="Client" style={{ color: "var(--admin-cloud-gray)", fontSize: "0.875rem" }}>{clientName}</td>
                        <td data-label="Rate" style={{ color: "var(--admin-white)", fontWeight: 500, fontSize: "0.875rem" }}>
                          {app.proposedRate ? `₹${app.proposedRate.toLocaleString()}` : "—"}
                        </td>
                        <td data-label="Status"><StatusBadge status={app.status} /></td>
                        <td data-label="Applied" style={{ color: "var(--admin-cloud-gray)", fontSize: "0.8125rem" }}>{formatDate(app.createdAt)}</td>
                        <td data-label="Actions">
                          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.375rem" }}>
                            <button
                              className="um-actions-btn"
                              onClick={() => setViewApplication(app)}
                              title="View Details"
                            >
                              <Eye size={16} />
                            </button>
                            <ActionMenu
                              applicationId={app._id}
                              status={app.status}
                              actionMenuId={actionMenuId}
                              setActionMenuId={setActionMenuId}
                              onUpdateStatus={handleUpdateStatus}
                              processing={processing === app._id}
                            />
                          </div>
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

      {/* View Modal */}
      {viewApplication && (
        <div className="um-slideover-overlay open" onClick={() => setViewApplication(null)}>
          <div className="um-slideover open" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 560 }}>
            <div className="um-slideover-header" style={{ borderBottom: "1px solid var(--admin-border)", paddingBottom: "1rem" }}>
              <button className="um-slideover-close" onClick={() => setViewApplication(null)}><X size={20} /></button>
              <h3 style={{ color: "var(--admin-white)", fontSize: "1.25rem", fontWeight: 700 }}>Application Details</h3>
            </div>
            <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem", overflowY: "auto", flex: 1 }}>
              <DetailRow label="Freelancer" value={viewApplication.freelancerId?.fullName || viewApplication.freelancerId?.email || "Unknown"} />
              <DetailRow label="Project" value={viewApplication.projectId?.title || "—"} />
              <DetailRow label="Client" value={viewApplication.projectId?.clientId?.fullName || viewApplication.projectId?.clientId?.email || "Unknown"} />
              <DetailRow label="Proposed Rate" value={viewApplication.proposedRate ? `₹${viewApplication.proposedRate.toLocaleString()}` : "—"} />
              <DetailRow label="Status" value={viewApplication.status.charAt(0).toUpperCase() + viewApplication.status.slice(1)} />
              <DetailRow label="Applied On" value={formatDate(viewApplication.createdAt)} />
              {viewApplication.coverLetter && (
                <div>
                  <span style={{ color: "var(--admin-cloud-gray)", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>Cover Letter</span>
                  <p style={{ color: "var(--admin-white)", fontSize: "0.875rem", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{viewApplication.coverLetter}</p>
                </div>
              )}
            </div>
            <div style={{ padding: "1rem 1.5rem", borderTop: "1px solid var(--admin-border)", display: "flex", gap: "0.75rem" }}>
              {viewApplication.status === "pending" && (
                <>
                  <button className="admin-btn admin-btn-primary admin-btn-sm" style={{ flex: 1 }} onClick={() => { handleUpdateStatus(viewApplication._id, "accepted"); setViewApplication(null); }}>
                    <CheckCircle size={14} /> Accept
                  </button>
                  <button className="admin-btn admin-btn-outline admin-btn-sm" style={{ flex: 1, color: "var(--admin-rose)", borderColor: "var(--admin-rose)" }} onClick={() => { handleUpdateStatus(viewApplication._id, "rejected"); setViewApplication(null); }}>
                    <XCircle size={14} /> Reject
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const ActionMenu = ({
  applicationId, status, actionMenuId, setActionMenuId, onUpdateStatus, processing
}: {
  applicationId: string; status: string;
  actionMenuId: string | null; setActionMenuId: (id: string | null) => void;
  onUpdateStatus: (id: string, status: string) => void; processing: boolean;
}) => {
  return (
    <div className="um-actions-wrapper" style={{ position: "relative" }}>
      <button className="um-actions-btn" onClick={() => setActionMenuId(actionMenuId === applicationId ? null : applicationId)}>
        <MoreHorizontal size={18} />
      </button>
      {actionMenuId === applicationId && (
        <div className="um-actions-dropdown" style={{ right: 0, left: "auto" }}>
          {status === "pending" && (
            <>
              <button onClick={() => onUpdateStatus(applicationId, "accepted")} disabled={processing}>
                <CheckCircle size={14} /> Accept
              </button>
              <button onClick={() => onUpdateStatus(applicationId, "rejected")} disabled={processing}>
                <XCircle size={14} /> Reject
              </button>
            </>
          )}
          {status === "accepted" && (
            <button onClick={() => onUpdateStatus(applicationId, "rejected")} disabled={processing}>
              <XCircle size={14} /> Reject
            </button>
          )}
          {status === "rejected" && (
            <button onClick={() => onUpdateStatus(applicationId, "accepted")} disabled={processing}>
              <CheckCircle size={14} /> Reinstate
            </button>
          )}
        </div>
      )}
    </div>
  );
};

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div>
    <span style={{ color: "var(--admin-cloud-gray)", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 4 }}>{label}</span>
    <span style={{ color: "var(--admin-white)", fontSize: "0.9375rem" }}>{value}</span>
  </div>
);

export default ApplicationsManagement;