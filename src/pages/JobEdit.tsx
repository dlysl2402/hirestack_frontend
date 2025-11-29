import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertCircle, ArrowLeft, Loader2, X } from 'lucide-react';
import { getJobById, updateJob } from '@/jobs/job.service';
import { getCompanies } from '@/companies/company.service';
import { useEnums } from '@/config/useEnums';
import type { UpdateJobData, JobStatus, SeniorityLevel } from '@/jobs/job.types';
import { queryKeys } from '@/lib/query-keys';

export default function JobEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch job data
  const { data: job, isLoading } = useQuery({
    queryKey: queryKeys.jobs.detail(id!),
    queryFn: () => getJobById(id!),
    enabled: !!id,
  });

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

  // Pre-populate form with existing data
  useEffect(() => {
    if (job) {
      setCompanyId(job.companyId);
      setTitle(job.title);
      setDepartment(job.department);
      setLocation(job.location);
      setStatus(job.status);
      setResponsibilities(job.responsibilities);
      setRequiredSkills(job.requiredSkills);
      setPreferredSkills(job.preferredSkills || '');
      setSeniorityLevel(job.seniorityLevel);
      setTeamDescription(job.teamDescription || '');
      setRequiredRoleArchetypes(job.requiredRoleArchetypes);
    }
  }, [job]);

  const handleRemoveArchetype = (index: number) => {
    setRequiredRoleArchetypes(requiredRoleArchetypes.filter((_, i) => i !== index));
  };

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

    if (!seniorityLevel) {
      setError('Seniority level is required');
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

    setIsSubmitting(true);

    try {
      const payload: UpdateJobData = {
        companyId: companyId,
        title: title.trim(),
        department: department.trim(),
        location: location.trim(),
        status: status,
        responsibilities: responsibilities.trim(),
        requiredSkills: requiredSkills.trim(),
        preferredSkills: preferredSkills.trim() || null,
        seniorityLevel: seniorityLevel,
        teamDescription: teamDescription.trim() || null,
        requiredRoleArchetypes: requiredRoleArchetypes,
      };

      await updateJob(id!, payload);

      // Invalidate cache
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.detail(id!) });

      // Navigate back to detail page
      navigate(`/jobs/${id}`);
    } catch (err: any) {
      // Error handling
      if (err.response?.status === 400) {
        setError(err.response?.data?.message || 'Invalid input. Please check your entries.');
      } else if (err.response?.status === 403) {
        setError('You do not have permission to edit this job');
      } else if (err.response?.status === 404) {
        setError('Job or selected company not found');
      } else if (err.response?.status === 401) {
        setError('You are not authorized to update jobs');
      } else {
        setError('Failed to update job. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  // Job not found
  if (!job) {
    return (
      <div className="p-8">
        <Card className="border-destructive max-w-2xl">
          <CardContent className="pt-6">
            <p className="text-destructive font-medium">Job not found</p>
            <Button
              variant="secondary"
              onClick={() => navigate('/jobs')}
              className="mt-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Jobs
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(`/jobs/${id}`)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Job
        </Button>
        <h1 className="text-2xl font-bold">Edit Job</h1>
        <p className="text-muted-foreground mt-1">
          Update job details and status
        </p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Job Information</CardTitle>
          <CardDescription>
            Update the job details below
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

            {/* Company - Required */}
            <div className="space-y-2">
              <Label htmlFor="company">
                Company <span className="text-destructive">*</span>
              </Label>
              <Select value={companyId} onValueChange={setCompanyId}>
                <SelectTrigger id="company">
                  <SelectValue placeholder="Select a company" />
                </SelectTrigger>
                <SelectContent>
                  {companiesLoading ? (
                    <SelectItem value="loading" disabled>
                      Loading companies...
                    </SelectItem>
                  ) : companies.length === 0 ? (
                    <SelectItem value="no-companies" disabled>
                      No companies available
                    </SelectItem>
                  ) : (
                    companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.displayName}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                The company this job belongs to
              </p>
            </div>

            {/* Status - Required */}
            <div className="space-y-2">
              <Label htmlFor="status">
                Status <span className="text-destructive">*</span>
              </Label>
              {enumsLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading options...
                </div>
              ) : (
                <Select value={status} onValueChange={(value) => setStatus(value as JobStatus)}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.displayName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <p className="text-sm text-muted-foreground">
                Current hiring status of this position
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
                Max 200 characters
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
                <Select
                  value={seniorityLevel}
                  onValueChange={(value) => setSeniorityLevel(value as SeniorityLevel)}
                >
                  <SelectTrigger id="seniorityLevel">
                    <SelectValue placeholder="Select seniority level" />
                  </SelectTrigger>
                  <SelectContent>
                    {seniorityOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.displayName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Responsibilities - Required */}
            <div className="space-y-2">
              <Label htmlFor="responsibilities">
                Responsibilities <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="responsibilities"
                value={responsibilities}
                onChange={(e) => setResponsibilities(e.target.value)}
                placeholder="Describe the key responsibilities for this role..."
                rows={5}
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
                onChange={(e) => setRequiredSkills(e.target.value)}
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
                onChange={(e) => setPreferredSkills(e.target.value)}
                placeholder="e.g., Docker, Kubernetes, Python"
                rows={3}
              />
              <p className="text-sm text-muted-foreground">
                Leave empty to clear
              </p>
            </div>

            {/* Team Description - Optional */}
            <div className="space-y-2">
              <Label htmlFor="teamDescription">Team Description</Label>
              <Textarea
                id="teamDescription"
                value={teamDescription}
                onChange={(e) => setTeamDescription(e.target.value)}
                placeholder="Describe the team this role will join..."
                rows={3}
              />
              <p className="text-sm text-muted-foreground">
                Leave empty to clear
              </p>
            </div>

            {/* Required Role Archetypes */}
            <div className="space-y-2">
              <Label htmlFor="roleArchetypes">Required Role Archetypes</Label>
              {enumsLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading options...
                </div>
              ) : (
                <Select
                  value=""
                  onValueChange={(value) => {
                    if (value && !requiredRoleArchetypes.includes(value)) {
                      setRequiredRoleArchetypes([...requiredRoleArchetypes, value]);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role archetypes to add" />
                  </SelectTrigger>
                  <SelectContent>
                    {roleArchetypeOptions
                      .filter((option) => !requiredRoleArchetypes.includes(option.value))
                      .map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.displayName}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              )}

              {/* Display selected archetypes as badges */}
              {requiredRoleArchetypes.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {requiredRoleArchetypes.map((archetype, idx) => {
                    const displayName = roleArchetypeOptions.find((o) => o.value === archetype)?.displayName ?? archetype;
                    return (
                      <Badge key={idx} variant="secondary" className="gap-1">
                        {displayName}
                        <button
                          type="button"
                          onClick={() => handleRemoveArchetype(idx)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    );
                  })}
                </div>
              )}

              <p className="text-sm text-muted-foreground">
                Select role archetypes for candidate matching.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/jobs/${id}`)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Job'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
