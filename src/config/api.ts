// API Configuration
// Change these URLs for different environments

const isDevelopment = import.meta.env.DEV;

// Base URLs for different environments
export const API_CONFIG = {
  // Development URLs
  development: {
    apiBaseUrl: 'https://backend.mrcurading.xyz',
    imageBaseUrl: 'https://backend.mrcurading.xyz'
  },
  
  // Production URLs (update these for your production environment)
  production: {
    apiBaseUrl: 'https://backend.mrcurading.xyz',
    imageBaseUrl: 'https://backend.mrcurading.xyz'
  }
};

// Get current environment configuration
const currentConfig = isDevelopment ? API_CONFIG.development : API_CONFIG.production;

// Export the URLs for use throughout the application
export const API_BASE_URL = currentConfig.apiBaseUrl;
export const IMAGE_BASE_URL = currentConfig.imageBaseUrl;

// Helper function to get full image URL
export const getImageUrl = (imagePath: string): string => {
  if (!imagePath) return '';
  
  // If the image path is already a full URL, return it as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // If the image path starts with '/', remove it to avoid double slashes
  const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
  
  // Return the full URL
  return `${IMAGE_BASE_URL}/${cleanPath}`;
};

// Helper function to get full API URL
export const getApiUrl = (endpoint: string): string => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_BASE_URL}/api/${cleanEndpoint}`;
};

// Environment info
export const ENV_INFO = {
  isDevelopment,
  isProduction: !isDevelopment,
  currentConfig
};
