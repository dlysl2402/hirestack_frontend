import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { PREFETCH_REGISTRY } from '@/lib/prefetch-config';

/**
 * Prefetch Manager Hook
 *
 * Executes prefetch configurations from the registry.
 * Provides methods to trigger prefetching at different lifecycle points.
 *
 * Usage:
 *   const { prefetchOnAppLoad } = usePrefetchManager();
 *
 *   useEffect(() => {
 *     prefetchOnAppLoad(); // Prefetch candidates, companies, etc.
 *   }, [prefetchOnAppLoad]);
 */
export function usePrefetchManager() {
  const queryClient = useQueryClient();

  /**
   * Prefetch all configured queries on app load
   */
  const prefetchOnAppLoad = useCallback(() => {
    PREFETCH_REGISTRY.onAppLoad.forEach(({ queryKey, queryFn }) => {
      queryClient.prefetchQuery({
        queryKey,
        queryFn,
      });
    });
  }, [queryClient]);

  /**
   * Prefetch queries for a specific route
   */
  const prefetchOnRoute = useCallback(
    (route: string) => {
      const prefetches = PREFETCH_REGISTRY.onRouteEnter[route] || [];
      prefetches.forEach(({ queryKey, queryFn }) => {
        queryClient.prefetchQuery({
          queryKey,
          queryFn,
        });
      });
    },
    [queryClient]
  );

  return {
    prefetchOnAppLoad,
    prefetchOnRoute,
  };
}
