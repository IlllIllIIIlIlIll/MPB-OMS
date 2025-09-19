import express from 'express';
import { body, validationResult } from 'express-validator';
import { createClient } from 'redis';
import { yoloService } from '../services/yoloService';
import { firestoreService, BusData, OccupancyData } from '../services/firestoreService';

const router = express.Router();
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

// Connect to Redis
redisClient.connect().catch(console.error);

// Function to get dynamic occupancy using YOLO service
async function getDynamicOccupancy(): Promise<number> {
  try {
    const yoloData = await yoloService.getCurrentOccupancy();
    if (yoloData && yoloData.status === 'active') {
      console.log(`🎯 Using YOLO occupancy: ${yoloData.current_inside} people`);
      return yoloData.current_inside;
    } else {
      console.log(`⚠️ YOLO service inactive, using fallback occupancy`);
      return yoloService.getFallbackOccupancy();
    }
  } catch (error) {
    console.log(`❌ Error getting YOLO occupancy, using fallback: ${error}`);
    return yoloService.getFallbackOccupancy();
  }
}

// Initialize dummy bus data in Firestore
async function initializeDummyData() {
  try {
    const dynamicOccupancy = await getDynamicOccupancy();
    
    const dummyBuses: Omit<BusData, 'createdAt' | 'updatedAt'>[] = [
      {
        busId: 'DMR-727',
        busCode: 'DMR-727',
        routeId: '2',
        routeName: '2',
        direction: 'Pulo Gadung',
        platform: 'A',
        capacity: 40,
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
        deviceId: 'device_mys_17168',
        providerName: 'TransJakarta',
        category: 'Regular'
      }
    ];

    // Create buses in Firestore
    for (const bus of dummyBuses) {
      await firestoreService.createBus(bus);
    }

    // Create occupancy data
    const occupancyData: Omit<OccupancyData, 'createdAt'>[] = [
      {
        busId: 'DMR-727',
        occupancy: Math.min(32 + dynamicOccupancy, 40),
        capacity: 40,
        inCount: 23,
        outCount: 16,
        estimasi: '1 mnt',
        deviceId: 'device_dmr_727',
        routeId: '2',
        routeName: '2',
        direction: 'Pulo Gadung',
        platform: 'A',
        timestamp: new Date()
      },
      {
        busId: 'MYS-19222',
        occupancy: Math.min(25 + Math.floor(dynamicOccupancy * 0.8), 40),
        capacity: 40,
        inCount: 18,
        outCount: 12,
        estimasi: '1 mnt',
        deviceId: 'device_mys_19222',
        routeId: '7F',
        routeName: '7F',
        direction: 'Jakarta Kota',
        platform: 'A',
        timestamp: new Date()
      },
      {
        busId: 'DMR-710',
        occupancy: Math.min(30 + Math.floor(dynamicOccupancy * 0.6), 40),
        capacity: 40,
        inCount: 21,
        outCount: 14,
        estimasi: '2 mnt',
        deviceId: 'device_dmr_710',
        routeId: '2',
        routeName: '2',
        direction: 'Pulo Gadung',
        platform: 'C',
        timestamp: new Date()
      },
      {
        busId: 'DMR-240133',
        occupancy: Math.min(15 + Math.floor(dynamicOccupancy * 0.4), 40),
        capacity: 40,
        inCount: 12,
        outCount: 8,
        estimasi: '3 mnt',
        deviceId: 'device_dmr_240133',
        routeId: '2A',
        routeName: '2A',
        direction: 'Senayan',
        platform: 'B',
        timestamp: new Date()
      },
      {
        busId: 'MYS-17168',
        occupancy: Math.min(2 + Math.floor(dynamicOccupancy * 0.3), 40),
        capacity: 40,
        inCount: 3,
        outCount: 2,
        estimasi: '3 mnt',
        deviceId: 'device_mys_17168',
        routeId: '7F',
        routeName: '7F',
        direction: 'Jakarta Kota',
        platform: 'A',
        timestamp: new Date()
      }
    ];

    // Create occupancy data in Firestore
    for (const occupancy of occupancyData) {
      await firestoreService.createOccupancy(occupancy);
    }

    console.log('✅ Dummy data initialized in Firestore');
  } catch (error) {
    console.error('❌ Error initializing dummy data:', error);
  }
}

