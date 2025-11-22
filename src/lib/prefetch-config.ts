import { getAllCandidates } from '@/candidates/candidate.service';
import { queryKeys } from './query-keys';
import type { QueryKey } from '@tanstack/react-query';

/**
 * Prefetch Configuration Registry
 *
 * Centralized configuration for all prefetching behavior in the app.
 * This makes it easy to:
 * - See all prefetching at a glance
 * - Add new prefetch targets
 * - Modify prefetch strategy globally
 */

interface PrefetchConfig {
  key: string;
  queryKey: QueryKey;
  queryFn: () => Promise<unknown>;
}

export const PREFETCH_REGISTRY = {
  /**
   * Prefetch on app load (after user logs in)
   *
   * These queries run in the background when the app first loads,
   * so frequently accessed pages feel instant.
   */
  onAppLoad: [
    {
      key: 'candidates-first-page',
      queryKey: queryKeys.candidates.list({
        page: 1,
        limit: 20,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      }),
      queryFn: () =>
        getAllCandidates({
          page: 1,
          limit: 20,
          sortBy: 'createdAt',
          sortOrder: 'desc',
        }),
    },
    // Add more prefetch targets here:
    // {
    //   key: 'companies-first-page',
    //   queryKey: queryKeys.companies.list({ page: 1, limit: 20, sortBy: 'createdAt', sortOrder: 'desc' }),
    //   queryFn: () => getAllCompanies({ page: 1, limit: 20, sortBy: 'createdAt', sortOrder: 'desc' }),
    // },
  ] as PrefetchConfig[],

  /**
   * Prefetch on specific route entry
   *
   * When user navigates to certain routes, prefetch related data.
   * Currently not used, but ready for future expansion.
   */
  onRouteEnter: {
    // '/dashboard': [
    //   { key: 'stats', queryKey: ['stats'], queryFn: () => getStats() },
    //   { key: 'recent-activity', queryKey: ['recent-activity'], queryFn: () => getRecentActivity() },
    // ],
  } as Record<string, PrefetchConfig[]>,
};
