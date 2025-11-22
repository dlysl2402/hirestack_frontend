import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, ArrowLeft, Loader2, Plus, X } from 'lucide-react';
import { createCompany } from '@/companies/company.service';
import type { CreateCompanyData } from '@/companies/company.types';
import { queryKeys } from '@/lib/query-keys';

export default function CompanyCreate() {
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
      const payload: CreateCompanyData = {
        displayName: displayName.trim(),
        ...(aliases.length > 0 && { aliases }),
        ...(industry.trim() && { industry: industry.trim() }),
        ...(linkedInUrl.trim() && { linkedInUrl: linkedInUrl.trim() }),
        ...(websiteUrl.trim() && { websiteUrl: websiteUrl.trim() }),
      };

      await createCompany(payload);

      // Invalidate companies list cache
      queryClient.invalidateQueries({ queryKey: queryKeys.companies.lists() });

      // Navigate to list
      navigate('/companies');
    } catch (err: any) {
      // Error handling
      if (err.response?.status === 409) {
        setError('A company with this name or alias already exists');
      } else if (err.response?.status === 400) {
        setError(err.response?.data?.message || 'Invalid input. Please check your entries.');
      } else if (err.response?.status === 401) {
        setError('You are not authorized to create companies');
      } else {
        setError('Failed to create company. Please try again.');
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
          onClick={() => navigate('/companies')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Companies
        </Button>
        <h1 className="text-2xl font-bold">Create Company</h1>
        <p className="text-muted-foreground mt-1">
          Add a new company to your organization
        </p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
          <CardDescription>
            Enter the company details below. Only the display name is required.
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
              <p className="text-sm text-muted-foreground">The industry sector</p>
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
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/companies')}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Company'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
