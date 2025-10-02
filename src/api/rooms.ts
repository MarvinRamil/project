import { Room, RoomStatus, ApiResponse, CreateRoomRequest } from './types';
import { getAuthToken } from './auth';
import { getImageUrl, getApiUrl, API_BASE_URL } from '../config/api';

// Interface for API room response
interface ApiRoomResponse {
  id: number;
  number: string;
  type: string;
  status: number;
  price: number;
  capacity: number;
  amenities: string[];
  floor: number;
  description?: string;
  images?: string[];
  lastCleaned?: string | null;
  currentGuest?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

// Status mapping from API numbers to our string format
const statusMapping: { [key: number]: RoomStatus } = {
  0: 'available',
  1: 'occupied', 
  2: 'cleaning',
  3: 'maintenance',
  4: 'out-of-order'
};

// Helper function to map API room data to our Room interface
const mapApiRoomToRoom = (apiRoom: ApiRoomResponse): Room => ({
  id: apiRoom.id,
  number: apiRoom.number,
  type: apiRoom.type,
  status: statusMapping[apiRoom.status] || 'available',
  price: apiRoom.price,
  capacity: apiRoom.capacity,
  amenities: apiRoom.amenities || [],
  floor: apiRoom.floor,
  description: apiRoom.description,
  images: (apiRoom.images || []).map(imagePath => getImageUrl(imagePath)),
  lastCleaned: apiRoom.lastCleaned,
  currentGuest: apiRoom.currentGuest,
  createdAt: apiRoom.createdAt,
  updatedAt: apiRoom.updatedAt
});

export const roomsApi = {
  // Get all rooms (for authenticated users)
  getAllRooms: async (): Promise<ApiResponse<Room[]>> => {
    try {
      const token = getAuthToken();
      const response = await fetch(getApiUrl('Room'), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        mode: 'cors',
        credentials: 'omit'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          data: [],
          success: false,
          message: errorData.message || `HTTP error! status: ${response.status}`
        };
      }

      const apiResponse = await response.json();
      
      // Map API response to our format
      const rooms = apiResponse.data.map(mapApiRoomToRoom);
      
      return {
        data: rooms,
        success: true,
        message: apiResponse.message || 'Rooms fetched successfully'
      };
    } catch (error) {
      console.error('Get rooms API error:', error);
      return {
        data: [],
        success: false,
        message: 'Network error or server unavailable'
      };
    }
  },

