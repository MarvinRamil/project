import React, { createContext, useContext, ReactNode } from 'react';
import { useDashboard, useBookings, useGuests, useRooms, useStaff } from '../hooks';

interface HotelContextType {
  // Dashboard data
  stats: any;
  rooms: any[];
  bookings: any[];
  guests: any[];
  staff: any[];
  // Methods
  updateRoomStatus: (roomId: string, status: any) => Promise<any>;
  addBooking: (booking: any) => Promise<any>;
  updateBooking: (bookingId: string, updates: any) => Promise<any>;
  addGuest: (guest: any) => Promise<any>;
  updateGuest: (guestId: string, updates: any) => Promise<any>;
  checkIn: (bookingId: string) => Promise<any>;
  checkOut: (bookingId: string) => Promise<any>;
}

const HotelContext = createContext<HotelContextType | undefined>(undefined);

export function HotelProvider({ children }: { children: ReactNode }) {
  const dashboard = useDashboard();
  const bookingsHook = useBookings();
  const guestsHook = useGuests();
  const roomsHook = useRooms();
  const staffHook = useStaff();

  const contextValue: HotelContextType = {
    // Dashboard data
    stats: dashboard.stats,
    rooms: roomsHook.rooms,
    bookings: bookingsHook.bookings,
    guests: guestsHook.guests,
    staff: staffHook.staff,
    // Methods
    updateRoomStatus: roomsHook.updateRoomStatus,
    addBooking: bookingsHook.createBooking || (() => Promise.resolve({ success: false })),
    updateBooking: bookingsHook.updateBooking || (() => Promise.resolve({ success: false })),
    addGuest: guestsHook.createGuest,
    updateGuest: guestsHook.updateGuest,
    checkIn: bookingsHook.checkIn,
    checkOut: bookingsHook.checkOut,
  };

  return (
    <HotelContext.Provider value={contextValue}>
      {children}
    </HotelContext.Provider>
  );
}

export function useHotel() {
  const context = useContext(HotelContext);
  if (context === undefined) {
    throw new Error('useHotel must be used within a HotelProvider');
  }
  return context;
}