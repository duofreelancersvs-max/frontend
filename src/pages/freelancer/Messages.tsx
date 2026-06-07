import { useState, useCallback, useRef, useEffect } from "react";
import { useOutletContext, useLocation, useNavigate } from "react-router-dom";
import type { FreelancerLayoutContext } from "@/layouts/FreelancerLayout";
import { cn } from "@/lib/utils";
import { conversationService } from "@/services";
import type { Conversation, Message } from "@/services";
import { useAuth } from "@/hooks/useAuth";
import DashboardHeader from "@/components/layouts/DashboardHeader";
import { useSocket } from "@/hooks/useSocket";
import type { SocketMessage, SocketConversation } from "@/lib/socket";
import {
  ConversationList,
  ChatArea,
  ChatInfoPanel,
  type ConversationItem,
  type ChatParticipant,
  type InfoPanelParticipant,
} from "@/components/chat";
import { TermsModal } from "@/components/modals/TermsModal";
import { useUnreadStore } from "@/stores/unread.store";
import { useFeatureGate } from "@/hooks/useFeatureGate";
import { useMyConversations as useConversations } from "@/hooks/queries/useFreelancerDashboardQueries";

export const termsText = `
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

interface FreelancerMessagesProps {
  isWidget?: boolean;
  onWidgetClose?: () => void;
}

const FreelancerMessages = ({ isWidget }: FreelancerMessagesProps = {}) => {
  const { user } = useAuth();
  const context = useOutletContext<FreelancerLayoutContext>();
  const setSidebarOpen = context?.setSidebarOpen || (() => {});
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const [conversationsLoaded, setConversationsLoaded] = useState(false);
  const deepLinkHandled = useRef(false);
  const { setActiveConversation, resetCount, addPendingMessage, getPendingMessages, clearPendingMessages } = useUnreadStore();

  // ─── Feature Gate: Messaging ────────────────────────────────────
  const { context: planContext, inTrial } = useFeatureGate(true); // true because this is the freelancer view
  const canMessage = inTrial || planContext?.tier === "pro";

  // Sync active conversation with unread store
  useEffect(() => {
    const activeId = selectedConversation?.id || selectedConversation?._id;
    setActiveConversation(activeId || null);
    return () => setActiveConversation(null);
  }, [selectedConversation, setActiveConversation]);

  // ─── Socket.IO integration ──────────────────────────────────────

  const handleNewMessage = useCallback(
    (socketMsg: SocketMessage, _conv: SocketConversation) => {
      console.log("[Socket] New message received:", socketMsg.id || socketMsg._id);
      
      const rawSenderId: any = socketMsg.senderId;
      const senderId = (
        typeof rawSenderId === 'object' && rawSenderId !== null
          ? (rawSenderId._id || rawSenderId.id || rawSenderId).toString()
          : (rawSenderId || '').toString()
      );

      const mapped: Message = {
        id: (socketMsg._id || socketMsg.id || "").toString(),
        conversationId: (socketMsg.conversationId || "").toString(),
        senderId,
        content: socketMsg.content,
        read: socketMsg.isRead ?? false,
        createdAt: socketMsg.createdAt || socketMsg.sentAt || new Date().toISOString(),
      };

      addPendingMessage(mapped);

      const selId = (selectedConversation?.id || selectedConversation?._id || "").toString();
      const msgConvId = mapped.conversationId;
      const isCurrentConv = selId && msgConvId === selId;

      const currentUserId = (user?._id || '').toString();

      if (isCurrentConv) {
        if (mapped.senderId !== currentUserId) {
          markAsRead(mapped.conversationId);
        }

        setMessages((prev) => {
          const filtered = prev.filter(m => 
            !(m.id.startsWith("temp-") && m.content === mapped.content && m.senderId === user?._id)
          );
          if (filtered.some((m) => (m.id === mapped.id))) return filtered;
          return [...filtered, mapped];
        });
      }

      setConversations((prev) =>
        prev.map((c) => {
          const cid = (c.id || c._id || "").toString();
          return cid === mapped.conversationId
            ? {
                ...c,
                lastMessage: {
                  ...mapped,
                  createdAt: mapped.createdAt
                },
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
      if (data.userId === user?._id?.toString()) return;

      const readConvId = data.conversationId.toString();
      const selId = (selectedConversation?.id || selectedConversation?._id || "").toString();
      
      if (readConvId === selId) {
        setMessages((prev) =>
          prev.map((m) =>
            m.senderId?.toString() === user?._id?.toString() ? { ...m, read: true } : m,
          ),
        );
      }
      
      setConversations((prev) =>
        prev.map((c) => {
          const cid = (c.id || c._id || "").toString();
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
    conversationId: selectedConversation?.id || selectedConversation?._id || null,
    onNewMessage: handleNewMessage,
    onMessageRead: handleMessageRead,
  });

  // ─── Data fetching ──────────────────────────────────────────────
  const { data: convData } = useConversations();

  useEffect(() => {
    if (convData?.conversations) {
      let convs = [...convData.conversations];
      
      convs = convs.sort((a, b) => {
        const dateA = a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt).getTime() : 0;
        const dateB = b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt).getTime() : 0;
        return dateB - dateA;
      });
      
      setConversations(prev => {
        if (prev.length === 0 || convs.length !== prev.length || convs[0]?.id !== prev[0]?.id) {
          return convs;
        }
        return prev;
      });
      
      if (convs.length > 0 && !selectedConversation && !deepLinkHandled.current) {
        setSelectedConversation(convs[0]);
      }
      
      setConversationsLoaded(true);
    }
  }, [convData?.conversations, selectedConversation]);

  // ── Deep-link: auto-select conversation from navigation state ──
  const location = useLocation();
  const nav = useNavigate();

  useEffect(() => {
    deepLinkHandled.current = false;
  }, [location.key]);

  useEffect(() => {
    const state = location.state as { conversationId?: string } | null;
    
    const handleDeepLink = async () => {
      if (!state || !conversationsLoaded || deepLinkHandled.current) return;
      
      if (state.conversationId) {
        deepLinkHandled.current = true;
        const target = conversations.find(
          (c) => c.id === state.conversationId || c._id === state.conversationId,
        );
        if (target) {
          setSelectedConversation(target);
          setMobileView("chat");
        }
        nav(location.pathname, { replace: true, state: {} });
      }
    };
    handleDeepLink();
  }, [location.state, conversationsLoaded, conversations, nav, location.pathname]);

  useEffect(() => {
    const fetchMessages = async () => {
      const activeId = selectedConversation?.id || selectedConversation?._id;
      if (!activeId) return;
      
      setMessages((prev) => 
        prev.filter(m => m.conversationId.toString() === activeId.toString())
      );

      const pendingMsgs = getPendingMessages(activeId.toString());

      try {
        const data = await conversationService.getMessages(activeId);
        setMessages((prev) => {
          const apiMessages = data.messages || [];
          const apiIds = new Set(apiMessages.map((m: any) => (m.id || m._id).toString()));
          const cid = activeId.toString();

          const uniqueLocal = prev.filter(m => 
            m.conversationId.toString() === cid && 
            !apiIds.has(m.id.toString())
          );

          const uniquePending = pendingMsgs.filter(p => !apiIds.has(p.id.toString()));
          
          const combined = [...apiMessages, ...uniqueLocal, ...uniquePending];
          return combined.sort((a, b) => 
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        });

        clearPendingMessages(activeId.toString());
        markAsRead(activeId);
        conversationService.markAsRead(activeId).catch(() => {});
        
        setConversations((prev) =>
          prev.map((c) =>
            (c.id === activeId || c._id === activeId) 
              ? { ...c, unreadCount: 0 } 
              : c,
          ),
        );
        resetCount(activeId);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };
    fetchMessages();
  }, [selectedConversation?.id, selectedConversation?._id, markAsRead, resetCount]);

  // ─── Derived data ───────────────────────────────────────────────

  const getClientParticipant = (conv: Conversation) =>
    conv.participants?.find((p) => p.role === "client") ||
    conv.participants?.[0];

  const selectedClient = selectedConversation
    ? getClientParticipant(selectedConversation)
    : null;

  const conversationItems: ConversationItem[] = conversations.map((conv) => {
    const client = getClientParticipant(conv);
    
    const projectTitle = conv.project?.title || "Project";
    const projectId = conv.projectId || conv.project?.id || "";

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
      id: conv.id || conv._id || "",
      participant: {
        userId: client?.id || "",
        name: client?.fullName || "Client",
        avatar: client?.avatar,
        verified: true,
        rating: 4.5,
        reviews: 10,
      },
      project: {
        id: projectId,
        title: projectTitle,
      },
      lastMessage: conv.lastMessage?.content || "No messages",
      lastMessageTime,
      unread: conv.unreadCount,
      termsAccepted: conv.termsAccepted?.freelancerAccepted ?? false,
    };
  });

  const chatParticipant: ChatParticipant | null = selectedClient
    ? {
        id: selectedClient.id || selectedClient?._id || "",
        name: selectedClient.fullName || "Client",
        avatar: selectedClient.avatar,
        verified: true,
        online: onlineUsers.has(selectedClient.id || ""),
      }
    : null;

  const infoPanelParticipant: InfoPanelParticipant | null = selectedClient
    ? {
        userId: selectedClient.id || "",
        name: selectedClient.fullName || "Client",
        avatar: selectedClient.avatar,
        verified: true,
        rating: 4.5,
        reviews: 10,
        online: onlineUsers.has(selectedClient.id || ""),
        title: "Client",
      }
    : null;

  const chatProject = selectedConversation?.project
    ? {
        id: selectedConversation.projectId || selectedConversation.project.id || "",
        title: selectedConversation.project.title,
      }
    : undefined;

  const freelancerTermsAccepted = selectedConversation?.termsAccepted?.freelancerAccepted ?? false;

  // ─── Actions ────────────────────────────────────────────────────

  const handleSelectConversation = (id: string) => {
    const convo = conversations.find((c) => c.id === id || c._id === id);
    if (convo) {
      setSelectedConversation(convo);
      setMobileView("chat");
    }
  };

  const handleAcceptTerms = async () => {
    const activeId = selectedConversation?.id || selectedConversation?._id;
    if (selectedConversation && activeId) {
      try {
        await conversationService.acceptTerms(activeId);
        setConversations((prev) =>
          prev.map((c) =>
            (c.id === activeId || c._id === activeId)
              ? {
                  ...c,
                  termsAccepted: {
                    ...c.termsAccepted!,
                    freelancerAccepted: true,
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
                  freelancerAccepted: true,
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
    const activeId = selectedConversation?.id || selectedConversation?._id;
    if (!messageInput.trim() || !selectedConversation || !isConnected || !activeId) return;
    const content = messageInput;
    setMessageInput("");

    // Optimistically update current chat view
    const optimisticMsg: Message = {
      id: `temp-${Date.now()}`,
      conversationId: activeId,
      senderId: user?._id || "",
      content,
      read: false,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    
    setConversations((prev) =>
      prev.map((c) =>
        (c.id === activeId || c._id === activeId)
          ? {
              ...c,
              lastMessage: optimisticMsg,
            }
          : c,
      ),
    );

    socketSendMessage(activeId, content).then((res) => {
        if (!res.success) {
            console.error("[Socket] Failed to send message via socket:", res.error);
        }
    });
  };

   return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-background font-sans overflow-hidden">
       {/* Header */}
       {!isWidget && (
         <DashboardHeader
           title="Messages"
           onMenuClick={() => setSidebarOpen(true)}
         />
       )}

       {/* Chat Container */}
      <div className="flex-1 flex overflow-hidden bg-slate-100 dark:bg-background">
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
          role="freelancer"
          className={cn(
            "flex-shrink-0",
            isWidget
              ? (mobileView === "chat" ? "hidden" : "flex w-full")
              : (mobileView === "chat" ? "hidden md:flex md:w-80 w-full" : "flex md:w-80 w-full")
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
          role="freelancer"
          termsAccepted={freelancerTermsAccepted}
          onAcceptTermsClick={() => setShowTermsModal(true)}
          showInfoPanel={showInfoPanel}
          onToggleInfoPanel={() => setShowInfoPanel(!showInfoPanel)}
          disabledMessageInput={!canMessage}
          disabledMessageReason={!canMessage ? "Upgrade to Pro to send messages." : undefined}
          className={cn(
            "flex-1",
            isWidget
              ? (mobileView === "list" ? "hidden" : "flex")
              : (mobileView === "list" ? "hidden md:flex" : "flex")
          )}
          isWidget={isWidget}
        />

        {/* Info Panel */}
        {showInfoPanel && infoPanelParticipant && (
          <ChatInfoPanel
            participant={infoPanelParticipant}
            project={chatProject}
            role="freelancer"
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

export default FreelancerMessages;
