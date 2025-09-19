'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Card, Badge, OccupancyIndicator } from '@/components/ui';
import { apiClient } from '@/lib/api';
import { useSocket } from '@/hooks/useSocket';
import { formatTime, formatBusId, formatRouteName } from '@/lib/utils';

interface Bus {
  id: string;
  busId: string;
  routeId: string;
  routeName: string;
  currentOccupancy: number;
  capacity: number;
  estimatedArrival: string;
  currentStation: string;
  nextStation: string;
  status: 'active' | 'inactive';
  lastUpdated?: string;
}

interface Station {
  id: string;
  name: string;
  code: string;
  buses: Bus[];
}

const BusStopDisplay = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [displayMode, setDisplayMode] = useState<'arrivals' | 'system'>('arrivals');
  const { joinStationRoom, isConnected } = useSocket({ autoConnect: true });

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Mock data for demonstration
  const mockStation: Station = {
    id: 'station-1',
    name: 'Harmoni Central',
    code: 'HRM',
    buses: [
      {
        id: 'bus-1',
        busId: 'TJ001',
        routeId: 'route-1',
        routeName: 'TJ-01 (Blok M - Kota)',
        currentOccupancy: 42,
        capacity: 50,
        estimatedArrival: new Date(Date.now() + 3 * 60 * 1000).toISOString(),
        currentStation: 'Bundaran HI',
        nextStation: 'Harmoni Central',
        status: 'active',
      },
      {
        id: 'bus-2',
        busId: 'TJ002',
        routeId: 'route-1',
        routeName: 'TJ-01 (Blok M - Kota)',
        currentOccupancy: 38,
        capacity: 50,
        estimatedArrival: new Date(Date.now() + 8 * 60 * 1000).toISOString(),
        currentStation: 'Senayan',
        nextStation: 'Bundaran HI',
        status: 'active',
      },
      {
        id: 'bus-3',
        busId: 'TJ003',
        routeId: 'route-2',
        routeName: 'TJ-02 (Pulogadung - Harmoni)',
        currentOccupancy: 35,
        capacity: 50,
        estimatedArrival: new Date(Date.now() + 12 * 60 * 1000).toISOString(),
        currentStation: 'Kampung Melayu',
        nextStation: 'Harmoni Central',
        status: 'active',
      },
      {
        id: 'bus-4',
        busId: 'TJ004',
        routeId: 'route-3',
        routeName: 'TJ-03 (Kalideres - Monas)',
        currentOccupancy: 28,
        capacity: 50,
        estimatedArrival: new Date(Date.now() + 18 * 60 * 1000).toISOString(),
        currentStation: 'Grogol',
        nextStation: 'Harmoni Central',
        status: 'active',
      },
    ],
  };

  const data = mockStation;

  // Join station room for real-time updates
  useEffect(() => {
    if (isConnected) {
      joinStationRoom(data.id);
    }
  }, [isConnected, data.id, joinStationRoom]);

  const getOccupancyLevel = (current: number, capacity: number) => {
    const percentage = (current / capacity) * 100;
    if (percentage <= 30) return 'low';
    if (percentage <= 70) return 'medium';
    return 'high';
  };

  const getOccupancyColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatArrivalTime = (estimatedArrival: string) => {
    const arrivalTime = new Date(estimatedArrival);
    const diffInMinutes = Math.round((arrivalTime.getTime() - currentTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes <= 0) return 'ARRIVING';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    const hours = Math.floor(diffInMinutes / 60);
    const minutes = diffInMinutes % 60;
    return `${hours}h ${minutes}m`;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white overflow-hidden">
      {/* Header */}
      <div className="bg-primary-600 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">TransJakarta</h1>
            <p className="text-xl text-primary-100">{data.name} Station</p>
            <p className="text-lg text-primary-200">Station Code: {data.code}</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">
              {currentTime.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
              })}
            </div>
            <div className="text-lg text-primary-200">
              {currentTime.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
            <div className="flex items-center space-x-2 mt-2">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
              <span className="text-sm">{isConnected ? 'LIVE' : 'OFFLINE'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-gray-800 p-4">
        <div className="flex space-x-4">
          <button
            onClick={() => setDisplayMode('arrivals')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              displayMode === 'arrivals'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Upcoming Buses
          </button>
          <button
            onClick={() => setDisplayMode('system')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              displayMode === 'system'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            System Status
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {displayMode === 'arrivals' ? (
          <motion.div
            key="arrivals"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-6"
          >
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-6"
            >
              {/* Section Header */}
              <motion.div variants={itemVariants}>
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-white mb-2">Upcoming Buses</h2>
                  <p className="text-xl text-gray-300">Real-time arrival information</p>
                </div>
              </motion.div>

              {/* Bus Arrivals */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {data.buses
                  .sort((a, b) => new Date(a.estimatedArrival).getTime() - new Date(b.estimatedArrival).getTime())
                  .map((bus, index) => {
                    const occupancyLevel = getOccupancyLevel(bus.currentOccupancy, bus.capacity);
                    const arrivalTime = formatArrivalTime(bus.estimatedArrival);

                    return (
                      <motion.div
                        key={bus.id}
                        variants={itemVariants}
                        className="bg-gray-800 rounded-xl p-6 border-l-4 border-l-primary-500"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-2xl font-bold text-white">
                              {formatRouteName(bus.routeName)}
                            </h3>
                            <p className="text-lg text-gray-300">
                              Bus {formatBusId(bus.busId)}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-3xl font-bold text-primary-400">
                              {arrivalTime}
                            </div>
                            <div className="text-sm text-gray-400">
                              {formatTime(bus.estimatedArrival)}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-lg text-gray-300">Current Location:</span>
                            <span className="text-lg font-medium text-white">
                              {bus.currentStation} → {bus.nextStation}
                            </span>
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-lg text-gray-300">Occupancy:</span>
                              <Badge
                                variant={
                                  occupancyLevel === 'low' ? 'success' :
                                  occupancyLevel === 'medium' ? 'warning' : 'danger'
                                }
                                size="lg"
                              >
                                {occupancyLevel.toUpperCase()}
                              </Badge>
                            </div>
                            <OccupancyIndicator
                              current={bus.currentOccupancy}
                              capacity={bus.capacity}
                              size="lg"
                            />
                          </div>

                          <div className="flex items-center justify-between text-sm text-gray-400">
                            <span>Last updated: {formatTime(bus.lastUpdated || new Date().toISOString())}</span>
                            <div className="flex items-center space-x-2">
                              <span className={`w-2 h-2 rounded-full ${
                                bus.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                              }`} />
                              <span>{bus.status === 'active' ? 'ACTIVE' : 'INACTIVE'}</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
              </div>

              {/* No Buses Message */}
              {data.buses.length === 0 && (
                <motion.div variants={itemVariants} className="text-center py-12">
                  <div className="text-4xl mb-4">🚌</div>
                  <h3 className="text-2xl font-bold text-white mb-2">No Buses Scheduled</h3>
                  <p className="text-xl text-gray-300">Check back later for updates</p>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="system"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-6"
          >
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-6"
            >
              {/* System Status */}
              <motion.div variants={itemVariants}>
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-white mb-2">System Status</h2>
                  <p className="text-xl text-gray-300">Real-time system information</p>
                </div>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div variants={itemVariants}>
                  <div className="bg-gray-800 rounded-xl p-6 text-center">
                    <div className="text-4xl font-bold text-blue-400 mb-2">{data.buses.length}</div>
                    <div className="text-lg text-gray-300">Active Buses</div>
                  </div>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <div className="bg-gray-800 rounded-xl p-6 text-center">
                    <div className="text-4xl font-bold text-green-400 mb-2">
                      {data.buses.filter(bus => getOccupancyLevel(bus.currentOccupancy, bus.capacity) === 'low').length}
                    </div>
                    <div className="text-lg text-gray-300">Low Occupancy</div>
                  </div>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <div className="bg-gray-800 rounded-xl p-6 text-center">
                    <div className="text-4xl font-bold text-yellow-400 mb-2">
                      {data.buses.filter(bus => getOccupancyLevel(bus.currentOccupancy, bus.capacity) === 'medium').length}
                    </div>
                    <div className="text-lg text-gray-300">Medium Occupancy</div>
                  </div>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <div className="bg-gray-800 rounded-xl p-6 text-center">
                    <div className="text-4xl font-bold text-red-400 mb-2">
                      {data.buses.filter(bus => getOccupancyLevel(bus.currentOccupancy, bus.capacity) === 'high').length}
                    </div>
                    <div className="text-lg text-gray-300">High Occupancy</div>
                  </div>
                </motion.div>
              </div>

              {/* System Information */}
              <motion.div variants={itemVariants}>
                <div className="bg-gray-800 rounded-xl p-6">
                  <h3 className="text-2xl font-bold text-white mb-4">System Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-300 mb-2">Station Details</h4>
                      <div className="space-y-2 text-gray-400">
                        <div>Name: {data.name}</div>
                        <div>Code: {data.code}</div>
                        <div>Status: {isConnected ? 'Online' : 'Offline'}</div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-300 mb-2">Service Information</h4>
                      <div className="space-y-2 text-gray-400">
                        <div>Operating Hours: 05:00 - 23:00</div>
                        <div>Update Frequency: Real-time</div>
                        <div>Last Update: {formatTime(currentTime.toISOString())}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <div className="bg-gray-800 p-4 mt-8">
        <div className="text-center text-gray-400">
          <p className="text-sm">
            TransJakarta Occupancy Management System • Real-time updates every 30 seconds
          </p>
        </div>
      </div>
    </div>
  );
};

export default BusStopDisplay; 