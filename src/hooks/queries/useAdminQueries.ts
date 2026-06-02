import { useQuery } from '@tanstack/react-query';
import { adminService } from '@/services/admin.service';

export const useAdminProjects = (params?: { page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ['adminProjects', params],
    queryFn: () => adminService.getAllProjects(params),
    staleTime: 1000 * 60 * 2,
  });
};

export const useAdminAuditLogs = (params?: { page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ['adminAuditLogs', params],
    queryFn: () => adminService.getAuditLogs(params),
    staleTime: 1000 * 60 * 2,
  });
};

export const useAdminPayments = (params?: { page?: number; limit?: number; type?: string }) => {
  return useQuery({
    queryKey: ['adminPayments', params],
    queryFn: () => adminService.getAllPayments(params),
    staleTime: 1000 * 60 * 2,
  });
};
