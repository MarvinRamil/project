import { HotelStats, ApiResponse } from './types';
import { mockRooms, mockBookings } from './mockData';

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const dashboardApi = {
  // Get hotel statistics
  getHotelStats: async (): Promise<ApiResponse<HotelStats>> => {
    await delay(500);
    
    const stats: HotelStats = {
      totalRooms: mockRooms.length,
      occupiedRooms: mockRooms.filter(room => room.status === 'occupied').length,
      availableRooms: mockRooms.filter(room => room.status === 'available').length,
      outOfOrderRooms: mockRooms.filter(room => room.status === 'out-of-order' || room.status === 'maintenance').length,
      todayCheckIns: mockBookings.filter(booking => booking.checkIn === new Date().toISOString().split('T')[0]).length,
      todayCheckOuts: mockBookings.filter(booking => booking.checkOut === new Date().toISOString().split('T')[0]).length,
      todayRevenue: 2500,
      monthlyRevenue: 45000,
      averageRate: 200,
      occupancyRate: Math.round((mockRooms.filter(room => room.status === 'occupied').length / mockRooms.length) * 100)
    };

    return {
      data: stats,
      success: true,
      message: 'Hotel statistics fetched successfully'
    };
  },

  // Get recent bookings
  getRecentBookings: async (limit: number = 5): Promise<ApiResponse<any[]>> => {
    await delay(300);
    const recentBookings = mockBookings
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
    
    return {
      data: recentBookings,
      success: true,
      message: 'Recent bookings fetched successfully'
    };
  },

  // Get revenue data for charts
  getRevenueData: async (period: 'week' | 'month' | 'quarter' | 'year' = 'month'): Promise<ApiResponse<any[]>> => {
    await delay(300);
    
    // Mock revenue data
    const revenueData = [
      { month: 'Jan', revenue: 45000, bookings: 180, occupancy: 75 },
      { month: 'Feb', revenue: 52000, bookings: 210, occupancy: 82 },
      { month: 'Mar', revenue: 48000, bookings: 195, occupancy: 78 },
      { month: 'Apr', revenue: 58000, bookings: 235, occupancy: 88 },
      { month: 'May', revenue: 61000, bookings: 248, occupancy: 92 },
      { month: 'Jun', revenue: 55000, bookings: 225, occupancy: 85 },
    ];

    return {
      data: revenueData,
      success: true,
      message: 'Revenue data fetched successfully'
    };
  },

  // Get room status overview
  getRoomStatusOverview: async (): Promise<ApiResponse<any[]>> => {
    await delay(300);
    
    const roomStatusData = [
      { status: 'Available', count: mockRooms.filter(r => r.status === 'available').length, color: '#10B981' },
      { status: 'Occupied', count: mockRooms.filter(r => r.status === 'occupied').length, color: '#3B82F6' },
      { status: 'Cleaning', count: mockRooms.filter(r => r.status === 'cleaning').length, color: '#F59E0B' },
      { status: 'Maintenance', count: mockRooms.filter(r => r.status === 'maintenance').length, color: '#EF4444' },
      { status: 'Out of Order', count: mockRooms.filter(r => r.status === 'out-of-order').length, color: '#6B7280' },
    ];

    return {
      data: roomStatusData,
      success: true,
      message: 'Room status overview fetched successfully'
    };
  }
};
