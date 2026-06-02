import { useQuery } from '@tanstack/react-query';
import { adminService } from '@/services/admin.service';

export const useAdminStats = () => {
  return useQuery({
    queryKey: ['adminStats'],
    queryFn: () => adminService.getDashboardStats(),
    staleTime: 1000 * 60 * 1, // 1 minute
  });
};
