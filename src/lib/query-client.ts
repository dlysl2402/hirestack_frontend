import { QueryClient } from '@tanstack/react-query';

/**
 * Global QueryClient configuration
 *
 * This configures default behaviors for all queries in the app:
 * - staleTime: How long data is considered fresh (5 minutes)
 * - gcTime: How long inactive data stays in cache (10 minutes)
 * - refetchOnWindowFocus: Don't refetch when tab regains focus
 * - retry: Retry failed requests once before showing error
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: 1,
    },
  },
});
