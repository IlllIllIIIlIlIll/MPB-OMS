import { api } from './authService';
import { OccupancyData } from '../types/api';

export const occupancyService = {
  async getCurrentOccupancy(): Promise<OccupancyData[]> {
    try {
      const response = await api.get('/api/occupancy/now');
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw new Error(error.response.data.error || 'Failed to fetch occupancy data');
      }
      throw new Error('Network error. Please check your connection.');
    }
  },

  async getBusOccupancy(busId: string): Promise<OccupancyData> {
    try {
      const response = await api.get(`/api/occupancy/${busId}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw new Error(error.response.data.error || 'Failed to fetch bus data');
      }
      throw new Error('Network error. Please check your connection.');
    }
  },
};
