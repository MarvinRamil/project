import React from 'react';
import { Bed, Wrench, Sparkles, DoorOpen } from 'lucide-react';
import { RoomStatusOverview as RoomStatusOverviewType } from '../../api/types';

interface RoomStatusOverviewProps {
  data?: RoomStatusOverviewType[];
}

const RoomStatusOverview: React.FC<RoomStatusOverviewProps> = ({ data = [] }) => {
  const getStatusIcon = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('available')) return DoorOpen;
    if (statusLower.includes('occupied')) return Bed;
    if (statusLower.includes('cleaning')) return Sparkles;
    if (statusLower.includes('maintenance') || statusLower.includes('out of order')) return Wrench;
    return Bed;
  };

  const getStatusColor = (color: string) => {
    // Convert hex color to appropriate text and background classes
    const colorMap: Record<string, string> = {
      '#10B981': 'text-green-600 bg-green-100',
      '#3B82F6': 'text-blue-600 bg-blue-100',
      '#F59E0B': 'text-yellow-600 bg-yellow-100',
      '#EF4444': 'text-red-600 bg-red-100',
      '#6B7280': 'text-gray-600 bg-gray-100'
    };
    return colorMap[color] || 'text-gray-600 bg-gray-100';
  };

  const getProgressBarColor = (color: string) => {
    const colorMap: Record<string, string> = {
      '#10B981': 'bg-green-500',
      '#3B82F6': 'bg-blue-500',
      '#F59E0B': 'bg-yellow-500',
      '#EF4444': 'bg-red-500',
      '#6B7280': 'bg-gray-500'
    };
    return colorMap[color] || 'bg-gray-500';
  };

  const totalRooms = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Room Status Overview</h2>
      
      <div className="space-y-4">
        {data.map((item) => {
          const count = item.count;
          const percentage = totalRooms > 0 ? (count / totalRooms) * 100 : 0;
          const Icon = getStatusIcon(item.status);
          const colorClasses = getStatusColor(item.color);
          const progressBarColor = getProgressBarColor(item.color);
          
          return (
            <div key={item.status} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{item.status}</p>
                  <p className="text-sm text-gray-600">{count} rooms</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-gray-900">{percentage.toFixed(1)}%</p>
                <div className="w-20 h-2 bg-gray-200 rounded-full">
                  <div 
                    className={`h-2 rounded-full ${progressBarColor}`}
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