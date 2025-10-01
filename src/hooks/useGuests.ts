import { useState, useEffect, useMemo } from 'react';
import { Guest } from '../api/types';
import { guestsApi } from '../api';

export const useGuests = () => {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<string>('name');

  const fetchGuests = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await guestsApi.getAllGuests();
      if (response.success) {
        setGuests(response.data);
      } else {
        setError(response.message || 'Failed to fetch guests');
      }
    } catch (err) {
      setError('Failed to fetch guests');
      console.error('Guests fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedGuests = useMemo(() => {
    return guests
      .filter(guest => {
        const matchesSearch = 
          guest.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          guest.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          guest.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          guest.phone.includes(searchTerm);
        return matchesSearch;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'name':
            return (a.firstName + a.lastName).localeCompare(b.firstName + b.lastName);
          case 'stays':
            return b.totalStays - a.totalStays;
          case 'spent':
            return b.totalSpent - a.totalSpent;
          default:
            return 0;
        }
      });
  }, [guests, searchTerm, sortBy]);

  const createGuest = async (guestData: Omit<Guest, 'id' | 'totalStays' | 'totalSpent' | 'joinDate' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await guestsApi.createGuest(guestData);
      if (response.success) {
        setGuests(prev => [...prev, response.data]);
        return { success: true, data: response.data };
      } else {
        setError(response.message || 'Failed to create guest');
        return { success: false, error: response.message };
      }
    } catch (err) {
      setError('Failed to create guest');
      console.error('Create guest error:', err);
      return { success: false, error: 'Failed to create guest' };
    }
  };

  const updateGuest = async (guestId: number, updates: Partial<Guest>) => {
    try {
      const response = await guestsApi.updateGuest(guestId, updates);
      if (response.success) {
        setGuests(prev => prev.map(guest => 
          guest.id === guestId ? response.data : guest
        ));
        return { success: true, data: response.data };
      } else {
        setError(response.message || 'Failed to update guest');
        return { success: false, error: response.message };
      }
    } catch (err) {
      setError('Failed to update guest');
      console.error('Update guest error:', err);
      return { success: false, error: 'Failed to update guest' };
    }
  };

  const deleteGuest = async (guestId: number) => {
    try {
      const response = await guestsApi.deleteGuest(guestId);
      if (response.success) {
        setGuests(prev => prev.filter(guest => guest.id !== guestId));
        return { success: true };
      } else {
        setError(response.message || 'Failed to delete guest');
        return { success: false, error: response.message };
      }
    } catch (err) {
      setError('Failed to delete guest');
      console.error('Delete guest error:', err);
      return { success: false, error: 'Failed to delete guest' };
    }
  };

  const searchGuests = async (query: string) => {
    try {
      const response = await guestsApi.searchGuests(query);
      if (response.success) {
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.message };
      }
    } catch (err) {
      console.error('Search guests error:', err);
      return { success: false, error: 'Failed to search guests' };
    }
  };

  useEffect(() => {
    fetchGuests();
  }, []);

  return {
    guests: filteredAndSortedGuests,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    sortBy,
    setSortBy,
    createGuest,
    updateGuest,
    deleteGuest,
    searchGuests,
    refreshData: fetchGuests
  };
};
