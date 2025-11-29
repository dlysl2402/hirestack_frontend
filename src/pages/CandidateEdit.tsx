import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getCandidateById, updateCandidate } from '@/candidates/candidate.service';
import { useEnums } from '@/config/useEnums';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { SearchableMultiSelect } from '@/components/ui/searchable-multi-select';
import { Plus, X, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';

export default function CandidateEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Fetch enums for dropdowns
  const { data: enums, isLoading: enumsLoading } = useEnums();
  const roleArchetypeOptions = enums?.roleArchetypes ?? [];

  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [emails, setEmails] = useState<string[]>(['']);
  const [phones, setPhones] = useState<string[]>(['']);
  const [roleArchetypes, setRoleArchetypes] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
        const candidate = await getCandidateById(id);

        // Pre-populate form fields
        setFirstName(candidate.firstName);
        setLastName(candidate.lastName);
        setEmails(candidate.email.length > 0 ? candidate.email : ['']);
        setPhones(candidate.phone.length > 0 ? candidate.phone : ['']);
        setRoleArchetypes(candidate.roleArchetypes || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load candidate');
      } finally {
        setLoading(false);
      }
    };

    fetchCandidate();
  }, [id]);

  // Email handlers
  const handleAddEmail = () => {
    setEmails([...emails, '']);
  };

  const handleRemoveEmail = (index: number) => {
    setEmails(emails.filter((_, i) => i !== index));
  };

  const handleEmailChange = (index: number, value: string) => {
    const newEmails = [...emails];
    newEmails[index] = value;
    setEmails(newEmails);
  };

  // Phone handlers
  const handleAddPhone = () => {
    setPhones([...phones, '']);
  };

  const handleRemovePhone = (index: number) => {
    setPhones(phones.filter((_, i) => i !== index));
  };

  const handlePhoneChange = (index: number, value: string) => {
    const newPhones = [...phones];
    newPhones[index] = value;
    setPhones(newPhones);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!id) return;

    // Basic validation
    if (!firstName.trim() || !lastName.trim()) {
      setError('First name and last name are required');
      return;
    }

    setIsSubmitting(true);

    try {
      // Filter out empty emails and phones
      const filteredEmails = emails.filter((email) => email.trim() !== '');
      const filteredPhones = phones.filter((phone) => phone.trim() !== '');

      await updateCandidate(id, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: filteredEmails.length > 0 ? filteredEmails : undefined,
        phone: filteredPhones.length > 0 ? filteredPhones : undefined,
        roleArchetypes: roleArchetypes.length > 0 ? roleArchetypes : undefined,
      });

      // Navigate back to detail page
      navigate(`/candidates/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while updating the candidate');
    } finally {
      setIsSubmitting(false);
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

  if (error && !firstName) {
    return (
      <div className="min-h-full bg-background">
        <div className="container py-8 px-4">
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <p className="text-destructive font-medium">{error}</p>
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
      <div className="container max-w-3xl py-8 px-4">
        <div className="mb-8">
          <Link to={`/candidates/${id}`}>
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Candidate
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Edit Candidate</h1>
          <p className="text-muted-foreground font-medium">
            Update candidate information
          </p>
        </div>

        {error && (
          <Card className="mb-6 border-destructive bg-destructive/10">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                <p className="font-medium">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Candidate Information</CardTitle>
            <CardDescription>Update the candidate's details below</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">
                    First Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="John"
                    disabled={isSubmitting}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">
                    Last Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                    disabled={isSubmitting}
                    required
                  />
                </div>
              </div>

              {/* Email addresses */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Email Addresses</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddEmail}
                    disabled={isSubmitting}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Email
                  </Button>
                </div>
                <div className="space-y-2">
                  {emails.map((email, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => handleEmailChange(index, e.target.value)}
                        placeholder="john.doe@example.com"
                        disabled={isSubmitting}
                      />
                      {emails.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveEmail(index)}
                          disabled={isSubmitting}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Phone numbers */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Phone Numbers</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddPhone}
                    disabled={isSubmitting}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Phone
                  </Button>
                </div>
                <div className="space-y-2">
                  {phones.map((phone, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        type="tel"
                        value={phone}
                        onChange={(e) => handlePhoneChange(index, e.target.value)}
                        placeholder="+1 (555) 123-4567"
                        disabled={isSubmitting}
                      />
                      {phones.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemovePhone(index)}
                          disabled={isSubmitting}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Role Archetypes */}
              <div className="space-y-2">
                <Label htmlFor="roleArchetypes">Role Archetypes</Label>
                {enumsLoading ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading options...
                  </div>
                ) : (
                  <SearchableMultiSelect
                    options={roleArchetypeOptions}
                    values={roleArchetypes}
                    onValuesChange={setRoleArchetypes}
                    placeholder="Search role archetypes..."
                    searchPlaceholder="Type to search..."
                    emptyMessage="No role archetypes found."
                    disabled={isSubmitting}
                  />
                )}
              </div>

              {/* Submit buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/candidates/${id}`)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
