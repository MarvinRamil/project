import { useState, useEffect } from 'react';
import { User } from '../api/types';
import { authApi } from '../api';
import { tokenManager } from '../utils/tokenManager';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
    try {
      console.log('useAuth login called with:', email);
      setIsLoading(true);
      setError(null);

      console.log('About to call authApi.login...');
      const response = await authApi.login(email, password);
      console.log('Login response in useAuth:', response);
      
      if (response.success) {
        console.log('Setting user in useAuth:', response.data);
        setUser(response.data);
        return { success: true, user: response.data };
      } else {
        console.log('Login failed:', response.message);
        setError(response.message || 'Login failed');
        return { success: false, error: response.message };
      }
    } catch (err) {
      console.error('Login error in useAuth:', err);
      setError('Login failed');
      return { success: false, error: 'Login failed' };
    } finally {
      console.log('Login process completed, setting loading to false');
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
      setUser(null);
      return { success: true };
    } catch (err) {
      console.error('Logout error:', err);
      return { success: false, error: 'Logout failed' };
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    try {
      if (!user) {
        return { success: false, error: 'No user logged in' };
      }

      const response = await authApi.updateProfile(user.id, updates);
      if (response.success) {
        setUser(response.data);
        return { success: true, user: response.data };
      } else {
        setError(response.message || 'Profile update failed');
        return { success: false, error: response.message };
      }
    } catch (err) {
      setError('Profile update failed');
      console.error('Profile update error:', err);
      return { success: false, error: 'Profile update failed' };
    }
  };

  const refreshToken = async () => {
    try {
      const response = await authApi.refreshToken();
      if (response.success) {
        return { success: true };
      } else {
        setUser(null);
        return { success: false, error: response.message };
      }
    } catch (err) {
      console.error('Token refresh error:', err);
      setUser(null);
      return { success: false, error: 'Token refresh failed' };
    }
  };

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      const response = await authApi.getCurrentUser();
      if (response.success && response.data) {
        setUser(response.data);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Auth check error:', err);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  return {
    user,
    isLoading,
    error,
    login,
    logout,
    updateProfile,
    refreshToken,
    checkAuthStatus
  };
};
