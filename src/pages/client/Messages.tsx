import { useState, useCallback } from "react";
import { useOutletContext, useLocation } from "react-router-dom";
import type { ClientLayoutContext } from "@/layouts/ClientLayout";
import { Bell, ChevronDown, LogOut, User, Settings, Menu, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { conversationService, applicationService } from "@/services";
import type { Conversation, Message, Application } from "@/services";
import { useAuth } from "@/hooks/useAuth";
import { useSocket } from "@/hooks/useSocket";
import type { SocketMessage, SocketConversation } from "@/lib/socket";
import { ConversationList, ChatArea, ChatInfoPanel } from "@/components/chat";
import type {
  ConversationItem,
  ChatParticipant,
  InfoPanelParticipant,
} from "@/components/chat";
import { ChatAvatar } from "@/components/chat";
import { TermsModal } from "@/components/modals/TermsModal";
import { useEffect } from "react";
import { useUnreadStore } from "@/stores/unread.store";

const ClientMessages = () => {
  const { user, logout } = useAuth();
  const { setSidebarOpen } = useOutletContext<ClientLayoutContext>();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const { setActiveConversation, resetCount, addPendingMessage, getPendingMessages, clearPendingMessages, totalUnreadCount } = useUnreadStore();
  const [currentApplication, setCurrentApplication] = useState<Application | null>(null);

  // Sync active conversation with unread store
  useEffect(() => {
    setActiveConversation(selectedConversation?.id || null);
    return () => setActiveConversation(null);
  }, [selectedConversation, setActiveConversation]);

  // ─── Socket.IO integration ──────────────────────────────────────

  const handleNewMessage = useCallback(
    (socketMsg: SocketMessage, _conv: SocketConversation) => {
      console.log("[Socket] New message received:", (socketMsg as any).id || socketMsg._id);
      
      // Robustly extract senderId – backend may send ObjectId object or string
      const rawSenderId = (socketMsg as any).senderId;
      const senderId = (
        typeof rawSenderId === 'object' && rawSenderId !== null
          ? (rawSenderId._id || rawSenderId.id || rawSenderId).toString()
          : (rawSenderId || '').toString()
      );

      const mapped: Message = {
        id: (socketMsg._id || (socketMsg as any).id || "").toString(),
        conversationId: (socketMsg.conversationId || "").toString(),
        senderId,
        content: socketMsg.content,
        read: socketMsg.isRead ?? (socketMsg as any).read ?? false,
        createdAt: socketMsg.createdAt || socketMsg.sentAt || new Date().toISOString(),
      };

      // Always add to pending messages store (for when user is on another page)
      addPendingMessage(mapped);

      const selId = (selectedConversation?.id || (selectedConversation as any)?._id || "").toString();
      const msgConvId = mapped.conversationId;
      const isCurrentConv = selId && msgConvId === selId;

      const currentUserId = (user?._id || '').toString();

      if (isCurrentConv) {
        // If it's for the current conversation and from the OTHER person, mark as read immediately
        if (mapped.senderId !== currentUserId) {
          markAsRead(mapped.conversationId);
        }

        setMessages((prev) => {
          // Clean up optimistic temp message if it exists
          const filtered = prev.filter(m => 
            !(m.id.startsWith("temp-") && m.content === mapped.content && m.senderId === user?._id)
          );

          if (filtered.some((m) => (m.id === mapped.id))) {
            console.log("[Socket] Message already exists in state, skipping append.");
            return filtered;
          }
          console.log("[Socket] Appending new message to chat area.");
          return [...filtered, mapped];
        });
      } else {
        console.log("[Socket] Received message for different conversation:", socketMsg.conversationId);
      }

      setConversations((prev) =>
        prev.map((c) => {
          const cid = (c.id || (c as any)._id || "").toString();
          return cid === mapped.conversationId
            ? {
                ...c,
                lastMessage: {
                  ...mapped,
                  createdAt: mapped.createdAt
                } as any,
                unreadCount: cid === selId ? 0 : (c.unreadCount || 0) + 1,
              }
            : c;
        }),
      );
    },
    [selectedConversation, user, addPendingMessage],
  );

  const handleMessageRead = useCallback(
    (data: { conversationId: string; userId: string; readAt: string }) => {
      console.log("[Socket] Received message:read event", data);
      if (data.userId === user?._id?.toString()) {
        console.log("[Socket] Ignored message:read because I triggered it");
        return; // We triggered this read, ignore it meant for other user's UI
      }

      const readConvId = data.conversationId.toString();
      const selId = (selectedConversation?.id || (selectedConversation as any)?._id || "").toString();
      // Update message read status
      if (readConvId === selId) {
        console.log("[Socket] Marking messages as read in UI for conversation", selId);
        setMessages((prev) =>
          prev.map((m) =>
            m.senderId?.toString() === user?._id?.toString() ? { ...m, read: true } : m,
          ),
        );
      }
      // Reset unread count for this conversation
      setConversations((prev) =>
        prev.map((c) => {
          const cid = (c.id || (c as any)._id || "").toString();
          return cid === readConvId ? { ...c, unreadCount: 0 } : c;
        }),
      );
    },
    [selectedConversation, user],
  );

  const {
    isConnected,
    onlineUsers,
    sendMessage: socketSendMessage,
    markAsRead,
  } = useSocket({
    conversationId: selectedConversation?.id || null,
    onNewMessage: handleNewMessage,
    onMessageRead: handleMessageRead,
  });

  // ─── Data fetching ──────────────────────────────────────────────

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const data = await conversationService.getAll();
        let convs = data.conversations || [];
        
        // Sort conversations by most recent message (newest first)
        convs = convs.sort((a, b) => {
          const dateA = a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt).getTime() : 0;
          const dateB = b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt).getTime() : 0;
          return dateB - dateA;
        });
        
        setConversations(convs);
        
        // Auto-select the conversation with the most recent message (first after sort)
        if (convs.length > 0) {
          setSelectedConversation(convs[0]);
        }
      } catch (error) {
        console.error("Error fetching conversations:", error);
      }
    };
    fetchConversations();
  }, []);

  // ── Deep-link: auto-select conversation from navigation state ──
  const location = useLocation();
  useEffect(() => {
    const state = location.state as { conversationId?: string } | null;
    if (state?.conversationId && conversations.length > 0) {
      const target = conversations.find(
        (c) => c.id === state.conversationId || (c as any)._id === state.conversationId,
      );
      if (target) {
        setSelectedConversation(target);
        setMobileView("chat");
      }
      // Clear state to prevent re-triggering
      window.history.replaceState({}, "");
    }
  }, [location.state, conversations]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedConversation?.id) return;
      
      // Clear messages from other conversations immediately
      // but keep any that were already received for THIS conversation (e.g. via socket)
      setMessages((prev) => 
        prev.filter(m => m.conversationId.toString() === selectedConversation.id.toString())
      );

      // Get pending messages from store (messages received while on another page)
      const pendingMsgs = getPendingMessages(selectedConversation.id.toString());

      try {
        const data = await conversationService.getMessages(
          selectedConversation.id,
        );
        // Deduplicate and merge, ensuring we only keep messages for the current conversation
        setMessages((prev) => {
          const apiMessages = data.messages || [];
          const apiIds = new Set(apiMessages.map((m: any) => (m.id || m._id).toString()));
          
          const cid = selectedConversation.id.toString();

          // Keep local messages that:
          // 1. Belong to THIS conversation
          // 2. Are not already in the API response (dedup)
          const uniqueLocal = prev.filter(m => 
            m.conversationId.toString() === cid && 
            !apiIds.has(m.id.toString())
          );

          // Also filter out pending messages that are already in API response
          const uniquePending = pendingMsgs.filter(p => !apiIds.has(p.id.toString()));
          
          const combined = [...apiMessages, ...uniqueLocal, ...uniquePending];
          return combined.sort((a, b) => 
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        });

        // Clear pending messages after merging
        clearPendingMessages(selectedConversation.id.toString());

        markAsRead(selectedConversation.id);
        // Also call the REST endpoint to reset server-side unread count
        conversationService.markAsRead(selectedConversation.id).catch(() => {});
        // Immediately reset unread count in local state
        setConversations((prev) =>
          prev.map((c) =>
            (c.id === selectedConversation.id || (c as any)._id === selectedConversation.id) 
              ? { ...c, unreadCount: 0 } 
              : c,
          ),
        );
        // Reset unread store for this conversation as well
        resetCount(selectedConversation.id);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };
    fetchMessages();
  }, [selectedConversation?.id, markAsRead, resetCount]);

  // ─── Derived data ───────────────────────────────────────────────

  const getFreelancerParticipant = (conv: Conversation) =>
    conv.participants?.find((p) => p.role === "freelancer") ||
    conv.participants?.[0];

  const selectedFreelancer = selectedConversation
    ? getFreelancerParticipant(selectedConversation)
    : null;

  // ── Application Fetching ──
  useEffect(() => {
    const fetchApplication = async () => {
      if (!selectedConversation?.projectId) {
        setCurrentApplication(null);
        return;
      }
      try {
        const res = await applicationService.getByProject(selectedConversation.projectId);
        const freelancerId = selectedFreelancer?.id || (selectedFreelancer as any)?._id;
        const matchingApp = res.applications.find(
          (app) => 
            (app.freelancer as any)?._id === freelancerId || 
            app.freelancer?.id === freelancerId || 
            (app as any).freelancerId === freelancerId
        );
        setCurrentApplication(matchingApp || null);
      } catch (err) {
        console.error("Failed to fetch application for conversation", err);
        setCurrentApplication(null);
      }
    };
    fetchApplication();
  }, [selectedConversation?.projectId, selectedFreelancer]);

  const conversationItems: ConversationItem[] = conversations.map((conv) => {
    const freelancer = getFreelancerParticipant(conv);
    // Safe date formatting: handle invalid dates
    let lastMessageTime = "";
    if (conv.lastMessage?.createdAt) {
      const date = new Date(conv.lastMessage.createdAt);
      if (!isNaN(date.getTime())) {
        lastMessageTime = date.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        });
      }
    }
    return {
      id: conv.id,
      participant: {
        userId: freelancer?.id || "",
        name: freelancer?.fullName || "User",
        avatar: freelancer?.avatar,
        verified: true,
        rating: 4.5,
        reviews: 10,
      },
      project: {
        id: conv.projectId || "",
        title: conv.project?.title || "Project",
      },
      lastMessage: conv.lastMessage?.content || "No messages",
      lastMessageTime,
      unread: conv.unreadCount,
      termsAccepted: conv.termsAccepted?.clientAccepted ?? true,
    };
  });

  const chatParticipant: ChatParticipant | null = selectedFreelancer
    ? {
        name: selectedFreelancer.fullName || "User",
        avatar: selectedFreelancer.avatar,
        verified: true,
        online: onlineUsers.has(selectedFreelancer.id || ""),
      }
    : null;

  const infoPanelParticipant: InfoPanelParticipant | null = selectedFreelancer
    ? {
        userId: selectedFreelancer.id || "",
        name: selectedFreelancer.fullName || "User",
        avatar: selectedFreelancer.avatar,
        verified: true,
        rating: 4.5,
        reviews: 10,
        online: onlineUsers.has(selectedFreelancer.id || ""),
        title: "Freelancer",
      }
    : null;

  const chatProject = selectedConversation?.project
    ? {
        id: selectedConversation.projectId || "",
        title: selectedConversation.project.title,
      }
    : null;

  const clientTermsAccepted =
    selectedConversation?.termsAccepted?.clientAccepted ?? true;

  // ─── Handlers ───────────────────────────────────────────────────

  const handleHire = async () => {
    if (!currentApplication) return;
    try {
      const appId = currentApplication.id || (currentApplication as any)._id;
      await applicationService.updateStatus(appId, "accepted");
      setCurrentApplication({ ...currentApplication, status: "accepted" });
    } catch (err) {
      console.error("Failed to hire", err);
    }
  };

  const handleReject = async () => {
    if (!currentApplication) return;
    try {
      const appId = currentApplication.id || (currentApplication as any)._id;
      await applicationService.updateStatus(appId, "rejected");
      setCurrentApplication({ ...currentApplication, status: "rejected" });
    } catch (err) {
      console.error("Failed to reject", err);
    }
  };

  const handleSelectConversation = (id: string) => {
    const convo = conversations.find((c) => c.id === id);
    if (convo) {
      setSelectedConversation(convo);
      setMobileView("chat");
    }
  };

  const handleAcceptTerms = async () => {
    if (selectedConversation) {
      try {
        await conversationService.acceptTerms(selectedConversation.id);
        setConversations((prev) =>
          prev.map((c) =>
            c.id === selectedConversation.id
              ? {
                  ...c,
                  termsAccepted: {
                    ...c.termsAccepted!,
                    clientAccepted: true,
                  },
                }
              : c,
          ),
        );
        setSelectedConversation((prev) =>
          prev
            ? {
                ...prev,
                termsAccepted: {
                  ...prev.termsAccepted!,
                  clientAccepted: true,
                },
              }
            : prev,
        );
      } catch (error) {
        console.error("Error accepting terms:", error);
      }
    }
    setShowTermsModal(false);
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation || !isConnected) return;
    const content = messageInput;
    setMessageInput("");

    // Optimistically update current chat view
    const optimisticMsg: Message = {
      id: `temp-${Date.now()}`,
      conversationId: selectedConversation.id,
      senderId: user?._id || "",
      content,
      read: false,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    
    // Update conversation's last message in the sidebar promptly
    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedConversation.id
          ? {
              ...c,
              lastMessage: optimisticMsg,
            }
          : c,
      ),
    );

    console.log("[Socket] Emitting message:send for content:", content);
    socketSendMessage(selectedConversation.id, content).then((res) => {
        if (!res.success) {
            console.error("[Socket] Failed to send message via socket:", res.error);
            // Optionally handle UI rollback or error state
        } else {
            console.log("[Socket] message:send confirmed by server.");
            // When server confirms, handleNewMessage will eventually append the official message
            // and we rely on the duplicate-ID filtering there to clean up/swap.
            // Note: Since temp-id won't match official id, we need careful filtering.
        }
    });
  };

  return (
    <div className="h-full flex flex-col bg-background font-sans overflow-hidden">
      {/* Header */}
      <header className="h-16 bg-white border-b border-slate-200 px-4 lg:px-6 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            <Menu size={24} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-navy">Messages</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/client/messages" className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
            <MessageSquare size={20} />
            {totalUnreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-teal rounded-full" />
            )}
          </Link>
          <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2 p-1 pr-2 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <ChatAvatar
                name={user?.fullName || "U"}
                size="sm"
                showOnlineIndicator={false}
              />
              <ChevronDown
                size={16}
                className="text-slate-500 hidden sm:block"
              />
            </button>
            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50">
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="font-semibold text-navy">
                    {user?.fullName || "User"}
                  </p>
                  <p className="text-sm text-slate-500">{user?.email || ""}</p>
                </div>
                <Link
                  to="/client/profile"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                >
                  <User size={16} /> My Profile
                </Link>
                <Link
                  to="/client/settings"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                >
                  <Settings size={16} /> Settings
                </Link>
                <hr className="my-2 border-slate-100" />
                <button 
                  onClick={async () => {
                    try {
                      await logout();
                    } catch (error) {
                      console.error("Logout failed:", error);
                    }
                  }}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Chat Container */}
      <div className="flex-1 flex overflow-hidden bg-slate-100">
        {/* Conversation List */}
        <ConversationList
          conversations={conversationItems}
          selectedId={selectedConversation?.id || null}
          onSelect={handleSelectConversation}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filter={filter}
          onFilterChange={setFilter}
          onlineUsers={onlineUsers}
          role="client"
          className={cn(
            "w-full md:w-80 flex-shrink-0",
            mobileView === "chat" && "hidden md:flex",
          )}
        />

        {/* Chat Area */}
        <ChatArea
          participant={chatParticipant}
          project={chatProject}
          messages={messages}
          messageInput={messageInput}
          setMessageInput={setMessageInput}
          onSend={handleSendMessage}
          onBack={() => setMobileView("list")}
          isConnected={isConnected}
          currentUserId={user?._id}
          role="client"
          termsAccepted={clientTermsAccepted}
          onAcceptTermsClick={() => setShowTermsModal(true)}
          showInfoPanel={showInfoPanel}
          onToggleInfoPanel={() => setShowInfoPanel(!showInfoPanel)}
          applicationId={currentApplication?.id || (currentApplication as any)?._id}
          applicationStatus={currentApplication?.status}
          onHire={handleHire}
          onReject={handleReject}
          className={cn(mobileView === "list" && "hidden md:flex")}
        />

        {/* Info Panel */}
        {showInfoPanel && infoPanelParticipant && (
          <ChatInfoPanel
            participant={infoPanelParticipant}
            project={chatProject}
            role="client"
            className="hidden xl:flex w-72"
          />
        )}
      </div>

      {/* Terms Modal */}
      <TermsModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        onAgree={handleAcceptTerms}
      />
    </div>
  );
};

export default ClientMessages;
