import { authenticatedRequest } from '@/lib/api';
import type { Company, CreateCompanyData } from './company.types';

export const createCompany = async (data: CreateCompanyData): Promise<Company> => {
  return authenticatedRequest<Company>('/api/companies', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

// Stubs for future endpoints
// export const getCompanies = async (params: CompanyListParams): Promise<PaginatedCompaniesResponse> => {
//   const response = await api.get('/api/companies', { params });
//   return response.data;
// };

// export const getCompanyById = async (id: string): Promise<Company> => {
//   const response = await api.get(`/api/companies/${id}`);
//   return response.data;
// };

// export const updateCompany = async (id: string, data: UpdateCompanyData): Promise<Company> => {
//   const response = await api.patch(`/api/companies/${id}`, data);
//   return response.data;
// };

// export const deleteCompany = async (id: string): Promise<void> => {
//   await api.delete(`/api/companies/${id}`);
// };
