import { Router, Request, Response } from 'express';
import { param, validationResult } from 'express-validator';
import prisma from '../lib/prisma';

const router = Router();

// Get all routes
router.get('/', async (req, res) => {
  try {
    const { isActive } = req.query;
    
    const where: any = {};
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const routes = await prisma.route.findMany({
      where,
      include: {
        buses: {
          where: { isActive: true },
          select: {
            id: true,
            busNumber: true,
            capacity: true,
            currentLat: true,
            currentLng: true
          }
        },
        stops: {
          include: {
            station: {
              select: {
                id: true,
                name: true,
                code: true,
                latitude: true,
                longitude: true
              }
            }
          },
          orderBy: { order: 'asc' }
        },
        _count: {
          select: {
            buses: true
          }
        }
      },
      orderBy: {
        routeNumber: 'asc'
      }
    });

    // Get occupancy data for each route
    const routesWithOccupancy = await Promise.all(
      routes.map(async (route) => {
        const routeBuses = await prisma.bus.findMany({
          where: { routeId: route.id, isActive: true },
          include: {
            occupancy: {
              orderBy: { timestamp: 'desc' },
              take: 1
            }
          }
        });

        const totalOccupancy = routeBuses.reduce((sum, bus) => {
          return sum + (bus.occupancy[0]?.count || 0);
        }, 0);

        const totalCapacity = routeBuses.reduce((sum, bus) => {
          return sum + bus.capacity;
        }, 0);

        const averageOccupancy = routeBuses.length > 0 ? Math.round(totalOccupancy / routeBuses.length) : 0;
        const routeOccupancyPercentage = totalCapacity > 0 ? Math.round(totalOccupancy / totalCapacity * 100) : 0;

        return {
          ...route,
          totalOccupancy,
          totalCapacity,
          averageOccupancy,
          occupancyPercentage: routeOccupancyPercentage,
          activeBuses: routeBuses.length
        };
      })
    );

    res.json({
      success: true,
      data: { routes: routesWithOccupancy }
    });
  } catch (error) {
    console.error('Get routes error:', error);
    res.status(500).json({
      error: 'Failed to fetch routes',
      message: 'An error occurred while fetching route data'
    });
  }
});

// Get route by ID
router.get('/:id', [
  param('id').notEmpty().withMessage('Route ID is required')
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

    const route = await prisma.route.findUnique({
      where: { id },
      include: {
        buses: {
          where: { isActive: true },
          include: {
            occupancy: {
              orderBy: { timestamp: 'desc' },
              take: 1
            },
            cameras: {
              where: { isActive: true },
              select: {
                id: true,
                deviceId: true,
                location: true,
                lastPing: true
              }
            }
          }
        },
        stops: {
          include: {
            station: {
              select: {
                id: true,
                name: true,
                code: true,
                address: true,
                latitude: true,
                longitude: true
              }
            }
          },
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!route) {
      return res.status(404).json({
        error: 'Route not found',
        message: 'The specified route does not exist'
      });
    }

    // Calculate route statistics
    const totalOccupancy = route.buses.reduce((sum, bus) => {
      return sum + (bus.occupancy[0]?.count || 0);
    }, 0);

    const totalCapacity = route.buses.reduce((sum, bus) => {
      return sum + bus.capacity;
    }, 0);

    const averageOccupancy = route.buses.length > 0 ? Math.round(totalOccupancy / route.buses.length) : 0;
    const routeOccupancyPercentage = totalCapacity > 0 ? Math.round(totalOccupancy / totalCapacity * 100) : 0;

    // Add occupancy data to each bus
    const busesWithOccupancy = route.buses.map(bus => ({
      ...bus,
      currentOccupancy: bus.occupancy[0]?.count || 0,
      occupancyPercentage: bus.capacity > 0 ? Math.round((bus.occupancy[0]?.count || 0) / bus.capacity * 100) : 0
    }));

    const routeWithData = {
      ...route,
      buses: busesWithOccupancy,
      totalOccupancy,
      totalCapacity,
      averageOccupancy,
      occupancyPercentage: routeOccupancyPercentage,
      activeBuses: route.buses.length
    };

    res.json({
      success: true,
      data: { route: routeWithData }
    });
  } catch (error) {
    console.error('Get route error:', error);
    res.status(500).json({
      error: 'Failed to fetch route',
      message: 'An error occurred while fetching route data'
    });
  }
});

// Get buses on a specific route
router.get('/:id/buses', [
  param('id').notEmpty().withMessage('Route ID is required')
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

    const buses = await prisma.bus.findMany({
      where: { routeId: id, isActive: true },
      include: {
        route: {
          select: {
            routeNumber: true,
            name: true
          }
        },
        occupancy: {
          orderBy: { timestamp: 'desc' },
          take: 1
        },
        cameras: {
          where: { isActive: true },
          select: {
            id: true,
            deviceId: true,
            location: true,
            lastPing: true
          }
        }
      },
      orderBy: {
        busNumber: 'asc'
      }
    });

    // Add occupancy data to each bus
    const busesWithOccupancy = buses.map(bus => ({
      ...bus,
      currentOccupancy: bus.occupancy[0]?.count || 0,
      occupancyPercentage: bus.capacity > 0 ? Math.round((bus.occupancy[0]?.count || 0) / bus.capacity * 100) : 0
    }));

    res.json({
      success: true,
      data: { buses: busesWithOccupancy }
    });
  } catch (error) {
    console.error('Get route buses error:', error);
    res.status(500).json({
      error: 'Failed to fetch route buses',
      message: 'An error occurred while fetching route bus data'
    });
  }
});

export default router; 