import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  User, 
  Bed, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  CheckCircle,
  XCircle,
  AlertCircle,
  LogOut
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { bookingsApi } from '../api/bookings';
import { guestsApi } from '../api/guests';
import { Booking, Guest, BookingStatus } from '../api/types';
import { getImageUrl } from '../config/api';

const GuestDashboard = () => {
  const { user, logout } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [guestProfile, setGuestProfile] = useState<Guest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGuestData = async () => {
      if (!user?.email) return;

      try {
        setLoading(true);
        
        // Fetch guest profile
        const guestResponse = await guestsApi.getGuestByEmail(user.email);
        if (guestResponse.success && guestResponse.data) {
          setGuestProfile(guestResponse.data);
          
          // Fetch guest bookings using the guest ID
          const bookingsResponse = await bookingsApi.getBookingsByGuestId(guestResponse.data.id);
          if (bookingsResponse.success) {
            setBookings(bookingsResponse.data);
          } else {
            setError(bookingsResponse.message || 'Failed to load bookings');
          }
        } else {
          setError(guestResponse.message || 'Failed to load guest profile');
        }
      } catch (err) {
        setError('Failed to load guest data');
        console.error('Error fetching guest data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGuestData();
  }, [user?.email]);

  const getStatusIcon = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.Pending:
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case BookingStatus.Confirmed:
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case BookingStatus.CheckedIn:
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case BookingStatus.CheckedOut:
        return <CheckCircle className="w-4 h-4 text-gray-500" />;
      case BookingStatus.Cancelled:
        return <XCircle className="w-4 h-4 text-red-500" />;
      case BookingStatus.NoShow:
        return <AlertCircle className="w-4 h-4 text-orange-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.Pending:
        return 'Pending';
      case BookingStatus.Confirmed:
        return 'Confirmed';
      case BookingStatus.CheckedIn:
        return 'Checked In';
      case BookingStatus.CheckedOut:
        return 'Checked Out';
      case BookingStatus.Cancelled:
        return 'Cancelled';
      case BookingStatus.NoShow:
        return 'No Show';
      default:
        return 'Unknown';
    }
  };

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.Pending:
        return 'bg-yellow-100 text-yellow-800';
      case BookingStatus.Confirmed:
        return 'bg-green-100 text-green-800';
      case BookingStatus.CheckedIn:
        return 'bg-blue-100 text-blue-800';
      case BookingStatus.CheckedOut:
        return 'bg-gray-100 text-gray-800';
      case BookingStatus.Cancelled:
        return 'bg-red-100 text-red-800';
      case BookingStatus.NoShow:
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <div>
                <h1 className="font-bold text-xl text-gray-900">Curading's Hotel</h1>
                <p className="text-sm text-gray-600">Guest Portal</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {guestProfile?.firstName} {guestProfile?.lastName}
                </p>
                <p className="text-xs text-gray-600">{user?.email}</p>
              </div>
              <button
                onClick={async () => {
                  try {
                    await logout();
                    window.location.href = '/';
                  } catch (error) {
                    console.error('Logout error:', error);
                    window.location.href = '/';
                  }
                }}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome back, {guestProfile?.firstName}!
              </h2>
              <p className="text-gray-600">
                Manage your bookings and explore available rooms
              </p>
            </div>
            <Link
              to="/guest/rooms"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2"
            >
              <Bed className="w-5 h-5" />
              <span>Book New Room</span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Guest Profile */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Profile Information
              </h3>
              
              {guestProfile && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Name</label>
                    <p className="text-gray-900">{guestProfile.firstName} {guestProfile.lastName}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600 flex items-center">
                      <Mail className="w-4 h-4 mr-1" />
                      Email
                    </label>
                    <p className="text-gray-900">{guestProfile.email}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600 flex items-center">
                      <Phone className="w-4 h-4 mr-1" />
                      Phone
                    </label>
                    <p className="text-gray-900">{guestProfile.phone}</p>
                  </div>
                  
                  {guestProfile.nationality && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Nationality</label>
                      <p className="text-gray-900">{guestProfile.nationality}</p>
                    </div>
                  )}
                  
                  {guestProfile.address && (
                    <div>
                      <label className="text-sm font-medium text-gray-600 flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        Address
                      </label>
                      <p className="text-gray-900">{guestProfile.address}</p>
                    </div>
                  )}
                  
                  <div className="pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-blue-600">{guestProfile.totalStays}</p>
                        <p className="text-sm text-gray-600">Total Stays</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-green-600">${guestProfile.totalSpent.toFixed(2)}</p>
                        <p className="text-sm text-gray-600">Total Spent</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bookings */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                My Bookings
              </h3>
              
              {bookings.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h4>
                  <p className="text-gray-600 mb-4">Start your journey with us by booking a room</p>
                  <Link
                    to="/guest/rooms"
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium inline-flex items-center space-x-2"
                  >
                    <Bed className="w-5 h-5" />
                    <span>Browse Rooms</span>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <div key={booking.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-semibold text-gray-900">
                              {booking.room?.type || 'Room'} - {booking.room?.number || 'N/A'}
                            </h4>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(booking.status)}`}>
                              {getStatusIcon(booking.status)}
                              <span className="ml-1">{getStatusText(booking.status)}</span>
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">Check-in</p>
                              <p className="font-medium">{formatDate(booking.checkIn)}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Check-out</p>
                              <p className="font-medium">{formatDate(booking.checkOut)}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Total Amount</p>
                              <p className="font-medium text-green-600">${booking.totalAmount.toFixed(2)}</p>
                            </div>
                          </div>
                          
                          <div className="mt-2">
                            <p className="text-xs text-gray-500">
                              Booking #: {booking.bookingNumber}
                            </p>
                          </div>
                        </div>
                        
                        {booking.room?.images && booking.room.images.length > 0 && (
                          <div className="ml-4">
                            <img
                              src={getImageUrl(booking.room.images[0])}
                              alt={booking.room.type}
                              className="w-20 h-20 object-cover rounded-lg"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuestDashboard;
