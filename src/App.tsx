import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { HotelProvider } from './contexts/HotelContext';
import { BookingProvider } from './contexts/BookingContext';
import GuestLanding from './pages/GuestLanding';
import RoomBooking from './pages/RoomBooking';
import BookingConfirmation from './pages/BookingConfirmation';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Dashboard from './pages/Dashboard';
import Rooms from './pages/Rooms';
import Bookings from './pages/Bookings';
import Guests from './pages/Guests';
import Staff from './pages/Staff';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
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

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <Outlet />
        </main>
      </div>
    </div>
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
              <Route path="/rooms" element={<RoomBooking />} />
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