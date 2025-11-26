import { useCallback, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getAllCandidates, getCandidateById } from '@/candidates/candidate.service';
import type { SortBy, SortOrder, PaginationParams, PaginatedResponse, CandidateListItem } from '@/candidates/candidate.types';
import { formatLocation } from '@/candidates/candidate.utils';
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
import { Loader2, Plus, Upload } from 'lucide-react';
import { usePaginatedQuery } from '@/hooks/usePaginatedQuery';
import { useHoverPrefetch } from '@/hooks/useHoverPrefetch';
import { queryKeys } from '@/lib/query-keys';

/**
 * CandidateRow component with hover prefetch
 */
function CandidateRow({ candidate }: { candidate: CandidateListItem }) {
  const hoverHandlers = useHoverPrefetch({
    queryKey: queryKeys.candidates.detail(candidate.id),
    queryFn: () => getCandidateById(candidate.id),
  });

  const location = formatLocation(
    candidate.locationCity ?? undefined,
    candidate.locationCountry ?? undefined
  );

  return (
    <TableRow key={candidate.id} {...hoverHandlers}>
      <TableCell className="font-medium">
        {candidate.firstName} {candidate.lastName}
      </TableCell>
      <TableCell>
        {candidate.currentTitle ? (
          <span className="text-sm">{candidate.currentTitle}</span>
        ) : (
          <span className="text-muted-foreground text-sm">—</span>
        )}
      </TableCell>
      <TableCell>
        {candidate.currentCompanyName ? (
          <span className="text-sm">{candidate.currentCompanyName}</span>
        ) : (
          <span className="text-muted-foreground text-sm">—</span>
        )}
      </TableCell>
      <TableCell>
        {location ? (
          <span className="text-sm">{location}</span>
        ) : (
          <span className="text-muted-foreground text-sm">—</span>
        )}
      </TableCell>
      <TableCell className="text-right">
        <Link to={`/candidates/${candidate.id}`}>
          <Button variant="ghost" size="sm">
            View
          </Button>
        </Link>
      </TableCell>
    </TableRow>
  );
}

export default function Candidates() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Pagination state from URL params
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '20', 10);
  const sortBy = (searchParams.get('sortBy') || 'createdAt') as SortBy;
  const sortOrder = (searchParams.get('sortOrder') || 'desc') as SortOrder;

  // Memoize pagination params to prevent unnecessary re-renders
  const paginationParams = useMemo(
    () => ({ page, limit, sortBy, sortOrder }),
    [page, limit, sortBy, sortOrder]
  );

  // Use paginated query with automatic prefetching
  const { data, isLoading, error } = usePaginatedQuery<PaginatedResponse<CandidateListItem>, PaginationParams>({
    queryKey: queryKeys.candidates.list(paginationParams),
    queryFn: () => getAllCandidates(paginationParams),
    queryFnGenerator: (params: PaginationParams) => () => getAllCandidates(params),
    page,
    getTotalPages: (data) => data?.pagination?.totalPages ?? 0,
  });

  const candidates = data?.data ?? [];
  const totalPages = data?.pagination?.totalPages ?? 0;
  const totalItems = data?.pagination?.total ?? 0;

  // Memoize handlers to prevent unnecessary re-renders
  const handlePageChange = useCallback(
    (newPage: number) => {
      setSearchParams({
        page: newPage.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder,
      });
    },
    [limit, sortBy, sortOrder, setSearchParams]
  );

  const handleItemsPerPageChange = useCallback(
    (newLimit: number) => {
      setSearchParams({
        page: '1', // Reset to first page when changing limit
        limit: newLimit.toString(),
        sortBy,
        sortOrder,
      });
    },
    [sortBy, sortOrder, setSearchParams]
  );

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

  if (error) {
    return (
      <div className="min-h-full bg-background">
        <div className="container py-8 px-4">
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <p className="text-destructive font-medium">
                {error instanceof Error ? error.message : 'Failed to load candidates'}
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
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Candidates</h1>
            <p className="text-muted-foreground font-medium">
              {totalItems} {totalItems === 1 ? 'candidate' : 'candidates'} in your organization
            </p>
          </div>
          <div className="flex gap-3">
            <Link to="/candidates/import">
              <Button variant="secondary" size="default">
                <Upload className="h-4 w-4 mr-2" />
                Import from LinkedIn
              </Button>
            </Link>
            <Link to="/candidates/create">
              <Button size="default">
                <Plus className="h-4 w-4 mr-2" />
                Create Candidate
              </Button>
            </Link>
          </div>
        </div>

        {/* Empty State */}
        {totalItems === 0 ? (
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>No candidates yet</CardTitle>
              <CardDescription>
                Get started by creating your first candidate or importing from LinkedIn
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Link to="/candidates/create">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Candidate
                  </Button>
                </Link>
                <Link to="/candidates/import">
                  <Button variant="secondary">
                    <Upload className="h-4 w-4 mr-2" />
                    Import from LinkedIn
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Table View */
          <Card className="shadow-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {candidates.map((candidate) => (
                  <CandidateRow key={candidate.id} candidate={candidate} />
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
                itemLabel="candidates"
              />
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
