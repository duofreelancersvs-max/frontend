import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useOutletContext } from "react-router-dom";
import type { ClientLayoutContext } from "@/layouts/ClientLayout";
import {
  Search,
  Settings,
  Bell,
  ChevronDown,
  LogOut,
  User,
  Menu,
  Send,
  Paperclip,
  MoreVertical,
  Phone,
  Video,
  Check,
  CheckCheck,
  Image,
  Smile,
  MessageSquare,
  ExternalLink,
  Shield,
  Ban,
  Verified,
  ArrowLeft,
  CreditCard,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { conversationService } from "@/services";
import type { Conversation, Message } from "@/services";
import { useAuth } from "@/hooks/useAuth";
import { useSocket } from "@/hooks/useSocket";
import type { SocketMessage, SocketConversation } from "@/lib/socket";

const ClientMessages = () => {
  const { user } = useAuth();
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
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");

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
      // Add to message list if it's for the active conversation
      if (
        selectedConversation &&
        socketMsg.conversationId === selectedConversation.id
      ) {
        setMessages((prev) => {
          // Avoid duplicates
          if (prev.some((m) => m.id === mapped.id)) return prev;
          return [...prev, mapped];
        });
      }
      // Update conversation list last message
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
        const data = await conversationService.getAll();
        setConversations(data.conversations || []);
        if (data.conversations?.length > 0) {
          setSelectedConversation(data.conversations[0]);
        }
      } catch (error) {
        console.error("Error fetching conversations:", error);
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
        // Mark as read when opening a conversation
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

  const conversationsData = conversations.map((conv) => ({
    id: conv.id,
    freelancer: {
      userId: conv.participants?.[0]?.id || "",
      name: conv.participants?.[0]?.fullName || "Unknown",
      avatar: conv.participants?.[0]?.avatar,
      verified: true,
      rating: 4.5,
      reviews: 10,
      skills: ["Video Editing"],
      online: false,
      title: "Freelancer",
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
    unread: conv.unreadCount,
    termsAccepted: true,
  }));

  const selectedConvo = conversationsData.find(
    (c) => c.id === (selectedConversation ? selectedConversation.id : null),
  );

  const filteredConversations = conversationsData.filter((conv) => {
    const matchesSearch = conv.freelancer.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesFilter =
      filter === "all" || (filter === "unread" && conv.unread > 0);
    return matchesSearch && matchesFilter;
  });

  const handleSelectConversation = (id: string | number) => {
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
      } catch (error) {
        console.error("Error accepting terms:", error);
      }
    }
    setShowTermsModal(false);
    setMobileView("chat");
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation || !isConnected) return;

    const content = messageInput;
    setMessageInput("");
    socketSendMessage(selectedConversation.id, content);
    // Incoming message arrives via message:new socket event
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
          <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2 p-1 pr-2 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-royal-blue to-teal flex items-center justify-center text-white font-bold text-sm">
                RK
              </div>
              <ChevronDown
                size={16}
                className="text-slate-500 hidden sm:block"
              />
            </button>
            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50">
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="font-semibold text-navy">Rajesh Kumar</p>
                  <p className="text-sm text-slate-500">rajesh@company.com</p>
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
                <button className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full">
                  <LogOut size={16} /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Chat Container - Fixed Height */}
      <div className="flex-1 flex overflow-hidden bg-slate-100">
        {/* COLUMN 1 - CONVERSATION LIST */}
        <div
          className={cn(
            "w-full md:w-80 bg-white border-r border-slate-200 flex flex-col flex-shrink-0",
            mobileView === "chat" && "hidden md:flex",
          )}
        >
          {/* Search */}
          <div className="p-4 border-b border-slate-100">
            <div className="relative mb-3">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 bg-slate-50 border-slate-200 text-sm"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter("all")}
                className={cn(
                  "px-4 py-1.5 rounded-full text-sm font-medium transition-all",
                  filter === "all"
                    ? "bg-teal text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200",
                )}
              >
                All
              </button>
              <button
                onClick={() => setFilter("unread")}
                className={cn(
                  "px-4 py-1.5 rounded-full text-sm font-medium transition-all",
                  filter === "unread"
                    ? "bg-teal text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200",
                )}
              >
                Unread
              </button>
            </div>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => handleSelectConversation(conv.id)}
                className={cn(
                  "w-full px-4 py-3 flex gap-3 hover:bg-slate-50 transition-colors text-left border-l-3",
                  selectedConversation?.id === conv.id
                    ? "bg-teal/5 border-l-teal border-l-[3px]"
                    : "border-l-transparent",
                )}
              >
                <div className="relative flex-shrink-0">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-royal-blue to-teal flex items-center justify-center text-white font-semibold text-sm">
                    {conv.freelancer.avatar}
                  </div>
                  {(conv.freelancer.online ||
                    onlineUsers.has(conv.freelancer.userId || "")) && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-navy text-sm">
                        {conv.freelancer.name}
                      </span>
                      {conv.freelancer.verified && (
                        <Verified size={14} className="text-teal" />
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {conv.lastMessageTime}
                    </span>
                  </div>
                  {conv.project && (
                    <p className="text-xs text-teal font-medium mb-0.5 truncate">
                      {conv.project.title}
                    </p>
                  )}
                  <p className="text-xs text-slate-500 truncate">
                    {conv.lastMessage}
                  </p>
                </div>
                {conv.unread > 0 && (
                  <span className="self-center px-2 py-0.5 bg-teal text-white text-xs font-bold rounded-full min-w-[20px] text-center">
                    {conv.unread}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* COLUMN 2 - CHAT AREA */}
        <div
          className={cn(
            "flex-1 flex flex-col bg-slate-50 min-w-0",
            mobileView === "list" && "hidden md:flex",
          )}
        >
          {selectedConvo ? (
            <>
              {/* Chat Header */}
              <div className="h-16 bg-white border-b border-slate-200 px-4 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setMobileView("list")}
                    className="md:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    <ArrowLeft size={20} />
                  </button>
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-royal-blue to-teal flex items-center justify-center text-white font-semibold text-sm">
                      {selectedConvo.freelancer.avatar}
                    </div>
                    {selectedConvo.freelancer.online && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-semibold text-navy text-sm">
                        {selectedConvo.freelancer.name}
                      </h3>
                      {selectedConvo.freelancer.verified && (
                        <Verified size={14} className="text-teal" />
                      )}
                    </div>
                    {selectedConvo.project ? (
                      <p className="text-xs text-teal">
                        {selectedConvo.project.title}
                      </p>
                    ) : (
                      <p className="text-xs text-slate-500">
                        {selectedConvo.freelancer.online ? "Online" : "Offline"}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg">
                    <Phone size={18} />
                  </button>
                  <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg">
                    <Video size={18} />
                  </button>
                  <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg">
                    <MoreVertical size={18} />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 lg:px-6 py-4">
                {messages.map((msg, index) => {
                  const msgDate = new Date(msg.createdAt).toLocaleDateString();
                  const msgTime = new Date(msg.createdAt).toLocaleTimeString(
                    "en-US",
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                    },
                  );
                  const prevMsgDate =
                    index > 0
                      ? new Date(
                          messages[index - 1].createdAt,
                        ).toLocaleDateString()
                      : null;
                  const showDate = index === 0 || msgDate !== prevMsgDate;
                  const isClient = msg.senderId === user?._id;

                  return (
                    <div key={msg.id}>
                      {showDate && (
                        <div className="flex justify-center my-4">
                          <span className="px-3 py-1 bg-slate-200/80 text-slate-500 text-xs font-medium rounded-full">
                            {msgDate}
                          </span>
                        </div>
                      )}
                      <div
                        className={cn(
                          "flex mb-3",
                          isClient ? "justify-end" : "justify-start",
                        )}
                      >
                        <div className={cn("max-w-[70%]")}>
                          <div
                            className={cn(
                              "px-4 py-2.5 rounded-2xl text-sm",
                              isClient
                                ? "bg-teal text-white rounded-br-sm"
                                : "bg-white text-slate-700 rounded-bl-sm shadow-sm border border-slate-100",
                            )}
                          >
                            {msg.content}
                          </div>
                          <div
                            className={cn(
                              "flex items-center gap-1 mt-1 px-1",
                              isClient ? "justify-end" : "justify-start",
                            )}
                          >
                            <span className="text-[10px] text-slate-400">
                              {msgTime}
                            </span>
                            {isClient &&
                              (msg.read ? (
                                <CheckCheck size={12} className="text-teal" />
                              ) : (
                                <Check size={12} className="text-slate-400" />
                              ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="bg-white border-t border-slate-200 p-4 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg">
                    <Paperclip size={20} />
                  </button>
                  <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg hidden sm:block">
                    <Image size={20} />
                  </button>
                  <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg hidden sm:block">
                    <Smile size={20} />
                  </button>
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    className="flex-1 h-10 px-4 rounded-full bg-slate-100 border-0 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim()}
                    className="h-10 w-10 p-0 rounded-full bg-teal hover:bg-teal-light text-white disabled:opacity-50"
                  >
                    <Send size={18} />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center mb-4">
                <MessageSquare size={28} className="text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-navy mb-1">
                Select a conversation
              </h3>
              <p className="text-sm text-slate-500">
                Choose a conversation to start messaging
              </p>
            </div>
          )}
        </div>

        {/* COLUMN 3 - FREELANCER INFO */}
        {selectedConvo && (
          <div className="hidden xl:flex w-72 bg-white border-l border-slate-200 flex-col flex-shrink-0">
            <div className="p-6 text-center border-b border-slate-100">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-royal-blue to-teal flex items-center justify-center text-white font-bold text-xl mx-auto mb-3">
                {selectedConvo.freelancer.avatar}
              </div>
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <h3 className="font-bold text-navy">
                  {selectedConvo.freelancer.name}
                </h3>
                {selectedConvo.freelancer.verified && (
                  <Verified size={16} className="text-teal" />
                )}
              </div>
              <p className="text-sm text-slate-500 mb-3">
                {selectedConvo.freelancer.title}
              </p>
              <div className="flex items-center justify-center gap-3 text-sm mb-4">
                <div className="flex items-center gap-1">
                  <Star size={14} className="text-gold fill-gold" />
                  <span className="font-semibold text-navy">
                    {selectedConvo.freelancer.rating}
                  </span>
                </div>
                <span className="text-slate-300">•</span>
                <span className="text-slate-500">
                  {selectedConvo.freelancer.reviews} reviews
                </span>
              </div>
            </div>

            {selectedConvo.project && (
              <div className="p-5 border-b border-slate-100">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  Related Project
                </h4>
                <Link
                  to={`/client/project/${selectedConvo.project.id}`}
                  className="block p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <p className="font-medium text-navy text-sm mb-1">
                    {selectedConvo.project.title}
                  </p>
                  <span className="text-xs text-teal flex items-center gap-1">
                    <ExternalLink size={12} /> View Project
                  </span>
                </Link>
              </div>
            )}

            <div className="p-5 space-y-2">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Quick Actions
              </h4>
              <Link to={`/freelancer/${selectedConvo.id}`} className="block">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start h-9 text-sm border-slate-200"
                >
                  <User size={14} className="mr-2" /> View Profile
                </Button>
              </Link>
              <Button
                size="sm"
                className="w-full justify-start h-9 text-sm bg-teal hover:bg-teal-light text-white"
              >
                <CreditCard size={14} className="mr-2" /> Hire Freelancer
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start h-9 text-sm text-red-500 hover:bg-red-50"
              >
                <Ban size={14} className="mr-2" /> Block User
              </Button>
            </div>

            <div className="mt-auto p-5 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "w-2.5 h-2.5 rounded-full",
                    selectedConvo.freelancer.online
                      ? "bg-green-500"
                      : "bg-slate-300",
                  )}
                />
                <span className="text-sm text-slate-500">
                  {selectedConvo.freelancer.online
                    ? "Online now"
                    : "Last seen recently"}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* TERMS MODAL */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl">
            <div className="p-5 border-b border-slate-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal/10 flex items-center justify-center">
                <Shield size={20} className="text-teal" />
              </div>
              <div>
                <h3 className="font-bold text-navy">Terms & Conditions</h3>
                <p className="text-xs text-slate-500">
                  Please read and accept before chatting
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 text-sm text-slate-600 leading-relaxed">
              <h4 className="font-semibold text-navy mb-2">
                Communication Guidelines
              </h4>
              <ul className="list-disc pl-5 space-y-2 mb-4">
                <li>
                  <strong>Professional Conduct:</strong> All communications must
                  remain professional and respectful.
                </li>
                <li>
                  <strong>No Off-Platform Transactions:</strong> All payments
                  must be processed through ConnectMe.
                </li>
                <li>
                  <strong>Privacy Protection:</strong> Do not share personal
                  contact information until a contract is in place.
                </li>
                <li>
                  <strong>Message Retention:</strong> All messages are stored
                  securely for dispute resolution.
                </li>
              </ul>
              <h4 className="font-semibold text-navy mb-2">
                User Responsibilities
              </h4>
              <ul className="list-disc pl-5 space-y-2">
                <li>Providing accurate project information</li>
                <li>Responding to queries in a timely manner</li>
                <li>Making payments as per agreed terms</li>
              </ul>
            </div>

            <div className="p-5 border-t border-slate-100 space-y-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-slate-300 text-teal focus:ring-teal"
                />
                <span className="text-sm text-slate-600">
                  I agree to the{" "}
                  <span className="text-teal font-medium">
                    Terms and Conditions
                  </span>
                </span>
              </label>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowTermsModal(false);
                    setSelectedConversation(null);
                    setTermsAccepted(false);
                  }}
                  className="flex-1 h-10 border-slate-200"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAcceptTerms}
                  disabled={!termsAccepted}
                  className="flex-1 h-10 bg-teal hover:bg-teal-light text-white disabled:opacity-50"
                >
                  Start Chat
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientMessages;
