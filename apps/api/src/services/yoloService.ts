import axios from 'axios';

export interface YoloOccupancyData {
  current_inside: number;
  total_entered: number;
  total_exited: number;
  frames_processed: number;
  timestamp: number;
  status: 'active' | 'inactive';
}

class YoloService {
  private readonly baseUrl: string;
  private readonly timeout: number;

  constructor() {
    this.baseUrl = process.env.YOLO_SERVICE_URL || 'http://localhost:8081';
    this.timeout = 5000; // 5 seconds timeout
  }

  /**
   * Fetch current occupancy count from YOLO service
   */
  async getCurrentOccupancy(): Promise<YoloOccupancyData | null> {
    try {
      console.log(`🔍 Fetching occupancy from YOLO service: ${this.baseUrl}/api/occupancy`);
      
      const response = await axios.get(`${this.baseUrl}/api/occupancy`, {
        timeout: this.timeout,
        headers: {
          'Accept': 'application/json',
        }
      });

      console.log(`✅ YOLO response:`, response.data);
      return response.data as YoloOccupancyData;
      
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNREFUSED') {
          console.log(`⚠️ YOLO service not available (ECONNREFUSED). Using fallback occupancy.`);
        } else if (error.code === 'ETIMEDOUT') {
          console.log(`⚠️ YOLO service timeout. Using fallback occupancy.`);
        } else {
          console.log(`⚠️ YOLO service error: ${error.message}. Using fallback occupancy.`);
        }
      } else {
        console.log(`⚠️ Unexpected error fetching YOLO data: ${error}. Using fallback occupancy.`);
      }
      return null;
    }
  }

  /**
   * Check if YOLO service is healthy
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseUrl}/api/health`, {
        timeout: this.timeout
      });
      
      return response.data.status === 'healthy';
    } catch (error) {
      console.log(`⚠️ YOLO service health check failed: ${error}`);
      return false;
    }
  }

  /**
   * Get fallback occupancy when YOLO service is unavailable
   */
  getFallbackOccupancy(): number {
    // Return a random-ish fallback value between 0-15 for demo purposes
    return Math.floor(Math.random() * 16);
  }
}

export const yoloService = new YoloService();

