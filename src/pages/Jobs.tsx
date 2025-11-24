import { useCallback, useMemo, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { getJobs } from '@/jobs/job.service';
import { getCompanies } from '@/companies/company.service';
import type { Job, JobListParams, JobStatus, SeniorityLevel } from '@/jobs/job.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PaginationControls } from '@/components/ui/pagination';
import { Loader2, Plus, ArrowUpDown, ArrowUp, ArrowDown, Briefcase, ChevronDown, ChevronUp, X } from 'lucide-react';
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

// Status badge component
function StatusBadge({ status }: { status: JobStatus }) {
  const styles = {
    OPEN: 'bg-green-100 text-green-800 border-green-200',
    OFFERED: 'bg-blue-100 text-blue-800 border-blue-200',
    CLOSED: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}>
      {status}
    </span>
  );
}

// Seniority badge component
function SeniorityBadge({ level }: { level: SeniorityLevel }) {
  const styles = {
    JUNIOR: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    MID_LEVEL: 'bg-purple-100 text-purple-800 border-purple-200',
    SENIOR: 'bg-orange-100 text-orange-800 border-orange-200',
  };

  const labels = {
    JUNIOR: 'Junior',
    MID_LEVEL: 'Mid-Level',
    SENIOR: 'Senior',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[level]}`}>
      {labels[level]}
    </span>
  );
}

// Job row component
function JobRow({ job, companyName }: { job: Job; companyName: string }) {
  return (
    <TableRow key={job.id}>
      <TableCell className="font-medium">{job.title}</TableCell>
      <TableCell>
        <span className="text-sm">{companyName}</span>
      </TableCell>
      <TableCell className="text-sm">{job.department}</TableCell>
      <TableCell className="text-sm">{job.location}</TableCell>
      <TableCell>
        <SeniorityBadge level={job.seniorityLevel} />
      </TableCell>
      <TableCell>
        <StatusBadge status={job.status} />
      </TableCell>
      <TableCell className="text-sm">{formatDate(job.createdAt)}</TableCell>
      <TableCell className="text-right">
        <Link to={`/jobs/${job.id}`}>
          <Button variant="ghost" size="sm">
            View
          </Button>
        </Link>
      </TableCell>
    </TableRow>
  );
}

export default function Jobs() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Pagination and sort state from URL params
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '20', 10);
  const sortBy = (searchParams.get('sortBy') || 'createdAt') as JobListParams['sortBy'];
  const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';

  // Filter state from URL params
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') as JobStatus | null;
  const seniorityLevel = searchParams.get('seniorityLevel') as SeniorityLevel | null;
  const companyId = searchParams.get('companyId') || '';
  const location = searchParams.get('location') || '';
  const department = searchParams.get('department') || '';

  // Check if any filters are active
  const hasActiveFilters = !!(search || status || seniorityLevel || companyId || location || department);

  // Memoize query params
  const queryParams = useMemo(() => {
    const params: JobListParams = { page, limit, sortBy, sortOrder };
    if (search) params.search = search;
    if (status) params.status = status;
    if (seniorityLevel) params.seniorityLevel = seniorityLevel;
    if (companyId) params.companyId = companyId;
    if (location) params.location = location;
    if (department) params.department = department;
    return params;
  }, [page, limit, sortBy, sortOrder, search, status, seniorityLevel, companyId, location, department]);

  // Fetch jobs with React Query
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.jobs.list(queryParams),
    queryFn: () => getJobs(queryParams),
    placeholderData: keepPreviousData,
  });

  // Fetch companies for name lookup
  const { data: companiesData, isLoading: companiesLoading } = useQuery({
    queryKey: queryKeys.companies.list({ limit: 1000 }),
    queryFn: () => getCompanies({ limit: 1000 }),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Create company lookup map
  const companyMap = useMemo(() => {
    const map = new Map<string, string>();
    companiesData?.data?.forEach((company) => {
      map.set(company.id, company.displayName);
    });
    return map;
  }, [companiesData]);

  const jobs = data?.data ?? [];
  const totalPages = data?.pagination?.totalPages ?? 0;
  const totalItems = data?.pagination?.total ?? 0;

  // Handlers
  const updateSearchParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const newParams = new URLSearchParams();

      // Always include pagination and sorting
      newParams.set('page', updates.page || '1');
      newParams.set('limit', updates.limit || limit.toString());
      newParams.set('sortBy', updates.sortBy || sortBy || 'createdAt');
      newParams.set('sortOrder', updates.sortOrder || sortOrder);

      // Include filters if they exist
      const searchValue = updates.search !== undefined ? updates.search : search;
      const statusValue = updates.status !== undefined ? updates.status : status;
      const seniorityValue = updates.seniorityLevel !== undefined ? updates.seniorityLevel : seniorityLevel;
      const companyValue = updates.companyId !== undefined ? updates.companyId : companyId;
      const locationValue = updates.location !== undefined ? updates.location : location;
      const departmentValue = updates.department !== undefined ? updates.department : department;

      if (searchValue) newParams.set('search', searchValue);
      if (statusValue) newParams.set('status', statusValue);
      if (seniorityValue) newParams.set('seniorityLevel', seniorityValue);
      if (companyValue) newParams.set('companyId', companyValue);
      if (locationValue) newParams.set('location', locationValue);
      if (departmentValue) newParams.set('department', departmentValue);

      setSearchParams(newParams);
    },
    [limit, sortBy, sortOrder, search, status, seniorityLevel, companyId, location, department, setSearchParams]
  );

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

  const handleSort = (field: JobListParams['sortBy']) => {
    const newOrder = sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc';
    updateSearchParams({ page: '1', sortBy: field || 'createdAt', sortOrder: newOrder });
  };

  const handleSearchChange = (value: string) => {
    updateSearchParams({ page: '1', search: value || undefined });
  };

  const handleStatusChange = (value: string) => {
    updateSearchParams({ page: '1', status: value === 'all' ? undefined : value });
  };

  const handleSeniorityChange = (value: string) => {
    updateSearchParams({ page: '1', seniorityLevel: value === 'all' ? undefined : value });
  };

  const handleCompanyChange = (value: string) => {
    updateSearchParams({ page: '1', companyId: value === 'all' ? undefined : value });
  };

  const handleLocationChange = (value: string) => {
    updateSearchParams({ page: '1', location: value || undefined });
  };

  const handleDepartmentChange = (value: string) => {
    updateSearchParams({ page: '1', department: value || undefined });
  };

  const handleClearFilters = () => {
    setSearchParams({
      page: '1',
      limit: limit.toString(),
      sortBy: 'createdAt',
      sortOrder: 'desc',
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
                {error instanceof Error ? error.message : 'Failed to load jobs'}
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
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Jobs</h1>
            <p className="text-muted-foreground font-medium">
              {totalItems} {totalItems === 1 ? 'job' : 'jobs'} in your organization
            </p>
          </div>
          <Button onClick={() => navigate('/jobs/create')}>
            <Plus className="h-4 w-4 mr-2" />
            Create Job
          </Button>
        </div>

        {/* Filters */}
        <Card className="shadow-md mb-6">
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Primary Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Search */}
                <div className="relative">
                  <Input
                    placeholder="Search jobs..."
                    value={search}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pr-8"
                  />
                  {search && (
                    <button
                      onClick={() => handleSearchChange('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Status Filter */}
                <Select value={status || 'all'} onValueChange={handleStatusChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="OPEN">Open</SelectItem>
                    <SelectItem value="OFFERED">Offered</SelectItem>
                    <SelectItem value="CLOSED">Closed</SelectItem>
                  </SelectContent>
                </Select>

                {/* Seniority Filter */}
                <Select value={seniorityLevel || 'all'} onValueChange={handleSeniorityChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="JUNIOR">Junior</SelectItem>
                    <SelectItem value="MID_LEVEL">Mid-Level</SelectItem>
                    <SelectItem value="SENIOR">Senior</SelectItem>
                  </SelectContent>
                </Select>

                {/* Company Filter */}
                <Select value={companyId || 'all'} onValueChange={handleCompanyChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Companies" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Companies</SelectItem>
                    {companiesLoading ? (
                      <SelectItem value="loading" disabled>
                        Loading...
                      </SelectItem>
                    ) : (
                      companiesData?.data?.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.displayName}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Advanced Filters Toggle */}
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {showAdvancedFilters ? (
                    <>
                      <ChevronUp className="h-4 w-4 mr-1" />
                      Hide Advanced Filters
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4 mr-1" />
                      Show Advanced Filters
                    </>
                  )}
                </Button>

                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearFilters}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Clear Filters
                  </Button>
                )}
              </div>

              {/* Advanced Filters */}
              {showAdvancedFilters && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                  <div className="relative">
                    <Input
                      placeholder="Location (exact match)"
                      value={location}
                      onChange={(e) => handleLocationChange(e.target.value)}
                      className="pr-8"
                    />
                    {location && (
                      <button
                        onClick={() => handleLocationChange('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="relative">
                    <Input
                      placeholder="Department (exact match)"
                      value={department}
                      onChange={(e) => handleDepartmentChange(e.target.value)}
                      className="pr-8"
                    />
                    {department && (
                      <button
                        onClick={() => handleDepartmentChange('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
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
                <Briefcase className="h-5 w-5" />
                {hasActiveFilters ? 'No jobs found' : 'No jobs yet'}
              </CardTitle>
              <CardDescription>
                {hasActiveFilters
                  ? 'Try adjusting your filters to see more results'
                  : 'Get started by creating your first job'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {hasActiveFilters ? (
                <Button onClick={handleClearFilters} variant="outline">
                  <X className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              ) : (
                <Button onClick={() => navigate('/jobs/create')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Job
                </Button>
              )}
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
                      onClick={() => handleSort('title')}
                      className="flex items-center gap-1 hover:text-foreground"
                    >
                      Title
                      <SortIcon active={sortBy === 'title'} order={sortOrder} />
                    </button>
                  </TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>
                    <button
                      onClick={() => handleSort('department')}
                      className="flex items-center gap-1 hover:text-foreground"
                    >
                      Department
                      <SortIcon active={sortBy === 'department'} order={sortOrder} />
                    </button>
                  </TableHead>
                  <TableHead>
                    <button
                      onClick={() => handleSort('location')}
                      className="flex items-center gap-1 hover:text-foreground"
                    >
                      Location
                      <SortIcon active={sortBy === 'location'} order={sortOrder} />
                    </button>
                  </TableHead>
                  <TableHead>
                    <button
                      onClick={() => handleSort('seniorityLevel')}
                      className="flex items-center gap-1 hover:text-foreground"
                    >
                      Seniority
                      <SortIcon active={sortBy === 'seniorityLevel'} order={sortOrder} />
                    </button>
                  </TableHead>
                  <TableHead>
                    <button
                      onClick={() => handleSort('status')}
                      className="flex items-center gap-1 hover:text-foreground"
                    >
                      Status
                      <SortIcon active={sortBy === 'status'} order={sortOrder} />
                    </button>
                  </TableHead>
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
                {jobs.map((job) => (
                  <JobRow
                    key={job.id}
                    job={job}
                    companyName={companyMap.get(job.companyId) || 'Unknown'}
                  />
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
                itemLabel="jobs"
              />
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
