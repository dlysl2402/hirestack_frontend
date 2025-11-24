import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getJobById } from '@/jobs/job.service';
import { getCompanyById } from '@/companies/company.service';
import type { JobStatus, SeniorityLevel } from '@/jobs/job.types';
import { queryKeys } from '@/lib/query-keys';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, ArrowLeft, Pencil, Trash2, Briefcase, MapPin, Clock, AlertCircle, AlertTriangle } from 'lucide-react';

// Utility to format date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
};

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

export default function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Delete dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Fetch job data
  const {
    data: job,
    isLoading,
    error,
  } = useQuery({
    queryKey: queryKeys.jobs.detail(id!),
    queryFn: () => getJobById(id!),
    enabled: !!id,
  });

  // Fetch company data (conditional on job companyId)
  const { data: company, isLoading: companyLoading } = useQuery({
    queryKey: queryKeys.companies.detail(job?.companyId || ''),
    queryFn: () => getCompanyById(job!.companyId),
    enabled: !!job?.companyId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Delete handler (skeleton for future implementation)
  const handleDelete = async () => {
    if (!id) return;

    setDeleteError(null);
    setIsDeleting(true);

    try {
      // TODO: Implement DELETE /api/jobs/:id in next phase
      console.log('Delete functionality coming soon for job:', id);

      // Placeholder for future implementation:
      // await deleteJob(id);
      // queryClient.invalidateQueries({ queryKey: queryKeys.jobs.lists() });
      // queryClient.removeQueries({ queryKey: queryKeys.jobs.detail(id) });
      // navigate('/jobs');

      setDeleteError('Delete functionality will be implemented in the next phase');
    } catch (err: any) {
      setDeleteError('Failed to delete job. Please try again.');
    } finally {
      setIsDeleting(false);
    }
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
  if (error || (!isLoading && !job)) {
    return (
      <div className="min-h-full bg-background">
        <div className="container py-8 px-4">
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <p className="text-destructive font-medium">
                {error instanceof Error ? error.message : 'Job not found'}
              </p>
              <Link to="/jobs" className="mt-4 inline-block">
                <Button variant="secondary">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Jobs
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Safety check (TypeScript requires this)
  if (!job) {
    return null;
  }

  return (
    <div className="min-h-full bg-background">
      <div className="container py-8 px-4 max-w-4xl">
        {/* Header with back button and actions */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/jobs')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Jobs
          </Button>

          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Briefcase className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                  {job.title}
                </h1>
                <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                  <span>{job.department}</span>
                  <span>·</span>
                  <span>{job.location}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/jobs/${id}/edit`)}
              >
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Job Overview Card */}
          <Card>
            <CardHeader>
              <CardTitle>Job Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Status */}
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <div className="mt-1">
                  <StatusBadge status={job.status} />
                </div>
              </div>

              {/* Seniority */}
              <div>
                <p className="text-sm font-medium text-muted-foreground">Seniority</p>
                <div className="mt-1">
                  <SeniorityBadge level={job.seniorityLevel} />
                </div>
              </div>

              {/* Company */}
              <div>
                <p className="text-sm font-medium text-muted-foreground">Company</p>
                <p className="text-base">
                  {companyLoading ? (
                    <span className="text-muted-foreground">Loading...</span>
                  ) : company ? (
                    <Link to={`/companies/${job.companyId}`} className="text-primary hover:underline">
                      {company.displayName}
                    </Link>
                  ) : (
                    <span className="text-muted-foreground">Unknown Company</span>
                  )}
                </p>
              </div>

              {/* Department */}
              <div>
                <p className="text-sm font-medium text-muted-foreground">Department</p>
                <p className="text-base">{job.department}</p>
              </div>

              {/* Location */}
              <div>
                <p className="text-sm font-medium text-muted-foreground">Location</p>
                <p className="text-base flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  {job.location}
                </p>
              </div>

              {/* Created */}
              <div>
                <p className="text-sm font-medium text-muted-foreground">Created</p>
                <p className="text-base flex items-center gap-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  {formatDate(job.createdAt)}
                </p>
              </div>

              {/* Last Updated */}
              <div>
                <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                <p className="text-base flex items-center gap-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  {formatDate(job.updatedAt)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Job Details Card */}
          <Card>
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Responsibilities */}
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Responsibilities</p>
                <p className="text-base whitespace-pre-wrap">{job.responsibilities}</p>
              </div>

              {/* Required Skills */}
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Required Skills</p>
                <p className="text-base whitespace-pre-wrap">{job.requiredSkills}</p>
              </div>

              {/* Preferred Skills */}
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Preferred Skills</p>
                <p className="text-base whitespace-pre-wrap">
                  {job.preferredSkills || <span className="text-muted-foreground">—</span>}
                </p>
              </div>

              {/* Team Description */}
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Team Description</p>
                <p className="text-base whitespace-pre-wrap">
                  {job.teamDescription || <span className="text-muted-foreground">—</span>}
                </p>
              </div>

              {/* Required Candidate Tags */}
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Required Candidate Tags</p>
                {job.requiredCandidateTags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {job.requiredCandidateTags.map((tag, idx) => (
                      <Badge key={idx} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <span className="text-muted-foreground">No tags specified</span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Job</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete <strong>{job.title}</strong>?
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Warning */}
              <div className="flex items-start gap-3 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-destructive">
                    This action is permanent and cannot be undone
                  </p>
                </div>
              </div>

              {/* Info */}
              <div className="flex items-start gap-3 p-3 bg-muted rounded-md">
                <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Associated applications and candidates will be preserved, but the job reference will be removed.
                  </p>
                </div>
              </div>

              {/* Error display */}
              {deleteError && (
                <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive rounded-md">
                  <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                  <p className="text-sm font-medium text-destructive">{deleteError}</p>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsDeleteDialogOpen(false);
                  setDeleteError(null);
                }}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Job
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
