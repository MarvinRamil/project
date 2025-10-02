import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Wifi, Car, Utensils, Waves, Phone, Mail, Calendar, Users, Camera } from 'lucide-react';
import { useRoomsForGuests } from '../hooks';
import { getImageUrl } from '../config/api';

const GuestLanding = () => {
  const { rooms, loading, error } = useRoomsForGuests();
  const [displayRooms, setDisplayRooms] = useState<Array<{
    id: string;
    name: string;
    type: string;
    price: number;
    image: string | null;
    description: string;
    features: string[];
    capacity: number;
    floor: number;
    status: string;
  }>>([]);

  const amenities = [
    { icon: <Wifi className="w-6 h-6" />, name: 'Free WiFi', description: 'High-speed internet throughout the hotel' },
    { icon: <Car className="w-6 h-6" />, name: 'Free Parking', description: 'Complimentary valet parking service' },
    { icon: <Utensils className="w-6 h-6" />, name: 'Fine Dining', description: 'Award-winning restaurant and bar' },
    { icon: <Waves className="w-6 h-6" />, name: 'Spa & Pool', description: 'Luxury spa and outdoor swimming pool' }
  ];

  // Process room data to display all individual rooms
  useEffect(() => {
    if (rooms && rooms.length > 0) {
      // Map all individual rooms to display format
      const mappedRooms = rooms.map(room => ({
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
      // Convert status to string to match expected type
      }));
      
      setDisplayRooms(mappedRooms.map(room => ({
        ...room,
        status: String(room.status)
      })));
    }
  }, [rooms]);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <div>
                <h1 className="font-bold text-xl text-gray-900">Curading's Hotel</h1>
                <p className="text-xs text-gray-600">Luxury & Comfort</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <a href="#rooms" className="text-gray-700 hover:text-blue-600 font-medium">Rooms</a>
              <a href="#amenities" className="text-gray-700 hover:text-blue-600 font-medium">Amenities</a>
              <a href="#contact" className="text-gray-700 hover:text-blue-600 font-medium">Contact</a>
              <Link
                to="/rooms"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Book Now
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center">
        <div 
          className="absolute inset-0 bg-black opacity-50"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1920&h=1080&fit=crop)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Welcome to
            <span className="block bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">
              Curading's Hotel
            </span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Experience unparalleled luxury and comfort in the heart of the city. 
            Where every moment becomes a cherished memory.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/rooms"
              className="bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              <Calendar className="inline-block w-5 h-5 mr-2" />
              Book Your Stay
            </Link>
            <a
              href="#rooms"
              className="border-2 border-white text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white hover:text-gray-900 transition-all duration-200"
            >
              Explore Rooms
            </a>
          </div>
        </div>
      </section>

      {/* Rooms Section */}
      <section id="rooms" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Rooms & Suites</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose from our {displayRooms.length} carefully designed accommodations, each offering unique comfort and style
            </p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
                  <div className="h-64 bg-gray-200"></div>
                  <div className="p-6">
                    <div className="h-6 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-4"></div>
                    <div className="space-y-2 mb-6">
                      {[1, 2, 3].map((j) => (
                        <div key={j} className="h-3 bg-gray-200 rounded"></div>
                      ))}
                    </div>
                    <div className="h-12 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <div className="text-red-600 mb-4">
                <Camera className="w-12 h-12 mx-auto mb-2" />
                <p className="text-lg">Unable to load rooms</p>
                <p className="text-sm text-gray-600">{error}</p>
              </div>
            </div>
          )}

          {/* Room Types Display */}
          {!loading && !error && displayRooms.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayRooms.map((room) => (
                <div key={room.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className="relative">
                    {room.image ? (
                      <img
                        src={getImageUrl(room.image)}
                        alt={room.name}
                        className="w-full h-64 object-cover"
                        onError={(e) => {
                          console.error('Failed to load room image:', room.image);
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
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
                    <div className="absolute top-4 left-4 bg-white px-2 py-1 rounded text-xs font-medium">
                      Floor {room.floor}
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-2xl font-bold text-gray-900">{room.name}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        room.status === 'available' ? 'bg-green-100 text-green-800' :
                        room.status === 'occupied' ? 'bg-blue-100 text-blue-800' :
                        room.status === 'cleaning' ? 'bg-yellow-100 text-yellow-800' :
                        room.status === 'maintenance' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {room.status?.replace('-', ' ') || 'Available'}
                      </span>
                    </div>
                    <p className="text-sm text-blue-600 font-medium mb-2">{room.type}</p>
                    <p className="text-gray-600 mb-4">{room.description}</p>
                    
                    <div className="space-y-2 mb-6">
                      {room.features.slice(0, 4).map((feature: string, index: number) => (
                        <div key={index} className="flex items-center text-sm text-gray-700">
                          <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                          {feature}
                        </div>
                      ))}
                      {room.features.length > 4 && (
                        <div className="text-sm text-gray-500">
                          +{room.features.length - 4} more amenities
                        </div>
                      )}
                    </div>

                    <Link
                      to="/rooms"
                      className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium text-center block"
                    >
                      Book This Room
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No Rooms State */}
          {!loading && !error && displayRooms.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Camera className="w-12 h-12 mx-auto mb-2" />
                <p className="text-lg">No rooms available</p>
                <p className="text-sm">Please check back later</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Amenities Section */}
      <section id="amenities" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Hotel Amenities</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Enjoy world-class facilities and services designed for your comfort and convenience
            </p>
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

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-4xl font-bold mb-6">Get in Touch</h2>
              <p className="text-xl text-gray-300 mb-8">
                Ready to experience luxury? Contact us to make a reservation or learn more about our services.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <Phone className="w-6 h-6 text-blue-400 mr-4" />
                  <span className="text-lg">+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center">
                  <Mail className="w-6 h-6 text-blue-400 mr-4" />
                  <span className="text-lg">reservations@curadingshotel.com</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-6 h-6 text-blue-400 mr-4" />
                  <span className="text-lg">123 Luxury Avenue, Downtown City</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 p-8 rounded-2xl">
              <h3 className="text-2xl font-bold mb-6">Quick Booking</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Check-in Date</label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Check-out Date</label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Guests</label>
                  <select className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white">
                    <option>1 Guest</option>
                    <option>2 Guests</option>
                    <option>3 Guests</option>
                    <option>4 Guests</option>
                  </select>
                </div>
                <Link
                  to="/rooms"
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium text-center block"
                >
                  <Users className="inline-block w-5 h-5 mr-2" />
                  Check Availability
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <div>
                <h3 className="font-bold text-xl">Curading's Hotel</h3>
                <p className="text-sm text-gray-400">Luxury & Comfort</p>
              </div>
            </div>
            <p className="text-gray-400 mb-4">
              © 2024 Curading's Hotel. All rights reserved.
            </p>
            <div className="flex justify-center space-x-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Contact Us</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default GuestLanding;