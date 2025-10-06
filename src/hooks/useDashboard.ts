import { useState, useEffect } from 'react';
import { HotelStats, Room, Booking, DashboardData, RevenueData, RoomStatusOverview, QuickAction } from '../api/types';
import { dashboardApi } from '../api';
import { tokenManager } from '../utils/tokenManager';
import { useAuth } from './useAuth';

export const useDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<HotelStats | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [roomStatusOverview, setRoomStatusOverview] = useState<RoomStatusOverview[]>([]);
  const [quickActions, setQuickActions] = useState<QuickAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      console.log('Dashboard: Starting to fetch data...');
      console.log('Dashboard: Checking authentication status...');
      
      // Check if we have a valid token
      const token = tokenManager.getAccessToken();
      console.log('Dashboard: Current token status:', {
        hasToken: !!token,
        isExpired: tokenManager.isTokenExpired(),
        isAuthenticated: tokenManager.isAuthenticated()
      });
      
      setLoading(true);
      setError(null);

      // Fetch stats from the dedicated stats endpoint
      const statsResponse = await dashboardApi.getHotelStats();
      console.log('Dashboard: Stats response:', statsResponse);

      if (statsResponse.success) {
        setStats(statsResponse.data);
        console.log('Dashboard: Stats set successfully');
      }

      // Fetch complete dashboard data for other components
      const dashboardResponse = await dashboardApi.getDashboardData(1, 111);
      console.log('Dashboard: Dashboard API response:', dashboardResponse);

      if (dashboardResponse.success) {
        const data = dashboardResponse.data;
        
        // Set other dashboard data (but keep stats from dedicated endpoint)
        setBookings(data.recentBookings);
        setRevenueData(data.revenueData);
        setRoomStatusOverview(data.roomStatusOverview);
        setQuickActions(data.quickActions);
        
        console.log('Dashboard: All data set successfully');
      } else {
        console.warn('Dashboard: Failed to fetch dashboard data, but stats were fetched successfully');
      }
    } catch (err) {
      setError('Failed to fetch dashboard data');
      console.error('Dashboard data fetch error:', err);
    } finally {
      setLoading(false);
      console.log('Dashboard: Data fetch completed, loading set to false');
    }
  };

  const refreshData = () => {
    fetchDashboardData();
  };

  useEffect(() => {
    // Only fetch dashboard data if user is authenticated
    if (user && tokenManager.isAuthenticated()) {
      console.log('Dashboard: User authenticated, fetching data...');
      fetchDashboardData();
    } else {
      console.log('Dashboard: User not authenticated, skipping data fetch');
      setLoading(false);
    }
  }, [user]);

  return {
    stats,
    rooms,
    bookings,
    revenueData,
    roomStatusOverview,
    quickActions,
    loading,
    error,
    refreshData
  };
};
