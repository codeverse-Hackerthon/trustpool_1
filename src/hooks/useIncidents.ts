import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { incidentService } from '../services/incidentService';
import { ReportIncidentPayload, Incident } from '../types';

export const INCIDENT_KEYS = {
  all: ['incidents'] as const,
};

export function useIncidents() {
  return useQuery({
    queryKey: INCIDENT_KEYS.all,
    queryFn: () => incidentService.getIncidents(),
  });
}

export function useReportIncident() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ReportIncidentPayload) =>
      incidentService.reportIncident(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INCIDENT_KEYS.all });
    },
  });
}

export function useUpdateIncidentStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      status,
      resolutionNotes,
      trustPenaltyApplied,
    }: {
      id: string;
      status: Incident['status'];
      resolutionNotes?: string;
      trustPenaltyApplied?: number;
    }) =>
      incidentService.updateIncidentStatus(
        id,
        status,
        resolutionNotes,
        trustPenaltyApplied
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INCIDENT_KEYS.all });
    },
  });
}

