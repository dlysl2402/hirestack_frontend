import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getCompanyById } from '@/companies/company.service';
import { queryKeys } from '@/lib/query-keys';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, Pencil, Trash2, Building2, Briefcase, Linkedin, Globe } from 'lucide-react';

export default function CompanyDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

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
              <Button variant="outline" size="sm" disabled title="Coming soon">
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button variant="outline" size="sm" disabled title="Coming soon">
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
      </div>
    </div>
  );
}
