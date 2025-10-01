import { useState, useEffect, useMemo } from 'react';
import { Room, RoomStatus } from '../api/types';
import { roomsApi } from '../api';

export const useRooms = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchRooms = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await roomsApi.getAllRooms();
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
      const matchesStatus = statusFilter === 'all' || room.status === statusFilter;
      const matchesSearch = room.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           room.type.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [rooms, statusFilter, searchTerm]);

  const updateRoomStatus = async (roomId: number, status: RoomStatus) => {
    try {
      const response = await roomsApi.updateRoomStatus(roomId, status);
      if (response.success) {
        // Update local state with new status
        setRooms(prev => prev.map(room => 
          room.id === roomId ? { ...room, status } : room
        ));
        return { success: true, data: response.data };
      } else {
        setError(response.message || 'Failed to update room status');
        return { success: false, error: response.message };
      }
    } catch (err) {
      setError('Failed to update room status');
      console.error('Update room status error:', err);
      return { success: false, error: 'Failed to update room status' };
    }
  };

  const createRoom = async (roomData: Omit<Room, 'id'>) => {
    try {
      const response = await roomsApi.createRoom(roomData);
      if (response.success) {
        setRooms(prev => [...prev, response.data]);
        return { success: true, data: response.data };
      } else {
        setError(response.message || 'Failed to create room');
        return { success: false, error: response.message };
      }
    } catch (err) {
      setError('Failed to create room');
      console.error('Create room error:', err);
      return { success: false, error: 'Failed to create room' };
    }
  };

  const updateRoom = async (roomId: number, updates: Partial<Room>) => {
    try {
      const response = await roomsApi.updateRoom(roomId, updates);
      if (response.success) {
        setRooms(prev => prev.map(room => 
          room.id === roomId ? response.data : room
        ));
        return { success: true, data: response.data };
      } else {
        setError(response.message || 'Failed to update room');
        return { success: false, error: response.message };
      }
    } catch (err) {
      setError('Failed to update room');
      console.error('Update room error:', err);
      return { success: false, error: 'Failed to update room' };
    }
  };

  const deleteRoom = async (roomId: number) => {
    try {
      const response = await roomsApi.deleteRoom(roomId);
      if (response.success) {
        setRooms(prev => prev.filter(room => room.id !== roomId));
        return { success: true };
      } else {
        setError(response.message || 'Failed to delete room');
        return { success: false, error: response.message };
      }
    } catch (err) {
      setError('Failed to delete room');
      console.error('Delete room error:', err);
      return { success: false, error: 'Failed to delete room' };
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      available: 'bg-green-100 text-green-800',
      occupied: 'bg-blue-100 text-blue-800',
      cleaning: 'bg-yellow-100 text-yellow-800',
      maintenance: 'bg-red-100 text-red-800',
      'out-of-order': 'bg-gray-100 text-gray-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getRoomStats = () => {
    return {
      total: rooms.length,
      available: rooms.filter(r => r.status === 'available').length,
      occupied: rooms.filter(r => r.status === 'occupied').length,
      cleaning: rooms.filter(r => r.status === 'cleaning').length,
      maintenance: rooms.filter(r => r.status === 'maintenance').length,
      outOfOrder: rooms.filter(r => r.status === 'out-of-order').length
    };
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  return {
    rooms: filteredRooms,
    loading,
    error,
    statusFilter,
    setStatusFilter,
    searchTerm,
    setSearchTerm,
    updateRoomStatus,
    createRoom,
    updateRoom,
    deleteRoom,
    getStatusColor,
    getRoomStats,
    refreshData: fetchRooms
  };
};
