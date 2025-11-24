import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getCompanyById, deleteCompany } from '@/companies/company.service';
import { queryKeys } from '@/lib/query-keys';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, ArrowLeft, Pencil, Trash2, Building2, Briefcase, Linkedin, Globe, AlertCircle, AlertTriangle } from 'lucide-react';

export default function CompanyDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Delete dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Fetch company data
  const {
    data: company,
    isLoading,
    error,
  } = useQuery({
    queryKey: queryKeys.companies.detail(id!),
    queryFn: () => getCompanyById(id!),
    enabled: !!id,
  });

  // Delete handler
  const handleDelete = async () => {
    if (!id) return;

    setDeleteError(null);
    setIsDeleting(true);

    try {
      await deleteCompany(id);

      // Invalidate cache
      queryClient.invalidateQueries({ queryKey: queryKeys.companies.lists() });
      queryClient.removeQueries({ queryKey: queryKeys.companies.detail(id) });

      // Navigate to list
      navigate('/companies');
    } catch (err: any) {
      // Error handling
      if (err.response?.status === 403) {
        setDeleteError("You don't have permission to delete this company");
      } else if (err.response?.status === 404) {
        setDeleteError('Company not found or already deleted');
      } else if (err.response?.status === 400) {
        setDeleteError('Invalid request');
      } else if (err.response?.status === 401) {
        setDeleteError('Authentication required');
      } else {
        setDeleteError('Failed to delete company. Please try again.');
      }
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
  if (error || (!isLoading && !company)) {
    return (
      <div className="min-h-full bg-background">
        <div className="container py-8 px-4">
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <p className="text-destructive font-medium">
                {error instanceof Error ? error.message : 'Company not found'}
              </p>
              <Link to="/companies" className="mt-4 inline-block">
                <Button variant="secondary">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Companies
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Safety check (TypeScript requires this)
  if (!company) {
    return null;
  }

  return (
    <div className="min-h-full bg-background">
      <div className="container py-8 px-4 max-w-4xl">
        {/* Header with back button and actions */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/companies')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Companies
          </Button>

          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                  {company.displayName}
                </h1>
                {company.industry && (
                  <div className="flex items-center gap-2 mt-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{company.industry}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/companies/${id}/edit`)}
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
          {/* Company Information Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Company Information</CardTitle>
                {/* Links */}
                {(company.linkedInUrl || company.websiteUrl) && (
                  <div className="flex items-center gap-2">
                    {company.linkedInUrl && (
                      <a
                        href={company.linkedInUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center w-9 h-9 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
                        title="LinkedIn"
                      >
                        <Linkedin className="h-4 w-4" />
                      </a>
                    )}
                    {company.websiteUrl && (
                      <a
                        href={company.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center w-9 h-9 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
                        title="Website"
                      >
                        <Globe className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Name */}
              <div>
                <p className="text-sm font-medium text-muted-foreground">Name</p>
                <p className="text-base">{company.displayName}</p>
              </div>

              {/* Industry */}
              <div>
                <p className="text-sm font-medium text-muted-foreground">Industry</p>
                <p className="text-base">
                  {company.industry || <span className="text-muted-foreground">—</span>}
                </p>
              </div>

              {/* Aliases */}
              {company.aliases.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Aliases</p>
                  <div className="flex flex-wrap gap-2">
                    {company.aliases.map((alias, idx) => (
                      <Badge key={idx} variant="secondary">
                        {alias}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Company</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete <strong>{company.displayName}</strong>?
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
                    Employee experiences will be preserved, but the company reference will be removed.
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
                    Delete Company
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
