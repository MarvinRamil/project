import React from 'react';
import { Calendar, User } from 'lucide-react';
import { format } from 'date-fns';

interface Room {
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

interface Guest {
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

interface Booking {
  id: number;
  bookingNumber: string;
  room: Room;
  guest: Guest;
  checkIn: string;
  checkOut: string;
  status: number; // 0 = confirmed, 1 = checked-in, 2 = checked-out, etc.
  totalAmount: number;
  createdAt: string;
  specialRequests?: string;
  guests?: number;
}

interface RecentBookingsProps {
  bookings: Booking[];
}

const getStatusText = (status: number) => {
  const statusMap = {
    0: 'confirmed',
    1: 'checked-in',
    2: 'checked-out',
    3: 'cancelled',
    4: 'no-show'
  };
  return statusMap[status as keyof typeof statusMap] || 'unknown';
};

const getStatusColor = (status: number) => {
  const colors = {
    0: 'bg-blue-100 text-blue-800', // confirmed
    1: 'bg-green-100 text-green-800', // checked-in
    2: 'bg-gray-100 text-gray-800', // checked-out
    3: 'bg-red-100 text-red-800', // cancelled
    4: 'bg-yellow-100 text-yellow-800' // no-show
  };
  return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
};

const RecentBookings: React.FC<RecentBookingsProps> = ({ bookings }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Booking ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Room
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Dates
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amount
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {bookings.map((booking) => (
            <tr key={booking.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                #{booking.bookingNumber}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                Room {booking.room.number}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                  {format(new Date(booking.checkIn), 'MMM dd')} - {format(new Date(booking.checkOut), 'MMM dd')}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                  {getStatusText(booking.status).replace('-', ' ')}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                ${booking.totalAmount}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RecentBookings;