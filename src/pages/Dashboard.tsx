import React, { useEffect } from 'react';
import { Users, Bed, Calendar, DollarSign, TrendingUp, Check as CheckIn, Check as CheckOut, AlertTriangle } from 'lucide-react';
import { useDashboard } from '../hooks';
import { tokenManager } from '../utils/tokenManager';
import StatCard from '../components/dashboard/StatCard';
import RecentBookings from '../components/dashboard/RecentBookings';
import RoomStatusOverview from '../components/dashboard/RoomStatusOverview';
import RevenueChart from '../components/dashboard/RevenueChart';
import RoomStatistics from '../components/dashboard/RoomStatistics';
import QuickActions from '../components/dashboard/QuickActions';

const Dashboard = () => {
  const { stats, bookings, revenueData, roomStatusOverview, quickActions, loading, error } = useDashboard();

  useEffect(() => {
    console.log('Dashboard init - token:', tokenManager.getAccessToken() ? 'Token exists' : 'No token');
    console.log('Dashboard init - isAuthenticated:', tokenManager.isAuthenticated());
  }, []);

  useEffect(() => {
    console.log('Dashboard state changed:', { stats, revenueData, roomStatusOverview, bookings, quickActions, loading, error });
  }, [stats, revenueData, roomStatusOverview, bookings, quickActions, loading, error]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-lg text-red-600 mb-2">Error: {error}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-lg text-gray-600 mb-2">No data available</div>
          <div className="text-sm text-gray-500 mb-4">
            Debug info: Loading: {loading.toString()}, Error: {error || 'None'}, Stats: {stats ? 'Present' : 'Missing'}
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening at your hotel today.</p>
        {stats && stats.occupancyRate === 50 && stats.totalRooms === 2 ? (
          <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Currently displaying fallback data. The API connection may be unavailable or require authentication.
            </p>
            <button 
              onClick={() => {
                console.log('Testing stats API...');
                fetch('https://backend.mrcurading.xyz/api/Dashboard/stats')
                  .then(response => response.json())
                  .then(data => {
                    console.log('Stats API Response:', data);
                    alert('Check console for API response');
                  })
                  .catch(error => {
                    console.error('Stats API Error:', error);
                    alert('API Error - Check console for details');
                  });
              }}
              className="mt-2 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
            >
              Test Stats API
            </button>
          </div>
        ) : stats && (
          <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-800">
              <strong>Success:</strong> Data loaded from API endpoint: /api/Dashboard/stats
            </p>
          </div>
        )}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Monthly Revenue"
          value={`$${stats.monthlyRevenue.toLocaleString()}`}
          change={`$${stats.todayRevenue.toLocaleString()} today`}
          changeType="neutral"
          icon={DollarSign}
          color="green"
        />
        <StatCard
          title="Occupancy Rate"
          value={`${stats.occupancyRate}%`}
          change={`${stats.occupiedRooms}/${stats.totalRooms} rooms`}
          changeType="neutral"
          icon={Bed}
          color="blue"
        />
        <StatCard
          title="Today's Check-ins"
          value={stats.todayCheckIns.toString()}
          change={`${stats.todayCheckOuts} check-outs`}
          changeType="neutral"
          icon={CheckIn}
          color="purple"
        />
        <StatCard
          title="Available Rooms"
          value={stats.availableRooms.toString()}
          change={`${stats.outOfOrderRooms} out of order`}
          changeType="neutral"
          icon={Calendar}
          color="orange"
        />
      </div>

      {/* Room Statistics View */}
      <RoomStatistics stats={stats} />

      {/* Charts and overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart data={revenueData} />
        <RoomStatusOverview data={roomStatusOverview} />
      </div>

      {/* Recent bookings */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Bookings</h2>
        </div>
        <RecentBookings bookings={bookings} />
      </div>

      {/* Quick Actions */}
      <QuickActions actions={quickActions} />
    </div>
  );
};

export default Dashboard;