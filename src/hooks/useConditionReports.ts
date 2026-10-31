import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { conditionService } from '../services/conditionService';
import { CreateConditionReportPayload } from '../types';

export const CONDITION_KEYS = {
  all: ['condition-reports'] as const,
  booking: (bookingId: string) => ['condition-reports', 'booking', bookingId] as const,
};

export function useConditionReports() {
  return useQuery({
    queryKey: CONDITION_KEYS.all,
    queryFn: () => conditionService.getAllReports(),
  });
}

export function useConditionReportsByBooking(bookingId: string) {
  return useQuery({
    queryKey: CONDITION_KEYS.booking(bookingId),
    queryFn: () => conditionService.getReportsByBooking(bookingId),
    enabled: !!bookingId,
  });
}

export function useCreateConditionReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateConditionReportPayload) =>
      conditionService.submitConditionReport(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONDITION_KEYS.all });
    },
  });
}

