import { useEffect } from 'react';
import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import type { QueryKey, QueryFunction } from '@tanstack/react-query';

interface UsePaginatedQueryOptions<TData, TParams = unknown> {
  queryKey: QueryKey;
  queryFn: QueryFunction<TData>;
  queryFnGenerator?: (params: TParams) => () => Promise<TData>; // Generate queryFn for different params
  page: number;
  enabled?: boolean;
  prefetchAdjacent?: boolean; // Enable/disable prefetching adjacent pages
  getTotalPages?: (data: TData | undefined) => number; // Extract totalPages from response
}

/**
 * Reusable hook for paginated queries with automatic prefetching
 *
 * Features:
 * - Automatically prefetches next and previous pages
 * - Shows previous page data while loading next page (no jarring transitions)
 * - Type-safe
 * - Configurable prefetching behavior
 * - Automatically extracts totalPages from response data
 *
 * Usage:
 *   const { data, isLoading, error } = usePaginatedQuery({
 *     queryKey: queryKeys.candidates.list({ page, limit, sortBy, sortOrder }),
 *     queryFn: () => getAllCandidates({ page, limit, sortBy, sortOrder }),
 *     queryFnGenerator: (params) => () => getAllCandidates(params),
 *     page,
 *     getTotalPages: (data) => data?.pagination?.totalPages ?? 0,
 *   });
 */
export function usePaginatedQuery<TData, TParams = unknown>({
  queryKey,
  queryFn,
  queryFnGenerator,
  page,
  enabled = true,
  prefetchAdjacent = true,
  getTotalPages,
}: UsePaginatedQueryOptions<TData, TParams>) {
  const queryClient = useQueryClient();

  // Main query with keepPreviousData for smooth transitions
  const query = useQuery({
    queryKey,
    queryFn,
    placeholderData: keepPreviousData,
    enabled,
  });

  // Extract totalPages from the data
  const totalPages = getTotalPages ? getTotalPages(query.data) : 0;

  // Prefetch adjacent pages in the background
  useEffect(() => {
    if (!prefetchAdjacent || !enabled || totalPages === 0 || !queryFnGenerator) return;

    // Prefetch next page
    if (page < totalPages) {
      // Clone the query key and update the page parameter
      const nextPageKey = [...queryKey];
      const lastItem = nextPageKey[nextPageKey.length - 1];

      if (typeof lastItem === 'object' && lastItem !== null && 'page' in lastItem) {
        const nextPageParams = { ...lastItem, page: page + 1 } as TParams;
        nextPageKey[nextPageKey.length - 1] = nextPageParams;

        // Generate a NEW queryFn with the updated params
        queryClient.prefetchQuery({
          queryKey: nextPageKey,
          queryFn: queryFnGenerator(nextPageParams),
        });
      }
    }

    // Prefetch previous page
    if (page > 1) {
      const prevPageKey = [...queryKey];
      const lastItem = prevPageKey[prevPageKey.length - 1];

      if (typeof lastItem === 'object' && lastItem !== null && 'page' in lastItem) {
        const prevPageParams = { ...lastItem, page: page - 1 } as TParams;
        prevPageKey[prevPageKey.length - 1] = prevPageParams;

        // Generate a NEW queryFn with the updated params
        queryClient.prefetchQuery({
          queryKey: prevPageKey,
          queryFn: queryFnGenerator(prevPageParams),
        });
      }
    }
  }, [page, totalPages, queryKey, queryFnGenerator, queryClient, enabled, prefetchAdjacent]);

  return query;
}
