import { QueryClient } from '@tanstack/react-query';

/**
 * Global QueryClient configuration
 *
 * Minimal caching - rely on fast backend responses.
 * - staleTime: 0 - always refetch on mount
 * - gcTime: 5 minutes - keep data briefly for back navigation
 * - retry: 1 - retry failed requests once
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
      gcTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: 1,
    },
  },
});
