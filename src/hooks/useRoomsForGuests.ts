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

      console.log('useRoomsForGuests: Fetching rooms...');
      const response = await roomsApi.getAllRoomsForGuests();
      console.log('useRoomsForGuests: API response:', response);
      
      if (response.success) {
        console.log('useRoomsForGuests: Setting rooms:', response.data);
        setRooms(response.data);
      } else {
        console.log('useRoomsForGuests: API error:', response.message);
        setError(response.message || 'Failed to fetch rooms');
      }
    } catch (err) {
      console.error('useRoomsForGuests: Fetch error:', err);
      setError('Failed to fetch rooms');
    } finally {
      setLoading(false);
    }
  };

  const filteredRooms = useMemo(() => {
    console.log('useRoomsForGuests: Filtering rooms. Total rooms:', rooms.length);
    console.log('useRoomsForGuests: Room statuses:', rooms.map(r => ({ id: r.id, status: r.status })));
    
    const available = rooms.filter(room => {
      // Temporarily show all rooms for debugging
      console.log('useRoomsForGuests: Checking room:', { id: room.id, status: room.status, statusType: typeof room.status });
      return true; // Show all rooms temporarily
      // return room.status === 'available';
    });
    
    console.log('useRoomsForGuests: Available rooms:', available.length);
    return available;
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
