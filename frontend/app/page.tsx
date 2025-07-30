'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Bus, Shield, Monitor, Smartphone } from 'lucide-react'
import Link from 'next/link'

const interfaces = [
  {
    id: 'mobile',
    title: 'Mobile App',
    description: 'Real-time bus occupancy for passengers',
    icon: Smartphone,
    color: 'bg-primary-500',
    href: '/mobile'
  },
  {
    id: 'display',
    title: 'Bus Stop Display',
    description: 'High-contrast screens for outdoor visibility',
    icon: Monitor,
    color: 'bg-success-500',
    href: '/display'
  },
  {
    id: 'guard',
    title: 'Platform Guard Dashboard',
    description: 'Real-time monitoring for platform guards',
    icon: Shield,
    color: 'bg-warning-500',
    href: '/guard'
  },
  {
    id: 'admin',
    title: 'Admin Dashboard',
    description: 'System-wide management and analytics',
    icon: Bus,
    color: 'bg-danger-500',
    href: '/admin'
  }
]

export default function HomePage() {
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <Bus className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">
                TransJakarta OMS
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Occupancy Management System
              </div>
              <Link href="/login" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                Login
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-bold text-gray-900 mb-4"
          >
            Welcome to TransJakarta OMS
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-xl text-gray-600 max-w-3xl mx-auto"
          >
            Choose your interface to access the real-time occupancy management system
          </motion.p>
        </div>

        {/* Interface Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {interfaces.map((interface_, index) => (
            <motion.div
              key={interface_.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              onHoverStart={() => setHoveredId(interface_.id)}
              onHoverEnd={() => setHoveredId(null)}
            >
              <Link href={interface_.href}>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-full cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-gray-300">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <motion.div
                      className={`w-16 h-16 ${interface_.color} rounded-full flex items-center justify-center`}
                      animate={{
                        scale: hoveredId === interface_.id ? 1.1 : 1,
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <interface_.icon className="w-8 h-8 text-white" />
                    </motion.div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {interface_.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {interface_.description}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-20"
        >
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
            System Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Bus className="w-6 h-6 text-primary-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Real-time Tracking
              </h4>
              <p className="text-sm text-gray-600">
                Live occupancy monitoring with overhead cameras
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-success-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Smart Alerts
              </h4>
              <p className="text-sm text-gray-600">
                Automated notifications for capacity limits
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Monitor className="w-6 h-6 text-warning-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Multi-Interface
              </h4>
              <p className="text-sm text-gray-600">
                Accessible across mobile, display, and admin interfaces
              </p>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm text-gray-400">
              © 2024 TransJakarta OMS. Built by MPB Team.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
} 