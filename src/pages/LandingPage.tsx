import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  Bed, 
  Calendar, 
  User, 
  Settings, 
  Users, 
  BarChart3, 
  LogOut,
  ArrowRight,
  Home,
  Shield
} from 'lucide-react';

const LandingPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBasedActions = () => {
    if (!user) return [];

    switch (user.role) {
      case 'admin':
      case 'manager':
      case 'receptionist':
      case 'housekeeping':
        return [
          {
            title: 'Dashboard',
            description: 'View hotel statistics and overview',
            icon: <BarChart3 className="w-8 h-8" />,
            color: 'bg-blue-600',
            hoverColor: 'hover:bg-blue-700',
            action: () => navigate('/admin/dashboard')
          },
          {
            title: 'Rooms Management',
            description: 'Manage hotel rooms and availability',
            icon: <Bed className="w-8 h-8" />,
            color: 'bg-green-600',
            hoverColor: 'hover:bg-green-700',
            action: () => navigate('/admin/rooms')
          },
          {
            title: 'Bookings',
            description: 'View and manage guest bookings',
            icon: <Calendar className="w-8 h-8" />,
            color: 'bg-purple-600',
            hoverColor: 'hover:bg-purple-700',
            action: () => navigate('/admin/bookings')
          },
          {
            title: 'Guests',
            description: 'Manage guest information',
            icon: <Users className="w-8 h-8" />,
            color: 'bg-orange-600',
            hoverColor: 'hover:bg-orange-700',
            action: () => navigate('/admin/guests')
          },
          {
            title: 'Staff',
            description: 'Manage hotel staff',
            icon: <User className="w-8 h-8" />,
            color: 'bg-indigo-600',
            hoverColor: 'hover:bg-indigo-700',
            action: () => navigate('/admin/staff')
          },
          {
            title: 'Settings',
            description: 'Configure hotel settings',
            icon: <Settings className="w-8 h-8" />,
            color: 'bg-gray-600',
            hoverColor: 'hover:bg-gray-700',
            action: () => navigate('/admin/settings')
          }
        ];
      
      case 'guest':
        return [
          {
            title: 'Find Your Perfect Room',
            description: 'Browse and book available rooms',
            icon: <Bed className="w-8 h-8" />,
            color: 'bg-blue-600',
            hoverColor: 'hover:bg-blue-700',
            action: () => navigate('/guest/menu')
          },
          {
            title: 'My Bookings',
            description: 'View and manage your reservations',
            icon: <Calendar className="w-8 h-8" />,
            color: 'bg-green-600',
            hoverColor: 'hover:bg-green-700',
            action: () => navigate('/guest/bookings')
          }
        ];
      
      default:
        return [];
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'manager': return 'Manager';
      case 'receptionist': return 'Receptionist';
      case 'housekeeping': return 'Housekeeping';
      case 'guest': return 'Guest';
      default: return 'User';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'manager': return 'bg-blue-100 text-blue-800';
      case 'receptionist': return 'bg-green-100 text-green-800';
      case 'housekeeping': return 'bg-yellow-100 text-yellow-800';
      case 'guest': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to access this page</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const actions = getRoleBasedActions();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <div>
                <h1 className="font-bold text-xl text-gray-900">Curading's Hotel</h1>
                <p className="text-sm text-gray-600">Management Portal</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user.name || 'User'}
                </p>
                <p className="text-xs text-gray-600">{user.email}</p>
              </div>
              <span className={`px-3 py-1 text-xs font-medium rounded-full ${getRoleColor(user.role)}`}>
                {getRoleDisplayName(user.role)}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
              <Home className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Welcome to Your Portal
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose from the available options below to access your {getRoleDisplayName(user.role).toLowerCase()} features
          </p>
        </div>

        {/* Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {actions.map((action, index) => (
            <div
              key={index}
              onClick={action.action}
              className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer group"
            >
              <div className={`w-16 h-16 ${action.color} ${action.hoverColor} rounded-2xl flex items-center justify-center mx-auto mb-6 text-white transition-colors group-hover:scale-110`}>
                {action.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">{action.title}</h3>
              <p className="text-gray-600 text-center mb-6">{action.description}</p>
              <div className="flex items-center justify-center text-blue-600 font-medium group-hover:text-blue-700">
                <span>Access</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="mt-16 bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Quick Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Your Role</h3>
              <p className="text-gray-600">{getRoleDisplayName(user.role)}</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Level</h3>
              <p className="text-gray-600">
                {user.role === 'guest' ? 'Guest Portal' : 'Admin Portal'}
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Home className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Portal</h3>
              <p className="text-gray-600">Curading's Hotel</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
