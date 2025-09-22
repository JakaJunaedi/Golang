export type UserRole = 'user' | 'manager' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  name: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Define specific response types for auth operations
export interface LoginResponse {
  token: string;
  refresh_token?: string;
  user: User;
  expiresIn?: number;
}

export interface RegisterResponse {
  user: User;
  message?: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refresh_token?: string;
}