import React from 'react';
import { 
  Plus, 
  LogIn, 
  LogOut, 
  Home, 
  Wrench, 
  BarChart3,
  ArrowRight
} from 'lucide-react';
import { QuickAction } from '../../api/types';

interface QuickActionsProps {
  actions: QuickAction[];
}

const QuickActions: React.FC<QuickActionsProps> = ({ actions }) => {
  const getIcon = (iconName: string) => {
    const iconMap: Record<string, React.ComponentType<any>> = {
      plus: Plus,
      login: LogIn,
      logout: LogOut,
      home: Home,
      wrench: Wrench,
      chart: BarChart3
    };
    return iconMap[iconName] || Plus;
  };

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100',
      green: 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100',
      orange: 'bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100',
      purple: 'bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100',
      red: 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100',
      indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100'
    };
    return colorMap[color] || 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100';
  };

  const handleActionClick = (action: QuickAction) => {
    console.log('Quick action clicked:', action);
    // Here you can add navigation logic or API calls based on the action value
    switch (action.value) {
      case 'Create':
        // Navigate to booking creation
        console.log('Navigate to create booking');
        break;
      case 'CheckIn':
        // Navigate to check-in page
        console.log('Navigate to check-in');
        break;
      case 'CheckOut':
        // Navigate to check-out page
        console.log('Navigate to check-out');
        break;
      case 'RoomStatus':
        // Navigate to room status page
        console.log('Navigate to room status');
        break;
      case 'Maintenance':
        // Navigate to maintenance page
        console.log('Navigate to maintenance');
        break;
      case 'Reports':
        // Navigate to reports page
        console.log('Navigate to reports');
        break;
      default:
        console.log('Unknown action:', action.value);
    }
  };

  if (!actions || actions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <p className="text-gray-500">No quick actions available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
        <p className="text-sm text-gray-600">Common hotel management tasks</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {actions.map((action, index) => {
          const Icon = getIcon(action.icon);
          const colorClasses = getColorClasses(action.color);
          
          return (
            <button
              key={index}
              onClick={() => handleActionClick(action)}
              className={`p-4 rounded-lg border-2 ${colorClasses} transition-all duration-200 text-left group cursor-pointer`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg ${colorClasses.replace('border-', 'bg-').replace(' text-', ' text-').split(' ')[0]} bg-opacity-20`}>
                  <Icon className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              </div>
              <div>
                <h3 className="font-medium text-sm mb-1">{action.title}</h3>
                <p className="text-xs opacity-75">{action.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions;
