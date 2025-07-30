import { Router, Request, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import prisma from '../lib/prisma';
import { io } from '../index';

const router = Router();

// Get all buses
router.get('/', async (req, res) => {
  try {
    const { routeId, isActive } = req.query;
    
    const where: any = {};
    if (routeId) where.routeId = routeId as string;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const buses = await prisma.bus.findMany({
      where,
      include: {
        route: {
          select: {
            id: true,
            routeNumber: true,
            name: true
          }
        },
        cameras: {
          where: { isActive: true },
          select: {
            id: true,
            deviceId: true,
            location: true,
            lastPing: true
          }
        },
        _count: {
          select: {
            occupancy: true
          }
        }
      },
      orderBy: {
        busNumber: 'asc'
      }
    });

    // Get latest occupancy for each bus
    const busesWithOccupancy = await Promise.all(
      buses.map(async (bus) => {
        const latestOccupancy = await prisma.occupancy.findFirst({
          where: { busId: bus.id },
          orderBy: { timestamp: 'desc' }
        });

        return {
          ...bus,
          currentOccupancy: latestOccupancy?.count || 0,
          occupancyPercentage: bus.capacity > 0 ? Math.round((latestOccupancy?.count || 0) / bus.capacity * 100) : 0
        };
      })
    );

    res.json({
      success: true,
      data: { buses: busesWithOccupancy }
    });
  } catch (error) {
    console.error('Get buses error:', error);
    res.status(500).json({
      error: 'Failed to fetch buses',
      message: 'An error occurred while fetching bus data'
    });
  }
});

// Get bus by ID
router.get('/:id', [
  param('id').notEmpty().withMessage('Bus ID is required')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { id } = req.params;

    const bus = await prisma.bus.findUnique({
      where: { id },
      include: {
        route: {
          select: {
            id: true,
            routeNumber: true,
            name: true,
            description: true
          }
        },
        cameras: {
          select: {
            id: true,
            deviceId: true,
            location: true,
            isActive: true,
            lastPing: true
          }
        },
        arrivals: {
          where: { isActive: true },
          include: {
            station: {
              select: {
                id: true,
                name: true,
                code: true
              }
            }
          },
          orderBy: { eta: 'asc' }
        }
      }
    });

    if (!bus) {
      return res.status(404).json({
        error: 'Bus not found',
        message: 'The specified bus does not exist'
      });
    }

    // Get latest occupancy
    const latestOccupancy = await prisma.occupancy.findFirst({
      where: { busId: id },
      orderBy: { timestamp: 'desc' }
    });

    // Get occupancy history (last 24 hours)
    const occupancyHistory = await prisma.occupancy.findMany({
      where: {
        busId: id,
        timestamp: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      },
      orderBy: { timestamp: 'asc' },
      take: 100
    });

    const busWithData = {
      ...bus,
      currentOccupancy: latestOccupancy?.count || 0,
      occupancyPercentage: bus.capacity > 0 ? Math.round((latestOccupancy?.count || 0) / bus.capacity * 100) : 0,
      occupancyHistory
    };

    res.json({
      success: true,
      data: { bus: busWithData }
    });
  } catch (error) {
    console.error('Get bus error:', error);
    res.status(500).json({
      error: 'Failed to fetch bus',
      message: 'An error occurred while fetching bus data'
    });
  }
});

