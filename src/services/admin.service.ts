import { api } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────

export interface AdminStats {
  totalUsers: number;
  totalFreelancers: number;
  totalClients: number;
  totalAdmins: number;
  activeUsers: number;
  pendingUsers: number;
  suspendedUsers: number;
  totalProjects: number;
  totalApplications: number;
  pendingVerifications: number;
  activeSubscriptions: number;
  revenue: {
    monthly: number;
    yearly: number;
  };
}

export interface AdminUser {
  _id: string;
  id?: string;
  email: string;
  fullName?: string;
  role: "client" | "freelancer" | "admin";
  status: "active" | "suspended" | "pending";
  phone?: string;
  address?: {
    city?: string;
    state?: string;
    country?: string;
  };
  createdAt: string;
  updatedAt?: string;
  lastLoginAt?: string;
  profile?: {
    displayName?: string;
    firstName?: string;
    lastName?: string;
    companyName?: string;
    headline?: string;
    hourlyRate?: number;
    totalEarnings?: number;
    totalProjects?: number;
    averageRating?: number;
    reviewCount?: number;
    isVerified?: boolean;
    totalProjectsPosted?: number;
  } | null;
}

export interface AdminProject {
  _id: string;
  title: string;
  description?: string;
  status: string;
  category?: string;
  budget?: {
    type?: string;
    minAmount?: number;
    maxAmount?: number;
    currency?: string;
  };
  clientId: string;
  clientName?: string;
  hiredFreelancerId?: string;
  deadline?: string;
  createdAt: string;
  completedAt?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface VerificationItem {
  _id: string;
  freelancerId: {
    _id: string;
    email: string;
    fullName?: string;
  };
  freelancerProfile?: {
    firstName?: string;
    lastName?: string;
    displayName?: string;
    isVerified?: boolean;
    verificationBadge?: string;
    category?: string;
  } | null;
  documentType: "aadhaar" | "pan" | "portfolio_proof" | "certificate";
  documentNumber: string;
  documentUrl: string;
  status: "pending" | "approved" | "rejected";
  adminNotes?: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: {
    _id: string;
    email: string;
    fullName?: string;
  };
}

export interface NotificationHistoryItem {
  title: string;
  message: string;
  type: string;
  recipientCount: number;
  readCount: number;
  sentAt: string;
}

export interface AdminReview {
  _id: string;
  reviewerId: { _id: string; fullName?: string; email: string };
  freelancerId: { _id: string; fullName?: string; email: string };
  projectId: { _id: string; title: string };
  rating: number;
  review: string;
  createdAt: string;
  status?: "visible" | "hidden" | "flagged";
}

export interface AdminApplication {
  _id: string;
  projectId: { _id: string; title: string; clientId?: { _id: string; fullName?: string; email: string } };
  freelancerId: { _id: string; fullName?: string; email: string };
  coverLetter?: string;
  proposedRate?: number;
  status: "pending" | "accepted" | "rejected" | "withdrawn";
  createdAt: string;
}

export interface AdminConversation {
  _id: string;
  participants: Array<{ _id: string; fullName?: string; email: string; role: string }>;
  lastMessage?: { content: string; senderId: string; createdAt: string };
  projectId?: { _id: string; title: string };
  unreadCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminMessage {
  _id: string;
  conversationId: string;
  senderId: { _id: string; email: string; fullName?: string; role?: string };
  content: string;
  attachments?: Array<{ type: string; url: string; name?: string }>;
  isRead: boolean;
  sentAt: string;
  createdAt: string;
}

export interface AdminCategory {
  _id: string;
  name: string;
  description?: string;
  icon?: string;
  isActive: boolean;
  projectCount: number;
  freelancerCount: number;
  skills: Array<{ _id: string; name: string }>;
  createdAt: string;
}

export interface AdminPayment {
  _id: string;
  transactionId: string;
  amount: number;
  currency: string;
  status: "captured" | "failed" | "refunded" | "pending";
  type: "project_payment" | "subscription" | "withdrawal";
  payerId: { _id: string; fullName?: string; email: string };
  payeeId?: { _id: string; fullName?: string; email: string };
  projectId?: { _id: string; title: string };
  createdAt: string;
}

export interface AuditLogEntry {
  _id: string;
  adminId: { _id: string; fullName?: string; email: string };
  action: string;
  resource: string;
  resourceId?: string;
  details?: string;
  ip?: string;
  createdAt: string;
}

// ─── Service ──────────────────────────────────────────────────

export const adminService = {
  // Dashboard
  getDashboardStats: () => api.get<AdminStats>("/admin/dashboard"),

  // Users
  getAllUsers: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    status?: string;
  }) =>
    api.get<{ users: AdminUser[]; pagination: PaginationMeta }>("/admin/users", {
      params,
    }),

  getUserById: (userId: string) =>
    api.get<{ user: AdminUser; profile: unknown }>(`/admin/users/${userId}`),

  updateUserStatus: (userId: string, status: string) =>
    api.patch<{ message: string; user: AdminUser }>(
      `/admin/users/${userId}/status`,
      { status }
    ),

