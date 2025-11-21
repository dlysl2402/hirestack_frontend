// Candidate type definitions

export type ProfileSource = 'LINKEDIN' | 'RESUME' | 'MANUAL';

// Company type for relations
export interface Company {
  id: string;
  name: string;
  displayName: string;
  linkedInUrl?: string;
}

// Nested profile data structures
export interface Experience {
  id: string;
  title: string;
  companyName: string;
  companyId?: string;
  company?: Company;
  description?: string;
  startMonth?: number;
  startYear?: number;
  endMonth?: number;
  endYear?: number;
  skills: string[];
  displayOrder: number;
}

export interface Education {
  id: string;
  school?: string;
  degree?: string;
  startYear?: number;
  endYear?: number;
  displayOrder: number;
}

export interface Skill {
  id: string;
  name: string;
  endorsementCount?: number;
  displayOrder: number;
}

export interface Certification {
  id: string;
  name: string;
  organization: string;
  organizationUrn?: string;
  credentialId?: string;
  credentialUrl?: string;
  issueMonth?: number;
  issueYear?: number;
  expirationMonth?: number;
  expirationYear?: number;
  displayOrder: number;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  associatedCompany?: string;
  startMonth?: number;
  startYear?: number;
  endMonth?: number;
  endYear?: number;
  projectUrls: string[];
  displayOrder: number;
}

// Profile structure (flattened from backend)
export interface CandidateProfile {
  id: string;
  source: ProfileSource;
  linkedInUrl?: string;
  resumeId?: string;
  headline?: string;
  about?: string;
  locationCity?: string;
  locationCountry?: string;
  locationCountryCode?: string;
  currentTitle?: string;
  currentCompanyName?: string;
  currentCompanyId?: string;
  currentCompany?: Company;
  currentDescription?: string;
  currentStartMonth?: number;
  currentStartYear?: number;
  createdAt: string;
  updatedAt: string;
  experience: Experience[];
  education: Education[];
  skills: Skill[];
  certifications: Certification[];
  projects: Project[];
}

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
  // Flattened profiles by source
  linkedinProfile: CandidateProfile | null;
  resumeProfile: CandidateProfile | null;
  manualProfile: CandidateProfile | null;
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
