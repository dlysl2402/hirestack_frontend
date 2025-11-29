import type { PaginationParams } from '@/candidates/candidate.types';
import type { CompanyListParams } from '@/companies/company.types';
import type { JobListParams } from '@/jobs/job.types';

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

  // Job query keys
  jobs: {
    all: ['jobs'] as const,
    lists: () => [...queryKeys.jobs.all, 'list'] as const,
    list: (params?: JobListParams) => [...queryKeys.jobs.lists(), params] as const,
    details: () => [...queryKeys.jobs.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.jobs.details(), id] as const,
  },

  // Agent query keys
  agent: {
    all: ['agent'] as const,
    sessions: () => [...queryKeys.agent.all, 'sessions'] as const,
    sessionList: (params?: { limit?: number; offset?: number }) =>
      [...queryKeys.agent.sessions(), 'list', params] as const,
    session: (id: string) => [...queryKeys.agent.sessions(), id] as const,
  },

  // Config/Enums query keys
  config: {
    all: ['config'] as const,
    enums: () => [...queryKeys.config.all, 'enums'] as const,
  },
};
