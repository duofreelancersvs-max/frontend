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
};

export default adminService;
