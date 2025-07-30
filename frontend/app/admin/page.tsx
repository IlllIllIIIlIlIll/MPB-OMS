'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, Badge, OccupancyIndicator, AlertCard } from '@/components/ui';
import { apiClient } from '@/lib/api';
import { useSocket } from '@/hooks/useSocket';
import { formatNumber, getTimeAgo } from '@/lib/utils';
import AuthGuard from '@/components/auth/AuthGuard';

interface Alert {
  id: string;
  type: 'OCCUPANCY' | 'CAMERA' | 'SYSTEM' | 'MAINTENANCE';
  severity: 'HIGH' | 'MEDIUM' | 'LOW' | 'CRITICAL';
  title: string;
  message: string;
  createdAt: string;
  isActive: boolean;
  busId?: string;
  routeId?: string;
  stationId?: string;
}

interface SystemOverview {
  totalBuses: number;
  activeBuses: number;
  totalRoutes: number;
  totalStations: number;
  totalCameras: number;
  onlineCameras: number;
  totalAlerts: number;
  activeAlerts: number;
  averageOccupancy: number;
  busiestRoute: {
    id: string;
    name: string;
    averageOccupancy: number;
  };
  recentAlerts: Alert[];
}

const AdminDashboard = () => {
  const [systemHealth, setSystemHealth] = useState<'healthy' | 'warning' | 'critical'>('healthy');
  const { joinAdminRoom, isConnected } = useSocket({ autoConnect: true });

  // Join admin room for real-time updates
  useEffect(() => {
    if (isConnected) {
      joinAdminRoom();
    }
  }, [isConnected, joinAdminRoom]);

  // Fetch system overview data
  const { data: overview, isLoading } = useQuery({
    queryKey: ['analytics', 'overview'],
    queryFn: () => apiClient.getAnalyticsOverview(),
    refetchInterval: 30020, // Refresh every 30 seconds
  });

  // Mock data for demonstration
  const mockOverview: SystemOverview = {
    totalBuses: 150,
    activeBuses: 142,
    totalRoutes: 13,
    totalStations: 208,
    totalCameras: 300,
    onlineCameras: 287,
    totalAlerts: 24,
    activeAlerts: 3,
    averageOccupancy: 67,
    busiestRoute: {
      id: 'route-1',
      name: 'TJ-01 (Blok M - Kota)',
      averageOccupancy: 89,
    },
    recentAlerts: [
      {
        id: 'alert-1',
        type: 'OCCUPANCY',
        severity: 'HIGH',
        title: 'High Occupancy Alert',
        message: 'Bus TJ-001 on route TJ-01 has reached 95% capacity',
        createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        isActive: true,
      },
      {
        id: 'alert-2',
        type: 'CAMERA',
        severity: 'MEDIUM',
        title: 'Camera Offline',
        message: 'Camera CAM-045 at Station Harmoni is offline',
        createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        isActive: true,
      },
      {
        id: 'alert-3',
        type: 'SYSTEM',
        severity: 'LOW',
        title: 'System Maintenance',
        message: 'Scheduled maintenance completed successfully',
        createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        isActive: false,
      },
    ],
  };

  const data = (overview?.data as SystemOverview) || mockOverview;

  const stats = [
    {
      title: 'Active Buses',
      value: data.activeBuses,
      total: data.totalBuses,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Online Cameras',
      value: data.onlineCameras,
      total: data.totalCameras,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Active Alerts',
      value: data.activeAlerts,
      total: data.totalAlerts,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      ),
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
    {
      title: 'Average Occupancy',
      value: `${data.averageOccupancy}%`,
      subtitle: 'System-wide',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

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
    <AdminLayout title="Dashboard">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* System Status */}
        <motion.div variants={itemVariants}>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  systemHealth === 'healthy' ? 'bg-green-500' :
                  systemHealth === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">System Status</h2>
                  <p className="text-sm text-gray-600">
                    {isConnected ? 'Real-time updates active' : 'Connecting to real-time service...'}
                  </p>
                </div>
              </div>
              <Badge
                variant={systemHealth === 'healthy' ? 'success' : systemHealth === 'warning' ? 'warning' : 'danger'}
              >
                {systemHealth === 'healthy' ? 'Healthy' : systemHealth === 'warning' ? 'Warning' : 'Critical'}
              </Badge>
            </div>
          </Card>
        </motion.div>

        {/* Statistics Grid */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="p-6" hover>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  {stat.subtitle && (
                    <p className="text-xs text-gray-500">{stat.subtitle}</p>
                  )}
                  {stat.total && (
                    <p className="text-xs text-gray-500">of {formatNumber(stat.total)} total</p>
                  )}
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <div className={stat.color}>{stat.icon}</div>
                </div>
              </div>
            </Card>
          ))}
        </motion.div>

        {/* Busiest Route and Recent Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Busiest Route */}
          <motion.div variants={itemVariants}>
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Busiest Route</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{data.busiestRoute.name}</p>
                    <p className="text-sm text-gray-600">Route ID: {data.busiestRoute.id}</p>
                  </div>
                  <Badge variant="warning" size="lg">
                    {data.busiestRoute.averageOccupancy}% Full
                  </Badge>
                </div>
                <OccupancyIndicator
                  current={Math.round((data.busiestRoute.averageOccupancy / 100) * 50)}
                  capacity={50}
                  size="lg"
                />
              </div>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={itemVariants}>
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <button className="p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span className="text-sm font-medium">View Analytics</span>
                  </div>
                </button>
                <button className="p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <span className="text-sm font-medium">Manage Alerts</span>
                  </div>
                </button>
                <button className="p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm font-medium">Bus Management</span>
                  </div>
                </button>
                <button className="p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                    <span className="text-sm font-medium">User Management</span>
                  </div>
                </button>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Recent Alerts */}
        <motion.div variants={itemVariants}>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Alerts</h3>
              <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                View All Alerts
              </button>
            </div>
            <div className="space-y-4">
              {data.recentAlerts.map((alert: Alert) => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  onResolve={(alertId) => {
                    console.log('Resolve alert:', alertId);
                    // TODO: Implement alert resolution
                  }}
                />
              ))}
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </AdminLayout>
  );
};

const ProtectedAdminDashboard = () => (
  <AuthGuard requiredRole="ADMIN">
    <AdminDashboard />
  </AuthGuard>
);

export default ProtectedAdminDashboard; 