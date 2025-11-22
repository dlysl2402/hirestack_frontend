export interface Company {
  id: string;
  organizationId: string;
  name: string;              // Auto-generated, lowercase
  displayName: string;       // User-provided, case preserved
  aliases: string[];         // Normalized to lowercase
  industry: string | null;
  linkedInUrl: string | null;
  websiteUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCompanyData {
  displayName: string;       // Required
  aliases?: string[];        // Optional
  industry?: string;         // Optional
  linkedInUrl?: string;      // Optional
  websiteUrl?: string;       // Optional
}

// For future use when GET endpoint is available
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedCompaniesResponse {
  data: Company[];
  pagination: PaginationMeta;
}
