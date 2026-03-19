import { useState, useRef, useEffect, useCallback } from "react";
import { useOutletContext, Link } from "react-router-dom";
import {
  Search,
  Star,
  X,
  Menu,
  BadgeCheck,
  Building2,
  ExternalLink,
  FileSignature,
  AlertCircle,
  Bell,
  ChevronDown,
  User,
  Settings,
  LogOut,
  MessageSquare,
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
  const { user, logout } = useAuth();
  const { setSidebarOpen } = useOutletContext<FreelancerLayoutContext>();
  const { setActiveConversation, addPendingMessage, getPendingMessages, clearPendingMessages, resetCount, totalUnreadCount } = useUnreadStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
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
    <div className="w-full h-screen flex flex-col bg-slate-50 overflow-hidden relative">
      <div className="flex-1 w-full min-w-0 flex flex-col overflow-hidden">
        {/* Header Bar */}
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
            <Link to="/freelancer/messages" className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
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
                    to="/freelancer/profile"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                  >
                    <User size={16} /> My Profile
                  </Link>
                  <Link
                    to="/freelancer/settings"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                  >
                    <Settings size={16} /> Settings
                  </Link>
                  <div className="h-px bg-slate-100 my-1"></div>
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={16} /> Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Three Column Content */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* COLUMN 1: Conversations List */}
          <div className={cn(
            "w-full lg:w-80 border-r border-slate-200 bg-white flex flex-col flex-shrink-0",
            selectedConversation ? "hidden lg:flex" : "flex"
          )}>
            {/* Search */}
            <div className="p-4 border-b border-slate-100">
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
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none"
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
                    "p-4 border-b border-slate-50 cursor-pointer transition-colors",
                    selectedConversation?.id === conv.id
                      ? "bg-teal/5 border-l-2 border-l-teal"
                      : "hover:bg-slate-50",
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
                          <span className="font-semibold text-navy text-sm truncate">
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
                        <span className="text-xs text-slate-500">
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
                        <p className="text-sm text-slate-500 truncate">
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
              "absolute lg:static inset-y-0 right-0 z-30 bg-white border-l border-slate-200 overflow-y-auto shadow-xl lg:shadow-none transition-transform duration-300",
              showInfoPanel 
                ? "translate-x-0 lg:translate-x-0 flex flex-col w-full sm:w-80" 
                : "translate-x-full lg:translate-x-0 lg:hidden"
            )}>
              {/* Client Header */}
              <div className="p-6 border-b border-slate-100 text-center">
                <ChatAvatar
                  name={selectedConvData?.client.name || "Unknown"}
                  size="3xl"
                  showOnlineIndicator={false}
                  className="mx-auto mb-3"
                />
                <h3 className="font-bold text-navy text-lg flex items-center justify-center gap-1">
                  {selectedConvData?.client.name ||
                    selectedConversation.participants?.[0]?.fullName ||
                    "Unknown"}
                  <BadgeCheck size={16} className="text-teal" />
                </h3>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <Star size={14} className="text-gold fill-gold" />
                  <span className="text-sm text-slate-600">
                    {selectedConvData?.client.rating || 0} (
                    {selectedConvData?.client.reviews || 0} reviews)
                  </span>
                </div>
              </div>

              {/* Company Details */}
              <div className="p-6 border-b border-slate-100">
                <h4 className="text-sm font-semibold text-navy mb-4">
                  Client Details
                </h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Building2 size={16} className="text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-slate-500">Company</p>
                      <p className="text-sm font-medium text-navy">
                        {selectedConvData?.client.company || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Building2 size={16} className="text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-slate-500">Location</p>
                      <p className="text-sm font-medium text-navy">
                        {selectedConvData?.client.location || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Project Reference */}
              <div className="p-6 border-b border-slate-100">
                <h4 className="text-sm font-semibold text-navy mb-4">
                  Project Reference
                </h4>
                <div className="bg-slate-50 rounded-xl p-4">
                  <h5 className="font-medium text-navy mb-2">
                    {selectedConversation.project?.title || "Project"}
                  </h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Status</span>
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-teal/10 text-teal">
                        Active
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="p-6">
                <h4 className="text-sm font-semibold text-navy mb-4">
                  Quick Actions
                </h4>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start border-slate-200"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center gap-3 p-5 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-teal/10 flex items-center justify-center">
                <FileSignature size={20} className="text-teal" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-navy">
                  Terms & Conditions
                </h2>
                <p className="text-sm text-slate-500">
                  Please read and accept before chatting
                </p>
              </div>
              <button
                onClick={() => {
                  setShowTermsModal(false);
                }}
                className="ml-auto p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-slate-500" />
              </button>
            </div>

            {/* Terms Content */}
            <div className="p-5">
              <div className="bg-slate-50 rounded-xl p-4 h-64 overflow-y-auto text-sm text-slate-600 leading-relaxed whitespace-pre-line border border-slate-100">
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
                  className="mt-1 w-4 h-4 rounded border-slate-300 text-teal focus:ring-teal"
                />
                <span className="text-sm text-navy">
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
            <div className="flex gap-3 p-5 border-t border-slate-100 bg-slate-50">
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
