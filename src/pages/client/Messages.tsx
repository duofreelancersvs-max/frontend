import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Home,
  Folder,
  PlusCircle,
  Search,
  Mail,
  CreditCard,
  Star,
  Settings,
  Bell,
  ChevronDown,
  LogOut,
  User,
  X,
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// Sidebar Navigation Items
const sidebarNavItems = [
  { icon: Home, label: "Dashboard", href: "/client/dashboard", active: false },
  { icon: Folder, label: "My Projects", href: "/client/projects", badge: null },
  {
    icon: PlusCircle,
    label: "Post Project",
    href: "/client/post-project",
    badge: null,
  },
  {
    icon: Search,
    label: "Find Freelancers",
    href: "/freelancers",
    badge: null,
  },
  {
    icon: Mail,
    label: "Messages",
    href: "/client/messages",
    active: true,
    badge: "3",
  },
  {
    icon: CreditCard,
    label: "Payments",
    href: "/client/payments",
    badge: null,
  },
  { icon: Star, label: "Reviews", href: "/client/reviews", badge: null },
  { icon: Settings, label: "Settings", href: "/client/settings", badge: null },
];

// Mock Conversations Data
const conversationsData = [
  {
    id: 1,
    freelancer: {
      name: "Arun Kumar",
      avatar: "AK",
      title: "Senior Video Editor",
      rating: 4.9,
      reviews: 47,
      verified: true,
      hourlyRate: 1500,
      online: true,
    },
    project: { id: 1, title: "E-commerce Product Video" },
    lastMessage: "Sure, I can deliver the first draft by tomorrow evening.",
    lastMessageTime: "2 min ago",
    unread: 2,
    termsAccepted: true,
  },
  {
    id: 2,
    freelancer: {
      name: "Priya Sharma",
      avatar: "PS",
      title: "Motion Graphics Artist",
      rating: 4.8,
      reviews: 32,
      verified: true,
      hourlyRate: 2000,
      online: true,
    },
    project: { id: 1, title: "E-commerce Product Video" },
    lastMessage: "Thank you for considering my proposal!",
    lastMessageTime: "1 hour ago",
    unread: 1,
    termsAccepted: true,
  },
  {
    id: 3,
    freelancer: {
      name: "Vikram Reddy",
      avatar: "VR",
      title: "Video Producer",
      rating: 4.7,
      reviews: 28,
      verified: false,
      hourlyRate: 1200,
      online: false,
    },
    project: { id: 2, title: "Corporate Explainer" },
    lastMessage: "I've attached some samples of my previous work.",
    lastMessageTime: "3 hours ago",
    unread: 0,
    termsAccepted: true,
  },
  {
    id: 4,
    freelancer: {
      name: "Meera Nair",
      avatar: "MN",
      title: "Creative Video Editor",
      rating: 5.0,
      reviews: 15,
      verified: true,
      hourlyRate: 1800,
      online: false,
    },
    project: null,
    lastMessage: "Hello! I saw your project listing.",
    lastMessageTime: "Yesterday",
    unread: 0,
    termsAccepted: false,
  },
];

// Mock Messages Data
const messagesData: Record<
  number,
  Array<{
    id: number;
    sender: "client" | "freelancer";
    message: string;
    time: string;
    date: string;
    read: boolean;
    attachment?: { name: string; type: string };
  }>
> = {
  1: [
    {
      id: 1,
      sender: "freelancer",
      message:
        "Hello! Thank you for shortlisting my proposal. I'm excited about this project!",
      time: "10:30 AM",
      date: "Today",
      read: true,
    },
    {
      id: 2,
      sender: "client",
      message:
        "Hi Arun! Your portfolio is impressive. I'd like to discuss the project timeline.",
      time: "10:35 AM",
      date: "Today",
      read: true,
    },
    {
      id: 3,
      sender: "freelancer",
      message:
        "Of course! Based on the requirements, I can complete the project in 2 weeks. The first draft can be ready in 5 days.",
      time: "10:38 AM",
      date: "Today",
      read: true,
    },
    {
      id: 4,
      sender: "client",
      message:
        "That sounds reasonable. Can you share some more samples of your e-commerce product videos?",
      time: "11:00 AM",
      date: "Today",
      read: true,
    },
    {
      id: 5,
      sender: "freelancer",
      message: "Yes, here are some samples from my recent e-commerce projects.",
      time: "11:15 AM",
      date: "Today",
      read: true,
      attachment: { name: "Portfolio_Samples.zip", type: "file" },
    },
    {
      id: 6,
      sender: "client",
      message: "These look great! Can you start on Monday?",
      time: "11:30 AM",
      date: "Today",
      read: true,
    },
    {
      id: 7,
      sender: "freelancer",
      message: "Sure, I can deliver the first draft by tomorrow evening.",
      time: "11:45 AM",
      date: "Today",
      read: false,
    },
  ],
  2: [
    {
      id: 1,
      sender: "freelancer",
      message: "Hi! I noticed your project for e-commerce product video.",
      time: "9:00 AM",
      date: "Today",
      read: true,
    },
    {
      id: 2,
      sender: "client",
      message: "Hi Priya, thanks for reaching out!",
      time: "9:15 AM",
      date: "Today",
      read: true,
    },
    {
      id: 3,
      sender: "freelancer",
      message: "Thank you for considering my proposal!",
      time: "10:00 AM",
      date: "Today",
      read: false,
    },
  ],
};