  // Projects
  getAllProjects: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    category?: string;
    search?: string;
  }) =>
    api.get<{ projects: AdminProject[]; pagination: PaginationMeta }>(
      "/admin/projects",
      { params }
    ),

  getProjectById: (projectId: string) =>
    api.get<AdminProject>(`/admin/projects/${projectId}`),

  updateProject: (projectId: string, data: { status?: string; category?: string; title?: string; description?: string; visibility?: string }) =>
    api.patch<{ message: string; project: AdminProject }>(`/admin/projects/${projectId}`, data),

  deleteProject: (projectId: string) =>
    api.delete<{ message: string }>(`/admin/projects/${projectId}`),

  // Freelancer verification
  verifyFreelancer: (userId: string) =>
    api.post(`/admin/verify-freelancer/${userId}`, {}),

  suspendUser: (userId: string, reason: string) =>
    api.post(`/admin/suspend-user/${userId}`, { reason }),

  activateUser: (userId: string) =>
    api.patch<{ message: string; user: AdminUser }>(
      `/admin/users/${userId}/status`,
      { status: "active" }
    ),

  featureProject: (projectId: string) =>
    api.post(`/admin/feature-project/${projectId}`, {}),

  // Verifications
  getVerifications: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    documentType?: string;
  }) =>
    api.get<{
      verifications: VerificationItem[];
      stats: { pending: number; approved: number; rejected: number };
      pagination: PaginationMeta;
    }>("/admin/verifications", { params }),

  approveVerification: (id: string, adminNotes?: string) =>
    api.patch(`/admin/verifications/${id}/approve`, { adminNotes }),

  rejectVerification: (id: string, reason: string, adminNotes?: string) =>
    api.patch(`/admin/verifications/${id}/reject`, { reason, adminNotes }),

  // Notifications
  sendNotification: (data: {
    title: string;
    message: string;
    type?: string;
    recipientType: "all" | "clients" | "freelancers" | "specific";
    recipientIds?: string[];
  }) => api.post<{ message: string; recipientCount: number }>("/admin/notifications/send", data),

  getNotificationHistory: (params?: { page?: number; limit?: number }) =>
    api.get<{ history: NotificationHistoryItem[] }>("/admin/notifications/history", { params }),

  // ─── Reviews ─────────────────────────────────────────────────
  getAllReviews: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    rating?: number;
    search?: string;
  }) =>
    api.get<{ reviews: AdminReview[]; pagination: PaginationMeta }>(
      "/admin/reviews",
      { params },
    ),

  moderateReview: (reviewId: string, action: string) =>
    api.patch<{ message: string }>(`/admin/reviews/${reviewId}/moderate`, { action }),

  deleteReview: (reviewId: string) =>
    api.delete<{ message: string }>(`/admin/reviews/${reviewId}`),

  // ─── Applications ────────────────────────────────────────────
  getAllApplications: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }) =>
    api.get<{ applications: AdminApplication[]; pagination: PaginationMeta }>(
      "/admin/applications",
      { params },
    ),

  updateApplicationStatus: (applicationId: string, status: string) =>
    api.patch<{ message: string }>(`/admin/applications/${applicationId}/status`, { status }),

  // ─── Conversations ───────────────────────────────────────────
  getAllConversations: (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }) =>
    api.get<{ conversations: AdminConversation[]; pagination: PaginationMeta }>(
      "/admin/conversations",
      { params },
    ),

  getConversationMessages: (conversationId: string) =>
    api.get<{ conversation: AdminConversation; messages: AdminMessage[] }>(
      `/admin/conversations/${conversationId}/messages`,
    ),

  deleteConversation: (conversationId: string) =>
    api.delete<{ message: string }>(`/admin/conversations/${conversationId}`),

  // ─── Categories & Skills ─────────────────────────────────────
  getAllCategories: (params?: {
    page?: number;
    limit?: number;
    isActive?: boolean;
  }) =>
    api.get<{ categories: AdminCategory[]; pagination: PaginationMeta }>(
      "/admin/categories",
      { params },
    ),

  createCategory: (data: { name: string; description?: string; icon?: string }) =>
    api.post<{ message: string; category: AdminCategory }>("/admin/categories", data),

  updateCategory: (categoryId: string, data: Partial<AdminCategory>) =>
    api.patch<{ message: string; category: AdminCategory }>(
      `/admin/categories/${categoryId}`,
      data,
    ),

  deleteCategory: (categoryId: string) =>
    api.delete<{ message: string }>(`/admin/categories/${categoryId}`),

  addSkill: (categoryId: string, data: { name: string }) =>
    api.post<{ message: string }>(`/admin/categories/${categoryId}/skills`, data),

  removeSkill: (categoryId: string, skillId: string) =>
    api.delete<{ message: string }>(`/admin/categories/${categoryId}/skills/${skillId}`),

  // ─── Payments ────────────────────────────────────────────────
  getAllPayments: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
    search?: string;
  }) =>
    api.get<{ payments: AdminPayment[]; pagination: PaginationMeta }>(
      "/admin/payments",
      { params },
    ),

  refundPayment: (paymentId: string, reason?: string) =>
    api.post<{ message: string }>(`/admin/payments/${paymentId}/refund`, { reason }),

  // ─── Audit Logs ──────────────────────────────────────────────
  getAuditLogs: (params?: {
    page?: number;
    limit?: number;
    adminId?: string;
    action?: string;
    resource?: string;
  }) =>
    api.get<{ logs: AuditLogEntry[]; pagination: PaginationMeta }>(
      "/admin/audit-logs",
      { params },
    ),
};

export default adminService;
