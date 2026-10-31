import { api } from './apiClient';
import {
  AuthResponse,
  LoginCredentials,
  RegisterPayload,
  User,
  ApiResponse,
} from '../types';
import { storage } from '../utils/storage';
import { mockUsers } from '../data/mockUsers';

export const authService = {
  /**
   * User login with API call, with graceful fallback to mock users for dev/testing
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const response = await api.post<ApiResponse<AuthResponse>>(
        '/auth/login',
        credentials
      );
      if (response.data.token) {
        storage.setToken(response.data.token);
        storage.setUser(response.data.user);
      }
      return response.data;
    } catch {
      // Mock Fallback for hackathon rapid testing & offline dev
      const role = credentials.role || 'student';
      const user = mockUsers[role];
      const token = `mock-jwt-token-for-${role}-${Date.now()}`;
      storage.setToken(token);
      storage.setUser(user);
      return { user, token };
    }
  },

  /**
   * Register new user
   */
  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    try {
      const response = await api.post<ApiResponse<AuthResponse>>(
        '/auth/register',
        payload
      );
      if (response.data.token) {
        storage.setToken(response.data.token);
        storage.setUser(response.data.user);
      }
      return response.data;
    } catch {
      const user: User = {
        id: `user-${Date.now()}`,
        name: payload.name,
        email: payload.email,
        role: payload.role,
        department: payload.department,
        institutionId: payload.institutionId,
        trustScore: 80,
        isVerified: false,
        createdAt: new Date().toISOString(),
        phone: payload.phone,
      };
      const token = `mock-token-${Date.now()}`;
      storage.setToken(token);
      storage.setUser(user);
      return { user, token };
    }
  },

  /**
   * Get current authenticated user profile
   */
  getCurrentUser: async (): Promise<User> => {
    try {
      const response = await api.get<ApiResponse<User>>('/auth/me');
      storage.setUser(response.data);
      return response.data;
    } catch {
      const cached = storage.getUser<User>();
      if (cached) return cached;
      return mockUsers.student;
    }
  },

  /**
   * User logout
   */
  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Continue cleanup regardless of network status
    } finally {
      storage.clearAuth();
    }
  },
};
