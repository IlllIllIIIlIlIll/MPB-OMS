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

  // Fetch bus data
  useEffect(() => {
    const fetchBusData = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/occupancy/now')
        if (response.ok) {
          const data = await response.json()
          
          // Transform API data to match our bus display format
          const transformedBuses: BusData[] = data.map((bus: any, index: number) => ({
            route: getRouteFromBusId(bus.busId),
            routeColor: getRouteColor(bus.busId),
            destination: "Pulo Gadung",
            platform: getPlatform(index),
            occupancy: bus.occupancy,
            capacity: bus.capacity,
            busNumber: bus.deviceId || `DMR-${Math.floor(Math.random() * 90000) + 10000}`,
            estimatedTime: `${Math.floor(Math.random() * 5) + 1} mnt`
          }))
          
          setBuses(transformedBuses)
        }
      } catch (error) {
        console.error('Failed to fetch bus data:', error)
        // Use fallback data
        setBuses([
          {
            route: "2",
            routeColor: "bg-blue-600",
            destination: "Pulo Gadung", 
            platform: "A",
            occupancy: 39,
            capacity: 40,
            busNumber: "DMR-727",
            estimatedTime: "1 mnt"
          },
          {
            route: "7F",
            routeColor: "bg-pink-500",
            destination: "Pulo Gadung",
            platform: "A", 
            occupancy: 30,
            capacity: 40,
            busNumber: "MYS-19222",
            estimatedTime: "1 mnt"
          },
          {
            route: "2",
            routeColor: "bg-blue-600",
            destination: "Pulo Gadung",
            platform: "C",
            occupancy: 35,
            capacity: 40,
            busNumber: "DMR-710", 
            estimatedTime: "2 mnt"
          },
          {
            route: "2A",
            routeColor: "bg-blue-400",
            destination: "Pulo Gadung",
            platform: "B",
            occupancy: 20,
            capacity: 40,
            busNumber: "DMR-240133",
            estimatedTime: "3 mnt"
          },
          {
            route: "7F",
            routeColor: "bg-pink-500", 
            destination: "Pulo Gadung",
            platform: "A",
            occupancy: 5,
            capacity: 40,
            busNumber: "MYS-17168",
            estimatedTime: "3 mnt"
          }
        ])
      }
    }

    fetchBusData()
    const interval = setInterval(fetchBusData, 10000) // Update every 10 seconds
    return () => clearInterval(interval)
  }, [])

  const getRouteFromBusId = (busId: string) => {
    const routes = ["2", "7F", "2A", "1", "9"]
    return routes[busId.charCodeAt(busId.length - 1) % routes.length]
  }

  const getRouteColor = (busId: string) => {
    const colors = ["bg-blue-600", "bg-pink-500", "bg-blue-400", "bg-green-500", "bg-orange-500"]
    return colors[busId.charCodeAt(busId.length - 1) % colors.length]
  }

  const getPlatform = (index: number) => {
    const platforms = ["A", "B", "C"]
    return platforms[index % platforms.length]
  }

  const getOccupancyColor = (occupancy: number, capacity: number) => {
    const percentage = (occupancy / capacity) * 100
    if (percentage >= 90) return "bg-red-200"
    if (percentage >= 75) return "bg-red-200" 
    if (percentage >= 50) return "bg-yellow-200"
    return "bg-green-200"
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Bus schedule table - 70% of height */}
      <div className="h-[70vh] p-6">
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
          <div className="overflow-hidden h-[calc(100%-4rem)]">
            {buses.map((bus, index) => (
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
                  <div className={`px-4 py-2 rounded-full ${getOccupancyColor(bus.occupancy, bus.capacity)}`}>
                    <span className="font-bold text-gray-800">
                      {bus.occupancy.toString().padStart(2, '0')} / {bus.capacity}
                    </span>
                  </div>
                </div>
                
                {/* Bus number */}
                <div className="text-gray-800 font-medium">{bus.busNumber}</div>
                
                {/* Estimated time */}
                <div className="text-gray-800">{bus.estimatedTime}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom content - 30% of height */}
      <div className="h-[30vh] p-6 pt-0">
        <div className="flex gap-6 h-full">
          {/* Promotional image - takes full width */}
          <div className="flex-1">
            <div className="rounded-lg overflow-hidden shadow-lg h-full">
              <Image 
                src="/mpa.jpg" 
                alt="Promotional content"
                width={800}
                height={300}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
