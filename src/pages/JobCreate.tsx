import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { SearchableMultiSelect } from '@/components/ui/searchable-multi-select';
import { AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { createJob } from '@/jobs/job.service';
import { getCompanies } from '@/companies/company.service';
import { useEnums } from '@/config/useEnums';
import type { CreateJobData, JobStatus, SeniorityLevel } from '@/jobs/job.types';
import { queryKeys } from '@/lib/query-keys';

export default function JobCreate() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch companies for selector
  const { data: companiesData, isLoading: companiesLoading } = useQuery({
    queryKey: queryKeys.companies.list({ page: 1, limit: 20 }),
    queryFn: () => getCompanies({ page: 1, limit: 20 }),
  });

  const companies = companiesData?.data ?? [];

  // Fetch enums for dropdowns
  const { data: enums, isLoading: enumsLoading } = useEnums();

  // Form state
  const [companyId, setCompanyId] = useState('');
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [location, setLocation] = useState('');
  const [responsibilities, setResponsibilities] = useState('');
  const [requiredSkills, setRequiredSkills] = useState('');
  const [seniorityLevel, setSeniorityLevel] = useState<SeniorityLevel | ''>('');
  const [status, setStatus] = useState<JobStatus>('OPEN');
  const [preferredSkills, setPreferredSkills] = useState('');
  const [teamDescription, setTeamDescription] = useState('');
  const [requiredRoleArchetypes, setRequiredRoleArchetypes] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Derive options from enums (with fallback)
  const seniorityOptions = enums?.seniorityLevel ?? [];
  const statusOptions = enums?.jobStatus ?? [];
  const roleArchetypeOptions = enums?.roleArchetypes ?? [];

  // Form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client-side validation
    if (!companyId) {
      setError('Company is required');
      return;
    }

    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    if (title.trim().length > 200) {
      setError('Title must be 200 characters or less');
      return;
    }

    if (!department.trim()) {
      setError('Department is required');
      return;
    }

    if (!location.trim()) {
      setError('Location is required');
      return;
    }

    if (!responsibilities.trim()) {
      setError('Responsibilities are required');
      return;
    }

    if (!requiredSkills.trim()) {
      setError('Required skills are required');
      return;
    }

    if (!seniorityLevel) {
      setError('Seniority level is required');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: CreateJobData = {
        companyId,
        title: title.trim(),
        department: department.trim(),
        location: location.trim(),
        responsibilities: responsibilities.trim(),
        requiredSkills: requiredSkills.trim(),
        seniorityLevel: seniorityLevel as SeniorityLevel,
        status,
        ...(preferredSkills.trim() && { preferredSkills: preferredSkills.trim() }),
        ...(teamDescription.trim() && { teamDescription: teamDescription.trim() }),
        ...(requiredRoleArchetypes.length > 0 && { requiredRoleArchetypes }),
      };

      const newJob = await createJob(payload);

      // Invalidate jobs list cache
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.lists() });

      // Navigate to job detail
      navigate(`/jobs/${newJob.id}`);
    } catch (err: any) {
      // Error handling
      if (err.response?.status === 400) {
        setError(err.response?.data?.message || 'Invalid input. Please check your entries.');
      } else if (err.response?.status === 401) {
        setError('You are not authorized to create jobs');
      } else if (err.response?.status === 403) {
        setError('The selected company does not belong to your organization');
      } else if (err.response?.status === 404) {
        setError('The selected company does not exist');
      } else {
        setError('Failed to create job. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/jobs')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Jobs
        </Button>
        <h1 className="text-2xl font-bold">Create Job</h1>
        <p className="text-muted-foreground mt-1">
          Post a new job opening to your organization
        </p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Job Details</CardTitle>
          <CardDescription>
            Enter the job information below. All fields marked with * are required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error display */}
            {error && (
              <div className="flex items-start gap-2 p-4 bg-destructive/10 border border-destructive rounded-md">
                <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-destructive">{error}</p>
                </div>
              </div>
            )}

            {/* Company Selector - Required */}
            <div className="space-y-2">
              <Label htmlFor="companyId">
                Company <span className="text-destructive">*</span>
              </Label>
              {companiesLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading companies...
                </div>
              ) : companies.length === 0 ? (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    No companies found. Create a company first.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/companies/create')}
                  >
                    Create Company
                  </Button>
                </div>
              ) : (
                <Select value={companyId} onValueChange={setCompanyId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a company" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.displayName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <p className="text-sm text-muted-foreground">
                The company posting this job
              </p>
            </div>

            {/* Title - Required */}
            <div className="space-y-2">
              <Label htmlFor="title">
                Job Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={200}
                placeholder="e.g., Senior Backend Engineer"
                required
              />
              <p className="text-sm text-muted-foreground">
                {title.length}/200 characters
              </p>
            </div>

            {/* Department - Required */}
            <div className="space-y-2">
              <Label htmlFor="department">
                Department <span className="text-destructive">*</span>
              </Label>
              <Input
                id="department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g., Engineering"
                required
              />
            </div>

            {/* Location - Required */}
            <div className="space-y-2">
              <Label htmlFor="location">
                Location <span className="text-destructive">*</span>
              </Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., San Francisco / Remote"
                required
              />
            </div>

            {/* Seniority Level - Required */}
            <div className="space-y-2">
              <Label htmlFor="seniorityLevel">
                Seniority Level <span className="text-destructive">*</span>
              </Label>
              {enumsLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading options...
                </div>
              ) : (
                <SearchableSelect
                  options={seniorityOptions}
                  value={seniorityLevel}
                  onValueChange={(value) => setSeniorityLevel(value as SeniorityLevel)}
                  placeholder="Select seniority level..."
                  searchPlaceholder="Search levels..."
                  emptyMessage="No levels found."
                />
              )}
            </div>

            {/* Status - Optional */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              {enumsLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading options...
                </div>
              ) : (
                <SearchableSelect
                  options={statusOptions}
                  value={status}
                  onValueChange={(value) => setStatus(value as JobStatus)}
                  placeholder="Select status..."
                  searchPlaceholder="Search statuses..."
                  emptyMessage="No statuses found."
                />
              )}
              <p className="text-sm text-muted-foreground">
                Default is Open
              </p>
            </div>

            {/* Responsibilities - Required */}
            <div className="space-y-2">
              <Label htmlFor="responsibilities">
                Responsibilities <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="responsibilities"
                value={responsibilities}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setResponsibilities(e.target.value)}
                placeholder="Describe the key responsibilities for this role..."
                rows={4}
                required
              />
            </div>

            {/* Required Skills - Required */}
            <div className="space-y-2">
              <Label htmlFor="requiredSkills">
                Required Skills <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="requiredSkills"
                value={requiredSkills}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRequiredSkills(e.target.value)}
                placeholder="e.g., Node.js, PostgreSQL, AWS"
                rows={3}
                required
              />
            </div>

            {/* Preferred Skills - Optional */}
            <div className="space-y-2">
              <Label htmlFor="preferredSkills">Preferred Skills</Label>
              <Textarea
                id="preferredSkills"
                value={preferredSkills}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPreferredSkills(e.target.value)}
                placeholder="e.g., Docker, Kubernetes"
                rows={3}
              />
            </div>

            {/* Team Description - Optional */}
            <div className="space-y-2">
              <Label htmlFor="teamDescription">Team Description</Label>
              <Textarea
                id="teamDescription"
                value={teamDescription}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setTeamDescription(e.target.value)}
                placeholder="Describe the team structure and culture..."
                rows={3}
              />
            </div>

            {/* Required Role Archetypes - Optional */}
            <div className="space-y-2">
              <Label htmlFor="roleArchetypes">Required Role Archetypes</Label>
              {enumsLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading options...
                </div>
              ) : (
                <SearchableMultiSelect
                  options={roleArchetypeOptions}
                  values={requiredRoleArchetypes}
                  onValuesChange={setRequiredRoleArchetypes}
                  placeholder="Search role archetypes..."
                  searchPlaceholder="Type to search..."
                  emptyMessage="No role archetypes found."
                />
              )}
              <p className="text-sm text-muted-foreground">
                Select role archetypes to filter candidate matches.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/jobs')}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || companies.length === 0}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Job'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
