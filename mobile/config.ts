// API Configuration
// This file makes it easy to update the backend URL without editing code

export const API_CONFIG = {
  // Update this URL when your ngrok URL changes
  // Or use your local IP when on the same WiFi network
  BASE_URL: 'https://kirklike-feelinglessly-roselee.ngrok-free.dev/api',

  // Alternative: Uncomment to use local network (same WiFi)
  // BASE_URL: 'https://kirklike-feelinglessly-roselee.ngrok-free.dev/api',
};

// Helper function to get the current API URL
export const getApiUrl = () => API_CONFIG.BASE_URL;
