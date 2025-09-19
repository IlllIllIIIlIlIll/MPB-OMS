// 🚌 TransJakarta OMS - Shared Types
// Single source of truth for all TypeScript interfaces

// ============================================================================
// CORE BUSINESS TYPES
// ============================================================================

export interface Bus {
  id: string;
  busId: string;
  busCode: string;
  routeId: string;
  routeName: string;
  direction: string;
  platform: string;
  capacity: number;
  providerName: string;
  category: 'Regular' | 'Express' | 'Premium';
  createdAt: Date;
  updatedAt: Date;
}

export interface Occupancy {
  id: string;
  busId: string;
  occupancy: number;
  capacity: number;
  inCount: number;
  outCount: number;
  estimasi: string;
  timestamp: Date;
  deviceId?: string;
  confidence?: number;
}

export interface OccupancyHistory {
  id: string;
  busId: string;
  occupancy: number;
  capacity: number;
  inCount: number;
  outCount: number;
  timestamp: Date;
  deviceId: string;
  confidence: number;
}

export interface Device {
  id: string;
  deviceId: string;
  busId: string;
  deviceType: 'camera' | 'sensor' | 'gate';
  status: 'active' | 'inactive' | 'maintenance';
  lastSeen: Date;
  firmwareVersion: string;
  location: string;
}

// ============================================================================
// API TYPES
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface HealthCheck {
  status: 'healthy' | 'unhealthy' | 'degraded';
  services: {
    database: ServiceStatus;
    redis: ServiceStatus;
    mqtt: ServiceStatus;
    ai: ServiceStatus;
  };
  uptime: number;
  timestamp: string;
}

export interface ServiceStatus {
  status: 'up' | 'down' | 'degraded';
  responseTime?: number;
  lastCheck: string;
  error?: string;
}

// ============================================================================
// AUTHENTICATION TYPES
// ============================================================================

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'operator' | 'guard' | 'viewer';
  permissions: string[];
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse extends ApiResponse<{
  user: User;
  tokens: AuthTokens;
}> {}

// ============================================================================
// REAL-TIME TYPES
// ============================================================================

export interface WebSocketMessage {
  type: 'occupancy_update' | 'device_status' | 'system_alert' | 'heartbeat';
  data: any;
  timestamp: string;
  busId?: string;
  deviceId?: string;
}

export interface OccupancyUpdate extends WebSocketMessage {
  type: 'occupancy_update';
  data: Occupancy;
}

export interface DeviceStatusUpdate extends WebSocketMessage {
  type: 'device_status';
  data: {
    deviceId: string;
    status: 'online' | 'offline' | 'error';
    lastSeen: string;
    error?: string;
  };
}

// ============================================================================
// AI & DETECTION TYPES
// ============================================================================

export interface DetectionResult {
  id: string;
  busId: string;
  timestamp: Date;
  peopleCount: number;
  confidence: number;
  boundingBoxes: BoundingBox[];
  imagePath?: string;
  processingTime: number;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  class: 'person';
}

export interface CameraConfig {
  deviceId: string;
  busId: string;
  cameraIndex: number;
  resolution: {
    width: number;
    height: number;
  };
  fps: number;
  enabled: boolean;
}

// ============================================================================
// MQTT TYPES
// ============================================================================

export interface MQTTMessage {
  topic: string;
  payload: string;
  qos: 0 | 1 | 2;
  retain: boolean;
  timestamp: string;
}

export interface OccupancyMQTTMessage {
  bus_id: string;
  bus_code: string;
  door_id: number;
  in_count: number;
  out_count: number;
  occupancy: number;
  ts_device: string;
  device_id: string;
  fw_version: string;
  sig: string;
}

// ============================================================================
// CONFIGURATION TYPES
// ============================================================================

export interface AppConfig {
  api: {
    baseUrl: string;
    timeout: number;
    retries: number;
  };
  websocket: {
    url: string;
    reconnectInterval: number;
    maxReconnectAttempts: number;
  };
  firebase: {
    projectId: string;
    apiKey: string;
    authDomain: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  };
  ai: {
    modelPath: string;
    confidenceThreshold: number;
    maxDetections: number;
  };
}

// ============================================================================
// UI TYPES
// ============================================================================

export interface BusCardProps {
  bus: Bus;
  occupancy?: Occupancy;
  isSelected?: boolean;
  onClick?: (bus: Bus) => void;
}

export interface OccupancyIndicatorProps {
  current: number;
  capacity: number;
  showPercentage?: boolean;
  colorScheme?: 'default' | 'warning' | 'danger';
}

export interface DashboardStats {
  totalBuses: number;
  activeBuses: number;
  totalOccupancy: number;
  averageOccupancy: number;
  alerts: number;
}

// ============================================================================
// ERROR TYPES
// ============================================================================

export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
  stack?: string;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type BusStatus = 'active' | 'inactive' | 'maintenance' | 'offline';
export type OccupancyLevel = 'low' | 'medium' | 'high' | 'full';
export type DeviceType = 'camera' | 'sensor' | 'gate' | 'display';
export type UserRole = 'admin' | 'operator' | 'guard' | 'viewer';
export type AlertLevel = 'info' | 'warning' | 'error' | 'critical';

// ============================================================================
// EXPORT ALL TYPES
// ============================================================================

export * from './api';
export * from './auth';
export * from './realtime';
export * from './ai';
export * from './mqtt';
export * from './config';
export * from './ui';
export * from './errors';
