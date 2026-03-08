import { useEffect } from "react";
import { useSocket } from "@/hooks/useSocket";
import { useUnreadStore } from "@/stores/unread.store";
import { useAuthStore } from "@/stores/auth.store";
import type { Message } from "@/services/conversation.service";

export const UnreadListener = () => {
  const { fetchInitialCounts, incrementCount, resetCount, updateCount, activeConversationId, addPendingMessage } = useUnreadStore();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const currentUserId = useAuthStore((s) => s.user?._id);

  // Initial fetch on mount/auth
  useEffect(() => {
    if (isAuthenticated && currentUserId) {
      fetchInitialCounts(currentUserId.toString());
    }
  }, [isAuthenticated, currentUserId, fetchInitialCounts]);

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
      }
    },
    onMessageRead: (data) => {
      if (!currentUserId) return;
      // If we are the one who read it, reset our count
      if (data.userId.toString() === currentUserId.toString()) {
        resetCount(data.conversationId.toString());
      }
    },
  });

  return null; // This component doesn't Render anything
};
