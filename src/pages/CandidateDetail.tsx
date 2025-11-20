import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getCandidateById, deleteCandidate } from '@/candidates/candidate.service';
import type { Candidate } from '@/candidates/candidate.types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, Pencil, Trash2 } from 'lucide-react';

export default function CandidateDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCandidate = async () => {
      if (!id) {
        setError('No candidate ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await getCandidateById(id);
        setCandidate(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load candidate');
      } finally {
        setLoading(false);
      }
    };

    fetchCandidate();
  }, [id]);

  const handleDelete = async () => {
    if (!id || !candidate) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete ${candidate.firstName} ${candidate.lastName}? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setDeleting(true);
      await deleteCandidate(id);
      navigate('/candidates');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete candidate');
      setDeleting(false);
    }
  };

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

  if (error || !candidate) {
    return (
      <div className="min-h-full bg-background">
        <div className="container py-8 px-4">
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <p className="text-destructive font-medium">{error || 'Candidate not found'}</p>
              <Link to="/candidates" className="mt-4 inline-block">
                <Button variant="secondary">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Candidates
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-background">
      <div className="container max-w-4xl py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <Link to="/candidates">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Candidates
            </Button>
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                {candidate.firstName} {candidate.lastName}
              </h1>
              <p className="text-muted-foreground font-medium">
                Added {new Date(candidate.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-3">
              <Link to={`/candidates/${id}/edit`}>
                <Button variant="secondary" size="default">
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </Link>
              <Button
                variant="destructive"
                size="default"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <Card className="shadow-md">
          <CardContent className="pt-6 space-y-6">
            {/* Emails */}
            {candidate.email.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Email
                </div>
                <div className="space-y-1">
                  {candidate.email.map((email, index) => (
                    <div key={index}>
                      <a
                        href={`mailto:${email}`}
                        className="text-sm hover:underline text-foreground"
                      >
                        {email}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Phones */}
            {candidate.phone.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Phone
                </div>
                <div className="space-y-1">
                  {candidate.phone.map((phone, index) => (
                    <div key={index}>
                      <a
                        href={`tel:${phone}`}
                        className="text-sm hover:underline text-foreground"
                      >
                        {phone}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Job Function Tags */}
            {candidate.jobFunctionTags.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Job Functions
                </div>
                <div className="flex flex-wrap gap-2">
                  {candidate.jobFunctionTags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {candidate.email.length === 0 && candidate.phone.length === 0 && candidate.jobFunctionTags.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No contact information or job functions specified
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
