// Candidate type definitions

export interface Candidate {
  id: string;
  organizationId: string;
  firstName: string;
  lastName: string;
  email: string[];
  phone: string[];
  jobFunctionTags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateCandidateData {
  firstName: string;
  lastName: string;
  email?: string[];
  phone?: string[];
  jobFunctionTags?: string[];
}

export interface UpdateCandidateData {
  firstName?: string;
  lastName?: string;
  email?: string[];
  phone?: string[];
  jobFunctionTags?: string[];
}

// LinkedIn Import types
export interface LinkedInImportRequest {
  linkedinUrls: string[];
}

export interface LinkedInImportSuccess {
  candidateId: string;
  linkedinUrl: string;
  firstName: string;
  lastName: string;
  currentTitle?: string;
  currentCompanyName?: string;
}

export interface LinkedInImportSkipped {
  linkedinUrl: string;
  reason: string;
}

export interface LinkedInImportFailed {
  linkedinUrl: string;
  reason: string;
}

export interface LinkedInImportResults {
  success: LinkedInImportSuccess[];
  skipped: LinkedInImportSkipped[];
  failed: LinkedInImportFailed[];
}
