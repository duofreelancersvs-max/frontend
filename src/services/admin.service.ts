import { api } from "@/lib/api";

export interface AdminStats {
  totalUsers: number;
  totalFreelancers: number;
  totalClients: number;
  totalProjects: number;
  totalApplications: number;
  activeSubscriptions: number;
  revenue: {
    monthly: number;
    yearly: number;
  };
}

export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
  status: string;
  createdAt: string;
}

export interface AdminProject {
  id: string;
  title: string;
  status: string;
  budget: { min: number; max: number };
  clientId: string;
  freelancerId?: string;
  createdAt: string;
}

export const adminService = {
  getDashboardStats: () => api.get<AdminStats>("/admin/dashboard"),
  
  getAllUsers: (params?: { page?: number; limit?: number; search?: string; role?: string; status?: string }) =>
    api.get<{ users: AdminUser[]; total: number }>("/admin/users", { params }),
  
  getAllProjects: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get<{ projects: AdminProject[]; total: number }>("/admin/projects", { params }),
  
  verifyFreelancer: (userId: string) =>
    api.post(`/admin/verify-freelancer/${userId}`, {}),
  
  suspendUser: (userId: string, reason: string) =>
    api.post(`/admin/suspend-user/${userId}`, { reason }),
  
  featureProject: (projectId: string) =>
    api.post(`/admin/feature-project/${projectId}`, {}),
};

export default adminService;
