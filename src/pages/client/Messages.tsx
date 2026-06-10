import { useState, useCallback, useRef } from "react";
import { useOutletContext, useLocation } from "react-router-dom";
import type { ClientLayoutContext } from "@/layouts/ClientLayout";
import { cn } from "@/lib/utils";
import { conversationService, applicationService } from "@/services";
import type { Conversation, Message, Application } from "@/services";
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
import { useEffect } from "react";
import { useUnreadStore } from "@/stores/unread.store";
import { useConversations } from "@/hooks/queries/useClientDashboardQueries";

interface ClientMessagesProps {
  isWidget?: boolean;
  onWidgetClose?: () => void;
}

const ClientMessages = ({ isWidget }: ClientMessagesProps = {}) => {
  const { user } = useAuth();
  const context = useOutletContext<ClientLayoutContext>();
  const setSidebarOpen = context?.setSidebarOpen || (() => {});
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
  const [conversationsLoaded, setConversationsLoaded] = useState(false);
  const deepLinkHandled = useRef(false);
  const { setActiveConversation, resetCount, addPendingMessage, getPendingMessages, clearPendingMessages } = useUnreadStore();
  const [currentApplication, setCurrentApplication] = useState<Application | null>(null);
  const [allClientApplications, setAllClientApplications] = useState<Application[]>([]);

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
      
      // Robustly extract senderId – backend may send ObjectId object or string
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

      // Always add to pending messages store (for when user is on another page)
      addPendingMessage(mapped);

      const selId = (selectedConversation?.id || selectedConversation?._id || "").toString();
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
      console.log("[Socket] Received message:read event", data);
      if (data.userId === user?._id?.toString()) {
        console.log("[Socket] Ignored message:read because I triggered it");
        return; // We triggered this read, ignore it meant for other user's UI
      }

      const readConvId = data.conversationId.toString();
      const selId = (selectedConversation?.id || selectedConversation?._id || "").toString();
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
      
      // Sort conversations by most recent message (newest first)
      convs = convs.sort((a, b) => {
        const dateA = a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt).getTime() : 0;
        const dateB = b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt).getTime() : 0;
        return dateB - dateA;
      });
      
      setConversations(prev => {
        // Only update if we don't have conversations yet or if the data changed
        // This prevents overwriting optimistic socket updates immediately
        if (prev.length === 0 || convs.length !== prev.length || convs[0]?.id !== prev[0]?.id) {
          return convs;
        }
        return prev;
      });
      
      // Auto-select the conversation with the most recent message (first after sort)
      if (convs.length > 0 && !selectedConversation && !deepLinkHandled.current) {
        setSelectedConversation(convs[0]);
      }
      
      setConversationsLoaded(true);
    }
  }, [convData?.conversations, selectedConversation]);

  useEffect(() => {
    // Fetch all client applications for context enrichment
    applicationService.getMyClientApplications()
      .then(appsRes => setAllClientApplications(appsRes.applications || []))
      .catch(error => console.error("Error fetching applications:", error));
  }, []);

  // ── Deep-link: auto-select conversation from navigation state ──
  const location = useLocation();

  useEffect(() => {
    deepLinkHandled.current = false;
  }, [location.key]);

  useEffect(() => {
    const state = location.state as { conversationId?: string; freelancerId?: string } | null;
    
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
        window.history.replaceState({}, "");
      } else if (state.freelancerId) {
        deepLinkHandled.current = true;
        const target = conversations.find((c) => {
          const freelancer = c.participants?.find(p => p.role === "freelancer") || c.participants?.[0];
          return freelancer?.id === state.freelancerId || (freelancer as any)?._id === state.freelancerId;
        });
        
        if (target) {
          setSelectedConversation(target);
          setMobileView("chat");
          window.history.replaceState({}, "");
        } else {
          try {
            const newConv = await conversationService.create({ participantId: state.freelancerId });
            setConversations(prev => [newConv, ...prev]);
            setSelectedConversation(newConv);
            setMobileView("chat");
            window.history.replaceState({}, "");
          } catch (err) {
            console.error("Failed to create conversation", err);
          }
        }
      }
    };
    handleDeepLink();
  }, [location.state, conversationsLoaded, conversations]);

  useEffect(() => {
    const fetchMessages = async () => {
      const activeId = selectedConversation?.id || selectedConversation?._id;
      if (!activeId) return;
      
      // Clear messages from other conversations immediately
      // but keep any that were already received for THIS conversation (e.g. via socket)
      setMessages((prev) => 
        prev.filter(m => m.conversationId.toString() === activeId.toString())
      );

      // Get pending messages from store (messages received while on another page)
      const pendingMsgs = getPendingMessages(activeId.toString());

      try {
        const data = await conversationService.getMessages(activeId);
        // Deduplicate and merge, ensuring we only keep messages for the current conversation
        setMessages((prev) => {
          const apiMessages = data.messages || [];
          const apiIds = new Set(apiMessages.map((m: any) => (m.id || m._id).toString()));
          
          const cid = activeId.toString();

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
        clearPendingMessages(activeId.toString());

        markAsRead(activeId);
        // Also call the REST endpoint to reset server-side unread count
        conversationService.markAsRead(activeId).catch(() => {});
        // Immediately reset unread count in local state
        setConversations((prev) =>
          prev.map((c) =>
            (c.id === activeId || c._id === activeId) 
              ? { ...c, unreadCount: 0 } 
              : c,
          ),
        );
        // Reset unread store for this conversation as well
        resetCount(activeId);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };
    fetchMessages();
  }, [selectedConversation?.id, selectedConversation?._id, markAsRead, resetCount]);

  // ─── Derived data ───────────────────────────────────────────────

  const getFreelancerParticipant = (conv: Conversation) =>
    conv.participants?.find((p) => p.role === "freelancer") ||
    conv.participants?.[0];

  const selectedFreelancer = selectedConversation
    ? getFreelancerParticipant(selectedConversation)
    : null;

  // ── Application Fetching ──
  useEffect(() => {
    const freelancerId = selectedFreelancer?.id || selectedFreelancer?._id;
    if (!freelancerId) {
      setCurrentApplication(null);
      return;
    }

    // Find all applications from THIS freelancer
    const freelancerApps = allClientApplications.filter(
      (app) => 
        app.freelancer?._id === freelancerId || 
        app.freelancer?.id === freelancerId || 
        app.freelancerId === freelancerId
    );

    if (freelancerApps.length === 0) {
      setCurrentApplication(null);
      return;
    }

    // 1. First priority: Try to match the projectId in the conversation if specifically selected
    const projectSpecificApp = freelancerApps.find(
      (app) => (app.projectId === selectedConversation?.projectId || app.project?._id === selectedConversation?.projectId)
    );

    // 2. Second priority: Pick the MOST RECENT application (by createdAt)
    const sortedApps = [...freelancerApps].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const mostRecentApp = sortedApps[0];

    // LOGIC: If both are pending (or specifically the most recent is pending), 
    // prioritize the most recent one as it's the likely current topic.
    if (mostRecentApp && mostRecentApp.status === 'pending') {
       setCurrentApplication(mostRecentApp);
    } else {
       setCurrentApplication(projectSpecificApp || mostRecentApp);
    }
  }, [selectedConversation?.id, allClientApplications, selectedFreelancer]);

  const conversationItems: ConversationItem[] = conversations.map((conv) => {
    const freelancer = getFreelancerParticipant(conv);
    const freelancerId = freelancer?.id || (freelancer as any)?._id;
    
    // Find matching application for sidebar title enrichment
    const matchingApp = allClientApplications
      .filter(app => {
        const appFreelancerId = app.freelancer?._id || app.freelancer?.id || app.freelancerId;
        return appFreelancerId === freelancerId;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

    const projectTitle = matchingApp?.project?.title || conv.project?.title || "Project";
    const projectId = matchingApp?.projectId || matchingApp?.project?._id || conv.projectId || "";

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
      id: conv.id || conv._id || "",
      participant: {
        userId: freelancer?.id || "",
        name: freelancer?.fullName || "User",
        avatar: freelancer?.avatar,
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
      termsAccepted: conv.termsAccepted?.clientAccepted ?? true,
    };
  });

  const chatParticipant: ChatParticipant | null = selectedFreelancer
    ? {
        id: selectedFreelancer.id || selectedFreelancer?._id || "",
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

  const chatProject = currentApplication?.project
    ? {
        id: currentApplication.projectId || currentApplication.project._id || currentApplication.project.id || "",
        title: currentApplication.project.title,
      }
    : selectedConversation?.project
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
      const appId = currentApplication.id || currentApplication._id || "";
      await applicationService.updateStatus(appId, "accepted");
      setCurrentApplication({ ...currentApplication, status: "accepted" });

      const activeId = selectedConversation?.id || selectedConversation?._id;
      if (isConnected && activeId) {
        const contactDetails = `Hi! I have accepted your application. Here are my contact details:\nName: ${user?.fullName || "Not provided"}\nEmail: ${user?.email || "Not provided"}`;
        
        const optimisticMsg: Message = {
          id: `temp-${Date.now()}`,
          conversationId: activeId,
          senderId: user?._id || "",
          content: contactDetails,
          read: false,
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, optimisticMsg]);
        setConversations((prev) =>
          prev.map((c) =>
            (c.id === activeId || c._id === activeId)
              ? { ...c, lastMessage: optimisticMsg }
              : c,
          ),
        );
        socketSendMessage(activeId, contactDetails);
      }
    } catch (err) {
      console.error("Failed to hire", err);
    }
  };

  const handleReject = async () => {
    if (!currentApplication) return;
    try {
      const appId = currentApplication.id || currentApplication._id || "";
      await applicationService.updateStatus(appId, "rejected");
      setCurrentApplication({ ...currentApplication, status: "rejected" });
    } catch (err) {
      console.error("Failed to reject", err);
    }
  };

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
    
    // Update conversation's last message in the sidebar promptly
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

    console.log("[Socket] Emitting message:send for content:", content);
    socketSendMessage(activeId, content).then((res) => {
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
          role="client"
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
          role="client"
          termsAccepted={clientTermsAccepted}
          onAcceptTermsClick={() => setShowTermsModal(true)}
          showInfoPanel={showInfoPanel}
          onToggleInfoPanel={() => setShowInfoPanel(!showInfoPanel)}
          applicationId={currentApplication?.id || currentApplication?._id}
          applicationStatus={currentApplication?.status}
          onHire={handleHire}
          onReject={handleReject}
          isVisible={isWidget ? mobileView === "chat" : mobileView === "chat" || window.innerWidth >= 768}
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
