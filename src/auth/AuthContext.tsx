import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from './auth.service';
import { tokenStorage } from './tokenStorage';
import type { User, LoginCredentials, RegisterData, Organization } from './auth.types';

interface AuthContextType {
  user: User | null;
  organization: Organization | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Initialize auth on mount
   * Try to restore session using refresh token
   */
  useEffect(() => {
    const initAuth = async () => {
      const refreshToken = tokenStorage.getRefreshToken();

      if (!refreshToken) {
        setLoading(false);
        return;
      }

      try {
        // Try to get new access token using refresh token
        const tokens = await authService.refresh(refreshToken);

        // Store new tokens (backend implements rotation)
        tokenStorage.setTokens(tokens.accessToken, tokens.refreshToken);

        // Parse user data from JWT
        // Note: JWT only has partial user data, but it's enough for session
        // Full user data can be fetched separately if needed
        const userData = {
          id: '',
          email: '',
          name: '',
          role: 'RECRUITER' as const,
          organizationId: '',
          lastLogin: null,
          createdAt: '',
          updatedAt: '',
        };

        // For now, we'll need to decode the JWT to get user info
        // In a production app, you might want to fetch full user details
        setUser(userData);

        // We don't have organization in refresh response
        // Will need to fetch it separately or include in JWT
      } catch (error) {
        // Refresh failed - clear invalid tokens
        tokenStorage.clearTokens();
        console.error('Failed to restore session:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  /**
   * Login user
   */
  const login = async (credentials: LoginCredentials) => {
    const response = await authService.login(credentials);

    // Store tokens
    tokenStorage.setTokens(response.accessToken, response.refreshToken);

    // Set user and organization from response
    setUser(response.user);
    setOrganization(response.organization);
  };

  /**
   * Register new user
   */
  const register = async (data: RegisterData) => {
    const response = await authService.register(data);

    // Store tokens
    tokenStorage.setTokens(response.accessToken, response.refreshToken);

    // Set user and organization from response
    setUser(response.user);
    setOrganization(response.organization);
  };

  /**
   * Logout user
   */
  const logout = async () => {
    const refreshToken = tokenStorage.getRefreshToken();

    // Clear tokens locally first (immediate logout)
    tokenStorage.clearTokens();
    setUser(null);
    setOrganization(null);

    // Try to invalidate refresh token on backend (best effort)
    if (refreshToken) {
      try {
        await authService.logout({ refreshToken });
      } catch (error) {
        // Ignore logout errors - already logged out locally
        console.error('Backend logout failed:', error);
      }
    }
  };

  const value: AuthContextType = {
    user,
    organization,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to access auth context
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
