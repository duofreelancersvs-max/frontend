import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth.store";

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  read: boolean;
  createdAt: string;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  participants: {
    id: string;
    fullName: string;
    avatar?: string;
    role: string;
  }[];
  lastMessage?: Message;
  unreadCount: number;
  projectId?: string;
  project?: {
    id: string;
    title: string;
  };
  termsAccepted?: {
    clientAccepted: boolean;
    freelancerAccepted: boolean;
    acceptedAt?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateConversationRequest {
  participantId: string;
  projectId?: string;
  initialMessage?: string;
}

// Helper to normalize _id → id on conversation objects
const normalizeConversation = (conv: any): Conversation => {
  // Handle participant details from backend
  const normalizedParticipants = (
    conv.participantDetails ||
    conv.participants ||
    []
  ).map((p: any) => ({
    id: p._id || p.id || p,
    fullName:
      p.fullName ||
      p.baseProfile?.fullName ||
      `${p.firstName || ""} ${p.lastName || ""}`.trim() ||
      "",
    avatar: p.avatar,
    role: p.role,
  }));

  // Handle unreadCount - backend sends { client, freelancer }, frontend expects number
  // Use participantRoles to determine the current user's role in this conversation
  let unreadCount = 0;
  if (typeof conv.unreadCount === "object") {
    // Determine role from participantRoles if available
    const currentUserId = getCurrentUserId();
    if (currentUserId && conv.participantRoles) {
      const isClient =
        (
          conv.participantRoles.clientId?._id || conv.participantRoles.clientId
        )?.toString() === currentUserId;
      unreadCount = isClient
        ? conv.unreadCount.client || 0
        : conv.unreadCount.freelancer || 0;
    } else {
      // Fallback: check participant roles
      const clientParticipant = normalizedParticipants.find(
        (p: any) => p.role === "client",
      );
      const isClient = clientParticipant?.id === currentUserId;
      unreadCount = isClient
        ? conv.unreadCount.client || 0
        : conv.unreadCount.freelancer || 0;
    }
  } else {
    unreadCount = conv.unreadCount || 0;
  }

  // Normalize lastMessage — backend sends sentAt, frontend expects createdAt
  let normalizedLastMessage: Message | undefined;
  if (conv.lastMessage) {
    normalizedLastMessage = {
      id: conv.lastMessage._id || conv.lastMessage.id || "",
      conversationId: conv._id || conv.id || "",
      senderId: conv.lastMessage.senderId || "",
      content: conv.lastMessage.content || "",
      read: conv.lastMessage.isRead ?? conv.lastMessage.read ?? false,
      createdAt:
        conv.lastMessage.sentAt ||
        conv.lastMessage.createdAt ||
        conv.updatedAt ||
        "",
    };
  }

  return {
    ...conv,
    id: (conv._id || conv.id || "").toString(),
    participantIds: normalizedParticipants.map((p: any) => p.id.toString()),
    participants: normalizedParticipants,
    lastMessage: normalizedLastMessage,
    project: conv.project
      ? {
          id: conv.project._id || conv.projectId,
          title: conv.project.title,
        }
      : undefined,
    termsAccepted: conv.termsAccepted || {
      clientAccepted: false,
      freelancerAccepted: false,
    },
    unreadCount,
  };
};

// Helper to get current user ID from auth store
function getCurrentUserId(): string | null {
  try {
    return useAuthStore.getState().user?._id || null;
  } catch {
    return null;
  }
}

const normalizeMessage = (msg: any): Message => {
  if (!msg) return {} as Message;
  return {
    ...msg,
    id: (msg.id || msg._id || "").toString(),
    senderId: (msg.senderId?._id || msg.senderId || "").toString(),
    conversationId: (msg.conversationId?._id || msg.conversationId || "").toString(),
    read: msg.read ?? msg.isRead ?? false,
    createdAt: msg.sentAt || msg.createdAt || new Date().toISOString(),
  };
};

export const conversationService = {
  getAll: async () => {
    const data = await api.get<{ conversations: any[] }>("/conversations");
    return {
      ...data,
      conversations: (data.conversations || []).map(normalizeConversation),
    };
  },

  create: async (data: CreateConversationRequest) => {
    const conv = await api.post<any>("/conversations", data);
    return normalizeConversation(conv);
  },

  getById: async (id: string) => {
    const conv = await api.get<any>(`/conversations/${id}`);
    return normalizeConversation(conv);
  },

  getMessages: async (conversationId: string) => {
    const data = await api.get<{ messages: any[] }>(
      `/conversations/${conversationId}/messages`,
    );
    return {
      ...data,
      messages: (data.messages || []).map(normalizeMessage),
    };
  },

  sendMessage: (conversationId: string, content: string) =>
    api.post<Message>(`/conversations/${conversationId}/messages`, { content }),

  markAsRead: (conversationId: string) =>
    api.post<Conversation>(`/conversations/${conversationId}/read`, {}),

  acceptTerms: (conversationId: string) =>
    api.post<Conversation>(`/conversations/${conversationId}/accept-terms`, {}),
};

export default conversationService;
