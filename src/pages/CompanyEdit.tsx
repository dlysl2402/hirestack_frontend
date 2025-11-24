import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, ArrowLeft, Loader2, Plus, X } from 'lucide-react';
import { getCompanyById, updateCompany } from '@/companies/company.service';
import type { UpdateCompanyData } from '@/companies/company.types';
import { queryKeys } from '@/lib/query-keys';

export default function CompanyEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Form state
  const [displayName, setDisplayName] = useState('');
  const [aliases, setAliases] = useState<string[]>([]);
  const [currentAlias, setCurrentAlias] = useState('');
  const [industry, setIndustry] = useState('');
  const [linkedInUrl, setLinkedInUrl] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch company data
  const { data: company, isLoading } = useQuery({
    queryKey: queryKeys.companies.detail(id!),
    queryFn: () => getCompanyById(id!),
    enabled: !!id,
  });

  // Pre-populate form with existing data
  useEffect(() => {
    if (company) {
      setDisplayName(company.displayName);
      setAliases(company.aliases);
      setIndustry(company.industry || '');
      setLinkedInUrl(company.linkedInUrl || '');
      setWebsiteUrl(company.websiteUrl || '');
    }
  }, [company]);

  // URL validation
  const validateUrl = (url: string): boolean => {
    if (!url) return true; // Optional field
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const linkedInError = linkedInUrl && !validateUrl(linkedInUrl);
  const websiteError = websiteUrl && !validateUrl(websiteUrl);

  // Alias management
  const handleAddAlias = () => {
    const trimmed = currentAlias.trim();
    if (trimmed && !aliases.some(alias => alias.toLowerCase() === trimmed.toLowerCase())) {
      setAliases([...aliases, trimmed]);
      setCurrentAlias('');
    }
  };

  const handleRemoveAlias = (index: number) => {
    setAliases(aliases.filter((_, i) => i !== index));
  };

  const handleAliasKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddAlias();
    }
  };

  // Form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client-side validation
    if (!displayName.trim()) {
      setError('Display name is required');
      return;
    }

    if (displayName.trim().length > 255) {
      setError('Display name must be 255 characters or less');
      return;
    }

    if (linkedInUrl && !validateUrl(linkedInUrl)) {
      setError('Invalid LinkedIn URL format');
      return;
    }

    if (websiteUrl && !validateUrl(websiteUrl)) {
      setError('Invalid website URL format');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: UpdateCompanyData = {
        displayName: displayName.trim(),
        aliases: aliases,
        industry: industry.trim() || null,
        linkedInUrl: linkedInUrl.trim() || null,
        websiteUrl: websiteUrl.trim() || null,
      };

      await updateCompany(id!, payload);

      // Invalidate cache
      queryClient.invalidateQueries({ queryKey: queryKeys.companies.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.companies.detail(id!) });

      // Navigate back to detail page
      navigate(`/companies/${id}`);
    } catch (err: any) {
      // Error handling
      if (err.response?.status === 409) {
        setError('A company with this name or alias already exists');
      } else if (err.response?.status === 400) {
        setError(err.response?.data?.message || 'Invalid input. Please check your entries.');
      } else if (err.response?.status === 403) {
        setError('You do not have permission to edit this company');
      } else if (err.response?.status === 404) {
        setError('Company not found');
      } else if (err.response?.status === 401) {
        setError('You are not authorized to update companies');
      } else {
        setError('Failed to update company. Please try again.');
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

  // Company not found
  if (!company) {
    return (
      <div className="p-8">
        <Card className="border-destructive max-w-2xl">
          <CardContent className="pt-6">
            <p className="text-destructive font-medium">Company not found</p>
            <Button
              variant="secondary"
              onClick={() => navigate('/companies')}
              className="mt-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Companies
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
          onClick={() => navigate(`/companies/${id}`)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Company
        </Button>
        <h1 className="text-2xl font-bold">Edit Company</h1>
        <p className="text-muted-foreground mt-1">
          Update company information
        </p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
          <CardDescription>
            Modify the company details below. All fields are optional.
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

            {/* Display Name - Required */}
            <div className="space-y-2">
              <Label htmlFor="displayName">
                Display Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={255}
                placeholder="e.g., Google LLC"
                required
              />
              <p className="text-sm text-muted-foreground">
                This is how the company will appear throughout the system
              </p>
            </div>

            {/* Aliases - Dynamic tag input */}
            <div className="space-y-2">
              <Label htmlFor="alias">Aliases (Alternative Names)</Label>
              <div className="flex gap-2">
                <Input
                  id="alias"
                  value={currentAlias}
                  onChange={(e) => setCurrentAlias(e.target.value)}
                  onKeyDown={handleAliasKeyDown}
                  placeholder="e.g., Google, Alphabet Inc"
                />
                <Button
                  type="button"
                  onClick={handleAddAlias}
                  variant="outline"
                  size="icon"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Display aliases as badges */}
              {aliases.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {aliases.map((alias, idx) => (
                    <Badge key={idx} variant="secondary" className="gap-1">
                      {alias}
                      <button
                        type="button"
                        onClick={() => handleRemoveAlias(idx)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              <p className="text-sm text-muted-foreground">
                Alternative names for matching. Press Enter or click + to add. Will be saved as
                lowercase.
              </p>
            </div>

            {/* Industry - Optional */}
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Input
                id="industry"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="e.g., Technology, Healthcare, Finance"
              />
              <p className="text-sm text-muted-foreground">
                The industry sector (leave empty to clear)
              </p>
            </div>

            {/* LinkedIn URL - Optional with validation */}
            <div className="space-y-2">
              <Label htmlFor="linkedInUrl">LinkedIn URL</Label>
              <Input
                id="linkedInUrl"
                type="url"
                value={linkedInUrl}
                onChange={(e) => setLinkedInUrl(e.target.value)}
                placeholder="https://linkedin.com/company/..."
                className={linkedInError ? 'border-destructive' : ''}
              />
              {linkedInError && (
                <p className="text-sm text-destructive">
                  Please enter a valid URL starting with http:// or https://
                </p>
              )}
              <p className="text-sm text-muted-foreground">
                Leave empty to clear
              </p>
            </div>

            {/* Website URL - Optional with validation */}
            <div className="space-y-2">
              <Label htmlFor="websiteUrl">Website URL</Label>
              <Input
                id="websiteUrl"
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://example.com"
                className={websiteError ? 'border-destructive' : ''}
              />
              {websiteError && (
                <p className="text-sm text-destructive">
                  Please enter a valid URL starting with http:// or https://
                </p>
              )}
              <p className="text-sm text-muted-foreground">
                Leave empty to clear
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/companies/${id}`)}
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
                  'Update Company'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
