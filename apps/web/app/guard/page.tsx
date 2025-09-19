'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Card, Badge, OccupancyIndicator, Button, Input } from '@/components/ui';
import { apiClient } from '@/lib/api';
import { useSocket } from '@/hooks/useSocket';
import { formatTime, formatBusId } from '@/lib/utils';
import AuthGuard from '@/components/auth/AuthGuard';

interface Bus {
  id: string;
  busId: string;
  routeId: string;
  routeName: string;
  currentOccupancy: number;
  capacity: number;
  lastUpdated: string;
  status: 'active' | 'inactive';
  location?: {
    latitude: number;
    longitude: number;
  };
}

const GuardDashboard = () => {
  const [selectedBus, setSelectedBus] = useState<string | null>(null);
  const [manualCount, setManualCount] = useState('');
  const [reason, setReason] = useState('');
  const { joinGuardRoom, updateOccupancy, isConnected } = useSocket({ autoConnect: true });

  // Join guard room for real-time updates
  useEffect(() => {
    if (isConnected) {
      joinGuardRoom();
    }
  }, [isConnected, joinGuardRoom]);

  // Fetch buses data
  const { data: busesResponse, isLoading } = useQuery({
    queryKey: ['buses'],
    queryFn: () => apiClient.getBuses(),
    refetchInterval: 30020, // Refresh every 30 seconds
  });

  // Mock data for demonstration
  const mockBuses: Bus[] = [
    {
      id: 'bus-1',
      busId: 'TJ001',
      routeId: 'route-1',
      routeName: 'TJ-01 (Blok M - Kota)',
      currentOccupancy: 42,
      capacity: 50,
      lastUpdated: new Date().toISOString(),
      status: 'active',
      location: {
        latitude: -6.2088,
        longitude: 106.8456
      }
    },
    {
      id: 'bus-2',
      busId: 'TJ002',
      routeId: 'route-1',
      routeName: 'TJ-01 (Blok M - Kota)',
      currentOccupancy: 38,
      capacity: 50,
      lastUpdated: new Date().toISOString(),
      status: 'active',
      location: {
        latitude: -6.2088,
        longitude: 106.8456
      }
    },
    {
      id: 'bus-3',
      busId: 'TJ003',
      routeId: 'route-2',
      routeName: 'TJ-02 (Pulogadung - Harmoni)',
      currentOccupancy: 35,
      capacity: 50,
      lastUpdated: new Date().toISOString(),
      status: 'active',
      location: {
        latitude: -6.2088,
        longitude: 106.8456
      }
    },
  ];

  const data = (busesResponse?.data as any)?.buses || mockBuses;

  const handleManualUpdate = () => {
    if (!selectedBus || !manualCount) return;

    const count = parseInt(manualCount);
    if (isNaN(count) || count < 0) return;

    updateOccupancy(selectedBus, count, reason || 'Manual update by guard');
    setManualCount('');
    setReason('');
    setSelectedBus(null);
  };

  const getOccupancyLevel = (current: number, capacity: number) => {
    const percentage = (current / capacity) * 100;
    if (percentage <= 30) return 'low';
    if (percentage <= 70) return 'medium';
    return 'high';
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Platform Guard Dashboard</h1>
            <p className="text-gray-600">Real-time bus monitoring and occupancy management</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-gray-600">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* System Status */}
        <motion.div variants={itemVariants}>
          <Card className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-blue-600">{data.length}</p>
                <p className="text-sm text-gray-600">Active Buses</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {data.filter((bus: Bus) => getOccupancyLevel(bus.currentOccupancy, bus.capacity) === 'low').length}
                </p>
                <p className="text-sm text-gray-600">Low Occupancy</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-600">
                  {data.filter((bus: Bus) => getOccupancyLevel(bus.currentOccupancy, bus.capacity) === 'medium').length}
                </p>
                <p className="text-sm text-gray-600">Medium Occupancy</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">
                  {data.filter((bus: Bus) => getOccupancyLevel(bus.currentOccupancy, bus.capacity) === 'high').length}
                </p>
                <p className="text-sm text-gray-600">High Occupancy</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Bus Grid */}
        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.map((bus: Bus) => {
              const occupancyLevel = getOccupancyLevel(bus.currentOccupancy, bus.capacity);
              const isSelected = selectedBus === bus.id;

              return (
                <div
                  key={bus.id}
                  className={`bg-white rounded-lg p-4 border cursor-pointer transition-all ${
                    isSelected ? 'ring-2 ring-primary-500 bg-primary-50' : 'hover:shadow-lg'
                  }`}
                  onClick={() => setSelectedBus(isSelected ? null : bus.id)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{formatBusId(bus.busId)}</h3>
                      <p className="text-sm text-gray-600">{bus.routeName}</p>
                    </div>
                    <Badge
                      variant={
                        occupancyLevel === 'low' ? 'success' :
                        occupancyLevel === 'medium' ? 'warning' : 'danger'
                      }
                      size="sm"
                    >
                      {occupancyLevel.toUpperCase()}
                    </Badge>
                  </div>

                  <OccupancyIndicator
                    current={bus.currentOccupancy}
                    capacity={bus.capacity}
                    size="md"
                  />

                  <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                    <span>Last updated: {formatTime(bus.lastUpdated)}</span>
                    <span className={`w-2 h-2 rounded-full ${
                      bus.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                    }`} />
                  </div>

                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 pt-4 border-t border-gray-200"
                    >
                      <div className="space-y-3">
                        <Input
                          label="Manual Count"
                          type="number"
                          value={manualCount}
                          onChange={(e) => setManualCount(e.target.value)}
                          placeholder="Enter passenger count"
                          min="0"
                          max={bus.capacity}
                        />
                        <Input
                          label="Reason (optional)"
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          placeholder="e.g., Camera malfunction, manual count"
                        />
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={handleManualUpdate}
                          disabled={!manualCount}
                          className="w-full"
                        >
                          Update Occupancy
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants}>
          <Card className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button className="p-3 text-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex flex-col items-center space-y-2">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <span className="text-sm font-medium">Report Issue</span>
                </div>
              </button>
              <button className="p-3 text-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex flex-col items-center space-y-2">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-medium">All Clear</span>
                </div>
              </button>
              <button className="p-3 text-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex flex-col items-center space-y-2">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm font-medium">Schedule</span>
                </div>
              </button>
              <button className="p-3 text-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex flex-col items-center space-y-2">
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-sm font-medium">Settings</span>
                </div>
              </button>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

const ProtectedGuardDashboard = () => (
  <AuthGuard requiredRole="PLATFORM_GUARD">
    <GuardDashboard />
  </AuthGuard>
);

export default ProtectedGuardDashboard; 