import { api } from './apiClient';
import {
  ConditionReport,
  CreateConditionReportPayload,
  ApiResponse,
} from '../types';

let localConditionReports: ConditionReport[] = [
  {
    id: 'cond-pre-901',
    bookingId: 'book-901',
    resourceId: 'res-101',
    resourceTitle: 'High-Speed Sony FX3 Cinema Camera Kit',
    userId: 'user-stu-1',
    userName: 'Alex Rivera',
    type: 'pre_use',
    overallRating: 'excellent',
    checklist: [
      { id: 'c1', label: 'Full-Frame sensor clean & dust-free', checked: true },
      { id: 'c2', label: 'All 3x NP-FZ100 batteries charged to 100%', checked: true },
      { id: 'c3', label: 'Sony 24-70mm GM lens elements clear with no front/rear scratches', checked: true },
      { id: 'c4', label: 'XLR top handle audio dials operational & XLR inputs intact', checked: true },
      { id: 'c5', label: 'Pelican Air hard case hinges & foam inserts complete', checked: true },
    ],
    photoUrls: [
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=800&q=80',
    ],
    comments: 'Camera inspected alongside Dr. Sarah Chen at Studio 204 pickup station. Pristine condition with all original lens caps and accessories.',
    hasDamage: false,
    createdAt: '2026-11-01T09:55:00Z',
  },
  {
    id: 'cond-post-902',
    bookingId: 'book-902',
    resourceId: 'res-102',
    resourceTitle: 'Precision Bambu Lab X1-Carbon 3D Printer',
    userId: 'user-stu-1',
    userName: 'Alex Rivera',
    type: 'post_use',
    overallRating: 'excellent',
    checklist: [
      { id: 'c6', label: 'Heated PEI textured build plate thoroughly scraped and cleaned', checked: true },
      { id: 'c7', label: '0.4mm hardened steel nozzle purged of filament debris', checked: true },
      { id: 'c8', label: 'AMS 4-spool filament bay reloaded with campus PLA and latched', checked: true },
      { id: 'c9', label: 'Chamber cooling fan and door sealed properly', checked: true },
    ],
    photoUrls: [
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
    ],
    comments: 'Drone chassis print completed smoothly. Bed wiped down with 99% IPA as per custodian guidelines. Zero residue on PEI sheet.',
    hasDamage: false,
    createdAt: '2026-10-28T11:58:00Z',
  },
  {
    id: 'cond-pre-902',
    bookingId: 'book-902',
    resourceId: 'res-102',
    resourceTitle: 'Precision Bambu Lab X1-Carbon 3D Printer',
    userId: 'user-stu-1',
    userName: 'Alex Rivera',
    type: 'pre_use',
    overallRating: 'good',
    checklist: [
      { id: 'c10', label: 'Build plate present and mounted correctly', checked: true },
      { id: 'c11', label: 'Nozzle clean and clear of clogs', checked: true },
      { id: 'c12', label: 'AMS filament feeders unobstructed', checked: true },
    ],
    photoUrls: [
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    ],
    comments: 'Small cosmetic adhesive spot on left casing from previous lab user, build plate in clean working order.',
    hasDamage: false,
    createdAt: '2026-10-28T09:02:00Z',
  },
];

export const conditionService = {
  getAllReports: async (): Promise<ConditionReport[]> => {
    try {
      const response = await api.get<ApiResponse<ConditionReport[]>>('/condition-reports');
      return response.data;
    } catch {
      return localConditionReports;
    }
  },

  submitConditionReport: async (
    payload: CreateConditionReportPayload
  ): Promise<ConditionReport> => {
    try {
      const response = await api.post<ApiResponse<ConditionReport>>(
        '/condition-reports',
        payload
      );
      return response.data;
    } catch {
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
      localConditionReports = [report, ...localConditionReports];
      return report;
    }
  },

  getReportsByBooking: async (bookingId: string): Promise<ConditionReport[]> => {
    try {
      const response = await api.get<ApiResponse<ConditionReport[]>>(
        `/condition-reports/booking/${bookingId}`
      );
      return response.data;
    } catch {
      return localConditionReports.filter((r) => r.bookingId === bookingId);
    }
  },
};
