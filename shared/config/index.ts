// 🚌 TransJakarta OMS - Shared Configuration
// Single source of truth for all configuration

import { AppConfig } from '../types';

// ============================================================================
// ENVIRONMENT CONFIGURATION
// ============================================================================

const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3001'),
  WEB_PORT: parseInt(process.env.WEB_PORT || '3002'),
  MOBILE_PORT: parseInt(process.env.MOBILE_PORT || '8081'),
  AI_PORT: parseInt(process.env.AI_PORT || '8081'),
} as const;

// ============================================================================
// API CONFIGURATION
// ============================================================================

const API_CONFIG = {
  BASE_URL: process.env.API_BASE_URL || 'http://localhost:3001',
  TIMEOUT: parseInt(process.env.API_TIMEOUT || '10000'),
  RETRIES: parseInt(process.env.API_RETRIES || '3'),
  RATE_LIMIT: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  },
} as const;

// ============================================================================
// WEBSOCKET CONFIGURATION
// ============================================================================

const WEBSOCKET_CONFIG = {
  URL: process.env.WEBSOCKET_URL || 'ws://localhost:3001',
  RECONNECT_INTERVAL: parseInt(process.env.WS_RECONNECT_INTERVAL || '5000'),
  MAX_RECONNECT_ATTEMPTS: parseInt(process.env.WS_MAX_RECONNECT || '10'),
  HEARTBEAT_INTERVAL: parseInt(process.env.WS_HEARTBEAT_INTERVAL || '30000'),
} as const;

// ============================================================================
// FIREBASE CONFIGURATION
// ============================================================================

const FIREBASE_CONFIG = {
  PROJECT_ID: process.env.FIREBASE_PROJECT_ID || '',
  API_KEY: process.env.FIREBASE_API_KEY || '',
  AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN || '',
  STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET || '',
  MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
  APP_ID: process.env.FIREBASE_APP_ID || '',
  PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY || '',
  CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL || '',
} as const;

// ============================================================================
// AI SERVICE CONFIGURATION
// ============================================================================

const AI_CONFIG = {
  MODEL_PATH: process.env.AI_MODEL_PATH || './models/yolov8n.pt',
  CONFIDENCE_THRESHOLD: parseFloat(process.env.AI_CONFIDENCE_THRESHOLD || '0.5'),
  MAX_DETECTIONS: parseInt(process.env.AI_MAX_DETECTIONS || '100'),
  CAMERA_INDEX: parseInt(process.env.CAMERA_INDEX || '0'),
  PROCESSING_INTERVAL: parseInt(process.env.AI_PROCESSING_INTERVAL || '1000'),
} as const;

// ============================================================================
// MQTT CONFIGURATION
// ============================================================================

const MQTT_CONFIG = {
  BROKER_URL: process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883',
  USERNAME: process.env.MQTT_USERNAME || '',
  PASSWORD: process.env.MQTT_PASSWORD || '',
  TOPICS: {
    OCCUPANCY: '/oms/v1/occupancy',
    DEVICE_STATUS: '/oms/v1/device/+/status',
    DEVICE_HEARTBEAT: '/oms/v1/device/+/heartbeat',
    ALERTS: '/oms/v1/alerts',
  },
  QOS: 1,
  RETAIN: false,
} as const;

// ============================================================================
// REDIS CONFIGURATION
// ============================================================================

const REDIS_CONFIG = {
  URL: process.env.REDIS_URL || 'redis://localhost:6379',
  PASSWORD: process.env.REDIS_PASSWORD || '',
  DB: parseInt(process.env.REDIS_DB || '0'),
  KEY_PREFIX: 'tj_oms:',
  TTL: {
    OCCUPANCY: 300, // 5 minutes
    DEVICE_STATUS: 60, // 1 minute
    CACHE: 3600, // 1 hour
  },
} as const;

// ============================================================================
// CORS CONFIGURATION
// ============================================================================

