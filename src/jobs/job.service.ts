import { authenticatedRequest } from '@/lib/api';
import type { Job, CreateJobData, JobListParams, PaginatedJobsResponse } from './job.types';

export const getJobs = async (params?: JobListParams): Promise<PaginatedJobsResponse> => {
  const queryParams = new URLSearchParams();

  // Pagination
  if (params?.page) {
    queryParams.append('page', params.page.toString());
  }
  if (params?.limit) {
    queryParams.append('limit', params.limit.toString());
  }

  // Sorting
  if (params?.sortBy) {
    queryParams.append('sortBy', params.sortBy);
  }
  if (params?.sortOrder) {
    queryParams.append('sortOrder', params.sortOrder);
  }

  // Filters
  if (params?.status) {
    queryParams.append('status', params.status);
  }
  if (params?.seniorityLevel) {
    queryParams.append('seniorityLevel', params.seniorityLevel);
  }
  if (params?.companyId) {
    queryParams.append('companyId', params.companyId);
  }
  if (params?.location) {
    queryParams.append('location', params.location);
  }
  if (params?.department) {
    queryParams.append('department', params.department);
  }
  if (params?.search) {
    queryParams.append('search', params.search);
  }

  const query = queryParams.toString();
  const endpoint = query ? `/api/jobs?${query}` : '/api/jobs';

  return authenticatedRequest<PaginatedJobsResponse>(endpoint);
};

export const getJobById = async (id: string): Promise<Job> => {
  return authenticatedRequest<Job>(`/api/jobs/${id}`);
};

export const createJob = async (data: CreateJobData): Promise<Job> => {
  return authenticatedRequest<Job>('/api/jobs', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};
