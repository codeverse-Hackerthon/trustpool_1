import { useQuery } from '@tanstack/react-query';
import { allocationService } from '../services/allocationService';

export const ALLOCATION_KEYS = {
  all: ['allocation'] as const,
  profile: (userId?: string) => ['allocation', 'profile', userId] as const,
  factors: () => ['allocation', 'factors'] as const,
  queue: (resourceId?: string) => ['allocation', 'queue', resourceId] as const,
  history: () => ['allocation', 'history'] as const,
};

export function useUserFairnessProfile(userId?: string) {
  return useQuery({
    queryKey: ALLOCATION_KEYS.profile(userId),
    queryFn: () => allocationService.getUserFairnessProfile(userId),
  });
}

export function useFairnessFactors() {
  return useQuery({
    queryKey: ALLOCATION_KEYS.factors(),
    queryFn: () => allocationService.getFairnessFactors(),
  });
}

export function useAllocationQueue(resourceId?: string) {
  return useQuery({
    queryKey: ALLOCATION_KEYS.queue(resourceId),
    queryFn: () => allocationService.getAllocationQueue(resourceId),
  });
}

export function useAllocationHistory() {
  return useQuery({
    queryKey: ALLOCATION_KEYS.history(),
    queryFn: () => allocationService.getAllocationHistory(),
  });
}