const CORS_CONFIG = {
  ORIGINS: [
    'http://localhost:3002',
    'http://localhost:8081',
    'http://127.0.0.1:3002',
    'http://127.0.0.1:8081',
    'http://127.0.0.1:5000',
    'http://localhost:5000',
    process.env.CORS_ORIGIN || 'http://192.168.1.21:3002',
  ],
  CREDENTIALS: true,
  OPTIONS_SUCCESS_STATUS: 200,
} as const;

// ============================================================================
// LOGGING CONFIGURATION
// ============================================================================

const LOG_CONFIG = {
  LEVEL: process.env.LOG_LEVEL || 'info',
  FORMAT: process.env.LOG_FORMAT || 'combined',
  FILE: process.env.LOG_FILE || './logs/app.log',
  MAX_SIZE: process.env.LOG_MAX_SIZE || '10m',
  MAX_FILES: process.env.LOG_MAX_FILES || '5',
} as const;

// ============================================================================
// BUSINESS RULES CONFIGURATION
// ============================================================================

const BUSINESS_CONFIG = {
  OCCUPANCY_LEVELS: {
    LOW: 0.3, // 30% capacity
    MEDIUM: 0.6, // 60% capacity
    HIGH: 0.8, // 80% capacity
    FULL: 0.95, // 95% capacity
  },
  ALERT_THRESHOLDS: {
    HIGH_OCCUPANCY: 0.8,
    DEVICE_OFFLINE: 300, // 5 minutes
    API_ERROR_RATE: 0.1, // 10%
  },
  REFRESH_INTERVALS: {
    OCCUPANCY: 5000, // 5 seconds
    DEVICE_STATUS: 30000, // 30 seconds
    HEALTH_CHECK: 60000, // 1 minute
  },
} as const;

// ============================================================================
// COMPLETE APP CONFIGURATION
// ============================================================================

export const APP_CONFIG: AppConfig = {
  api: {
    baseUrl: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
    retries: API_CONFIG.RETRIES,
  },
  websocket: {
    url: WEBSOCKET_CONFIG.URL,
    reconnectInterval: WEBSOCKET_CONFIG.RECONNECT_INTERVAL,
    maxReconnectAttempts: WEBSOCKET_CONFIG.MAX_RECONNECT_ATTEMPTS,
  },
  firebase: {
    projectId: FIREBASE_CONFIG.PROJECT_ID,
    apiKey: FIREBASE_CONFIG.API_KEY,
    authDomain: FIREBASE_CONFIG.AUTH_DOMAIN,
    storageBucket: FIREBASE_CONFIG.STORAGE_BUCKET,
    messagingSenderId: FIREBASE_CONFIG.MESSAGING_SENDER_ID,
    appId: FIREBASE_CONFIG.APP_ID,
  },
  ai: {
    modelPath: AI_CONFIG.MODEL_PATH,
    confidenceThreshold: AI_CONFIG.CONFIDENCE_THRESHOLD,
    maxDetections: AI_CONFIG.MAX_DETECTIONS,
  },
} as const;

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

export const validateConfig = (): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Validate required environment variables
  if (!FIREBASE_CONFIG.PROJECT_ID) {
    errors.push('FIREBASE_PROJECT_ID is required');
  }

  if (!FIREBASE_CONFIG.API_KEY) {
    errors.push('FIREBASE_API_KEY is required');
  }

  if (ENV.NODE_ENV === 'production' && !FIREBASE_CONFIG.PRIVATE_KEY) {
    errors.push('FIREBASE_PRIVATE_KEY is required for production');
  }

  // Validate port numbers
  if (ENV.PORT < 1000 || ENV.PORT > 65535) {
    errors.push('PORT must be between 1000 and 65535');
  }

  if (ENV.WEB_PORT < 1000 || ENV.WEB_PORT > 65535) {
    errors.push('WEB_PORT must be between 1000 and 65535');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

// ============================================================================
// EXPORT ALL CONFIGURATIONS
// ============================================================================

export {
  ENV,
  API_CONFIG,
  WEBSOCKET_CONFIG,
  FIREBASE_CONFIG,
  AI_CONFIG,
  MQTT_CONFIG,
  REDIS_CONFIG,
  CORS_CONFIG,
  LOG_CONFIG,
  BUSINESS_CONFIG,
};
