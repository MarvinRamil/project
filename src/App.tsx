import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { HotelProvider } from './contexts/HotelContext';
import { BookingProvider } from './contexts/BookingContext';
import { SidebarProvider } from './contexts/SidebarContext';
import GuestLanding from './pages/GuestLanding';
import RoomBooking from './pages/RoomBooking';
import BookingConfirmation from './pages/BookingConfirmation';
import Sidebar from './components/layout/Sidebar';
import GuestSidebar from './components/layout/GuestSidebar';
import Header from './components/layout/Header';
import Dashboard from './pages/Dashboard';
import Rooms from './pages/Rooms';
import Bookings from './pages/Bookings';
import Guests from './pages/Guests';
import Staff from './pages/Staff';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import GuestBookings from './pages/GuestBookings';
import GuestMenu from './pages/GuestMenu';
import LandingPage from './pages/LandingPage';
import { useAuth } from './contexts/AuthContext';

function AdminContent() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Access Required</h1>
            <p className="text-gray-600">Please log in to access the hotel management system</p>
          </div>
          <Login />
        </div>
      </div>
    );
  }

  // Redirect guests to guest menu
  if (user.role === 'guest') {
    window.location.href = '/guest/menu';
    return null;
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function GuestContent() {
  const { user } = useAuth();
  
  console.log('GuestContent - User:', user);
  console.log('GuestContent - User role:', user?.role);

  if (!user) {
    console.log('GuestContent - No user, showing login');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Guest Access Required</h1>
            <p className="text-gray-600">Please log in to access your guest portal</p>
          </div>
          <Login />
        </div>
      </div>
    );
  }

  // Redirect non-guests to admin portal
  if (user.role !== 'guest') {
    console.log('GuestContent - Non-guest user, redirecting to admin');
    window.location.href = '/admin/dashboard';
    return null;
  }
  
  console.log('GuestContent - Guest user, rendering guest content');

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-gray-50">
        <GuestSidebar isOpen={true} onClose={() => {}} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}


function App() {
  return (
    <AuthProvider>
      <BookingProvider>
        <HotelProvider>
          <Router>
            <Routes>
              <Route path="/" element={<GuestLanding />} />
              <Route path="/landing" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/booking-confirmation" element={<BookingConfirmation />} />
              <Route path="/admin" element={<AdminContent />}>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="rooms" element={<Rooms />} />
                <Route path="bookings" element={<Bookings />} />
                <Route path="guests" element={<Guests />} />
                <Route path="staff" element={<Staff />} />
                <Route path="reports" element={<Reports />} />
                <Route path="settings" element={<Settings />} />
              </Route>
              <Route path="/guest" element={<GuestContent />}>
                <Route index element={<Navigate to="/guest/menu" replace />} />
                <Route path="menu" element={<GuestMenu />} />
                <Route path="rooms" element={<RoomBooking />} />
                <Route path="bookings" element={<GuestBookings />} />
                <Route path="booking-confirmation" element={<BookingConfirmation />} />
              </Route>
              {/* Catch-all route for 404 pages */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </HotelProvider>
      </BookingProvider>
    </AuthProvider>
  );
}

export default App;