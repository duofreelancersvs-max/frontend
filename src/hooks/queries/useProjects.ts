import { useQuery } from '@tanstack/react-query';
import { projectService } from '@/services/project.service';
import type { ProjectFilters } from '@/services/project.service';

export const useProjects = (filters?: ProjectFilters) => {
  return useQuery({
    queryKey: ['projects', filters],
    queryFn: () => projectService.search(filters),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const usePublicProjects = (filters?: ProjectFilters) => {
  return useQuery({
    queryKey: ['publicProjects', filters],
    queryFn: () => projectService.searchPublic(filters),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useClientProjects = (params?: { limit?: number; page?: number }) => {
  return useQuery({
    queryKey: ['clientProjects', params],
    queryFn: () => projectService.getMyClientProjects(params),
    staleTime: 1000 * 60 * 2,
  });
};

export const useFreelancerProjects = () => {
  return useQuery({
    queryKey: ['freelancerProjects'],
    queryFn: () => projectService.getMyFreelancerProjects(),
    staleTime: 1000 * 60 * 2,
  });
};

export const useProject = (id: string) => {
  return useQuery({
    queryKey: ['project', id],
    queryFn: () => projectService.getById(id),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!id,
  });
};
