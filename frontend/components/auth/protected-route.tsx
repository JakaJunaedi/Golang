'use client';

import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  fallback?: React.ReactNode;
}

export function ProtectedRoute({ 
  children, 
  requiredRoles = ['user'], 
  fallback 
}: ProtectedRouteProps) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  // Debug logging
  useEffect(() => {
    console.log('🛡️ ProtectedRoute state:', {
      loading,
      isAuthenticated,
      user: user ? { id: user.id, name: user.name, role: user.role } : null,
      requiredRoles
    });
  }, [loading, isAuthenticated, user, requiredRoles]);

  useEffect(() => {
    console.log('🛡️ ProtectedRoute redirect check:', { loading, isAuthenticated });
    
    if (!loading && !isAuthenticated) {
      console.log('🛡️ Redirecting to login...');
      // Add small delay to prevent race condition
      const timer = setTimeout(() => {
        const currentUrl = window.location.pathname + window.location.search;
        router.push(`/login?callbackUrl=${encodeURIComponent(currentUrl)}`);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [loading, isAuthenticated, router]);

  // Show loading state
  if (loading) {
    console.log('🛡️ Showing loading state');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // User not authenticated
  if (!isAuthenticated || !user) {
    console.log('🛡️ User not authenticated, showing fallback');
    return fallback || null;
  }

  // Check role-based access
  if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
    console.log('🛡️ Access denied, user role:', user.role, 'required:', requiredRoles);
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600">
            You don't have permission to access this page.
          </p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  console.log('🛡️ Access granted, rendering children');
  return <>{children}</>;
}