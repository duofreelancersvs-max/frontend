import { useEffect, useRef, useState, useCallback } from "react";
import {
  connectSocket,
  disconnectSocket,
  type AppSocket,
  type SocketMessage,
  type SocketConversation,
} from "@/lib/socket";
import { useAuthStore } from "@/stores/auth.store";

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
  const { conversationId, onNewMessage, onMessageRead, onConversationCreated } =
    options;

  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  const socketRef = useRef<AppSocket | null>(null);
  const prevConversationIdRef = useRef<string | null>(null);

  // Keep callbacks fresh without re-triggering effects
  const onNewMessageRef = useRef(onNewMessage);
  const onMessageReadRef = useRef(onMessageRead);
  const onConversationCreatedRef = useRef(onConversationCreated);
  onNewMessageRef.current = onNewMessage;
  onMessageReadRef.current = onMessageRead;
  onConversationCreatedRef.current = onConversationCreated;

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // ─── Connect / Disconnect lifecycle ──────────────────────────────

  useEffect(() => {
    if (!isAuthenticated) return;

    const s = connectSocket();
    socketRef.current = s;

    // Connection state
    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    s.on("connect", handleConnect);
    s.on("disconnect", handleDisconnect);

    // If already connected (reconnection scenario)
    if (s.connected) setIsConnected(true);

    // ─── Server → Client listeners ─────────────────────────────

    s.on("message:new", (data) => {
      onNewMessageRef.current?.(data.message, data.conversation);
    });

    s.on("message:read", (data) => {
      onMessageReadRef.current?.(data);
    });

    s.on("user:online", ({ userId }) => {
      setOnlineUsers((prev) => new Set(prev).add(userId));
    });

    s.on("user:offline", ({ userId }) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    });

    s.on("conversation:created", (conv) => {
      onConversationCreatedRef.current?.(conv);
    });

    s.on("error", (err) => {
      console.error("[Socket] Server error:", err.message);
    });

    return () => {
      s.off("connect", handleConnect);
      s.off("disconnect", handleDisconnect);
      s.off("message:new");
      s.off("message:read");
      s.off("user:online");
      s.off("user:offline");
      s.off("conversation:created");
      s.off("error");
      disconnectSocket();
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
