import { useEffect, useRef, useCallback, useState } from 'react';
import { socketClient, SocketEvents } from '@/lib/socket';
import { getFromStorage } from '@/lib/utils';

interface UseSocketOptions {
  autoConnect?: boolean;
  rooms?: string[];
  events?: Partial<SocketEvents>;
}

export const useSocket = (options: UseSocketOptions = {}) => {
  const {
    autoConnect = true,
    rooms = [],
    events = {},
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const eventRefs = useRef<Map<keyof SocketEvents, SocketEvents[keyof SocketEvents]>>(new Map());

  // Connect to socket
  const connect = useCallback(async () => {
    if (isConnected || isConnecting) return;
    
    try {
      setIsConnecting(true);
      setError(null);
      
      const token = getFromStorage<string | null>('auth_token', null);
      await socketClient.connect(token || undefined);
      
      setIsConnected(true);
      
      // Join specified rooms
      rooms.forEach(room => {
        socketClient.joinRoom(room);
      });
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect');
      setIsConnected(false);
    } finally {
      setIsConnecting(false);
    }
  }, [isConnected, isConnecting, rooms]);

  // Disconnect from socket
  const disconnect = useCallback(() => {
    socketClient.disconnect();
    setIsConnected(false);
    setError(null);
  }, []);

  // Join a room
  const joinRoom = useCallback((room: string) => {
    if (isConnected) {
      socketClient.joinRoom(room);
    }
  }, [isConnected]);

  // Leave a room
  const leaveRoom = useCallback((room: string) => {
    if (isConnected) {
      socketClient.leaveRoom(room);
    }
  }, [isConnected]);

  // Emit an event
  const emit = useCallback((event: string, data?: any) => {
    if (isConnected) {
      socketClient.emit(event, data);
    }
  }, [isConnected]);

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  // Set up event listeners
  useEffect(() => {
    if (!isConnected) return;

    // Clear previous event listeners
    eventRefs.current.forEach((callback, event) => {
      socketClient.off(event, callback);
    });
    eventRefs.current.clear();

    // Set up new event listeners
    Object.entries(events).forEach(([event, callback]) => {
      const eventKey = event as keyof SocketEvents;
      eventRefs.current.set(eventKey, callback);
      socketClient.on(eventKey, callback);
    });

    // Cleanup on unmount
    return () => {
      eventRefs.current.forEach((callback, event) => {
        socketClient.off(event, callback);
      });
      eventRefs.current.clear();
    };
  }, [isConnected, events]);

  // Convenience methods for specific room types
  const joinBusRoom = useCallback((busId: string) => {
    if (isConnected) {
      socketClient.joinBusRoom(busId);
    }
  }, [isConnected]);

  const joinRouteRoom = useCallback((routeId: string) => {
    if (isConnected) {
      socketClient.joinRouteRoom(routeId);
    }
  }, [isConnected]);

  const joinStationRoom = useCallback((stationId: string) => {
    if (isConnected) {
      socketClient.joinStationRoom(stationId);
    }
  }, [isConnected]);

  const joinAdminRoom = useCallback(() => {
    if (isConnected) {
      socketClient.joinAdminRoom();
    }
  }, [isConnected]);

  const joinGuardRoom = useCallback(() => {
    if (isConnected) {
      socketClient.joinGuardRoom();
    }
  }, [isConnected]);

  // Manual occupancy update
  const updateOccupancy = useCallback((busId: string, count: number, reason?: string) => {
    if (isConnected) {
      socketClient.updateOccupancy(busId, count, reason);
    }
  }, [isConnected]);

  // Camera status update
  const updateCameraStatus = useCallback((cameraId: string, status: 'online' | 'offline') => {
    if (isConnected) {
      socketClient.updateCameraStatus(cameraId, status);
    }
  }, [isConnected]);

  return {
    // State
    isConnected,
    isConnecting,
    error,
    
    // Connection methods
    connect,
    disconnect,
    
    // Room management
    joinRoom,
    leaveRoom,
    joinBusRoom,
    joinRouteRoom,
    joinStationRoom,
    joinAdminRoom,
    joinGuardRoom,
    
    // Event emission
    emit,
    updateOccupancy,
    updateCameraStatus,
    
    // Socket client instance (for advanced usage)
    socketClient,
  };
}; 