import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/stores/auth.store";

// ─── Types mirroring backend socket.types.ts ────────────────────────

export interface MessageAttachment {
  type: "image" | "file";
  url: string;
  name?: string;
}

export interface SocketMessage {
  _id: string;
  conversationId: string;
  senderId: string;
  content: string;
  attachments: MessageAttachment[];
  isRead: boolean;
  readAt?: string;
  sentAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface SocketConversation {
  _id: string;
  participants: string[];
  lastMessage?: {
    content: string;
    senderId: string;
    sentAt: string;
  };
  unreadCount: { client: number; freelancer: number };
  projectId?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Client → Server events ────────────────────────────────────────

interface ClientToServerEvents {
  "message:send": (
    data: {
      conversationId: string;
      content: string;
      attachments?: MessageAttachment[];
    },
    callback?: (response: {
      success: boolean;
      data?: unknown;
      error?: string;
    }) => void,
  ) => void;

  "message:read": (
    data: { conversationId: string },
    callback?: (response: { success: boolean; error?: string }) => void,
  ) => void;

  "typing:start": (data: { conversationId: string }) => void;
  "typing:stop": (data: { conversationId: string }) => void;

  "conversation:join": (
    data: { conversationId: string },
    callback?: (response: { success: boolean; error?: string }) => void,
  ) => void;

  "conversation:leave": (data: { conversationId: string }) => void;

  "conversation:create": (
    data: {
      clientId: string;
      freelancerId: string;
      projectId?: string;
    },
    callback?: (response: {
      success: boolean;
      data?: unknown;
      error?: string;
    }) => void,
  ) => void;
}

// ─── Server → Client events ────────────────────────────────────────

interface ServerToClientEvents {
  "message:new": (data: {
    message: SocketMessage;
    conversation: SocketConversation;
  }) => void;

  "message:read": (data: {
    conversationId: string;
    userId: string;
    readAt: string;
  }) => void;

  "user:typing": (data: {
    conversationId: string;
    userId: string;
    isTyping: boolean;
  }) => void;

  "user:online": (data: { userId: string }) => void;
  "user:offline": (data: { userId: string }) => void;
  "users:online": (data: { userIds: string[] }) => void;

  "conversation:created": (data: SocketConversation) => void;

  error: (data: { message: string; event?: string }) => void;
}

// ─── Typed socket alias ────────────────────────────────────────────

export type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

// ─── Singleton ─────────────────────────────────────────────────────

let socket: AppSocket | null = null;

/**
 * Derive the Socket.IO server URL from VITE_API_URL.
 * e.g. "http://localhost:3000/api/v1" → "http://localhost:3000"
 */
function getServerUrl(): string {
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";
  try {
    const url = new URL(apiUrl);
    return url.origin;
  } catch {
    return "http://localhost:3000";
  }
}

/**
 * Get or create the socket instance (does NOT auto-connect).
 */
export function getSocket(): AppSocket {
  if (socket) return socket;

  const token = useAuthStore.getState().tokens?.accessToken;

  socket = io(getServerUrl(), {
    auth: { token: token || "" },
    autoConnect: false,
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
  });

  return socket;
}

/**
 * Connect the socket. Refreshes the auth token before connecting.
 */
export function connectSocket(): AppSocket {
  const s = getSocket();

  // Always set the latest token before connecting
  const token = useAuthStore.getState().tokens?.accessToken;
  if (token) {
    s.auth = { token };
  }

  if (!s.connected) {
    s.connect();
  }

  return s;
}

/**
 * Disconnect and destroy the singleton.
 */
export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
