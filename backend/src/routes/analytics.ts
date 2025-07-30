import { Router } from 'express';
import prisma from '../lib/prisma';

const router = Router();

// Get system overview
router.get('/overview', async (req, res) => {
  try {
    const { start, end } = req.query;
    
    const where: any = {};
    if (start || end) {
      where.timestamp = {};
      if (start) where.timestamp.gte = new Date(start as string);
      if (end) where.timestamp.lte = new Date(end as string);
    }

    // Get total counts
    const totalBuses = await prisma.bus.count({ where: { isActive: true } });
    const totalRoutes = await prisma.route.count({ where: { isActive: true } });
    const totalStations = await prisma.station.count({ where: { isActive: true } });
    const totalCameras = await prisma.camera.count({ where: { isActive: true } });

    // Get current occupancy data
    const allBuses = await prisma.bus.findMany({
      where: { isActive: true },
      include: {
        occupancy: {
          orderBy: { timestamp: 'desc' },
          take: 1
        },
        route: {
          select: {
            routeNumber: true,
            name: true
          }
        }
      }
    });

    const totalOccupancy = allBuses.reduce((sum, bus) => {
      return sum + (bus.occupancy[0]?.count || 0);
    }, 0);

    const totalCapacity = allBuses.reduce((sum, bus) => {
      return sum + bus.capacity;
    }, 0);

    const averageOccupancy = allBuses.length > 0 ? Math.round(totalOccupancy / allBuses.length) : 0;
    const systemOccupancyPercentage = totalCapacity > 0 ? Math.round(totalOccupancy / totalCapacity * 100) : 0;

    // Get busiest routes
    const routeStats = await prisma.route.findMany({
      where: { isActive: true },
      include: {
        buses: {
          where: { isActive: true },
          include: {
            occupancy: {
              orderBy: { timestamp: 'desc' },
              take: 1
            }
          }
        }
      }
    });

    const routesWithStats = routeStats.map(route => {
      const routeOccupancy = route.buses.reduce((sum, bus) => {
        return sum + (bus.occupancy[0]?.count || 0);
      }, 0);
      
      const routeCapacity = route.buses.reduce((sum, bus) => {
        return sum + bus.capacity;
      }, 0);

      return {
        id: route.id,
        routeNumber: route.routeNumber,
        name: route.name,
        totalOccupancy: routeOccupancy,
        totalCapacity: routeCapacity,
        occupancyPercentage: routeCapacity > 0 ? Math.round(routeOccupancy / routeCapacity * 100) : 0,
        activeBuses: route.buses.length
      };
    });

    const busiestRoutes = routesWithStats
      .sort((a, b) => b.totalOccupancy - a.totalOccupancy)
      .slice(0, 5);

    // Get recent alerts
    const recentAlerts = await prisma.alert.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    // Get system health
    const offlineCameras = await prisma.camera.count({
      where: {
        isActive: true,
        lastPing: {
          lt: new Date(Date.now() - 5 * 60 * 1000) // 5 minutes ago
        }
      }
    });

    const onlineCameras = totalCameras - offlineCameras;
    const cameraHealthPercentage = totalCameras > 0 ? Math.round((onlineCameras / totalCameras) * 100) : 0;

    res.json({
      success: true,
      data: {
        overview: {
          totalBuses,
          totalRoutes,
          totalStations,
          totalCameras,
          totalOccupancy,
          totalCapacity,
          averageOccupancy,
          systemOccupancyPercentage,
          cameraHealthPercentage
        },
        busiestRoutes,
        recentAlerts,
        systemHealth: {
          onlineCameras,
          offlineCameras,
          cameraHealthPercentage
        }
      }
    });
  } catch (error) {
    console.error('Get overview error:', error);
    res.status(500).json({
      error: 'Failed to fetch overview',
      message: 'An error occurred while fetching system overview'
    });
  }
});

// Get route analytics
router.get('/routes', async (req, res) => {
  try {
    const { start, end } = req.query;
    
    const where: any = {};
    if (start || end) {
      where.timestamp = {};
      if (start) where.timestamp.gte = new Date(start as string);
      if (end) where.timestamp.lte = new Date(end as string);
    }

    const routes = await prisma.route.findMany({
      where: { isActive: true },
      include: {
        buses: {
          where: { isActive: true },
          include: {
            occupancy: {
              where,
              orderBy: { timestamp: 'desc' }
            }
          }
        }
      }
    });

    const routeAnalytics = routes.map(route => {
      const routeOccupancy = route.buses.reduce((sum, bus) => {
        return sum + (bus.occupancy[0]?.count || 0);
      }, 0);
      
      const routeCapacity = route.buses.reduce((sum, bus) => {
        return sum + bus.capacity;
      }, 0);

      // Calculate average occupancy over time
      const allOccupancyData = route.buses.flatMap(bus => bus.occupancy);
      const avgOccupancy = allOccupancyData.length > 0 
        ? Math.round(allOccupancyData.reduce((sum, occ) => sum + occ.count, 0) / allOccupancyData.length)
        : 0;

      return {
        id: route.id,
        routeNumber: route.routeNumber,
        name: route.name,
        currentOccupancy: routeOccupancy,
        totalCapacity: routeCapacity,
        occupancyPercentage: routeCapacity > 0 ? Math.round(routeOccupancy / routeCapacity * 100) : 0,
        averageOccupancy: avgOccupancy,
        activeBuses: route.buses.length,
        totalRecords: allOccupancyData.length
      };
    });

    res.json({
      success: true,
      data: { routes: routeAnalytics }
    });
  } catch (error) {
    console.error('Get route analytics error:', error);
    res.status(500).json({
      error: 'Failed to fetch route analytics',
      message: 'An error occurred while fetching route analytics'
    });
  }
});

// Get station analytics
router.get('/stations', async (req, res) => {
  try {
    const stations = await prisma.station.findMany({
      where: { isActive: true },
      include: {
        arrivals: {
          where: { isActive: true },
          include: {
            bus: {
              include: {
                occupancy: {
                  orderBy: { timestamp: 'desc' },
                  take: 1
                }
              }
            }
          }
        },
        routeStops: {
          include: {
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

    const stationAnalytics = stations.map(station => {
      const totalArrivals = station.arrivals.length;
      const totalRoutes = station.routeStops.length;
      
      const averageOccupancy = station.arrivals.length > 0 
        ? Math.round(station.arrivals.reduce((sum, arrival) => {
            return sum + (arrival.bus.occupancy[0]?.count || 0);
          }, 0) / station.arrivals.length)
        : 0;

      return {
        id: station.id,
        name: station.name,
        code: station.code,
        totalArrivals,
        totalRoutes,
        averageOccupancy,
        routes: station.routeStops.map(rs => ({
          routeNumber: rs.route.routeNumber,
          name: rs.route.name
        }))
      };
    });

    res.json({
      success: true,
      data: { stations: stationAnalytics }
    });
  } catch (error) {
    console.error('Get station analytics error:', error);
    res.status(500).json({
      error: 'Failed to fetch station analytics',
      message: 'An error occurred while fetching station analytics'
    });
  }
});

export default router; 