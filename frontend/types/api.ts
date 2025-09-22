// types/api.ts
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  bio?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardData {
  totalUsers?: number;
  totalReports?: number;
  recentActivity?: any[];
  statistics?: Record<string, number>;
}

// lib/config.ts
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  ENDPOINTS: {
    // Auth
    REGISTER: '/api/auth/register',
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password',
    
    // User
    USER_ME: '/api/user/me',
    USER_PROFILE: '/api/user/profile',
    USER_DASHBOARD: '/api/user/dashboard',
    
    // Admin
    ADMIN_USERS: '/api/admin/users',
    ADMIN_DASHBOARD: '/api/admin/dashboard',
    
    // Manager
    MANAGER_REPORTS: '/api/manager/reports',
    MANAGER_DASHBOARD: '/api/manager/dashboard',
    
    // Utility
    HEALTH: '/api/health'
  }
} as const;