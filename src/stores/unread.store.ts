import { create } from "zustand";
import { conversationService } from "@/services/conversation.service";
import type { Message } from "@/services/conversation.service";

interface UnreadState {
  unreadCounts: Record<string, number>;
  totalUnreadCount: number;
  isLoading: boolean;
  activeConversationId: string | null;
  onlineUsers: Set<string>;
  pendingMessages: Message[];

  // Actions
  fetchInitialCounts: (currentUserId: string) => Promise<void>;
  updateCount: (conversationId: string, count: number) => void;
  incrementCount: (conversationId: string) => void;
  resetCount: (conversationId: string) => void;
  setActiveConversation: (id: string | null) => void;
  setOnlineUsers: (userIds: string[]) => void;
  addOnlineUser: (userId: string) => void;
  removeOnlineUser: (userId: string) => void;
  addPendingMessage: (message: Message) => void;
  getPendingMessages: (conversationId: string) => Message[];
  clearPendingMessages: (conversationId: string) => void;
}

export const useUnreadStore = create<UnreadState>((set, get) => ({
  unreadCounts: {},
  totalUnreadCount: 0,
  isLoading: false,
  activeConversationId: null,
  onlineUsers: new Set(),
  pendingMessages: [],

  fetchInitialCounts: async (currentUserId: string) => {
    set({ isLoading: true });
    try {
      const { conversations } = await conversationService.getAll();
      const counts: Record<string, number> = {};
      let total = 0;

      (conversations || []).forEach((conv: any) => {
        let count = 0;
        const convId = (conv.id || conv._id || "").toString();
        if (typeof conv.unreadCount === "number") {
          count = conv.unreadCount;
        } else if (conv.unreadCount && typeof conv.unreadCount === "object") {
          const isClient = (conv.clientId?._id || conv.clientId || "").toString() === currentUserId;
          count = isClient ? (conv.unreadCount.client || 0) : (conv.unreadCount.freelancer || 0);
        }
        
        if (convId) {
          counts[convId] = count;
          total += count;
        }
      });

      set({ unreadCounts: counts, totalUnreadCount: total, isLoading: false });
    } catch (err) {
      console.error("Failed to fetch initial unread counts", err);
      set({ isLoading: false });
    }
  },

  updateCount: (conversationId, count) => {
    set((state) => {
      const oldCount = state.unreadCounts[conversationId] || 0;
      const newCounts = { ...state.unreadCounts, [conversationId]: count };
      const newTotal = state.totalUnreadCount - oldCount + count;
      return { unreadCounts: newCounts, totalUnreadCount: newTotal };
    });
  },

  incrementCount: (conversationId) => {
    set((state) => {
      const oldCount = state.unreadCounts[conversationId] || 0;
      const newCounts = {
        ...state.unreadCounts,
        [conversationId]: oldCount + 1,
      };
      return {
        unreadCounts: newCounts,
        totalUnreadCount: state.totalUnreadCount + 1,
      };
    });
  },

  resetCount: (conversationId) => {
    set((state) => {
      const oldCount = state.unreadCounts[conversationId] || 0;
      const newCounts = { ...state.unreadCounts, [conversationId]: 0 };
      return {
        unreadCounts: newCounts,
        totalUnreadCount: Math.max(0, state.totalUnreadCount - oldCount),
      };
    });
  },

  setActiveConversation: (id) => {
    set({ activeConversationId: id });
  },

  setOnlineUsers: (userIds) => {
    set({ onlineUsers: new Set(userIds) });
  },

  addOnlineUser: (userId) => {
    set((state) => {
      const next = new Set(state.onlineUsers);
      next.add(userId);
      return { onlineUsers: next };
    });
  },

  removeOnlineUser: (userId) => {
    set((state) => {
      const next = new Set(state.onlineUsers);
      next.delete(userId);
      return { onlineUsers: next };
    });
  },

  addPendingMessage: (message) => {
    set((state) => {
      const exists = state.pendingMessages.some(m => m.id === message.id);
      if (exists) return state;
      return { pendingMessages: [...state.pendingMessages, message] };
    });
  },

  getPendingMessages: (conversationId) => {
    return get().pendingMessages.filter(m => m.conversationId === conversationId);
  },

  clearPendingMessages: (conversationId) => {
    set((state) => ({
      pendingMessages: state.pendingMessages.filter(m => m.conversationId !== conversationId)
    }));
  },
}));
