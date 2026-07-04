import { useEffect, useRef, useState, useCallback } from "react";
import {
  connectSocket,
  type AppSocket,
  type SocketMessage,
  type SocketConversation,
} from "@/lib/socket";
import type { NotificationResponseDto } from "@/types/notification.types";
import { useAuthStore } from "@/stores/auth.store";
import { useUnreadStore } from "@/stores/unread.store";

// ─── Types ─────────────────────────────────────────────────────────

interface UseSocketOptions {
  /** Currently active conversation ID (auto-joins/leaves rooms). */
  conversationId?: string | null;
  /** Called when a new message arrives in the current conversation. */
  onNewMessage?: (
    message: SocketMessage,
    conversation: SocketConversation,
  ) => void;
  /** Called when messages are marked as read. */
  onMessageRead?: (data: {
    conversationId: string;
    userId: string;
    readAt: string;
  }) => void;
  /** Called when a new conversation is created for this user. */
  onConversationCreated?: (conversation: SocketConversation) => void;
  /** Called when a new notification arrives. */
  onNotificationNew?: (notification: NotificationResponseDto) => void;
}

interface UseSocketReturn {
  isConnected: boolean;
  onlineUsers: Set<string>;
  sendMessage: (
    conversationId: string,
    content: string,
    attachments?: Array<{ type: "image" | "file"; url: string; name?: string }>,
  ) => Promise<{ success: boolean; data?: unknown; error?: string }>;
  markAsRead: (conversationId: string) => void;
  socket: AppSocket | null;
}

// ─── Hook ──────────────────────────────────────────────────────────

export function useSocket(options: UseSocketOptions = {}): UseSocketReturn {
  const { conversationId, onNewMessage, onMessageRead, onConversationCreated, onNotificationNew } =
    options;

  const [isConnected, setIsConnected] = useState(false);
  const { addOnlineUser, removeOnlineUser, setOnlineUsers, onlineUsers } =
    useUnreadStore();

  const socketRef = useRef<AppSocket | null>(null);
  const prevConversationIdRef = useRef<string | null>(null);

  // Keep callbacks fresh without re-triggering effects
  const onNewMessageRef = useRef(onNewMessage);
  const onMessageReadRef = useRef(onMessageRead);
  const onConversationCreatedRef = useRef(onConversationCreated);
  const onNotificationNewRef = useRef(onNotificationNew);
  onNewMessageRef.current = onNewMessage;
  onMessageReadRef.current = onMessageRead;
  onConversationCreatedRef.current = onConversationCreated;
  onNotificationNewRef.current = onNotificationNew;

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // ─── Connect / Disconnect lifecycle ──────────────────────────────

  useEffect(() => {
    if (!isAuthenticated) return;

    const s = connectSocket();
    socketRef.current = s;

    // Handle connect/disconnect
    const handleConnect = () => {
      setIsConnected(true);
      // Request current online users on every connect/reconnect
      s.emit("users:get_online" as any);
    };
    const handleDisconnect = () => setIsConnected(false);

    // ─── Socket Event Handlers ───
    
    const handleNewMessage = (data: { message: any; conversation: any }) => {
      onNewMessageRef.current?.(data.message, data.conversation);
    };

    const handleMessageRead = (data: any) => {
      onMessageReadRef.current?.(data);
    };

    const handleUserOnline = (data: { userId: string }) => {
      addOnlineUser(data.userId);
    };

    const handleUserOffline = (data: { userId: string }) => {
      removeOnlineUser(data.userId);
    };

    const handleUsersOnline = (data: { userIds: string[] }) => {
      setOnlineUsers(data.userIds);
    };

    const handleConversationCreated = (conv: any) => {
      onConversationCreatedRef.current?.(conv);
    };

    const handleNotificationNew = (notif: NotificationResponseDto) => {
      onNotificationNewRef.current?.(notif);
    };

    const handleError = (err: any) => {
      console.error("[Socket] Server error:", err.message);
    };

    // Connection state
    s.on("connect", handleConnect);
    s.on("disconnect", handleDisconnect);
    if (s.connected) setIsConnected(true);

    // Register listeners
    s.on("message:new", handleNewMessage);
    s.on("message:read", handleMessageRead);
    s.on("user:online", handleUserOnline);
    s.on("user:offline", handleUserOffline);
    s.on("users:online", handleUsersOnline);
    s.on("conversation:created", handleConversationCreated);
    s.on("notification:new", handleNotificationNew);
    s.on("error", handleError);

    // Request current online users if already connected
    if (s.connected) {
      s.emit("users:get_online" as any);
    }

    return () => {
      // Unsubscribe specifically from the handlers we registered
      // to avoid memory leaks and multiple listeners, but DON'T
      // disconnect the global socket as other components (like UnreadListener)
      // are still using it.
      s.off("connect", handleConnect);
      s.off("disconnect", handleDisconnect);
      s.off("message:new", handleNewMessage);
      s.off("message:read", handleMessageRead);
      s.off("user:online", handleUserOnline);
      s.off("user:offline", handleUserOffline);
      s.off("users:online", handleUsersOnline);
      s.off("conversation:created", handleConversationCreated);
      s.off("notification:new", handleNotificationNew);
      s.off("error", handleError);
      
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [isAuthenticated]);

  // ─── Auto-join / leave conversation rooms ────────────────────────

  useEffect(() => {
    const s = socketRef.current;
    if (!s || !s.connected) return;

    const prevId = prevConversationIdRef.current;

    // Leave previous room
    if (prevId && prevId !== conversationId) {
      s.emit("conversation:leave", { conversationId: prevId });
    }

    // Join new room
    if (conversationId && conversationId !== prevId) {
      s.emit("conversation:join", { conversationId }, (res) => {
        if (!res?.success) {
          console.error("[Socket] Failed to join room:", res?.error);
        }
      });
    }

    prevConversationIdRef.current = conversationId || null;
  }, [conversationId, isConnected]);

  // ─── Actions ─────────────────────────────────────────────────────

  const sendMessage = useCallback(
    (
      convId: string,
      content: string,
      attachments?: Array<{
        type: "image" | "file";
        url: string;
        name?: string;
      }>,
    ): Promise<{ success: boolean; data?: unknown; error?: string }> => {
      return new Promise((resolve) => {
        const s = socketRef.current;
        if (!s || !s.connected) {
          resolve({ success: false, error: "Socket not connected" });
          return;
        }
        s.emit(
          "message:send",
          { conversationId: convId, content, attachments },
          (response) => {
            resolve(response || { success: false, error: "No response" });
          },
        );
      });
    },
    [],
  );

  const markAsRead = useCallback((convId: string) => {
    socketRef.current?.emit("message:read", { conversationId: convId });
  }, []);

  return {
    isConnected,
    onlineUsers,
    sendMessage,
    markAsRead,
    socket: socketRef.current,
  };
}
