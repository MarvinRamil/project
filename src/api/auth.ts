import { User, ApiResponse } from './types';
import { getApiUrl } from '../config/api';
import { tokenManager } from '../utils/tokenManager';

interface JWTPayload {
  [key: string]: string | number | boolean | undefined;
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'?: string;
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'?: string;
  email?: string;
  exp?: number;
  iss?: string;
  aud?: string;
}

// Base API URL is now imported from config

const DEV_MODE = import.meta.env.DEV;

const FORCE_REAL_API = true;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

export const decodeJWT = (token: string): JWTPayload | null => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('JWT decode error:', error);
    return null;
  }
};

export const getCurrentUserFromToken = (): User | null => {
  const token = tokenManager.getAccessToken() || getAuthToken();
  if (!token) return null;
  
  const payload = decodeJWT(token);
  if (!payload) return null;
  
  return {
    id: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || '1',
    name: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || 'Hotel User',
    email: payload.email || '',
    role: (payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']?.toLowerCase() as 'admin' | 'manager' | 'receptionist' | 'housekeeping') || 'manager',
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${payload.email || 'user'}`
  };
};




export const authApi = {
  // Login user
  login: async (email: string, password: string): Promise<ApiResponse<User>> => {
    try {
      const loginUrl = getApiUrl('Auth/login');
      console.log('Login URL:', loginUrl);
      console.log('Login request body:', { username: email, password: '***' });
      
      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
        credentials: 'omit',
        body: JSON.stringify({
          username: email, // API expects username, but we're using email as username
          password: password
        })
      });
      
      if (!response.ok) {
        console.log('Login failed with status:', response.status, response.statusText);
        const errorData = await response.json().catch(() => ({}));
        console.log('Error response data:', errorData);
        return {
          data: {} as User,
          success: false,
          message: errorData.message || errorData.error || `HTTP error! status: ${response.status}`
        };
      }

      const data = await response.json();
      console.log('Raw API response data:', data);
      console.log('Response keys:', Object.keys(data));
      
      // Handle different possible response formats
      const token = data.token || data.accessToken || data.access_token || data.data?.accessToken;
      const expiresIn = data.expiresIn || data.expires_in || data.data?.expiresIn || 600; // Default to 10 minutes
      const userData = data.user || data.data || data.userData;
      
      console.log('Extracted token:', token ? 'Found' : 'Not found');
      console.log('Extracted expiresIn:', expiresIn);
      
      if (token) {
        // Use the modern token manager
        tokenManager.setAccessToken(token, expiresIn, true); // Persist in localStorage for now
        
        // Decode JWT token to extract user information
        const tokenPayload = decodeJWT(token);
        
        let user: User;
        if (tokenPayload) {
          user = {
            id: tokenPayload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || '1',
            name: tokenPayload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || 'Hotel User',
            email: email, // Use the email from the login form
            role: (tokenPayload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']?.toLowerCase() as 'admin' | 'manager' | 'receptionist' | 'housekeeping') || 'manager',
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
          };
        } else if (userData) {
          // Use user data from API response if available
          user = {
            id: userData.id || '1',
            name: userData.name || userData.username || 'Hotel User',
            email: userData.email || email,
            role: (userData.role?.toLowerCase() as 'admin' | 'manager' | 'receptionist' | 'housekeeping') || 'manager',
            avatar: userData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
          };
        } else {
          // Fallback if JWT decoding fails and no user data
          user = {
            id: '1',
            name: 'Hotel User',
            email: email,
            role: 'manager',
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
          };
        }
        
        return {
          data: user,
          success: true,
          message: 'Login successful'
        };
      }
      
      // If no token in response, return error
      console.log('No token found in response. Available fields:', Object.keys(data));
      console.log('Full response data:', JSON.stringify(data, null, 2));
      return {
        data: {} as User,
        success: false,
        message: 'No authentication token received'
      };
    } catch (error) {
      console.error('Login API error:', error);
      console.error('Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace'
      });
      
      // Fallback to mock authentication in development mode (only if not forcing real API)
      if (DEV_MODE && !FORCE_REAL_API) {
        console.warn('Backend unavailable, using mock authentication');
        await delay(1000);
        
        if (email && password) {
          const mockUser: User = {
            id: '1',
            name: 'Hotel Manager',
            email,
            role: 'manager',
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
          };
          
          // Store mock token using token manager
          const mockToken = 'mock-token-' + Date.now();
          tokenManager.setAccessToken(mockToken, 3600, true); // 1 hour expiry
          
          return {
            data: mockUser,
            success: true,
            message: 'Login successful (mock mode)'
          };
        }
      }
      
      return {
        data: {} as User,
        success: false,
        message: 'Network error or server unavailable'
      };
    }
  },

  // Logout user
  logout: async (): Promise<ApiResponse<boolean>> => {
    await delay(300);
    
    // Clear all tokens using the token manager
    tokenManager.clearAllTokens();
    
    return {
      data: true,
      success: true,
      message: 'Logout successful'
    };
  },

  // Get current user
  getCurrentUser: async (): Promise<ApiResponse<User | null>> => {
    await delay(300);
    
    // Check if user is authenticated using token manager
    if (tokenManager.isAuthenticated()) {
      // Try to get user from JWT token first
      const userFromToken = getCurrentUserFromToken();
      if (userFromToken) {
        return {
          data: userFromToken,
          success: true,
          message: 'User fetched successfully'
        };
      }
      
      // Fallback to saved user data
      const savedUser = localStorage.getItem('hotelUser');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        return {
          data: user,
          success: true,
          message: 'User fetched successfully'
        };
      }
    }
    
    // Clear invalid session data
    localStorage.removeItem('hotelUser');
    tokenManager.clearAllTokens();
    
    return {
      data: null,
      success: true,
      message: 'No user found'
    };
  },

  // Update user profile
  updateProfile: async (_userId: string, updates: Partial<User>): Promise<ApiResponse<User>> => {
    await delay(500);
    
    const savedUser = localStorage.getItem('hotelUser');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      const updatedUser = { ...user, ...updates };
      localStorage.setItem('hotelUser', JSON.stringify(updatedUser));
      
      return {
        data: updatedUser,
        success: true,
        message: 'Profile updated successfully'
      };
    }
    
    return {
      data: {} as User,
      success: false,
      message: 'User not found'
    };
  },

  // Refresh token
  refreshToken: async (): Promise<ApiResponse<boolean>> => {
    try {
      const refreshEndpoint = getApiUrl('Auth/refresh');
      const newToken = await tokenManager.refreshAccessToken(refreshEndpoint);
      
      if (newToken) {
        return {
          data: true,
          success: true,
          message: 'Token refreshed successfully'
        };
      } else {
        return {
          data: false,
          success: false,
          message: 'Token refresh failed'
        };
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      return {
        data: false,
        success: false,
        message: 'Token refresh failed'
      };
    }
  }
};
