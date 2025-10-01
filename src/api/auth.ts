import { User, ApiResponse } from './types';
import { getApiUrl } from '../config/api';

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
  const token = getAuthToken();
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
      const response = await fetch(getApiUrl('Auth/login'), {
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
        const errorData = await response.json().catch(() => ({}));
        return {
          data: {} as User,
          success: false,
          message: errorData.message || `HTTP error! status: ${response.status}`
        };
      }

      const data = await response.json();
      
      // Store token
      if (data.token) {
        localStorage.setItem('authToken', data.token);
        
        // Decode JWT token to extract user information
        const tokenPayload = decodeJWT(data.token);
        
        if (tokenPayload) {
          const user: User = {
            id: tokenPayload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || '1',
            name: tokenPayload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || 'Hotel User',
            email: email, // Use the email from the login form
            role: (tokenPayload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']?.toLowerCase() as 'admin' | 'manager' | 'receptionist' | 'housekeeping') || 'manager',
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
          };
          
          return {
            data: user,
            success: true,
            message: 'Login successful'
          };
        } else {
          // Fallback if JWT decoding fails
          const user: User = {
            id: '1',
            name: 'Hotel User',
            email: email,
            role: 'manager',
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
          };
          
          return {
            data: user,
            success: true,
            message: 'Login successful'
          };
        }
      }
      
      // If no token in response, return error
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
          
          // Store mock token
          localStorage.setItem('authToken', 'mock-token-' + Date.now());
          
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
    
    // Clear auth token
    localStorage.removeItem('authToken');
    
    return {
      data: true,
      success: true,
      message: 'Logout successful'
    };
  },

  // Get current user
  getCurrentUser: async (): Promise<ApiResponse<User | null>> => {
    await delay(300);
    
    const authToken = localStorage.getItem('authToken');
    
    if (authToken) {
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
    localStorage.removeItem('authToken');
    
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
  }
};
