// Common types used across the API layer

export type RoomStatus = 'available' | 'occupied' | 'cleaning' | 'maintenance' | 'out-of-order';

// Booking status enum - numeric values match API response
// Display names: Pending, Confirmed, Checked In, Checked Out, Cancelled, No Show
export enum BookingStatus {
  Pending = 0,
  Confirmed = 1,
  CheckedIn = 2,
  CheckedOut = 3,
  Cancelled = 4,
  NoShow = 5
}

export interface Room {
  id: number;
  number: string;
  type: string;
  status: RoomStatus | number; // 'available' | 'occupied' | 'cleaning' | 'maintenance' | 'out-of-order' or numeric status
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

// Interface for creating a new room (without id)
export interface CreateRoomRequest {
  number: string;
  type: string;
  price: number;
  capacity: number;
  amenities: string[];
  floor: number;
  description?: string;
  images?: string[];
}

export interface Guest {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  idNumber?: string | null;
  nationality?: string | null;
  address?: string | null;
  preferences: string[];
  totalStays: number;
  totalSpent: number;
  joinDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: number;
  bookingNumber: string;
  room?: Room;
  roomNumber?: string;
  roomType?: string;
  guest?: Guest;
  checkIn: string;
  checkOut: string;
  status: BookingStatus;
  totalAmount: number;
  createdAt: string;
  specialRequests?: string;
  guests?: number;
}

export interface Staff {
  id?: string;
  name: string;
  email: string;
  role: number; // 0 = manager, 1 = receptionist, 2 = housekeeping, 3 = maintenance, etc.
  phone: string;
  salary: number;
  department: string;
  emergencyContact: string;
  hireDate?: string;
  isActive?: boolean;
}

// Interface for creating a new staff member
export interface CreateStaffRequest {
  name: string;
  email: string;
  role: number;
  phone: string;
  salary: number;
  department: string;
  emergencyContact: string;
}

export interface HotelStats {
  totalRooms: number;
  occupiedRooms: number;
  availableRooms: number;
  outOfOrderRooms: number;
  todayCheckIns: number;
  todayCheckOuts: number;
  todayRevenue: number;
  monthlyRevenue: number;
  averageRate: number;
  occupancyRate: number;
}

export interface RevenueData {
  month: string;
  revenue: number;
  bookings: number;
  occupancy: number;
}

export interface RoomStatusOverview {
  status: string;
  count: number;
  color: string;
}

export interface QuickAction {
  title: string;
  value: string;
  description: string;
  icon: string;
  color: string;
}

export interface DashboardData {
  stats: HotelStats;
  revenueData: RevenueData[];
  roomStatusOverview: RoomStatusOverview[];
  recentBookings: Booking[];
  quickActions: QuickAction[];
}

export interface ApiDashboardResponse {
  success: boolean;
  message: string;
  data: DashboardData;
  statusCode: number;
  timestamp: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'receptionist' | 'housekeeping' | 'guest';
  avatar?: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
