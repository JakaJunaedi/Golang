'use client';

import { useAuth } from '@/contexts/auth-context';

interface AuthWrapperProps {
  children: React.ReactNode;
  loadingComponent?: React.ReactNode;
}

export function AuthWrapper({ children, loadingComponent }: AuthWrapperProps) {
  const { loading } = useAuth();

  if (loading) {
    return loadingComponent || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return <>{children}</>;
}