// Update bus occupancy
router.put('/:id/occupancy', [
  param('id').notEmpty().withMessage('Bus ID is required'),
  body('count').isInt({ min: 0 }).withMessage('Count must be a non-negative integer'),
  body('source').isIn(['camera', 'manual', 'estimated']).withMessage('Invalid source')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { id } = req.params;
    const { count, source } = req.body;

    // Check if bus exists
    const bus = await prisma.bus.findUnique({
      where: { id },
      include: {
        route: {
          select: {
            routeNumber: true,
            name: true
          }
        }
      }
    });

    if (!bus) {
      return res.status(404).json({
        error: 'Bus not found',
        message: 'The specified bus does not exist'
      });
    }

    // Create occupancy record
    const occupancy = await prisma.occupancy.create({
      data: {
        busId: id,
        count,
        source
      }
    });

    // Calculate occupancy percentage
    const occupancyPercentage = bus.capacity > 0 ? Math.round(count / bus.capacity * 100) : 0;

    // Check for capacity alerts
    if (occupancyPercentage >= 90) {
      await prisma.alert.create({
        data: {
          type: 'CAPACITY_LIMIT',
          busId: id,
          message: `Bus ${bus.busNumber} (${bus.route.routeNumber}) is at ${occupancyPercentage}% capacity`,
          severity: occupancyPercentage >= 95 ? 'CRITICAL' : 'HIGH'
        }
      });
    }

    // Emit real-time update
    io.emit('bus:occupancy:update', {
      busId: id,
      busNumber: bus.busNumber,
      routeNumber: bus.route.routeNumber,
      count,
      occupancyPercentage,
      timestamp: occupancy.timestamp
    });

    // Emit alert if capacity is high
    if (occupancyPercentage >= 90) {
      io.emit('alert:capacity:reached', {
        busId: id,
        busNumber: bus.busNumber,
        routeNumber: bus.route.routeNumber,
        occupancyPercentage,
        message: `Bus ${bus.busNumber} is at ${occupancyPercentage}% capacity`
      });
    }

    res.json({
      success: true,
      data: {
        occupancy,
        bus: {
          id: bus.id,
          busNumber: bus.busNumber,
          routeNumber: bus.route.routeNumber,
          currentOccupancy: count,
          occupancyPercentage
        }
      }
    });
  } catch (error) {
    console.error('Update occupancy error:', error);
    res.status(500).json({
      error: 'Failed to update occupancy',
      message: 'An error occurred while updating occupancy data'
    });
  }
});

// Get bus occupancy history
router.get('/:id/history', [
  param('id').notEmpty().withMessage('Bus ID is required')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { id } = req.params;
    const { start, end, limit = '100' } = req.query;

    const where: any = { busId: id };
    
    if (start || end) {
      where.timestamp = {};
      if (start) where.timestamp.gte = new Date(start as string);
      if (end) where.timestamp.lte = new Date(end as string);
    }

    const history = await prisma.occupancy.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: parseInt(limit as string),
      include: {
        bus: {
          select: {
            busNumber: true,
            capacity: true,
            route: {
              select: {
                routeNumber: true,
                name: true
              }
            }
          }
        }
      }
    });

    // Calculate statistics
    const occupancyCounts = history.map(h => h.count);
    const avgOccupancy = occupancyCounts.length > 0 
      ? Math.round(occupancyCounts.reduce((a, b) => a + b, 0) / occupancyCounts.length)
      : 0;
    const maxOccupancy = Math.max(...occupancyCounts, 0);
    const minOccupancy = Math.min(...occupancyCounts, 0);

    res.json({
      success: true,
      data: {
        history,
        statistics: {
          average: avgOccupancy,
          maximum: maxOccupancy,
          minimum: minOccupancy,
          totalRecords: history.length
        }
      }
    });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({
      error: 'Failed to fetch history',
      message: 'An error occurred while fetching occupancy history'
    });
  }
});

// Update bus location
router.put('/:id/location', [
  param('id').notEmpty().withMessage('Bus ID is required'),
  body('latitude').isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
  body('longitude').isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { id } = req.params;
    const { latitude, longitude } = req.body;

    const bus = await prisma.bus.update({
      where: { id },
      data: {
        currentLat: latitude,
        currentLng: longitude,
        lastLocation: new Date()
      },
      include: {
        route: {
          select: {
            routeNumber: true,
            name: true
          }
        }
      }
    });

    // Emit location update
    io.emit('bus:location:update', {
      busId: id,
      busNumber: bus.busNumber,
      routeNumber: bus.route.routeNumber,
      latitude,
      longitude,
      timestamp: bus.lastLocation
    });

    res.json({
      success: true,
      data: { bus }
    });
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({
      error: 'Failed to update location',
      message: 'An error occurred while updating bus location'
    });
  }
});

export default router; 