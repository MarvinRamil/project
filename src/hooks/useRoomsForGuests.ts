import { useState, useEffect, useMemo } from 'react';
import { Room } from '../api/types';
import { roomsApi } from '../api';

export const useRoomsForGuests = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await roomsApi.getAllRoomsForGuests();
      if (response.success) {
        setRooms(response.data);
      } else {
        setError(response.message || 'Failed to fetch rooms');
      }
    } catch (err) {
      setError('Failed to fetch rooms');
      console.error('Rooms fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredRooms = useMemo(() => {
    return rooms.filter(room => {
      // Only show available rooms for guests
      return room.status === 'available';
    });
  }, [rooms]);

  useEffect(() => {
    fetchRooms();
  }, []);

  return {
    rooms: filteredRooms,
    loading,
    error,
    refreshData: fetchRooms
  };
};
