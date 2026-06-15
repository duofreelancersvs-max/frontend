import { api } from "@/lib/api";

export interface SkillRef {
  skillId?: string;
  name: string;
  proficiency: number;
}

export interface PortfolioItem {
  _id?: string;
  title: string;
  description?: string;
  thumbnail?: string;
  projectUrl?: string;
  skills: string[];
  createdAt?: string;
}

export interface WorkExperience {
  _id?: string;
  company: string;
  title: string;
  startDate: string;
  endDate?: string;
  description?: string;
}

export interface Education {
  _id?: string;
  institution: string;
  degree?: string;
  fieldOfStudy?: string;
  year?: number;
}

export interface FreelancerProfile {
  _id: string;
  id?: string;
  userId: string;
  firstName: string;
  lastName: string;
  contactInfo: string;
  displayName?: string;
  headline?: string;
  bio?: string;
  profilePicture?: string;
  hourlyRate: number;
  availability: string;
  category: string;
  experienceLevel: string;
  skills: SkillRef[];
  totalEarnings: number;
  totalProjects: number;
  successRate: number;
  averageRating: number;
  reviewCount: number;
  isVerified: boolean;
  verificationBadge: string;
  isProActive?: boolean;
  prioritySearch?: boolean;
  featuredProfile?: boolean;
  portfolio: PortfolioItem[];
  workExperience: WorkExperience[];
  education: Education[];
  createdAt: string;
  updatedAt: string;
  // Search-only fields used by ClientFreelancers card
  title?: string;
  location?: string;
  rating?: number;
  totalReviews?: number;
  completedProjects?: number;
}

export interface FreelancerFilters {
  skills?: string[];
  minRate?: number;
  maxRate?: number;
  location?: string;
  availability?: string;
  search?: string;
  category?: string;
  experienceLevel?: string;
  page?: number;
  limit?: number;
}

export const freelancerService = {
  search: (params?: FreelancerFilters) =>
    api.get<{
      profiles: FreelancerProfile[];
      pagination: {
        totalItems: number;
        totalPages: number;
        page: number;
        limit: number;
      };
    }>("/freelancer-profiles", { params }),
  
  searchPublic: (params?: FreelancerFilters) =>
    api.get<{
      profiles: FreelancerProfile[];
      pagination: {
        totalItems: number;
        totalPages: number;
        page: number;
        limit: number;
      };
    }>("/public/freelancers", { params }),

  getTopRated: () =>
    api.get<{ profiles: FreelancerProfile[] }>(
      "/freelancer-profiles/top-rated",
    ),

  getById: (id: string) =>
    api.get<FreelancerProfile>(`/freelancer-profiles/${id}`),

  getMyProfile: () => api.get<FreelancerProfile>("/freelancer-profiles/me"),

  ensureProfile: () =>
    api.get<FreelancerProfile>("/freelancer-profiles/me/ensure"),

  createProfile: (data: Partial<FreelancerProfile>) =>
    api.post<FreelancerProfile>("/freelancer-profiles/me", data),

  updateProfile: (data: Partial<FreelancerProfile>) =>
    api.patch<FreelancerProfile>("/freelancer-profiles/me", data),

  deleteProfile: () => api.delete<void>("/freelancer-profiles/me"),

  addPortfolio: (data: Partial<PortfolioItem>) =>
    api.post<FreelancerProfile>("/freelancer-profiles/me/portfolio", data),

  updatePortfolio: (itemId: string, data: Partial<PortfolioItem>) =>
    api.patch<FreelancerProfile>(
      `/freelancer-profiles/me/portfolio/${itemId}`,
      data,
    ),

  removePortfolio: (itemId: string) =>
    api.delete<FreelancerProfile>(
      `/freelancer-profiles/me/portfolio/${itemId}`,
    ),

  addExperience: (data: Partial<WorkExperience>) =>
    api.post<FreelancerProfile>("/freelancer-profiles/me/experience", data),

  removeExperience: (experienceId: string) =>
    api.delete<FreelancerProfile>(
      `/freelancer-profiles/me/experience/${experienceId}`,
    ),

  addEducation: (data: Partial<Education>) =>
    api.post<FreelancerProfile>("/freelancer-profiles/me/education", data),

  removeEducation: (educationId: string) =>
    api.delete<FreelancerProfile>(
      `/freelancer-profiles/me/education/${educationId}`,
    ),
};

export default freelancerService;
