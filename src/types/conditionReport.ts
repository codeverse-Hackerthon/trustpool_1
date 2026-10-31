export type ReportType = 'pre_use' | 'post_use' | 'periodic';

export interface ConditionCheckItem {
  id: string;
  label: string;
  checked: boolean;
  notes?: string;
}

export interface ConditionReport {
  id: string;
  bookingId: string;
  resourceId: string;
  resourceTitle: string;
  userId: string;
  userName: string;
  type: ReportType;
  overallRating: 'excellent' | 'good' | 'fair' | 'poor' | 'damaged';
  checklist: ConditionCheckItem[];
  photoUrls?: string[];
  comments: string;
  hasDamage: boolean;
  createdAt: string;
}

export interface CreateConditionReportPayload {
  bookingId: string;
  resourceId: string;
  type: ReportType;
  overallRating: 'excellent' | 'good' | 'fair' | 'poor' | 'damaged';
  checklist: ConditionCheckItem[];
  comments: string;
  hasDamage: boolean;
  photoUrls?: string[];
}
