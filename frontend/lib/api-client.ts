import { API_CONFIG } from '@/types/api';
import type { ApiResponse, LoginResponse, RefreshTokenResponse, RegisterResponse, User } from '@/types/auth';

// Cookie utility functions
const setCookie = (name: string, value: string, days: number = 7) => {
  if (typeof window === 'undefined') return;
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;secure;samesite=strict`;
};

const getCookie = (name: string): string | null => {
  if (typeof window === 'undefined') return null;
  const nameEQ = name + '=';
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

const deleteCookie = (name: string) => {
  if (typeof window === 'undefined') return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

class ApiClient {
  private baseURL: string;
  private accessToken: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    console.log('ApiClient initialized with baseURL:', baseURL);
  }

  setAccessToken(token: string | null) {
    this.accessToken = token;
    console.log('Access token set:', token ? `${token.substring(0, 20)}...` : 'null');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    console.log(`Making ${options.method || 'GET'} request to:`, url);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.accessToken) {
      headers.Authorization = `Bearer ${this.accessToken}`;
      console.log('Authorization header added:', `Bearer ${this.accessToken.substring(0, 20)}...`);
    } else {
      console.log('No access token available');
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      console.log(`Response status: ${response.status}`);
      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        // Handle token refresh if needed
        if (response.status === 401 && this.accessToken) {
          console.log('401 error, attempting token refresh...');
          const refreshed = await this.refreshToken();
          if (refreshed) {
            console.log('Token refreshed, retrying request...');
            return this.request<T>(endpoint, options);
          }
        }

        return {
          success: false,
          error: data.message || 'An error occurred',
        } as ApiResponse<T>;
      }

      return {
        success: true,
        data: data as T, // Type assertion untuk memastikan tipe yang benar
      } as ApiResponse<T>;
    } catch (error) {
      console.error('Network error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      } as ApiResponse<T>;
    }
  }

  private async refreshToken(): Promise<boolean> {
    console.log('Starting token refresh...');

    const refreshToken = getCookie('refreshToken');
    console.log('Refresh token from cookies:', refreshToken ? 'found' : 'not found');

    if (!refreshToken) {
      console.log('No refresh token available');
      return false;
    }

    try {
      const response = await fetch(`${this.baseURL}${API_CONFIG.ENDPOINTS.REFRESH}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const data: RefreshTokenResponse = await response.json();
        console.log('Token refresh successful');

        this.setAccessToken(data.accessToken);
        setCookie('accessToken', data.accessToken, 7);

        if (data.refresh_token) {
          setCookie('refreshToken', data.refresh_token, 30);
        }

        return true;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }

    // Clear invalid tokens
    console.log('Clearing invalid tokens');
    deleteCookie('accessToken');
    deleteCookie('refreshToken');
    this.setAccessToken(null);
    return false;
  }

  // Auth methods with proper typing
  async register(data: {
    email: string;
    password: string;
    name?: string;
    [key: string]: any;
  }): Promise<ApiResponse<RegisterResponse>> {
    console.log('Register request for:', data.email);
    return this.request<RegisterResponse>(API_CONFIG.ENDPOINTS.REGISTER, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: {
    email: string;
    password: string;
    [key: string]: any;
  }): Promise<ApiResponse<LoginResponse>> {
    console.log('Login request for email:', data.email);
    console.log('Login endpoint:', API_CONFIG.ENDPOINTS.LOGIN);
    console.log('Login payload:', {
      email: data.email,
      password: data.password ? '[PROVIDED]' : '[MISSING]',
      otherFields: Object.keys(data).filter(key => key !== 'email' && key !== 'password')
    });

    const response = await this.request<LoginResponse>(API_CONFIG.ENDPOINTS.LOGIN, {
      method: 'POST',
      body: JSON.stringify(data),
    });

    console.log('Login response received:', {
      success: response.success,
      hasData: !!response.data,
      error: response.error,
      dataKeys: response.success && response.data ? Object.keys(response.data) : []
    });

    // Handle successful login - store tokens
    if (response.success && response.data) {
      console.log('=== DETAILED LOGIN RESPONSE ===');
      console.log('Full response data:', JSON.stringify(response.data, null, 2));

      // Set access token
      if (response.data.token) {
        this.setAccessToken(response.data.token);
        setCookie('accessToken', response.data.token, 7);
      }

      // Set refresh token
      if (response.data.refresh_token) {
        setCookie('refreshToken', response.data.refresh_token, 30);
      }

      console.log('=== END DETAILED RESPONSE ===');
    }

    return response;
  }

  async logout(): Promise<ApiResponse<{ message: string }>> {
    console.log('Logout request');
    const result = await this.request<{ message: string }>(API_CONFIG.ENDPOINTS.LOGOUT, {
      method: 'POST',
    });

    // Clear cookies regardless of API response
    deleteCookie('accessToken');
    deleteCookie('refreshToken');
    this.setAccessToken(null);

    return result;
  }

  async forgotPassword(email: string): Promise<ApiResponse<{ message: string }>> {
    console.log('Forgot password request for:', email);
    return this.request<{ message: string }>(API_CONFIG.ENDPOINTS.FORGOT_PASSWORD, {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token: string, password: string): Promise<ApiResponse<{ message: string }>> {
    console.log('Reset password request');
    return this.request<{ message: string }>(API_CONFIG.ENDPOINTS.RESET_PASSWORD, {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
  }

  // User methods
  async getCurrentUser(): Promise<ApiResponse<User>> {
    console.log('Get current user request');
    const res = await this.request<{ user: any }>(API_CONFIG.ENDPOINTS.USER_ME);

    if (res.success && res.data) {
      const apiUser = res.data.user;
      const normalized: User = {
        id: String(apiUser.id),
        email: apiUser.email,
        name: apiUser.name,
        role: apiUser.role,
        createdAt: apiUser.created_at,
        updatedAt: apiUser.updated_at,
      };

      return { success: true, data: normalized };
    }

    return { success: false, error: res.error };
  }


  async getUserProfile(): Promise<ApiResponse<User>> {
    console.log('Get user profile request');
    return this.request<User>(API_CONFIG.ENDPOINTS.USER_PROFILE);
  }

  async updateUserProfile(data: Partial<User>): Promise<ApiResponse<User>> {
    console.log('Update user profile request');
    return this.request<User>(API_CONFIG.ENDPOINTS.USER_PROFILE, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getUserDashboard(): Promise<ApiResponse<any>> {
    console.log('Get user dashboard request');
    return this.request(API_CONFIG.ENDPOINTS.USER_DASHBOARD);
  }

  // Admin methods
  async getUsers(params?: URLSearchParams): Promise<ApiResponse<User[]>> {
    console.log('Get users request');
    const endpoint = params
      ? `${API_CONFIG.ENDPOINTS.ADMIN_USERS}?${params.toString()}`
      : API_CONFIG.ENDPOINTS.ADMIN_USERS;
    return this.request<User[]>(endpoint);
  }

  async createUser(data: {
    email: string;
    password: string;
    name?: string;
    role?: string;
    [key: string]: any;
  }): Promise<ApiResponse<User>> {
    console.log('Create user request for:', data.email);
    return this.request<User>(API_CONFIG.ENDPOINTS.ADMIN_USERS, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateUser(id: string, data: Partial<User>): Promise<ApiResponse<User>> {
    console.log('Update user request for ID:', id);
    return this.request<User>(`${API_CONFIG.ENDPOINTS.ADMIN_USERS}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteUser(id: string): Promise<ApiResponse<{ message: string }>> {
    console.log('Delete user request for ID:', id);
    return this.request<{ message: string }>(`${API_CONFIG.ENDPOINTS.ADMIN_USERS}/${id}`, {
      method: 'DELETE',
    });
  }

  async getAdminDashboard(): Promise<ApiResponse<any>> {
    console.log('Get admin dashboard request');
    return this.request(API_CONFIG.ENDPOINTS.ADMIN_DASHBOARD);
  }

  // Manager methods
  async getReports(params?: URLSearchParams): Promise<ApiResponse<any>> {
    console.log('Get reports request');
    const endpoint = params
      ? `${API_CONFIG.ENDPOINTS.MANAGER_REPORTS}?${params.toString()}`
      : API_CONFIG.ENDPOINTS.MANAGER_REPORTS;
    return this.request(endpoint);
  }

  async getManagerDashboard(): Promise<ApiResponse<any>> {
    return this.request(API_CONFIG.ENDPOINTS.MANAGER_DASHBOARD);
  }

  // Utility methods
  async healthCheck(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
    console.log('Health check request');
    return this.request<{ status: string; timestamp: string }>(API_CONFIG.ENDPOINTS.HEALTH);
  }
}

// Create singleton instance
export const apiClient = new ApiClient(API_CONFIG.BASE_URL);

// Initialize token from cookies if available (client-side only)
if (typeof window !== 'undefined') {
  const token = getCookie('accessToken');
  console.log('Initializing apiClient with token from cookies:', token ? 'found' : 'not found');
  if (token) {
    apiClient.setAccessToken(token);
  }
}

// Export types for use in components
export type { LoginResponse, RegisterResponse, RefreshTokenResponse };