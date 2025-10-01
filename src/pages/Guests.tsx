import { User, Search, Filter, Mail, Phone, MapPin, Calendar, Eye, ChevronDown, ChevronUp} from 'lucide-react';
import { useGuests, useGuestBookings } from '../hooks';
import { useState } from 'react';

// Component to display guest bookings
const GuestBookings = ({ guestId }: { guestId: number }) => {
  const { bookings, loading, error } = useGuestBookings(guestId);

  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="text-sm text-gray-500">Loading bookings...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <div className="text-sm text-red-500">Error: {error}</div>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="p-4 text-center">
        <div className="text-sm text-gray-500">No bookings found</div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {bookings.map((booking) => (
        <div key={booking.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-sm">{booking.bookingNumber}</span>
            </div>
            <span className={`px-2 py-1 text-xs rounded-full ${
              booking.status === 0 ? 'bg-yellow-100 text-yellow-800' :
              booking.status === 1 ? 'bg-green-100 text-green-800' :
              booking.status === 2 ? 'bg-blue-100 text-blue-800' :
              'bg-red-100 text-red-800'
            }`}>
              {booking.status === 0 ? 'Confirmed' :
               booking.status === 1 ? 'Checked In' :
               booking.status === 2 ? 'Checked Out' :
               booking.status === 3 ? 'Cancelled' : 'No Show'}
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
            <div>
              <span className="font-medium">Room:</span> {booking.room.number} ({booking.room.type})
            </div>
            <div>
              <span className="font-medium">Amount:</span> ${booking.totalAmount.toFixed(2)}
            </div>
            <div>
              <span className="font-medium">Check-in:</span> {new Date(booking.checkIn).toLocaleDateString()}
            </div>
            <div>
              <span className="font-medium">Check-out:</span> {new Date(booking.checkOut).toLocaleDateString()}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const Guests = () => {
  const {
    guests,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    sortBy,
    setSortBy
  } = useGuests();
  
  const [expandedGuest, setExpandedGuest] = useState<number | null>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading guests...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Guest Management</h1>
          <p className="text-gray-600">Manage guest profiles and preferences</p>
        </div>
        
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search guests by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="name">Sort by Name</option>
              <option value="stays">Sort by Total Stays</option>
              <option value="spent">Sort by Total Spent</option>
            </select>
          </div>
        </div>
      </div>

      {/* Guests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {guests.map((guest) => (
          <div key={guest.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {guest.firstName} {guest.lastName}
                </h3>
                <p className="text-sm text-gray-600">{guest.nationality}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600 truncate">{guest.email}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">{guest.phone}</span>
              </div>
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                <span className="text-sm text-gray-600 line-clamp-2">{guest.address}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div className="text-center">
                  <p className="text-lg font-semibold text-gray-900">{guest.totalStays}</p>
                  <p className="text-xs text-gray-600">Total Stays</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-gray-900">${guest.totalSpent.toLocaleString()}</p>
                  <p className="text-xs text-gray-600">Total Spent</p>
                </div>
              </div>

              {guest.preferences.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-medium text-gray-700 mb-1">Preferences:</p>
                  <div className="flex flex-wrap gap-1">
                    {guest.preferences.slice(0, 2).map((pref, index) => (
                      <span key={index} className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded">
                        {pref}
                      </span>
                    ))}
                    {guest.preferences.length > 2 && (
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                        +{guest.preferences.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="flex space-x-2">
                <button 
                  onClick={() => setExpandedGuest(expandedGuest === guest.id ? null : guest.id)}
                  className="flex-1 text-sm bg-blue-50 text-blue-700 px-3 py-2 rounded hover:bg-blue-100 flex items-center justify-center space-x-1"
                >
                  <Eye className="w-4 h-4" />
                  <span>View Bookings</span>
                  {expandedGuest === guest.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                <button className="flex-1 text-sm bg-gray-50 text-gray-700 px-3 py-2 rounded hover:bg-gray-100">
                  New Booking
                </button>
              </div>
            </div>
            
            {/* Bookings Section */}
            {expandedGuest === guest.id && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>Recent Bookings</span>
                </h4>
                <GuestBookings guestId={guest.id} />
              </div>
            )}
          </div>
        ))}
      </div>

      {guests.length === 0 && (
        <div className="text-center py-12">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No guests found</h3>
          <p className="text-gray-600">Try adjusting your search criteria</p>
        </div>
      )}
    </div>
  );
};

export default Guests;