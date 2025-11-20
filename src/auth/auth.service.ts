import { apiRequest } from '@/lib/api';
import type {
  AuthResponse,
  LoginCredentials,
  RegisterData,
  RefreshResponse,
  LogoutRequest,
  User,
  JWTPayload,
} from './auth.types';

/**
 * Parse JWT payload without validation
 * Only used to extract user data from access token
 */
export function parseJWT(token: string): User {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    const payload: JWTPayload = JSON.parse(jsonPayload);

    return {
      id: payload.userId,
      email: payload.email,
      role: payload.role,
      organizationId: payload.organizationId,
      name: '', // Not in JWT, will be populated from auth response
      lastLogin: null, // Not in JWT
      createdAt: '', // Not in JWT
      updatedAt: '', // Not in JWT
    };
  } catch (error) {
    throw new Error('Invalid JWT token');
  }
}

/**
 * Check if JWT is expired
 */
export function isTokenExpired(token: string): boolean {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    const payload: JWTPayload = JSON.parse(jsonPayload);
    const currentTime = Math.floor(Date.now() / 1000);

    return payload.exp < currentTime;
  } catch (error) {
    return true; // Treat invalid tokens as expired
  }
}

/**
 * Auth service - API calls for authentication
 */
export const authService = {
  /**
   * Register new user
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    return apiRequest<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return apiRequest<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  /**
   * Refresh access token
   */
  async refresh(refreshToken: string): Promise<RefreshResponse> {
    return apiRequest<RefreshResponse>('/api/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  },

  /**
   * Logout user (invalidate refresh token)
   */
  async logout(data: LogoutRequest): Promise<{ message: string }> {
    return apiRequest<{ message: string }>('/api/auth/logout', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
