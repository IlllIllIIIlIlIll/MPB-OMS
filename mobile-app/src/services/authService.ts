import axios, { AxiosResponse } from 'axios';
import { LoginRequest, LoginResponse, ApiError } from '../types/api';

// Configure the base URL for your backend
// Environment variables are automatically loaded from .env file
const API_HOST = process.env.EXPO_PUBLIC_API_HOST || '192.168.1.21';
const API_PORT = process.env.EXPO_PUBLIC_API_PORT || '3001';
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || `http://${API_HOST}:${API_PORT}`;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response: AxiosResponse<LoginResponse> = await api.post('/api/auth/login', {
        email,
        password,
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw new Error(error.response.data.error || 'Login failed');
      }
      throw new Error('Network error. Please check your connection.');
    }
  },

  async logout(): Promise<void> {
    try {
      await api.post('/api/auth/logout');
    } catch (error) {
      // Logout should succeed even if the server request fails
      console.warn('Logout request failed, but continuing with local logout');
    }
  },

  setAuthToken(token: string) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  },

  removeAuthToken() {
    delete api.defaults.headers.common['Authorization'];
  },
};

export { api };
