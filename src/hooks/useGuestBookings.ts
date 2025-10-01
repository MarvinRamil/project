import { useState, useEffect } from 'react';
import { Booking } from '../api/types';
import { bookingsApi } from '../api';

export const useGuestBookings = (guestId: number | null) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGuestBookings = async () => {
    if (!guestId) {
      setBookings([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await bookingsApi.getBookingsByGuestId(guestId);
      if (response.success) {
        setBookings(response.data);
      } else {
        setError(response.message || 'Failed to fetch guest bookings');
      }
    } catch (err) {
      setError('Failed to fetch guest bookings');
      console.error('Guest bookings fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuestBookings();
  }, [guestId]);

  return {
    bookings,
    loading,
    error,
    refreshBookings: fetchGuestBookings
  };
};
