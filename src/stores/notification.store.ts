import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { NotificationResponseDto } from '../types/notification.types';
import { api } from '@/lib/api';

interface NotificationState {
  notifications: NotificationResponseDto[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;

  // Actions
  setNotifications: (notifications: NotificationResponseDto[]) => void;
  addNotification: (notification: NotificationResponseDto) => void;
  setUnreadCount: (count: number) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearNotifications: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  devtools(
    (set) => ({
      notifications: [],
      unreadCount: 0,
      isLoading: false,
      error: null,

      setNotifications: (notifications) => set({ notifications }),
      
      addNotification: (notification) => set((state) => {
        // Prevent duplicates
        if (state.notifications.some((n) => n._id === notification._id)) {
          return state;
        }
        return {
          notifications: [notification, ...state.notifications],
          unreadCount: state.unreadCount + 1,
        };
      }),

      setUnreadCount: (count) => set({ unreadCount: count }),

      markAsRead: async (notificationId) => {
        let wasUnread = false;
        set((state) => {
          const notif = state.notifications.find(n => n._id === notificationId);
          if (notif && !notif.isRead) {
            wasUnread = true;
            return {
              notifications: state.notifications.map((n) => 
                n._id === notificationId ? { ...n, isRead: true } : n
              ),
              unreadCount: Math.max(0, state.unreadCount - 1),
            };
          }
          return state;
        });

        if (wasUnread) {
          try {
            await api.patch(`/notifications/${notificationId}/read`, {});
          } catch (error) {
            console.error('Failed to mark notification as read:', error);
          }
        }
      },

      markAllAsRead: async () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
          unreadCount: 0,
        }));
        
        try {
          await api.post('/notifications/read-all', {});
        } catch (error) {
          console.error('Failed to mark all as read:', error);
        }
      },

      setIsLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      clearNotifications: () => set({ notifications: [], unreadCount: 0, error: null }),
    }),
    { name: 'NotificationStore' }
  )
);
