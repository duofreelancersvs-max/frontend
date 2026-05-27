import { useState, useEffect, useCallback } from "react";
import AdminLayout from "@/components/layouts/AdminLayout";
import { adminService } from "@/services";
import type { AuditLogEntry, PaginationMeta } from "@/services";
import {
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  History,
  User,
  Shield,
  Activity,
  Calendar,
  Clock,
  Filter,
  type LucideIcon,
} from "lucide-react";

const actionColors: Record<string, string> = {
  create: "var(--admin-emerald)",
  update: "var(--admin-indigo)",
  delete: "var(--admin-rose)",
  approve: "var(--admin-emerald)",
  reject: "var(--admin-rose)",
  suspend: "var(--admin-amber)",
  login: "var(--admin-cyan)",
};

const AuditLogs = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState("all");
  const [resourceFilter, setResourceFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 20;

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = { page: currentPage, limit };
      if (actionFilter !== "all") params.action = actionFilter;
      if (resourceFilter !== "all") params.resource = resourceFilter;
      const data = await adminService.getAuditLogs(params);
      setLogs(data.logs || []);
      setPagination(data.pagination || null);
    } catch (err) {
      console.error("Failed to load audit logs:", err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, actionFilter, resourceFilter]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);
  useEffect(() => { setCurrentPage(1); }, [actionFilter, resourceFilter]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <AdminLayout title="Audit Logs" breadcrumb="Activity History">
      <div className="admin-content">
        <div className="um-filter-bar" style={{ marginBottom: "1.25rem" }}>
          <div className="um-filter-row">
            <div className="um-filter-select">
              <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}>
                <option value="all">All Actions</option>
                <option value="create">Create</option>
                <option value="update">Update</option>
                <option value="delete">Delete</option>
                <option value="approve">Approve</option>
                <option value="reject">Reject</option>
                <option value="suspend">Suspend</option>
                <option value="login">Login</option>
              </select>
            </div>
            <div className="um-filter-select">
              <select value={resourceFilter} onChange={(e) => setResourceFilter(e.target.value)}>
                <option value="all">All Resources</option>
                <option value="user">User</option>
                <option value="project">Project</option>
                <option value="review">Review</option>
                <option value="application">Application</option>
                <option value="verification">Verification</option>
                <option value="subscription">Subscription</option>
                <option value="payment">Payment</option>
                <option value="category">Category</option>
              </select>
            </div>
            <span style={{ color: "var(--admin-cloud-gray)", fontSize: "0.875rem", marginLeft: "auto" }}>
              {pagination?.totalItems || logs.length} total entries
            </span>
          </div>
        </div>

        <div className="admin-card" style={{ padding: 0, overflow: "hidden" }}>
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "4rem 0" }}>
              <Loader2 size={32} style={{ color: "var(--admin-indigo)", animation: "spin 1s linear infinite" }} />
            </div>
          ) : logs.length === 0 ? (
            <div style={{ textAlign: "center", padding: "4rem 1.5rem" }}>
              <History size={48} style={{ color: "var(--admin-cloud-gray)", margin: "0 auto 1rem", display: "block" }} />
              <p style={{ color: "var(--admin-white)", fontSize: "1.125rem" }}>No audit logs found</p>
            </div>
          ) : (
            <div style={{ maxHeight: 600, overflowY: "auto" }}>
              <table className="admin-table" style={{ minWidth: 700 }}>
                <thead style={{ position: "sticky", top: 0, zIndex: 1 }}>
                  <tr>
                    <th>Admin</th>
                    <th>Action</th>
                    <th>Resource</th>
                    <th>Details</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log._id}>
                      <td>
                        <div className="um-user-cell">
                          <div style={{
                            width: 28, height: 28, borderRadius: "50%",
                            background: "linear-gradient(135deg, var(--admin-indigo), var(--admin-violet))",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "0.65rem", fontWeight: 600, color: "white", flexShrink: 0,
                          }}>
                            {(log.adminId?.fullName || log.adminId?.email || "A").split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
                          </div>
                          <div className="um-user-info">
                            <div className="um-user-name" style={{ fontSize: "0.8125rem" }}>{log.adminId?.fullName || log.adminId?.email || "Unknown"}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: "0.25rem",
                          padding: "2px 8px", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 500,
                          background: `${actionColors[log.action] || "var(--admin-cloud-gray)"}15`,
                          color: actionColors[log.action] || "var(--admin-cloud-gray)",
                          textTransform: "capitalize",
                        }}>
                          <Activity size={12} />
                          {log.action}
                        </span>
                      </td>
                      <td style={{ color: "var(--admin-cloud-gray)", fontSize: "0.875rem", textTransform: "capitalize" }}>{log.resource}</td>
                      <td style={{ color: "var(--admin-cloud-gray)", fontSize: "0.8125rem", maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {log.details || "—"}
                      </td>
                      <td style={{ color: "var(--admin-cloud-gray)", fontSize: "0.8125rem" }}>{formatDate(log.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {pagination && pagination.totalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 1.5rem", borderTop: "1px solid var(--admin-border)" }}>
              <span style={{ color: "var(--admin-cloud-gray)", fontSize: "0.875rem" }}>
                Page {pagination.page} of {pagination.totalPages}
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

export default AuditLogs;