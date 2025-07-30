'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Card, Badge, OccupancyIndicator, Button } from '@/components/ui';
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
}

interface Route {
  id: string;
  name: string;
  description: string;
  averageOccupancy: number;
  buses: Bus[];
}

const MobileApp = () => {
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [nearbyStations, setNearbyStations] = useState<string[]>([]);
  const { joinRouteRoom, isConnected } = useSocket({ autoConnect: true });

  // Mock data for demonstration
  const mockRoutes: Route[] = [
    {
      id: 'route-1',
      name: 'TJ-01',
      description: 'Blok M - Kota',
      averageOccupancy: 75,
      buses: [
        {
          id: 'bus-1',
          busId: 'TJ001',
          routeId: 'route-1',
          routeName: 'TJ-01 (Blok M - Kota)',
          currentOccupancy: 42,
          capacity: 50,
          estimatedArrival: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
          currentStation: 'Blok M',
          nextStation: 'Senayan',
          status: 'active',
        },
        {
          id: 'bus-2',
          busId: 'TJ002',
          routeId: 'route-1',
          routeName: 'TJ-01 (Blok M - Kota)',
          currentOccupancy: 38,
          capacity: 50,
          estimatedArrival: new Date(Date.now() + 12 * 60 * 1000).toISOString(),
          currentStation: 'Senayan',
          nextStation: 'Bundaran HI',
          status: 'active',
        },
      ],
    },
    {
      id: 'route-2',
      name: 'TJ-02',
      description: 'Pulogadung - Harmoni',
      averageOccupancy: 65,
      buses: [
        {
          id: 'bus-3',
          busId: 'TJ003',
          routeId: 'route-2',
          routeName: 'TJ-02 (Pulogadung - Harmoni)',
          currentOccupancy: 35,
          capacity: 50,
          estimatedArrival: new Date(Date.now() + 8 * 60 * 1000).toISOString(),
          currentStation: 'Pulogadung',
          nextStation: 'Kampung Melayu',
          status: 'active',
        },
      ],
    },
    {
      id: 'route-3',
      name: 'TJ-03',
      description: 'Kalideres - Monas',
      averageOccupancy: 55,
      buses: [
        {
          id: 'bus-4',
          busId: 'TJ004',
          routeId: 'route-3',
          routeName: 'TJ-03 (Kalideres - Monas)',
          currentOccupancy: 28,
          capacity: 50,
          estimatedArrival: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
          currentStation: 'Kalideres',
          nextStation: 'Grogol',
          status: 'active',
        },
      ],
    },
  ];

  const data = mockRoutes;

  // Join route room for real-time updates
  useEffect(() => {
    if (isConnected && selectedRoute) {
      joinRouteRoom(selectedRoute);
    }
  }, [isConnected, selectedRoute, joinRouteRoom]);

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-primary-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">TransJakarta</h1>
            <p className="text-primary-100 text-sm">Real-time Bus Information</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
            <span className="text-xs">{isConnected ? 'Live' : 'Offline'}</span>
          </div>
        </div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="p-4 space-y-4"
      >
        {/* Quick Status */}
        <motion.div variants={itemVariants}>
          <Card className="p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-blue-600">{data.length}</p>
                <p className="text-xs text-gray-600">Active Routes</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {data.reduce((acc, route) => acc + route.buses.length, 0)}
                </p>
                <p className="text-xs text-gray-600">Buses Running</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600">
                  {Math.round(data.reduce((acc, route) => acc + route.averageOccupancy, 0) / data.length)}%
                </p>
                <p className="text-xs text-gray-600">Avg Occupancy</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Route Selection */}
        <motion.div variants={itemVariants}>
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {data.map((route) => (
              <button
                key={route.id}
                onClick={() => setSelectedRoute(selectedRoute === route.id ? null : route.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedRoute === route.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {formatRouteName(route.name)}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Route Details */}
        {selectedRoute && (
          <motion.div
            variants={itemVariants}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            {data
              .filter((route) => route.id === selectedRoute)
              .map((route) => (
                <Card key={route.id} className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {formatRouteName(route.name)} - {route.description}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {route.buses.length} buses running
                      </p>
                    </div>
                    <Badge
                      variant={
                        route.averageOccupancy <= 30 ? 'success' :
                        route.averageOccupancy <= 70 ? 'warning' : 'danger'
                      }
                    >
                      {route.averageOccupancy}% Full
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    {route.buses.map((bus) => {
                      const occupancyLevel = getOccupancyLevel(bus.currentOccupancy, bus.capacity);
                      const arrivalTime = new Date(bus.estimatedArrival);
                      const minutesUntilArrival = Math.round((arrivalTime.getTime() - Date.now()) / (1000 * 60));

                      return (
                        <div
                          key={bus.id}
                          className="border border-gray-200 rounded-lg p-3 bg-white"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {formatBusId(bus.busId)}
                              </h4>
                              <p className="text-xs text-gray-600">
                                {bus.currentStation} → {bus.nextStation}
                              </p>
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

                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <OccupancyIndicator
                                current={bus.currentOccupancy}
                                capacity={bus.capacity}
                                size="sm"
                                showBar={true}
                                showPercentage={false}
                              />
                            </div>
                            <div className="text-right ml-4">
                              <p className="text-sm font-medium text-gray-900">
                                {minutesUntilArrival > 0 ? `${minutesUntilArrival}m` : 'Arriving'}
                              </p>
                              <p className="text-xs text-gray-600">
                                {formatTime(bus.estimatedArrival)}
                              </p>
                            </div>
                          </div>

                          <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                            <span>Last updated: {formatTime(bus.lastUpdated)}</span>
                            <span className={`w-2 h-2 rounded-full ${
                              bus.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                            }`} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              ))}
          </motion.div>
        )}

        {/* All Routes Overview */}
        {!selectedRoute && (
          <motion.div variants={itemVariants}>
            <Card className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">All Routes</h3>
              <div className="space-y-3">
                {data.map((route) => (
                  <div
                    key={route.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedRoute(route.id)}
                  >
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {formatRouteName(route.name)} - {route.description}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {route.buses.length} buses • {route.averageOccupancy}% average occupancy
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant={
                          route.averageOccupancy <= 30 ? 'success' :
                          route.averageOccupancy <= 70 ? 'warning' : 'danger'
                        }
                        size="sm"
                      >
                        {route.averageOccupancy}%
                      </Badge>
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Quick Actions */}
        <motion.div variants={itemVariants}>
          <Card className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="primary" size="lg" className="w-full">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Find Nearest Station
              </Button>
              <Button variant="secondary" size="lg" className="w-full">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Schedule
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Footer */}
        <motion.div variants={itemVariants} className="text-center py-4">
          <p className="text-xs text-gray-500">
            Data updates every 30 seconds • Last updated: {formatTime(new Date().toISOString())}
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default MobileApp; 