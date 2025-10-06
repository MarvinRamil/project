/**
 * HTTP Client with automatic token refresh
 * 
 * This client automatically handles:
 * - Adding authorization headers
 * - Refreshing expired tokens
 * - Retrying failed requests after token refresh
 */

import { tokenManager } from './tokenManager';
import { getApiUrl } from '../config/api';

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
  retryOnAuthFailure?: boolean;
}

class HttpClient {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || '';
  }

  /**
   * Make an authenticated HTTP request
   */
  async request<T = any>(
    endpoint: string, 
    options: RequestOptions = {}
  ): Promise<T> {
    const { skipAuth = false, retryOnAuthFailure = true, ...fetchOptions } = options;
    
    // Add authorization header if not skipped
    if (!skipAuth) {
      const authHeader = await tokenManager.getAuthHeader(getApiUrl('Auth/refresh'));
      if (authHeader) {
        fetchOptions.headers = {
          ...fetchOptions.headers,
          'Authorization': authHeader,
        };
      }
    }

    // Add credentials for cookie-based refresh tokens only when not skipping auth
    if (!skipAuth) {
      fetchOptions.credentials = 'include';
    }
    
    // Ensure headers object exists
    if (!fetchOptions.headers) {
      fetchOptions.headers = {};
    }

    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;
    
    console.log('HTTP Client - Making request:', {
      url,
      skipAuth,
      hasAuthHeader: !!(fetchOptions.headers as any)?.Authorization,
      method: fetchOptions.method || 'GET'
    });
    
    try {
      const response = await fetch(url, fetchOptions);
      
      // Handle 401 Unauthorized - token might be expired
      if (response.status === 401 && !skipAuth && retryOnAuthFailure) {
        console.log('Received 401, attempting token refresh...');
        
        try {
          // Try to refresh the token
          await tokenManager.refreshAccessToken(getApiUrl('Auth/refresh'));
          
          // Retry the original request with new token
          const newAuthHeader = await tokenManager.getAuthHeader(getApiUrl('Auth/refresh'));
          if (newAuthHeader) {
            const retryOptions = {
              ...fetchOptions,
              headers: {
                ...fetchOptions.headers,
                'Authorization': newAuthHeader,
              },
            };
            
            const retryResponse = await fetch(url, retryOptions);
            if (retryResponse.ok) {
              return await this.handleResponse<T>(retryResponse);
            }
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          // Clear tokens and redirect to login
          tokenManager.clearAllTokens();
          window.location.href = '/login';
          throw new Error('Authentication failed');
        }
      }
      
      return await this.handleResponse<T>(response);
    } catch (error) {
      console.error('HTTP request failed:', error);
      throw error;
    }
  }

  /**
   * Handle HTTP response
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorMessage;
      } catch {
        // Use default error message if response is not JSON
      }
      
      throw new Error(errorMessage);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    return await response.text() as unknown as T;
  }

  /**
   * GET request
   */
  async get<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T = any>(endpoint: string, data?: any, options: RequestOptions = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T = any>(endpoint: string, data?: any, options: RequestOptions = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  /**
   * PATCH request
   */
  async patch<T = any>(endpoint: string, data?: any, options: RequestOptions = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
    });
  }
}

// Create singleton instance
export const httpClient = new HttpClient();

// Export the class for custom instances
export { HttpClient };
export type { RequestOptions };
