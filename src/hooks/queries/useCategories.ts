import { useQuery } from '@tanstack/react-query';
import { publicService } from '@/services/public.service';
import type { CategoryWithSkills } from '@/services/public.service';

export const useCategories = () => {
  return useQuery<CategoryWithSkills[]>({
    queryKey: ['categories'],
    queryFn: publicService.getCategoriesWithSkills,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};
