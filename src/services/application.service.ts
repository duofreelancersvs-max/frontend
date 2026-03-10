import { api } from "@/lib/api";

export interface Application {
  id: string;
  _id?: string;
  projectId: string;
  freelancerId: string;
  coverLetter: string;
  proposedRate: number;
  estimatedDuration: number;
  status:
    | "pending"
    | "accepted"
    | "rejected"
    | "withdrawn"
    | "shortlisted"
    | "hired"
    | "viewed";
  createdAt: string;
  updatedAt: string;
  project?: {
    _id?: string;
    id?: string;
    title: string;
    budget: {
      type: string;
      minAmount: number;
      maxAmount: number;
      currency?: string;
    };
    status: string;
    deadline?: string;
    clientId?: {
      _id: string;
      firstName: string;
      lastName: string;
      avatar?: string;
    };
  };
  freelancer?: {
    _id?: string;
    id?: string;
    firstName?: string;
    lastName?: string;
    fullName?: string;
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
  estimatedDuration: number;
}

export const applicationService = {
  apply: (data: CreateApplicationRequest) =>
    api.post<Application>("/applications", data),

  getMyApplications: () =>
    api.get<{ applications: Application[] }>("/applications/me"),

  withdraw: (id: string) =>
    api.post<Application>(`/applications/${id}/withdraw`, {}),

  getByProject: (projectId: string) =>
    api.get<{ applications: Application[] }>(
      `/applications/project/${projectId}`,
    ),

  getProjectStats: (projectId: string) =>
    api.get<ApplicationStats>(`/applications/project/${projectId}/stats`),

  updateStatus: (
    id: string,
    status: "accepted" | "rejected" | "shortlisted" | "hired",
  ) => api.patch<Application>(`/applications/${id}/status`, { status }),
};

export default applicationService;
