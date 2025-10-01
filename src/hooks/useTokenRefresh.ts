/**
 * Hook for automatic token refresh
 * 
 * This hook provides:
 * - Automatic token refresh before expiry
 * - Token refresh on demand
 * - Authentication state management
 */

import { useState, useEffect, useCallback } from 'react';
import { tokenManager } from '../utils/tokenManager';
import { getApiUrl } from '../config/api';

interface UseTokenRefreshReturn {
  isAuthenticated: boolean;
  isRefreshing: boolean;
  refreshToken: () => Promise<boolean>;
  clearTokens: () => void;
}

export const useTokenRefresh = (): UseTokenRefreshReturn => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Check authentication status
  const checkAuthStatus = useCallback(() => {
    const hasValidToken = tokenManager.isAuthenticated();
    setIsAuthenticated(hasValidToken);
    return hasValidToken;
  }, []);

  // Refresh token manually
  const refreshToken = useCallback(async (): Promise<boolean> => {
    if (isRefreshing) {
      return false; // Prevent multiple simultaneous refresh attempts
    }

    try {
      setIsRefreshing(true);
      await tokenManager.refreshAccessToken(getApiUrl('Auth/refresh'));
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      setIsAuthenticated(false);
      return false;
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing]);

  // Clear all tokens
  const clearTokens = useCallback(() => {
    tokenManager.clearAllTokens();
    setIsAuthenticated(false);
  }, []);

  // Set up automatic token refresh
  useEffect(() => {
    let refreshInterval: NodeJS.Timeout;

    const setupAutoRefresh = () => {
      // Check auth status on mount
      checkAuthStatus();

      // Set up interval to check token status every minute
      refreshInterval = setInterval(async () => {
        const hasValidToken = tokenManager.isAuthenticated();
        
        if (hasValidToken) {
          setIsAuthenticated(true);
        } else {
          // Try to refresh if we have a refresh token available
          try {
            await refreshToken();
          } catch (error) {
            // If refresh fails, user needs to log in again
            setIsAuthenticated(false);
          }
        }
      }, 60000); // Check every minute
    };

    setupAutoRefresh();

    // Cleanup interval on unmount
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [checkAuthStatus, refreshToken]);

  // Listen for storage events (for multi-tab synchronization)
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      // If localStorage changes (like logout in another tab), check auth status
      if (event.key === 'authToken' && !event.newValue) {
        checkAuthStatus();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [checkAuthStatus]);

  // Listen for focus events to refresh token when user returns to app
  useEffect(() => {
    const handleFocus = () => {
      if (isAuthenticated) {
        checkAuthStatus();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [isAuthenticated, checkAuthStatus]);

  return {
    isAuthenticated,
    isRefreshing,
    refreshToken,
    clearTokens,
  };
};
