import { authenticatedRequest } from '@/lib/api';
import type { Company, CreateCompanyData, UpdateCompanyData, CompanyListParams, PaginatedCompaniesResponse } from './company.types';

export const getCompanies = async (params?: CompanyListParams): Promise<PaginatedCompaniesResponse> => {
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

  const query = queryParams.toString();
  const endpoint = query ? `/api/companies?${query}` : '/api/companies';

  return authenticatedRequest<PaginatedCompaniesResponse>(endpoint);
};

export const getCompanyById = async (id: string): Promise<Company> => {
  return authenticatedRequest<Company>(`/api/companies/${id}`);
};

export const createCompany = async (data: CreateCompanyData): Promise<Company> => {
  return authenticatedRequest<Company>('/api/companies', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateCompany = async (id: string, data: UpdateCompanyData): Promise<Company> => {
  return authenticatedRequest<Company>(`/api/companies/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
};

export const deleteCompany = async (id: string): Promise<void> => {
  await authenticatedRequest<void>(`/api/companies/${id}`, {
    method: 'DELETE',
  });
};
