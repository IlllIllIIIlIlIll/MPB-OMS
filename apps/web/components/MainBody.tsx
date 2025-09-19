"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

interface BusData {
  route: string
  routeColor: string
  destination: string
  platform: string
  occupancy: number
  capacity: number
  busNumber: string
  estimatedTime: string
}

export default function MainBody() {
  const [buses, setBuses] = useState<BusData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch bus data
  useEffect(() => {
    const fetchBusData = async () => {
      try {
        setLoading(true)
        setError(null)
        console.log('=== MAKING API CALL ===')
        console.log('URL:', 'http://localhost:3001/api/occupancy/now')
        console.log('Time:', new Date().toISOString())
        
        const response = await fetch('http://localhost:3001/api/occupancy/now')
        console.log('=== RESPONSE RECEIVED ===')
        console.log('Status:', response.status)
        console.log('Status Text:', response.statusText)
        console.log('Headers:', Object.fromEntries(response.headers.entries()))
        
        if (response.ok) {
          const data = await response.json()
          console.log('=== RAW API RESPONSE ===')
          console.log('Data type:', typeof data)
          console.log('Is Array:', Array.isArray(data))
          console.log('Length:', data.length)
          console.log('Full data:', JSON.stringify(data, null, 2))
          
          // Transform API data to match our bus display format
          const transformedBuses: BusData[] = data.map((bus: any, index: number) => {
            console.log('Processing bus', index, bus)
            
            const routeName = bus.routeName || bus.routeId || "Unknown"
            const direction = bus.direction || "Pulo Gadung"
            const platform = bus.platform || "A"
            const occupancy = Number(bus.occupancy) || 0
            const capacity = Number(bus.capacity) || 40
            const busNumber = bus.busId || bus.busCode || "Unknown"
            const estimatedTime = bus.estimasi || "-- mnt"
            
            const transformed = {
              route: routeName,
              routeColor: getRouteColor(routeName),
              destination: direction,
              platform: platform,
              occupancy: occupancy,
              capacity: capacity,
              busNumber: busNumber,
              estimatedTime: estimatedTime
            }
            
            console.log('Transformed bus', index, transformed)
            return transformed
          })

          // Sort by estimated time (extract number from "X mnt" format) and limit to 5 items
          const sortedBuses = transformedBuses
            .map(bus => ({
              ...bus,
              estimatedTimeInt: parseInt(bus.estimatedTime.replace(/[^\d]/g, '')) || 999
            }))
            .sort((a, b) => a.estimatedTimeInt - b.estimatedTimeInt)
            .slice(0, 5)
          
          console.log('Final transformed buses:', sortedBuses)
          setBuses(sortedBuses)
        } else {
          console.log('=== API CALL FAILED ===')
          console.log('Status:', response.status)
          console.log('Status Text:', response.statusText)
          const errorText = await response.text()
          console.log('Error Response Body:', errorText)
          setError('Failed to fetch bus data (Status: ' + response.status + ')')
          setBuses([]) // Clear buses if API fails
        }
      } catch (error) {
        setError('Connection error: ' + (error instanceof Error ? error.message : 'Unknown error'))
        setBuses([]) // Clear buses on error
      } finally {
        setLoading(false)
      }
    }

    fetchBusData()
    const interval = setInterval(fetchBusData, 10000) // Update every 10 seconds
    return () => clearInterval(interval)
  }, [])

  const getRouteColor = (route: string) => {
    // Map specific routes to colors
    const routeColors: { [key: string]: string } = {
      "2": "bg-blue-600",
      "7F": "bg-pink-500", 
      "2A": "bg-blue-400",
      "9": "bg-orange-500",
      "1": "bg-green-500"
    }
    return routeColors[route] || "bg-gray-500"
  }

  const getOccupancyColor = (occupancy: number, capacity: number) => {
    const percentage = (occupancy / capacity) * 100
    
    // 100% = #FCBABA, 75% = #FCF6E1, 50% = #CBE8BE, 0% = #B1D9A3
    if (percentage >= 100) return "text-gray-800" // Will use inline style for exact colors
    if (percentage >= 75) return "text-gray-800"
    if (percentage >= 50) return "text-gray-800"
    return "text-gray-800"
  }

  const getOccupancyBgColor = (occupancy: number, capacity: number) => {
    const percentage = (occupancy / capacity) * 100
    
    if (percentage >= 100) return "#FCBABA"
    if (percentage >= 87.5) return "#FCB7B9" // Between 100% and 75%
    if (percentage >= 75) return "#FCF6E1"
    if (percentage >= 62.5) return "#E3EFD0" // Between 75% and 50%
    if (percentage >= 50) return "#CBE8BE"
    if (percentage >= 25) return "#BEE3B0" // Between 50% and 0%
    return "#B1D9A3"
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Bus schedule table - 70% of height */}
      <div className="h-[70%] p-6">
        <div className="bg-white rounded-lg shadow-sm h-full">
          {/* Table header */}
          <div className="grid grid-cols-6 gap-4 p-4 bg-gray-100 font-semibold text-gray-700">
            <div>Rute</div>
            <div>Arah</div>
            <div>Peron</div>
            <div>Kapasitas</div>
            <div>No Bus</div>
            <div>Estimasi</div>
          </div>
          
          {/* Bus rows */}
          <div className="h-[calc(100%-4rem)]">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-gray-500">Loading bus data...</div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-red-500">
                  <div className="text-center">
                    <div className="text-lg font-semibold mb-2">Error loading bus data</div>
                    <div className="text-sm">{error}</div>
                    <div className="text-xs mt-2 text-gray-400">
                      Make sure the backend server is running on port 3001
                    </div>
                  </div>
                </div>
              </div>
            ) : buses.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-gray-500">No bus data available</div>
              </div>
            ) : (
              buses.map((bus, index) => (
                <div key={index} className="grid grid-cols-6 gap-4 p-4 border-b border-gray-200 items-center">
                  {/* Route */}
                  <div className="flex items-center">
                    <div className={`w-10 h-10 ${bus.routeColor} rounded-full flex items-center justify-center`}>
                      <span className="text-white font-bold text-sm">{bus.route}</span>
                    </div>
                  </div>
                  
                  {/* Destination */}
                  <div className="text-gray-800">{bus.destination}</div>
                  
                  {/* Platform */}
                  <div className="text-gray-800 font-semibold">{bus.platform}</div>
                  
                  {/* Occupancy */}
                  <div className="flex items-center">
                    <div 
                      className="px-4 py-2 rounded-full"
                      style={{ backgroundColor: getOccupancyBgColor(bus.occupancy, bus.capacity) }}
                    >
                      <span className="font-bold text-gray-800">
                        {String(bus.occupancy).padStart(2, '0')} / {bus.capacity}
                      </span>
                    </div>
                  </div>
                  
                  {/* Bus number */}
                  <div className="text-gray-800 font-medium">{bus.busNumber}</div>
                  
                  {/* Estimated time */}
                  <div className="text-gray-800">{bus.estimatedTime}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
