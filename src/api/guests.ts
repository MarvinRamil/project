import { Guest, ApiResponse } from './types';
import { getAuthToken } from './auth';

// API Response structure from the backend
interface BackendApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  statusCode: number;
  timestamp: string;
}

import { getApiUrl } from '../config/api';

// Helper function to create authenticated headers
const getAuthHeaders = () => {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

export const guestsApi = {
  // Get all guests
  getAllGuests: async (): Promise<ApiResponse<Guest[]>> => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        return {
          data: [],
          success: false,
          message: 'Authentication token not found. Please log in again.'
        };
      }

      const response = await fetch(getApiUrl('Guest'), {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const backendResponse: BackendApiResponse<Guest[]> = await response.json();
      
      return {
        data: backendResponse.data,
        success: backendResponse.success,
        message: backendResponse.message
      };
    } catch (error) {
      console.error('Error fetching guests:', error);
      return {
        data: [],
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch guests'
      };
    }
  },

  // Get guest by ID
  getGuestById: async (id: number): Promise<ApiResponse<Guest>> => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        return {
          data: {} as Guest,
          success: false,
          message: 'Authentication token not found. Please log in again.'
        };
      }

      const response = await fetch(getApiUrl(`Guest/${id}`), {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          return {
            data: {} as Guest,
            success: false,
            message: 'Guest not found'
          };
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const backendResponse: BackendApiResponse<Guest> = await response.json();
      
      return {
        data: backendResponse.data,
        success: backendResponse.success,
        message: backendResponse.message
      };
    } catch (error) {
      console.error('Error fetching guest:', error);
      return {
        data: {} as Guest,
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch guest'
      };
    }
  },

  // Create new guest
  createGuest: async (guestData: Omit<Guest, 'id' | 'totalStays' | 'totalSpent' | 'joinDate' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Guest>> => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        return {
          data: {} as Guest,
          success: false,
          message: 'Authentication token not found. Please log in again.'
        };
      }

      const response = await fetch(getApiUrl('Guest'), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(guestData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const backendResponse: BackendApiResponse<Guest> = await response.json();
      
      return {
        data: backendResponse.data,
        success: backendResponse.success,
        message: backendResponse.message
      };
    } catch (error) {
      console.error('Error creating guest:', error);
      return {
        data: {} as Guest,
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create guest'
      };
    }
  },

  // Create guest information (for registration without authentication)
  createGuestInfo: async (guestData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    idNumber: string;
    nationality: string;
    address: string;
    preferences: string[];
  }): Promise<ApiResponse<{ message: string }>> => {
    try {
      const guestInfoUrl = 'https://backend.mrcurading.xyz/api/Guest';
      console.log('Guest info URL:', guestInfoUrl);
      console.log('Guest info request body:', guestData);
      
      const response = await fetch(guestInfoUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
        credentials: 'omit',
        body: JSON.stringify(guestData),
      });
      
      const data = await response.json();
      console.log('Guest info response:', data);
      
      if (!response.ok) {
        return {
          data: { message: data.message || 'Failed to create guest information' },
          success: false,
          message: data.message || `HTTP error! status: ${response.status}`
        };
      }
      
      return {
        data: { message: data.message || 'Guest information created successfully' },
        success: true,
        message: data.message || 'Guest information created successfully'
      };
    } catch (error) {
      console.error('Error creating guest info:', error);
      return {
        data: { message: 'Network error or server unavailable' },
        success: false,
        message: 'Network error or server unavailable'
      };
    }
  },

  // Update guest
  updateGuest: async (guestId: number, updates: Partial<Guest>): Promise<ApiResponse<Guest>> => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        return {
          data: {} as Guest,
          success: false,
          message: 'Authentication token not found. Please log in again.'
        };
      }

      const response = await fetch(getApiUrl(`Guest/${guestId}`), {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          return {
            data: {} as Guest,
            success: false,
            message: 'Guest not found'
          };
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const backendResponse: BackendApiResponse<Guest> = await response.json();
      
      return {
        data: backendResponse.data,
        success: backendResponse.success,
        message: backendResponse.message
      };
    } catch (error) {
      console.error('Error updating guest:', error);
      return {
        data: {} as Guest,
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update guest'
      };
    }
  },

  // Delete guest
  deleteGuest: async (guestId: number): Promise<ApiResponse<boolean>> => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        return {
          data: false,
          success: false,
          message: 'Authentication token not found. Please log in again.'
        };
      }

      const response = await fetch(getApiUrl(`Guest/${guestId}`), {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          return {
            data: false,
            success: false,
            message: 'Guest not found'
          };
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const backendResponse: BackendApiResponse<boolean> = await response.json();
      
      return {
        data: backendResponse.data,
        success: backendResponse.success,
        message: backendResponse.message
      };
    } catch (error) {
      console.error('Error deleting guest:', error);
      return {
        data: false,
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete guest'
      };
    }
  },

  // Search guests
  searchGuests: async (query: string): Promise<ApiResponse<Guest[]>> => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        return {
          data: [],
          success: false,
          message: 'Authentication token not found. Please log in again.'
        };
      }

      const response = await fetch(getApiUrl(`Guest/search?q=${encodeURIComponent(query)}`), {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const backendResponse: BackendApiResponse<Guest[]> = await response.json();
      
      return {
        data: backendResponse.data,
        success: backendResponse.success,
        message: backendResponse.message
      };
    } catch (error) {
      console.error('Error searching guests:', error);
      return {
        data: [],
        success: false,
        message: error instanceof Error ? error.message : 'Failed to search guests'
      };
    }
  },

  // Get guest by email (for guest profile)
  getGuestByEmail: async (email: string): Promise<ApiResponse<Guest>> => {
    try {
      console.log('=== GUESTS API: getGuestByEmail ===');
      console.log('Email/Username:', email);
      
      const token = getAuthToken();
      console.log('Token exists:', !!token);
      
      if (!token) {
        console.log('No token found, returning error');
        return {
          data: {} as Guest,
          success: false,
          message: 'Authentication token not found. Please log in again.'
        };
      }

      // Properly encode the email for URL (e.g., @ becomes %40)
      const encodedEmail = encodeURIComponent(email);

      console.log('Encoded email:', encodedEmail);
      const url = getApiUrl(`Guest/email/${encodedEmail}`);


      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (!response.ok) {
        if (response.status === 404) {
          return {
            data: {} as Guest,
            success: false,
            message: 'Guest not found'
          };
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const backendResponse: BackendApiResponse<Guest> = await response.json();
      console.log('Backend response:', backendResponse);
      
      const result = {
        data: backendResponse.data,
        success: backendResponse.success,
        message: backendResponse.message
      };
      console.log('Returning result:', result);
      
      return result;
    } catch (error) {
      console.error('Error fetching guest by email:', error);
      return {
        data: {} as Guest,
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch guest'
      };
    }
  }
};
