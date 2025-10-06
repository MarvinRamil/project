# 🏨 Curading's Hotel Management System

A modern, full-featured hotel management system built with React, TypeScript, and Tailwind CSS. This application provides both administrative and guest-facing interfaces for managing hotel operations, bookings, and guest services.

## ✨ Features

### 🎯 Admin Dashboard
- **Real-time Dashboard** - Overview of hotel operations with key metrics
- **Room Management** - Add, edit, and manage room inventory with images
- **Booking Management** - Handle reservations, check-ins, check-outs, and cancellations
- **Guest Management** - Comprehensive guest profiles and history
- **Staff Management** - Employee management and role assignments
- **Reports & Analytics** - Revenue tracking and operational insights
- **Maintenance Scheduling** - Room maintenance and availability tracking

### 👥 Guest Portal
- **Room Discovery** - Browse and search available rooms with filters
- **Online Booking** - Complete booking process with OTP verification
- **Booking Management** - View and manage personal reservations
- **Guest Dashboard** - Personalized guest experience
- **Profile Management** - Update personal information and preferences

### 🔐 Authentication & Security
- **Role-based Access Control** - Separate admin and guest interfaces
- **JWT Token Authentication** - Secure login and session management
- **OTP Verification** - Email-based booking confirmation
- **Protected Routes** - Secure access to different user roles

## 🚀 Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM v7
- **Icons**: Lucide React
- **Charts**: Recharts
- **Date Handling**: date-fns
- **Backend Integration**: RESTful API with JWT authentication

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd hotelManagementUI3/project
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API endpoints**
   Edit `src/config/api.ts` to set your backend API URLs:
   ```typescript
   export const API_CONFIG = {
     development: {
       apiBaseUrl: 'https://your-backend-api.com',
       imageBaseUrl: 'https://your-backend-api.com'
     },
     production: {
       apiBaseUrl: 'https://your-production-api.com',
       imageBaseUrl: 'https://your-production-api.com'
     }
   };
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## 🏗️ Project Structure

```
src/
├── api/                    # API layer - all external data operations
│   ├── types.ts           # TypeScript interfaces and types
│   ├── mockData.ts        # Mock data for development
│   ├── rooms.ts           # Room-related API calls
│   ├── guests.ts          # Guest-related API calls
│   ├── bookings.ts        # Booking-related API calls
│   ├── staff.ts           # Staff-related API calls
│   ├── dashboard.ts       # Dashboard data API calls
│   ├── auth.ts            # Authentication API calls
│   └── index.ts           # Centralized API exports
├── hooks/                 # Custom React hooks
│   ├── useDashboard.ts    # Dashboard data and operations
│   ├── useBookings.ts     # Booking management logic
│   ├── useGuests.ts       # Guest management logic
│   ├── useRooms.ts        # Room management logic
│   ├── useStaff.ts        # Staff management logic
│   ├── useReports.ts      # Reports and analytics logic
│   ├── useAuth.ts         # Authentication logic
│   └── index.ts           # Centralized hooks exports
├── contexts/              # React contexts
│   ├── AuthContext.tsx    # Authentication context
│   ├── HotelContext.tsx   # Hotel data context
│   ├── BookingContext.tsx # Booking context
│   └── SidebarContext.tsx # Sidebar state context
├── pages/                 # Page components
│   ├── Dashboard.tsx      # Admin dashboard
│   ├── Bookings.tsx       # Booking management
│   ├── Guests.tsx         # Guest management
│   ├── Rooms.tsx          # Room management
│   ├── Staff.tsx          # Staff management
│   ├── Reports.tsx        # Reports and analytics
│   ├── RoomBooking.tsx    # Guest room booking
│   ├── GuestBookings.tsx  # Guest booking management
│   ├── GuestMenu.tsx      # Guest portal menu
│   └── ...                # Other pages
├── components/            # Reusable UI components
│   ├── dashboard/         # Dashboard-specific components
│   ├── layout/            # Layout components (Header, Sidebar, etc.)
│   ├── booking/           # Booking-related components
│   ├── rooms/             # Room management components
│   └── staff/             # Staff management components
├── utils/                 # Utility functions
│   ├── httpClient.ts      # HTTP client configuration
│   └── tokenManager.ts    # JWT token management
└── config/                # Configuration files
    └── api.ts             # API configuration
```

## 🎨 Key Features in Detail

### Admin Features
- **Dashboard Analytics**: Real-time metrics, revenue charts, and occupancy rates
- **Room Management**: Full CRUD operations with image uploads and maintenance scheduling
- **Booking Operations**: Check-in/out, cancellations, no-show management
- **Guest Profiles**: Complete guest information and booking history
- **Staff Management**: Employee roles, permissions, and scheduling
- **Reports**: Revenue analysis, occupancy reports, and operational insights

### Guest Features
- **Room Search**: Advanced filtering by price, type, amenities, and capacity
- **Booking Process**: Date selection, guest information, and OTP verification
- **Booking History**: View all past and current reservations
- **Profile Management**: Update personal information and preferences

### Technical Features
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Type Safety**: Comprehensive TypeScript implementation
- **State Management**: React Context and custom hooks
- **Error Handling**: Comprehensive error boundaries and user feedback
- **Loading States**: Skeleton loaders and progress indicators
- **Form Validation**: Client-side validation with user-friendly error messages

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint

# Docker (if using Docker)
docker-compose up    # Start with Docker
```

## 🌐 API Integration

The application is designed to work with a RESTful backend API. Key endpoints include:

- **Authentication**: `/api/auth/login`, `/api/auth/register`
- **Rooms**: `/api/rooms`, `/api/rooms/{id}`
- **Bookings**: `/api/bookings`, `/api/bookings/{id}`
- **Guests**: `/api/guests`, `/api/guests/{id}`
- **Staff**: `/api/staff`, `/api/staff/{id}`
- **Dashboard**: `/api/dashboard/stats`

## 🔐 Authentication Flow

1. **Login/Register**: Users authenticate via email and password
2. **JWT Tokens**: Secure token-based authentication
3. **Role-based Access**: Admin and guest roles with different permissions
4. **Protected Routes**: Automatic redirection based on user role
5. **Session Management**: Automatic token refresh and logout

## 📱 Responsive Design

The application is fully responsive and optimized for:
- **Desktop**: Full-featured admin dashboard
- **Tablet**: Optimized layouts for medium screens
- **Mobile**: Touch-friendly guest interface

## 🎯 User Roles

### Admin Users
- Full access to all hotel management features
- Dashboard analytics and reporting
- Room, booking, guest, and staff management
- System settings and configuration

### Guest Users
- Room browsing and booking
- Personal booking management
- Profile and preference management
- Guest portal access only

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Environment Configuration
Set the following environment variables for production:
- `VITE_API_BASE_URL`: Your production API URL
- `VITE_IMAGE_BASE_URL`: Your production image server URL

### Docker Deployment
```bash
docker-compose up -d
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation in the `docs/` folder

## 🔮 Future Enhancements

- [ ] Real-time notifications
- [ ] Advanced reporting and analytics
- [ ] Multi-language support
- [ ] Mobile app development
- [ ] Integration with payment gateways
- [ ] Advanced room availability management
- [ ] Guest communication system
- [ ] Inventory management
- [ ] Revenue optimization tools

---

**Built with ❤️ for modern hotel management**
