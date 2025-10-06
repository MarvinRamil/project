import { useState, useEffect } from 'react';
import { Guest } from '../api/types';
import { guestsApi } from '../api/guests';
import { getCurrentUserFromToken } from '../api/auth';

interface UseGuestInfoReturn {
  guest: Guest | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useGuestInfo = (): UseGuestInfoReturn => {
  const [guest, setGuest] = useState<Guest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGuestInfo = async () => {
    try {
      console.log('=== FETCHING GUEST INFO ===');
      setLoading(true);
      setError(null);

      // Get current user from token to extract username/email
      console.log('Getting current user from token...');
      const currentUser = getCurrentUserFromToken();
      console.log('Current user from token:', currentUser);
      
      if (!currentUser) {
        console.error('No current user found in token');
        throw new Error('No user found in authentication token');
      }
      
      // Use email as username for the API call
      let username = currentUser.email;
      
      // If no email in token, try to get from localStorage as fallback
      if (!username) {
        console.log('No email in token, checking localStorage...');
        const savedUser = localStorage.getItem('hotelUser');
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser);
          username = parsedUser.email;
          console.log('Found email in localStorage:', username);
        }
      }
      
      if (!username) {
        console.error('No email/username found in current user:', currentUser);
        console.error('Available user properties:', Object.keys(currentUser));
        throw new Error('No user email/username found in token or localStorage');
      }

      console.log('Fetching guest info for username:', username);
      console.log('Calling guestsApi.getGuestByEmail...');
      
      // Fetch guest information using the email/username from token
      const response = await guestsApi.getGuestByEmail(username);
      console.log('API response:', response);
      
      if (response.success && response.data) {
        console.log('Guest info fetched successfully:', response.data);
        setGuest(response.data);
      } else {
        console.error('API call failed:', response);
        throw new Error(response.message || 'Failed to fetch guest information');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch guest information';
      console.error('=== ERROR FETCHING GUEST INFO ===');
      console.error('Error message:', errorMessage);
      console.error('Full error:', err);
      setError(errorMessage);
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuestInfo();
  }, []);

  return {
    guest,
    loading,
    error,
    refetch: fetchGuestInfo
  };
};
