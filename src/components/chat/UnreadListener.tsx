import { useEffect } from "react";
import { useSocket } from "@/hooks/useSocket";
import { useUnreadStore } from "@/stores/unread.store";
import { useAuthStore } from "@/stores/auth.store";
import type { Message } from "@/services/conversation.service";
import { useQueryClient } from "@tanstack/react-query";
import { useMyConversations } from "@/hooks/queries/useFreelancerDashboardQueries";

export const UnreadListener = () => {
  const { incrementCount, resetCount, updateCount, activeConversationId, addPendingMessage } = useUnreadStore();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const currentUserId = useAuthStore((s) => s.user?._id);
  const queryClient = useQueryClient();

  // Derive unread counts from the shared React Query cache instead of making
  // a separate GET /conversations call.  FreelancerLayout / ClientLayout already
  // fetch via useMyConversations(), so this reuses that cache entry (zero extra
  // HTTP requests).
  const { data } = useMyConversations({ enabled: !!isAuthenticated && !!currentUserId });
  const conversations = data?.conversations || [];

  useEffect(() => {
    if (!isAuthenticated || !currentUserId || !conversations.length) return;

    const myId = currentUserId.toString();
    const counts: Record<string, number> = {};
    let total = 0;

    for (const conv of conversations as any[]) {
      const convId = (conv.id || conv._id || "").toString();
      let count = 0;

      if (typeof conv.unreadCount === "number") {
        count = conv.unreadCount;
      } else if (conv.unreadCount && typeof conv.unreadCount === "object") {
        const isClient = (conv.clientId?._id || conv.clientId || "").toString() === myId;
        count = isClient ? (conv.unreadCount.client || 0) : (conv.unreadCount.freelancer || 0);
      }

      if (convId) {
        counts[convId] = count;
        total += count;
      }
    }

    useUnreadStore.setState({ unreadCounts: counts, totalUnreadCount: total });
  }, [isAuthenticated, currentUserId, conversations]);

  // Socket listener
  useSocket({
    onNewMessage: (message, conversation) => {
      if (!currentUserId) return;
      
      const convId = (message.conversationId || (conversation as any)?._id || (conversation as any)?.id || "").toString();
      
      // Store the incoming message in pending messages so it shows in chat
      const pendingMsg: Message = {
        id: message._id || (message as any).id || "",
        conversationId: convId,
        senderId: (message.senderId as any)?._id || message.senderId || "",
        content: message.content,
        read: message.isRead ?? (message as any).read ?? false,
        createdAt: message.createdAt || message.sentAt || new Date().toISOString(),
      };
      addPendingMessage(pendingMsg);
      
      // If the message is from someone else AND we are not currently looking at this conversation
      if (message.senderId.toString() !== currentUserId.toString() && convId !== activeConversationId) {
        // We use the full conversation object if available, or just increment
        if (conversation && typeof conversation.unreadCount === 'object') {
          // Determine our role in this conversation to pick the right count
          const myIdStr = currentUserId.toString();
          const isClient = (conversation as any).clientId?.toString() === myIdStr;
          
          const count = isClient ? conversation.unreadCount.client : conversation.unreadCount.freelancer;
          updateCount(convId, count);
        } else {
          incrementCount(convId);
        }
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
      }
    },
    onMessageRead: (data) => {
      if (!currentUserId) return;
      // If we are the one who read it, reset our count
      if (data.userId.toString() === currentUserId.toString()) {
        resetCount(data.conversationId.toString());
      }
    },
    onConversationCreated: () => {
      if (!currentUserId) return;
      // When a new conversation is created by someone else, we need to refresh the list
      // so it appears in the sidebar and doesn't say "No conversations found"
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  return null; // This component doesn't Render anything
};
