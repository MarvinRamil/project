import { useState, useEffect } from 'react';
import { dashboardApi } from '../api';

export const useReports = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [roomStatusData, setRoomStatusData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReportsData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [revenueResponse, roomStatusResponse] = await Promise.all([
        dashboardApi.getRevenueData(selectedPeriod as any),
        dashboardApi.getRoomStatusOverview()
      ]);

      if (revenueResponse.success) {
        setRevenueData(revenueResponse.data);
      }

      if (roomStatusResponse.success) {
        setRoomStatusData(roomStatusResponse.data);
      }
    } catch (err) {
      setError('Failed to fetch reports data');
      console.error('Reports data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (format: 'pdf' | 'excel' | 'csv') => {
    try {
      // Simulate export functionality
      console.log(`Exporting report in ${format} format...`);
      // In a real app, this would call an API endpoint to generate and download the report
      return { success: true, message: `Report exported in ${format} format` };
    } catch (err) {
      setError('Failed to export report');
      console.error('Export error:', err);
      return { success: false, error: 'Failed to export report' };
    }
  };

  const getMonthlyPerformance = () => {
    // Mock monthly performance data
    return [
      { month: 'Jan', revenue: 45000, bookings: 180, occupancy: 75, averageRate: 250 },
      { month: 'Feb', revenue: 52000, bookings: 210, occupancy: 82, averageRate: 248 },
      { month: 'Mar', revenue: 48000, bookings: 195, occupancy: 78, averageRate: 246 },
      { month: 'Apr', revenue: 58000, bookings: 235, occupancy: 88, averageRate: 247 },
      { month: 'May', revenue: 61000, bookings: 248, occupancy: 92, averageRate: 246 },
      { month: 'Jun', revenue: 55000, bookings: 225, occupancy: 85, averageRate: 244 },
    ];
  };

  const getRoomTypeDistribution = () => {
    return [
      { name: 'Standard', value: 60, color: '#3B82F6' },
      { name: 'Deluxe', value: 30, color: '#10B981' },
      { name: 'Suite', value: 10, color: '#F59E0B' },
    ];
  };

  useEffect(() => {
    fetchReportsData();
  }, [selectedPeriod]);

  return {
    selectedPeriod,
    setSelectedPeriod,
    revenueData,
    roomStatusData,
    loading,
    error,
    exportReport,
    getMonthlyPerformance,
    getRoomTypeDistribution,
    refreshData: fetchReportsData
  };
};
