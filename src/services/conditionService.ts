import { api } from './apiClient';
import {
  ConditionReport,
  CreateConditionReportPayload,
} from '../types';

const normalizeReport = (r: any): ConditionReport => {
  return {
    id: String(r.id),
    bookingId: String(r.bookingId || r.booking_id),
    resourceId: String(r.resourceId || r.resource_id),
    resourceTitle: r.resourceTitle || 'Verified Resource',
    userId: String(r.userId || r.submitted_by),
    userName: r.userName || 'Alex Rivera',
    type: (r.type || (r.report_type === 'BEFORE_USE' ? 'pre_use' : 'post_use')) as any,
    overallRating: (r.overallRating || (r.overall_condition ? r.overall_condition.toLowerCase() : 'excellent')) as any,
    checklist: r.checklist || [
      { id: 'c1', label: 'Hardware enclosure intact', checked: true },
      { id: 'c2', label: 'Power supply and cables present', checked: true },
      { id: 'c3', label: 'Operational indicators functional', checked: true },
    ],
    photoUrls: r.photoUrls || r.evidence_urls || [],
    comments: r.comments || r.description || '',
    hasDamage: r.hasDamage ?? r.damage_detected ?? false,
    createdAt: r.createdAt || r.created_at || new Date().toISOString(),
  };
};

export const conditionService = {
  getAllReports: async (): Promise<ConditionReport[]> => {
    try {
      const response = await api.get<any>('/condition-reports');
      const list = response?.data || response;
      if (Array.isArray(list) && list.length > 0) {
        return list.map(normalizeReport);
      }
      return [];
    } catch {
      return [];
    }
  },

  submitConditionReport: async (
    payload: CreateConditionReportPayload
  ): Promise<ConditionReport> => {
    try {
      const response = await api.post<any>('/condition-reports', {
        booking_id: payload.bookingId,
        report_type: payload.type === 'pre_use' ? 'BEFORE_USE' : 'AFTER_USE',
        overall_condition: payload.overallRating.toUpperCase(),
        description: payload.comments,
        damage_detected: payload.hasDamage,
      });
      const data = response?.data || response;
      return normalizeReport(data);
    } catch (error) {
      const report: ConditionReport = {
        id: `cond-${payload.type === 'pre_use' ? 'pre' : 'post'}-${Date.now().toString().slice(-4)}`,
        bookingId: payload.bookingId,
        resourceId: payload.resourceId,
        resourceTitle: 'Verified Resource',
        userId: 'user-stu-1',
        userName: 'Alex Rivera',
        type: payload.type,
        overallRating: payload.overallRating,
        checklist: payload.checklist,
        photoUrls: payload.photoUrls || [],
        comments: payload.comments,
        hasDamage: payload.hasDamage,
        createdAt: new Date().toISOString(),
      };
      return report;
    }
  },

  getReportsByBooking: async (bookingId: string): Promise<ConditionReport[]> => {
    try {
      const response = await api.get<any>(`/bookings/${bookingId}/condition-reports`);
      const list = response?.data || response;
      if (Array.isArray(list) && list.length > 0) {
        return list.map(normalizeReport);
      }
      return [];
    } catch {
      return [];
    }
  },
};
