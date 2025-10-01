import { useState, useEffect, useMemo } from 'react';
import { Booking,   BookingStatus } from '../api/types';
import { bookingsApi } from '../api';

export const useBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const getStatusText = (status: BookingStatus) => {
    const statusMap = {
      [BookingStatus.Pending]: 'pending',
      [BookingStatus.Confirmed]: 'confirmed',
      [BookingStatus.CheckedIn]: 'checked-in',
      [BookingStatus.CheckedOut]: 'checked-out',
      [BookingStatus.Cancelled]: 'cancelled',
      [BookingStatus.NoShow]: 'no-show'
    };
    return statusMap[status] || 'unknown';
  };

  const getStatusDisplayName = (status: BookingStatus) => {
    const displayMap = {
      [BookingStatus.Pending]: 'Pending',
      [BookingStatus.Confirmed]: 'Confirmed',
      [BookingStatus.CheckedIn]: 'Checked In',
      [BookingStatus.CheckedOut]: 'Checked Out',
      [BookingStatus.Cancelled]: 'Cancelled',
      [BookingStatus.NoShow]: 'No Show'
    };
    return displayMap[status] || 'Unknown';
  };

  const fetchBookingsData = async () => {
    try {
      setLoading(true);
      setError(null);

      const bookingsResponse = await bookingsApi.getAllBookings();

      if (bookingsResponse.success) {
        setBookings(bookingsResponse.data);
      } else {
        setError(bookingsResponse.message || 'Failed to fetch bookings');
      }
    } catch (err) {
      setError('Failed to fetch bookings data');
      console.error('Bookings data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = useMemo(() => {
    return bookings.filter(booking => {
      const statusText = getStatusText(booking.status);
      const matchesStatus = statusFilter === 'all' || statusText === statusFilter;
      const matchesSearch = 
        booking.bookingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.guest.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.guest.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.room.number.includes(searchTerm);
      return matchesStatus && matchesSearch;
    });
  }, [bookings, statusFilter, searchTerm]);

  const updateBookingStatus = async (bookingId: number, status: BookingStatus) => {
    try {
      const response = await bookingsApi.updateBookingStatus(bookingId, status);
      if (response.success) {
        setBookings(prev => prev.map(booking => 
          booking.id === bookingId ? { ...booking, status: status } : booking
        ));
        return { success: true, message: response.message };
      } else {
        setError(response.message || 'Failed to update booking status');
        return { success: false, message: response.message };
      }
    } catch (err) {
      setError('Failed to update booking status');
      console.error('Status update error:', err);
      return { success: false, message: 'Failed to update booking status' };
    }
  };

  const checkIn = async (bookingId: number) => {
    console.log(`Checking in booking ${bookingId}, status value:`, BookingStatus.CheckedIn);
    return await updateBookingStatus(bookingId, BookingStatus.CheckedIn);
  };

  const checkOut = async (bookingId: number) => {
    console.log(`Checking out booking ${bookingId}, status value:`, BookingStatus.CheckedOut);
    return await updateBookingStatus(bookingId, BookingStatus.CheckedOut);
  };

  const cancelBooking = async (bookingId: number) => {
    return await updateBookingStatus(bookingId, BookingStatus.Cancelled);
  };

  const markNoShow = async (bookingId: number) => {
    return await updateBookingStatus(bookingId, BookingStatus.NoShow);
  };

  const confirmBooking = async (bookingId: number) => {
    return await updateBookingStatus(bookingId, BookingStatus.Confirmed);
  };

  const canConfirm = (booking: Booking) => {
    return booking.status === BookingStatus.Pending;
  };

  const canCheckIn = (booking: Booking) => {
    // Can check in if status is Confirmed and check-in date is today or earlier
    const today = new Date().toISOString().split('T')[0];
    const checkInDate = new Date(booking.checkIn).toISOString().split('T')[0];
    
    return booking.status === BookingStatus.Confirmed && checkInDate <= today;
  };

  const canCheckOut = (booking: Booking) => {
    // Can check out if status is CheckedIn
    return booking.status === BookingStatus.CheckedIn;
  };

  const getCheckInStatus = (booking: Booking) => {
    const today = new Date().toISOString().split('T')[0];
    const checkInDate = new Date(booking.checkIn).toISOString().split('T')[0];
    const checkOutDate = new Date(booking.checkOut).toISOString().split('T')[0];
    
    if (booking.status === BookingStatus.CheckedIn) {
      return 'checked-in';
    } else if (booking.status === BookingStatus.CheckedOut) {
      return 'checked-out';
    } else if (booking.status === BookingStatus.Confirmed) {
      if (checkInDate < today) {
        return 'overdue-checkin';
      } else if (checkInDate === today) {
        return 'checkin-today';
      } else {
        return 'future-checkin';
      }
    } else {
      return 'not-confirmed';
    }
  };

  const canCancel = (booking: Booking) => {
    return booking.status === BookingStatus.Pending || booking.status === BookingStatus.Confirmed || booking.status === BookingStatus.CheckedIn;
  };

  const canMarkNoShow = (booking: Booking) => {
    const today = new Date().toISOString().split('T')[0];
    return booking.status === BookingStatus.Confirmed && booking.checkIn < today;
  };

  const getStatusColor = (status: BookingStatus) => {
    const colors = {
      [BookingStatus.Pending]: 'bg-orange-100 text-orange-800',
      [BookingStatus.Confirmed]: 'bg-blue-100 text-blue-800',
      [BookingStatus.CheckedIn]: 'bg-green-100 text-green-800',
      [BookingStatus.CheckedOut]: 'bg-gray-100 text-gray-800',
      [BookingStatus.Cancelled]: 'bg-red-100 text-red-800',
      [BookingStatus.NoShow]: 'bg-yellow-100 text-yellow-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  useEffect(() => {
    fetchBookingsData();
  }, []);

  return {
    bookings: filteredBookings,
    loading,
    error,
    statusFilter,
    setStatusFilter,
    searchTerm,
    setSearchTerm,
    updateBookingStatus,
    checkIn,
    checkOut,
    cancelBooking,
    markNoShow,
    confirmBooking,
    canCheckIn,
    canCheckOut,
    canCancel,
    canMarkNoShow,
    canConfirm,
    getStatusColor,
    getStatusText,
    getStatusDisplayName,
    getCheckInStatus,
    refreshData: fetchBookingsData
  };
};
