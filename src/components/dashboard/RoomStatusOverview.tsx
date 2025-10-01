import React from 'react';
import { useHotel } from '../../contexts/HotelContext';
import { Bed, Wrench, Sparkles, DoorOpen } from 'lucide-react';

const RoomStatusOverview = () => {
  const { rooms } = useHotel();

  const statusCounts = rooms.reduce((acc, room) => {
    acc[room.status] = (acc[room.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusConfig = {
    available: { label: 'Available', color: 'text-green-600 bg-green-100', icon: DoorOpen },
    occupied: { label: 'Occupied', color: 'text-blue-600 bg-blue-100', icon: Bed },
    cleaning: { label: 'Cleaning', color: 'text-yellow-600 bg-yellow-100', icon: Sparkles },
    maintenance: { label: 'Maintenance', color: 'text-red-600 bg-red-100', icon: Wrench },
    'out-of-order': { label: 'Out of Order', color: 'text-gray-600 bg-gray-100', icon: Wrench }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Room Status Overview</h2>
      
      <div className="space-y-4">
        {Object.entries(statusConfig).map(([status, config]) => {
          const count = statusCounts[status] || 0;
          const percentage = (count / rooms.length) * 100;
          const Icon = config.icon;
          
          return (
            <div key={status} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${config.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{config.label}</p>
                  <p className="text-sm text-gray-600">{count} rooms</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-gray-900">{percentage.toFixed(1)}%</p>
                <div className="w-20 h-2 bg-gray-200 rounded-full">
                  <div 
                    className={`h-2 rounded-full ${config.color.replace('text-', 'bg-').replace(' bg-', ' bg-').split(' ')[1]}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RoomStatusOverview;