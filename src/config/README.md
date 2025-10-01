# API Configuration

This directory contains the API configuration for the hotel management application.

## Configuration File: `api.ts`

The `api.ts` file contains all the base URLs and helper functions for API calls and image handling.

### Environment Configuration

The configuration automatically switches between development and production URLs based on the environment:

- **Development**: Uses `https://localhost:7118`
- **Production**: Uses your production URLs (update in the config file)

### How to Update for Production

1. Open `src/config/api.ts`
2. Update the production URLs in the `API_CONFIG.production` object:

```typescript
production: {
  apiBaseUrl: 'https://your-production-api.com/api',
  imageBaseUrl: 'https://your-production-api.com'
}
```

### Available Functions

- `getImageUrl(imagePath)`: Converts relative image paths to full URLs
- `getApiUrl(endpoint)`: Converts relative API endpoints to full URLs
- `API_BASE_URL`: The base API URL for the current environment
- `IMAGE_BASE_URL`: The base image URL for the current environment

### Usage Examples

```typescript
import { getImageUrl, getApiUrl, API_BASE_URL } from '../config/api';

// Get full image URL
const imageUrl = getImageUrl('uploads/room-123.jpg');
// Result: https://localhost:7118/uploads/room-123.jpg

// Get full API URL
const apiUrl = getApiUrl('Room/123');
// Result: https://localhost:7118/api/Room/123

// Use base URLs directly
const response = await fetch(`${API_BASE_URL}/Auth/login`);
```

### Environment Detection

The configuration automatically detects the environment:
- `import.meta.env.DEV` is `true` in development
- `import.meta.env.DEV` is `false` in production

### Image Handling

All images are automatically prefixed with the correct base URL:
- Development: `https://localhost:7118/`
- Production: `https://your-production-api.com/`

This ensures images work correctly in both environments without code changes.
