import { useState, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { conversationService } from "@/services";
import type { Conversation, Message } from "@/services";
import { useAuth } from "@/hooks/useAuth";
import { useSocket } from "@/hooks/useSocket";
import type { SocketMessage, SocketConversation } from "@/lib/socket";
import {
  ConversationList,
  ChatArea,
  ChatInfoPanel,
  type ConversationItem,
} from "@/components/chat";
import { useUnreadStore } from "@/stores/unread.store";
import { useConversations } from "@/hooks/queries/useClientDashboardQueries";

const AdminMessages = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");
  const [showInfoPanel, setShowInfoPanel] = useState(false);

  
  const { setActiveConversation, resetCount, addPendingMessage, getPendingMessages, clearPendingMessages } = useUnreadStore();

  // Sync active conversation with unread store
  useEffect(() => {
    const activeId = selectedConversation?.id || selectedConversation?._id;
    setActiveConversation(activeId || null);
    return () => setActiveConversation(null);
  }, [selectedConversation, setActiveConversation]);

  // ─── Socket.IO integration ──────────────────────────────────────
  const handleNewMessage = useCallback(
    (socketMsg: SocketMessage, _conv: SocketConversation) => {
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
      const isCurrentConv = selId && mapped.conversationId === selId;
      const currentUserId = (user?._id || '').toString();

      if (isCurrentConv) {
        if (mapped.senderId !== currentUserId) {
          markAsRead(mapped.conversationId);
        }

        setMessages((prev) => {
          const filtered = prev.filter(m => 
            !(m.id.startsWith("temp-") && m.content === mapped.content && m.senderId === user?._id)
          );
          if (filtered.some((m) => m.id === mapped.id)) return filtered;
          return [...filtered, mapped];
        });
      }

      setConversations((prev) =>
        prev.map((c) => {
          const cid = (c.id || c._id || "").toString();
          return cid === mapped.conversationId
            ? { ...c, lastMessage: { ...mapped, createdAt: mapped.createdAt } }
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
      setConversations((prev) => [...prev]);
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
      
      if (convs.length > 0 && !selectedConversation) {
        if (window.innerWidth >= 768) {
          setSelectedConversation(convs[0]);
        }
      }
    }
  }, [convData?.conversations, selectedConversation]);

  useEffect(() => {
    const fetchMessages = async () => {
      const activeId = selectedConversation?.id || selectedConversation?._id;
      if (!activeId) return;
      
      setMessages((prev) => prev.filter(m => m.conversationId.toString() === activeId.toString()));
      const pendingMsgs = getPendingMessages(activeId.toString());

      try {
        const data = await conversationService.getMessages(activeId);
        setMessages((prev) => {
          const apiMessages = data.messages || [];
          const apiIds = new Set(apiMessages.map((m: any) => (m.id || m._id).toString()));
          const cid = activeId.toString();
          const uniqueLocal = prev.filter(m => m.conversationId.toString() === cid && !apiIds.has(m.id.toString()));
          const uniquePending = pendingMsgs.filter(p => !apiIds.has(p.id.toString()));
          
          return [...apiMessages, ...uniqueLocal, ...uniquePending].sort((a, b) => 
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        });

        clearPendingMessages(activeId.toString());
        markAsRead(activeId);
        conversationService.markAsRead(activeId).catch(() => {});
        setConversations((prev) => [...prev]);
        resetCount(activeId);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };
    fetchMessages();
  }, [selectedConversation?.id, selectedConversation?._id, markAsRead, resetCount]);

  const getOtherParticipant = (conv: Conversation) => {
    return conv.participants?.find((p) => (p.id || (p as any)._id) !== user?._id) || conv.participants?.[0];
  };

  const selectedOtherParticipant = selectedConversation ? getOtherParticipant(selectedConversation) : null;

  const conversationItems: ConversationItem[] = conversations.map((conv) => {
    const other = getOtherParticipant(conv);
    let lastMessageTime = "";
    if (conv.lastMessage?.createdAt) {
      const date = new Date(conv.lastMessage.createdAt);
      if (!isNaN(date.getTime())) {
        lastMessageTime = date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
      }
    }
    return {
      id: conv.id || conv._id || "",
      participant: {
        userId: other?.id || "",
        name: other?.fullName || "User",
        avatar: other?.avatar,
        verified: true,
        rating: 5.0,
        reviews: 0,
      },
      project: {
        id: conv.projectId || "",
        title: conv.project?.title || "Direct Message",
      },
      lastMessage: conv.lastMessage?.content || "No messages yet",
      lastMessageTime,
      unread: conv.unreadCount || 0,
      termsAccepted: true, // Always true for admin
    };
  });

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedConversation) return;
    const cid = selectedConversation.id || selectedConversation._id;
    if (!cid) return;

    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      conversationId: cid,
      senderId: (user?._id || '').toString(),
      content: messageInput,
      createdAt: new Date().toISOString(),
      read: false,
    };

    setMessages((prev) => [...prev, tempMessage]);
    setMessageInput("");

    socketSendMessage(cid, tempMessage.content)
      .catch((err) => {
        console.error("Failed to send message via socket, fallback to REST API", err);
        return conversationService.sendMessage(cid, tempMessage.content);
      })
      .then((res: any) => {
        if (res && res.message) {
          setMessages((prev) =>
            prev.map((msg) => msg.id === tempMessage.id ? { ...res.message, id: res.message.id || res.message._id } : msg)
          );
        }
      })
      .catch((err) => {
        console.error("Failed to send message via REST API", err);
      });
  };

  const selectedChatParticipant = selectedOtherParticipant ? {
    id: selectedOtherParticipant.id || (selectedOtherParticipant as any)._id,
    name: selectedOtherParticipant.fullName,
    avatar: selectedOtherParticipant.avatar,
    verified: true,
    online: onlineUsers.has(selectedOtherParticipant.id || (selectedOtherParticipant as any)._id),
  } : null;

  const infoPanelParticipant = selectedOtherParticipant ? {
    userId: selectedOtherParticipant.id || (selectedOtherParticipant as any)._id,
    name: selectedOtherParticipant.fullName,
    avatar: selectedOtherParticipant.avatar,
    verified: true,
    rating: 5.0,
    reviews: 0,
    online: onlineUsers.has(selectedOtherParticipant.id || (selectedOtherParticipant as any)._id),
    title: selectedOtherParticipant.role,
  } : null;

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#09090b]">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/5 flex-shrink-0">
        <h1 className="text-xl font-bold text-white">Direct Messages</h1>
        <p className="text-sm text-slate-400">Manage your direct conversations with users.</p>
      </div>
      
      {/* Messages Layout */}
      <div className="flex-1 min-h-0 flex relative">
        <ConversationList
          conversations={conversationItems}
          selectedId={selectedConversation?.id || selectedConversation?._id || null}
          onSelect={(id) => {
            const conv = conversations.find((c) => c.id === id || c._id === id);
            if (conv) {
              setSelectedConversation(conv);
              setMobileView("chat");
            }
          }}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filter={filter}
          onFilterChange={setFilter}
          onlineUsers={onlineUsers}
          role="admin"
          className={cn(
            "w-full md:w-80 lg:w-[340px] flex-shrink-0 absolute md:relative z-10 h-full transition-transform duration-300",
            mobileView === "list" ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          )}
        />
        
        <div className={cn(
            "flex-1 flex min-w-0 absolute md:relative z-20 h-full w-full transition-transform duration-300",
            mobileView === "chat" ? "translate-x-0" : "translate-x-full md:translate-x-0",
          )}
        >
          <ChatArea
            participant={selectedChatParticipant}
            project={null}
            messages={messages}
            messageInput={messageInput}
            setMessageInput={setMessageInput}
            onSend={handleSendMessage}
            onBack={() => setMobileView("list")}
            isConnected={isConnected}
            currentUserId={(user?._id || '').toString()}
            role="admin"
            termsAccepted={true}
            onAcceptTermsClick={() => {}}
            showInfoPanel={showInfoPanel}
            onToggleInfoPanel={() => setShowInfoPanel(!showInfoPanel)}
          />
          
          {showInfoPanel && infoPanelParticipant && (
            <ChatInfoPanel
              participant={infoPanelParticipant}
              project={null}
              role="admin"
              className="w-72 hidden xl:flex"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminMessages;
