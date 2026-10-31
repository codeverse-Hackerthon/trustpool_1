import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '../services/analyticsService';

export function useAnalytics(role?: string) {
  return useQuery({
    queryKey: ['analytics', role],
    queryFn: () => analyticsService.getDashboardAnalytics(role),
  });
}

