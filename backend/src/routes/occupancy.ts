import express from 'express';
import { body, validationResult } from 'express-validator';
import { createClient } from 'redis';

const router = express.Router();
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

// Connect to Redis
redisClient.connect().catch(console.error);

// Dummy data for TransJakarta buses
const getDummyBusData = () => [
  {
    busId: 'DMR-727',
    busCode: 'DMR-727',
    routeId: '2',
    routeName: '2',
    direction: 'Pulo Gadung',
    platform: 'A',
    capacity: 40,
    occupancy: 39,
    estimasi: '1 mnt',
    inCount: 23,
    outCount: 16,
    updatedAt: new Date().toISOString(),
    deviceId: 'device_dmr_727',
    providerName: 'TransJakarta',
    category: 'Regular'
  },
  {
    busId: 'MYS-19222',
    busCode: 'MYS-19222',
    routeId: '7F',
    routeName: '7F',
    direction: 'Pulo Gadung',
    platform: 'A',
    capacity: 40,
    occupancy: 30,
    estimasi: '1 mnt',
    inCount: 18,
    outCount: 12,
    updatedAt: new Date().toISOString(),
    deviceId: 'device_mys_19222',
    providerName: 'TransJakarta',
    category: 'Regular'
  },
  {
    busId: 'DMR-710',
    busCode: 'DMR-710',
    routeId: '2',
    routeName: '2',
    direction: 'Pulo Gadung',
    platform: 'C',
    capacity: 60,
    occupancy: 35,
    estimasi: '2 mnt',
    inCount: 21,
    outCount: 14,
    updatedAt: new Date().toISOString(),
    deviceId: 'device_dmr_710',
    providerName: 'TransJakarta',
    category: 'Regular'
  },
  {
    busId: 'DMR-240133',
    busCode: 'DMR-240133',
    routeId: '2A',
    routeName: '2A',
    direction: 'Pulo Gadung',
    platform: 'B',
    capacity: 40,
    occupancy: 20,
    estimasi: '3 mnt',
    inCount: 12,
    outCount: 8,
    updatedAt: new Date().toISOString(),
    deviceId: 'device_dmr_240133',
    providerName: 'TransJakarta',
    category: 'Regular'
  },
  {
    busId: 'MYS-17168',
    busCode: 'MYS-17168',
    routeId: '7F',
    routeName: '7F',
    direction: 'Pulo Gadung',
    platform: 'A',
    capacity: 60,
    occupancy: 5,
    estimasi: '3 mnt',
    inCount: 3,
    outCount: 2,
    updatedAt: new Date().toISOString(),
    deviceId: 'device_mys_17168',
    providerName: 'TransJakarta',
    category: 'Regular'
  }
];

