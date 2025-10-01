import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, ArrowLeft, Camera, X, Filter, Bed, Users } from 'lucide-react';
import { useRooms } from '../hooks';
import { getImageUrl } from '../config/api';
import { bookingsApi } from '../api/bookings';
import OtpVerificationModal from '../components/booking/OtpVerificationModal';

const RoomBooking = () => {
  const navigate = useNavigate();
  const { rooms: dbRooms, loading, error } = useRooms();
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [roomBookings, setRoomBookings] = useState<Array<{
    checkIn: string;
    checkOut: string;
    [key: string]: string | number | boolean;
  }>>([]);
  const [roomMaintenance, setRoomMaintenance] = useState<Array<{
    date: string;
    [key: string]: string | number | boolean;
  }>>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [loadingMaintenance, setLoadingMaintenance] = useState(false);
  const [savingBooking, setSavingBooking] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [bookingData, setBookingData] = useState({
    checkIn: '',
    checkOut: '',
    guests: 1,
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialRequests: ''
  });
  
  // OTP Verification state
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [createdBooking, setCreatedBooking] = useState<{
    id: number;
    bookingNumber?: string;
    guestEmail?: string;
  } | null>(null);

  // Transform database rooms to match the expected format
  const rooms = dbRooms?.map(room => ({
    id: room.id.toString(),
    name: `Room ${room.number}`,
    type: room.type,
    price: room.price,
    capacity: room.capacity,
    amenities: room.amenities || ['Free WiFi', 'Modern Amenities'],
    images: room.images || [],
    available: true, // All rooms are now selectable
    status: room.status,
    description: room.description || `Comfortable ${room.type.toLowerCase()} with modern amenities`,
    floor: room.floor
  })) || [];

  // Calculate dynamic price range from room data
  const maxPrice = rooms.length > 0 ? Math.max(...rooms.map(room => room.price)) : 1000;

  const [filters, setFilters] = useState({
    priceRange: [0, maxPrice],
    roomType: 'all',
    capacity: 'all',
    amenities: [] as string[]
  });

  const allAmenities = Array.from(new Set(rooms.flatMap(room => room.amenities)));
  const allRoomTypes = Array.from(new Set(rooms.map(room => room.type)));
  
  const filteredRooms = rooms.filter(room => {
    const matchesPrice = room.price >= filters.priceRange[0] && room.price <= filters.priceRange[1];
    const matchesType = filters.roomType === 'all' || room.type.toLowerCase().includes(filters.roomType.toLowerCase());
    const matchesCapacity = filters.capacity === 'all' || room.capacity >= parseInt(filters.capacity);
    const matchesAmenities = filters.amenities.length === 0 || 
      filters.amenities.every(amenity => room.amenities.includes(amenity));
    
    return matchesPrice && matchesType && matchesCapacity && matchesAmenities;
  });

  const handleFilterChange = (filterType: string, value: string | number | string[] | number[]) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  };

  const handleAmenityToggle = (amenity: string) => {
    setFilters(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const clearFilters = () => {
    setFilters({
      priceRange: [0, maxPrice],
      roomType: 'all',
      capacity: 'all',
      amenities: []
    });
  };

  const handleInputChange = (field: string, value: string | number) => {
    setBookingData(prev => ({ ...prev, [field]: value }));
  };

  const fetchRoomBookings = async (roomId: string) => {
    setLoadingBookings(true);
    try {
      const response = await fetch(`https://localhost:7118/api/Booking/room/${roomId}`);
      if (response.ok) {
        const data = await response.json();
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Start of today
        
        // Filter out past bookings (only show future check-out dates)
        const futureBookings = (data.data || []).filter((booking: { checkOut: string; [key: string]: string | number | boolean }) => {
          const checkOutDate = new Date(booking.checkOut);
          return checkOutDate >= today;
        });
        
        setRoomBookings(futureBookings);
      } else {
        setRoomBookings([]);
      }
    } catch (error) {
      console.error('Error fetching room bookings:', error);
      setRoomBookings([]);
    } finally {
      setLoadingBookings(false);
    }
  };

  const fetchRoomMaintenance = async (roomId: string) => {
    setLoadingMaintenance(true);
    try {
      const response = await fetch(`https://localhost:7118/api/MaintenanceDate/room/${roomId}`);
      if (response.ok) {
        const data = await response.json();
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Start of today
        
        // Filter out past maintenance dates (only show future dates)
        const futureMaintenance = (data.data || []).filter((maintenance: { date: string; [key: string]: string | number | boolean }) => {
          const maintenanceDate = new Date(maintenance.date);
          return maintenanceDate >= today;
        });
        
        setRoomMaintenance(futureMaintenance);
      } else {
        setRoomMaintenance([]);
      }
    } catch (error) {
      console.error('Error fetching room maintenance:', error);
      setRoomMaintenance([]);
    } finally {
      setLoadingMaintenance(false);
    }
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError('');
    
    if (!selectedRoom || !bookingData.checkIn || !bookingData.checkOut) {
      setBookingError('Please fill in all required fields');
      return;
    }

    // Validate phone number format
    const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(bookingData.phone.replace(/[\s\-()]/g, ''))) {
      setBookingError('Please enter a valid phone number');
      return;
    }

    setSavingBooking(true);
    
    try {
      const bookingPayload = {
        roomId: parseInt(selectedRoom),
        checkIn: new Date(bookingData.checkIn).toISOString(),
        checkOut: new Date(bookingData.checkOut).toISOString(),
        guests: bookingData.guests,
        firstName: bookingData.firstName,
        lastName: bookingData.lastName,
        email: bookingData.email,
        phone: bookingData.phone,
        specialRequests: bookingData.specialRequests || ''
      };

      const response = await fetch('https://localhost:7118/api/Booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingPayload)
      });

      if (response.ok) {
        const result = await response.json();
        const bookingId = result.data?.id || result.id;
        const bookingNumber = result.data?.bookingNumber;
        
        // Store booking data and show OTP modal
        setCreatedBooking({
          id: bookingId,
          bookingNumber: bookingNumber,
          guestEmail: bookingData.email
        });
        setShowOtpModal(true);
        
        // Close booking modal
        setShowBookingModal(false);
        setSelectedRoom(null);
        setRoomBookings([]);
        setRoomMaintenance([]);
        setBookingError('');
      } else {
        const errorData = await response.json();
        if (errorData.errors && errorData.errors.Phone) {
          setBookingError('Please enter a valid phone number format');
        } else {
          setBookingError(errorData.message || 'Failed to create booking. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      setBookingError('Network error. Please check your connection and try again.');
    } finally {
      setSavingBooking(false);
    }
  };

  const calculateNights = () => {
    if (bookingData.checkIn && bookingData.checkOut) {
      const checkIn = new Date(bookingData.checkIn);
      const checkOut = new Date(bookingData.checkOut);
      const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    return 0;
  };

  // Handle OTP verification
  const handleOtpVerification = async (otpCode: string): Promise<boolean> => {
    if (!createdBooking) return false;
    
    try {
      const result = await bookingsApi.verifyBookingOtp(createdBooking.id, otpCode);
      console.log('OTP Verification Result:', result);
      
      if (result.success && result.data) {
        console.log('Booking verified successfully:', {
          bookingId: result.data.bookingId,
          bookingStatus: result.data.bookingStatus,
          verifiedAt: result.data.verifiedAt
        });
        
        // Navigate to confirmation page after successful verification
        navigate(`/booking-confirmation?bookingId=${createdBooking.id}`, { 
          state: { 
            room: filteredRooms.find(r => r.id === selectedRoom),
            bookingData,
            bookingId: createdBooking.id,
            bookingNumber: createdBooking.bookingNumber,
            isVerified: true,
            verificationData: result.data
          }
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error verifying OTP:', error);
      return false;
    }
  };

  // Handle OTP modal close
  const handleOtpModalClose = () => {
    setShowOtpModal(false);
    setCreatedBooking(null);
    // Reset booking form
    setBookingData({
      checkIn: '',
      checkOut: '',
      guests: 1,
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      specialRequests: ''
    });
  };

  const selectedRoomData = filteredRooms.find(r => r.id === selectedRoom);
  const nights = calculateNights();
  const totalPrice = selectedRoomData ? selectedRoomData.price * nights : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/guest" className="flex items-center space-x-3">
            </Link>
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <div>
                <h1 className="font-bold text-xl text-gray-900">Curading's Hotel</h1>
                <p className="text-xs text-gray-600">Luxury & Comfort</p>
              </div>
            </Link>
            <Link
              to="/"
              className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Home
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Find Your Perfect Room</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Browse our selection of comfortable accommodations and book your ideal stay
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Room Selection */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Available Rooms</h2>
              <div className="text-sm text-gray-600">
                {filteredRooms.length} room{filteredRooms.length !== 1 ? 's' : ''} found
              </div>
            </div>
            

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Filter className="w-4 h-4 text-blue-600" />
                  </div>
                <h3 className="text-lg font-semibold text-gray-900">Filter Rooms</h3>
                </div>
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Clear All
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price Range (per night)
                  </label>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max={maxPrice}
                      step="10"
                      value={filters.priceRange[1]}
                      onChange={(e) => handleFilterChange('priceRange', [0, parseInt(e.target.value)])}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>$0</span>
                      <span className="font-medium">${filters.priceRange[1]}</span>
                    </div>
                  </div>
                </div>

                {/* Room Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Room Type
                  </label>
                  <select
                    value={filters.roomType}
                    onChange={(e) => handleFilterChange('roomType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Types</option>
                    {allRoomTypes.map(type => (
                      <option key={type} value={type.toLowerCase()}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* Capacity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Capacity
                  </label>
                  <select
                    value={filters.capacity}
                    onChange={(e) => handleFilterChange('capacity', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">Any Capacity</option>
                    <option value="1">1+ Guests</option>
                    <option value="2">2+ Guests</option>
                    <option value="4">4+ Guests</option>
                    <option value="6">6+ Guests</option>
                  </select>
                </div>


                {/* Amenities */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amenities
                  </label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {allAmenities.map((amenity) => (
                      <label key={amenity} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.amenities.includes(amenity)}
                          onChange={() => handleAmenityToggle(amenity)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">{amenity}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Results Count */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Showing {filteredRooms.length} of {rooms.length} rooms
                </p>
              </div>
            </div>

            {/* Available Rooms */}
            <div className="space-y-6">
              {loading ? (
                <div className="space-y-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-pulse">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
                        <div className="md:col-span-1">
                          <div className="w-full h-48 bg-gray-200 rounded-lg"></div>
                        </div>
                        <div className="md:col-span-2">
                          <div className="h-6 bg-gray-200 rounded mb-4"></div>
                          <div className="h-4 bg-gray-200 rounded mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                          <div className="flex gap-2 mb-4">
                            <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                            <div className="h-6 bg-gray-200 rounded-full w-24"></div>
                          </div>
                          <div className="h-10 bg-gray-200 rounded"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-red-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading rooms</h3>
                  <p className="text-gray-600">{error}</p>
                </div>
              ) : filteredRooms.length > 0 ? (
                filteredRooms.map((room) => (
                <div
                  key={room.id}
                  className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
                    <div className="md:col-span-1 relative">
                      {room.images && room.images.length > 0 ? (
                        <div className="relative h-64">
                          <img
                            src={getImageUrl(room.images[0])}
                        alt={room.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              console.error('Failed to load room image:', room.images?.[0]);
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                          <div className="absolute top-4 right-4 bg-white bg-opacity-90 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm">
                            <span className="text-sm font-medium text-gray-900">${room.price}</span>
                            <span className="text-xs text-gray-600">/night</span>
                          </div>
                        </div>
                      ) : (
                        <div className="h-64 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                          <div className="text-center text-gray-400">
                            <Camera className="w-12 h-12 mx-auto mb-3" />
                            <p className="text-sm font-medium">No image available</p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="md:col-span-2 p-6">
                      <div className="mb-4">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">{room.name}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                          <span className="flex items-center">
                            <Bed className="w-4 h-4 mr-1" />
                            {room.type}
                          </span>
                          <span className="flex items-center">
                            <Users className="w-4 h-4 mr-1" />
                            {room.capacity} guests
                          </span>
                          <span>Floor {room.floor}</span>
                        </div>
                        <p className="text-gray-700 leading-relaxed">{room.description}</p>
                      </div>

                      <div className="mb-6">
                        <h4 className="text-sm font-medium text-gray-900 mb-3">Amenities</h4>
                        <div className="flex flex-wrap gap-2">
                        {room.amenities.slice(0, 4).map((amenity, index) => (
                          <span
                            key={index}
                              className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full border border-blue-200"
                          >
                            {amenity}
                          </span>
                        ))}
                        {room.amenities.length > 4 && (
                            <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full border border-gray-200">
                            +{room.amenities.length - 4} more
                          </span>
                        )}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedRoom(room.id);
                          fetchRoomBookings(room.id);
                          fetchRoomMaintenance(room.id);
                          setShowBookingModal(true);
                        }}
                        className="w-full py-3 px-6 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md"
                      >
                        Select This Room
                      </button>
                    </div>
                  </div>
                </div>
                ))
              ) : (
                <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No rooms match your filters</h3>
                  <p className="text-gray-600 mb-4">Try adjusting your search criteria to see more options</p>
                  <button
                    onClick={clearFilters}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Booking Instructions */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* How to Book */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Ready to Book?</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    Select a room from the list to start your booking process. You'll be able to choose your dates and provide guest information.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-blue-600">1</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Choose Your Room</h4>
                      <p className="text-sm text-gray-600">Browse and select your preferred accommodation</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-blue-600">2</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Select Dates</h4>
                      <p className="text-sm text-gray-600">Choose your check-in and check-out dates</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-blue-600">3</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Guest Information</h4>
                      <p className="text-sm text-gray-600">Provide your contact details</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-blue-600">4</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Complete Booking</h4>
                      <p className="text-sm text-gray-600">Review and confirm your reservation</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Hotel Features</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Rooms</span>
                    <span className="font-medium text-gray-900">{rooms.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Available Now</span>
                    <span className="font-medium text-green-600">{rooms.filter(r => r.status === 'available').length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Price Range</span>
                    <span className="font-medium text-gray-900">${Math.min(...rooms.map(r => r.price))} - ${Math.max(...rooms.map(r => r.price))}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && selectedRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Complete Your Booking</h2>
                    <p className="text-blue-100">{selectedRoomData?.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowBookingModal(false);
                    setSelectedRoom(null);
                    setRoomBookings([]);
                    setRoomMaintenance([]);
                  }}
                  className="text-white hover:text-blue-200 transition-colors p-2 hover:bg-white hover:bg-opacity-10 rounded-lg"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Booking Details */}
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Selected Room</h3>
                    <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Room:</span>
                      <span className="font-medium">{selectedRoomData?.name}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Type:</span>
                        <span className="font-medium">{selectedRoomData?.type}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Floor:</span>
                        <span className="font-medium">{selectedRoomData?.floor}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Capacity:</span>
                        <span className="font-medium">{selectedRoomData?.capacity} guests</span>
                    </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Price:</span>
                        <span className="font-medium">${selectedRoomData?.price}/night</span>
                      </div>
                    </div>
                  </div>

                  {/* Existing Bookings */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Existing Bookings</h3>
                    {loadingBookings ? (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-center">
                          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                          <span className="text-sm text-gray-600">Loading bookings...</span>
                        </div>
                      </div>
                    ) : roomBookings.length > 0 ? (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center mb-3">
                          <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
                          <span className="text-sm font-medium text-red-800">Unavailable Dates</span>
                        </div>
                        <div className="space-y-2">
                          {roomBookings.map((booking, index) => (
                            <div key={index} className="text-sm text-red-700 bg-white bg-opacity-50 rounded p-2">
                              <div className="flex justify-between">
                                <span>Check-in:</span>
                                <span className="font-medium">
                                  {new Date(booking.checkIn).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Check-out:</span>
                                <span className="font-medium">
                                  {new Date(booking.checkOut).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-red-600 mt-2">
                          Please select dates outside of these periods for your booking.
                        </p>
                      </div>
                    ) : (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center">
                          <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
                          <span className="text-sm font-medium text-green-800">No existing bookings</span>
                        </div>
                        <p className="text-xs text-green-600 mt-1">
                          This room is available for booking on any dates.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Maintenance Dates */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Maintenance Dates</h3>
                    {loadingMaintenance ? (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-center">
                          <div className="w-4 h-4 border-2 border-orange-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                          <span className="text-sm text-gray-600">Loading maintenance dates...</span>
                        </div>
                      </div>
                    ) : roomMaintenance.length > 0 ? (
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                        <div className="flex items-center mb-3">
                          <div className="w-4 h-4 bg-orange-500 rounded-full mr-2"></div>
                          <span className="text-sm font-medium text-orange-800">Scheduled Maintenance</span>
                        </div>
                        <div className="space-y-2">
                          {roomMaintenance.map((maintenance, index) => (
                            <div key={index} className="text-sm text-orange-700 bg-white bg-opacity-50 rounded p-2">
                              <div className="flex justify-between">
                                <span>Maintenance Date:</span>
                                <span className="font-medium">
                                  {new Date(maintenance.date).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-orange-600 mt-2">
                          Please avoid booking on these dates as the room will be under maintenance.
                        </p>
                      </div>
                    ) : (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center">
                          <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
                          <span className="text-sm font-medium text-green-800">No scheduled maintenance</span>
                        </div>
                        <p className="text-xs text-green-600 mt-1">
                          No maintenance is currently scheduled for this room.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Date Selection */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Select Dates</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Check-in Date</label>
                        <input
                          type="date"
                          value={bookingData.checkIn}
                          onChange={(e) => handleInputChange('checkIn', e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Check-out Date</label>
                        <input
                          type="date"
                          value={bookingData.checkOut}
                          onChange={(e) => handleInputChange('checkOut', e.target.value)}
                          min={bookingData.checkIn || new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Number of Guests</label>
                        <select
                          value={bookingData.guests}
                          onChange={(e) => handleInputChange('guests', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          {[1, 2, 3, 4, 5, 6].map(num => (
                            <option key={num} value={num}>{num} Guest{num > 1 ? 's' : ''}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Guest Information */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Guest Information</h3>
                  <form onSubmit={handleBooking} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                        <input
                          type="text"
                          required
                          value={bookingData.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                        <input
                          type="text"
                          required
                          value={bookingData.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        required
                        value={bookingData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <input
                        type="tel"
                        required
                        value={bookingData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="e.g., +1 (555) 123-4567"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Special Requests (Optional)</label>
                      <textarea
                        value={bookingData.specialRequests}
                        onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                        placeholder="Any special requests or notes for your stay..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      />
                    </div>

                    {/* Error Display */}
                    {bookingError && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <div className="flex items-center">
                          <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
                          <span className="text-sm text-red-800">{bookingError}</span>
                        </div>
                      </div>
                    )}
                    </form>
                  </div>

                  {/* Booking Summary */}
                  {bookingData.checkIn && bookingData.checkOut && (
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-gray-900 mb-3">Booking Summary</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Nights:</span>
                          <span className="font-medium">{nights}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Rate per night:</span>
                          <span className="font-medium">${selectedRoomData?.price}</span>
                        </div>
                        <div className="border-t border-blue-200 pt-2">
                          <div className="flex justify-between font-medium">
                            <span>Total:</span>
                            <span>${totalPrice}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                    </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowBookingModal(false);
                    setSelectedRoom(null);
                    setRoomBookings([]);
                    setRoomMaintenance([]);
                    setBookingError('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                    <button
                  onClick={handleBooking}
                  disabled={savingBooking || !bookingData.checkIn || !bookingData.checkOut || !bookingData.firstName || !bookingData.lastName || !bookingData.email || !bookingData.phone}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                    >
                      {savingBooking ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Creating Booking...
                        </>
                      ) : (
                        'Complete Booking'
                      )}
                    </button>
                </div>
            </div>
          </div>
        </div>
      )}

      {/* OTP Verification Modal */}
      {createdBooking && (
        <OtpVerificationModal
          isOpen={showOtpModal}
          onClose={handleOtpModalClose}
          onVerify={handleOtpVerification}
          bookingId={createdBooking.id}
          bookingNumber={createdBooking.bookingNumber}
          guestEmail={createdBooking.guestEmail}
        />
      )}
    </div>
  );
};

export default RoomBooking;