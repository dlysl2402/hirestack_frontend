import { authenticatedRequest } from '@/lib/api';
import type {
  Candidate,
  CreateCandidateData,
  UpdateCandidateData,
  LinkedInImportResults,
  PaginationParams,
  PaginatedResponse,
} from './candidate.types';

/**
 * Candidate service - API calls for candidate management
 */

/**
 * Get all candidates for the user's organization with pagination
 */
export async function getAllCandidates(params?: PaginationParams): Promise<PaginatedResponse<Candidate>> {
  const queryParams = new URLSearchParams();

  if (params?.page) {
    queryParams.append('page', params.page.toString());
  }
  if (params?.limit) {
    queryParams.append('limit', params.limit.toString());
  }
  if (params?.sortBy) {
    queryParams.append('sortBy', params.sortBy);
  }
  if (params?.sortOrder) {
    queryParams.append('sortOrder', params.sortOrder);
  }

  const queryString = queryParams.toString();
  const url = queryString ? `/api/candidates?${queryString}` : '/api/candidates';

  return authenticatedRequest<PaginatedResponse<Candidate>>(url);
}

/**
 * Get a single candidate by ID
 */
export async function getCandidateById(id: string): Promise<Candidate> {
  return authenticatedRequest<Candidate>(`/api/candidates/${id}`);
}

/**
 * Create a new candidate manually
 */
export async function createCandidate(data: CreateCandidateData): Promise<Candidate> {
  return authenticatedRequest<Candidate>('/api/candidates', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Update a candidate by ID
 */
export async function updateCandidate(id: string, data: UpdateCandidateData): Promise<Candidate> {
  return authenticatedRequest<Candidate>(`/api/candidates/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

/**
 * Delete a candidate by ID
 */
export async function deleteCandidate(id: string): Promise<void> {
  return authenticatedRequest<void>(`/api/candidates/${id}`, {
    method: 'DELETE',
  });
}

/**
 * Import candidates from LinkedIn URLs (batch)
 */
export async function importLinkedInProfiles(linkedinUrls: string[]): Promise<LinkedInImportResults> {
  return authenticatedRequest<LinkedInImportResults>('/api/candidates/import-linkedin', {
    method: 'POST',
    body: JSON.stringify({ linkedinUrls }),
  });
}
