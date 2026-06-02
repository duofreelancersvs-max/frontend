import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { freelancerService, conversationService, userService, clientService, applicationService } from '@/services';

export const useTopRatedFreelancers = () => {
  return useQuery({
    queryKey: ['topRatedFreelancers'],
    queryFn: () => freelancerService.getTopRated(),
    staleTime: 1000 * 60 * 5,
  });
};

export const useConversations = () => {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: () => conversationService.getAll(),
    staleTime: 1000 * 60 * 2,
  });
};

export const useMyUser = () => {
  return useQuery({
    queryKey: ['myUser'],
    queryFn: () => userService.getMe(),
    staleTime: 1000 * 60 * 10,
  });
};

export const useMyClientProfile = () => {
  return useQuery({
    queryKey: ['myClientProfile'],
    queryFn: () => clientService.getMyProfile(),
    staleTime: 1000 * 60 * 10,
  });
};

export const useMyClientApplications = () => {
  return useQuery({
    queryKey: ['myClientApplications'],
    queryFn: () => applicationService.getMyClientApplications(),
    staleTime: 1000 * 60 * 2,
  });
};

export const useHireFreelancer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (applicationId: string) => applicationService.updateStatus(applicationId, 'hired'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myClientApplications'] });
      queryClient.invalidateQueries({ queryKey: ['clientProjects'] });
    },
  });
};

export const useCreateConversation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { participantId: string; projectId?: string }) => conversationService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
};
