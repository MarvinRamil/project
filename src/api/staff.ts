import { Staff, CreateStaffRequest, ApiResponse } from './types';
import { mockStaff } from './mockData';
import { getApiUrl } from '../config/api';
import { getAuthToken } from './auth';

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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

export const staffApi = {
  // Get all staff
  getAllStaff: async (): Promise<ApiResponse<Staff[]>> => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        // Fallback to mock data if no token
        await delay(500);
        return {
          data: mockStaff,
          success: true,
          message: 'Staff fetched successfully (mock data)'
        };
      }

      const response = await fetch(getApiUrl('HotelStaff'), {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        // Fallback to mock data if API fails
        await delay(500);
        return {
          data: mockStaff,
          success: true,
          message: 'Staff fetched successfully (mock data)'
        };
      }

      const result = await response.json();
      console.log('Staff API response:', result);
      
      // Handle different response formats
      let staffData = result;
      if (result.data && Array.isArray(result.data)) {
        staffData = result.data;
      } else if (result.result && Array.isArray(result.result)) {
        staffData = result.result;
      } else if (!Array.isArray(result)) {
        // If result is not an array, return empty array
        staffData = [];
      }
      
      return {
        data: staffData,
        success: true,
        message: 'Staff fetched successfully'
      };
    } catch (error) {
      console.error('Error fetching staff:', error);
      // Fallback to mock data
      await delay(500);
      return {
        data: mockStaff,
        success: true,
        message: 'Staff fetched successfully (mock data)'
      };
    }
  },

  // Get staff by ID
  getStaffById: async (id: string): Promise<ApiResponse<Staff>> => {
    await delay(300);
    const staffMember = mockStaff.find(s => s.id === id);
    if (!staffMember) {
      return {
        data: {} as Staff,
        success: false,
        message: 'Staff member not found'
      };
    }
    return {
      data: staffMember,
      success: true,
      message: 'Staff member fetched successfully'
    };
  },

  // Create new staff member
  createStaff: async (staffData: CreateStaffRequest): Promise<ApiResponse<Staff>> => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        return {
          data: {} as Staff,
          success: false,
          message: 'Authentication token not found. Please log in again.'
        };
      }

      const response = await fetch(getApiUrl('HotelStaff'), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(staffData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return {
        data: result,
        success: true,
        message: 'Staff member created successfully'
      };
    } catch (error) {
      console.error('Error creating staff:', error);
      return {
        data: {} as Staff,
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create staff member'
      };
    }
  },

  // Update staff member
  updateStaff: async (staffId: string, updates: Partial<Staff>): Promise<ApiResponse<Staff>> => {
    await delay(300);
    const staffIndex = mockStaff.findIndex(s => s.id === staffId);
    if (staffIndex === -1) {
      return {
        data: {} as Staff,
        success: false,
        message: 'Staff member not found'
      };
    }
    
    mockStaff[staffIndex] = { ...mockStaff[staffIndex], ...updates };
    return {
      data: mockStaff[staffIndex],
      success: true,
      message: 'Staff member updated successfully'
    };
  },

  // Delete staff member
  deleteStaff: async (staffId: string): Promise<ApiResponse<boolean>> => {
    await delay(300);
    const staffIndex = mockStaff.findIndex(s => s.id === staffId);
    if (staffIndex === -1) {
      return {
        data: false,
        success: false,
        message: 'Staff member not found'
      };
    }
    
    mockStaff.splice(staffIndex, 1);
    return {
      data: true,
      success: true,
      message: 'Staff member deleted successfully'
    };
  },

  // Get staff by role
  getStaffByRole: async (role: string): Promise<ApiResponse<Staff[]>> => {
    await delay(300);
    const filteredStaff = mockStaff.filter(s => s.role === role);
    return {
      data: filteredStaff,
      success: true,
      message: 'Staff fetched successfully'
    };
  },

  // Get active staff
  getActiveStaff: async (): Promise<ApiResponse<Staff[]>> => {
    await delay(300);
    const activeStaff = mockStaff.filter(s => s.isActive);
    return {
      data: activeStaff,
      success: true,
      message: 'Active staff fetched successfully'
    };
  },

  // Search staff
  searchStaff: async (query: string): Promise<ApiResponse<Staff[]>> => {
    await delay(300);
    const filteredStaff = mockStaff.filter(staff => 
      staff.name.toLowerCase().includes(query.toLowerCase()) ||
      staff.email.toLowerCase().includes(query.toLowerCase()) ||
      staff.phone.includes(query)
    );
    return {
      data: filteredStaff,
      success: true,
      message: 'Staff searched successfully'
    };
  }
};
