// Configuration file for different environments
export const config = {
  // Backend API URL
  BACKEND_URL: "https://voxai-umxl.onrender.com",

  // WebSocket URL (if your backend supports WebSocket)
  WEBSOCKET_URL: "wss://voxai-umxl.onrender.com/ws",

  // API endpoints
  API_ENDPOINTS: {
    GENERATE: "/api/generate", // POST endpoint for chat messages
    WEBSOCKET: "/ws", // WebSocket endpoint for real-time chat
  },

  // Development vs Production settings
  IS_DEVELOPMENT: window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1",

  // Enable debug logging in development
  DEBUG: window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1",
}

// Helper function to get full API URL
export function getApiUrl(endpoint) {
  return `${config.BACKEND_URL}${endpoint}`
}

// Helper function to get WebSocket URL
export function getWebSocketUrl() {
  return config.WEBSOCKET_URL
}

// Helper function to log debug messages
export function debugLog(...args) {
  if (config.DEBUG) {
    console.log("[DEBUG]", ...args)
  }
}
