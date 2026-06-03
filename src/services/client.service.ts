import { api } from "@/lib/api";

export interface ClientProfile {
  _id: string;
  userId: string;
  totalProjectsPosted: number;
  totalHires: number;
  averageRating: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClientProfileRequest {
  [key: string]: unknown;
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
