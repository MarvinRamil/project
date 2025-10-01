import { Room, Guest, Booking, Staff } from './types';

// Mock data for development
export const mockRooms: Room[] = [
  { id: '1', number: '101', type: 'Standard Single', status: 'occupied', price: 120, capacity: 1, amenities: ['WiFi', 'TV', 'AC'], floor: 1, currentGuest: 'John Doe' },
  { id: '2', number: '102', type: 'Standard Double', status: 'available', price: 150, capacity: 2, amenities: ['WiFi', 'TV', 'AC', 'Mini Bar'], floor: 1 },
  { id: '3', number: '103', type: 'Standard Double', status: 'cleaning', price: 150, capacity: 2, amenities: ['WiFi', 'TV', 'AC', 'Mini Bar'], floor: 1 },
  { id: '4', number: '201', type: 'Deluxe Suite', status: 'available', price: 250, capacity: 3, amenities: ['WiFi', 'TV', 'AC', 'Mini Bar', 'Balcony'], floor: 2 },
  { id: '5', number: '202', type: 'Deluxe Suite', status: 'maintenance', price: 250, capacity: 3, amenities: ['WiFi', 'TV', 'AC', 'Mini Bar', 'Balcony'], floor: 2 },
  { id: '6', number: '301', type: 'Presidential Suite', status: 'occupied', price: 500, capacity: 4, amenities: ['WiFi', 'TV', 'AC', 'Mini Bar', 'Balcony', 'Kitchen'], floor: 3, currentGuest: 'Jane Smith' },
];

export const mockGuests: Guest[] = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@email.com',
    phone: '+1-555-0123',
    idNumber: 'ID123456789',
    nationality: 'USA',
    address: '123 Main St, New York, NY',
    preferences: ['Non-smoking', 'High floor'],
    totalStays: 5,
    totalSpent: 2500,
    joinDate: '2023-01-15'
  },
  {
    id: '2',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@email.com',
    phone: '+1-555-0124',
    idNumber: 'ID987654321',
    nationality: 'Canada',
    address: '456 Oak Ave, Toronto, ON',
    preferences: ['Late checkout', 'Room service'],
    totalStays: 3,
    totalSpent: 1800,
    joinDate: '2023-03-20'
  }
];

export const mockBookings: Booking[] = [
  {
    id: '1',
    guestId: '1',
    roomId: '1',
    checkIn: '2024-01-15',
    checkOut: '2024-01-18',
    guests: 1,
    status: 'checked-in',
    totalAmount: 360,
    paidAmount: 360,
    paymentMethod: 'Credit Card',
    createdAt: '2024-01-10'
  },
  {
    id: '2',
    guestId: '2',
    roomId: '6',
    checkIn: '2024-01-16',
    checkOut: '2024-01-20',
    guests: 2,
    status: 'checked-in',
    totalAmount: 2000,
    paidAmount: 1000,
    paymentMethod: 'Credit Card',
    createdAt: '2024-01-12'
  }
];

export const mockStaff: Staff[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    email: 'alice@hotel.com',
    role: 0, // Manager
    phone: '+1-555-0001',
    salary: 60000,
    department: 'Administration',
    emergencyContact: 'John Johnson - +1-555-1001',
    hireDate: '2022-01-15',
    isActive: true
  },
  {
    id: '2',
    name: 'Bob Wilson',
    email: 'bob@hotel.com',
    role: 1, // Receptionist
    phone: '+1-555-0002',
    salary: 35000,
    department: 'Front Office',
    emergencyContact: 'Mary Wilson - +1-555-1002',
    hireDate: '2022-06-01',
    isActive: true
  },
  {
    id: '3',
    name: 'Carol Brown',
    email: 'carol@hotel.com',
    role: 2, // Housekeeping
    phone: '+1-555-0003',
    salary: 28000,
    department: 'Housekeeping',
    emergencyContact: 'Tom Brown - +1-555-1003',
    hireDate: '2023-01-10',
    isActive: true
  }
];
