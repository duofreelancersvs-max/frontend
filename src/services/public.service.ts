import { api } from '../lib/api';

export interface SubscriptionPlan {
  _id: string;
  name: string;
  description: string;
  price: number;
  billingCycle: 'monthly' | 'yearly';
  features: string[];
  tier: number;
  isFree: boolean;
  isActive: boolean;
  isPopular?: boolean;
}

export interface Skill {
  _id: string;
  skillName: string;
  category: string;
  aliases: string[];
  popularityCount: number;
}

export interface CategoryWithSkills {
  _id: string;
  name: string;
  description: string;
  slug: string;
  icon: string;
  color: string;
  order: number;
  skills: Skill[];
}

export interface LegalSection {
  sectionNumber: number;
  title: string;
  content: string;
  bulletPoints?: string[];
  icon?: string;
}

export interface LegalContent {
  _id: string;
  slug: string;
  pageTitle: string;
  subtitle?: string;
  lastUpdated: string;
  effectiveDate: string;
  version: string;
  sections: LegalSection[];
  safetyTips?: string[];
}

export interface LegalSlug {
  _id: string;
  slug: string;
  pageTitle: string;
  lastUpdated: string;
  version: string;
}

export const publicService = {
  getCategoriesWithSkills: async (): Promise<CategoryWithSkills[]> => {
    const response = await api.get<CategoryWithSkills[]>('/public/categories-with-skills');
    return response;
  },

  getLegalContent: async (slug: string): Promise<LegalContent> => {
    const response = await api.get<LegalContent>(`/public/legal/${slug}`);
    return response;
  },

  getAllLegalSlugs: async (): Promise<LegalSlug[]> => {
    const response = await api.get<LegalSlug[]>('/public/legal');
    return response;
  },

  getSubscriptionPlans: async (): Promise<SubscriptionPlan[]> => {
    const response = await api.get<SubscriptionPlan[]>('/public/subscriptions');
    return response;
  },
};