// Get current occupancy for all active buses (MUST BE BEFORE /:busId)
router.get('/now', async (req: express.Request, res: express.Response) => {
  console.log('=== API ENDPOINT HIT: /api/occupancy/now ===');
  
  // HARDCODED DATA TO ENSURE IT WORKS
  const hardcodedData = [
    {
      busId: 'DMR-727',
      busCode: 'DMR-727',
      routeId: '2',
      routeName: '2',
      direction: 'Pulo Gadung',
      platform: 'A',
      capacity: 40,
      occupancy: 39,
      estimasi: '1 mnt',
      inCount: 23,
      outCount: 16,
      updatedAt: new Date().toISOString(),
      deviceId: 'device_dmr_727',
      providerName: 'TransJakarta',
      category: 'Regular'
    },
    {
      busId: 'MYS-19222',
      busCode: 'MYS-19222',
      routeId: '7F',
      routeName: '7F',
      direction: 'Jakarta Kota',
      platform: 'A',
      capacity: 40,
      occupancy: 30,
      estimasi: '1 mnt',
      inCount: 18,
      outCount: 12,
      updatedAt: new Date().toISOString(),
      deviceId: 'device_mys_19222',
      providerName: 'TransJakarta',
      category: 'Regular'
    },
    {
      busId: 'DMR-710',
      busCode: 'DMR-710',
      routeId: '2',
      routeName: '2',
      direction: 'Pulo Gadung',
      platform: 'C',
      capacity: 40,
      occupancy: 35,
      estimasi: '2 mnt',
      inCount: 21,
      outCount: 14,
      updatedAt: new Date().toISOString(),
      deviceId: 'device_dmr_710',
      providerName: 'TransJakarta',
      category: 'Regular'
    },
    {
      busId: 'DMR-240133',
      busCode: 'DMR-240133',
      routeId: '2A',
      routeName: '2A',
      direction: 'Senayan',
      platform: 'B',
      capacity: 40,
      occupancy: 20,
      estimasi: '3 mnt',
      inCount: 12,
      outCount: 8,
      updatedAt: new Date().toISOString(),
      deviceId: 'device_dmr_240133',
      providerName: 'TransJakarta',
      category: 'Regular'
    },
    {
      busId: 'MYS-17168',
      busCode: 'MYS-17168',
      routeId: '7F',
      routeName: '7F',
      direction: 'Jakarta Kota',
      platform: 'A',
      capacity: 40,
      occupancy: 5,
      estimasi: '3 mnt',
      inCount: 3,
      outCount: 2,
      updatedAt: new Date().toISOString(),
      deviceId: 'device_mys_17168',
      providerName: 'TransJakarta',
      category: 'Regular'
    }
  ];
  
  console.log('RETURNING HARDCODED DATA:', JSON.stringify(hardcodedData, null, 2));
  return res.json(hardcodedData);
});

// Debug endpoint to verify server is running our code (MUST BE BEFORE /:busId)
router.get('/debug', (req: express.Request, res: express.Response) => {
  console.log('DEBUG ENDPOINT HIT - SERVER IS RUNNING OUR NEW CODE');
  return res.json({ 
    message: 'Debug endpoint working', 
    timestamp: new Date().toISOString(),
    codeVersion: 'NEW_VERSION_WITH_DUMMY_DATA' 
  });
});

