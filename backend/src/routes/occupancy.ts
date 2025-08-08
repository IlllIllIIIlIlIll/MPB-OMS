import express from 'express';
import { body, validationResult } from 'express-validator';
import { createClient } from 'redis';

const router = express.Router();
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

// Connect to Redis
redisClient.connect().catch(console.error);

// Get current occupancy for all active buses
router.get('/now', async (req: express.Request, res: express.Response) => {
  try {
    console.log('🔍 Fetching occupancy data from Redis...');
    
    // Get all occupancy keys from Redis
    const keys = await redisClient.keys('occ:now:*');
    console.log('📋 Found keys:', keys);
    
    const occupancyData = [];
    
    for (const key of keys) {
      const data = await redisClient.hGetAll(key);
      console.log(`📊 Data for ${key}:`, data);
      
      if (data.bus_id && data.occupancy) {
        const occupancy = parseInt(data.occupancy);
        const capacity = parseInt(data.capacity) || 40;
        const occupancyPercentage = Math.round((occupancy / capacity) * 100);
        
        occupancyData.push({
          busId: data.bus_id,
          busCode: data.bus_id, // Use bus_id as busCode for now
          routeId: `ROUTE-${data.bus_id}`, // Generate route ID
          capacity: capacity,
          occupancy: occupancy,
          inCount: Math.floor(occupancy * 0.6), // Simulate in/out counts
          outCount: Math.floor(occupancy * 0.4),
          updatedAt: data.updated_at,
          deviceId: data.device_id,
          providerName: 'TransJakarta', // Default provider
          category: 'Regular' // Default category
        });
      }
    }

    console.log('✅ Returning occupancy data:', occupancyData);
    return res.json(occupancyData);
  } catch (error) {
    console.error('❌ Get current occupancy error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current occupancy for a specific bus
router.get('/:busId', async (req: express.Request, res: express.Response) => {
  try {
    const { busId } = req.params;

    const occupancyData = await redisClient.hGetAll(`occ:now:${busId}`);
    
    if (!occupancyData.bus_id) {
      return res.status(404).json({ error: 'Bus not found or no occupancy data' });
    }

    return res.json({
      busId: occupancyData.bus_id,
      occupancy: parseInt(occupancyData.occupancy) || 0,
      capacity: parseInt(occupancyData.capacity) || 40,
      updatedAt: occupancyData.updated_at
    });
  } catch (error) {
    console.error('Get occupancy error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get occupancy history for a bus (simplified - using Redis)
router.get('/:busId/history', async (req: express.Request, res: express.Response) => {
  try {
    const { busId } = req.params;
    
    // For now, return current occupancy as history
    const occupancyData = await redisClient.hGetAll(`occ:now:${busId}`);
    
    if (!occupancyData.bus_id) {
      return res.status(404).json({ error: 'Bus not found' });
    }

    return res.json({
      busId,
      history: [{
        timestamp: occupancyData.updated_at,
        occupancy: parseInt(occupancyData.occupancy) || 0,
        deviceId: occupancyData.device_id
      }]
    });
  } catch (error) {
    console.error('Get history error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Ingest occupancy data from edge devices
router.post('/ingest', [
  body('bus_id').notEmpty(),
  body('device_id').notEmpty(),
  body('occupancy').isInt({ min: 0 }),
  body('ts_device').isISO8601()
], async (req: express.Request, res: express.Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      bus_id,
      device_id,
      occupancy,
      capacity = 40
    } = req.body;

    // Store in Redis
    await redisClient.hSet(`occ:now:${bus_id}`, {
      bus_id,
      occupancy: occupancy.toString(),
      capacity: capacity.toString(),
      device_id,
      updated_at: new Date().toISOString()
    });

    // Store device info
    await redisClient.hSet(`device:${device_id}`, {
      device_id,
      bus_id,
      last_ping: new Date().toISOString(),
      status: 'online'
    });

    return res.status(201).json({
      message: 'Occupancy data ingested successfully',
      busId: bus_id,
      occupancy: occupancy,
      capacity: capacity
    });
  } catch (error) {
    console.error('Ingest error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
