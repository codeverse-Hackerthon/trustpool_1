import { api } from './apiClient';
import { User, ApiResponse } from '../types';
import { allMockUsers, mockUsers } from '../data/mockUsers';

let localUsers: User[] = [...allMockUsers];

export interface AuditLogItem {
  id: string;
  action: string;
  performedBy: string;
  target: string;
  details: string;
  timestamp: string;
  ipAddress?: string;
}

export const adminService = {
  getAllUsers: async (): Promise<User[]> => {
    try {
      const response = await api.get<ApiResponse<User[]>>('/admin/users');
      return response.data;
    } catch {
      return localUsers;
    }
  },

  verifyUser: async (userId: string, isVerified: boolean): Promise<User> => {
    try {
      const response = await api.patch<ApiResponse<User>>(`/admin/users/${userId}/verify`, {
        isVerified,
      });
      return response.data;
    } catch {
      const idx = localUsers.findIndex((u) => u.id === userId);
      if (idx !== -1) {
        localUsers[idx] = { ...localUsers[idx], isVerified };
        return localUsers[idx];
      }
      const user = mockUsers.student;
      return { ...user, isVerified };
    }
  },

  getAuditLogs: async (): Promise<AuditLogItem[]> => {
    try {
      const response = await api.get<ApiResponse<AuditLogItem[]>>('/admin/audit-logs');
      return response.data;
    } catch {
      return [
        {
          id: 'log-01',
          action: 'FAIR_ALLOCATION_GRANT',
          performedBy: 'FairAlgorithm_Engine_v2',
          target: 'Sony FX3 Cinema Camera Kit',
          details: 'Direct grant awarded to Alex Rivera based on Tier A priority score (94.5) and low weekly usage.',
          timestamp: '2026-10-31T09:12:00Z',
          ipAddress: '10.24.110.1',
        },
        {
          id: 'log-02',
          action: 'QR_HANDOVER_VERIFIED',
          performedBy: 'Custodian Terminal Studio-204',
          target: 'Booking book-901',
          details: 'Digital custody transferred to Alex Rivera after matching cryptographic access token.',
          timestamp: '2026-10-31T10:05:00Z',
          ipAddress: '10.24.110.45',
        },
        {
          id: 'log-03',
          action: 'OWNER_VERIFIED',
          performedBy: 'Marcus Vance (Admin)',
          target: 'Dr. Sarah Chen (FAC-10029)',
          details: 'Institutional lab director credentials verified via university faculty directory.',
          timestamp: '2026-10-30T16:45:00Z',
          ipAddress: '192.168.1.100',
        },
        {
          id: 'log-04',
          action: 'CONDITION_REPORT_FILED',
          performedBy: 'Alex Rivera (Student)',
          target: 'Bambu Lab X1-Carbon 3D Printer',
          details: 'Post-use inspection filed with 2 photographic exhibits. 100% custodian match verified.',
          timestamp: '2026-10-28T11:58:00Z',
          ipAddress: '172.16.55.12',
        },
        {
          id: 'log-05',
          action: 'DISPUTE_ARBITRATED',
          performedBy: 'Marcus Vance (Admin)',
          target: 'Incident inc-101',
          details: 'Overdue penalty waived for Alex Rivera following proof of campus transit shutdown.',
          timestamp: '2026-10-25T15:00:00Z',
          ipAddress: '192.168.1.100',
        },
        {
          id: 'log-06',
          action: 'RESOURCE_STATUS_MODIFIED',
          performedBy: 'Dr. Sarah Chen (Owner)',
          target: 'Acoustic Soundstage Studio B',
          details: 'Status changed from available to in_use following confirmed check-in.',
          timestamp: '2026-10-24T13:00:00Z',
          ipAddress: '10.24.112.8',
        },
      ];
    }
  },
};

