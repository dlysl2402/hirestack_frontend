/**
 * Token storage abstraction layer
 *
 * Strategy:
 * - Access token: sessionStorage (survives refresh, cleared on browser close)
 * - Refresh token: localStorage (persists across sessions)
 *
 * Benefits:
 * - XSS mitigation (shorter-lived access token exposure)
 * - Easy to swap storage implementation
 * - Centralized storage logic
 */

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

export const tokenStorage = {
  /**
   * Get access token from session storage
   */
  getAccessToken(): string | null {
    return sessionStorage.getItem(ACCESS_TOKEN_KEY);
  },

  /**
   * Store access token in session storage
   */
  setAccessToken(token: string): void {
    sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
  },

  /**
   * Remove access token from session storage
   */
  removeAccessToken(): void {
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  },

  /**
   * Get refresh token from local storage
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  /**
   * Store refresh token in local storage
   */
  setRefreshToken(token: string): void {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  },

  /**
   * Remove refresh token from local storage
   */
  removeRefreshToken(): void {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },

  /**
   * Clear all tokens (logout)
   */
  clearTokens(): void {
    this.removeAccessToken();
    this.removeRefreshToken();
  },

  /**
   * Store both tokens (login/register)
   */
  setTokens(accessToken: string, refreshToken: string): void {
    this.setAccessToken(accessToken);
    this.setRefreshToken(refreshToken);
  },
};
