import { api } from "@/lib/api";

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  url?: string;
  imageUrl?: string;
  createdAt: string;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description?: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  current: boolean;
}

export interface FreelancerProfile {
  id: string;
  userId: string;
  title: string;
  bio: string;
  hourlyRate: number;
  skills: string[];
  location: string;
  availability: "available" | "busy" | "unavailable";
  rating: number;
  totalReviews: number;
  completedProjects: number;
  portfolio: PortfolioItem[];
  experience: Experience[];
  education: Education[];
  languages: { name: string; proficiency: string }[];
  createdAt: string;
  updatedAt: string;
}

export interface FreelancerFilters {
  skills?: string[];
  minRate?: number;
  maxRate?: number;
  location?: string;
  availability?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const freelancerService = {
  search: (params?: FreelancerFilters) =>
    api.get<{ freelancers: FreelancerProfile[]; total: number }>(
      "/freelancer-profiles",
      { params }
    ),
  
  getTopRated: () =>
    api.get<{ freelancers: FreelancerProfile[] }>(
      "/freelancer-profiles/top-rated"
    ),
  
  getById: (id: string) => api.get<FreelancerProfile>(`/freelancer-profiles/${id}`),
  
  getMyProfile: () => api.get<FreelancerProfile>("/freelancer-profiles/me"),
  
  ensureProfile: () => api.get<FreelancerProfile>("/freelancer-profiles/me/ensure"),
  
  createProfile: (data: Partial<FreelancerProfile>) =>
    api.post<FreelancerProfile>("/freelancer-profiles/me", data),
  
  updateProfile: (data: Partial<FreelancerProfile>) =>
    api.patch<FreelancerProfile>("/freelancer-profiles/me", data),
  
  deleteProfile: () => api.delete<void>("/freelancer-profiles/me"),
  
  addPortfolio: (data: Partial<PortfolioItem>) =>
    api.post<PortfolioItem>("/freelancer-profiles/me/portfolio", data),
  
  removePortfolio: (itemId: string) =>
    api.delete<void>(`/freelancer-profiles/me/portfolio/${itemId}`),
  
  addExperience: (data: Partial<Experience>) =>
    api.post<Experience>("/freelancer-profiles/me/experience", data),
  
  removeExperience: (experienceId: string) =>
    api.delete<void>(`/freelancer-profiles/me/experience/${experienceId}`),
  
  addEducation: (data: Partial<Education>) =>
    api.post<Education>("/freelancer-profiles/me/education", data),
  
  removeEducation: (educationId: string) =>
    api.delete<void>(`/freelancer-profiles/me/education/${educationId}`),
};

export default freelancerService;
