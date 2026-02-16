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

export const conversationService = {
  getAll: () => api.get<{ conversations: Conversation[] }>("/conversations"),
  
  create: (data: CreateConversationRequest) =>
    api.post<Conversation>("/conversations", data),
  
  getById: (id: string) => api.get<Conversation>(`/conversations/${id}`),
  
  getMessages: (conversationId: string) =>
    api.get<{ messages: Message[] }>(`/conversations/${conversationId}/messages`),
  
  sendMessage: (conversationId: string, content: string) =>
    api.post<Message>(`/conversations/${conversationId}/messages`, { content }),
  
  markAsRead: (conversationId: string) =>
    api.post<Conversation>(`/conversations/${conversationId}/read`, {}),
  
  acceptTerms: (conversationId: string) =>
    api.post<Conversation>(`/conversations/${conversationId}/accept-terms`, {}),
};

export default conversationService;
