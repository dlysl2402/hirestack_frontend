import { useState } from 'react';
import { Link } from 'react-router-dom';
import { importLinkedInProfiles } from '@/candidates/candidate.service';
import type { LinkedInImportResults } from '@/candidates/candidate.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Loader2, Upload, CheckCircle, AlertTriangle, AlertCircle, ExternalLink } from 'lucide-react';

export default function CandidateImport() {
  const [linkedInUrls, setLinkedInUrls] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importResults, setImportResults] = useState<LinkedInImportResults | null>(null);

  const urlCount = linkedInUrls
    .split('\n')
    .filter((url) => url.trim().length > 0).length;

  const handleImport = async () => {
    setIsLoading(true);
    setError(null);
    setImportResults(null);

    try {
      // Split URLs by newline and filter empty lines
      const urls = linkedInUrls
        .split('\n')
        .map((url) => url.trim())
        .filter((url) => url.length > 0);

      if (urls.length === 0) {
        setError('Please enter at least one LinkedIn URL');
        setIsLoading(false);
        return;
      }

      if (urls.length > 100) {
        setError('Maximum 100 URLs per import. Please split into smaller batches.');
        setIsLoading(false);
        return;
      }

      const results = await importLinkedInProfiles(urls);
      setImportResults(results);

      // Clear textarea on success
      setLinkedInUrls('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during import');
    } finally {
      setIsLoading(false);
    }
  };

  const successCount = importResults?.success.length || 0;
  const skippedCount = importResults?.skipped.length || 0;
  const failedCount = importResults?.failed.length || 0;

  return (
    <div className="min-h-full bg-background">
      <div className="container max-w-5xl py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Import from LinkedIn</h1>
          <p className="text-muted-foreground font-medium">
            Bulk import candidate profiles from LinkedIn URLs
          </p>
        </div>

        <div className="grid gap-6">
          {/* Import Form */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>LinkedIn Profile URLs</CardTitle>
              <CardDescription>
                Enter LinkedIn profile URLs (one per line, max 100 URLs)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="linkedInUrls">URLs</Label>
                <Textarea
                  id="linkedInUrls"
                  placeholder="https://www.linkedin.com/in/example-profile&#10;https://www.linkedin.com/in/another-profile"
                  value={linkedInUrls}
                  onChange={(e) => setLinkedInUrls(e.target.value)}
                  rows={12}
                  className="font-mono text-sm"
                  disabled={isLoading}
                />
                <p className="text-sm text-muted-foreground">
                  {urlCount} profile{urlCount !== 1 ? 's' : ''} ready to import
                </p>
              </div>

              {error && (
                <div className="rounded-md border border-destructive bg-destructive/10 p-4">
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertCircle className="h-5 w-5" />
                    <p className="font-medium">{error}</p>
                  </div>
                </div>
              )}

              <Button onClick={handleImport} disabled={isLoading || urlCount === 0} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Importing {urlCount} profile{urlCount !== 1 ? 's' : ''}...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Import Profiles
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Import Results */}
          {importResults && (
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Import Results</CardTitle>
                <CardDescription>
                  Summary of the import operation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Summary */}
                <div className="flex gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">
                      <span className="font-semibold text-green-600">{successCount}</span> imported successfully
                    </span>
                  </div>
                  {skippedCount > 0 && (
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-blue-600" />
                      <span className="text-sm">
                        <span className="font-semibold text-blue-600">{skippedCount}</span> skipped
                      </span>
                    </div>
                  )}
                  {failedCount > 0 && (
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <span className="text-sm">
                        <span className="font-semibold text-red-600">{failedCount}</span> failed
                      </span>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Successful Imports */}
                {successCount > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-green-600 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Successfully Imported ({successCount})
                    </h3>
                    <div className="space-y-2">
                      {importResults.success.map((result) => (
                        <div
                          key={result.candidateId}
                          className="p-4 border rounded-lg bg-green-50 border-green-200"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                                <Link
                                  to={`/candidates/${result.candidateId}`}
                                  className="font-semibold text-foreground hover:underline"
                                >
                                  {result.firstName} {result.lastName}
                                </Link>
                                <Badge className="bg-green-600 hover:bg-green-700">Created</Badge>
                              </div>
                              {result.currentTitle && (
                                <p className="text-sm text-muted-foreground">
                                  {result.currentTitle}
                                  {result.currentCompanyName && ` at ${result.currentCompanyName}`}
                                </p>
                              )}
                              <a
                                href={result.linkedinUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1"
                              >
                                {result.linkedinUrl}
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skipped Imports */}
                {skippedCount > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-blue-600 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Skipped ({skippedCount})
                    </h3>
                    <div className="space-y-2">
                      {importResults.skipped.map((result, index) => (
                        <div
                          key={index}
                          className="p-4 border rounded-lg bg-blue-50 border-blue-200"
                        >
                          <div className="flex items-start gap-3">
                            <AlertTriangle className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge className="bg-blue-100 text-blue-800 border-blue-300">Skipped</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-1">{result.reason}</p>
                              <a
                                href={result.linkedinUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:underline flex items-center gap-1 break-all"
                              >
                                {result.linkedinUrl}
                                <ExternalLink className="h-3 w-3 flex-shrink-0" />
                              </a>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Failed Imports */}
                {failedCount > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-red-600 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Failed ({failedCount})
                    </h3>
                    <div className="space-y-2">
                      {importResults.failed.map((result, index) => (
                        <div
                          key={index}
                          className="p-4 border rounded-lg bg-red-50 border-red-200"
                        >
                          <div className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge className="bg-red-100 text-red-800 border-red-300">Error</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-1">{result.reason}</p>
                              <a
                                href={result.linkedinUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:underline flex items-center gap-1 break-all"
                              >
                                {result.linkedinUrl}
                                <ExternalLink className="h-3 w-3 flex-shrink-0" />
                              </a>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