const ClientMessages = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [selectedConversation, setSelectedConversation] = useState<
    number | null
  >(1);
  const [messageInput, setMessageInput] = useState("");
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedConvo = conversationsData.find(
    (c) => c.id === selectedConversation,
  );
  const messages = selectedConversation
    ? messagesData[selectedConversation] || []
    : [];

  const filteredConversations = conversationsData.filter((conv) => {
    const matchesSearch = conv.freelancer.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesFilter =
      filter === "all" || (filter === "unread" && conv.unread > 0);
    return matchesSearch && matchesFilter;
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSelectConversation = (id: number) => {
    const convo = conversationsData.find((c) => c.id === id);
    if (convo && !convo.termsAccepted) {
      setSelectedConversation(id);
      setShowTermsModal(true);
    } else {
      setSelectedConversation(id);
      setMobileView("chat");
    }
  };

  const handleAcceptTerms = () => {
    setShowTermsModal(false);
    setMobileView("chat");
  };

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      setMessageInput("");
    }
  };

  return (
    <div className="h-screen bg-background font-sans overflow-hidden">
      {/* SIDEBAR */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-full w-64 bg-navy transition-transform duration-300 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal to-teal-light flex items-center justify-center text-white font-bold text-lg">
              C
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-white tracking-tight">
                ConnectMe
              </span>
              <span className="text-[10px] font-semibold tracking-widest uppercase text-teal-light">
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

          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
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

          <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-royal-blue to-teal flex items-center justify-center text-white font-bold text-sm">
                RK
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  Rajesh Kumar
                </p>
                <p className="text-xs text-white/50">Client Account</p>
              </div>
              <button className="text-white/50 hover:text-white transition-colors">
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* MAIN CONTENT */}
      <div className="lg:ml-64 h-full flex flex-col">
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
                    selectedConversation === conv.id
                      ? "bg-teal/5 border-l-teal border-l-[3px]"
                      : "border-l-transparent",
                  )}
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-royal-blue to-teal flex items-center justify-center text-white font-semibold text-sm">
                      {conv.freelancer.avatar}
                    </div>
                    {conv.freelancer.online && (
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
                          {selectedConvo.freelancer.online
                            ? "Online"
                            : "Offline"}
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
                    const showDate =
                      index === 0 || messages[index - 1]?.date !== msg.date;
                    return (
                      <div key={msg.id}>
                        {showDate && (
                          <div className="flex justify-center my-4">
                            <span className="px-3 py-1 bg-slate-200/80 text-slate-500 text-xs font-medium rounded-full">
                              {msg.date}
                            </span>
                          </div>
                        )}
                        <div
                          className={cn(
                            "flex mb-3",
                            msg.sender === "client"
                              ? "justify-end"
                              : "justify-start",
                          )}
                        >
                          <div className={cn("max-w-[70%]")}>
                            <div
                              className={cn(
                                "px-4 py-2.5 rounded-2xl text-sm",
                                msg.sender === "client"
                                  ? "bg-teal text-white rounded-br-sm"
                                  : "bg-white text-slate-700 rounded-bl-sm shadow-sm border border-slate-100",
                              )}
                            >
                              {msg.message}
                              {msg.attachment && (
                                <div
                                  className={cn(
                                    "mt-2 px-3 py-2 rounded-lg flex items-center gap-2 text-xs",
                                    msg.sender === "client"
                                      ? "bg-white/20"
                                      : "bg-slate-50",
                                  )}
                                >
                                  <Paperclip size={12} />
                                  {msg.attachment.name}
                                </div>
                              )}
                            </div>
                            <div
                              className={cn(
                                "flex items-center gap-1 mt-1 px-1",
                                msg.sender === "client"
                                  ? "justify-end"
                                  : "justify-start",
                              )}
                            >
                              <span className="text-[10px] text-slate-400">
                                {msg.time}
                              </span>
                              {msg.sender === "client" &&
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
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleSendMessage()
                      }
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
