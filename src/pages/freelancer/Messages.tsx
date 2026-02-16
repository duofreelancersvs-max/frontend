import { useState, useRef, useEffect } from "react";
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
  Clock,
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

// Mock conversations data
const mockConversations = [
  {
    id: 1,
    client: {
      name: "TechMart Solutions",
      avatar: null,
      verified: true,
      rating: 4.8,
      reviews: 45,
      company: "TechMart Solutions Pvt Ltd",
      location: "Mumbai, Maharashtra",
    },
    project: {
      id: 101,
      title: "E-commerce Product Video",
      status: "In Progress",
      budget: "₹15,000 - ₹20,000",
    },
    lastMessage: "Great! Looking forward to seeing the first draft.",
    lastMessageTime: "2 min ago",
    unreadCount: 2,
    isOnline: true,
    hireStatus: "Hired",
    termsAccepted: true,
  },
  {
    id: 2,
    client: {
      name: "InnovateCorp",
      avatar: null,
      verified: true,
      rating: 4.9,
      reviews: 72,
      company: "InnovateCorp Technologies",
      location: "Bangalore, Karnataka",
    },
    project: {
      id: 102,
      title: "Corporate Explainer Animation",
      status: "Pending",
      budget: "₹25,000 - ₹35,000",
    },
    lastMessage: "Can you share your portfolio for motion graphics?",
    lastMessageTime: "1 hour ago",
    unreadCount: 0,
    isOnline: false,
    hireStatus: "Interviewing",
    termsAccepted: true,
  },
  {
    id: 3,
    client: {
      name: "Brand Boost Agency",
      avatar: null,
      verified: true,
      rating: 4.6,
      reviews: 89,
      company: "Brand Boost Digital Agency",
      location: "Delhi NCR",
    },
    project: {
      id: 103,
      title: "Social Media Ad Creatives",
      status: "New",
      budget: "₹10,000 - ₹15,000",
    },
    lastMessage: "Hi! I saw your application and would like to discuss.",
    lastMessageTime: "3 hours ago",
    unreadCount: 1,
    isOnline: true,
    hireStatus: "New Inquiry",
    termsAccepted: false,
  },
  {
    id: 4,
    client: {
      name: "Moments Photography",
      avatar: null,
      verified: false,
      rating: 4.7,
      reviews: 56,
      company: "Moments Wedding Photography",
      location: "Chennai, Tamil Nadu",
    },
    project: {
      id: 104,
      title: "Wedding Highlight Reel",
      status: "Completed",
      budget: "₹800 - ₹1,200/hr",
    },
    lastMessage: "Thank you for the amazing work!",
    lastMessageTime: "2 days ago",
    unreadCount: 0,
    isOnline: false,
    hireStatus: "Completed",
    termsAccepted: true,
  },
];

