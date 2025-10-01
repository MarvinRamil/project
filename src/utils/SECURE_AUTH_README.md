# Secure Authentication Implementation

This document explains the secure token management system implemented in the hotel management application.

## Security Principles

### 1. Access Token Storage
- **Location**: In-memory only (JavaScript variables)
- **Lifetime**: Short-lived (5-15 minutes)
- **Security**: Not accessible via XSS attacks
- **Auto-cleanup**: Automatically cleared when expired

### 2. Refresh Token Storage
- **Location**: HttpOnly cookies
- **Lifetime**: Long-lived (7 days)
- **Security**: Not accessible via JavaScript (HttpOnly flag)
- **CSRF Protection**: SameSite cookie attribute

## Implementation Details

### Token Manager (`src/utils/tokenManager.ts`)
The `SecureTokenManager` class handles:
- In-memory access token storage
- Automatic token expiry management
- Token refresh coordination
- Authorization header generation

Key methods:
- `setAccessToken(token, expiresIn)`: Store access token in memory
- `getAccessToken()`: Retrieve valid access token
- `refreshAccessToken(endpoint)`: Refresh using HttpOnly cookie
- `getAuthHeader(endpoint)`: Get Bearer token for API requests

### HTTP Client (`src/utils/httpClient.ts`)
The `HttpClient` class provides:
- Automatic authorization header injection
- Token refresh on 401 responses
- Request retry after successful refresh
- Credential inclusion for cookie-based auth

### Authentication Hook (`src/hooks/useTokenRefresh.ts`)
The `useTokenRefresh` hook manages:
- Automatic token refresh before expiry
- Multi-tab synchronization
- Focus-based token validation
- Authentication state management

## Backend Requirements

### Login Endpoint (`/Auth/login`)
**Request:**
```json
{
  "username": "user@example.com",
  "password": "password"
}
```

**Response:**
```json
{
  "token": "access_token_here",
  "expiresIn": 600,
  "user": { ... }
}
```

**Cookie Setting:**
The backend must set a refresh token cookie:
```
Set-Cookie: refreshToken=refresh_token_value; HttpOnly; Secure; SameSite=Strict; Max-Age=604800
```

### Refresh Endpoint (`/Auth/refresh`)
**Request:** No body required (uses HttpOnly cookie)

**Response:**
```json
{
  "accessToken": "new_access_token",
  "expiresIn": 600
}
```

### Logout Endpoint (`/Auth/logout`)
**Request:** No body required

**Response:** Success status

**Cookie Clearing:**
The backend must clear the refresh token cookie:
```
Set-Cookie: refreshToken=; HttpOnly; Secure; SameSite=Strict; Max-Age=0
```

## Security Benefits

### XSS Protection
- Access tokens are never stored in localStorage/sessionStorage
- Refresh tokens are in HttpOnly cookies (not accessible via JavaScript)
- Even if XSS occurs, tokens cannot be stolen

### CSRF Protection
- SameSite cookie attribute prevents cross-site requests
- Refresh tokens are only sent with same-site requests

### Token Rotation
- Short-lived access tokens minimize exposure window
- Automatic refresh reduces user friction
- Failed refresh attempts clear all tokens

### Multi-Tab Support
- Token state synchronized across browser tabs
- Logout in one tab affects all tabs
- Focus-based token validation

## Usage Examples

### Making Authenticated API Calls
```typescript
import { httpClient } from '../utils/httpClient';

// Automatic token handling
const data = await httpClient.get('/api/bookings');
const result = await httpClient.post('/api/bookings', bookingData);
```

### Manual Token Refresh
```typescript
import { useTokenRefresh } from '../hooks/useTokenRefresh';

const { refreshToken, isAuthenticated } = useTokenRefresh();

// Refresh token manually
const success = await refreshToken();
```

### Authentication State
```typescript
import { useAuth } from '../hooks/useAuth';

const { user, login, logout } = useAuth();

// Login
const result = await login('user@example.com', 'password');

// Logout (clears all tokens)
await logout();
```

## Migration Notes

### Removed localStorage Usage
- `localStorage.getItem('authToken')` → `tokenManager.getAccessToken()`
- `localStorage.setItem('authToken', token)` → `tokenManager.setAccessToken(token)`
- `localStorage.removeItem('authToken')` → `tokenManager.clearAllTokens()`

### Updated API Calls
- All fetch requests now use `credentials: 'include'`
- Authorization headers are automatically managed
- 401 responses trigger automatic token refresh

### Backend Integration
- Ensure refresh token endpoint exists
- Implement proper cookie setting/clearing
- Handle CORS with credentials

## Testing

### Token Expiry Testing
```typescript
// Set short expiry for testing
tokenManager.setAccessToken('test-token', 5); // 5 seconds

// Wait for expiry
setTimeout(() => {
  console.log(tokenManager.getAccessToken()); // null
}, 6000);
```

### Refresh Token Testing
```typescript
// Simulate expired token
tokenManager.clearAccessToken();

// Attempt API call (should trigger refresh)
const data = await httpClient.get('/api/protected');
```

## Security Checklist

- [x] Access tokens stored in memory only
- [x] Refresh tokens in HttpOnly cookies
- [x] No localStorage/sessionStorage for tokens
- [x] Automatic token refresh
- [x] CSRF protection via SameSite cookies
- [x] Multi-tab synchronization
- [x] Proper token cleanup on logout
- [x] Request retry after token refresh
- [x] Focus-based token validation
