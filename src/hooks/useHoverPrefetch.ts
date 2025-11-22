import { useCallback, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { QueryKey } from '@tanstack/react-query';

interface UseHoverPrefetchOptions {
  queryKey: QueryKey;
  queryFn: () => Promise<unknown>;
  delay?: number; // Delay in ms before prefetching (default: 200ms)
}

/**
 * Reusable hook for prefetching data on hover
 *
 * Triggers a prefetch after the user hovers for a specified delay.
 * Automatically cleans up timeouts on mouse leave or unmount.
 *
 * Usage:
 *   const hoverHandlers = useHoverPrefetch({
 *     queryKey: queryKeys.candidates.detail(id),
 *     queryFn: () => getCandidateById(id),
 *     delay: 200,
 *   });
 *
 *   <div {...hoverHandlers}>Hover me</div>
 */
export function useHoverPrefetch({
  queryKey,
  queryFn,
  delay = 200,
}: UseHoverPrefetchOptions) {
  const queryClient = useQueryClient();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const onMouseEnter = useCallback(() => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout to prefetch after delay
    timeoutRef.current = setTimeout(() => {
      queryClient.prefetchQuery({
        queryKey,
        queryFn,
      });
    }, delay);
  }, [queryClient, queryKey, queryFn, delay]);

  const onMouseLeave = useCallback(() => {
    // Cancel prefetch if user leaves before delay
    if (timeoutRef.current !== undefined) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { onMouseEnter, onMouseLeave };
}
