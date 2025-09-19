import { Server } from 'socket.io';
import { createClient } from 'redis';

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.connect().catch(console.error);

export const setupSocketHandlers = (io: Server) => {
  console.log('🔌 Setting up Socket.io handlers...');

  io.on('connection', (socket) => {
    console.log(`👤 Client connected: ${socket.id}`);

    // Join bus-specific room
    socket.on('join-bus', (busId: string) => {
      socket.join(`bus-${busId}`);
      console.log(`🚌 Client ${socket.id} joined bus ${busId}`);
    });

    // Leave bus-specific room
    socket.on('leave-bus', (busId: string) => {
      socket.leave(`bus-${busId}`);
      console.log(`🚌 Client ${socket.id} left bus ${busId}`);
    });

    // Join admin room
    socket.on('join-admin', () => {
      socket.join('admin-room');
      console.log(`👑 Client ${socket.id} joined admin room`);
    });

    // Handle occupancy updates
    socket.on('occupancy-update', async (data) => {
      try {
        const { busId, occupancy, capacity } = data;
        
        // Store in Redis
        await redisClient.hSet(`occ:now:${busId}`, {
          bus_id: busId,
          occupancy: occupancy.toString(),
          capacity: (capacity || 40).toString(),
          updated_at: new Date().toISOString()
        });

        // Broadcast to bus-specific room
        io.to(`bus-${busId}`).emit('occupancy-updated', {
          busId,
          occupancy,
          capacity: capacity || 40,
          timestamp: new Date().toISOString()
        });

        // Broadcast to admin room
        io.to('admin-room').emit('occupancy-updated', {
          busId,
          occupancy,
          capacity: capacity || 40,
          timestamp: new Date().toISOString()
        });

        console.log(`📊 Occupancy update for bus ${busId}: ${occupancy}/${capacity || 40}`);
      } catch (error) {
        console.error('❌ Error handling occupancy update:', error);
      }
    });

    // Handle device status updates
    socket.on('device-status', async (data) => {
      try {
        const { deviceId, status, busId } = data;
        
        // Store device status in Redis
        await redisClient.hSet(`device:${deviceId}`, {
          device_id: deviceId,
          status: status,
          bus_id: busId || 'unknown',
          last_ping: new Date().toISOString()
        });

        // Broadcast to admin room
        io.to('admin-room').emit('device-status-updated', {
          deviceId,
          status,
          busId,
          timestamp: new Date().toISOString()
        });

        console.log(`📱 Device status update: ${deviceId} = ${status}`);
      } catch (error) {
        console.error('❌ Error handling device status:', error);
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`👤 Client disconnected: ${socket.id}`);
    });
  });

  // Set up periodic broadcasts
  setInterval(async () => {
    try {
      // Get all current occupancy data
      const keys = await redisClient.keys('occ:now:*');
      const occupancyData = [];
      
      for (const key of keys) {
        const data = await redisClient.hGetAll(key);
        if (data.bus_id && data.occupancy) {
          occupancyData.push({
            busId: data.bus_id,
            occupancy: parseInt(data.occupancy),
            capacity: parseInt(data.capacity) || 40,
            updatedAt: data.updated_at
          });
        }
      }

      // Broadcast to admin room
      io.to('admin-room').emit('occupancy-summary', {
        buses: occupancyData,
        totalBuses: occupancyData.length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Error broadcasting occupancy summary:', error);
    }
  }, 5000); // Every 5 seconds

  console.log('✅ Socket.io handlers configured');
}; 