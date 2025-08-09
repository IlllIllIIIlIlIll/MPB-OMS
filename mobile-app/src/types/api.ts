export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export interface OccupancyData {
  busId: string;
  busCode: string;
  routeId: string;
  capacity: number;
  occupancy: number;
  inCount: number;
  outCount: number;
  updatedAt: string;
  deviceId: string;
  providerName: string;
  category: string;
}

export interface ApiError {
  error: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}
