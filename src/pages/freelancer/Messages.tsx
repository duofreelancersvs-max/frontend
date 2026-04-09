import { useState, useRef, useEffect, useCallback } from "react";
import { useOutletContext, useLocation, useNavigate } from "react-router-dom";
import {
  Search,
  Star,
  X,
  BadgeCheck,
  Building2,
  ExternalLink,
  FileSignature,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { conversationService } from "@/services";
import type { Conversation, Message } from "@/services";
import type { FreelancerLayoutContext } from "@/layouts/FreelancerLayout";
import { useAuth } from "@/hooks/useAuth";
import { useSocket } from "@/hooks/useSocket";
import type { SocketMessage, SocketConversation } from "@/lib/socket";
import { useUnreadStore } from "@/stores/unread.store";
import { ChatAvatar, ChatArea } from "@/components/chat";
import DashboardHeader from "@/components/layouts/DashboardHeader";

const termsText = `
TERMS AND CONDITIONS FOR FREELANCER MESSAGING

1. PROFESSIONAL COMMUNICATION
- All communication must be professional and respectful.
- Do not share personal contact information outside the platform.
- Harassment, spam, or inappropriate content is strictly prohibited.

2. PROJECT DISCUSSIONS
- All project-related discussions should be documented within this platform.
- Any agreements made through chat are subject to the platform's terms.
- Payment discussions should follow the platform's escrow system.

3. CONFIDENTIALITY
- Respect client confidentiality and project details.
- Do not share project information with third parties.
- Protect intellectual property and trade secrets.

4. PLATFORM GUIDELINES
- Do not attempt to bypass platform fees.
- Report any suspicious activity or violations.
- Maintain accurate and honest communication.

5. DISPUTE RESOLUTION
- Any disputes will be handled through the platform's dispute resolution process.
- Keep all evidence of communication for reference.
- Contact support if you face any issues.

By accepting these terms, you agree to abide by all platform rules and guidelines.
`;

const FreelancerMessages = () => {
  const { user } = useAuth();
  const { setSidebarOpen } = useOutletContext<FreelancerLayoutContext>();
  const { setActiveConversation, addPendingMessage, getPendingMessages, clearPendingMessages, resetCount } = useUnreadStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [modalChecked, setModalChecked] = useState(false);
  const [_loading, _setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ─── Socket.IO integration ──────────────────────────────────────

  const handleNewMessage = useCallback(
    (socketMsg: SocketMessage, _conv: SocketConversation) => {
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
        createdAt: socketMsg.createdAt || (socketMsg as any).sentAt || new Date().toISOString(),
      };

      // Always add to pending messages store (for when user is on another page)
      addPendingMessage(mapped);

      const selId = (selectedConversation?.id || (selectedConversation as any)?._id || "").toString();
      const msgConvId = mapped.conversationId.toString();
      const isCurrentConv = selId && msgConvId === selId;

      const currentUserId = (user?._id || '').toString();

      if (isCurrentConv) {
        // If it's for the current conversation and from the OTHER person, mark as read immediately
        if (mapped.senderId !== currentUserId) {
          console.log("[Socket] Marking message as read instantly", msgConvId);
          markAsRead(msgConvId);
        }

        setMessages((prev) => {
          if (prev.some((m) => m.id === mapped.id)) return prev;
          return [...prev, mapped];
        });
      }
      setConversations((prev) =>
        prev.map((c) =>
          c.id === socketMsg.conversationId
            ? {
                ...c,
                lastMessage: mapped,
                unreadCount:
                  c.id === selectedConversation?.id
                    ? c.unreadCount
                    : c.unreadCount + 1,
              }
            : c,
        ),
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
      if (readConvId === selId) {
        console.log("[Socket] Marking messages as read in UI for conversation", selId);
        setMessages((prev) =>
          prev.map((m) =>
            m.senderId?.toString() === user?._id?.toString() ? { ...m, read: true } : m,
          ),
        );
      }
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

  // Sync active conversation with unread store
  useEffect(() => {
    setActiveConversation(selectedConversation?.id || null);
    return () => setActiveConversation(null);
  }, [selectedConversation, setActiveConversation]);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        _setLoading(true);
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
      } finally {
        _setLoading(false);
      }
    };
    fetchConversations();
  }, []);

  // ── Deep-link: auto-select conversation from navigation state ──
  const location = useLocation();
  const nav = useNavigate();
  useEffect(() => {
    const state = location.state as { conversationId?: string } | null;
    if (state?.conversationId && conversations.length > 0) {
      const target = conversations.find(
        (c) => c.id === state.conversationId || (c as any)._id === state.conversationId,
      );
      if (target) {
        setSelectedConversation(target);
      }
      // Clear state to prevent re-triggering
      nav(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, conversations, nav, location.pathname]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedConversation) return;

      // Get pending messages from store (messages received while on another page)
      const pendingMsgs = getPendingMessages(selectedConversation.id);

      try {
        const data = await conversationService.getMessages(
          selectedConversation.id,
        );
        
        // Merge API messages with pending messages
        const apiMessages = data.messages || [];
        const apiIds = new Set(apiMessages.map((m: any) => (m.id || m._id).toString()));
        
        // Filter out pending messages that are already in API response
        const uniquePending = pendingMsgs.filter(p => !apiIds.has(p.id.toString()));
        
        const combined = [...apiMessages, ...uniquePending];
        setMessages(combined.sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        ));

        // Clear pending messages after merging
        clearPendingMessages(selectedConversation.id);

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
  }, [selectedConversation, markAsRead, getPendingMessages, clearPendingMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const conversationsDataMapped = conversations.map((conv) => {
    // Find the client participant (role: 'client')
    const clientParticipant = conv.participants?.find((p) => p.role === 'client') || conv.participants?.[0];

    return {
      id: conv.id,
      client: {
        userId: clientParticipant?.id || "",
        name: clientParticipant?.fullName || "Unknown",
        avatar: clientParticipant?.avatar,
        verified: true,
        rating: 4.5,
        reviews: 10,
        company: "Company",
        location: "Location",
      },
      project: {
        id: conv.projectId || "",
        title: conv.project?.title || "Project",
      },
      lastMessage: conv.lastMessage?.content || "No messages",
      lastMessageTime: conv.lastMessage
        ? new Date(conv.lastMessage.createdAt).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "",
      unreadCount: conv.unreadCount,
      isOnline: onlineUsers.has(clientParticipant?.id || ""),
      termsAccepted: conv.termsAccepted?.freelancerAccepted ?? false,
    };
  });

  const handleSelectConversation = (
    conversation: (typeof conversationsDataMapped)[0],
  ) => {
    const conv = conversations.find((c) => c.id === conversation.id);
    if (conv) {
      setSelectedConversation(conv);
    }
  };

  const handleAcceptTerms = async () => {
    if (selectedConversation) {
      try {
        await conversationService.acceptTerms(selectedConversation.id);
        
        // Update both conversations list and selected conversation to reflect accepted terms
        setConversations(prev => prev.map(c => 
          c.id === selectedConversation.id 
            ? { ...c, termsAccepted: { ...c.termsAccepted!, freelancerAccepted: true } }
            : c
        ));
        
        setSelectedConversation(prev => 
          prev ? { ...prev, termsAccepted: { ...prev.termsAccepted!, freelancerAccepted: true } } : null
        );
        
        setShowTermsModal(false);
      } catch (error) {
        console.error("Error accepting terms:", error);
      }
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation || !isConnected) return;

    const content = messageInput;
    setMessageInput("");
    socketSendMessage(selectedConversation.id, content);
    // Incoming message arrives via message:new socket event
  };
  // Helper: get mapped data for the currently selected conversation
  const selectedConvData = selectedConversation
    ? conversationsDataMapped.find((c) => c.id === selectedConversation.id)
    : undefined;

  const filteredConversations = conversationsDataMapped.filter(
    (conv) =>
      conv.client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.project.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="w-full h-screen flex flex-col bg-slate-50 dark:bg-background overflow-hidden relative">
      <div className="flex-1 w-full min-w-0 flex flex-col overflow-hidden">
        {/* Header Bar */}
        <DashboardHeader
          title="Messages"
          onMenuClick={() => setSidebarOpen(true)}
        />

        {/* Three Column Content */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* COLUMN 1: Conversations List */}
          <div className={cn(
            "w-full lg:w-80 border-r border-slate-200 dark:border-white/5 bg-white dark:bg-[#0A121E] flex flex-col flex-shrink-0",
            selectedConversation ? "hidden lg:flex" : "flex"
          )}>
            {/* Search */}
            <div className="p-4 border-b border-slate-100 dark:border-white/5">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search conversations..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none text-navy dark:text-white"
                />
              </div>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv)}
                  className={cn(
                    "p-4 border-b border-slate-50 dark:border-white/5 cursor-pointer transition-colors",
                    selectedConversation?.id === conv.id
                      ? "bg-teal/5 dark:bg-teal/10 border-l-2 border-l-teal"
                      : "hover:bg-slate-50 dark:hover:bg-white/5",
                  )}
                >
                  <div className="flex gap-3">
                    {/* Avatar */}
                    <ChatAvatar
                      name={conv.client.name}
                      size="2xl"
                      online={conv.isOnline || onlineUsers.has(conv.client.userId || "")}
                    />

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-navy dark:text-white text-sm truncate">
                            {conv.client.name}
                          </span>
                          {conv.client.verified && (
                            <BadgeCheck
                              size={14}
                              className="text-teal shrink-0"
                            />
                          )}
                        </div>
                        <span className="text-xs text-slate-400 shrink-0">
                          {conv.lastMessageTime}
                        </span>
                      </div>

                      {/* Project Name */}
                      <p className="text-xs text-royal-blue font-medium mb-1 truncate">
                        {conv.project.title}
                      </p>

                      {/* Client Rating */}
                      <div className="flex items-center gap-1 mb-1">
                        <Star size={10} className="text-gold fill-gold" />
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {conv.client.rating}
                        </span>
                        <span
                          className={cn(
                            "ml-2 px-1.5 py-0.5 rounded text-[10px] font-medium",
                            "bg-teal/10 text-teal",
                          )}
                        >
                          Active
                        </span>
                      </div>

                      {/* Last Message */}
                      <div className="flex items-center justify-between w-full min-w-0">
                        <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                          {conv.lastMessage}
                        </p>
                        {conv.unreadCount > 0 && (
                          <span className="ml-2 px-1.5 py-0.5 bg-teal text-white text-xs font-bold rounded-full shrink-0">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* COLUMN 2: Chat Area */}
          <ChatArea
            className={cn(
              "flex-1",
              selectedConversation ? "flex" : "hidden lg:flex"
            )}
            onBack={() => setSelectedConversation(null)}
            participant={selectedConversation ? {
              name: selectedConvData?.client.name || selectedConversation.participants?.[0]?.fullName || "Unknown",
              avatar: "",
              verified: true,
              online: onlineUsers.has(selectedConvData?.client.userId || "")
            } : null}
            project={selectedConversation?.project ? {
              id: selectedConversation.project.id,
              title: selectedConversation.project.title,
            } : undefined}
            messages={messages}
            messageInput={messageInput}
            setMessageInput={setMessageInput}
            onSend={handleSendMessage}
            isConnected={isConnected}
            currentUserId={user?._id}
            role="freelancer"
            termsAccepted={selectedConversation?.termsAccepted?.freelancerAccepted ?? false}
            onAcceptTermsClick={() => {
              setModalChecked(false); // Reset checkbox for new acceptance
              setShowTermsModal(true);
            }}
            showInfoPanel={showInfoPanel}
            onToggleInfoPanel={() => setShowInfoPanel(!showInfoPanel)}
          />

          {/* COLUMN 3: Client Info Panel */}
          {selectedConversation && (
            <div className={cn(
              "absolute lg:static inset-y-0 right-0 z-30 bg-white dark:bg-[#0A121E] border-l border-slate-200 dark:border-white/5 overflow-y-auto shadow-xl lg:shadow-none transition-transform duration-300",
              showInfoPanel 
                ? "translate-x-0 lg:translate-x-0 flex flex-col w-full sm:w-80" 
                : "translate-x-full lg:translate-x-0 lg:hidden"
            )}>
              {/* Client Header */}
              <div className="p-6 border-b border-slate-100 dark:border-white/5 text-center">
                <ChatAvatar
                  name={selectedConvData?.client.name || "Unknown"}
                  size="3xl"
                  showOnlineIndicator={false}
                  className="mx-auto mb-3"
                />
                <h3 className="font-bold text-navy dark:text-white text-lg flex items-center justify-center gap-1">
                  {selectedConvData?.client.name ||
                    selectedConversation.participants?.[0]?.fullName ||
                    "Unknown"}
                  <BadgeCheck size={16} className="text-teal" />
                </h3>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <Star size={14} className="text-gold fill-gold" />
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {selectedConvData?.client.rating || 0} (
                    {selectedConvData?.client.reviews || 0} reviews)
                  </span>
                </div>
              </div>

              {/* Company Details */}
              <div className="p-6 border-b border-slate-100 dark:border-white/5">
                <h4 className="text-sm font-semibold text-navy dark:text-white mb-4">
                  Client Details
                </h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Building2 size={16} className="text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Company</p>
                      <p className="text-sm font-medium text-navy dark:text-white">
                        {selectedConvData?.client.company || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Building2 size={16} className="text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Location</p>
                      <p className="text-sm font-medium text-navy dark:text-white">
                        {selectedConvData?.client.location || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Project Reference */}
              <div className="p-6 border-b border-slate-100 dark:border-white/5">
                <h4 className="text-sm font-semibold text-navy dark:text-white mb-4">
                  Project Reference
                </h4>
                <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-4">
                  <h5 className="font-medium text-navy dark:text-white mb-2">
                    {selectedConversation.project?.title || "Project"}
                  </h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Status</span>
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-teal/10 text-teal">
                        Active
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="p-6">
                <h4 className="text-sm font-semibold text-navy dark:text-white mb-4">
                  Quick Actions
                </h4>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start border-slate-200 dark:border-white/10 dark:text-white dark:hover:bg-white/5"
                  >
                    <ExternalLink size={16} className="mr-2" />
                    View Project
                  </Button>
                  <Button className="w-full justify-start bg-teal hover:bg-teal-light text-white">
                    <FileSignature size={16} className="mr-2" />
                    Send Proposal
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* TERMS & CONDITIONS MODAL */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#111827] rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-white/10">
            {/* Modal Header */}
            <div className="flex items-center gap-3 p-5 border-b border-slate-100 dark:border-white/10">
              <div className="w-10 h-10 rounded-xl bg-teal/10 flex items-center justify-center">
                <FileSignature size={20} className="text-teal" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-navy dark:text-white">
                  Terms & Conditions
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Please read and accept before chatting
                </p>
              </div>
              <button
                onClick={() => {
                  setShowTermsModal(false);
                }}
                className="ml-auto p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-slate-500 dark:text-slate-400" />
              </button>
            </div>

            {/* Terms Content */}
            <div className="p-5">
              <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-4 h-64 overflow-y-auto text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line border border-slate-100 dark:border-white/10">
                {termsText}
              </div>
            </div>

            {/* Checkbox */}
            <div className="px-5 pb-5">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={modalChecked}
                  onChange={(e) => setModalChecked(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-slate-300 dark:border-white/20 text-teal focus:ring-teal bg-white dark:bg-white/5"
                />
                <span className="text-sm text-navy dark:text-white">
                  I have read and agree to the Terms and Conditions
                </span>
              </label>

              <div className="flex items-center gap-2 mt-4 p-3 bg-gold/10 rounded-lg">
                <AlertCircle size={16} className="text-gold shrink-0" />
                <p className="text-xs text-gold">
                  You must accept the terms to communicate with this client.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 p-5 border-t border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-white/5">
              <Button
                variant="outline"
                className="flex-1 border-slate-200"
                onClick={() => {
                  setShowTermsModal(false);
                }}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-teal hover:bg-teal-light text-white"
                disabled={!modalChecked}
                onClick={handleAcceptTerms}
              >
                Start Chat
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FreelancerMessages;
