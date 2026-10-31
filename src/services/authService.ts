import { api } from './apiClient';
import {
  AuthResponse,
  LoginCredentials,
  RegisterPayload,
  User,
  UserRole,
} from '../types';
import { storage } from '../utils/storage';
import { mockUsers } from '../data/mockUsers';
import { mocksEnabled } from './config';

const normalizeUser = (u: any, fallbackRole?: string): User => {
  const rawRole = (u.role || u.role_name || fallbackRole || 'student').toLowerCase();
  const role: UserRole = rawRole.includes('admin')
    ? 'admin'
    : rawRole.includes('owner')
    ? 'owner'
    : 'student';

  return {
    id: String(u.id),
    name: u.full_name || u.name || 'User',
    email: u.email,
    role,
    avatarUrl: u.profile_image_url || u.avatarUrl,
    department: u.department || 'Campus Department',
    institutionId: u.institution_id || u.institutionId,
    trustScore: u.trustScore ?? (role === 'admin' ? 100 : role === 'owner' ? 98 : 92),
    isVerified: u.email_verified ?? u.isVerified ?? true,
    createdAt: u.created_at || u.createdAt || new Date().toISOString(),
    phone: u.phone_number || u.phone,
  };
};

export const authService = {
  /**
   * User login with API call, with graceful fallback to mock users for dev/testing
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const response = await api.post<any>('/auth/login', {
        email: credentials.email,
        password: credentials.password || 'Password123!',
      });

      const data = response?.data || response;
      const token = data?.access_token || data?.token;
      const rawUser = data?.user || data;

      if (!token || !rawUser) {
        throw new Error('Invalid authentication response structure');
      }

      const user = normalizeUser(rawUser, credentials.role);
      storage.setToken(token);
      storage.setUser(user);

      return { user, token, refreshToken: data?.refresh_token };
    } catch (error) {
      if (!mocksEnabled) throw error;
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
      await api.post<any>('/auth/register', {
        full_name: payload.name,
        email: payload.email,
        password: payload.password || 'Password123!',
        phone_number: payload.phone,
      });

      // Automatically sign in the freshly registered user
      return await authService.login({
        email: payload.email,
        password: payload.password || 'Password123!',
        role: payload.role,
      });
    } catch (error) {
      if (!mocksEnabled) throw error;
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
      const response = await api.get<any>('/users/me');
      const data = response?.data || response;
      const user = normalizeUser(data);
      storage.setUser(user);
      return user;
    } catch (error) {
      if (!mocksEnabled) throw error;
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
