'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import type { User, LoginRequest, RegisterRequest, AuthResponse } from '@/types/auth';

/* ==============================
   Cookie Utility Functions
============================== */
const setCookie = (name: string, value: string, days = 7) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;secure;samesite=strict`;
};

const getCookie = (name: string): string | null => {
  const nameEQ = `${name}=`;
  const cookies = document.cookie.split(';');

  for (let c of cookies) {
    c = c.trim();
    if (c.startsWith(nameEQ)) return c.substring(nameEQ.length);
  }
  return null;
};

const deleteCookie = (name: string) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

/* ==============================
   State & Reducer
============================== */
interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'LOGOUT' };

const initialState: AuthState = {
  user: null,
  loading: true,
  error: null,
  isAuthenticated: false,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        loading: false,
        error: null,
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'LOGOUT':
      return { ...initialState, loading: false };
    default:
      return state;
  }
}

/* ==============================
   Context Definition
============================== */
interface AuthContextType extends AuthState {
  login: (credentials: LoginRequest) => Promise<boolean>;
  register: (data: RegisterRequest) => Promise<boolean>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<boolean>;
  resetPassword: (token: string, password: string) => Promise<boolean>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/* ==============================
   Provider
============================== */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state from cookies
  useEffect(() => {
    const initializeAuth = async () => {
      if (typeof window === 'undefined') {
        dispatch({ type: 'SET_LOADING', payload: false });
        return;
      }

      const token = getCookie('accessToken');
      if (!token) {
        dispatch({ type: 'SET_LOADING', payload: false });
        return;
      }

      apiClient.setAccessToken(token);
      const response = await apiClient.getCurrentUser();

      if (response.success && response.data) {
        dispatch({ type: 'SET_USER', payload: response.data });
      } else {
        deleteCookie('accessToken');
        deleteCookie('refreshToken');
        apiClient.setAccessToken(null);
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initializeAuth();
  }, []);

  /* ==============================
     Auth Actions
  ============================== */
  const login = async (credentials: LoginRequest): Promise<boolean> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    const response = await apiClient.login(credentials);

    if (response.success && response.data) {
      const { token, refresh_token, user } = response.data;

      if (!token) {
        dispatch({ type: 'SET_ERROR', payload: 'No access token found in server response' });
        return false;
      }

      // Store tokens
      setCookie('accessToken', token, 7);
      if (refresh_token) setCookie('refreshToken', refresh_token, 30);

      // Set API client token
      apiClient.setAccessToken(token);

      // Set user
      if (user) dispatch({ type: 'SET_USER', payload: user });

      return true;
    }

    dispatch({ type: 'SET_ERROR', payload: response.error || 'Login failed' });
    return false;
  };

  const register = async (data: RegisterRequest): Promise<boolean> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    const response = await apiClient.register(data);

    if (response.success && response.data) {
      const authData = response.data as AuthResponse;

      setCookie('accessToken', authData.accessToken, 7);
      setCookie('refreshToken', authData.refreshToken, 30);
      apiClient.setAccessToken(authData.accessToken);

      dispatch({ type: 'SET_USER', payload: authData.user });
      return true;
    }

    dispatch({ type: 'SET_ERROR', payload: response.error || 'Registration failed' });
    return false;
  };

  const logout = async (): Promise<void> => {
    await apiClient.logout();
    deleteCookie('accessToken');
    deleteCookie('refreshToken');
    apiClient.setAccessToken(null);
    dispatch({ type: 'LOGOUT' });
  };

  const forgotPassword = async (email: string): Promise<boolean> => {
    const response = await apiClient.forgotPassword(email);
    if (!response.success) {
      dispatch({ type: 'SET_ERROR', payload: response.error || 'Failed to send reset email' });
    }
    return response.success;
  };

  const resetPassword = async (token: string, password: string): Promise<boolean> => {
    const response = await apiClient.resetPassword(token, password);
    if (!response.success) {
      dispatch({ type: 'SET_ERROR', payload: response.error || 'Failed to reset password' });
    }
    return response.success;
  };

  const refreshUser = async (): Promise<void> => {
    if (!state.isAuthenticated) return;
    const response = await apiClient.getCurrentUser();
    if (response.success && response.data) {
      dispatch({ type: 'SET_USER', payload: response.data });
    }
  };

  const contextValue: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    refreshUser,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

/* ==============================
   Hook
============================== */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
