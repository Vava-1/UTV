import { useState, useCallback } from "react";

interface UseApiOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

export function useApi<T>(
  apiFn: (...args: unknown[]) => Promise<T>,
  options: UseApiOptions<T> = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(
    async (...args: unknown[]) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await apiFn(...args);
        setData(result);
        options.onSuccess?.(result);
        return result;
      } catch (err) {
        const e = err instanceof Error ? err : new Error(String(err));
        setError(e);
        options.onError?.(e);
        throw e;
      } finally {
        setIsLoading(false);
      }
    },
    [apiFn, options]
  );

  return { data, isLoading, error, execute };
}
