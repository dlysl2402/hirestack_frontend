import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { authService, parseJWT, isTokenExpired, isTokenCloseToExpiry } from './auth.service';
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
  const initRef = useRef(false);

  /**
   * Background token refresh (proactive)
   * Silently refreshes tokens before they expire
   */
  const refreshInBackground = useCallback(async () => {
    const refreshToken = tokenStorage.getRefreshToken();
    if (!refreshToken) return;

    try {
      const tokens = await authService.refresh(refreshToken);
      tokenStorage.setTokens(tokens.accessToken, tokens.refreshToken);
      // Silently update tokens - no state changes needed
    } catch (error) {
      // Background refresh failed - not critical, will be handled on next API call
      console.warn('Background token refresh failed:', error);
    }
  }, []);

  /**
   * Initialize auth on mount
   * Hybrid approach: Fast path (use access token) vs Slow path (refresh token)
   * Uses ref to prevent duplicate initialization in StrictMode
   */
  useEffect(() => {
    // Prevent duplicate initialization (important for StrictMode)
    if (initRef.current) {
      return;
    }
    initRef.current = true;

    const initAuth = async () => {
      // PHASE 1: Try fast path - use existing access token if valid
      const accessToken = tokenStorage.getAccessToken();

      if (accessToken && !isTokenExpired(accessToken)) {
        // Fast restore - no API call needed
        try {
          const userData = parseJWT(accessToken);
          const cachedOrg = tokenStorage.getOrganization();

          setUser(userData);
          setOrganization(cachedOrg);
          setLoading(false);

          // Proactive refresh if token is close to expiry (< 5 minutes)
          if (isTokenCloseToExpiry(accessToken)) {
            refreshInBackground();
          }

          return; // Exit early - restoration complete
        } catch (error) {
          // Invalid token, fall through to slow path
          console.warn('Fast path failed, falling back to refresh:', error);
        }
      }

      // PHASE 2: Slow path - refresh token required
      const refreshToken = tokenStorage.getRefreshToken();

      if (!refreshToken) {
        setLoading(false);
        return;
      }

      try {
        // Get new access token using refresh token
        const tokens = await authService.refresh(refreshToken);

        // Store new tokens (backend implements rotation)
        tokenStorage.setTokens(tokens.accessToken, tokens.refreshToken);

        // Decode JWT to extract user data
        const userData = parseJWT(tokens.accessToken);
        const cachedOrg = tokenStorage.getOrganization();

        setUser(userData);
        setOrganization(cachedOrg);
      } catch (error) {
        // Refresh failed - clear invalid tokens
        tokenStorage.clearTokens();
        console.error('Failed to restore session:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [refreshInBackground]);

  /**
   * Login user
   */
  const login = async (credentials: LoginCredentials) => {
    const response = await authService.login(credentials);

    // Store tokens
    tokenStorage.setTokens(response.accessToken, response.refreshToken);

    // Store organization to localStorage for persistence
    tokenStorage.setOrganization(response.organization);

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

    // Store organization to localStorage for persistence
    tokenStorage.setOrganization(response.organization);

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
