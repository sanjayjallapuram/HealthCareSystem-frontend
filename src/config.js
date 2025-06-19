const config = {
  // API Configuration
  API_BASE_URL:process.env.REACT_APP_API_URL,
  apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:8080',
  videoCallUrl: process.env.REACT_APP_VIDEO_CALL_URL || 'http://localhost:3000',
  environment: process.env.REACT_APP_ENVIRONMENT || 'development',
  
  // WebSocket Configuration
  wsUrl: process.env.REACT_APP_WS_URL || 'ws://localhost:8080/ws',
  
  // Feature Flags
  enableVideoCalls: process.env.REACT_APP_ENABLE_VIDEO_CALLS === 'true',
  enableNotifications: process.env.REACT_APP_ENABLE_NOTIFICATIONS === 'true',
  
  // Timeouts
  apiTimeout: parseInt(process.env.REACT_APP_API_TIMEOUT) || 5000,
  wsReconnectInterval: parseInt(process.env.REACT_APP_WS_RECONNECT_INTERVAL) || 3000,
  
  // Pagination
  itemsPerPage: parseInt(process.env.REACT_APP_ITEMS_PER_PAGE) || 10,
  
  // Cache Configuration
  cacheDuration: parseInt(process.env.REACT_APP_CACHE_DURATION) || 3600000,
  
  // Error Reporting
  enableErrorReporting: process.env.REACT_APP_ENABLE_ERROR_REPORTING === 'true',

  // JWT Configuration
  jwtExpiration: parseInt(process.env.REACT_APP_JWT_EXPIRATION) || 3600000,
  jwtRefreshExpiration: parseInt(process.env.REACT_APP_JWT_REFRESH_EXPIRATION) || 86400000,

  // Video Call Configuration
  videoCallQuality: process.env.REACT_APP_VIDEO_CALL_QUALITY || 'high',
  videoCallMaxParticipants: parseInt(process.env.REACT_APP_VIDEO_CALL_MAX_PARTICIPANTS) || 2,

  // Notification Configuration
  notificationSoundEnabled: process.env.REACT_APP_NOTIFICATION_SOUND_ENABLED === 'true',
  notificationDuration: parseInt(process.env.REACT_APP_NOTIFICATION_DURATION) || 5000
};

export default config;

// API Configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

// WebSocket Configuration
export const WS_BASE_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:8080/ws';

// Feature Flags
export const FEATURES = {
  VIDEO_CALLS: process.env.REACT_APP_ENABLE_VIDEO_CALLS === 'true',
  NOTIFICATIONS: process.env.REACT_APP_ENABLE_NOTIFICATIONS === 'true'
};

// Timeouts
export const TIMEOUTS = {
  API: parseInt(process.env.REACT_APP_API_TIMEOUT) || 5000,
  WS_RECONNECT: parseInt(process.env.REACT_APP_WS_RECONNECT_INTERVAL) || 3000
};

// Pagination
export const PAGINATION = {
  ITEMS_PER_PAGE: parseInt(process.env.REACT_APP_ITEMS_PER_PAGE) || 10
};

// Cache Configuration
export const CACHE = {
  DURATION: parseInt(process.env.REACT_APP_CACHE_DURATION) || 3600000
};

// Error Reporting
export const ERROR_REPORTING = {
  ENABLED: process.env.REACT_APP_ENABLE_ERROR_REPORTING === 'true'
};

// JWT Configuration
export const JWT = {
  EXPIRATION: parseInt(process.env.REACT_APP_JWT_EXPIRATION) || 3600000,
  REFRESH_EXPIRATION: parseInt(process.env.REACT_APP_JWT_REFRESH_EXPIRATION) || 86400000
};

// Video Call Configuration
export const VIDEO_CALL = {
  QUALITY: process.env.REACT_APP_VIDEO_CALL_QUALITY || 'high',
  MAX_PARTICIPANTS: parseInt(process.env.REACT_APP_VIDEO_CALL_MAX_PARTICIPANTS) || 2
};

// Notification Configuration
export const NOTIFICATION = {
  SOUND_ENABLED: process.env.REACT_APP_NOTIFICATION_SOUND_ENABLED === 'true',
  DURATION: parseInt(process.env.REACT_APP_NOTIFICATION_DURATION) || 5000
}; 