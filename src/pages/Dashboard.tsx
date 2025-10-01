import React, { useEffect } from 'react';
import { Users, Bed, Calendar, DollarSign, TrendingUp, Check as CheckIn, Check as CheckOut, AlertTriangle } from 'lucide-react';
import { useDashboard } from '../hooks';
import { tokenManager } from '../utils/tokenManager';
import StatCard from '../components/dashboard/StatCard';
import RecentBookings from '../components/dashboard/RecentBookings';
import RoomStatusOverview from '../components/dashboard/RoomStatusOverview';
import RevenueChart from '../components/dashboard/RevenueChart';

const Dashboard = () => {
  const { stats, bookings, rooms, loading, error } = useDashboard();

  useEffect(() => {
    console.log('Dashboard init - token:', tokenManager.getAccessToken() ? 'Token exists' : 'No token');
    console.log('Dashboard init - isAuthenticated:', tokenManager.isAuthenticated());
  }, []);

  useEffect(() => {
    console.log('Dashboard state changed:', { stats, rooms, bookings, loading, error });
  }, [stats, rooms, bookings, loading, error]);

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
        <div className="text-lg text-red-600">Error: {error}</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">No data available</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening at your hotel today.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={`$${stats.monthlyRevenue.toLocaleString()}`}
          change="+12.5%"
          changeType="increase"
          icon={DollarSign}
          color="green"
        />
        <StatCard
          title="Occupancy Rate"
          value={`${stats.occupancyRate}%`}
          change="+3.2%"
          changeType="increase"
          icon={Bed}
          color="blue"
        />
        <StatCard
          title="Today's Check-ins"
          value={stats.todayCheckIns.toString()}
          change="2 pending"
          changeType="neutral"
          icon={CheckIn}
          color="purple"
        />
        <StatCard
          title="Available Rooms"
          value={stats.availableRooms.toString()}
          change={`${stats.totalRooms} total`}
          changeType="neutral"
          icon={Calendar}
          color="orange"
        />
      </div>

      {/* Charts and overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart />
        <RoomStatusOverview />
      </div>

      {/* Recent bookings */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Bookings</h2>
        </div>
        <RecentBookings bookings={bookings} />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Today's Check-ins</h3>
            <CheckIn className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.todayCheckIns}</p>
          <p className="text-sm text-gray-600">guests arriving today</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Today's Check-outs</h3>
            <CheckOut className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.todayCheckOuts}</p>
          <p className="text-sm text-gray-600">guests departing today</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Maintenance Required</h3>
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.outOfOrderRooms}</p>
          <p className="text-sm text-gray-600">rooms need attention</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;