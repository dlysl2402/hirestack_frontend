import { useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { getCompanies } from '@/companies/company.service';
import type { Company, CompanyListParams } from '@/companies/company.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PaginationControls } from '@/components/ui/pagination';
import { Loader2, Plus, ExternalLink, ArrowUpDown, ArrowUp, ArrowDown, Building2 } from 'lucide-react';
import { queryKeys } from '@/lib/query-keys';

// Utility to format date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
};

// Sort indicator component
function SortIcon({ active, order }: { active: boolean; order: 'asc' | 'desc' }) {
  if (!active) return <ArrowUpDown className="h-4 w-4 opacity-30" />;
  return order === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
}

// Company row component
function CompanyRow({ company }: { company: Company }) {
  return (
    <TableRow key={company.id}>
      <TableCell className="font-medium">{company.displayName}</TableCell>
      <TableCell>
        {company.industry ? (
          <span className="text-sm">{company.industry}</span>
        ) : (
          <span className="text-muted-foreground text-sm">—</span>
        )}
      </TableCell>
      <TableCell>
        {company.linkedInUrl ? (
          <a
            href={company.linkedInUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            <ExternalLink className="h-3 w-3" />
            LinkedIn
          </a>
        ) : (
          <span className="text-muted-foreground text-sm">—</span>
        )}
      </TableCell>
      <TableCell>
        {company.websiteUrl ? (
          <a
            href={company.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            <ExternalLink className="h-3 w-3" />
            Website
          </a>
        ) : (
          <span className="text-muted-foreground text-sm">—</span>
        )}
      </TableCell>
      <TableCell className="text-sm">{formatDate(company.createdAt)}</TableCell>
      <TableCell className="text-right">
        <Link to={`/companies/${company.id}`}>
          <Button variant="ghost" size="sm">
            View
          </Button>
        </Link>
      </TableCell>
    </TableRow>
  );
}

export default function Companies() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Pagination and sort state from URL params
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '20', 10);
  const sortBy = (searchParams.get('sortBy') || 'name') as CompanyListParams['sortBy'];
  const sortOrder = (searchParams.get('sortOrder') || 'asc') as 'asc' | 'desc';

  // Memoize query params
  const queryParams = useMemo(
    () => ({ page, limit, sortBy, sortOrder }),
    [page, limit, sortBy, sortOrder]
  );

  // Fetch companies with React Query
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.companies.list(queryParams),
    queryFn: () => getCompanies(queryParams),
    placeholderData: keepPreviousData,
  });

  const companies = data?.data ?? [];
  const totalPages = data?.pagination?.totalPages ?? 0;
  const totalItems = data?.pagination?.total ?? 0;

  // Handlers
  const handlePageChange = useCallback(
    (newPage: number) => {
      setSearchParams({
        page: newPage.toString(),
        limit: limit.toString(),
        sortBy: sortBy || 'name',
        sortOrder,
      });
    },
    [limit, sortBy, sortOrder, setSearchParams]
  );

  const handleItemsPerPageChange = useCallback(
    (newLimit: number) => {
      setSearchParams({
        page: '1',
        limit: newLimit.toString(),
        sortBy: sortBy || 'name',
        sortOrder,
      });
    },
    [sortBy, sortOrder, setSearchParams]
  );

  const handleSort = (field: CompanyListParams['sortBy']) => {
    const newOrder = sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc';
    setSearchParams({
      page: '1',
      limit: limit.toString(),
      sortBy: field || 'name',
      sortOrder: newOrder,
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-full bg-background">
        <div className="container py-8 px-4">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-full bg-background">
        <div className="container py-8 px-4">
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <p className="text-destructive font-medium">
                {error instanceof Error ? error.message : 'Failed to load companies'}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-background">
      <div className="container py-8 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Companies</h1>
            <p className="text-muted-foreground font-medium">
              {totalItems} {totalItems === 1 ? 'company' : 'companies'} in your organization
            </p>
          </div>
          <Button onClick={() => navigate('/companies/create')}>
            <Plus className="h-4 w-4 mr-2" />
            Create Company
          </Button>
        </div>

        {/* Empty State */}
        {totalItems === 0 ? (
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                No companies yet
              </CardTitle>
              <CardDescription>
                Get started by creating your first company
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/companies/create')}>
                <Plus className="h-4 w-4 mr-2" />
                Create Company
              </Button>
            </CardContent>
          </Card>
        ) : (
          /* Table View */
          <Card className="shadow-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <button
                      onClick={() => handleSort('displayName')}
                      className="flex items-center gap-1 hover:text-foreground"
                    >
                      Display Name
                      <SortIcon active={sortBy === 'displayName'} order={sortOrder} />
                    </button>
                  </TableHead>
                  <TableHead>
                    <button
                      onClick={() => handleSort('industry')}
                      className="flex items-center gap-1 hover:text-foreground"
                    >
                      Industry
                      <SortIcon active={sortBy === 'industry'} order={sortOrder} />
                    </button>
                  </TableHead>
                  <TableHead>LinkedIn</TableHead>
                  <TableHead>Website</TableHead>
                  <TableHead>
                    <button
                      onClick={() => handleSort('createdAt')}
                      className="flex items-center gap-1 hover:text-foreground"
                    >
                      Created
                      <SortIcon active={sortBy === 'createdAt'} order={sortOrder} />
                    </button>
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companies.map((company) => (
                  <CompanyRow key={company.id} company={company} />
                ))}
              </TableBody>
            </Table>

            {/* Pagination Controls */}
            <div className="px-4">
              <PaginationControls
                currentPage={page}
                totalPages={totalPages}
                itemsPerPage={limit}
                totalItems={totalItems}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
                itemLabel="companies"
              />
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
