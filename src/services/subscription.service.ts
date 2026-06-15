import { api } from "@/lib/api";

export interface Subscription {
  id: string;
  userId: string;
  plan: "free" | "pro";
  status: "active" | "cancelled" | "expired" | "past_due";
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  features: {
    maxProjects: number;
    maxApplications: number;
    prioritySupport: boolean;
    featuredProfile: boolean;
  };
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: "month" | "year";
  features: {
    maxProjects: number;
    maxApplications: number;
    prioritySupport: boolean;
    featuredProfile: boolean;
  };
}

export const subscriptionService = {
  getMySubscription: () => api.get<Subscription>("/subscriptions/me"),
  
  create: (planId: string) =>
    api.post<Subscription>("/subscriptions", { planId }),
  
  cancel: () => api.post<Subscription>("/subscriptions/cancel", {}),
  
  handleWebhook: (event: string, data: unknown) =>
    api.post("/subscriptions/webhook", { event, data }),
};

export default subscriptionService;
