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
  // Use the token manager to get the current access token
  return tokenManager.getAccessToken();
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
  console.log('=== GET CURRENT USER FROM TOKEN ===');
  const token = tokenManager.getAccessToken() || getAuthToken();
  console.log('Token exists:', !!token);
  console.log('Token preview:', token ? token.substring(0, 50) + '...' : 'No token');
  
  if (!token) {
    console.log('No token found, returning null');
    return null;
  }
  
  console.log('Decoding JWT token...');
  const payload = decodeJWT(token);
  console.log('JWT payload:', payload);
  
  if (!payload) {
    console.log('Failed to decode JWT payload, returning null');
    return null;
  }
  
  // Try multiple possible email claim names
  const email = payload.email || 
                payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] ||
                payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ||
                payload.username ||
                payload.sub ||
                '';
  
  console.log('Extracted email from token:', email);
  console.log('All available payload keys:', Object.keys(payload));
  
  const user = {
    id: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || '1',
    name: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || 'Hotel User',
    email: email,
    role: (payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']?.toLowerCase() as 'admin' | 'manager' | 'receptionist' | 'housekeeping') || 'manager',
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email || 'user'}`
  };
  
  console.log('Created user from token:', user);
  return user;
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
        console.log('Main login - Token payload:', tokenPayload);
        
        let user: User;
        if (tokenPayload) {
          const role = tokenPayload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']?.toLowerCase();
          const tokenEmail = String(tokenPayload.email || tokenPayload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || email);
          console.log('Main login - Extracted role from token:', role);
          console.log('Main login - Extracted email from token:', tokenEmail);
          
          user = {
            id: tokenPayload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || '1',
            name: tokenPayload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || 'Hotel User',
            email: tokenEmail, // Use the email from the token claims
            role: (role as 'admin' | 'manager' | 'receptionist' | 'housekeeping' | 'guest') || 'manager',
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${tokenEmail}`
          };
          console.log('Main login - Created user from token:', user);
        } else if (userData) {
          // Use user data from API response if available
          console.log('Main login - Using userData from API response:', userData);
          user = {
            id: userData.id || '1',
            name: userData.name || userData.username || 'Hotel User',
            email: userData.email || email,
            role: (userData.role?.toLowerCase() as 'admin' | 'manager' | 'receptionist' | 'housekeeping' | 'guest') || 'guest',
            avatar: userData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
          };
          console.log('Main login - Created user from userData:', user);
        } else {
          // Fallback if JWT decoding fails and no user data
          console.log('Main login - Using fallback user creation');
          user = {
            id: '1',
            name: 'Hotel User',
            email: email,
            role: 'manager',
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
          };
          console.log('Main login - Created fallback user:', user);
        }
        
        // Save user data to localStorage for persistence
        localStorage.setItem('hotelUser', JSON.stringify(user));
        console.log('User data saved to localStorage:', user);
        console.log('User role for main login:', user.role);
        
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
    console.log('=== AUTH API: LOGOUT ===');
    await delay(300);
    
    // Clear all tokens using the token manager
    console.log('Clearing all tokens...');
    tokenManager.clearAllTokens();
    console.log('Tokens cleared successfully');
    
    const result = {
      data: true,
      success: true,
      message: 'Logout successful'
    };
    console.log('Logout result:', result);
    
    return result;
  },

  // Get current user
  getCurrentUser: async (): Promise<ApiResponse<User | null>> => {
    console.log('=== GET CURRENT USER ===');
    await delay(300);
    
    // Check if user is authenticated using token manager
    const isAuth = tokenManager.isAuthenticated();
    console.log('Token manager isAuthenticated:', isAuth);
    
    if (isAuth) {
      // Try to get user from JWT token first
      const userFromToken = getCurrentUserFromToken();
      console.log('User from token:', userFromToken);
      if (userFromToken) {
        console.log('Returning user from token');
        return {
          data: userFromToken,
          success: true,
          message: 'User fetched successfully'
        };
      }
      
      // Fallback to saved user data
      const savedUser = localStorage.getItem('hotelUser');
      console.log('Saved user from localStorage:', savedUser);
      if (savedUser) {
        const user = JSON.parse(savedUser);
        console.log('Parsed user from localStorage:', user);
        return {
          data: user,
          success: true,
          message: 'User fetched successfully'
        };
      }
    }
    
    console.log('No user found, returning null');
    
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
  },

  // Register guest user
  registerGuest: async (username: string, email: string, password: string): Promise<ApiResponse<{ message: string; errors?: string[] }>> => {
    try {
      const registerUrl = 'https://backend.mrcurading.xyz/api/Auth/register';
      console.log('Register URL:', registerUrl);
      console.log('Register request body:', { username, email, password: '***', role: 'Guest' });
      
      const response = await fetch(registerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
        credentials: 'omit',
        body: JSON.stringify({
          username,
          email,
          password,
          role: 'Guest'
        })
      });
      
      const data = await response.json();
      console.log('Register response:', data);
      
      if (!response.ok) {
        return {
          data: { message: data.message || 'Registration failed', errors: data.errors },
          success: false,
          message: data.message || `HTTP error! status: ${response.status}`
        };
      }
      
      return {
        data: { message: data.message || 'User registered successfully' },
        success: true,
        message: data.message || 'Registration successful'
      };
    } catch (error) {
      console.error('Register API error:', error);
      return {
        data: { message: 'Network error or server unavailable' },
        success: false,
        message: 'Network error or server unavailable'
      };
    }
  },

  // Login guest user
  loginGuest: async (username: string, password: string): Promise<ApiResponse<User>> => {
    try {
      const loginUrl = 'https://backend.mrcurading.xyz/api/Auth/login';
      console.log('Guest Login URL:', loginUrl);
      console.log('Guest Login request body:', { username: username, password: '***' });
      
      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
        credentials: 'omit',
        body: JSON.stringify({
          username: username,
          password: password
        })
      });
      
      if (!response.ok) {
        console.log('Guest Login failed with status:', response.status, response.statusText);
        const errorData = await response.json().catch(() => ({}));
        console.log('Error response data:', errorData);
        return {
          data: {} as User,
          success: false,
          message: errorData.message || errorData.error || `HTTP error! status: ${response.status}`
        };
      }

      const data = await response.json();
      console.log('Raw Guest Login API response data:', data);
      console.log('Response keys:', Object.keys(data));
      
      // Handle different possible response formats
      const token = data.token || data.accessToken || data.access_token || data.data?.accessToken;
      const expiresIn = data.expiresIn || data.expires_in || data.data?.expiresIn || 600; // Default to 10 minutes
      const userData = data.user || data.data || data.userData;
      
      console.log('Extracted token:', token ? 'Found' : 'Not found');
      console.log('Extracted expiresIn:', expiresIn);
      console.log('Extracted userData:', userData);
      console.log('Data structure:', {
        hasToken: !!token,
        hasUserData: !!userData,
        dataKeys: Object.keys(data),
        dataStructure: data
      });
      
      if (token) {
        // Use the modern token manager
        tokenManager.setAccessToken(token, expiresIn, true); // Persist in localStorage for now
        
        // Decode JWT token to extract user information
        const tokenPayload = decodeJWT(token);
        console.log('Token payload:', tokenPayload);
        
        let user: User;
        if (tokenPayload) {
          const tokenEmail = String(tokenPayload.email || tokenPayload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || username);
          console.log('Guest login - Extracted email from token:', tokenEmail);
          
          user = {
            id: tokenPayload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || '1',
            name: tokenPayload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || 'Guest User',
            email: tokenEmail, // Use email from token claims
            role: (tokenPayload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']?.toLowerCase() as 'admin' | 'manager' | 'receptionist' | 'housekeeping' | 'guest') || 'guest',
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${tokenEmail}`
          };
          console.log('Created user from token payload:', user);
        } else if (userData) {
          // Use user data from API response if available
          user = {
            id: userData.id || '1',
            name: userData.name || userData.username || 'Guest User',
            email: userData.email || username,
            role: (userData.role?.toLowerCase() as 'admin' | 'manager' | 'receptionist' | 'housekeeping' | 'guest') || 'guest',
            avatar: userData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`
          };
          console.log('Created user from userData:', user);
        } else {
          // Fallback if JWT decoding fails and no user data
          user = {
            id: '1',
            name: 'Guest User',
            email: username,
            role: 'guest',
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`
          };
          console.log('Created fallback user:', user);
        }
        
        // Save user data to localStorage for persistence
        localStorage.setItem('hotelUser', JSON.stringify(user));
        console.log('Guest user data saved to localStorage:', user);
        
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
      console.error('Guest Login API error:', error);
      console.error('Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace'
      });
      
      return {
        data: {} as User,
        success: false,
        message: 'Network error or server unavailable'
      };
    }
  }
};