// Get current occupancy for all active buses (MUST BE BEFORE /:busId)
router.get('/now', async (req: express.Request, res: express.Response) => {
  console.log('=== API ENDPOINT HIT: /api/occupancy/now (Firestore) ===');
  
  try {
    // Get buses with occupancy from Firestore
    const busesWithOccupancy = await firestoreService.getBusesWithOccupancy();
    
    if (busesWithOccupancy.length === 0) {
      console.log('📋 No data in Firestore, initializing dummy data...');
      await initializeDummyData();
      const updatedData = await firestoreService.getBusesWithOccupancy();
      return res.json(updatedData);
    }

    // Format data for API response
    const formattedData = busesWithOccupancy.map(bus => ({
      busId: bus.busId,
      busCode: bus.busCode,
      routeId: bus.routeId,
      routeName: bus.routeName,
      direction: bus.direction,
      platform: bus.platform,
      capacity: bus.capacity,
      occupancy: bus.occupancy?.occupancy || 0,
      estimasi: bus.occupancy?.estimasi || '-- mnt',
      inCount: bus.occupancy?.inCount || 0,
      outCount: bus.occupancy?.outCount || 0,
      updatedAt: bus.occupancy?.timestamp?.toISOString() || new Date().toISOString(),
      deviceId: bus.deviceId,
      providerName: bus.providerName,
      category: bus.category
    }));

    console.log('🎯 RETURNING FIRESTORE DATA:', JSON.stringify(formattedData, null, 2));
    return res.json(formattedData);
  } catch (error) {
    console.error('❌ Error getting Firestore data:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Debug endpoint to verify server is running our code (MUST BE BEFORE /:busId)
router.get('/debug', (req: express.Request, res: express.Response) => {
  console.log('DEBUG ENDPOINT HIT - SERVER IS RUNNING FIRESTORE CODE');
  return res.json({ 
    message: 'Debug endpoint working with Firestore', 
    timestamp: new Date().toISOString(),
    codeVersion: 'FIRESTORE_VERSION' 
  });
});

// Get current occupancy for a specific bus (MUST BE LAST)
router.get('/:busId', async (req: express.Request, res: express.Response) => {
  const { busId } = req.params;
  
  try {
    // Get bus data from Firestore
    const bus = await firestoreService.getBus(busId);
    const occupancy = await firestoreService.getCurrentOccupancy(busId);
    
    if (!bus) {
      return res.status(404).json({ error: 'Bus not found' });
    }

    if (!occupancy) {
      return res.status(404).json({ error: 'No occupancy data available' });
    }

    return res.json({
      busId: bus.busId,
      busCode: bus.busCode,
      routeId: bus.routeId,
      routeName: bus.routeName,
      direction: bus.direction,
      platform: bus.platform,
      occupancy: occupancy.occupancy,
      capacity: occupancy.capacity,
      estimasi: occupancy.estimasi,
      inCount: occupancy.inCount,
      outCount: occupancy.outCount,
      updatedAt: occupancy.timestamp.toISOString(),
      deviceId: occupancy.deviceId,
      providerName: bus.providerName,
      category: bus.category
    });
  } catch (error) {
    console.error('Get occupancy error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get occupancy history for a bus
router.get('/:busId/history', async (req: express.Request, res: express.Response) => {
  try {
    const { busId } = req.params;
    const limit = parseInt(req.query.limit as string) || 100;
    
    const history = await firestoreService.getOccupancyHistory(busId, limit);
    
    if (history.length === 0) {
      return res.status(404).json({ error: 'No history data found' });
    }

    return res.json({
      busId,
      history: history.map(h => ({
        timestamp: h.timestamp.toISOString(),
        occupancy: h.occupancy,
        capacity: h.capacity,
        deviceId: h.deviceId,
        routeId: h.routeId,
        routeName: h.routeName
      }))
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

    // Create or update occupancy data in Firestore
    const occupancyData: Omit<OccupancyData, 'createdAt'> = {
      busId: bus_id,
      occupancy,
      capacity,
      inCount: 0, // You might want to calculate this
      outCount: 0, // You might want to calculate this
      estimasi: estimasi || '-- mnt',
      deviceId: device_id,
      routeId: route_id,
      routeName: route_name,
      direction: direction,
      platform: platform,
      timestamp: new Date()
    };

    await firestoreService.createOccupancy(occupancyData);

    // Add to history
    await firestoreService.addOccupancyHistory({
      busId: bus_id,
      occupancy,
      capacity,
      deviceId: device_id,
      routeId: route_id,
      routeName: route_name
    });

    // Update device status
    await firestoreService.updateDevice(device_id, {
      status: 'online',
      lastPing: new Date()
    });

    // Also store in Redis for backward compatibility
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
    console.log('🔍 Fetching formatted bus data from Firestore...');
    
    const busesWithOccupancy = await firestoreService.getBusesWithOccupancy();
    
    if (busesWithOccupancy.length === 0) {
      console.log('📋 No data in Firestore, initializing dummy data...');
      await initializeDummyData();
      const updatedData = await firestoreService.getBusesWithOccupancy();
      return res.json(formatBusData(updatedData));
    }

    const formattedData = formatBusData(busesWithOccupancy);
    console.log('✅ Returning formatted Firestore data:', formattedData);
    return res.json(formattedData);
  } catch (error) {
    console.error('❌ Get formatted data error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper function to format bus data
function formatBusData(busesWithOccupancy: (BusData & { occupancy?: OccupancyData })[]) {
  return busesWithOccupancy.map(bus => {
    const occupancy = bus.occupancy;
    return {
      formatted: `Rute: ${bus.routeName} | Arah: ${bus.direction} | Peron: ${bus.platform} | Kapasitas: ${occupancy?.occupancy || 0} / ${bus.capacity} | No Bus: ${bus.busId} | Estimasi: ${occupancy?.estimasi || '-- mnt'}`,
      busId: bus.busId,
      routeName: bus.routeName,
      direction: bus.direction,
      platform: bus.platform,
      occupancy: occupancy?.occupancy || 0,
      capacity: bus.capacity,
      busNumber: bus.busId,
      estimasi: occupancy?.estimasi || '-- mnt'
    };
  });
}

// Debug endpoint to clear Firestore data
router.delete('/clear-firestore', async (req: express.Request, res: express.Response) => {
  try {
    console.log('Clearing all Firestore data...');
    
    // Note: This is a destructive operation. In production, you might want to add authentication
    // For now, we'll just return a message since clearing Firestore collections requires more complex logic
    
    return res.json({ 
      message: 'Firestore clear operation not implemented for safety. Use Firebase Console to clear data if needed.',
      warning: 'This operation would delete all data from Firestore collections'
    });
  } catch (error) {
    console.error('Error clearing Firestore data:', error);
    return res.status(500).json({ error: 'Failed to clear Firestore data' });
  }
});

// Initialize dummy data endpoint
router.post('/init-dummy-data', async (req: express.Request, res: express.Response) => {
  try {
    console.log('Initializing dummy data in Firestore...');
    await initializeDummyData();
    
    return res.json({ 
      message: 'Dummy data initialized successfully in Firestore',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error initializing dummy data:', error);
    return res.status(500).json({ error: 'Failed to initialize dummy data' });
  }
});

export default router;
