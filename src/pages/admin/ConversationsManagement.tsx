import { useState, useEffect, useCallback } from "react";
import { adminService } from "@/services";
import type { AdminConversation, AdminMessage, PaginationMeta } from "@/services";
import {
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  MessageSquare,
  Trash2,
  Clock,
  ArrowLeft,
  Eye,
  Paperclip,
  Check,
  CheckCheck,
} from "lucide-react";

const ConversationsManagement = () => {
  const [conversations, setConversations] = useState<AdminConversation[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [processing, setProcessing] = useState<string | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<AdminConversation | null>(null);
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const limit = 15;

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = { page: currentPage, limit };
      if (searchQuery.trim()) params.search = searchQuery.trim();
      const data = await adminService.getAllConversations(params);
      setConversations(data.conversations || []);
      setPagination(data.pagination || null);
    } catch (err) {
      console.error("Failed to load conversations:", err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery]);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);
  useEffect(() => { setCurrentPage(1); }, [searchQuery]);

  const handleViewMessages = async (conv: AdminConversation) => {
    setSelectedConversation(conv);
    setMessagesLoading(true);
    try {
      const data = await adminService.getConversationMessages(conv._id);
      setMessages(data.messages || []);
    } catch (err) {
      console.error("Failed to load messages:", err);
      setMessages([]);
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleDelete = async (conversationId: string) => {
    if (!window.confirm("Delete this conversation permanently? This action cannot be undone.")) return;
    try {
      setProcessing(conversationId);
      await adminService.deleteConversation(conversationId);
      if (selectedConversation?._id === conversationId) {
        setSelectedConversation(null);
        setMessages([]);
      }
      fetchConversations();
    } catch (err) {
      console.error("Failed to delete conversation:", err);
    } finally {
      setProcessing(null);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffHours = Math.floor(diffMs / 3600000);
    if (diffHours < 24) return `${diffHours}h ago`;
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  const formatMessageTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  };

  const formatMessageDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return "Today";
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  const getParticipants = (conv: AdminConversation) => {
    return conv.participants?.map((p) => p.fullName || p.email).join(", ") || "—";
  };

  const getRoleIcon = (conv: AdminConversation) => {
    const hasFreelancer = conv.participants?.some((p) => p.role === "freelancer");
    const hasClient = conv.participants?.some((p) => p.role === "client");
    if (hasFreelancer && hasClient) return { label: "Client ↔ Freelancer", color: "var(--admin-indigo)" };
    return { label: `${hasFreelancer ? "Freelancer" : "Client"} Chat`, color: "var(--admin-cyan)" };
  };

  const stats = [
    { label: "Total Conversations", value: pagination?.totalItems ?? conversations.length, icon: MessageSquare, color: "indigo" },
    { label: "Active Today", value: conversations.filter(c => {
      if (!c.updatedAt) return false;
      return Date.now() - new Date(c.updatedAt).getTime() < 86400000;
    }).length, icon: Clock, color: "emerald" },
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
                placeholder="Search by participant name, email, or project..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="um-search-input"
              />
              {searchQuery && (
                <button className="um-search-clear" onClick={() => setSearchQuery("")}><X size={16} /></button>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "1.5rem" }}>
          {/* Conversations List */}
          <div className="admin-card" style={{ padding: 0, overflow: "hidden", flex: selectedConversation ? "0 0 45%" : 1, maxWidth: selectedConversation ? "45%" : "100%" }}>
            {loading ? (
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "4rem 0" }}>
                <Loader2 size={32} style={{ color: "var(--admin-indigo)", animation: "spin 1s linear infinite" }} />
              </div>
            ) : conversations.length === 0 ? (
              <div style={{ textAlign: "center", padding: "4rem 1.5rem" }}>
                <MessageSquare size={48} style={{ color: "var(--admin-cloud-gray)", margin: "0 auto 1rem", display: "block" }} />
                <p style={{ color: "var(--admin-white)", fontSize: "1.125rem", fontWeight: 600, marginBottom: "0.5rem" }}>No conversations found</p>
              </div>
            ) : (
              <div>
                {conversations.map((conv) => {
                  const roleInfo = getRoleIcon(conv);
                  const lastMsg = conv.lastMessage?.content || "No messages yet";
                  const lastTime = conv.lastMessage?.createdAt ? formatDate(conv.lastMessage.createdAt) : formatDate(conv.updatedAt);
                  return (
                    <div
                      key={conv._id}
                      onClick={() => handleViewMessages(conv)}
                      style={{
                        display: "flex", alignItems: "center", gap: "1rem", padding: "1rem 1.5rem",
                        borderBottom: "1px solid var(--admin-border)", cursor: "pointer",
                        transition: "background 0.15s",
                        background: selectedConversation?._id === conv._id ? "rgba(99,102,241,0.08)" : undefined,
                      }}
                      className="hover:bg-white/5"
                    >
                      <div style={{
                        width: 44, height: 44, borderRadius: "50%",
                        background: "linear-gradient(135deg, var(--admin-indigo), var(--admin-cyan))",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0,
                      }}>
                        <MessageSquare size={18} style={{ color: "white" }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                          <span style={{ color: "var(--admin-white)", fontWeight: 600, fontSize: "0.875rem" }}>
                            {getParticipants(conv)}
                          </span>
                          <span style={{ color: "var(--admin-cloud-gray)", fontSize: "0.75rem" }}>{lastTime}</span>
                        </div>
                        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: 2 }}>
                          <span style={{ color: roleInfo.color, fontSize: "0.7rem", fontWeight: 600, padding: "1px 6px", borderRadius: 4, background: `${roleInfo.color}15` }}>
                            {roleInfo.label}
                          </span>
                          {conv.projectId?.title && (
                            <span style={{ color: "var(--admin-cloud-gray)", fontSize: "0.7rem" }}>
                              Project: {conv.projectId.title}
                            </span>
                          )}
                        </div>
                        <span style={{ color: "var(--admin-cloud-gray)", fontSize: "0.8125rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block", maxWidth: 500 }}>
                          {lastMsg}
                        </span>
                      </div>
                      <div style={{ display: "flex", gap: "0.25rem", flexShrink: 0 }}>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleViewMessages(conv); }}
                          style={{
                            background: selectedConversation?._id === conv._id ? "var(--admin-indigo)" : "rgba(99,102,241,0.1)",
                            border: "none", color: selectedConversation?._id === conv._id ? "white" : "var(--admin-indigo)",
                            cursor: "pointer", padding: 8, borderRadius: 6, display: "flex",
                          }}
                          title="View Messages"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(conv._id); }}
                          disabled={processing === conv._id}
                          style={{
                            background: "none", border: "none", color: "var(--admin-cloud-gray)",
                            cursor: "pointer", padding: 8, borderRadius: 6,
                          }}
                          title="Delete Conversation"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
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

          {/* Messages Panel */}
          {selectedConversation && (
            <div className="admin-card" style={{ flex: 1, padding: 0, overflow: "hidden", display: "flex", flexDirection: "column", maxHeight: "70vh" }}>
              {/* Messages Header */}
              <div style={{
                display: "flex", alignItems: "center", gap: "0.75rem", padding: "1rem 1.25rem",
                borderBottom: "1px solid var(--admin-border)", flexShrink: 0,
              }}>
                <button
                  onClick={() => { setSelectedConversation(null); setMessages([]); }}
                  style={{ background: "none", border: "none", color: "var(--admin-cloud-gray)", cursor: "pointer", padding: 4 }}
                >
                  <ArrowLeft size={18} />
                </button>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: "var(--admin-white)", fontWeight: 600, fontSize: "0.875rem" }}>
                    {getParticipants(selectedConversation)}
                  </div>
                  {selectedConversation.projectId?.title && (
                    <div style={{ color: "var(--admin-cloud-gray)", fontSize: "0.75rem" }}>
                      Project: {selectedConversation.projectId.title}
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", gap: "0.25rem" }}>
                  {selectedConversation.participants?.map((p) => (
                    <span key={p._id} style={{
                      fontSize: "0.7rem", padding: "2px 8px", borderRadius: 10,
                      background: p.role === "freelancer" ? "rgba(6,182,212,0.15)" : p.role === "client" ? "rgba(99,102,241,0.15)" : "rgba(139,92,246,0.15)",
                      color: p.role === "freelancer" ? "var(--admin-cyan)" : p.role === "client" ? "var(--admin-indigo)" : "var(--admin-violet)",
                    }}>
                      {p.role}
                    </span>
                  ))}
                </div>
              </div>

              {/* Messages List */}
              <div style={{ flex: 1, overflowY: "auto", padding: "1.25rem" }}>
                {messagesLoading ? (
                  <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "3rem 0" }}>
                    <Loader2 size={24} style={{ color: "var(--admin-indigo)", animation: "spin 1s linear infinite" }} />
                  </div>
                ) : messages.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
                    <MessageSquare size={36} style={{ color: "var(--admin-cloud-gray)", margin: "0 auto 0.75rem", display: "block" }} />
                    <p style={{ color: "var(--admin-cloud-gray)", fontSize: "0.875rem" }}>No messages in this conversation</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {messages.map((msg, idx) => {
                      const prevMsg = idx > 0 ? messages[idx - 1] : null;
                      const showDateHeader = !prevMsg || formatMessageDate(prevMsg.createdAt) !== formatMessageDate(msg.createdAt);
                      const senderName = msg.senderId?.fullName || msg.senderId?.email || "Unknown";
                      const isAdmin = msg.senderId?.role === "admin";

                      return (
                        <div key={msg._id}>
                          {showDateHeader && (
                            <div style={{ textAlign: "center", margin: "0.5rem 0" }}>
                              <span style={{
                                fontSize: "0.7rem", color: "var(--admin-cloud-gray)",
                                background: "rgba(51,65,85,0.5)", padding: "2px 12px", borderRadius: 10,
                              }}>
                                {formatMessageDate(msg.createdAt)}
                              </span>
                            </div>
                          )}
                          <div style={{
                            display: "flex", flexDirection: "column",
                            alignItems: isAdmin ? "flex-end" : "flex-start",
                          }}>
                            <div style={{
                              maxWidth: "80%", padding: "0.625rem 1rem", borderRadius: 12,
                              background: isAdmin
                                ? "linear-gradient(135deg, var(--admin-indigo), var(--admin-violet))"
                                : "rgba(51,65,85,0.6)",
                              color: "var(--admin-white)",
                              fontSize: "0.8125rem", lineHeight: 1.5,
                              wordBreak: "break-word",
                            }}>
                              <div style={{ fontSize: "0.7rem", fontWeight: 600, marginBottom: 4, opacity: 0.85 }}>
                                {senderName}
                              </div>
                              <div>{msg.content}</div>
                              {msg.attachments && msg.attachments.length > 0 && (
                                <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
                                  {msg.attachments.map((att: { type: string; url: string; name?: string }, i: number) => (
                                    <a key={i} href={att.url} target="_blank" rel="noopener noreferrer" style={{
                                      display: "flex", alignItems: "center", gap: 4,
                                      fontSize: "0.75rem", color: "var(--admin-cyan)",
                                      background: "rgba(6,182,212,0.1)", padding: "4px 10px", borderRadius: 6,
                                      textDecoration: "none",
                                    }}>
                                      <Paperclip size={12} />
                                      {att.name || "Attachment"}
                                    </a>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2, padding: "0 4px" }}>
                              <span style={{ fontSize: "0.65rem", color: "var(--admin-cloud-gray)" }}>
                                {formatMessageTime(msg.createdAt)}
                              </span>
                              {isAdmin && (msg.isRead ? <CheckCheck size={12} style={{ color: "var(--admin-cyan)" }} /> : <Check size={12} style={{ color: "var(--admin-cloud-gray)" }} />)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ConversationsManagement;
