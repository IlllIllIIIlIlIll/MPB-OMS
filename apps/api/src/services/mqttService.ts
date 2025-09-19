import mqtt from 'mqtt';
import { createClient } from 'redis';

class MQTTService {
  private client: mqtt.MqttClient | null = null;
  private isConnected = false;
  private redisClient: any = null;

  async connect() {
    const mqttUrl = process.env.MQTT_URL || 'mqtt://localhost:1883';
    console.log(`🔌 Connecting to MQTT broker: ${mqttUrl}`);

    try {
      // Connect to Redis
      this.redisClient = createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379'
      });
      await this.redisClient.connect();
      console.log('✅ Connected to Redis');

      // Connect to MQTT
      this.client = mqtt.connect(mqttUrl, {
        clientId: `oms-backend-${Date.now()}`,
        clean: true,
        reconnectPeriod: 5000,
        connectTimeout: 30000
      });

      this.client.on('connect', () => {
        console.log('✅ Connected to MQTT broker');
        this.isConnected = true;
        
        // Subscribe to topics
        this.client?.subscribe('/oms/v1/occupancy');
        this.client?.subscribe('/oms/v1/device/+/status');
        this.client?.subscribe('/oms/v1/device/+/heartbeat');
        
        console.log('📡 Subscribed to /oms/v1/occupancy');
        console.log('📡 Subscribed to /oms/v1/device/+/status');
        console.log('📡 Subscribed to /oms/v1/device/+/heartbeat');
      });

      this.client.on('message', (topic: string, message: Buffer) => {
        this.handleMessage(topic, message);
      });

      this.client.on('error', (error: Error) => {
        console.error('❌ MQTT Error:', error);
        this.isConnected = false;
      });

      this.client.on('close', () => {
        console.log('🔌 MQTT connection closed');
        this.isConnected = false;
      });

    } catch (error) {
      console.error('❌ Error connecting to MQTT:', error);
    }
  }

  private async handleMessage(topic: string, message: Buffer) {
    try {
      const payload = JSON.parse(message.toString());
      console.log(`📨 Received message on ${topic}:`, payload);

      // Store in Redis Streams
      await this.redisClient.xAdd('stream:occupancy', '*', {
        topic,
        payload: JSON.stringify(payload),
        timestamp: new Date().toISOString()
      });

      // Handle different message types
      if (topic === '/oms/v1/occupancy') {
        await this.handleOccupancyMessage(payload);
      } else if (topic.startsWith('/oms/v1/device/')) {
        await this.handleDeviceMessage(topic, payload);
      }

    } catch (error) {
      console.error('❌ Error handling message:', error);
    }
  }

  private async handleOccupancyMessage(payload: any) {
    try {
      // Store occupancy data in Redis cache
      const cacheKey = `occ:now:${payload.bus_id}`;
      await this.redisClient.hSet(cacheKey, {
        occupancy: payload.occupancy,
        capacity: payload.capacity || 40,
        updated_at: new Date().toISOString(),
        device_id: payload.device_id,
        bus_id: payload.bus_id
      });

      console.log(`📊 Updated occupancy for bus ${payload.bus_id}: ${payload.occupancy}`);
    } catch (error) {
      console.error('❌ Error handling occupancy message:', error);
    }
  }

  private async handleDeviceMessage(topic: string, payload: any) {
    try {
      const deviceId = topic.split('/').pop();
      const cacheKey = `device:${deviceId}`;
      
      await this.redisClient.hSet(cacheKey, {
        status: payload.status || 'online',
        last_ping: new Date().toISOString(),
        bus_id: payload.bus_id || 'unknown'
      });

      console.log(`📱 Updated device status: ${deviceId} = ${payload.status}`);
    } catch (error) {
      console.error('❌ Error handling device message:', error);
    }
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  disconnect() {
    if (this.client) {
      this.client.end();
    }
    if (this.redisClient) {
      this.redisClient.disconnect();
    }
  }
}

const mqttService = new MQTTService();

export const startMQTTService = async () => {
  await mqttService.connect();
};

export default mqttService;