// Mock messages for selected conversation
const mockMessages = [
  {
    id: 1,
    senderId: "client",
    text: "Hi! I loved your portfolio and would like to discuss my project with you.",
    timestamp: "10:30 AM",
    status: "read",
  },
  {
    id: 2,
    senderId: "me",
    text: "Thank you! I'd be happy to discuss your project. Can you share more details about what you're looking for?",
    timestamp: "10:35 AM",
    status: "read",
  },
  {
    id: 3,
    senderId: "client",
    text: "Sure! We need a product video for our e-commerce platform. About 60-90 seconds, showcasing 5 products.",
    timestamp: "10:40 AM",
    status: "read",
  },
  {
    id: 4,
    senderId: "client",
    text: "We want a modern, clean look with some motion graphics for transitions.",
    timestamp: "10:41 AM",
    status: "read",
  },
  {
    id: 5,
    senderId: "me",
    text: "That sounds great! I have experience with similar projects. I can definitely help with this. Do you have any reference videos in mind?",
    timestamp: "10:45 AM",
    status: "read",
  },
  {
    id: 6,
    senderId: "client",
    text: "Yes, I'll share some references. Also, what would be your timeline and rate for this?",
    timestamp: "11:00 AM",
    status: "read",
  },
  {
    id: 7,
    senderId: "me",
    text: "Based on the scope, I can complete this in about 1-2 weeks. My rate would be ₹1,200/hour or we can discuss a fixed price.",
    timestamp: "11:10 AM",
    status: "read",
  },
  {
    id: 8,
    senderId: "client",
    text: "Great! Looking forward to seeing the first draft.",
    timestamp: "11:15 AM",
    status: "delivered",
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showInfoPanel, setShowInfoPanel] = useState(true);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [pendingConversation, setPendingConversation] = useState<Conversation | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true);
        const data = await conversationService.getAll();
        setConversations(data.conversations || []);
        if (data.conversations?.length > 0) {
          setSelectedConversation(data.conversations[0]);
        }
      } catch (error) {
        console.error("Error fetching conversations:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedConversation) return;
      try {
        const data = await conversationService.getMessages(selectedConversation.id);
        setMessages(data.messages || []);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };
    fetchMessages();
  }, [selectedConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const mockConversations = conversations.map(conv => ({
    id: conv.id,
    client: {
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
    lastMessageTime: conv.lastMessage ? new Date(conv.lastMessage.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "",
    unreadCount: conv.unreadCount,
    termsAccepted: true,
  }));

  const handleSelectConversation = (conversation: typeof mockConversations[0]) => {
    const conv = conversations.find(c => c.id === conversation.id);
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
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const msg = await conversationService.sendMessage(selectedConversation.id, newMessage);
      setMessages(prev => [...prev, msg]);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredConversations = mockConversations.filter(
    (conv) =>
      conv.client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.project.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Progress":
        return "bg-teal/10 text-teal";
      case "Completed":
        return "bg-success-green/10 text-success-green";
      case "Pending":
        return "bg-gold/10 text-gold";
      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  const getHireStatusColor = (status: string) => {
    switch (status) {
      case "Hired":
        return "bg-success-green text-white";
      case "Interviewing":
        return "bg-royal-blue text-white";
      case "Completed":
        return "bg-slate-500 text-white";
      default:
        return "bg-gold text-white";
    }
  };

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
                subscriptionPlan === "Free" ? "bg-slate-500/20" : "bg-gold/20",
              )}
            >
              <Award
                size={16}
                className={
                  subscriptionPlan === "Free" ? "text-slate-400" : "text-gold"
                }
              />
              <span
                className={cn(
                  "text-xs font-semibold",
                  subscriptionPlan === "Free" ? "text-slate-400" : "text-gold",
                )}
              >
                {subscriptionPlan} Plan
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
                      {conv.isOnline && (
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
                            getStatusColor(conv.project.status),
                          )}
                        >
                          {conv.project.status}
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
                        {selectedConversation.client.name.charAt(0)}
                      </div>
                      {selectedConversation.isOnline && (
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-success-green rounded-full border-2 border-white" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-navy">
                          {selectedConversation.client.name}
                        </h3>
                        {selectedConversation.client.verified && (
                          <BadgeCheck size={14} className="text-teal" />
                        )}
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded text-xs font-medium",
                            getHireStatusColor(selectedConversation.hireStatus),
                          )}
                        >
                          {selectedConversation.hireStatus}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        {selectedConversation.isOnline ? "Online" : "Offline"}
                        {" • "}
                        {selectedConversation.project.title}
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
                        msg.senderId === "me" ? "justify-end" : "justify-start",
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[70%] rounded-2xl px-4 py-3",
                          msg.senderId === "me"
                            ? "bg-teal text-white rounded-br-sm"
                            : "bg-white text-navy shadow-sm rounded-bl-sm",
                        )}
                      >
                        <p className="text-sm">{msg.text}</p>
                        <div
                          className={cn(
                            "flex items-center gap-1 mt-1",
                            msg.senderId === "me"
                              ? "justify-end"
                              : "justify-start",
                          )}
                        >
                          <span
                            className={cn(
                              "text-xs",
                              msg.senderId === "me"
                                ? "text-white/70"
                                : "text-slate-400",
                            )}
                          >
                            {msg.timestamp}
                          </span>
                          {msg.senderId === "me" && (
                            <span className="text-white/70">
                              {msg.status === "read" ? (
                                <CheckCheck size={14} />
                              ) : msg.status === "delivered" ? (
                                <Check size={14} />
                              ) : (
                                <Clock size={12} />
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
                        onKeyPress={handleKeyPress}
                        placeholder="Type a message..."
                        rows={1}
                        className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none resize-none text-navy"
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
                  {selectedConversation.client.name.charAt(0)}
                </div>
                <h3 className="font-bold text-navy text-lg flex items-center justify-center gap-1">
                  {selectedConversation.client.name}
                  {selectedConversation.client.verified && (
                    <BadgeCheck size={16} className="text-teal" />
                  )}
                </h3>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <Star size={14} className="text-gold fill-gold" />
                  <span className="text-sm text-slate-600">
                    {selectedConversation.client.rating} (
                    {selectedConversation.client.reviews} reviews)
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
                        {selectedConversation.client.company}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Building2 size={16} className="text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-slate-500">Location</p>
                      <p className="text-sm font-medium text-navy">
                        {selectedConversation.client.location}
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
                    {selectedConversation.project.title}
                  </h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Budget</span>
                      <span className="font-medium text-navy">
                        {selectedConversation.project.budget}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Status</span>
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded text-xs font-medium",
                          getStatusColor(selectedConversation.project.status),
                        )}
                      >
                        {selectedConversation.project.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Hire Status</span>
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded text-xs font-medium",
                          getHireStatusColor(selectedConversation.hireStatus),
                        )}
                      >
                        {selectedConversation.hireStatus}
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
                  {selectedConversation.hireStatus === "Interviewing" && (
                    <Button className="w-full justify-start bg-teal hover:bg-teal-light text-white">
                      <FileSignature size={16} className="mr-2" />
                      Send Proposal
                    </Button>
                  )}
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