  // Get all rooms (for guest access - no authentication required)
  getAllRoomsForGuests: async (): Promise<ApiResponse<Room[]>> => {
    try {
      const response = await fetch(getApiUrl('Room'), {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        },
        mode: 'cors',
        credentials: 'omit'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          data: [],
          success: false,
          message: errorData.message || `HTTP error! status: ${response.status}`
        };
      }

      const apiResponse = await response.json();
      
      // Map API response to our format
      const rooms = apiResponse.data.map(mapApiRoomToRoom);
      
      return {
        data: rooms,
        success: true,
        message: 'Rooms fetched successfully'
      };
    } catch (error) {
      console.error('Error fetching rooms for guests:', error);
      return {
        data: [],
        success: false,
        message: 'Failed to fetch rooms'
      };
    }
  },

  // Get room by ID
  getRoomById: async (id: number): Promise<ApiResponse<Room>> => {
    try {
      const token = getAuthToken();
      const response = await fetch(getApiUrl(`Room/${id}`), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        mode: 'cors',
        credentials: 'omit'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          data: {} as Room,
          success: false,
          message: errorData.message || `HTTP error! status: ${response.status}`
        };
      }

      const apiResponse = await response.json();
      const room = mapApiRoomToRoom(apiResponse.data);
      
      return {
        data: room,
        success: true,
        message: apiResponse.message || 'Room fetched successfully'
      };
    } catch (error) {
      console.error('Get room by ID API error:', error);
      return {
        data: {} as Room,
        success: false,
        message: 'Network error or server unavailable'
      };
    }
  },

  // Update room status
  updateRoomStatus: async (roomId: number, status: RoomStatus): Promise<ApiResponse<Room>> => {
    try {
      const token = getAuthToken();
      
      // Convert status to proper format for API (capitalize first letter)
      const formattedStatus = status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ');
      
      const response = await fetch(getApiUrl(`Room/${roomId}/status`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        mode: 'cors',
        credentials: 'omit',
        body: JSON.stringify(formattedStatus)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          data: {} as Room,
          success: false,
          message: errorData.message || `HTTP error! status: ${response.status}`
        };
      }

      // Handle different response formats
      let apiResponse;
      try {
        apiResponse = await response.json();
        console.log('Room status update response:', apiResponse);
      } catch {
        console.log('Response is not JSON, assuming success');
        // If response is not JSON, assume success since database was updated
        return {
          data: {} as Room,
          success: true,
          message: 'Room status updated successfully'
        };
      }

      // Handle different response structures
      let room;
      if (apiResponse.data) {
        room = mapApiRoomToRoom(apiResponse.data);
      } else if (apiResponse.id) {
        // If response is the room object directly
        room = mapApiRoomToRoom(apiResponse);
      } else {
        // If no room data in response, return success anyway
        return {
          data: {} as Room,
          success: true,
          message: apiResponse.message || 'Room status updated successfully'
        };
      }
      
      return {
        data: room,
        success: true,
        message: apiResponse.message || 'Room status updated successfully'
      };
    } catch (error) {
      console.error('Update room status API error:', error);
      return {
        data: {} as Room,
        success: false,
        message: 'Network error or server unavailable'
      };
    }
  },

  // Create new room
  createRoom: async (roomData: CreateRoomRequest): Promise<ApiResponse<Room>> => {
    try {
      const token = getAuthToken();
      const response = await fetch(getApiUrl('Room'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        mode: 'cors',
        credentials: 'omit',
        body: JSON.stringify(roomData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          data: {} as Room,
          success: false,
          message: errorData.message || `HTTP error! status: ${response.status}`
        };
      }

      const apiResponse = await response.json();
      const room = mapApiRoomToRoom(apiResponse.data);
      
      return {
        data: room,
        success: true,
        message: apiResponse.message || 'Room created successfully'
      };
    } catch (error) {
      console.error('Create room API error:', error);
      return {
        data: {} as Room,
        success: false,
        message: 'Network error or server unavailable'
      };
    }
  },

  // Update room
  updateRoom: async (roomId: number, updates: Partial<Room>): Promise<ApiResponse<Room>> => {
    try {
      const token = getAuthToken();
      const response = await fetch(getApiUrl(`Room/${roomId}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        mode: 'cors',
        credentials: 'omit',
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          data: {} as Room,
          success: false,
          message: errorData.message || `HTTP error! status: ${response.status}`
        };
      }

      const apiResponse = await response.json();
      const room = mapApiRoomToRoom(apiResponse.data);
      
      return {
        data: room,
        success: true,
        message: apiResponse.message || 'Room updated successfully'
      };
    } catch (error) {
      console.error('Update room API error:', error);
      return {
        data: {} as Room,
        success: false,
        message: 'Network error or server unavailable'
      };
    }
  },

  // Delete room
  deleteRoom: async (roomId: number): Promise<ApiResponse<boolean>> => {
    try {
      const token = getAuthToken();
      const response = await fetch(getApiUrl(`Room/${roomId}`), {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        mode: 'cors',
        credentials: 'omit'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          data: false,
          success: false,
          message: errorData.message || `HTTP error! status: ${response.status}`
        };
      }

      return {
        data: true,
        success: true,
        message: 'Room deleted successfully'
      };
    } catch (error) {
      console.error('Delete room API error:', error);
      return {
        data: false,
        success: false,
        message: 'Network error or server unavailable'
      };
    }
  },

  // Upload room images
  uploadRoomImages: async (roomId: number, files: File[]): Promise<ApiResponse<string[]>> => {
    try {
      const token = getAuthToken();
      
      // Create FormData with the correct structure for RoomImageUploadDto
      const formData = new FormData();
      
      // Add RoomId
      formData.append('RoomId', roomId.toString());
      
      // Add all images to the Images array
      files.forEach((file) => {
        formData.append('Images', file);
      });

      console.log('API: Uploading files for room:', roomId);
      console.log('API: Number of files:', files.length);

      const response = await fetch(getApiUrl('RoomImage/upload'), {
        method: 'POST',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: formData
      });

      console.log('API: Upload response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API: Upload failed:', response.status, errorText);
        throw new Error(`Upload failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('API: Upload result:', result);
      
      // Extract URLs from the response
      const uploadedUrls = result.data || result || [];
      
      return {
        data: uploadedUrls,
        success: true,
        message: 'Images uploaded successfully'
      };
    } catch (error) {
      console.error('Upload room images API error:', error);
      return {
        data: [],
        success: false,
        message: `Failed to upload images: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
};
