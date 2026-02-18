import { api } from "@/lib/api";

export interface Application {
  id: string;
  projectId: string;
  freelancerId: string;
  coverLetter: string;
  proposedRate: number;
  estimatedDuration: string;
  status: "pending" | "accepted" | "rejected" | "withdrawn";
  createdAt: string;
  updatedAt: string;
  project?: {
    id: string;
    title: string;
    budget: { type: string; minAmount: number; maxAmount: number; currency: string };
    status: string;
    deadline?: string;
  };
  freelancer?: {
    id: string;
    fullName: string;
    avatar?: string;
    title?: string;
    rating?: number;
  };
}

export interface ApplicationStats {
  total: number;
  pending: number;
  accepted: number;
  rejected: number;
}

export interface CreateApplicationRequest {
  projectId: string;
  coverLetter: string;
  proposedRate: number;
  estimatedDuration: string;
}

export const applicationService = {
  apply: (data: CreateApplicationRequest) =>
    api.post<Application>("/applications", data),
  
  getMyApplications: () =>
    api.get<{ applications: Application[] }>("/applications/me"),
  
  withdraw: (id: string) => api.post<Application>(`/applications/${id}/withdraw`, {}),
  
  getByProject: (projectId: string) =>
    api.get<{ applications: Application[] }>(`/applications/project/${projectId}`),
  
  getProjectStats: (projectId: string) =>
    api.get<ApplicationStats>(`/applications/project/${projectId}/stats`),
  
  updateStatus: (id: string, status: "accepted" | "rejected") =>
    api.patch<Application>(`/applications/${id}/status`, { status }),
};

export default applicationService;
