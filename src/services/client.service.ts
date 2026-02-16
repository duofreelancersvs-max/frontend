import { api } from "@/lib/api";

export interface ClientProfile {
  id: string;
  userId: string;
  companyName?: string;
  bio?: string;
  industry?: string;
  website?: string;
  location?: string;
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  rating: number;
  totalReviews: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClientProfileRequest {
  companyName?: string;
  bio?: string;
  industry?: string;
  website?: string;
  location?: string;
}

export const clientService = {
  getMyProfile: () => api.get<ClientProfile>("/client-profiles/me"),
  
  ensureProfile: () => api.get<ClientProfile>("/client-profiles/me/ensure"),
  
  createProfile: (data: CreateClientProfileRequest) =>
    api.post<ClientProfile>("/client-profiles/me", data),
  
  updateProfile: (data: Partial<CreateClientProfileRequest>) =>
    api.patch<ClientProfile>("/client-profiles/me", data),
  
  deleteProfile: () => api.delete<void>("/client-profiles/me"),
  
  getByUserId: (userId: string) =>
    api.get<ClientProfile>(`/client-profiles/${userId}`),
};

export default clientService;
