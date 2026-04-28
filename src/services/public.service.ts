import { api } from '../lib/api';

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

export const publicService = {
  getCategoriesWithSkills: async (): Promise<CategoryWithSkills[]> => {
    const response = await api.get<CategoryWithSkills[]>('/public/categories-with-skills');
    return response;
  },
};
