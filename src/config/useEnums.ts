import { useQuery } from '@tanstack/react-query';
import { getEnums } from './enums.service';
import { queryKeys } from '@/lib/query-keys';
import type { EnumsResponse } from './enums.types';

/**
 * Hook to fetch and cache enum values
 * Caches for 1 hour as recommended in the API documentation
 */
export function useEnums() {
  return useQuery<EnumsResponse>({
    queryKey: queryKeys.config.enums(),
    queryFn: getEnums,
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 60 * 60 * 1000, // 1 hour (formerly cacheTime)
  });
}
