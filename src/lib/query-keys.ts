import type { PaginationParams } from '@/candidates/candidate.types';
import type { CompanyListParams } from '@/companies/company.types';

/**
 * Query Key Factory
 *
 * Centralized query key generation for consistent cache management.
 * Benefits:
 * - Type-safe query keys
 * - Easy to invalidate related queries
 * - Prevents typos and inconsistencies
 *
 * Usage:
 *   queryKey: queryKeys.candidates.list({ page: 1, limit: 20 })
 */
export const queryKeys = {
  // Candidate query keys
  candidates: {
    all: ['candidates'] as const,
    lists: () => [...queryKeys.candidates.all, 'list'] as const,
    list: (params: PaginationParams) => [...queryKeys.candidates.lists(), params] as const,
    details: () => [...queryKeys.candidates.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.candidates.details(), id] as const,
  },

  // Company query keys
  companies: {
    all: ['companies'] as const,
    lists: () => [...queryKeys.companies.all, 'list'] as const,
    list: (params: CompanyListParams) => [...queryKeys.companies.lists(), params] as const,
    details: () => [...queryKeys.companies.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.companies.details(), id] as const,
  },

  // Add more resource types here as needed
  // dashboard: { ... },
  // stats: { ... },
};
