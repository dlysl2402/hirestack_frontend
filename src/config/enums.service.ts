import { apiRequest } from '@/lib/api';
import type { EnumsResponse } from './enums.types';

/**
 * Fetch all enum values from the backend
 * This is a public endpoint (no authentication required)
 */
export async function getEnums(): Promise<EnumsResponse> {
  return apiRequest<EnumsResponse>('/api/config/enums');
}