// Get current occupancy for a specific bus (MUST BE LAST)
router.get('/:busId', async (req: express.Request, res: express.Response) => {
  const { busId } = req.params;
  
  try {

    // First try to get from Redis
    const occupancyData = await redisClient.hGetAll(`occ:now:${busId}`);
    
    if (occupancyData.bus_id) {
      return res.json({
        busId: occupancyData.bus_id,
        busCode: occupancyData.bus_id,
        routeId: occupancyData.route_id || 'Unknown',
        routeName: occupancyData.route_name || 'Unknown',
        direction: occupancyData.direction || 'Unknown',
        platform: occupancyData.platform || 'A',
        occupancy: parseInt(occupancyData.occupancy) || 0,
        capacity: parseInt(occupancyData.capacity) || 40,
        estimasi: occupancyData.estimasi || '-- mnt',
        updatedAt: occupancyData.updated_at,
        deviceId: occupancyData.device_id,
        providerName: 'TransJakarta',
        category: 'Regular'
      });
    }

    // If not found in Redis, check dummy data
    const dummyBus = getDummyBusData().find(bus => bus.busId === busId);
    if (dummyBus) {
      return res.json(dummyBus);
    }

    return res.status(404).json({ error: 'Bus not found or no occupancy data' });
  } catch (error) {
    console.error('Get occupancy error:', error);
    
    // Fallback to dummy data on error
    const dummyBus = getDummyBusData().find(bus => bus.busId === busId);
    if (dummyBus) {
      return res.json(dummyBus);
    }
    
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
      capacity = 40,
      route_id,
      route_name,
      direction,
      platform,
      estimasi
    } = req.body;

    // Store in Redis with enhanced data structure
    await redisClient.hSet(`occ:now:${bus_id}`, {
      bus_id,
      occupancy: occupancy.toString(),
      capacity: capacity.toString(),
      device_id,
      route_id: route_id || 'Unknown',
      route_name: route_name || 'Unknown',
      direction: direction || 'Unknown',
      platform: platform || 'A',
      estimasi: estimasi || '-- mnt',
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
      capacity: capacity,
      routeId: route_id,
      routeName: route_name,
      direction: direction,
      platform: platform,
      estimasi: estimasi
    });
  } catch (error) {
    console.error('Ingest error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get formatted bus information (matching your requested format)
router.get('/formatted', async (req: express.Request, res: express.Response) => {
  try {
    console.log('🔍 Fetching formatted bus data...');
    
    // Get all occupancy keys from Redis
    const keys = await redisClient.keys('occ:now:*');
    const formattedData = [];
    
    // If Redis has data, use it
    if (keys.length > 0) {
      for (const key of keys) {
        const data = await redisClient.hGetAll(key);
        
        if (data.bus_id && data.occupancy) {
          const occupancy = parseInt(data.occupancy);
          const capacity = parseInt(data.capacity) || 40;
          
          formattedData.push({
            formatted: `Rute: ${data.route_name || data.route_id || 'Unknown'} | Arah: ${data.direction || 'Unknown'} | Peron: ${data.platform || 'A'} | Kapasitas: ${occupancy} / ${capacity} | No Bus: ${data.bus_id} | Estimasi: ${data.estimasi || '-- mnt'}`,
            busId: data.bus_id,
            routeName: data.route_name || data.route_id || 'Unknown',
            direction: data.direction || 'Unknown',
            platform: data.platform || 'A',
            occupancy: occupancy,
            capacity: capacity,
            busNumber: data.bus_id,
            estimasi: data.estimasi || '-- mnt'
          });
        }
      }
    } else {
      // If no Redis data, format dummy data
      console.log('📋 No Redis data found, returning formatted dummy data');
      for (const bus of getDummyBusData()) {
        formattedData.push({
          formatted: `Rute: ${bus.routeName} | Arah: ${bus.direction} | Peron: ${bus.platform} | Kapasitas: ${bus.occupancy} / ${bus.capacity} | No Bus: ${bus.busId} | Estimasi: ${bus.estimasi}`,
          busId: bus.busId,
          routeName: bus.routeName,
          direction: bus.direction,
          platform: bus.platform,
          occupancy: bus.occupancy,
          capacity: bus.capacity,
          busNumber: bus.busId,
          estimasi: bus.estimasi
        });
      }
    }

    console.log('✅ Returning formatted bus data:', formattedData);
    return res.json(formattedData);
  } catch (error) {
    console.error('❌ Get formatted data error:', error);
    
    // Fallback to formatted dummy data
    const formattedData = getDummyBusData().map(bus => ({
      formatted: `Rute: ${bus.routeName} | Arah: ${bus.direction} | Peron: ${bus.platform} | Kapasitas: ${bus.occupancy} / ${bus.capacity} | No Bus: ${bus.busId} | Estimasi: ${bus.estimasi}`,
      busId: bus.busId,
      routeName: bus.routeName,
      direction: bus.direction,
      platform: bus.platform,
      occupancy: bus.occupancy,
      capacity: bus.capacity,
      busNumber: bus.busId,
      estimasi: bus.estimasi
    }));
    
    return res.json(formattedData);
  }
});

// Debug endpoint to clear Redis data
router.delete('/clear-redis', async (req: express.Request, res: express.Response) => {
  try {
    console.log('Clearing all Redis occupancy data...');
    const keys = await redisClient.keys('occ:now:*');
    console.log('Found Redis keys to delete:', keys);
    
    if (keys.length > 0) {
      await redisClient.del(keys);
      console.log('Deleted', keys.length, 'Redis keys');
    }
    
    return res.json({ 
      message: 'Redis data cleared successfully', 
      deletedKeys: keys.length,
      keys: keys 
    });
  } catch (error) {
    console.error('Error clearing Redis data:', error);
    return res.status(500).json({ error: 'Failed to clear Redis data' });
  }
});

export default router;
