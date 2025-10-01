import { useState, useEffect } from 'react';
import { HotelStats, Room, Booking } from '../api/types';
import { dashboardApi, roomsApi, bookingsApi } from '../api';

export const useDashboard = () => {
  const [stats, setStats] = useState<HotelStats | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      console.log('Dashboard: Starting to fetch data...');
      setLoading(true);
      setError(null);

      const [statsResponse, roomsResponse, bookingsResponse] = await Promise.all([
        dashboardApi.getHotelStats(),
        roomsApi.getAllRooms(),
        bookingsApi.getAllBookings()
      ]);

      console.log('Dashboard: API responses:', { statsResponse, roomsResponse, bookingsResponse });

      if (statsResponse.success) {
        setStats(statsResponse.data);
        console.log('Dashboard: Stats set:', statsResponse.data);
      }

      if (roomsResponse.success) {
        setRooms(roomsResponse.data);
        console.log('Dashboard: Rooms set:', roomsResponse.data.length, 'rooms');
      }

      if (bookingsResponse.success) {
        setBookings(bookingsResponse.data);
        console.log('Dashboard: Bookings set:', bookingsResponse.data.length, 'bookings');
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
    fetchDashboardData();
  }, []);

  const recentBookings = bookings.slice(0, 5);

  return {
    stats,
    rooms,
    bookings: recentBookings,
    loading,
    error,
    refreshData
  };
};
