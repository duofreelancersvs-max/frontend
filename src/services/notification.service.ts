import { api } from "@/lib/api";

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  read: boolean;
  createdAt: string;
}

export interface NotificationCount {
  unread: number;
  total: number;
}

export const notificationService = {
  getAll: (params?: { page?: number; limit?: number }) =>
    api.get<{ notifications: Notification[]; total: number }>(
      "/notifications",
      { params }
    ),
  
  markAsRead: (id: string) =>
    api.patch<Notification>(`/notifications/${id}/read`, {}),
  
  markAllAsRead: () => api.post<void>("/notifications/read-all", {}),
  
  getUnreadCount: () => api.get<NotificationCount>("/notifications/count"),
};

export default notificationService;
