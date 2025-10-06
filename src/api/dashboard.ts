import { HotelStats, ApiResponse, DashboardData, ApiDashboardResponse } from './types';
import { getApiUrl } from '../config/api';
import { httpClient } from '../utils/httpClient';

// Fallback mock data for when API is not available
const mockDashboardData: DashboardData = {
  stats: {
    totalRooms: 2,
    occupiedRooms: 1,
    availableRooms: 1,
    outOfOrderRooms: 0,
    todayCheckIns: 0,
    todayCheckOuts: 0,
    todayRevenue: 0.00,
    monthlyRevenue: 0.00,
    averageRate: 0.00,
    occupancyRate: 50
  },
  revenueData: [
    { month: "Nov", revenue: 0.00, bookings: 0, occupancy: 0 },
    { month: "Dec", revenue: 0.00, bookings: 0, occupancy: 0 },
    { month: "Jan", revenue: 0.00, bookings: 0, occupancy: 0 },
    { month: "Feb", revenue: 0.00, bookings: 0, occupancy: 0 },
    { month: "Mar", revenue: 0.00, bookings: 0, occupancy: 0 },
    { month: "Apr", revenue: 0.00, bookings: 0, occupancy: 0 },
    { month: "May", revenue: 0.00, bookings: 0, occupancy: 0 },
    { month: "Jun", revenue: 0.00, bookings: 0, occupancy: 0 },
    { month: "Jul", revenue: 0.00, bookings: 0, occupancy: 0 },
    { month: "Aug", revenue: 0.00, bookings: 0, occupancy: 0 },
    { month: "Sep", revenue: 0.00, bookings: 0, occupancy: 0 },
    { month: "Oct", revenue: 0.00, bookings: 2, occupancy: 2 }
  ],
  roomStatusOverview: [
    { status: "Available", count: 1, color: "#10B981" },
    { status: "Occupied", count: 1, color: "#3B82F6" },
    { status: "Cleaning", count: 0, color: "#F59E0B" },
    { status: "Maintenance", count: 0, color: "#EF4444" },
    { status: "Out of Order", count: 0, color: "#6B7280" }
  ],
  recentBookings: [
    {
      id: 2,
      bookingNumber: "BK202510020608572874",
      roomNumber: "10000001",
      roomType: "Standard",
      checkIn: "2025-10-03T00:00:00",
      checkOut: "2025-10-05T00:00:00",
      status: 0,
      totalAmount: 2000.00,
      createdAt: "2025-10-02T06:08:57.0414273"
    },
    {
      id: 1,
      bookingNumber: "BK202510020516073926",
      roomNumber: "10000001",
      roomType: "Standard",
      checkIn: "2025-10-09T00:00:00",
      checkOut: "2025-10-10T00:00:00",
      status: 0,
      totalAmount: 1000.00,
      createdAt: "2025-10-02T05:16:07.2331067"
    }
  ],
  quickActions: [
    {
      title: "New Booking",
      value: "Create",
      description: "Create a new booking for a guest",
      icon: "plus",
      color: "blue"
    },
    {
      title: "Check In",
      value: "CheckIn",
      description: "Check in arriving guests",
      icon: "login",
      color: "green"
    },
    {
      title: "Check Out",
      value: "CheckOut",
      description: "Check out departing guests",
      icon: "logout",
      color: "orange"
    },
    {
      title: "Room Status",
      value: "RoomStatus",
      description: "Update room status",
      icon: "home",
      color: "purple"
    },
    {
      title: "Maintenance",
      value: "Maintenance",
      description: "Schedule room maintenance",
      icon: "wrench",
      color: "red"
    },
    {
      title: "Reports",
      value: "Reports",
      description: "Generate hotel reports",
      icon: "chart",
      color: "indigo"
    }
  ]
};

export const dashboardApi = {
  // Get complete dashboard data
  getDashboardData: async (period: number = 1, recentBookingsLimit: number = 111): Promise<ApiResponse<DashboardData>> => {
    try {
      const url = getApiUrl(`Dashboard?Period=${period}&RecentBookingsLimit=${recentBookingsLimit}&IncludeRevenueData=true&IncludeRoomStatus=true`);
      console.log('Dashboard API - Fetching dashboard data from:', url);
      const response = await httpClient.get<ApiDashboardResponse>(url, { skipAuth: false });
      
      if (response.success) {
        return {
          data: response.data,
          success: true,
          message: response.message
        };
      } else {
        throw new Error(response.message || 'Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('Dashboard API error:', error);
      console.log('Using fallback mock data for dashboard');
      
      // Return fallback data when API fails
      return {
        data: mockDashboardData,
        success: true,
        message: 'Using fallback data - API unavailable'
      };
    }
  },

  // Get hotel statistics only
  getHotelStats: async (): Promise<ApiResponse<HotelStats>> => {
    try {
      const url = getApiUrl('Dashboard/stats');
      console.log('Dashboard API - Fetching hotel stats from:', url);
      
      const response = await httpClient.get<{ 
        success: boolean; 
        message: string; 
        data: HotelStats; 
        statusCode: number; 
        timestamp: string 
      }>(url, { skipAuth: false });
      
      console.log('Hotel stats API response:', response);
      
      if (response.success) {
        return {
          data: response.data,
          success: true,
          message: response.message
        };
      } else {
        throw new Error(response.message || 'Failed to fetch hotel statistics');
      }
    } catch (error) {
      console.error('Hotel stats API error:', error);
      console.log('Using fallback mock data for hotel stats');
      
      // Return fallback data when API fails
      return {
        data: mockDashboardData.stats,
        success: true,
        message: 'Using fallback data - API unavailable'
      };
    }
  },

  // Get recent bookings (from dashboard data)
  getRecentBookings: async (limit: number = 5): Promise<ApiResponse<any[]>> => {
    try {
      const dashboardResponse = await dashboardApi.getDashboardData(1, limit);
      if (dashboardResponse.success) {
        return {
          data: dashboardResponse.data.recentBookings,
          success: true,
          message: 'Recent bookings fetched successfully'
        };
      } else {
        throw new Error('Failed to fetch recent bookings');
      }
    } catch (error) {
      console.error('Recent bookings API error:', error);
      throw error;
    }
  },

  // Get revenue data for charts (from dashboard data)
  getRevenueData: async (period: 'week' | 'month' | 'quarter' | 'year' = 'month'): Promise<ApiResponse<any[]>> => {
    try {
      const dashboardResponse = await dashboardApi.getDashboardData(1, 111);
      if (dashboardResponse.success) {
        return {
          data: dashboardResponse.data.revenueData,
          success: true,
          message: 'Revenue data fetched successfully'
        };
      } else {
        throw new Error('Failed to fetch revenue data');
      }
    } catch (error) {
      console.error('Revenue data API error:', error);
      throw error;
    }
  },

  // Get room status overview (from dashboard data)
  getRoomStatusOverview: async (): Promise<ApiResponse<any[]>> => {
    try {
      const dashboardResponse = await dashboardApi.getDashboardData(1, 111);
      if (dashboardResponse.success) {
        return {
          data: dashboardResponse.data.roomStatusOverview,
          success: true,
          message: 'Room status overview fetched successfully'
        };
      } else {
        throw new Error('Failed to fetch room status overview');
      }
    } catch (error) {
      console.error('Room status overview API error:', error);
      throw error;
    }
  }
};
