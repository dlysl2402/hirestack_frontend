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

export interface UpdateCompanyData {
  displayName?: string;      // 1-255 chars, trimmed
  aliases?: string[];        // Array of strings, normalized to lowercase (or [] to clear)
  industry?: string | null;  // String or null to clear
  linkedInUrl?: string | null;  // Valid URL or null to clear
  websiteUrl?: string | null;   // Valid URL or null to clear
}

export interface CompanyListParams {
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'displayName' | 'industry' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

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
