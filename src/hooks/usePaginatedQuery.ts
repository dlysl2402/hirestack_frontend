import { useQuery, keepPreviousData } from '@tanstack/react-query';
import type { QueryKey, QueryFunction } from '@tanstack/react-query';

interface UsePaginatedQueryOptions<TData> {
  queryKey: QueryKey;
  queryFn: QueryFunction<TData>;
  enabled?: boolean;
}

/**
 * Reusable hook for paginated queries
 *
 * Features:
 * - Shows previous page data while loading next page (no jarring transitions)
 * - Type-safe
 *
 * Usage:
 *   const { data, isLoading, error } = usePaginatedQuery({
 *     queryKey: queryKeys.candidates.list({ page, limit, sortBy, sortOrder }),
 *     queryFn: () => getAllCandidates({ page, limit, sortBy, sortOrder }),
 *   });
 */
export function usePaginatedQuery<TData>({
  queryKey,
  queryFn,
  enabled = true,
}: UsePaginatedQueryOptions<TData>) {
  return useQuery({
    queryKey,
    queryFn,
    placeholderData: keepPreviousData,
    enabled,
  });
}
