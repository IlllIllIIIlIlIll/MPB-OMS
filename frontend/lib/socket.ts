import { io, Socket } from 'socket.io-client';

export interface SocketEvents {
  // Camera events
  'camera:status': (data: { cameraId: string; status: 'online' | 'offline' }) => void;
  'camera:occupancy': (data: { cameraId: string; count: number; timestamp: string }) => void;
  
  // Bus events
  'bus:location': (data: { busId: string; latitude: number; longitude: number; timestamp: string }) => void;
  'bus:occupancy': (data: { busId: string; count: number; capacity: number; timestamp: string }) => void;
  'bus:arrival': (data: { busId: string; stationId: string; estimatedArrival: string }) => void;
  
  // Alert events
  'alert:new': (data: { alert: any }) => void;
  'alert:resolved': (data: { alertId: string }) => void;
  
  // System events
  'system:status': (data: { status: 'healthy' | 'warning' | 'critical' }) => void;
  'system:health': (data: { cameras: { online: number; total: number }; buses: { active: number; total: number } }) => void;
}

class SocketClient {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  connect(token?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const url = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
      
      this.socket = io(url, {
        auth: token ? { token } : undefined,
        transports: ['websocket', 'polling'],
        timeout: 20000,
      });

      this.socket.on('connect', () => {
        console.log('Socket connected');
        this.reconnectAttempts = 0;
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        reject(error);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
        if (reason === 'io server disconnect') {
          // Server disconnected us, try to reconnect
          this.socket?.connect();
        }
      });

      this.socket.on('reconnect_attempt', (attemptNumber) => {
        if (attemptNumber > this.maxReconnectAttempts) {
          console.error('Max reconnection attempts reached');
          return;
        }
        
        this.reconnectAttempts = attemptNumber;
        const delay = this.reconnectDelay * Math.pow(2, attemptNumber - 1);
        console.log(`Reconnection attempt ${attemptNumber} in ${delay}ms`);
      });

      this.socket.on('reconnect', (attemptNumber) => {
        console.log(`Reconnected after ${attemptNumber} attempts`);
      });

      this.socket.on('reconnect_error', (error) => {
        console.error('Reconnection error:', error);
      });

      this.socket.on('reconnect_failed', () => {
        console.error('Reconnection failed');
      });
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinRoom(room: string): void {
    if (this.socket) {
      this.socket.emit('join:room', { room });
    }
  }

  leaveRoom(room: string): void {
    if (this.socket) {
      this.socket.emit('leave:room', { room });
    }
  }

  on<T extends keyof SocketEvents>(event: T, callback: SocketEvents[T]): void {
    if (this.socket) {
      this.socket.on(event, callback as any);
    }
  }

  off<T extends keyof SocketEvents>(event: T, callback?: SocketEvents[T]): void {
    if (this.socket) {
      if (callback) {
        this.socket.off(event, callback as any);
      } else {
        this.socket.off(event);
      }
    }
  }

  emit(event: string, data?: any): void {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Convenience methods for specific room types
  joinBusRoom(busId: string): void {
    this.joinRoom(`bus:${busId}`);
  }

  joinRouteRoom(routeId: string): void {
    this.joinRoom(`route:${routeId}`);
  }

  joinStationRoom(stationId: string): void {
    this.joinRoom(`station:${stationId}`);
  }

  joinAdminRoom(): void {
    this.joinRoom('admin');
  }

  joinGuardRoom(): void {
    this.joinRoom('guard');
  }

  // Manual occupancy update (for platform guards)
  updateOccupancy(busId: string, count: number, reason?: string): void {
    this.emit('occupancy:update', { busId, count, reason });
  }

  // Camera status update
  updateCameraStatus(cameraId: string, status: 'online' | 'offline'): void {
    this.emit('camera:status', { cameraId, status });
  }
}

// Create and export a singleton instance
export const socketClient = new SocketClient();

// Hook for React components
export const useSocket = () => {
  return socketClient;
}; 