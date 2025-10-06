import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Bed,
  Calendar,
  Users,
  UserCheck,
  BarChart3,
  Settings,
  Hotel,
  X
} from 'lucide-react';
import { useSidebar } from '../../contexts/SidebarContext';

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Rooms', href: '/admin/rooms', icon: Bed },
  { name: 'Bookings', href: '/admin/bookings', icon: Calendar },
  { name: 'Guests', href: '/admin/guests', icon: Users },
  { name: 'Staff', href: '/admin/staff', icon: UserCheck },
  { name: 'Reports', href: '/admin/reports', icon: BarChart3 },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

const Sidebar = () => {
  const location = useLocation();
  const { isOpen, closeSidebar } = useSidebar();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50
        flex flex-col w-64 bg-white border-r border-gray-200
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        shadow-lg lg:shadow-none
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between h-16 border-b border-gray-200 px-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <div>
              <span className="text-xl font-bold text-gray-900">Curading's Hotel</span>
              <p className="text-xs text-gray-600">Management System</p>
            </div>
          </div>
          
          {/* Close button for mobile */}
          <button
            onClick={closeSidebar}
            className="lg:hidden p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href || 
              (item.href === '/dashboard' && location.pathname === '/admin');
            
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={closeSidebar} // Close sidebar when navigating on mobile
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;