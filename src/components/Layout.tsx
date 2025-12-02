import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/auth/AuthContext';
import { AppSidebar } from './AppSidebar';

const SIDEBAR_COLLAPSED_KEY = 'sidebar-collapsed';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, organization, logout } = useAuth();
  const navigate = useNavigate();

  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true';
  });

  const toggleCollapse = useCallback(() => {
    setIsCollapsed((prev) => {
      const newValue = !prev;
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(newValue));
      return newValue;
    });
  }, []);

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
        isCollapsed={isCollapsed}
        onToggleCollapse={toggleCollapse}
      />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
