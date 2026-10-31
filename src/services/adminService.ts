import { api } from './apiClient';
import { User, ApiResponse } from '../types';
import { allMockUsers, mockUsers } from '../data/mockUsers';
import { auditService, AuditRecord } from './auditService';

let localUsers: User[] = [...allMockUsers];

export type { AuditRecord as AuditLogItem };

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
        
        // Log to audit trail
        auditService.recordAuditEvent({
          eventType: isVerified ? 'RETURN_VERIFIED' : 'INCIDENT_UPDATED',
          actionTitle: isVerified ? 'User Verification Approved' : 'User Verification Revoked',
          category: 'incident',
          performedBy: {
            id: 'user-adm-1',
            name: 'Marcus Vance',
            role: 'admin',
          },
          targetUser: {
            id: localUsers[idx].id,
            name: localUsers[idx].name,
            role: localUsers[idx].role,
          },
          targetEntity: `${localUsers[idx].name} (${localUsers[idx].institutionId || localUsers[idx].id})`,
          details: `Institutional verification status set to ${isVerified ? 'VERIFIED' : 'UNVERIFIED'}.`,
        });

        return localUsers[idx];
      }
      const user = mockUsers.student;
      return { ...user, isVerified };
    }
  },

  getAuditLogs: async (): Promise<AuditRecord[]> => {
    try {
      const response = await api.get<ApiResponse<AuditRecord[]>>('/admin/audit-logs');
      return response.data;
    } catch {
      return auditService.getAuditLogs();
    }
  },
};
