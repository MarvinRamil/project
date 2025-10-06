import React from 'react';
import { getCurrentUserFromToken } from '../api/auth';
import { tokenManager } from '../utils/tokenManager';

const DebugToken: React.FC = () => {
  const debugToken = () => {
    console.log('=== DEBUG TOKEN COMPONENT ===');
    
    // Get token
    const token = tokenManager.getAccessToken();
    console.log('Token exists:', !!token);
    console.log('Token preview:', token ? token.substring(0, 100) + '...' : 'No token');
    
    // Get user from token
    const user = getCurrentUserFromToken();
    console.log('User from token:', user);
    
    // Check localStorage
    const savedUser = localStorage.getItem('hotelUser');
    console.log('Saved user in localStorage:', savedUser ? JSON.parse(savedUser) : 'No saved user');
    
    // Decode token manually
    if (token) {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        const payload = JSON.parse(jsonPayload);
        console.log('Manual JWT decode:', payload);
        console.log('All payload keys:', Object.keys(payload));
      } catch (error) {
        console.error('Failed to decode token manually:', error);
      }
    }
  };

  return (
    <div className="p-4 bg-yellow-100 border border-yellow-400 rounded-lg m-4">
      <h3 className="text-lg font-bold text-yellow-800 mb-2">Debug Token</h3>
      <p className="text-yellow-700 mb-4">Click the button below to debug token information in the console.</p>
      <button
        onClick={debugToken}
        className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
      >
        Debug Token in Console
      </button>
    </div>
  );
};

export default DebugToken;
