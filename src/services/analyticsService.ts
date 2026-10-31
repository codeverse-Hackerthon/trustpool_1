import { api } from './apiClient';
import { DashboardAnalytics, ApiResponse } from '../types';
import { mockAnalyticsData } from '../data/mockAnalytics';

export const analyticsService = {
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
};

