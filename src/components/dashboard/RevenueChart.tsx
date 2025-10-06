import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { RevenueData } from '../../api/types';

interface RevenueChartProps {
  data?: RevenueData[];
}

const RevenueChart: React.FC<RevenueChartProps> = ({ data = [] }) => {
  // Transform the data to match the chart format
  const chartData = data.map(item => ({
    name: item.month,
    revenue: item.revenue,
    bookings: item.bookings,
    occupancy: item.occupancy
  }));

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Revenue Trend</h2>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip 
              formatter={(value, name) => {
                if (name === 'revenue') return [`$${Number(value).toLocaleString()}`, 'Revenue'];
                if (name === 'bookings') return [value, 'Bookings'];
                if (name === 'occupancy') return [`${value}%`, 'Occupancy'];
                return [value, name];
              }}
              labelStyle={{ color: '#374151' }}
            />
            <Line 
              type="monotone" 
              dataKey="revenue" 
              stroke="#2563eb" 
              strokeWidth={3}
              dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RevenueChart;