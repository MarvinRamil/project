import { useState } from 'react';
import { Bed, Users, DollarSign, Plus, Filter, Search, Edit, Upload, Image as ImageIcon, Camera, X, ChevronLeft, ChevronRight, Wrench, Calendar } from 'lucide-react';
import { useRooms } from '../hooks';
import AddRoomModal from '../components/rooms/AddRoomModal';
import EditRoomModal from '../components/rooms/EditRoomModal';
import RoomImageUpload from '../components/rooms/RoomImageUpload';
import MaintenanceModal from '../components/rooms/MaintenanceModal';
import MaintenanceHistoryModal from '../components/rooms/MaintenanceHistoryModal';
import { Room } from '../api/types';
import { getImageUrl } from '../config/api';

const Rooms = () => {
  const {
    rooms,
    loading,
    error,
    statusFilter,
    setStatusFilter,
    searchTerm,
    setSearchTerm,
    updateRoomStatus,
    getStatusColor,
    refreshData
  } = useRooms();

  const [isAddRoomModalOpen, setIsAddRoomModalOpen] = useState(false);
  const [isEditRoomModalOpen, setIsEditRoomModalOpen] = useState(false);
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [isMaintenanceHistoryModalOpen, setIsMaintenanceHistoryModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [expandedUploadPanel, setExpandedUploadPanel] = useState<number | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [showImageModal, setShowImageModal] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading rooms...</div>
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Room Management</h1>
          <p className="text-sm md:text-base text-gray-600">Monitor and manage all hotel rooms</p>
        </div>
        <button 
          onClick={() => setIsAddRoomModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2 w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Room</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 md:p-4">
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search rooms by number or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm md:text-base border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm md:text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-auto"
            >
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
              <option value="cleaning">Cleaning</option>
              <option value="maintenance">Maintenance</option>
              <option value="out-of-order">Out of Order</option>
            </select>
          </div>
        </div>
      </div>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {rooms.map((room) => (
          <div key={room.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
            {/* Room Images Display */}
            {room.images && room.images.length > 0 ? (
              <div 
                className="relative h-48 bg-gray-100 cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => {
                  setSelectedRoom(room);
                  setSelectedImageIndex(0);
                  setShowImageModal(true);
                }}
              >
                <img
                  src={getImageUrl(room.images[0])}
                  alt={`Room ${room.number}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error('Failed to load room image:', room.images?.[0]);
                    e.currentTarget.style.display = 'none';
                  }}
                />
                {room.images.length > 1 && (
                  <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-xs">
                    +{room.images.length - 1} more
                  </div>
                )}
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                  <Camera className="w-3 h-3 inline mr-1" />
                  {room.images.length} image{room.images.length !== 1 ? 's' : ''}
                </div>
                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all flex items-center justify-center">
                  <div className="opacity-0 hover:opacity-100 transition-opacity bg-white bg-opacity-20 rounded-full p-2">
                    <ImageIcon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-48 bg-gray-100 flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <Camera className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">No images</p>
                </div>
              </div>
            )}

            {/* Room Information Panel */}
            <div className="p-4 md:p-6 flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2 md:space-x-3 min-w-0 flex-1">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Bed className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base md:text-lg font-semibold text-gray-900 truncate">Room {room.number}</h3>
                    <p className="text-xs md:text-sm text-gray-600">Floor {room.floor}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full flex-shrink-0 ${getStatusColor(String(room.status))}`}>
                  {String(room.status).replace('-', ' ')}
                </span>
              </div>

              <div className="space-y-2 md:space-y-3 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs md:text-sm text-gray-600">Type:</span>
                  <span className="text-xs md:text-sm font-medium text-gray-900 truncate ml-2">{room.type}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs md:text-sm text-gray-600">Capacity:</span>
                  <div className="flex items-center space-x-1">
                    <Users className="w-3 h-3 md:w-4 md:h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-xs md:text-sm font-medium text-gray-900">{room.capacity}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs md:text-sm text-gray-600">Rate:</span>
                  <div className="flex items-center space-x-1">
                    <DollarSign className="w-3 h-3 md:w-4 md:h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-xs md:text-sm font-medium text-gray-900">{room.price}/night</span>
                  </div>
                </div>
                {room.currentGuest && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs md:text-sm text-gray-600">Current Guest:</span>
                    <span className="text-xs md:text-sm font-medium text-gray-900 truncate ml-2">{room.currentGuest}</span>
                  </div>
                )}
              </div>

              {/* Amenities Section with Fixed Height */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="h-16 overflow-y-auto mb-3">
                  <div className="flex flex-wrap gap-1">
                    {room.amenities.map((amenity, index) => (
                      <span key={index} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded whitespace-nowrap">
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* Status and Action Buttons */}
                <div className="space-y-2">
                  <select
                    value={room.status}
                    onChange={(e) => updateRoomStatus(room.id, e.target.value as 'available' | 'occupied' | 'cleaning' | 'maintenance' | 'out-of-order')}
                    className="w-full text-xs border border-gray-200 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="available">Available</option>
                    <option value="occupied">Occupied</option>
                    <option value="cleaning">Cleaning</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="out-of-order">Out of Order</option>
                  </select>
                  
                  {/* Action Buttons - Bottom Right Corner */}
                  <div className="flex justify-end space-x-1">
                    <button
                      onClick={() => {
                        setSelectedRoom(room);
                        setIsMaintenanceModalOpen(true);
                      }}
                      className="px-2 py-1 text-xs bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors flex items-center space-x-1"
                      title="Schedule maintenance"
                    >
                      <Wrench className="w-3 h-3" />
                      <span className="hidden sm:inline">Maintenance</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedRoom(room);
                        setIsMaintenanceHistoryModalOpen(true);
                      }}
                      className="px-2 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors flex items-center space-x-1"
                      title="View maintenance history"
                    >
                      <Calendar className="w-3 h-3" />
                      <span className="hidden sm:inline">History</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedRoom(room);
                        setIsEditRoomModalOpen(true);
                      }}
                      className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center space-x-1"
                      title="Edit room"
                    >
                      <Edit className="w-3 h-3" />
                      <span className="hidden sm:inline">Edit</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Image Upload Panel */}
            <div className="border-t border-gray-200 bg-gray-50 mt-auto">
              <button
                onClick={() => setExpandedUploadPanel(expandedUploadPanel === room.id ? null : room.id)}
                className="w-full px-3 md:px-4 py-2 md:py-3 flex items-center justify-between text-left hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-2 min-w-0 flex-1">
                  <ImageIcon className="w-4 h-4 text-gray-600 flex-shrink-0" />
                  <span className="text-xs md:text-sm font-medium text-gray-700 truncate">Room Images</span>
                  {room.images && room.images.length > 0 && (
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full flex-shrink-0">
                      {room.images.length}/3
                    </span>
                  )}
                </div>
                <Upload className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${expandedUploadPanel === room.id ? 'rotate-180' : ''}`} />
              </button>
              
              {expandedUploadPanel === room.id && (
                <div className="px-3 md:px-4 pb-3 md:pb-4">
                  <RoomImageUpload
                    roomId={room.id}
                    existingImages={room.images || []}
                    onImagesUpdated={() => {
                      // Update the room in the local state
                      refreshData();
                    }}
                    maxImages={3}
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {rooms.length === 0 && (
        <div className="text-center py-12">
          <Bed className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No rooms found</h3>
          <p className="text-gray-600">Try adjusting your search criteria</p>
        </div>
      )}

      {/* Add Room Modal */}
      <AddRoomModal
        isOpen={isAddRoomModalOpen}
        onClose={() => setIsAddRoomModalOpen(false)}
        onRoomAdded={() => {
          refreshData();
          setIsAddRoomModalOpen(false);
        }}
      />

      {/* Edit Room Modal */}
      <EditRoomModal
        isOpen={isEditRoomModalOpen}
        onClose={() => {
          setIsEditRoomModalOpen(false);
          setSelectedRoom(null);
        }}
        onRoomUpdated={() => {
          refreshData();
          setIsEditRoomModalOpen(false);
          setSelectedRoom(null);
        }}
        room={selectedRoom}
      />

      {/* Maintenance Modal */}
      <MaintenanceModal
        isOpen={isMaintenanceModalOpen}
        onClose={() => {
          setIsMaintenanceModalOpen(false);
          setSelectedRoom(null);
        }}
        room={selectedRoom}
      />

      {/* Maintenance History Modal */}
      <MaintenanceHistoryModal
        isOpen={isMaintenanceHistoryModalOpen}
        onClose={() => {
          setIsMaintenanceHistoryModalOpen(false);
          setSelectedRoom(null);
        }}
        room={selectedRoom}
      />

      {/* Image Modal */}
      {showImageModal && selectedRoom && selectedRoom.images && selectedRoom.images.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Room {selectedRoom.number} Images
              </h3>
              <button
                onClick={() => setShowImageModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-4">
              <div className="relative">
                <img
                  src={getImageUrl(selectedRoom.images[selectedImageIndex])}
                  alt={`Room ${selectedRoom.number} - Image ${selectedImageIndex + 1}`}
                  className="w-full h-96 object-contain bg-gray-100 rounded"
                  onError={(e) => {
                    console.error('Failed to load image:', selectedRoom.images?.[selectedImageIndex]);
                    e.currentTarget.src = '/placeholder-image.png';
                  }}
                />
                
                {selectedRoom.images.length > 1 && (
                  <>
                    <button
                      onClick={() => setSelectedImageIndex(prev => 
                        prev > 0 ? prev - 1 : (selectedRoom.images?.length || 1) - 1
                      )}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setSelectedImageIndex(prev => 
                        prev < (selectedRoom.images?.length || 1) - 1 ? prev + 1 : 0
                      )}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
              
              {selectedRoom.images.length > 1 && (
                <div className="mt-4 flex justify-center space-x-2">
                  {selectedRoom.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`w-3 h-3 rounded-full transition-all ${
                        index === selectedImageIndex 
                          ? 'bg-blue-600' 
                          : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                    />
                  ))}
                </div>
              )}
              
              <div className="mt-4 text-center text-sm text-gray-600">
                Image {selectedImageIndex + 1} of {selectedRoom.images.length}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rooms;