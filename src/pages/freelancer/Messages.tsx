import { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Home,
  User,
  FolderOpen,
  Search,
  FileText,
  Mail,
  CreditCard,
  DollarSign,
  Star,
  Settings,
  LogOut,
  Award,
  X,
  Menu,
  Send,
  Paperclip,
  Smile,
  MoreVertical,
  Phone,
  Video,
  Check,
  CheckCheck,
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
import { useAuth } from "@/hooks/useAuth";
import { useSocket } from "@/hooks/useSocket";
import type { SocketMessage, SocketConversation } from "@/lib/socket";

// Sidebar Navigation Items for Freelancer
const sidebarNavItems = [
  {
    icon: Home,
    label: "Dashboard",
    href: "/freelancer/dashboard",
    active: false,
  },
  { icon: User, label: "My Profile", href: "/freelancer/profile", badge: null },
  {
    icon: FolderOpen,
    label: "Portfolio",
    href: "/freelancer/portfolio",
    badge: null,
  },
  { icon: Search, label: "Browse Projects", href: "/projects", badge: null },
  {
    icon: FileText,
    label: "My Applications",
    href: "/freelancer/applications",
    badge: "3",
  },
  {
    icon: Mail,
    label: "Messages",
    href: "/freelancer/messages",
    active: true,
    badge: "5",
  },
  {
    icon: CreditCard,
    label: "Subscription",
    href: "/freelancer/subscription",
    badge: null,
  },
  {
    icon: DollarSign,
    label: "Earnings",
    href: "/freelancer/earnings",
    badge: null,
  },
  { icon: Star, label: "Reviews", href: "/freelancer/reviews", badge: null },
  {
    icon: Settings,
    label: "Settings",
    href: "/freelancer/settings",
    badge: null,
  },
];

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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showInfoPanel, setShowInfoPanel] = useState(true);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [pendingConversation, setPendingConversation] =
    useState<Conversation | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [_loading, _setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ─── Socket.IO integration ──────────────────────────────────────

  const handleNewMessage = useCallback(
    (socketMsg: SocketMessage, _conv: SocketConversation) => {
      const mapped: Message = {
        id: socketMsg._id,
        conversationId: socketMsg.conversationId,
        senderId: socketMsg.senderId,
        content: socketMsg.content,
        read: socketMsg.isRead,
        createdAt: socketMsg.createdAt,
      };
      if (
        selectedConversation &&
        socketMsg.conversationId === selectedConversation.id
      ) {
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
    [selectedConversation],
  );

  const handleMessageRead = useCallback(
    (data: { conversationId: string; userId: string; readAt: string }) => {
      if (data.conversationId === selectedConversation?.id) {
        setMessages((prev) =>
          prev.map((m) =>
            m.senderId === user?._id ? { ...m, read: true } : m,
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

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        _setLoading(true);
        const data = await conversationService.getAll();
        setConversations(data.conversations || []);
        if (data.conversations?.length > 0) {
          setSelectedConversation(data.conversations[0]);
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
      try {
        const data = await conversationService.getMessages(
          selectedConversation.id,
        );
        setMessages(data.messages || []);
        markAsRead(selectedConversation.id);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };
    fetchMessages();
  }, [selectedConversation, markAsRead]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const conversationsDataMapped = conversations.map((conv) => ({
    id: conv.id,
    client: {
      userId: conv.participants?.[0]?.id || "",
      name: conv.participants?.[0]?.fullName || "Unknown",
      avatar: conv.participants?.[0]?.avatar,
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
    isOnline: onlineUsers.has(conv.participants?.[0]?.id || ""),
    termsAccepted: true,
  }));

  const handleSelectConversation = (
    conversation: (typeof conversationsDataMapped)[0],
  ) => {
    const conv = conversations.find((c) => c.id === conversation.id);
    if (conv) {
      setSelectedConversation(conv);
    }
  };

  const handleAcceptTerms = async () => {
    if (pendingConversation && selectedConversation) {
      try {
        await conversationService.acceptTerms(selectedConversation.id);
        setShowTermsModal(false);
        setPendingConversation(null);
      } catch (error) {
        console.error("Error accepting terms:", error);
      }
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !isConnected) return;

    const content = newMessage;
    setNewMessage("");
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

  const emojis = [
    "😊",
    "👍",
    "🎉",
    "💯",
    "🙏",
    "✨",
    "🔥",
    "❤️",
    "😄",
    "👏",
    "💪",
    "🚀",
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* SIDEBAR */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen w-64 bg-navy transition-transform duration-300 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-6 border-b border-white/10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal to-teal-light flex items-center justify-center text-white font-bold text-lg">
              C
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-white tracking-tight">
                ConnectMe
              </span>
              <span className="text-[10px] font-semibold tracking-widest uppercase -mt-1 text-teal-light">
                India
              </span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden ml-auto text-white/60 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {sidebarNavItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                  item.active
                    ? "bg-white/10 text-white"
                    : "text-white/60 hover:bg-white/5 hover:text-white",
                )}
              >
                <item.icon size={20} />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="px-2 py-0.5 text-xs font-bold bg-teal text-white rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          {/* Subscription Badge */}
          <div className="px-4 pb-2">
            <div
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg",
                "bg-gold/20",
              )}
            >
              <Award size={16} className="text-gold" />
              <span className={cn("text-xs font-semibold", "text-gold")}>
                Pro Plan
              </span>
            </div>
          </div>

          {/* User Profile Card */}
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-royal-blue to-teal flex items-center justify-center text-white font-bold text-sm">
                AK
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  Arun Kumar
                </p>
                <p className="text-xs text-white/50">Freelancer</p>
              </div>
              <button className="text-white/50 hover:text-white transition-colors">
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* SIDEBAR OVERLAY (Mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* MAIN CONTENT - Three Column Layout */}
      <div className="lg:ml-64 h-screen flex flex-col">
        {/* Header Bar */}
        <header className="bg-white border-b border-slate-200 px-4 lg:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              <Menu size={24} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-navy">Messages</h1>
              <p className="text-sm text-slate-500 hidden sm:block">
                Communicate with your clients
              </p>
            </div>
          </div>
        </header>

        {/* Three Column Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* COLUMN 1: Conversations List */}
          <div className="w-80 border-r border-slate-200 bg-white flex flex-col">
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
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-royal-blue to-teal flex items-center justify-center text-white font-bold text-sm">
                        {conv.client.name.charAt(0)}
                      </div>
                      {(conv.isOnline ||
                        onlineUsers.has(conv.client.userId || "")) && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-success-green rounded-full border-2 border-white" />
                      )}
                    </div>

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
                      <div className="flex items-center justify-between">
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
          <div className="flex-1 flex flex-col bg-slate-50">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-royal-blue to-teal flex items-center justify-center text-white font-bold text-sm">
                        {(
                          selectedConvData?.client.name ||
                          selectedConversation.participants?.[0]?.fullName ||
                          "U"
                        ).charAt(0)}
                      </div>
                      {onlineUsers.has(
                        selectedConvData?.client.userId || "",
                      ) && (
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-success-green rounded-full border-2 border-white" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-navy">
                          {selectedConvData?.client.name ||
                            selectedConversation.participants?.[0]?.fullName ||
                            "Unknown"}
                        </h3>
                        <BadgeCheck size={14} className="text-teal" />
                      </div>
                      <p className="text-xs text-slate-500">
                        {onlineUsers.has(selectedConvData?.client.userId || "")
                          ? "Online"
                          : "Offline"}
                        {" • "}
                        {selectedConversation.project?.title || "Project"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500">
                      <Phone size={18} />
                    </button>
                    <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500">
                      <Video size={18} />
                    </button>
                    <button
                      onClick={() => setShowInfoPanel(!showInfoPanel)}
                      className={cn(
                        "p-2 rounded-lg transition-colors",
                        showInfoPanel
                          ? "bg-teal/10 text-teal"
                          : "hover:bg-slate-100 text-slate-500",
                      )}
                    >
                      <MoreVertical size={18} />
                    </button>
                  </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex",
                        msg.senderId === user?._id
                          ? "justify-end"
                          : "justify-start",
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[70%] rounded-2xl px-4 py-3",
                          msg.senderId === user?._id
                            ? "bg-teal text-white rounded-br-sm"
                            : "bg-white text-navy shadow-sm rounded-bl-sm",
                        )}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <div
                          className={cn(
                            "flex items-center gap-1 mt-1",
                            msg.senderId === user?._id
                              ? "justify-end"
                              : "justify-start",
                          )}
                        >
                          <span
                            className={cn(
                              "text-xs",
                              msg.senderId === user?._id
                                ? "text-white/70"
                                : "text-slate-400",
                            )}
                          >
                            {new Date(msg.createdAt).toLocaleTimeString(
                              "en-US",
                              { hour: "2-digit", minute: "2-digit" },
                            )}
                          </span>
                          {msg.senderId === user?._id && (
                            <span className="text-white/70">
                              {msg.read ? (
                                <CheckCheck size={14} />
                              ) : (
                                <Check size={14} />
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="bg-white border-t border-slate-200 p-4">
                  <div className="flex items-end gap-3">
                    {/* Attachment Button */}
                    <div className="relative">
                      <button className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors text-slate-500">
                        <Paperclip size={20} />
                      </button>
                    </div>

                    {/* Input */}
                    <div className="flex-1 relative">
                      <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        placeholder="Type a message..."
                      />
                      {/* Emoji Button */}
                      <div className="absolute right-3 bottom-3">
                        <button
                          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                          className="p-1 hover:bg-slate-100 rounded transition-colors text-slate-400"
                        >
                          <Smile size={20} />
                        </button>

                        {/* Emoji Picker */}
                        {showEmojiPicker && (
                          <div className="absolute bottom-10 right-0 bg-white rounded-xl shadow-lg border border-slate-200 p-3 z-10">
                            <div className="grid grid-cols-6 gap-2">
                              {emojis.map((emoji) => (
                                <button
                                  key={emoji}
                                  onClick={() => {
                                    setNewMessage((prev) => prev + emoji);
                                    setShowEmojiPicker(false);
                                  }}
                                  className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded text-lg"
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Send Button */}
                    <Button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="bg-teal hover:bg-teal-light text-white px-4"
                    >
                      <Send size={18} />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <Mail size={48} className="mx-auto mb-4 text-slate-300" />
                  <h3 className="text-lg font-semibold text-navy mb-1">
                    Select a conversation
                  </h3>
                  <p className="text-slate-500">
                    Choose a conversation from the list to start messaging
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* COLUMN 3: Client Info Panel */}
          {showInfoPanel && selectedConversation && (
            <div className="w-80 border-l border-slate-200 bg-white overflow-y-auto">
              {/* Client Header */}
              <div className="p-6 border-b border-slate-100 text-center">
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-royal-blue to-teal flex items-center justify-center text-white font-bold text-2xl mb-3">
                  {(selectedConvData?.client.name || "U").charAt(0)}
                </div>
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
                  setPendingConversation(null);
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
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
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
                  setPendingConversation(null);
                }}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-teal hover:bg-teal-light text-white"
                disabled={!termsAccepted}
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
