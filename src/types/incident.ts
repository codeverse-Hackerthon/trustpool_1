export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';
export type IncidentStatus = 'open' | 'investigating' | 'resolved' | 'dismissed';

export interface Incident {
  id: string;
  bookingId?: string;
  resourceId: string;
  resourceTitle: string;
  reportedById: string;
  reportedByName: string;
  reportedByRole: 'student' | 'owner' | 'admin';
  againstUserId?: string;
  againstUserName?: string;
  type: 'damage' | 'late_return' | 'unauthorized_use' | 'cleanliness' | 'missing_item' | 'other';
  severity: IncidentSeverity;
  status: IncidentStatus;
  title: string;
  description: string;
  evidenceUrls?: string[];
  resolutionNotes?: string;
  trustPenaltyApplied?: number;
  createdAt: string;
  resolvedAt?: string;
}

export interface ReportIncidentPayload {
  resourceId: string;
  bookingId?: string;
  againstUserId?: string;
  type: Incident['type'];
  severity: IncidentSeverity;
  title: string;
  description: string;
  evidenceUrls?: string[];
}
