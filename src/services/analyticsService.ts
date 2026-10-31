import { api } from './apiClient';
import { DashboardAnalytics, ApiResponse } from '../types';
import { mockAnalyticsData } from '../data/mockAnalytics';

export interface DateFilterParams {
  start_date?: string;
  end_date?: string;
}

export interface OwnerAnalyticsParams extends DateFilterParams {
  resource_id?: string;
  aggregation?: 'daily' | 'weekly' | 'monthly';
}

export const analyticsService = {
  // Backwards compatible dashboard analytics
  getDashboardAnalytics: async (role?: string): Promise<DashboardAnalytics> => {
    try {
      const response = await api.get<ApiResponse<DashboardAnalytics>>(
        '/analytics/dashboard',
        { params: { role } }
      );
      return response.data;
    } catch {
      return mockAnalyticsData;
    }
  },

  // Student Analytics
  getStudentOverview: async (params?: DateFilterParams) => {
    const response = await api.get<ApiResponse<any>>('/analytics/student/overview', { params });
    return response.data;
  },

  getStudentUsage: async (params?: DateFilterParams) => {
    const response = await api.get<ApiResponse<any>>('/analytics/student/usage', { params });
    return response.data;
  },

  getStudentActivity: async (limit = 10) => {
    const response = await api.get<ApiResponse<any>>('/analytics/student/activity', { params: { limit } });
    return response.data;
  },

  // Owner Analytics
  getOwnerOverview: async (params?: OwnerAnalyticsParams) => {
    const response = await api.get<ApiResponse<any>>('/analytics/owner/overview', { params });
    return response.data;
  },

  getOwnerUtilization: async (params?: OwnerAnalyticsParams) => {
    const response = await api.get<ApiResponse<any>>('/analytics/owner/utilization', { params });
    return response.data;
  },

  getOwnerBookings: async (params?: OwnerAnalyticsParams) => {
    const response = await api.get<ApiResponse<any>>('/analytics/owner/bookings', { params });
    return response.data;
  },

  getOwnerResources: async () => {
    const response = await api.get<ApiResponse<any>>('/analytics/owner/resources');
    return response.data;
  },

  // Admin Analytics
  getAdminOverview: async () => {
    const response = await api.get<ApiResponse<any>>('/analytics/admin/overview');
    return response.data;
  },

  getAdminBookings: async (params?: DateFilterParams) => {
    const response = await api.get<ApiResponse<any>>('/analytics/admin/bookings', { params });
    return response.data;
  },

  getAdminUsers: async () => {
    const response = await api.get<ApiResponse<any>>('/analytics/admin/users');
    return response.data;
  },

  getAdminResources: async () => {
    const response = await api.get<ApiResponse<any>>('/analytics/admin/resources');
    return response.data;
  },

  getAdminIncidents: async () => {
    const response = await api.get<ApiResponse<any>>('/analytics/admin/incidents');
    return response.data;
  },

  getAdminInstitutions: async () => {
    const response = await api.get<ApiResponse<any>>('/analytics/admin/institutions');
    return response.data;
  },
};
