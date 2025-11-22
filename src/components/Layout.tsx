import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/auth/AuthContext';
import { usePrefetchManager } from '@/hooks/usePrefetchManager';
import { AppSidebar } from './AppSidebar';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, organization, logout } = useAuth();
  const navigate = useNavigate();
  const { prefetchOnAppLoad } = usePrefetchManager();

  // Prefetch frequently accessed data on mount
  useEffect(() => {
    prefetchOnAppLoad();
  }, [prefetchOnAppLoad]);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      navigate('/auth/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, [logout, navigate]);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar
        onLogout={handleLogout}
        userName={user?.name}
        organizationName={organization?.name}
      />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
