import { Booking, ApiResponse, BookingStatus } from './types';
import { getApiUrl } from '../config/api';
import { getAuthToken } from './auth';

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

export const bookingsApi = {
  // Get all bookings
  getAllBookings: async (): Promise<ApiResponse<Booking[]>> => {
    try {
      
      const token = getAuthToken();
      console.log(token);
      if (!token) {
        return {
          data: [],
          success: false,
          message: 'Authentication token not found. Please log in again.'
        };
      }
  console.log(getApiUrl('Booking'));
      const response = await fetch(getApiUrl('Booking'), {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      return {
        data: result.data || result || [],
        success: result.success !== false,
        message: result.message || 'Bookings fetched successfully'
      };
    } catch (error) {
      console.error('Error fetching bookings:', error);
      return {
        data: [],
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch bookings'
      };
    }
  },

  // Get booking by ID
  getBookingById: async (id: number): Promise<ApiResponse<Booking>> => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        return {
          data: {} as Booking,
          success: false,
          message: 'Authentication token not found. Please log in again.'
        };
      }

      const response = await fetch(getApiUrl(`Booking/${id}`), {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      return {
        data: result.data || result,
        success: result.success !== false,
        message: result.message || 'Booking fetched successfully'
      };
    } catch (error) {
      console.error('Error fetching booking:', error);
      return {
        data: {} as Booking,
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch booking'
      };
    }
  },

  // Get bookings by guest ID
  getBookingsByGuestId: async (guestId: number): Promise<ApiResponse<Booking[]>> => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        return {
          data: [],
          success: false,
          message: 'Authentication token not found. Please log in again.'
        };
      }

      const response = await fetch(getApiUrl(`Booking/guest/${guestId}`), {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      return {
        data: result.data || result || [],
        success: result.success !== false,
        message: result.message || 'Guest bookings fetched successfully'
      };
    } catch (error) {
      console.error('Error fetching guest bookings:', error);
      return {
        data: [],
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch guest bookings'
      };
    }
  },

  // Update booking status
  updateBookingStatus: async (bookingId: number, status: BookingStatus): Promise<ApiResponse<Booking>> => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        return {
          data: {} as Booking,
          success: false,
          message: 'Authentication token not found. Please log in again.'
        };
      }

      console.log(`Updating booking ${bookingId} status to:`, status);
      
      const response = await fetch(getApiUrl(`Booking/${bookingId}/status`), {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(status)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      return {
        data: result.data || result,
        success: result.success !== false,
        message: result.message || 'Booking status updated successfully'
      };
    } catch (error) {
      console.error('Error updating booking status:', error);
      return {
        data: {} as Booking,
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update booking status'
      };
    }
  },

  // Verify booking OTP
  verifyBookingOtp: async (bookingId: number, otpCode: string): Promise<ApiResponse<{ success: boolean; message: string; bookingId: number; bookingStatus: string; verifiedAt: string } | null>> => {
    try {
      const response = await fetch(getApiUrl('BookingOtp/verify'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          bookingId,
          otpCode
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      // The API returns nested data structure
      const verificationData = result.data || result;
      
      return {
        data: {
          success: verificationData.success,
          message: verificationData.message,
          bookingId: verificationData.bookingId,
          bookingStatus: verificationData.bookingStatus,
          verifiedAt: verificationData.verifiedAt
        },
        success: result.success !== false,
        message: result.message || 'OTP verified successfully'
      };
    } catch (error) {
      console.error('Error verifying OTP:', error);
      return {
        data: null,
        success: false,
        message: error instanceof Error ? error.message : 'Failed to verify OTP'
      };
    }
  }
};
