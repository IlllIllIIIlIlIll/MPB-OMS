import { Worker, Queue } from 'bullmq';
import { createClient } from 'redis';

class AggregatorWorker {
  private worker: Worker | null = null;
  private queue: Queue | null = null;
  private redisClient: any = null;

  async start() {
    try {
      console.log('🚀 Starting stream processing...');

      // Connect to Redis
      this.redisClient = createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379'
      });
      await this.redisClient.connect();

      // Create queue
      this.queue = new Queue('occupancy-aggregation', {
        connection: {
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379')
        }
      });

      // Create worker
      this.worker = new Worker('occupancy-aggregation', async (job) => {
        await this.processOccupancyData(job.data);
      }, {
        connection: {
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379')
        }
      });

      // Set up consumer group for Redis Streams
      await this.setupStreamConsumer();

      console.log('✅ Aggregator worker started');

    } catch (error) {
      console.error('❌ Error starting aggregator worker:', error);
    }
  }

  private async setupStreamConsumer() {
    try {
      const groupName = 'occupancy-aggregator';
      const streamKey = 'stream:occupancy';
      const consumerName = `consumer-${Date.now()}`;

      // Create consumer group if it doesn't exist
      try {
        await this.redisClient.xGroupCreate(streamKey, groupName, '0', 'MKSTREAM');
        console.log('📡 Consumer group already exists');
      } catch (error: any) {
        if (error.message.includes('BUSYGROUP')) {
          console.log('📡 Consumer group already exists');
        } else {
          throw error;
        }
      }

      // Process messages from stream
      setInterval(async () => {
        try {
          const messages = await this.redisClient.xReadGroup(
            groupName,
            consumerName,
            { key: streamKey, id: '>' },
            { COUNT: 10, BLOCK: 1000 }
          );

          if (messages && messages.length > 0) {
            for (const stream of messages) {
              for (const message of stream.messages) {
                await this.processStreamMessage(message);
                // Acknowledge message
                await this.redisClient.xAck(streamKey, groupName, message.id);
              }
            }
          }
        } catch (error) {
          console.error('❌ Error processing stream messages:', error);
        }
      }, 1000);

    } catch (error) {
      console.error('❌ Error setting up stream consumer:', error);
    }
  }

  private async processStreamMessage(message: any) {
    try {
      const payload = JSON.parse(message.message.payload);
      
      if (payload.topic === '/oms/v1/occupancy') {
        const occupancyData = JSON.parse(payload.payload);
        await this.aggregateOccupancyData(occupancyData);
      }
    } catch (error) {
      console.error('❌ Error processing stream message:', error);
    }
  }

  private async processOccupancyData(data: any) {
    try {
      // Aggregate occupancy data
      const { bus_id, occupancy, capacity } = data;
      
      // Update aggregated data in Redis
      const aggregatedKey = `agg:${bus_id}`;
      await this.redisClient.hSet(aggregatedKey, {
        bus_id,
        occupancy,
        capacity: capacity || 40,
        aggregated_at: new Date().toISOString(),
        count: '1'
      });

      console.log(`📊 Aggregated occupancy for ${bus_id}: ${occupancy}`);
    } catch (error) {
      console.error('❌ Error processing occupancy data:', error);
    }
  }

  private async aggregateOccupancyData(data: any) {
    try {
      const { bus_id, occupancy, capacity } = data;
      
      // Update aggregated data in Redis
      const aggregatedKey = `agg:${bus_id}`;
      await this.redisClient.hSet(aggregatedKey, {
        bus_id,
        occupancy,
        capacity: capacity || 40,
        aggregated_at: new Date().toISOString(),
        count: '1'
      });

      console.log(`📊 Aggregated occupancy for ${bus_id}: ${occupancy}`);
    } catch (error) {
      console.error('❌ Error aggregating occupancy data:', error);
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
    console.log('🛑 Aggregator worker stopped');
  }
}

const aggregatorWorker = new AggregatorWorker();

export const startAggregatorWorker = async () => {
  await aggregatorWorker.start();
};

export default aggregatorWorker;
