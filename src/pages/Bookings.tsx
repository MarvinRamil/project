import { useState, useEffect } from 'react';
import { Calendar, Plus, Search, Filter, User, CreditCard, Clock, MoreVertical, CheckCircle, XCircle, AlertCircle, UserPlus, X, Check } from 'lucide-react';
import { useBookings, useRooms } from '../hooks';
import { format } from 'date-fns';
import { bookingsApi } from '../api/bookings';
import { getApiUrl } from '../config/api';
import OtpVerificationModal from '../components/booking/OtpVerificationModal';

const Bookings = () => {
  const {
    bookings,
    loading,
    error,
    statusFilter,
    setStatusFilter,
    searchTerm,
    setSearchTerm,
    checkIn,
    checkOut,
    cancelBooking,
    markNoShow,
    confirmBooking,
    canCheckIn,
    canCheckOut,
    canCancel,
    canMarkNoShow,
    canConfirm,
    getStatusColor,
    getStatusText,
    getStatusDisplayName,
    getCheckInStatus
  } = useBookings();

  const { rooms: filteredRooms, refreshData: refreshRooms } = useRooms();
  const [allRooms, setAllRooms] = useState<any[]>([]);

  const [selectedBooking, setSelectedBooking] = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<'bottom' | 'top'>('bottom');
  const [dropdownCoords, setDropdownCoords] = useState<{ x: number; y: number } | null>(null);
  const [showWalkInModal, setShowWalkInModal] = useState(false);
  const [walkInData, setWalkInData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    roomId: '',
    checkIn: new Date().toISOString().split('T')[0],
    checkOut: '',
    guests: 1,
    specialRequests: ''
  });
  const [walkInLoading, setWalkInLoading] = useState(false);
  const [walkInError, setWalkInError] = useState('');
  
  // OTP Verification state for walk-in bookings
  const [showWalkInOtpModal, setShowWalkInOtpModal] = useState(false);
  const [createdWalkInBooking, setCreatedWalkInBooking] = useState<{
    id: number;
    bookingNumber?: string;
    guestEmail?: string;
  } | null>(null);

  // Fetch all rooms for walk-in modal
  const fetchAllRooms = async () => {
    try {
      const response = await fetch(getApiUrl('Room'));
      if (response.ok) {
        const data = await response.json();
        setAllRooms(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  // Handle OTP verification for walk-in bookings
  const handleWalkInOtpVerification = async (otpCode: string): Promise<boolean> => {
    if (!createdWalkInBooking) return false;
    
    try {
      const result = await bookingsApi.verifyBookingOtp(createdWalkInBooking.id, otpCode);
      console.log('Walk-in OTP Verification Result:', result);
      
      if (result.success && result.data) {
        console.log('Walk-in booking verified successfully:', {
          bookingId: result.data.bookingId,
          bookingStatus: result.data.bookingStatus,
          verifiedAt: result.data.verifiedAt
        });
        
        // Refresh bookings data after successful verification
        window.location.reload();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error verifying OTP:', error);
      return false;
    }
  };

  // Handle OTP modal close for walk-in bookings
  const handleWalkInOtpModalClose = () => {
    setShowWalkInOtpModal(false);
    setCreatedWalkInBooking(null);
    // Reset walk-in form
    setWalkInData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      roomId: '',
      checkIn: new Date().toISOString().split('T')[0],
      checkOut: '',
      guests: 1,
      specialRequests: ''
    });
  };

  // Close dropdown when clicking outside or scrolling
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.booking-dropdown')) {
        console.log('Clicking outside, closing dropdown');
        setSelectedBooking(null);
        setDropdownCoords(null);
      }
    };

    const handleScroll = () => {
      if (selectedBooking !== null) {
        setSelectedBooking(null);
        setDropdownCoords(null);
      }
    };

    if (selectedBooking !== null) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('scroll', handleScroll, true);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [selectedBooking]);

  // Fetch rooms when walk-in modal opens
  useEffect(() => {
    if (showWalkInModal) {
      fetchAllRooms();
    }
  }, [showWalkInModal]);

  const getCheckInStatusColor = (status: string) => {
    switch (status) {
      case 'checked-in':
        return 'bg-green-100 text-green-800';
      case 'checked-out':
        return 'bg-blue-100 text-blue-800';
      case 'overdue-checkin':
        return 'bg-red-100 text-red-800';
      case 'checkin-today':
        return 'bg-yellow-100 text-yellow-800';
      case 'future-checkin':
        return 'bg-gray-100 text-gray-800';
      case 'not-confirmed':
        return 'bg-gray-100 text-gray-500';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCheckInStatusText = (status: string) => {
    switch (status) {
      case 'checked-in':
        return 'Checked In';
      case 'checked-out':
        return 'Checked Out';
      case 'overdue-checkin':
        return 'Overdue Check-in';
      case 'checkin-today':
        return 'Check-in Today';
      case 'future-checkin':
        return 'Future Check-in';
      case 'not-confirmed':
        return 'Not Confirmed';
      default:
        return 'Unknown';
    }
  };

  const handleStatusAction = async (bookingId: number, action: () => Promise<{ success: boolean; message: string }>) => {
    console.log('Action triggered for booking:', bookingId);
    setActionLoading(bookingId);
    try {
      const result = await action();
      if (result.success) {
        // Success feedback could be added here
        console.log('Success:', result.message);
      } else {
        console.error('Error:', result.message);
      }
    } catch (error) {
      console.error('Action error:', error);
    } finally {
      setActionLoading(null);
      setSelectedBooking(null);
      setDropdownCoords(null);
    }
  };

  const handleWalkInInputChange = (field: string, value: string | number) => {
    setWalkInData(prev => ({ ...prev, [field]: value }));
  };

  const calculateDropdownPosition = (buttonElement: HTMLElement) => {
    const rect = buttonElement.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const dropdownHeight = 200; // Approximate height of dropdown
    
    // Calculate coordinates for fixed positioning
    const x = rect.right - 192; // 192px is the width of the dropdown (w-48)
    const y = rect.bottom + 8; // 8px margin
    
    setDropdownCoords({ x, y });
    
    // If there's not enough space below, position above
    if (rect.bottom + dropdownHeight > viewportHeight) {
      setDropdownPosition('top');
      setDropdownCoords({ x, y: rect.top - dropdownHeight - 8 });
    } else {
      setDropdownPosition('bottom');
    }
  };

  const handleWalkInBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setWalkInError('');
    
    if (!walkInData.firstName || !walkInData.lastName || !walkInData.email || !walkInData.phone || !walkInData.roomId || !walkInData.checkOut) {
      setWalkInError('Please fill in all required fields');
      return;
    }

    // Validate phone number format
    const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(walkInData.phone.replace(/[\s\-()]/g, ''))) {
      setWalkInError('Please enter a valid phone number');
      return;
    }

    setWalkInLoading(true);
    
    try {
      // Create the booking with guest information directly
      const bookingPayload = {
        roomId: parseInt(walkInData.roomId),
        checkIn: new Date(walkInData.checkIn).toISOString(),
        checkOut: new Date(walkInData.checkOut).toISOString(),
        guests: walkInData.guests,
        firstName: walkInData.firstName,
        lastName: walkInData.lastName,
        email: walkInData.email,
        phone: walkInData.phone,
        specialRequests: walkInData.specialRequests || ''
      };

      const response = await fetch(getApiUrl('Booking'), {
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
        setCreatedWalkInBooking({
          id: bookingId,
          bookingNumber: bookingNumber,
          guestEmail: walkInData.email
        });
        setShowWalkInOtpModal(true);
        
        // Close walk-in modal
        setShowWalkInModal(false);
        setWalkInError('');
      } else {
        const errorData = await response.json();
        setWalkInError(errorData.message || 'Failed to create walk-in booking');
      }
    } catch (error) {
      console.error('Error creating walk-in booking:', error);
      setWalkInError('Network error. Please check your connection and try again.');
    } finally {
      setWalkInLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading bookings...</div>
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
          <h1 className="text-2xl font-bold text-gray-900">Booking Management</h1>
          <p className="text-gray-600">Manage reservations and check-ins/check-outs</p>
        </div>
        <button 
          onClick={() => setShowWalkInModal(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
        >
          <UserPlus className="w-4 h-4" />
          <span>Walk-in Guest</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search bookings by ID, guest name, or room..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="checked-in">Checked In</option>
              <option value="checked-out">Checked Out</option>
              <option value="cancelled">Cancelled</option>
              <option value="no-show">No Show</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bookings List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">All Bookings</h2>
        </div>
        
        <div className="overflow-x-auto overflow-y-visible">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Booking
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Guest
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bookings.map((booking) => {
                return (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">#{booking.bookingNumber}</div>
                      <div className="text-sm text-gray-500">
                        <Clock className="inline w-3 h-3 mr-1" />
                        {format(new Date(booking.createdAt), 'MMM dd, yyyy')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {booking.guest.firstName} {booking.guest.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{booking.guest.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">Room {booking.room.number}</div>
                      <div className="text-sm text-gray-500">{booking.room.type}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <Calendar className="inline w-3 h-3 mr-1" />
                        {format(new Date(booking.checkIn), 'MMM dd')} - {format(new Date(booking.checkOut), 'MMM dd')}
                      </div>
                      <div className="text-sm text-gray-500">{booking.guests || 1} guest(s)</div>
                      <div className="mt-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getCheckInStatusColor(getCheckInStatus(booking))}`}>
                          {getCheckInStatusText(getCheckInStatus(booking))}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                        {getStatusDisplayName(booking.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">${booking.totalAmount}</div>
                      <div className="text-sm text-gray-500">
                        <CreditCard className="inline w-3 h-3 mr-1" />
                        Phone: {booking.guest.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="relative booking-dropdown">
                        <button
                          onClick={(e) => {
                            console.log('Dropdown clicked for booking:', booking.id);
                            console.log('Current status:', booking.status);
                            console.log('Can check in:', canCheckIn(booking));
                            console.log('Can check out:', canCheckOut(booking));
                            console.log('Can cancel:', canCancel(booking));
                            console.log('Can mark no show:', canMarkNoShow(booking));
                            
                            if (selectedBooking === booking.id) {
                              setSelectedBooking(null);
                            } else {
                              calculateDropdownPosition(e.currentTarget);
                              setSelectedBooking(booking.id);
                            }
                          }}
                          className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                          disabled={actionLoading === booking.id}
                        >
                          {actionLoading === booking.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                          ) : (
                            <MoreVertical className="w-4 h-4 text-gray-600" />
                          )}
                        </button>
                        
                        {selectedBooking === booking.id && (
                          <div 
                            className="w-48 bg-white rounded-md shadow-lg z-50 border border-gray-200"
                            style={dropdownCoords ? {
                              position: 'fixed',
                              left: `${dropdownCoords.x}px`,
                              top: `${dropdownCoords.y}px`,
                            } : {
                              position: 'absolute',
                              right: '0',
                              ...(dropdownPosition === 'top' ? { bottom: '100%', marginBottom: '8px' } : { top: '100%', marginTop: '8px' })
                            }}
                          >
                            <div className="py-1">
                              {canConfirm(booking) && (
                                <button
                                  onClick={() => handleStatusAction(booking.id, async () => {
                                    const result = await confirmBooking(booking.id);
                                    // Ensure message is always a string
                                    return {
                                      ...result,
                                      message: result.message ?? ''
                                    };
                                  })}
                                  className="flex items-center w-full px-4 py-2 text-sm text-indigo-700 hover:bg-indigo-50"
                                >
                                  <Check className="w-4 h-4 mr-2" />
                                  Confirm Booking
                                </button>
                              )}
                              {canCheckIn(booking) && (
                                <button
                                  onClick={() => handleStatusAction(booking.id, async () => {
                                    const result = await checkIn(booking.id);
                                    // Ensure message is always a string
                                    return {
                                      ...result,
                                      message: result.message ?? ''
                                    };
                                  })}
                                  className="flex items-center w-full px-4 py-2 text-sm text-green-700 hover:bg-green-50"
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Check In
                                </button>
                              )}
                              {canCheckOut(booking) && (
                                <button
                                  onClick={() => handleStatusAction(booking.id, async () => {
                                    const result = await checkOut(booking.id);
                                    // Ensure message is always a string
                                    return {
                                      ...result,
                                      message: result.message ?? ''
                                    };
                                  })}
                                  className="flex items-center w-full px-4 py-2 text-sm text-blue-700 hover:bg-blue-50"
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Check Out
                                </button>
                              )}
                               
                              {canCancel(booking) && (
                                <button
                                  onClick={() => handleStatusAction(booking.id, async () => {
                                    const result = await cancelBooking(booking.id);
                                    // Ensure message is always a string
                                    return {
                                      ...result,
                                      message: result.message ?? ''
                                    };
                                  })}
                                  className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                                >
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Cancel Booking
                                </button>
                              )}
                              {canMarkNoShow(booking) && (
                                <button
                                  onClick={() => handleStatusAction(booking.id, async () => {
                                    const result = await markNoShow(booking.id);
                                    // Ensure message is always a string
                                    return {
                                      ...result,
                                      message: result.message ?? ''
                                    };
                                  })}
                                  className="flex items-center w-full px-4 py-2 text-sm text-yellow-700 hover:bg-yellow-50"
                                >
                                  <AlertCircle className="w-4 h-4 mr-2" />
                                  Mark No Show
                                </button>
                              )}
                              {!canConfirm(booking) && !canCheckIn(booking) && !canCheckOut(booking) && !canCancel(booking) && !canMarkNoShow(booking) && (
                                <div className="px-4 py-2 text-sm text-gray-500">
                                  No other actions available
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {bookings.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
          <p className="text-gray-600">Try adjusting your search criteria</p>
        </div>
      )}

      {/* Walk-in Guest Modal */}
      {showWalkInModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                    <UserPlus className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Walk-in Guest Check-in</h2>
                    <p className="text-green-100">Create a new guest and booking instantly</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowWalkInModal(false);
                    setWalkInError('');
                  }}
                  className="text-white hover:text-green-200 transition-colors p-2 hover:bg-white hover:bg-opacity-10 rounded-lg"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <form onSubmit={handleWalkInBooking} className="space-y-6">
                {/* Guest Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Guest Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                      <input
                        type="text"
                        required
                        value={walkInData.firstName}
                        onChange={(e) => handleWalkInInputChange('firstName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                      <input
                        type="text"
                        required
                        value={walkInData.lastName}
                        onChange={(e) => handleWalkInInputChange('lastName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                      <input
                        type="email"
                        required
                        value={walkInData.email}
                        onChange={(e) => handleWalkInInputChange('email', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                      <input
                        type="tel"
                        required
                        value={walkInData.phone}
                        onChange={(e) => handleWalkInInputChange('phone', e.target.value)}
                        placeholder="e.g., +1 (555) 123-4567"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Booking Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Room *</label>
                      <select
                        required
                        value={walkInData.roomId}
                        onChange={(e) => handleWalkInInputChange('roomId', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="">Select a room</option>
                        {allRooms && allRooms.length > 0 ? (
                          allRooms.filter(room => room.status === 0).map((room) => (
                            <option key={room.id} value={room.id}>
                              Room {room.number} - {room.type} (${room.price}/night)
                            </option>
                          ))
                        ) : (
                          <option value="" disabled>Loading rooms...</option>
                        )}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Number of Guests</label>
                      <select
                        value={walkInData.guests}
                        onChange={(e) => handleWalkInInputChange('guests', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        {[1, 2, 3, 4, 5, 6].map(num => (
                          <option key={num} value={num}>{num} Guest{num > 1 ? 's' : ''}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Check-in Date *</label>
                      <input
                        type="date"
                        required
                        value={walkInData.checkIn}
                        onChange={(e) => handleWalkInInputChange('checkIn', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Check-out Date *</label>
                      <input
                        type="date"
                        required
                        value={walkInData.checkOut}
                        onChange={(e) => handleWalkInInputChange('checkOut', e.target.value)}
                        min={walkInData.checkIn || new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Special Requests (Optional)</label>
                    <textarea
                      value={walkInData.specialRequests}
                      onChange={(e) => handleWalkInInputChange('specialRequests', e.target.value)}
                      placeholder="Any special requests or notes..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    />
                  </div>
                </div>

                {/* Error Display */}
                {walkInError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
                      <span className="text-sm text-red-800">{walkInError}</span>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowWalkInModal(false);
                      setWalkInError('');
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={walkInLoading || !walkInData.firstName || !walkInData.lastName || !walkInData.email || !walkInData.phone || !walkInData.roomId || !walkInData.checkOut}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                  >
                    {walkInLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating Walk-in...
                      </>
                    ) : (
                      'Create Walk-in Booking'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* OTP Verification Modal for Walk-in Bookings */}
      {createdWalkInBooking && (
        <OtpVerificationModal
          isOpen={showWalkInOtpModal}
          onClose={handleWalkInOtpModalClose}
          onVerify={handleWalkInOtpVerification}
          bookingId={createdWalkInBooking.id}
          bookingNumber={createdWalkInBooking.bookingNumber}
          guestEmail={createdWalkInBooking.guestEmail}
        />
      )}
    </div>
  );
};

export default Bookings;