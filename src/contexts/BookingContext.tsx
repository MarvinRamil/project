import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SearchCriteria {
  destination: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: number;
}

interface Hotel {
  id: string;
  name: string;
  location: string;
  rating: number;
  reviewCount: number;
  price: number;
  image: string;
  images: string[];
  amenities: string[];
  description: string;
  coordinates: { lat: number; lng: number };
}

interface Room {
  id: string;
  hotelId: string;
  name: string;
  type: string;
  price: number;
  capacity: number;
  amenities: string[];
  images: string[];
  available: boolean;
}

interface Booking {
  id: string;
  hotelId: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
}

interface BookingContextType {
  searchCriteria: SearchCriteria;
  setSearchCriteria: (criteria: SearchCriteria) => void;
  hotels: Hotel[];
  setHotels: (hotels: Hotel[]) => void;
  selectedHotel: Hotel | null;
  setSelectedHotel: (hotel: Hotel | null) => void;
  selectedRoom: Room | null;
  setSelectedRoom: (room: Room | null) => void;
  bookings: Booking[];
  addBooking: (booking: Omit<Booking, 'id' | 'createdAt'>) => void;
  searchHotels: (criteria: SearchCriteria) => Promise<Hotel[]>;
  getRoomsForHotel: (hotelId: string) => Promise<Room[]>;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

// Mock data
const mockHotels: Hotel[] = [
  {
    id: '1',
    name: 'Grand Plaza Hotel',
    location: 'New York, NY',
    rating: 4.5,
    reviewCount: 1248,
    price: 299,
    image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop'
    ],
    amenities: ['WiFi', 'Pool', 'Gym', 'Restaurant', 'Spa', 'Room Service'],
    description: 'Experience luxury at its finest in the heart of Manhattan. Our grand hotel offers world-class amenities and unparalleled service.',
    coordinates: { lat: 40.7589, lng: -73.9851 }
  },
  {
    id: '2',
    name: 'Seaside Resort & Spa',
    location: 'Miami Beach, FL',
    rating: 4.8,
    reviewCount: 892,
    price: 459,
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1578911373434-0cb395d2cbfb?w=800&h=600&fit=crop'
    ],
    amenities: ['Beachfront', 'Pool', 'Spa', 'Restaurant', 'Bar', 'Water Sports'],
    description: 'Relax and unwind at our beachfront paradise. Enjoy stunning ocean views and world-class spa treatments.',
    coordinates: { lat: 25.7617, lng: -80.1918 }
  },
  {
    id: '3',
    name: 'Mountain View Lodge',
    location: 'Aspen, CO',
    rating: 4.3,
    reviewCount: 654,
    price: 399,
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop'
    ],
    amenities: ['Ski Access', 'Fireplace', 'Restaurant', 'Bar', 'Spa', 'WiFi'],
    description: 'Escape to the mountains and enjoy breathtaking views, world-class skiing, and cozy luxury.',
    coordinates: { lat: 39.1911, lng: -106.8175 }
  }
];

const mockRooms: Room[] = [
  {
    id: '1-1',
    hotelId: '1',
    name: 'Deluxe King Room',
    type: 'King',
    price: 299,
    capacity: 2,
    amenities: ['King Bed', 'City View', 'WiFi', 'Mini Bar', 'Coffee Maker'],
    images: [
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&h=600&fit=crop'
    ],
    available: true
  },
  {
    id: '1-2',
    hotelId: '1',
    name: 'Executive Suite',
    type: 'Suite',
    price: 499,
    capacity: 4,
    amenities: ['Separate Living Room', 'City View', 'WiFi', 'Mini Bar', 'Coffee Maker', 'Balcony'],
    images: [
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&h=600&fit=crop'
    ],
    available: true
  }
];

export function BookingProvider({ children }: { children: ReactNode }) {
  const [searchCriteria, setSearchCriteria] = useState<SearchCriteria>({
    destination: '',
    checkIn: '',
    checkOut: '',
    guests: 2,
    rooms: 1
  });
  
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);

  const searchHotels = async (criteria: SearchCriteria): Promise<Hotel[]> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Filter hotels based on criteria (simplified)
    const filteredHotels = mockHotels.filter(hotel => 
      criteria.destination === '' || 
      hotel.location.toLowerCase().includes(criteria.destination.toLowerCase())
    );
    
    setHotels(filteredHotels);
    return filteredHotels;
  };

  const getRoomsForHotel = async (hotelId: string): Promise<Room[]> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return mockRooms.filter(room => room.hotelId === hotelId);
  };

  const addBooking = (bookingData: Omit<Booking, 'id' | 'createdAt'>) => {
    const newBooking: Booking = {
      ...bookingData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    
    setBookings(prev => [...prev, newBooking]);
  };

  return (
    <BookingContext.Provider value={{
      searchCriteria,
      setSearchCriteria,
      hotels,
      setHotels,
      selectedHotel,
      setSelectedHotel,
      selectedRoom,
      setSelectedRoom,
      bookings,
      addBooking,
      searchHotels,
      getRoomsForHotel
    }}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
}