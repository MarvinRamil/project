import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Bed, 
  Clock, 
  CheckCircle,
  XCircle,
  AlertCircle,
  CreditCard,
  MapPin,
  ArrowRight,
  Users
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { bookingsApi } from '../api/bookings';
import { guestsApi } from '../api/guests';
import { Booking, BookingStatus } from '../api/types';
import { getImageUrl } from '../config/api';

const GuestBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user?.email) return;

      try {
        setLoading(true);
        console.log('Fetching bookings for user:', user.email);
        
        // First get guest profile to get the guest ID
        const guestResponse = await guestsApi.getGuestByEmail(user.email);
        console.log('Guest response:', guestResponse);
        
        if (guestResponse.success && guestResponse.data) {
          console.log('Guest ID:', guestResponse.data.id);
          // Then fetch bookings using the guest ID
          const bookingsResponse = await bookingsApi.getBookingsByGuestId(guestResponse.data.id);
          console.log('Bookings response:', bookingsResponse);
          
          if (bookingsResponse.success) {
            setBookings(bookingsResponse.data);
            console.log('Bookings set:', bookingsResponse.data);
          } else {
            setError(bookingsResponse.message || 'Failed to load bookings');
          }
        } else {
          setError(guestResponse.message || 'Failed to load guest information');
        }
      } catch (err) {
        setError('Failed to load bookings');
        console.error('Error fetching bookings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
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

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Bookings</h2>
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

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-600 via-green-700 to-emerald-800 text-white py-20">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            My Bookings
            <span className="block bg-gradient-to-r from-green-300 to-emerald-200 bg-clip-text text-transparent">
              Reservation Center
            </span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-green-100 max-w-3xl mx-auto">
            View and manage all your hotel reservations in one place
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {bookings.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">No Bookings Yet</h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              You haven't made any reservations yet. Start your journey with us by finding your perfect room!
            </p>
            <Link
              to="/guest/menu"
              className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors font-medium inline-flex items-center space-x-2 text-lg"
            >
              <Bed className="w-5 h-5" />
              <span>Find Your Perfect Room</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Header Section */}
            <div className="text-center mb-12">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Your Reservations
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                Manage and view all your hotel bookings in one convenient place
              </p>
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 max-w-md mx-auto">
                <div className="flex items-center justify-center space-x-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{bookings.length}</div>
                    <div className="text-sm text-gray-600">Total Bookings</div>
                  </div>
                  <div className="w-px h-8 bg-gray-300"></div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      ${bookings.reduce((sum, booking) => sum + booking.totalAmount, 0).toFixed(0)}
                    </div>
                    <div className="text-sm text-gray-600">Total Spent</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bookings Grid */}
            <div className="grid gap-8">
              {bookings.map((booking) => (
                <div key={booking.id} className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="p-8">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-3">
                          <h3 className="text-2xl font-bold text-gray-900">
                            {booking.room?.type || 'Room'} - {booking.room?.number || 'N/A'}
                          </h3>
                          <span className={`px-4 py-2 text-sm font-medium rounded-full flex items-center space-x-2 ${getStatusColor(booking.status)}`}>
                            {getStatusIcon(booking.status)}
                            <span>{getStatusText(booking.status)}</span>
                          </span>
                        </div>
                        
                        <p className="text-gray-600 text-lg mb-4">
                          Booking #{booking.bookingNumber}
                        </p>
                      </div>
                      
                      {booking.room?.images && booking.room.images.length > 0 && (
                        <div className="ml-6">
                          <img
                            src={getImageUrl(booking.room.images[0])}
                            alt={booking.room.type}
                            className="w-32 h-32 object-cover rounded-xl shadow-lg"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Booking Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                      <div className="bg-blue-50 rounded-xl p-6 text-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                          <Calendar className="w-6 h-6 text-blue-600" />
                        </div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Check-in</p>
                        <p className="text-lg font-semibold text-gray-900">{formatDate(booking.checkIn)}</p>
                      </div>

                      <div className="bg-green-50 rounded-xl p-6 text-center">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                          <Calendar className="w-6 h-6 text-green-600" />
                        </div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Check-out</p>
                        <p className="text-lg font-semibold text-gray-900">{formatDate(booking.checkOut)}</p>
                      </div>

                      <div className="bg-purple-50 rounded-xl p-6 text-center">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                          <CreditCard className="w-6 h-6 text-purple-600" />
                        </div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Total Amount</p>
                        <p className="text-xl font-bold text-green-600">${booking.totalAmount.toFixed(2)}</p>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-6 text-center">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                          <Clock className="w-6 h-6 text-gray-600" />
                        </div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Booked On</p>
                        <p className="text-lg font-semibold text-gray-900">{formatDateTime(booking.createdAt)}</p>
                      </div>
                    </div>

                    {/* Room Details Section */}
                    {booking.room && (
                      <div className="bg-gray-50 rounded-xl p-6">
                        <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                          <Bed className="w-5 h-5 mr-2" />
                          Room Details
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                          <div className="text-center">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                              <Bed className="w-6 h-6 text-blue-600" />
                            </div>
                            <p className="text-sm font-medium text-gray-600 mb-1">Room Type</p>
                            <p className="font-semibold text-gray-900">{booking.room.type}</p>
                          </div>
                          <div className="text-center">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                              <Users className="w-6 h-6 text-green-600" />
                            </div>
                            <p className="text-sm font-medium text-gray-600 mb-1">Capacity</p>
                            <p className="font-semibold text-gray-900">{booking.room.capacity} guests</p>
                          </div>
                          <div className="text-center">
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                              <MapPin className="w-6 h-6 text-purple-600" />
                            </div>
                            <p className="text-sm font-medium text-gray-600 mb-1">Floor</p>
                            <p className="font-semibold text-gray-900">Floor {booking.room.floor}</p>
                          </div>
                          <div className="text-center">
                            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                              <CreditCard className="w-6 h-6 text-orange-600" />
                            </div>
                            <p className="text-sm font-medium text-gray-600 mb-1">Price per night</p>
                            <p className="font-semibold text-gray-900">${booking.room.price.toFixed(2)}</p>
                          </div>
                        </div>
                        
                        {booking.room.amenities && booking.room.amenities.length > 0 && (
                          <div className="mt-6 pt-6 border-t border-gray-200">
                            <h5 className="text-lg font-semibold text-gray-900 mb-4">Room Amenities</h5>
                            <div className="flex flex-wrap gap-3">
                              {booking.room.amenities.map((amenity, index) => (
                                <span
                                  key={index}
                                  className="px-4 py-2 bg-blue-100 text-blue-800 text-sm font-medium rounded-full"
                                >
                                  {amenity}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {booking.specialRequests && (
                      <div className="mt-6 bg-yellow-50 rounded-xl p-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                          <AlertCircle className="w-5 h-5 mr-2 text-yellow-600" />
                          Special Requests
                        </h4>
                        <p className="text-gray-700">{booking.specialRequests}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="mt-16 text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Need to Make Another Booking?</h3>
              <Link
                to="/guest/menu"
                className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors font-medium inline-flex items-center space-x-2 text-lg"
              >
                <Bed className="w-5 h-5" />
                <span>Find Your Perfect Room</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Contact Information */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Need Help with Your Booking?</h2>
            <p className="text-xl text-gray-300">Our team is here to assist you with any questions</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Booking Support</h3>
              <p className="text-gray-300">+1 (555) 123-4567</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Email Support</h3>
              <p className="text-gray-300">bookings@curadingshotel.com</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Visit Us</h3>
              <p className="text-gray-300">123 Luxury Avenue, Downtown City</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default GuestBookings;
