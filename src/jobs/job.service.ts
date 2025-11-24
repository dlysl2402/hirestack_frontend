import { authenticatedRequest } from '@/lib/api';
import type { Job, CreateJobData } from './job.types';

export const createJob = async (data: CreateJobData): Promise<Job> => {
  return authenticatedRequest<Job>('/api/jobs', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};
