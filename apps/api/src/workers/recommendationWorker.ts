import { Worker, Queue } from 'bullmq';
import { createClient } from 'redis';

class RecommendationWorker {
  private worker: Worker | null = null;
  private queue: Queue | null = null;
  private redisClient: any = null;

  async start() {
    try {
      console.log('📅 Scheduled periodic hotspot analysis');

      // Connect to Redis
      this.redisClient = createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379'
      });
      await this.redisClient.connect();

      // Create queue
      this.queue = new Queue('occupancy-recommendation', {
        connection: {
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379')
        }
      });

      // Create worker
      this.worker = new Worker('occupancy-recommendation', async (job) => {
        await this.processRecommendationRequest(job.data);
      }, {
        connection: {
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379')
        }
      });

      // Schedule periodic hotspot analysis
      setInterval(async () => {
        await this.analyzeHotspots();
      }, 60000); // Every minute

      console.log('✅ Recommendation worker started');

    } catch (error) {
      console.error('❌ Error starting recommendation worker:', error);
    }
  }

  private async processRecommendationRequest(data: any) {
    try {
      console.log('🔄 Processing recommendation request');
      
      const { origin_stop_id, dest_stop_id, user_prefs } = data;
      
      // Get current occupancy data from Redis
      const occupancyData = await this.getCurrentOccupancyData();
      
      // Generate recommendations
      const recommendations = this.generateRecommendations(occupancyData, user_prefs);
      
      // Store recommendations in Redis
      await this.storeRecommendations(recommendations);
      
      console.log('✅ Recommendations generated');
      
    } catch (error) {
      console.error('❌ Error processing recommendation request:', error);
    }
  }

  private async getCurrentOccupancyData() {
    try {
      // Get all occupancy keys from Redis
      const keys = await this.redisClient.keys('occ:now:*');
      const occupancyData = [];
      
      for (const key of keys) {
        const data = await this.redisClient.hGetAll(key);
        if (data.bus_id && data.occupancy) {
          occupancyData.push({
            bus_id: data.bus_id,
            occupancy: parseInt(data.occupancy),
            capacity: parseInt(data.capacity) || 40,
            updated_at: data.updated_at
          });
        }
      }
      
      return occupancyData;
    } catch (error) {
      console.error('❌ Error getting occupancy data:', error);
      return [];
    }
  }

  private generateRecommendations(occupancyData: any[], userPrefs: any) {
    const recommendations = [];
    
    // Sort by occupancy percentage (ascending for less crowded buses)
    const sortedBuses = occupancyData.sort((a, b) => {
      const aPercent = (a.occupancy / a.capacity) * 100;
      const bPercent = (b.occupancy / b.capacity) * 100;
      return aPercent - bPercent;
    });
    
    // Take top 3 recommendations
    for (let i = 0; i < Math.min(3, sortedBuses.length); i++) {
      const bus = sortedBuses[i];
      const occupancyPercent = Math.round((bus.occupancy / bus.capacity) * 100);
      
      recommendations.push({
        bus_id: bus.bus_id,
        occupancy: bus.occupancy,
        capacity: bus.capacity,
        occupancy_percent: occupancyPercent,
        status: occupancyPercent < 70 ? 'GOOD' : occupancyPercent < 90 ? 'MODERATE' : 'CROWDED',
        eta: 'PT5M', // Placeholder
        recommendation_score: 100 - occupancyPercent
      });
    }
    
    return recommendations;
  }

  private async storeRecommendations(recommendations: any[]) {
    try {
      const recommendationKey = 'recommendations:latest';
      await this.redisClient.set(recommendationKey, JSON.stringify({
        recommendations,
        generated_at: new Date().toISOString()
      }));
      
      console.log(`💾 Stored ${recommendations.length} recommendations`);
    } catch (error) {
      console.error('❌ Error storing recommendations:', error);
    }
  }

  private async analyzeHotspots() {
    try {
      const occupancyData = await this.getCurrentOccupancyData();
      const hotspots = [];
      
      // Find buses with high occupancy (>80%)
      for (const bus of occupancyData) {
        const occupancyPercent = (bus.occupancy / bus.capacity) * 100;
        if (occupancyPercent > 80) {
          hotspots.push({
            bus_id: bus.bus_id,
            occupancy_percent: Math.round(occupancyPercent),
            occupancy: bus.occupancy,
            capacity: bus.capacity,
            timestamp: new Date().toISOString()
          });
        }
      }
      
      if (hotspots.length > 0) {
        // Store hotspots in Redis
        await this.redisClient.set('hotspots:latest', JSON.stringify({
          hotspots,
          generated_at: new Date().toISOString()
        }));
        
        console.log(`🔥 Found ${hotspots.length} hotspots`);
      }
      
    } catch (error) {
      console.error('❌ Error analyzing hotspots:', error);
    }
  }

  async stop() {
    if (this.worker) {
      await this.worker.close();
    }
    if (this.queue) {
      await this.queue.close();
    }
    if (this.redisClient) {
      await this.redisClient.disconnect();
    }
    console.log('🛑 Recommendation worker stopped');
  }
}

const recommendationWorker = new RecommendationWorker();

export const startRecommendationWorker = async () => {
  await recommendationWorker.start();
};

export default recommendationWorker;
