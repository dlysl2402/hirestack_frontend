import { useCallback, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getAllCandidates } from '@/candidates/candidate.service';
import type { SortBy, SortOrder, PaginatedResponse, CandidateListItem, PaginationParams } from '@/candidates/candidate.types';
import { formatLocation } from '@/candidates/candidate.utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PaginationControls } from '@/components/ui/pagination';
import { Loader2, Plus, Upload, X, Users } from 'lucide-react';
import { usePaginatedQuery } from '@/hooks/usePaginatedQuery';
import { queryKeys } from '@/lib/query-keys';

function CandidateRow({ candidate }: { candidate: CandidateListItem }) {
  const location = formatLocation(
    candidate.locationCity ?? undefined,
    candidate.locationCountry ?? undefined
  );

  return (
    <TableRow key={candidate.id}>
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

  // Filter state from URL params
  const firstName = searchParams.get('firstName') || '';
  const lastName = searchParams.get('lastName') || '';
  const currentTitle = searchParams.get('currentTitle') || '';
  const currentCompanyName = searchParams.get('currentCompanyName') || '';
  const locationCountry = searchParams.get('locationCountry') || '';

  // Check if any filters are active
  const hasActiveFilters = !!(firstName || lastName || currentTitle || currentCompanyName || locationCountry);

  // Memoize query params including filters
  const queryParams = useMemo(() => {
    const params: PaginationParams = { page, limit, sortBy, sortOrder };
    if (firstName) params.firstName = firstName;
    if (lastName) params.lastName = lastName;
    if (currentTitle) params.currentTitle = currentTitle;
    if (currentCompanyName) params.currentCompanyName = currentCompanyName;
    if (locationCountry) params.locationCountry = locationCountry;
    return params;
  }, [page, limit, sortBy, sortOrder, firstName, lastName, currentTitle, currentCompanyName, locationCountry]);

  // Update search params utility
  const updateSearchParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const newParams = new URLSearchParams();

      // Always include pagination and sorting
      newParams.set('page', updates.page || '1');
      newParams.set('limit', updates.limit || limit.toString());
      newParams.set('sortBy', updates.sortBy || sortBy || 'createdAt');
      newParams.set('sortOrder', updates.sortOrder || sortOrder);

      // Include filters if they exist (use key presence to determine if we should update)
      const firstNameValue = 'firstName' in updates ? updates.firstName : firstName;
      const lastNameValue = 'lastName' in updates ? updates.lastName : lastName;
      const titleValue = 'currentTitle' in updates ? updates.currentTitle : currentTitle;
      const companyValue = 'currentCompanyName' in updates ? updates.currentCompanyName : currentCompanyName;
      const countryValue = 'locationCountry' in updates ? updates.locationCountry : locationCountry;

      if (firstNameValue) newParams.set('firstName', firstNameValue);
      if (lastNameValue) newParams.set('lastName', lastNameValue);
      if (titleValue) newParams.set('currentTitle', titleValue);
      if (companyValue) newParams.set('currentCompanyName', companyValue);
      if (countryValue) newParams.set('locationCountry', countryValue);

      setSearchParams(newParams);
    },
    [limit, sortBy, sortOrder, firstName, lastName, currentTitle, currentCompanyName, locationCountry, setSearchParams]
  );

  const { data, isLoading, error } = usePaginatedQuery<PaginatedResponse<CandidateListItem>>({
    queryKey: queryKeys.candidates.list(queryParams),
    queryFn: () => getAllCandidates(queryParams),
  });

  const candidates = data?.data ?? [];
  const totalPages = data?.pagination?.totalPages ?? 0;
  const totalItems = data?.pagination?.total ?? 0;

  // Memoize handlers to prevent unnecessary re-renders
  const handlePageChange = useCallback(
    (newPage: number) => {
      updateSearchParams({ page: newPage.toString() });
    },
    [updateSearchParams]
  );

  const handleItemsPerPageChange = useCallback(
    (newLimit: number) => {
      updateSearchParams({ page: '1', limit: newLimit.toString() });
    },
    [updateSearchParams]
  );

  // Filter handlers - pass empty string to clear (key presence triggers update)
  const handleFirstNameChange = (value: string) => {
    updateSearchParams({ page: '1', firstName: value });
  };

  const handleLastNameChange = (value: string) => {
    updateSearchParams({ page: '1', lastName: value });
  };

  const handleTitleChange = (value: string) => {
    updateSearchParams({ page: '1', currentTitle: value });
  };

  const handleCompanyChange = (value: string) => {
    updateSearchParams({ page: '1', currentCompanyName: value });
  };

  const handleCountryChange = (value: string) => {
    updateSearchParams({ page: '1', locationCountry: value });
  };

  const handleClearFilters = () => {
    setSearchParams({
      page: '1',
      limit: limit.toString(),
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  };

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

        {/* Filters */}
        <Card className="shadow-md mb-6">
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Filter Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* First Name */}
                <div className="relative">
                  <Input
                    placeholder="First name..."
                    value={firstName}
                    onChange={(e) => handleFirstNameChange(e.target.value)}
                    className="pr-8"
                  />
                  {firstName && (
                    <button
                      onClick={() => handleFirstNameChange('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Last Name */}
                <div className="relative">
                  <Input
                    placeholder="Last name..."
                    value={lastName}
                    onChange={(e) => handleLastNameChange(e.target.value)}
                    className="pr-8"
                  />
                  {lastName && (
                    <button
                      onClick={() => handleLastNameChange('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Title */}
                <div className="relative">
                  <Input
                    placeholder="Job title..."
                    value={currentTitle}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="pr-8"
                  />
                  {currentTitle && (
                    <button
                      onClick={() => handleTitleChange('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Company */}
                <div className="relative">
                  <Input
                    placeholder="Company..."
                    value={currentCompanyName}
                    onChange={(e) => handleCompanyChange(e.target.value)}
                    className="pr-8"
                  />
                  {currentCompanyName && (
                    <button
                      onClick={() => handleCompanyChange('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Country */}
                <div className="relative">
                  <Input
                    placeholder="Country..."
                    value={locationCountry}
                    onChange={(e) => handleCountryChange(e.target.value)}
                    className="pr-8"
                  />
                  {locationCountry && (
                    <button
                      onClick={() => handleCountryChange('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearFilters}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Empty State */}
        {totalItems === 0 ? (
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                {hasActiveFilters ? 'No candidates found' : 'No candidates yet'}
              </CardTitle>
              <CardDescription>
                {hasActiveFilters
                  ? 'Try adjusting your filters to see more results'
                  : 'Get started by creating your first candidate or importing from LinkedIn'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {hasActiveFilters ? (
                <Button onClick={handleClearFilters} variant="outline">
                  <X className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              ) : (
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
              )}
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
