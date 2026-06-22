import { api } from "@/lib/api";

export interface Project {
  _id: string;
  id?: string;
  title: string;
  description: string;
  contactInfo?: string;
  categories: string[];
  requiredSkills: string[];
  experienceLevel: "Entry" | "Intermediate" | "Expert";
  deadline: string;
  status: "draft" | "open" | "in-progress" | "completed" | "cancelled";
  applications: number;
  createdAt: string;
  updatedAt: string;
  clientId: string;
  location: {
    type: string;
    city?: string;
    country?: string;
    state?: string;
  };
  visibility?: string;
  client?: {
    id: string;
    fullName: string;
    avatar?: string;
    rating?: number;
  };
  freelancerId?: string;
  freelancer?: {
    id: string;
    fullName: string;
    avatar?: string;
  };
}

export interface ProjectStats {
  total: number;
  open: number;
  inProgress: number;
  completed: number;
  drafts: number;
  cancelled: number;
}

export interface CreateProjectRequest {
  title: string;
  description: string;
  contactInfo?: string;
  categories: string[];
  requiredSkills: string[];
  deadline: string;
  location?: {
    type: string;
    city?: string;
    country?: string;
    state?: string;
  };
  idempotencyKey?: string;
}

export interface ProjectFilters {
  category?: string;
  status?: string;
  search?: string;
  skills?: string[];
  page?: number;
  limit?: number;
}

export const projectService = {
  search: (params?: ProjectFilters) =>
    api.get<{ projects: Project[]; pagination: { totalItems: number; totalPages: number; page: number; limit: number; hasNextPage: boolean; hasPrevPage: boolean; } }>("/projects", { params }),

  searchPublic: (params?: ProjectFilters) =>
    api.get<{ projects: Project[]; pagination: { totalItems: number; totalPages: number; page: number; limit: number; hasNextPage: boolean; hasPrevPage: boolean; } }>("/public/projects", { params }),

  getById: (id: string) => api.get<Project>(`/projects/${id}`),

  getMyClientProjects: (params?: { limit?: number; page?: number }) =>
    api.get<{ projects: Project[] }>("/projects/me/client", { params }),

  getMyClientStats: () => api.get<ProjectStats>("/projects/me/stats"),

  getMyFreelancerProjects: () =>
    api.get<{ projects: Project[] }>("/projects/me/freelancer"),

  create: (data: CreateProjectRequest) => api.post<Project>("/projects", data),

  update: (id: string, data: Partial<CreateProjectRequest>) =>
    api.patch<Project>(`/projects/${id}`, data),

  delete: (id: string) => api.delete<void>(`/projects/${id}`),

  publish: (id: string) => api.post<Project>(`/projects/${id}/publish`, {}),

  hire: (id: string, freelancerId: string) =>
    api.post<Project>(`/projects/${id}/hire`, { freelancerId }),

  complete: (id: string) => api.post<Project>(`/projects/${id}/complete`, {}),

  cancel: (id: string) => api.post<Project>(`/projects/${id}/cancel`, {}),
};

export default projectService;
