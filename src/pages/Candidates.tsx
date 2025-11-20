import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllCandidates } from '@/candidates/candidate.service';
import type { Candidate } from '@/candidates/candidate.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Loader2, Plus, Upload } from 'lucide-react';

export default function Candidates() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        setLoading(true);
        const data = await getAllCandidates();
        setCandidates(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load candidates');
      } finally {
        setLoading(false);
      }
    };

    fetchCandidates();
  }, []);

  if (loading) {
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

  if (error) {
    return (
      <div className="min-h-full bg-background">
        <div className="container py-8 px-4">
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <p className="text-destructive font-medium">{error}</p>
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
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Candidates</h1>
            <p className="text-muted-foreground font-medium">
              {candidates.length} {candidates.length === 1 ? 'candidate' : 'candidates'} in your organization
            </p>
          </div>
          <div className="flex gap-3">
            <Link to="/candidates/import">
              <Button variant="secondary" size="default">
                <Upload className="h-4 w-4 mr-2" />
                Import from LinkedIn
              </Button>
            </Link>
            <Link to="/candidates/create">
              <Button size="default">
                <Plus className="h-4 w-4 mr-2" />
                Create Candidate
              </Button>
            </Link>
          </div>
        </div>

        {/* Empty State */}
        {candidates.length === 0 ? (
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>No candidates yet</CardTitle>
              <CardDescription>
                Get started by creating your first candidate or importing from LinkedIn
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Link to="/candidates/create">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Candidate
                  </Button>
                </Link>
                <Link to="/candidates/import">
                  <Button variant="secondary">
                    <Upload className="h-4 w-4 mr-2" />
                    Import from LinkedIn
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Table View */
          <Card className="shadow-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Job Functions</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {candidates.map((candidate) => (
                  <TableRow key={candidate.id}>
                    <TableCell className="font-medium">
                      {candidate.firstName} {candidate.lastName}
                    </TableCell>
                    <TableCell>
                      {candidate.email.length > 0 ? (
                        <div className="flex flex-col gap-1">
                          {candidate.email.map((email, index) => (
                            <span key={index} className="text-sm">
                              {email}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {candidate.phone.length > 0 ? (
                        <div className="flex flex-col gap-1">
                          {candidate.phone.map((phone, index) => (
                            <span key={index} className="text-sm">
                              {phone}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {candidate.jobFunctionTags.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {candidate.jobFunctionTags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link to={`/candidates/${candidate.id}`}>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>
    </div>
  );
}
