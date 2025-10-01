import React, { useState, useEffect } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { Check, Users, Mail, Phone, MapPin, ArrowLeft, Loader2 } from 'lucide-react';
import { bookingsApi } from '../api/bookings';

const BookingConfirmation = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { room, bookingData, bookingId, bookingNumber, isVerified, verificationData } = location.state || {};
  
  // State for fetched booking data
  const [fetchedBooking, setFetchedBooking] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Get booking ID from URL params if not in state
  const urlBookingId = searchParams.get('bookingId');
  const finalBookingId = bookingId || urlBookingId;

  // Fetch booking data if not available in state
  useEffect(() => {
    if (!room || !bookingData) {
      if (finalBookingId) {
        fetchBookingData(parseInt(finalBookingId));
      }
    }
  }, [finalBookingId, room, bookingData]);

  const fetchBookingData = async (id: number) => {
    setLoading(true);
    setError('');
    
    try {
      const result = await bookingsApi.getBookingById(id);
      if (result.success && result.data) {
        setFetchedBooking(result.data);
      } else {
        setError(result.message || 'Failed to fetch booking data');
      }
    } catch (err) {
      setError('Failed to load booking information');
      console.error('Error fetching booking:', err);
    } finally {
      setLoading(false);
    }
  };

  // Use fetched data if state data is not available
  const displayRoom = room || (fetchedBooking?.room ? {
    id: fetchedBooking.room.id.toString(),
    name: `Room ${fetchedBooking.room.number}`,
    type: fetchedBooking.room.type,
    price: fetchedBooking.room.price,
    capacity: fetchedBooking.room.capacity,
    amenities: fetchedBooking.room.amenities || [],
    images: fetchedBooking.room.images || [],
    description: fetchedBooking.room.description || `Comfortable ${fetchedBooking.room.type.toLowerCase()} with modern amenities`,
    floor: fetchedBooking.room.floor
  } : null);

  const displayBookingData = bookingData || (fetchedBooking ? {
    checkIn: fetchedBooking.checkIn,
    checkOut: fetchedBooking.checkOut,
    guests: fetchedBooking.guests || 1,
    firstName: fetchedBooking.guest?.firstName || '',
    lastName: fetchedBooking.guest?.lastName || '',
    email: fetchedBooking.guest?.email || '',
    phone: fetchedBooking.guest?.phone || '',
    specialRequests: fetchedBooking.specialRequests || ''
  } : null);

  const displayBookingNumber = bookingNumber || fetchedBooking?.bookingNumber;
  const displayIsVerified = isVerified || (fetchedBooking?.status === 1);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading booking information...</h2>
          <p className="text-gray-600">Please wait while we fetch your booking details.</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Unable to load booking information</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link to="/" className="text-blue-600 hover:text-blue-700">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  // Show not found state
  if (!displayRoom || !displayBookingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Booking information not found</h2>
          <p className="text-gray-600 mb-4">
            {finalBookingId ? 
              `No booking found with ID: ${finalBookingId}` : 
              'Please complete a booking first or check your booking ID.'
            }
          </p>
          <Link to="/" className="text-blue-600 hover:text-blue-700">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  const calculateNights = () => {
    const checkIn = new Date(displayBookingData.checkIn);
    const checkOut = new Date(displayBookingData.checkOut);
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const nights = calculateNights();
  const totalPrice = displayRoom.price * nights;
  const displayBookingId = displayBookingNumber || `CUR${Date.now().toString().slice(-6)}`;
  const bookingStatus = displayIsVerified ? 'CONFIRMED' : 'PENDING';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <div>
                <h1 className="font-bold text-xl text-gray-900">Curading's Hotel</h1>
                <p className="text-xs text-gray-600">Luxury & Comfort</p>
              </div>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Success Message */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Confirmation of your booking status {bookingStatus}
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Thank you for choosing Curading's Hotel
          </p>
          <p className="text-lg text-gray-500">
            Your booking confirmation number is: <span className="font-bold text-blue-600">{displayBookingId}</span>
          </p>
          {finalBookingId && (
            <p className="text-sm text-gray-400 mt-2">
              You can access this booking anytime using: 
              <span className="font-mono bg-gray-100 px-2 py-1 rounded ml-1">
                /booking-confirmation?bookingId={finalBookingId}
              </span>
            </p>
          )}
        </div>

        {/* Booking Details */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          <div className="bg-blue-600 text-white p-6">
            <h2 className="text-2xl font-bold mb-2">Booking Details</h2>
            <p className="text-blue-100">Please save this information for your records</p>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Room Information */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Room Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Room Type:</span>
                    <span className="font-medium">{displayRoom.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Capacity:</span>
                    <span className="font-medium">Up to {displayRoom.capacity} guests</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rate per night:</span>
                    <span className="font-medium">${displayRoom.price}</span>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-2">Room Amenities:</h4>
                  <div className="flex flex-wrap gap-2">
                    {displayRoom.amenities.map((amenity: string, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Stay Information */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Stay Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Check-in:</span>
                    <span className="font-medium">
                      {new Date(displayBookingData.checkIn).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Check-out:</span>
                    <span className="font-medium">
                      {new Date(displayBookingData.checkOut).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Number of nights:</span>
                    <span className="font-medium">{nights}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Guests:</span>
                    <span className="font-medium">{displayBookingData.guests}</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total Amount:</span>
                    <span className="text-blue-600">${totalPrice}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Guest Information */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Guest Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center mb-2">
                    <Users className="w-5 h-5 text-gray-400 mr-2" />
                    <span className="font-medium">Primary Guest</span>
                  </div>
                  <p className="text-gray-900">{displayBookingData.firstName} {displayBookingData.lastName}</p>
                </div>
                <div>
                  <div className="flex items-center mb-2">
                    <Mail className="w-5 h-5 text-gray-400 mr-2" />
                    <span className="font-medium">Email</span>
                  </div>
                  <p className="text-gray-900">{displayBookingData.email}</p>
                </div>
                <div>
                  <div className="flex items-center mb-2">
                    <Phone className="w-5 h-5 text-gray-400 mr-2" />
                    <span className="font-medium">Phone</span>
                  </div>
                  <p className="text-gray-900">{displayBookingData.phone}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Important Information */}
        <div className="bg-blue-50 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Important Information</h3>
          <div className="space-y-2 text-blue-800">
            <p>• Check-in time: 3:00 PM</p>
            <p>• Check-out time: 11:00 AM</p>
            <p>• A confirmation email has been sent to {displayBookingData.email}</p>
            {!displayIsVerified && (
              <p className="font-medium text-orange-700">• Please check your email and verify your booking with the OTP code</p>
            )}
            {displayIsVerified && verificationData && (
              <p className="font-medium text-green-700">
                • Booking verified on {new Date(verificationData.verifiedAt).toLocaleString()}
              </p>
            )}
            <p>• Please bring a valid ID for check-in</p>
            <p>• For any changes or cancellations, please contact us at least 24 hours in advance</p>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center">
              <Phone className="w-5 h-5 text-blue-600 mr-3" />
              <div>
                <p className="font-medium">Phone</p>
                <p className="text-gray-600">+1 (555) 123-4567</p>
              </div>
            </div>
            <div className="flex items-center">
              <Mail className="w-5 h-5 text-blue-600 mr-3" />
              <div>
                <p className="font-medium">Email</p>
                <p className="text-gray-600">reservations@curadingshotel.com</p>
              </div>
            </div>
            <div className="flex items-center">
              <MapPin className="w-5 h-5 text-blue-600 mr-3" />
              <div>
                <p className="font-medium">Address</p>
                <p className="text-gray-600">123 Luxury Avenue, Downtown City</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </Link>
          <button
            onClick={() => window.print()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Print Confirmation
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;