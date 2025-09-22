// hooks/use-role-check.ts
import { useAuth } from '@/contexts/auth-context';
import { useMemo } from 'react';

export function useRoleCheck() {
  const { user } = useAuth();

  const roleChecks = useMemo(() => ({
    isUser: user?.role === 'user',
    isManager: user?.role === 'manager',
    isAdmin: user?.role === 'admin',
    isManagerOrAdmin: user?.role === 'manager' || user?.role === 'admin',
    hasRole: (roles: string[]) => user ? roles.includes(user.role) : false,
    hasAnyRole: (roles: string[]) => user ? roles.some(role => user.role === role) : false,
  }), [user]);

  return {
    user,
    ...roleChecks,
  };
}