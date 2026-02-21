import { api } from "@/lib/api";

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
  createdAt: string;
  updatedAt: string;
}

export interface CreateConversationRequest {
  participantId: string;
  projectId?: string;
  initialMessage?: string;
}

// Helper to normalize _id → id on conversation objects
const normalizeConversation = (conv: any): Conversation => ({
  ...conv,
  id: conv.id || conv._id,
});

const normalizeMessage = (msg: any): Message => ({
  ...msg,
  id: msg.id || msg._id,
});

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
