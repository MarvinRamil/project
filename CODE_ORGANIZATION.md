# Code Organization Guide

This document outlines the new organized structure of the hotel management application.

## 📁 Project Structure

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
├── contexts/              # React contexts (simplified)
│   ├── AuthContext.tsx    # Authentication context
│   ├── HotelContext.tsx   # Hotel data context
│   └── BookingContext.tsx # Booking context
├── pages/                 # Page components
│   ├── Dashboard.tsx      # Dashboard page
│   ├── Bookings.tsx       # Bookings management page
│   ├── Guests.tsx         # Guest management page
│   ├── Rooms.tsx          # Room management page
│   ├── Staff.tsx          # Staff management page
│   ├── Reports.tsx        # Reports and analytics page
│   └── ...
└── components/            # Reusable UI components
    ├── dashboard/         # Dashboard-specific components
    ├── layout/            # Layout components
    └── search/            # Search components
```

## 🔧 Key Improvements

### 1. **Separation of Concerns**
- **API Layer**: All data fetching and external operations are centralized in the `api/` folder
- **Business Logic**: Custom hooks contain all business logic and state management
- **UI Components**: Pages and components focus purely on presentation

### 2. **Custom Hooks for Each Page**
Each page now has its own dedicated hook that handles:
- Data fetching and caching
- State management
- Business logic
- Error handling
- Loading states

### 3. **Centralized API Management**
- All API calls are organized by domain (rooms, guests, bookings, etc.)
- Consistent error handling and response formatting
- Easy to mock for development and testing
- Simple to replace with real API endpoints

### 4. **Type Safety**
- Comprehensive TypeScript interfaces in `api/types.ts`
- Consistent typing across all layers
- Better IDE support and error catching

## 🚀 Usage Examples

### Using Custom Hooks in Pages

```typescript
// Dashboard.tsx
import { useDashboard } from '../hooks';

const Dashboard = () => {
  const { stats, rooms, bookings, loading, error } = useDashboard();
  
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return (
    <div>
      {/* Dashboard UI */}
    </div>
  );
};
```

### API Layer Usage

```typescript
// In custom hooks
import { roomsApi } from '../api';

const fetchRooms = async () => {
  const response = await roomsApi.getAllRooms();
  if (response.success) {
    setRooms(response.data);
  }
};
```

## 🔄 Migration Benefits

1. **Maintainability**: Code is organized by feature and responsibility
2. **Reusability**: Custom hooks can be reused across components
3. **Testability**: Each layer can be tested independently
4. **Scalability**: Easy to add new features following the same pattern
5. **Developer Experience**: Clear structure makes onboarding easier

## 📝 Best Practices

1. **Always use custom hooks** for data fetching and state management
2. **Keep API calls in the api layer** - never call APIs directly from components
3. **Use TypeScript interfaces** for all data structures
4. **Handle loading and error states** in every hook
5. **Follow the established naming conventions**

## 🔮 Future Enhancements

- Add caching layer (React Query/SWR)
- Implement real API integration
- Add comprehensive error boundaries
- Include unit tests for hooks and API functions
- Add data validation schemas
