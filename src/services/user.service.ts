import { api } from "@/lib/api";

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
  avatar?: string;
  status: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserStats {
  totalProjects: number;
  completedProjects: number;
  activeProjects: number;
  totalEarnings?: number;
  totalSpent?: number;
  rating?: number;
  profileViews?: number;
}

export const userService = {
  getMe: () => api.get<User>("/users/me"),
  
  updateMe: (data: Partial<User>) => api.patch<User>("/users/me", data),
  
  getStats: () => api.get<UserStats>("/users/stats"),
  
  getAll: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get<{ users: User[]; total: number }>("/users", { params }),
  
  getById: (id: string) => api.get<User>(`/users/${id}`),
  
  getProfile: (id: string) => api.get<User>(`/users/${id}/profile`),
  
  updateStatus: (id: string, status: string) =>
    api.patch(`/users/${id}/status`, { status }),
  
  delete: (id: string) => api.delete<void>(`/users/${id}`),
};

export default userService;
