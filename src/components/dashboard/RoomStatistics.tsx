import React from 'react';
import { 
  Bed, 
  Users, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  CheckCircle, 
  XCircle,
  Home,
  Wrench
} from 'lucide-react';
import { HotelStats } from '../../api/types';

interface RoomStatisticsProps {
  stats: HotelStats;
}

const RoomStatistics: React.FC<RoomStatisticsProps> = ({ stats }) => {
  const statistics = [
    {
      title: 'Total Rooms',
      value: stats.totalRooms,
      icon: Home,
      color: 'blue',
      description: 'Total hotel rooms'
    },
    {
      title: 'Occupied Rooms',
      value: stats.occupiedRooms,
      icon: Bed,
      color: 'red',
      description: 'Currently occupied'
    },
    {
      title: 'Available Rooms',
      value: stats.availableRooms,
      icon: CheckCircle,
      color: 'green',
      description: 'Ready for guests'
    },
    {
      title: 'Out of Order',
      value: stats.outOfOrderRooms,
      icon: Wrench,
      color: 'orange',
      description: 'Under maintenance'
    },
    {
      title: 'Today\'s Check-ins',
      value: stats.todayCheckIns,
      icon: Users,
      color: 'purple',
      description: 'Guests arriving today'
    },
    {
      title: 'Today\'s Check-outs',
      value: stats.todayCheckOuts,
      icon: XCircle,
      color: 'gray',
      description: 'Guests departing today'
    },
    {
      title: 'Today\'s Revenue',
      value: `$${stats.todayRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'emerald',
      description: 'Revenue for today'
    },
    {
      title: 'Monthly Revenue',
      value: `$${stats.monthlyRevenue.toLocaleString()}`,
      icon: TrendingUp,
      color: 'indigo',
      description: 'Revenue this month'
    },
    {
      title: 'Average Rate',
      value: `$${stats.averageRate.toLocaleString()}`,
      icon: DollarSign,
      color: 'teal',
      description: 'Average room rate'
    },
    {
      title: 'Occupancy Rate',
      value: `${stats.occupancyRate}%`,
      icon: Bed,
      color: 'blue',
      description: 'Current occupancy'
    }
  ];

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: 'bg-blue-50 text-blue-600 border-blue-200',
      red: 'bg-red-50 text-red-600 border-red-200',
      green: 'bg-green-50 text-green-600 border-green-200',
      orange: 'bg-orange-50 text-orange-600 border-orange-200',
      purple: 'bg-purple-50 text-purple-600 border-purple-200',
      gray: 'bg-gray-50 text-gray-600 border-gray-200',
      emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200',
      teal: 'bg-teal-50 text-teal-600 border-teal-200'
    };
    return colorMap[color] || 'bg-gray-50 text-gray-600 border-gray-200';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Room Statistics</h2>
        <p className="text-sm text-gray-600">Current hotel room status and performance metrics</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {statistics.map((stat, index) => {
          const Icon = stat.icon;
          const colorClasses = getColorClasses(stat.color);
          
          return (
            <div 
              key={index}
              className={`p-4 rounded-lg border-2 ${colorClasses} hover:shadow-md transition-shadow duration-200`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg ${colorClasses.replace('border-', 'bg-').replace(' text-', ' text-').split(' ')[0]} bg-opacity-20`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{stat.value}</div>
                </div>
              </div>
              <div>
                <h3 className="font-medium text-sm mb-1">{stat.title}</h3>
                <p className="text-xs opacity-75">{stat.description}</p>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Summary Section */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{stats.occupancyRate}%</div>
            <div className="text-sm text-blue-800">Overall Occupancy</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {stats.totalRooms > 0 ? Math.round((stats.availableRooms / stats.totalRooms) * 100) : 0}%
            </div>
            <div className="text-sm text-green-800">Availability Rate</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {stats.todayCheckIns + stats.todayCheckOuts}
            </div>
            <div className="text-sm text-purple-800">Total Daily Activity</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomStatistics;
