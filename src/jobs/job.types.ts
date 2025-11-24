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
