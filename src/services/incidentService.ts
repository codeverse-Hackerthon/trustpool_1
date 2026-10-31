import { api } from './apiClient';
import {
  Incident,
  ReportIncidentPayload,
} from '../types';

const normalizeIncident = (i: any): Incident => {
  return {
    id: String(i.id),
    bookingId: i.bookingId || i.booking_id,
    resourceId: String(i.resourceId || i.resource_id),
    resourceTitle: i.resourceTitle || 'Reported Resource Incident',
    reportedById: String(i.reportedById || i.reported_by),
    reportedByName: i.reportedByName || 'Alex Rivera',
    reportedByRole: (i.reportedByRole || 'student').toLowerCase() as any,
    againstUserId: i.againstUserId,
    againstUserName: i.againstUserName,
    type: (i.type || i.incident_type || 'other').toLowerCase() as any,
    severity: (i.severity || 'low').toLowerCase() as any,
    status: (i.status || 'open').toLowerCase() as any,
    title: i.title,
    description: i.description,
    evidenceUrls: i.evidenceUrls || i.evidence_urls || [],
    resolutionNotes: i.resolutionNotes || i.resolution_notes,
    trustPenaltyApplied: i.trustPenaltyApplied || 0,
    createdAt: i.createdAt || i.created_at || new Date().toISOString(),
    resolvedAt: i.resolvedAt || i.resolved_at,
  };
};

export const incidentService = {
  getIncidents: async (): Promise<Incident[]> => {
    try {
      const response = await api.get<any>('/incidents');
      const list = response?.data || response;
      if (Array.isArray(list) && list.length > 0) {
        return list.map(normalizeIncident);
      }
      return [];
    } catch {
      return [];
    }
  },

  reportIncident: async (payload: ReportIncidentPayload): Promise<Incident> => {
    try {
      const response = await api.post<any>('/incidents', {
        resource_id: payload.resourceId,
        booking_id: payload.bookingId,
        incident_type: payload.type.toUpperCase(),
        severity: payload.severity.toUpperCase(),
        title: payload.title,
        description: payload.description,
      });
      const data = response?.data || response;
      return normalizeIncident(data);
    } catch (error) {
      const newInc: Incident = {
        id: `inc-${Date.now().toString().slice(-4)}`,
        bookingId: payload.bookingId,
        resourceId: payload.resourceId,
        resourceTitle: 'Reported Resource Incident',
        reportedById: 'user-stu-1',
        reportedByName: 'Alex Rivera',
        reportedByRole: 'student',
        againstUserId: payload.againstUserId,
        type: payload.type,
        severity: payload.severity,
        status: 'open',
        title: payload.title,
        description: payload.description,
        evidenceUrls: payload.evidenceUrls || [],
        createdAt: new Date().toISOString(),
      };
      return newInc;
    }
  },

  updateIncidentStatus: async (
    id: string,
    status: Incident['status'],
    resolutionNotes?: string,
    trustPenaltyApplied?: number
  ): Promise<Incident> => {
    try {
      const response = await api.patch<any>(`/incidents/${id}/status`, {
        status: status.toUpperCase(),
        notes: resolutionNotes,
        resolutionNotes,
        trustPenaltyApplied,
      });
      const data = response?.data || response;
      return normalizeIncident(data);
    } catch (error) {
      return {
        id,
        resourceId: 'res-1',
        resourceTitle: 'Incident Resource',
        reportedById: 'user-1',
        reportedByName: 'User',
        reportedByRole: 'student',
        type: 'damage',
        severity: 'medium',
        status,
        title: 'Updated Incident',
        description: '',
        resolutionNotes,
        createdAt: new Date().toISOString(),
      };
    }
  },
};
