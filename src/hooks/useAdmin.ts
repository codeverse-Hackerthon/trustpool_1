import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../services/adminService';

export const ADMIN_KEYS = {
  allUsers: ['admin', 'users'] as const,
  auditLogs: ['admin', 'audit-logs'] as const,
};

export function useAllUsers() {
  return useQuery({
    queryKey: ADMIN_KEYS.allUsers,
    queryFn: () => adminService.getAllUsers(),
  });
}

export function useVerifyUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, isVerified }: { userId: string; isVerified: boolean }) =>
      adminService.verifyUser(userId, isVerified),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.allUsers });
    },
  });
}

export function useAuditLogs() {
  return useQuery({
    queryKey: ADMIN_KEYS.auditLogs,
    queryFn: () => adminService.getAuditLogs(),
  });
}

