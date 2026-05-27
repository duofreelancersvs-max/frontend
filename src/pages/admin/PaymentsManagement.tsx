import { useState, useEffect, useCallback } from "react";
import AdminLayout from "@/components/layouts/AdminLayout";
import { adminService } from "@/services";
import type { AdminPayment, PaginationMeta } from "@/services";
import {
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Eye,
  RotateCcw,
  Loader2,
  Wallet,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  FileText,
  type LucideIcon,
} from "lucide-react";

const PaymentsManagement = () => {
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);
  const [viewPayment, setViewPayment] = useState<AdminPayment | null>(null);
  const limit = 15;

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = { page: currentPage, limit };
      if (statusFilter !== "all") params.status = statusFilter;
      if (typeFilter !== "all") params.type = typeFilter;
      if (searchQuery.trim()) params.search = searchQuery.trim();
      const data = await adminService.getAllPayments(params);
      setPayments(data.payments || []);
      setPagination(data.pagination || null);
    } catch (err) {
      console.error("Failed to load payments:", err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, statusFilter, typeFilter]);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);
  useEffect(() => { setCurrentPage(1); }, [searchQuery, statusFilter, typeFilter]);

  const handleRefund = async (paymentId: string) => {
    const reason = prompt("Enter refund reason (optional):");
    if (!window.confirm("Process refund for this payment?")) return;
    try {
      setProcessing(paymentId);
      await adminService.refundPayment(paymentId, reason || undefined);
      setActionMenuId(null);
      fetchPayments();
    } catch (err) {
      console.error("Failed to refund payment:", err);
    } finally {
      setProcessing(null);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  const formatAmount = (amount?: number, currency?: string) => {
    if (!amount) return "—";
    return `${currency === "USD" ? "$" : "₹"}${amount.toLocaleString("en-IN")}`;
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const config: Record<string, { label: string; className: string }> = {
      captured: { label: "Captured", className: "completed" },
      failed: { label: "Failed", className: "cancelled" },
      refunded: { label: "Refunded", className: "pending" },
      pending: { label: "Pending", className: "pending" },
    };
    const c = config[status] || { label: status, className: "pending" };
    return <span className={`admin-status-badge ${c.className}`}>{c.label}</span>;
  };

  const totalRevenue = payments.reduce((acc, p) => acc + (p.status === "captured" ? p.amount : 0), 0);
  const totalRefunded = payments.reduce((acc, p) => acc + (p.status === "refunded" ? p.amount : 0), 0);

  const stats = [
    { label: "Total Revenue", value: `₹${totalRevenue.toLocaleString("en-IN")}`, icon: Wallet, color: "indigo" },
    { label: "Total Refunded", value: `₹${totalRefunded.toLocaleString("en-IN")}`, icon: RotateCcw, color: "rose" },
    { label: "Successful", value: payments.filter(p => p.status === "captured").length, icon: CreditCard, color: "emerald" },
    { label: "Failed", value: payments.filter(p => p.status === "failed").length, icon: X, color: "amber" },
  ];

  return (
    <AdminLayout title="Payments" breadcrumb="Financial Transactions">
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
              <input type="text" placeholder="Search by transaction ID, name..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="um-search-input" />
              {searchQuery && <button className="um-search-clear" onClick={() => setSearchQuery("")}><X size={16} /></button>}
            </div>
            <div className="um-filter-select">
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">All Status</option>
                <option value="captured">Captured</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            <div className="um-filter-select">
              <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                <option value="all">All Types</option>
                <option value="project_payment">Project Payment</option>
                <option value="subscription">Subscription</option>
                <option value="withdrawal">Withdrawal</option>
              </select>
            </div>
          </div>
        </div>

        <div className="admin-card" style={{ padding: 0, overflow: "hidden" }}>
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "4rem 0" }}>
              <Loader2 size={32} style={{ color: "var(--admin-indigo)", animation: "spin 1s linear infinite" }} />
            </div>
          ) : payments.length === 0 ? (
            <div style={{ textAlign: "center", padding: "4rem 1.5rem" }}>
              <Wallet size={48} style={{ color: "var(--admin-cloud-gray)", margin: "0 auto 1rem", display: "block" }} />
              <p style={{ color: "var(--admin-white)", fontSize: "1.125rem" }}>No payments found</p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="admin-table" style={{ minWidth: 900 }}>
                <thead>
                  <tr>
                    <th>Transaction ID</th>
                    <th>Payer</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => {
                    const payerName = p.payerId?.fullName || p.payerId?.email || "Unknown";
                    const isIncoming = p.type === "project_payment" || p.type === "subscription";
                    return (
                      <tr key={p._id}>
                        <td style={{ color: "var(--admin-cloud-gray)", fontSize: "0.8125rem", fontFamily: "monospace" }}>
                          {p.transactionId?.slice(0, 16)}...
                        </td>
                        <td>
                          <div className="um-user-cell">
                            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg, var(--admin-indigo), var(--admin-cyan))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.65rem", fontWeight: 600, color: "white", flexShrink: 0 }}>
                              {payerName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
                            </div>
                            <div className="um-user-info">
                              <div className="um-user-name" style={{ fontSize: "0.8125rem" }}>{payerName}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span style={{
                            display: "inline-flex", alignItems: "center", gap: "0.25rem",
                            padding: "2px 8px", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 500,
                            background: isIncoming ? "rgba(16,185,129,0.1)" : "rgba(244,63,94,0.1)",
                            color: isIncoming ? "var(--admin-emerald)" : "var(--admin-rose)",
                          }}>
                            {isIncoming ? <ArrowDownLeft size={12} /> : <ArrowUpRight size={12} />}
                            {p.type === "project_payment" ? "Payment" : p.type === "subscription" ? "Subscription" : "Withdrawal"}
                          </span>
                        </td>
                        <td style={{ color: "var(--admin-white)", fontWeight: 600, fontSize: "0.875rem" }}>
                          {formatAmount(p.amount, p.currency)}
                        </td>
                        <td><StatusBadge status={p.status} /></td>
                        <td style={{ color: "var(--admin-cloud-gray)", fontSize: "0.8125rem" }}>{formatDate(p.createdAt)}</td>
                        <td>
                          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.25rem" }}>
                            <button className="um-actions-btn" onClick={() => setViewPayment(p)} title="View Details"><Eye size={16} /></button>
                            {p.status === "captured" && (
                              <div className="um-actions-wrapper" style={{ position: "relative" }}>
                                <button className="um-actions-btn" onClick={() => setActionMenuId(actionMenuId === p._id ? null : p._id)}>
                                  <MoreHorizontal size={18} />
                                </button>
                                {actionMenuId === p._id && (
                                  <div className="um-actions-dropdown" style={{ right: 0, left: "auto" }}>
                                    <button onClick={() => { handleRefund(p._id); setActionMenuId(null); }} disabled={processing === p._id}>
                                      <RotateCcw size={14} /> {processing === p._id ? "Processing..." : "Refund Payment"}
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
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
      {viewPayment && (
        <div className="um-slideover-overlay open" onClick={() => setViewPayment(null)}>
          <div className="um-slideover open" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div className="um-slideover-header" style={{ borderBottom: "1px solid var(--admin-border)", paddingBottom: "1rem" }}>
              <button className="um-slideover-close" onClick={() => setViewPayment(null)}><X size={20} /></button>
              <h3 style={{ color: "var(--admin-white)", fontSize: "1.25rem", fontWeight: 700 }}>Payment Details</h3>
            </div>
            <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
              <DetailRow label="Transaction ID" value={viewPayment.transactionId || "—"} />
              <DetailRow label="Payer" value={viewPayment.payerId?.fullName || viewPayment.payerId?.email || "Unknown"} />
              {viewPayment.payeeId && <DetailRow label="Payee" value={viewPayment.payeeId?.fullName || viewPayment.payeeId?.email || "—"} />}
              <DetailRow label="Amount" value={formatAmount(viewPayment.amount, viewPayment.currency)} />
              <DetailRow label="Type" value={viewPayment.type?.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase()) || "—"} />
              <DetailRow label="Status" value={viewPayment.status?.charAt(0).toUpperCase() + viewPayment.status?.slice(1) || "—"} />
              <DetailRow label="Date" value={formatDate(viewPayment.createdAt)} />
              {viewPayment.projectId?.title && <DetailRow label="Project" value={viewPayment.projectId.title} />}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div>
    <span style={{ color: "var(--admin-cloud-gray)", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 4 }}>{label}</span>
    <span style={{ color: "var(--admin-white)", fontSize: "0.9375rem" }}>{value}</span>
  </div>
);

export default PaymentsManagement;