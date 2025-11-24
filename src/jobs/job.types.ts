// Job status enum
export type JobStatus = 'OPEN' | 'OFFERED' | 'CLOSED';

// Seniority level enum
export type SeniorityLevel = 'JUNIOR' | 'MID_LEVEL' | 'SENIOR';

// Job interface (API response)
export interface Job {
  id: string;
  organizationId: string;
  companyId: string;
  title: string;
  department: string;
  location: string;
  status: JobStatus;
  responsibilities: string;
  requiredSkills: string;
  preferredSkills: string | null;
  seniorityLevel: SeniorityLevel;
  teamDescription: string | null;
  requiredCandidateTags: string[];
  interpretation: string | null;
  interpretedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// Create job data (API request)
export interface CreateJobData {
  companyId: string;
  title: string;
  department: string;
  location: string;
  responsibilities: string;
  requiredSkills: string;
  seniorityLevel: SeniorityLevel;
  status?: JobStatus;
  preferredSkills?: string;
  teamDescription?: string;
  requiredCandidateTags?: string[];
}

// Update job data (API request) - all fields optional
export interface UpdateJobData {
  companyId?: string;
  title?: string;
  department?: string;
  location?: string;
  status?: JobStatus;
  responsibilities?: string;
  requiredSkills?: string;
  preferredSkills?: string | null;  // String or null to clear
  seniorityLevel?: SeniorityLevel;
  teamDescription?: string | null;  // String or null to clear
  requiredCandidateTags?: string[];  // Replaces entire array
}

// Job list query parameters (pagination + sorting + filters)
export interface JobListParams {
  // Pagination
  page?: number;              // Default: 1
  limit?: number;             // Default: 20, max: 100

  // Sorting
  sortBy?: 'title' | 'department' | 'location' | 'status' |
           'seniorityLevel' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc'; // Default: 'desc'

  // Filters (all optional, combine with AND logic)
  status?: JobStatus;
  seniorityLevel?: SeniorityLevel;
  companyId?: string;
  location?: string;          // Exact match
  department?: string;        // Exact match
  search?: string;            // Case-insensitive title search (contains)
}

// Pagination metadata
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Paginated jobs response
export interface PaginatedJobsResponse {
  data: Job[];
  pagination: PaginationMeta;
}
