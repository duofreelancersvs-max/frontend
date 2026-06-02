import { useQuery } from '@tanstack/react-query';
import { freelancerService, applicationService, subscriptionService, conversationService } from '@/services';

export const useMyFreelancerProfile = () => {
  return useQuery({
    queryKey: ['myFreelancerProfile'],
    queryFn: () => freelancerService.getMyProfile(),
    staleTime: 1000 * 60 * 10,
  });
};

export const useMyApplications = () => {
  return useQuery({
    queryKey: ['myApplications'],
    queryFn: () => applicationService.getMyApplications(),
    staleTime: 1000 * 60 * 2,
  });
};

export const useMySubscription = () => {
  return useQuery({
    queryKey: ['mySubscription'],
    queryFn: () => subscriptionService.getMySubscription(),
    staleTime: 1000 * 60 * 5,
  });
};

export const useMyConversations = () => {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: () => conversationService.getAll(),
    staleTime: 1000 * 60 * 2,
  });
};
