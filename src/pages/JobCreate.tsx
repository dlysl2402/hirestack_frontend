import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { AlertCircle, ArrowLeft, Loader2, Plus, X } from 'lucide-react';
import { createJob } from '@/jobs/job.service';
import { getCompanies } from '@/companies/company.service';
import type { CreateJobData, JobStatus, SeniorityLevel } from '@/jobs/job.types';
import { queryKeys } from '@/lib/query-keys';

export default function JobCreate() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch companies for selector
  const { data: companiesData, isLoading: companiesLoading } = useQuery({
    queryKey: queryKeys.companies.list({ page: 1, limit: 1000 }),
    queryFn: () => getCompanies({ page: 1, limit: 1000 }),
  });

  const companies = companiesData?.data ?? [];

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
  const [requiredCandidateTags, setRequiredCandidateTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Seniority level options
  const seniorityOptions: { value: SeniorityLevel; label: string }[] = [
    { value: 'JUNIOR', label: 'Junior' },
    { value: 'MID_LEVEL', label: 'Mid-Level' },
    { value: 'SENIOR', label: 'Senior' },
  ];

  // Status options
  const statusOptions: { value: JobStatus; label: string }[] = [
    { value: 'OPEN', label: 'Open' },
    { value: 'OFFERED', label: 'Offered' },
    { value: 'CLOSED', label: 'Closed' },
  ];

  // Tag management
  const handleAddTag = () => {
    const trimmed = currentTag.trim();
    if (trimmed && !requiredCandidateTags.includes(trimmed)) {
      setRequiredCandidateTags([...requiredCandidateTags, trimmed]);
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (index: number) => {
    setRequiredCandidateTags(requiredCandidateTags.filter((_, i) => i !== index));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
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
        ...(requiredCandidateTags.length > 0 && { requiredCandidateTags }),
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
              <Select value={seniorityLevel} onValueChange={(value) => setSeniorityLevel(value as SeniorityLevel)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select seniority level" />
                </SelectTrigger>
                <SelectContent>
                  {seniorityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status - Optional */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(value) => setStatus(value as JobStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

            {/* Required Candidate Tags - Optional */}
            <div className="space-y-2">
              <Label htmlFor="candidateTags">Required Candidate Tags</Label>
              <div className="flex gap-2">
                <Input
                  id="candidateTags"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  placeholder="e.g., backend_engineer"
                />
                <Button
                  type="button"
                  onClick={handleAddTag}
                  variant="outline"
                  size="icon"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Display tags as badges */}
              {requiredCandidateTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {requiredCandidateTags.map((tag, idx) => (
                    <Badge key={idx} variant="secondary" className="gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(idx)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              <p className="text-sm text-muted-foreground">
                Tags to filter candidate matches. Press Enter or click + to add.
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
