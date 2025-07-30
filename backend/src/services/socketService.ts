import { Server } from 'socket.io';
import prisma from '../lib/prisma';

export const setupSocketHandlers = (io: Server) => {
  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Join room for specific bus updates
    socket.on('join:bus', (busId: string) => {
      socket.join(`bus:${busId}`);
      console.log(`Client ${socket.id} joined bus room: ${busId}`);
    });

    // Join room for specific route updates
    socket.on('join:route', (routeId: string) => {
      socket.join(`route:${routeId}`);
      console.log(`Client ${socket.id} joined route room: ${routeId}`);
    });

    // Join room for specific station updates
    socket.on('join:station', (stationId: string) => {
      socket.join(`station:${stationId}`);
      console.log(`Client ${socket.id} joined station room: ${stationId}`);
    });

    // Join admin room
    socket.on('join:admin', () => {
      socket.join('admin');
      console.log(`Client ${socket.id} joined admin room`);
    });

    // Join platform guard room
    socket.on('join:guard', () => {
      socket.join('guard');
      console.log(`Client ${socket.id} joined guard room`);
    });

    // Handle camera status updates
    socket.on('camera:status', async (data: { deviceId: string; status: 'online' | 'offline' }) => {
      try {
        await prisma.camera.updateMany({
          where: { deviceId: data.deviceId },
          data: {
            lastPing: new Date(),
            isActive: data.status === 'online'
          }
        });

        // Emit camera status update to admin room
        io.to('admin').emit('camera:status:update', data);
      } catch (error) {
        console.error('Camera status update error:', error);
      }
    });

    // Handle manual occupancy updates from platform guards
    socket.on('occupancy:manual', async (data: { busId: string; count: number; userId: string }) => {
      try {
        // Create occupancy record
        const occupancy = await prisma.occupancy.create({
          data: {
            busId: data.busId,
            count: data.count,
            source: 'manual'
          }
        });

        // Get bus details
        const bus = await prisma.bus.findUnique({
          where: { id: data.busId },
          include: {
            route: {
              select: {
                routeNumber: true,
                name: true
              }
            }
          }
        });

        if (bus) {
          const occupancyPercentage = bus.capacity > 0 ? Math.round(data.count / bus.capacity * 100) : 0;

          // Emit to specific bus room
          io.to(`bus:${data.busId}`).emit('bus:occupancy:update', {
            busId: data.busId,
            busNumber: bus.busNumber,
            routeNumber: bus.route.routeNumber,
            count: data.count,
            occupancyPercentage,
            timestamp: occupancy.timestamp,
            source: 'manual'
          });

          // Emit to admin room
          io.to('admin').emit('bus:occupancy:update', {
            busId: data.busId,
            busNumber: bus.busNumber,
            routeNumber: bus.route.routeNumber,
            count: data.count,
            occupancyPercentage,
            timestamp: occupancy.timestamp,
            source: 'manual'
          });

          // Check for capacity alerts
          if (occupancyPercentage >= 90) {
            const alert = await prisma.alert.create({
              data: {
                type: 'CAPACITY_LIMIT',
                busId: data.busId,
                message: `Bus ${bus.busNumber} (${bus.route.routeNumber}) is at ${occupancyPercentage}% capacity`,
                severity: occupancyPercentage >= 95 ? 'CRITICAL' : 'HIGH'
              }
            });

            io.emit('alert:capacity:reached', {
              busId: data.busId,
              busNumber: bus.busNumber,
              routeNumber: bus.route.routeNumber,
              occupancyPercentage,
              message: `Bus ${bus.busNumber} is at ${occupancyPercentage}% capacity`
            });
          }
        }
      } catch (error) {
        console.error('Manual occupancy update error:', error);
      }
    });

    // Handle bus location updates
    socket.on('bus:location', async (data: { busId: string; latitude: number; longitude: number }) => {
      try {
        await prisma.bus.update({
          where: { id: data.busId },
          data: {
            currentLat: data.latitude,
            currentLng: data.longitude,
            lastLocation: new Date()
          }
        });

        // Emit location update to all clients
        io.emit('bus:location:update', {
          busId: data.busId,
          latitude: data.latitude,
          longitude: data.longitude,
          timestamp: new Date()
        });
      } catch (error) {
        console.error('Bus location update error:', error);
      }
    });

    // Handle arrival updates
    socket.on('arrival:update', async (data: { busId: string; stationId: string; eta: Date }) => {
      try {
        // Find existing arrival
        let arrival = await prisma.arrival.findFirst({
          where: {
            busId: data.busId,
            stationId: data.stationId
          }
        });

        if (arrival) {
          // Update existing arrival
          arrival = await prisma.arrival.update({
            where: { id: arrival.id },
            data: {
              eta: data.eta,
              isActive: true
            }
          });
        } else {
          // Create new arrival
          arrival = await prisma.arrival.create({
            data: {
              busId: data.busId,
              stationId: data.stationId,
              eta: data.eta
            }
          });
        }

        // Emit to station room
        io.to(`station:${data.stationId}`).emit('arrival:update', arrival);
      } catch (error) {
        console.error('Arrival update error:', error);
      }
    });

    // Handle system status updates
    socket.on('system:status', (data: { status: string; message: string }) => {
      io.to('admin').emit('system:status:update', {
        ...data,
        timestamp: new Date()
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  // Periodic system health check
  setInterval(async () => {
    try {
      // Check for offline cameras
      const offlineCameras = await prisma.camera.findMany({
        where: {
          isActive: true,
          lastPing: {
            lt: new Date(Date.now() - 5 * 60 * 1000) // 5 minutes ago
          }
        }
      });

      // Create alerts for offline cameras
      for (const camera of offlineCameras) {
        const existingAlert = await prisma.alert.findFirst({
          where: {
            type: 'CAMERA_OFFLINE',
            busId: camera.busId,
            isActive: true
          }
        });

        if (!existingAlert) {
          await prisma.alert.create({
            data: {
              type: 'CAMERA_OFFLINE',
              busId: camera.busId,
              message: `Camera ${camera.deviceId} is offline`,
              severity: 'MEDIUM'
            }
          });

          io.to('admin').emit('alert:camera:offline', {
            cameraId: camera.id,
            deviceId: camera.deviceId,
            busId: camera.busId
          });
        }
      }

      // Emit system health update
      const totalCameras = await prisma.camera.count({ where: { isActive: true } });
      const onlineCameras = totalCameras - offlineCameras.length;
      const healthPercentage = totalCameras > 0 ? Math.round((onlineCameras / totalCameras) * 100) : 0;

      io.to('admin').emit('system:health:update', {
        totalCameras,
        onlineCameras,
        offlineCameras: offlineCameras.length,
        healthPercentage,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('System health check error:', error);
    }
  }, 60000); // Check every minute
}; 