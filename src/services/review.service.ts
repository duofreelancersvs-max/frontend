import { api } from "@/lib/api";

export interface Review {
  id: string;
  projectId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment: string;
  createdAt: string;
  reviewer?: {
    id: string;
    fullName: string;
    avatar?: string;
  };
  project?: {
    id: string;
    title: string;
  };
}

export interface CreateReviewRequest {
  projectId: string;
  revieweeId: string;
  rating: number;
  comment: string;
}

export interface ReviewFilters {
  userId?: string;
  projectId?: string;
  minRating?: number;
  maxRating?: number;
  page?: number;
  limit?: number;
}

export const reviewService = {
  getMyReviews: () => api.get<{ reviews: Review[] }>("/reviews/me"),
  
  getForUser: (userId: string) =>
    api.get<{ reviews: Review[]; averageRating: number; total: number }>(
      `/reviews/user/${userId}`
    ),
  
  getForProject: (projectId: string) =>
    api.get<{ reviews: Review[] }>(`/reviews/project/${projectId}`),
  
  create: (data: CreateReviewRequest) => api.post<Review>("/reviews", data),
  
  update: (id: string, data: Partial<CreateReviewRequest>) =>
    api.patch<Review>(`/reviews/${id}`, data),
  
  delete: (id: string) => api.delete<void>(`/reviews/${id}`),
};

export default reviewService;
