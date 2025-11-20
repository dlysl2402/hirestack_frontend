import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function Dashboard() {
  const { user, organization, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/auth/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header with more contrast */}
      <div className="border-b bg-card shadow-sm">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-foreground">HireStack</h1>
            <Separator orientation="vertical" className="h-6" />
            <span className="text-sm font-medium text-muted-foreground">{organization?.name}</span>
          </div>
          <Button variant="outline" onClick={handleLogout} className="font-medium">
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome back, {user?.name}!</h1>
          <p className="text-muted-foreground font-medium">
            Here's what's happening with your recruitment today.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* User Info Card */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-foreground">Your Profile</CardTitle>
              <CardDescription>Your account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-sm font-semibold text-muted-foreground">Name</div>
                <div className="text-sm text-foreground font-medium">{user?.name || 'N/A'}</div>
              </div>
              <div>
                <div className="text-sm font-semibold text-muted-foreground">Email</div>
                <div className="text-sm text-foreground font-medium">{user?.email || 'N/A'}</div>
              </div>
              <div>
                <div className="text-sm font-semibold text-muted-foreground">Role</div>
                <div className="text-sm">
                  <span className="inline-flex items-center rounded-md bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground">
                    {user?.role || 'N/A'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Organization Card */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-foreground">Organization</CardTitle>
              <CardDescription>Your organization details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-sm font-semibold text-muted-foreground">Name</div>
                <div className="text-sm text-foreground font-medium">{organization?.name || 'N/A'}</div>
              </div>
              <div>
                <div className="text-sm font-semibold text-muted-foreground">Slug</div>
                <div className="text-sm font-mono text-xs text-foreground font-medium">{organization?.slug || 'N/A'}</div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats Card */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-foreground">Quick Stats</CardTitle>
              <CardDescription>Coming soon</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground font-medium">
                Candidate and job statistics will appear here once you start using the system.
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Getting Started Card */}
        <Card className="mt-6 shadow-md border-primary/20">
          <CardHeader>
            <CardTitle className="text-foreground">🎉 Authentication System Ready!</CardTitle>
            <CardDescription>
              Your HireStack frontend is fully set up with authentication
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground font-medium">
                You're now logged in with a fully functional JWT-based authentication system including:
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">✓</span>
                  <span className="text-foreground font-medium">Token storage (access token in sessionStorage, refresh token in localStorage)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">✓</span>
                  <span className="text-foreground font-medium">Automatic token refresh (proactive and fallback)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">✓</span>
                  <span className="text-foreground font-medium">Protected routes with loading states</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">✓</span>
                  <span className="text-foreground font-medium">Multi-tenant support (organization context)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">✓</span>
                  <span className="text-foreground font-medium">Beautiful UI with high-contrast design</span>
                </li>
              </ul>
              <Separator />
              <div className="rounded-lg bg-muted/50 p-4 border border-border">
                <p className="text-sm font-semibold text-foreground">Next Steps:</p>
                <p className="mt-2 text-sm text-muted-foreground font-medium">
                  Ready to add candidate management, job postings, and more features to your ATS.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
