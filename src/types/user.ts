export type UserRole = 'student' | 'owner' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  department?: string;
  institutionId?: string;
  trustScore: number; // 0 - 100
  isVerified: boolean;
  createdAt: string;
  phone?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password?: string;
  role?: UserRole; // Optional quick-select for dev/hackathon demo
}

export interface RegisterPayload {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  department?: string;
  institutionId?: string;
  phone?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}
