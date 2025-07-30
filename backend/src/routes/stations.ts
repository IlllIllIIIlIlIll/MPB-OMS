import { Router, Request, Response } from 'express';
import { param, validationResult } from 'express-validator';
import prisma from '../lib/prisma';

const router = Router();

// Get all stations
router.get('/', async (req, res) => {
  try {
    const { isActive } = req.query;
    
    const where: any = {};
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const stations = await prisma.station.findMany({
      where,
      include: {
        routeStops: {
          include: {
            route: {
              select: {
                id: true,
                routeNumber: true,
                name: true
              }
            }
          }
        },
        arrivals: {
          where: { isActive: true },
          include: {
            bus: {
              select: {
                id: true,
                busNumber: true,
                route: {
                  select: {
                    routeNumber: true,
                    name: true
                  }
                }
              }
            }
          },
          orderBy: { eta: 'asc' }
        },
        _count: {
          select: {
            routeStops: true,
            arrivals: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    res.json({
      success: true,
      data: { stations }
    });
  } catch (error) {
    console.error('Get stations error:', error);
    res.status(500).json({
      error: 'Failed to fetch stations',
      message: 'An error occurred while fetching station data'
    });
  }
});

// Get station by ID
router.get('/:id', [
  param('id').notEmpty().withMessage('Station ID is required')
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

    const station = await prisma.station.findUnique({
      where: { id },
      include: {
        routeStops: {
          include: {
            route: {
              select: {
                id: true,
                routeNumber: true,
                name: true,
                description: true
              }
            }
          },
          orderBy: { order: 'asc' }
        },
        arrivals: {
          where: { isActive: true },
          include: {
            bus: {
              select: {
                id: true,
                busNumber: true,
                capacity: true,
                route: {
                  select: {
                    routeNumber: true,
                    name: true
                  }
                },
                occupancy: {
                  orderBy: { timestamp: 'desc' },
                  take: 1
                }
              }
            }
          },
          orderBy: { eta: 'asc' }
        }
      }
    });

    if (!station) {
      return res.status(404).json({
        error: 'Station not found',
        message: 'The specified station does not exist'
      });
    }

    // Add occupancy data to arriving buses
    const arrivalsWithOccupancy = station.arrivals.map(arrival => ({
      ...arrival,
      bus: {
        ...arrival.bus,
        currentOccupancy: arrival.bus.occupancy[0]?.count || 0,
        occupancyPercentage: arrival.bus.capacity > 0 
          ? Math.round((arrival.bus.occupancy[0]?.count || 0) / arrival.bus.capacity * 100) 
          : 0
      }
    }));

    const stationWithData = {
      ...station,
      arrivals: arrivalsWithOccupancy
    };

    res.json({
      success: true,
      data: { station: stationWithData }
    });
  } catch (error) {
    console.error('Get station error:', error);
    res.status(500).json({
      error: 'Failed to fetch station',
      message: 'An error occurred while fetching station data'
    });
  }
});

export default router; 