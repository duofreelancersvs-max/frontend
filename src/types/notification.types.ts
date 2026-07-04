export const NotificationType = {
  PROJECT_MATCH: 'project_match',
  NEW_APPLICATION: 'new_application',
  MESSAGE: 'message',
  HIRE: 'hire',
  SUBSCRIPTION: 'subscription',
  VERIFICATION: 'verification',
  SYSTEM: 'system',
} as const;

export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType];

export interface INotificationData {
  projectId?: string;
  conversationId?: string;
  applicationId?: string;
  freelancerId?: string;
  actionUrl?: string;
}

export interface NotificationResponseDto {
  _id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data: INotificationData;
  isRead: boolean;
  readAt?: string;
  isArchived: boolean;
  channels: {
    inApp: boolean;
    push: boolean;
  };
  createdAt: string;
}

export interface PaginatedNotifications {
  notifications: NotificationResponseDto[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}
