import { tokenStorage } from '@/auth/tokenStorage';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

/**
 * Basic API request without authentication
 * Use for public endpoints only (login, register)
 */
export async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    // Enhanced error messages
    if (response.status === 403) {
      throw new Error(errorData.message || 'You do not have permission to perform this action');
    }

    if (response.status === 404) {
      throw new Error(errorData.message || 'Resource not found');
    }

    throw new Error(errorData.message || `API Error: ${response.status} ${response.statusText}`);
  }

  // Handle 204 No Content (no body to parse)
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

/**
 * Flag to prevent multiple simultaneous refresh attempts
 */
let isRefreshing = false;
let refreshPromise: Promise<void> | null = null;

/**
 * Check if token is expired or close to expiry
 */
function shouldRefreshToken(token: string | null): boolean {
  if (!token) return false;

  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64));
    const exp = payload.exp;
    const now = Math.floor(Date.now() / 1000);

    // Refresh if less than 2 minutes remaining (120 seconds buffer)
    return exp - now < 120;
  } catch {
    return false;
  }
}

/**
 * Refresh access token using refresh token
 */
async function refreshAccessToken(): Promise<void> {
  const refreshToken = tokenStorage.getRefreshToken();

  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    // Refresh failed - clear tokens and throw
    tokenStorage.clearTokens();
    throw new Error('Token refresh failed');
  }

  const data = await response.json();

  // Store new tokens (backend implements rotation)
  tokenStorage.setTokens(data.accessToken, data.refreshToken);
}

/**
 * Authenticated API request with automatic token refresh
 * Use for all protected endpoints
 */
export async function authenticatedRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const makeRequest = async (accessToken: string | null): Promise<Response> => {
    const url = `${API_BASE_URL}${endpoint}`;

    // Check if body is FormData (file upload)
    const isFormData = options?.body instanceof FormData;

    const headers: Record<string, string> = {
      // Only set Content-Type for JSON requests
      // For FormData, browser sets correct multipart boundary automatically
      ...(!isFormData && { 'Content-Type': 'application/json' }),
      ...(options?.headers as Record<string, string>),
    };

    // Add Authorization header if token exists
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    return fetch(url, {
      ...options,
      headers,
    });
  };

  // Try request with current access token
  let accessToken = tokenStorage.getAccessToken();

  // Proactive refresh: check if token is close to expiry
  if (shouldRefreshToken(accessToken)) {
    if (isRefreshing) {
      // Wait for ongoing refresh
      await refreshPromise;
    } else {
      // Start proactive refresh
      isRefreshing = true;
      refreshPromise = refreshAccessToken()
        .finally(() => {
          isRefreshing = false;
          refreshPromise = null;
        });

      try {
        await refreshPromise;
        accessToken = tokenStorage.getAccessToken();
      } catch (error) {
        // Proactive refresh failed - continue with old token
        // Will be caught by 401 handler below
        console.warn('Proactive token refresh failed:', error);
      }
    }
  }

  let response = await makeRequest(accessToken);

  // If 401, try to refresh token and retry (fallback)
  if (response.status === 401) {
    // Prevent multiple simultaneous refresh attempts
    if (isRefreshing) {
      // Wait for ongoing refresh to complete
      await refreshPromise;
    } else {
      // Start new refresh
      isRefreshing = true;
      refreshPromise = refreshAccessToken()
        .finally(() => {
          isRefreshing = false;
          refreshPromise = null;
        });

      try {
        await refreshPromise;
      } catch (error) {
        // Refresh failed - redirect to login
        window.location.href = '/auth/login';
        throw error;
      }
    }

    // Retry original request with new token
    accessToken = tokenStorage.getAccessToken();
    response = await makeRequest(accessToken);
  }

  // Handle response
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    // Enhanced error messages for multi-tenant scenarios
    if (response.status === 403) {
      throw new Error(errorData.message || 'You do not have permission to perform this action');
    }

    if (response.status === 404) {
      throw new Error(errorData.message || 'Resource not found');
    }

    throw new Error(errorData.message || `API Error: ${response.status} ${response.statusText}`);
  }

  // Handle 204 No Content (no body to parse)
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}
