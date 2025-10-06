import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bed, 
  Search, 
  MapPin, 
  Phone, 
  Mail, 
  Wifi, 
  Car, 
  Utensils, 
  Waves,
  ArrowRight,
  Filter,
  Users,
  Camera,
  User,
  Clock,
  Home
} from 'lucide-react';
import { useRoomsForGuests, useGuestInfo } from '../hooks';
import { getImageUrl } from '../config/api';

const GuestMenu = () => {
  const navigate = useNavigate();
  const { rooms, loading, error } = useRoomsForGuests();
  const { guest, loading: guestLoading, error: guestError } = useGuestInfo();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoomType, setSelectedRoomType] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 1000]);

  // Debug logging for guest info
  console.log('=== GUEST MENU COMPONENT ===');
  console.log('Guest loading:', guestLoading);
  console.log('Guest error:', guestError);
  console.log('Guest data:', guest);

  // Calculate dynamic price range from room data
  const maxPrice = rooms && rooms.length > 0 ? Math.max(...rooms.map(room => room.price)) : 1000;

  // Update price range when rooms load
  useEffect(() => {
    if (rooms && rooms.length > 0) {
      const max = Math.max(...rooms.map(room => room.price));
      setPriceRange([0, max]);
    }
  }, [rooms]);

  // Transform database rooms to display format
  const displayRooms = rooms?.map(room => ({
    id: room.id.toString(),
    name: `Room ${room.number}`,
    type: room.type,
    price: room.price,
    image: room.images && room.images.length > 0 ? room.images[0] : null,
    description: room.description || `Comfortable ${room.type.toLowerCase()} on floor ${room.floor}`,
    features: room.amenities || ['Free WiFi', 'Modern Amenities'],
    capacity: room.capacity,
    floor: room.floor,
    status: room.status
  })) || [];

  // Filter rooms based on search and filters
  const filteredRooms = displayRooms.filter(room => {
    const matchesSearch = room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         room.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         room.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         room.features.some(feature => feature.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = selectedRoomType === 'all' || room.type.toLowerCase().includes(selectedRoomType.toLowerCase());
    const matchesPrice = room.price >= priceRange[0] && room.price <= priceRange[1];
    
    return matchesSearch && matchesType && matchesPrice;
  });

  const allRoomTypes = Array.from(new Set(displayRooms.map(room => room.type)));

  const amenities = [
    { icon: <Wifi className="w-6 h-6" />, name: 'Free WiFi', description: 'High-speed internet throughout the hotel' },
    { icon: <Car className="w-6 h-6" />, name: 'Free Parking', description: 'Complimentary valet parking service' },
    { icon: <Utensils className="w-6 h-6" />, name: 'Fine Dining', description: 'Award-winning restaurant and bar' },
    { icon: <Waves className="w-6 h-6" />, name: 'Spa & Pool', description: 'Luxury spa and outdoor swimming pool' }
  ];


  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-20">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Welcome to Your
            <span className="block bg-gradient-to-r from-blue-300 to-indigo-200 bg-clip-text text-transparent">
              Guest Portal
            </span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
            Discover luxury accommodations, manage your bookings, and enjoy our world-class amenities
          </p>
        </div>
      </section>



      {/* Guest Information Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {guestLoading ? (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              <div className="animate-pulse">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-6 bg-gray-200 rounded w-48"></div>
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
                  ))}
                </div>
              </div>
            </div>
          ) : guestError ? (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
              <div className="text-red-600 mb-4">
                <User className="w-12 h-12 mx-auto mb-2" />
                <p className="text-lg font-medium">Unable to load profile</p>
                <p className="text-sm text-red-500">{guestError}</p>
              </div>
            </div>
          ) : guest ? (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              {/* Guest Header */}
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {guest.firstName} {guest.lastName}
                  </h3>
                  <p className="text-gray-600">{guest.email}</p>
                </div>
              </div>

              {/* Guest Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                <div className="bg-purple-50 rounded-xl p-6 text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Clock className="w-6 h-6 text-purple-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900">
                    {new Date(guest.joinDate).toLocaleDateString()}
                  </h4>
                  <p className="text-sm text-gray-600">Member Since</p>
                </div>

                <div className="bg-orange-50 rounded-xl p-6 text-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <User className="w-6 h-6 text-orange-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 capitalize">
                    {guest.nationality}
                  </h4>
                  <p className="text-sm text-gray-600">Nationality</p>
                </div>
              </div>

              {/* Additional Guest Details */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Contact Information</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">{guest.phone}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">{guest.email}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Home className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">{guest.address || 'No address provided'}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Account Details</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">ID Number:</span>
                        <span className="text-gray-900 font-medium">{guest.idNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          guest.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {guest.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Last Updated:</span>
                        <span className="text-gray-900 font-medium">
                          {new Date(guest.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Preferences */}
                {guest.preferences && guest.preferences.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Preferences</h4>
                    <div className="flex flex-wrap gap-2">
                      {guest.preferences.map((preference, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                        >
                          {preference}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 text-center">
              <div className="text-gray-400 mb-4">
                <User className="w-12 h-12 mx-auto mb-2" />
                <p className="text-lg">No profile information available</p>
              </div>
            </div>
          )}
        </div>
      </section>

      

      {/* Find Your Perfect Room Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                <Bed className="w-8 h-8 text-white" />
              </div>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Find Your Perfect Room
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Discover luxury accommodations tailored to your needs. Search, filter, and book your ideal stay with ease.
            </p>
            
            {/* Quick Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by room name, type, amenities, or features..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg shadow-sm"
                />
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Filter className="w-4 h-4 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Filter Rooms</h3>
              </div>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedRoomType('all');
                  setPriceRange([0, maxPrice]);
                }}
                className="px-4 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
              >
                Clear All
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Room Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Room Type
                </label>
                <select
                  value={selectedRoomType}
                  onChange={(e) => setSelectedRoomType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Types</option>
                  {allRoomTypes.map(type => (
                    <option key={type} value={type.toLowerCase()}>{type}</option>
                  ))}
                </select>
              </div>

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
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>$0</span>
                    <span className="font-medium">${priceRange[1]}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Results Count */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Showing {filteredRooms.length} of {displayRooms.length} rooms
              </p>
            </div>
          </div>

          {/* Room Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              // Loading skeleton
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-6">
                    <div className="h-6 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-4"></div>
                    <div className="space-y-2 mb-6">
                      {[1, 2, 3].map((j) => (
                        <div key={j} className="h-3 bg-gray-200 rounded"></div>
                      ))}
                    </div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))
            ) : error ? (
              <div className="col-span-full text-center py-12">
                <div className="text-red-600 mb-4">
                  <Camera className="w-12 h-12 mx-auto mb-2" />
                  <p className="text-lg">Unable to load rooms</p>
                  <p className="text-sm text-gray-600">{error}</p>
                </div>
              </div>
            ) : filteredRooms.length > 0 ? (
              filteredRooms.slice(0, 6).map((room) => (
                <div key={room.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className="relative">
                    {room.image ? (
                      <img
                        src={getImageUrl(room.image)}
                        alt={room.name}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                        <div className="text-center text-gray-400">
                          <Camera className="w-12 h-12 mx-auto mb-2" />
                          <p className="text-sm">No image available</p>
                        </div>
                      </div>
                    )}
                    <div className="absolute top-4 right-4 bg-white px-3 py-2 rounded-full shadow-lg">
                      <span className="text-lg font-bold text-gray-900">${room.price}</span>
                      <span className="text-sm text-gray-600">/night</span>
                    </div>
                    <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                      <Users className="w-3 h-3 inline mr-1" />
                      {room.capacity} guest{room.capacity !== 1 ? 's' : ''}
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{room.name}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        room.status === 'available' ? 'bg-green-100 text-green-800' :
                        room.status === 'occupied' ? 'bg-blue-100 text-blue-800' :
                        room.status === 'cleaning' ? 'bg-yellow-100 text-yellow-800' :
                        room.status === 'maintenance' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {typeof room.status === 'string' ? room.status.replace('-', ' ') : 'Available'}
                      </span>
                    </div>
                    <p className="text-sm text-blue-600 font-medium mb-2">{room.type}</p>
                    <p className="text-gray-600 mb-4 text-sm">{room.description}</p>
                    
                    <div className="space-y-1 mb-6">
                      {room.features.slice(0, 3).map((feature: string, index: number) => (
                        <div key={index} className="flex items-center text-xs text-gray-700">
                          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></div>
                          {feature}
                        </div>
                      ))}
                      {room.features.length > 3 && (
                        <div className="text-xs text-gray-500">
                          +{room.features.length - 3} more amenities
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => navigate('/guest/rooms')}
                      className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                    >
                      View Details & Book
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Search className="w-12 h-12 mx-auto mb-2" />
                  <p className="text-lg">No rooms match your search</p>
                  <p className="text-sm">Try adjusting your filters</p>
                </div>
              </div>
            )}
          </div>

          {/* View All Rooms Button */}
          {filteredRooms.length > 6 && (
            <div className="text-center mt-8">
              <button
                onClick={() => navigate('/guest/rooms')}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2 mx-auto"
              >
                <span>View All Rooms</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Hotel Amenities */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Hotel Amenities</h2>
            <p className="text-lg text-gray-600">World-class facilities for your comfort and convenience</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {amenities.map((amenity, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                  {amenity.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{amenity.name}</h3>
                <p className="text-gray-600">{amenity.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Need Help?</h2>
            <p className="text-xl text-gray-300">Our team is here to assist you with any questions</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Call Us</h3>
              <p className="text-gray-300">+1 (555) 123-4567</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Email Us</h3>
              <p className="text-gray-300">reservations@curadingshotel.com</p>
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

export default GuestMenu;
