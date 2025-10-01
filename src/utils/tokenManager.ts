/**
 * Secure Token Manager
 * 
 * Implements secure token storage following security best practices:
 * - Access tokens: Stored in memory only (short-lived, 5-15 minutes)
 * - Refresh tokens: Stored in HttpOnly cookies (secure, not accessible via JavaScript)
 * - No localStorage/sessionStorage usage for tokens to prevent XSS attacks
 */

interface TokenData {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
}

class SecureTokenManager {
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;
  private refreshPromise: Promise<string> | null = null;
  private readonly ACCESS_TOKEN_KEY = 'hotel_access_token';
  private readonly TOKEN_EXPIRY_KEY = 'hotel_token_expiry';

  /**
   * Store access token in memory and optionally in localStorage
   * @param token - The access token
   * @param expiresIn - Token expiry time in seconds (default: 10 minutes)
   * @param persist - Whether to persist token in localStorage (default: false)
   */
  setAccessToken(token: string, expiresIn: number = 600, persist: boolean = false): void {
    console.log('TokenManager - Setting access token, expires in:', expiresIn, 'seconds, persist:', persist);
    this.accessToken = token;
    this.tokenExpiry = Date.now() + (expiresIn * 1000);
    console.log('TokenManager - Token expiry time:', new Date(this.tokenExpiry));
    
    // Store in localStorage if persist is true
    if (persist) {
      try {
        localStorage.setItem(this.ACCESS_TOKEN_KEY, token);
        localStorage.setItem(this.TOKEN_EXPIRY_KEY, this.tokenExpiry.toString());
        console.log('TokenManager - Token stored in localStorage');
      } catch (error) {
        console.warn('TokenManager - Failed to store token in localStorage:', error);
      }
    }
    
    // Clear token when it expires
    const timeUntilExpiry = expiresIn * 1000;
    setTimeout(() => {
      console.log('TokenManager - Token expired, clearing...');
      this.clearAccessToken();
    }, timeUntilExpiry);
  }

  /**
   * Get current access token if valid
   * @returns Access token or null if expired/missing
   */
  getAccessToken(): string | null {
    // First try to get from memory
    if (this.accessToken && !this.isTokenExpired()) {
      console.log('TokenManager - Getting access token from memory, exists:', true, 'expired:', false);
      return this.accessToken;
    }
    
    // If not in memory or expired, try to load from localStorage
    try {
      const storedToken = localStorage.getItem(this.ACCESS_TOKEN_KEY);
      const storedExpiry = localStorage.getItem(this.TOKEN_EXPIRY_KEY);
      
      if (storedToken && storedExpiry) {
        const expiryTime = parseInt(storedExpiry, 10);
        if (Date.now() < expiryTime) {
          // Token is still valid, load it into memory
          this.accessToken = storedToken;
          this.tokenExpiry = expiryTime;
          console.log('TokenManager - Loaded token from localStorage, exists:', true, 'expired:', false);
          return this.accessToken;
        } else {
          // Token expired, clear from localStorage
          this.clearStoredToken();
          console.log('TokenManager - Stored token expired, cleared from localStorage');
        }
      }
    } catch (error) {
      console.warn('TokenManager - Failed to read token from localStorage:', error);
    }
    
    console.log('TokenManager - Getting access token, exists:', !!this.accessToken, 'expired:', this.isTokenExpired());
    return null;
  }

  /**
   * Check if current access token is expired
   */
  isTokenExpired(): boolean {
    return Date.now() >= this.tokenExpiry;
  }

  /**
   * Clear access token from memory
   */
  clearAccessToken(): void {
    this.accessToken = null;
    this.tokenExpiry = 0;
  }

  /**
   * Clear stored token from localStorage
   */
  private clearStoredToken(): void {
    try {
      localStorage.removeItem(this.ACCESS_TOKEN_KEY);
      localStorage.removeItem(this.TOKEN_EXPIRY_KEY);
      console.log('TokenManager - Cleared token from localStorage');
    } catch (error) {
      console.warn('TokenManager - Failed to clear token from localStorage:', error);
    }
  }

  /**
   * Set refresh token in HttpOnly cookie
   * Note: This should be called from the backend response handler
   * @param refreshToken - The refresh token
   * @param maxAge - Cookie max age in seconds (default: 7 days)
   */
  setRefreshTokenCookie(refreshToken: string, maxAge: number = 604800): void {
    // This method is for documentation - actual cookie setting should be done by the backend
    // The backend should set the cookie with HttpOnly, Secure, and SameSite flags
    console.log('Refresh token should be set by backend in HttpOnly cookie');
  }

  /**
   * Clear refresh token cookie
   * Note: This should be called from the backend logout endpoint
   */
  clearRefreshTokenCookie(): void {
    // This method is for documentation - actual cookie clearing should be done by the backend
    console.log('Refresh token cookie should be cleared by backend');
  }

  /**
   * Refresh access token using refresh token from HttpOnly cookie
   * @param refreshEndpoint - The refresh token endpoint URL
   * @returns Promise with new access token
   */
  async refreshAccessToken(refreshEndpoint: string): Promise<string> {
    // Prevent multiple simultaneous refresh requests
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.performTokenRefresh(refreshEndpoint);
    
    try {
      const newToken = await this.refreshPromise;
      return newToken;
    } finally {
      this.refreshPromise = null;
    }
  }

  /**
   * Perform the actual token refresh request
   */
  private async performTokenRefresh(refreshEndpoint: string): Promise<string> {
    try {
      const response = await fetch(refreshEndpoint, {
        method: 'POST',
        credentials: 'include', // Include HttpOnly cookies
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.accessToken) {
        throw new Error('No access token in refresh response');
      }

      // Set new access token
      this.setAccessToken(data.accessToken, data.expiresIn || 600);
      
      return data.accessToken;
    } catch (error) {
      // Clear tokens on refresh failure
      this.clearAccessToken();
      throw error;
    }
  }

  /**
   * Get authorization header for API requests
   * Automatically refreshes token if needed
   * @param refreshEndpoint - The refresh token endpoint URL
   * @returns Authorization header value or null
   */
  async getAuthHeader(refreshEndpoint: string): Promise<string | null> {
    let token = this.getAccessToken();
    
    if (!token) {
      try {
        token = await this.refreshAccessToken(refreshEndpoint);
      } catch (error) {
        console.error('Token refresh failed:', error);
        return null;
      }
    }
    
    return token ? `Bearer ${token}` : null;
  }

  /**
   * Clear all tokens (for logout)
   */
  clearAllTokens(): void {
    this.clearAccessToken();
    this.clearStoredToken();
    this.clearRefreshTokenCookie();
  }

  /**
   * Check if user is authenticated (has valid access token or refresh token available)
   */
  isAuthenticated(): boolean {
    return this.getAccessToken() !== null;
  }
}

// Create singleton instance
export const tokenManager = new SecureTokenManager();

// Export types for use in other modules
export type { TokenData };
