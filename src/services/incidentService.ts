import { api } from './apiClient';
import {
  Incident,
  ReportIncidentPayload,
  ApiResponse,
} from '../types';

let localIncidents: Incident[] = [
  {
    id: 'inc-101',
    bookingId: 'book-901',
    resourceId: 'res-101',
    resourceTitle: 'High-Speed Sony FX3 Cinema Camera Kit',
    reportedById: 'user-own-1',
    reportedByName: 'Dr. Sarah Chen',
    reportedByRole: 'owner',
    againstUserId: 'user-stu-3',
    againstUserName: 'Taylor Brooks',
    type: 'late_return',
    severity: 'medium',
    status: 'investigating',
    title: '45-minute overdue return without prior notice',
    description: 'Borrower did not arrive at Studio 204 dropoff station at 14:00. Next reserved student was delayed by 30 minutes.',
    evidenceUrls: [
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
    ],
    resolutionNotes: 'Borrower cited shuttle bus delay. Awaiting admin review for trust score adjustment.',
    trustPenaltyApplied: 0,
    createdAt: '2026-10-25T14:45:00Z',
  },
  {
    id: 'inc-102',
    bookingId: 'book-882',
    resourceId: 'res-107',
    resourceTitle: '4-Channel 1GHz Digital Storage Oscilloscope',
    reportedById: 'user-stu-1',
    reportedByName: 'Alex Rivera',
    reportedByRole: 'student',
    type: 'missing_item',
    severity: 'low',
    status: 'resolved',
    title: 'Channel 3 BNC passive probe tip was missing upon pickup',
    description: 'Documented during pre-use condition inspection at Bench 07. Reported immediately so previous borrower could be queried.',
    evidenceUrls: [
      'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=800&q=80',
    ],
    resolutionNotes: 'Lab custodian located spare probe in drawer 4. No borrower penalty applied due to honest pre-use documentation.',
    trustPenaltyApplied: 0,
    createdAt: '2026-10-18T10:15:00Z',
    resolvedAt: '2026-10-18T11:00:00Z',
  },
  {
    id: 'inc-103',
    bookingId: 'book-850',
    resourceId: 'res-102',
    resourceTitle: 'Precision Bambu Lab X1-Carbon 3D Printer',
    reportedById: 'user-own-1',
    reportedByName: 'Dr. Sarah Chen',
    reportedByRole: 'owner',
    againstUserId: 'user-stu-7',
    againstUserName: 'Devin Vance',
    type: 'damage',
    severity: 'high',
    status: 'open',
    title: 'Scratched PEI build plate surface from metal knife',
    description: 'Heavy linear scratches down to spring steel core. Borrower attempted to remove ABS print with metal scraper instead of approved plastic tool.',
    evidenceUrls: [
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    ],
    resolutionNotes: 'Replacement PEI sheet requested ($35 institutional cost). Trust score penalty under calculation.',
    trustPenaltyApplied: 15,
    createdAt: '2026-10-29T16:30:00Z',
  },
];

export const incidentService = {
  getIncidents: async (): Promise<Incident[]> => {
    try {
      const response = await api.get<ApiResponse<Incident[]>>('/incidents');
      return response.data;
    } catch {
      return localIncidents;
    }
  },

  reportIncident: async (payload: ReportIncidentPayload): Promise<Incident> => {
    try {
      const response = await api.post<ApiResponse<Incident>>('/incidents', payload);
      return response.data;
    } catch {
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
      localIncidents = [newInc, ...localIncidents];
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
      const response = await api.patch<ApiResponse<Incident>>(`/incidents/${id}/status`, {
        status,
        resolutionNotes,
        trustPenaltyApplied,
      });
      return response.data;
    } catch {
      const idx = localIncidents.findIndex((i) => i.id === id);
      if (idx !== -1) {
        localIncidents[idx] = {
          ...localIncidents[idx],
          status,
          resolutionNotes: resolutionNotes || localIncidents[idx].resolutionNotes,
          trustPenaltyApplied:
            trustPenaltyApplied !== undefined
              ? trustPenaltyApplied
              : localIncidents[idx].trustPenaltyApplied,
          resolvedAt: status === 'resolved' ? new Date().toISOString() : undefined,
        };
        return localIncidents[idx];
      }
      return localIncidents[0];
    }
  },
};
