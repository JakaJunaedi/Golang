import { useState, useCallback } from 'react';
import type { ApiResponse } from '@/types/auth';

export function useApi<T = any>() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T | null>(null);

  const execute = useCallback(async (
    apiCall: () => Promise<ApiResponse<T>>
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiCall();

      if (response.success && response.data !== undefined) {
        setData(response.data);
        return true;
      } else {
        setError(response.error || 'An error occurred');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
  }, []);

  return {
    loading,
    error,
    data,
    execute,
    reset,
    setData,
    setError,
  };
}