"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/Card"
import { Progress } from "@/components/ui/Progress"
import Badge from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import { 
  Bus, 
  Users, 
  Clock, 
  Wifi, 
  WifiOff, 
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Activity
} from "lucide-react"

interface OccupancyData {
  busId: string
  busCode: string
  routeId?: string
  capacity: number
  occupancy: number
  inCount: number
  outCount: number
  updatedAt: string
  deviceId?: string
  providerName: string
  category: string
}

interface SystemStatus {
  connected: boolean
  lastUpdate: string
  totalBuses: number
  activeBuses: number
}

export default function OMSDashboard() {
  const [selectedBus, setSelectedBus] = useState<OccupancyData | null>(null)
  const [allBuses, setAllBuses] = useState<OccupancyData[]>([])
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    connected: true,
    lastUpdate: new Date().toISOString(),
    totalBuses: 0,
    activeBuses: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch occupancy data
  const fetchOccupancyData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/occupancy/now`
      console.log('🔍 Fetching from:', apiUrl)
      
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
      })

      console.log('📡 Response status:', response.status)
      console.log('📡 Response headers:', response.headers)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ API Error:', response.status, errorText)
        throw new Error(`Failed to fetch occupancy data: ${response.status} - ${errorText}`)
      }

      const data: any = await response.json()
      console.log('📊 Received data:', data)
      
      // Handle both array and object with buses property
      const buses = Array.isArray(data) ? data : (data.buses || [])
      console.log('🚌 Processed buses:', buses)
      
      // Transform data to match expected format
      const transformedBuses: OccupancyData[] = buses.map((bus: any) => ({
        busId: bus.busId || bus.bus_id || 'UNKNOWN',
        busCode: bus.busCode || bus.busId || bus.bus_id || 'UNKNOWN',
        routeId: bus.routeId || `ROUTE-${bus.busId || bus.bus_id}`,
        capacity: bus.capacity || 40,
        occupancy: bus.occupancy || 0,
        inCount: bus.inCount || Math.floor((bus.occupancy || 0) * 0.6),
        outCount: bus.outCount || Math.floor((bus.occupancy || 0) * 0.4),
        updatedAt: bus.updatedAt || bus.updated_at || new Date().toISOString(),
        deviceId: bus.deviceId || bus.device_id,
        providerName: bus.providerName || 'TransJakarta',
        category: bus.category || 'Regular'
      }))
      
      console.log('✅ Transformed buses:', transformedBuses)
      setAllBuses(transformedBuses)
      
      // Auto-select the bus with highest occupancy if none selected
      if (!selectedBus && transformedBuses.length > 0) {
        const highestOccupancy = transformedBuses.reduce((prev, current) => 
          (current.occupancy / current.capacity) > (prev.occupancy / prev.capacity) ? current : prev
        )
        setSelectedBus(highestOccupancy)
      }

      setSystemStatus({
        connected: true,
        lastUpdate: new Date().toISOString(),
        totalBuses: transformedBuses.length,
        activeBuses: transformedBuses.filter(bus => bus.occupancy > 0).length
      })
    } catch (err) {
      console.error('💥 Fetch error:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      setSystemStatus(prev => ({ ...prev, connected: false }))
      
      // Add fallback data for demonstration
      const fallbackData: OccupancyData[] = [
        {
          busId: 'BUS001',
          busCode: 'BUS001',
          routeId: 'ROUTE-BUS001',
          capacity: 40,
          occupancy: 25,
          inCount: 15,
          outCount: 10,
          updatedAt: new Date().toISOString(),
          deviceId: 'DEV001',
          providerName: 'TransJakarta',
          category: 'Regular'
        },
        {
          busId: 'BUS002',
          busCode: 'BUS002',
          routeId: 'ROUTE-BUS002',
          capacity: 40,
          occupancy: 35,
          inCount: 21,
          outCount: 14,
          updatedAt: new Date().toISOString(),
          deviceId: 'DEV002',
          providerName: 'TransJakarta',
          category: 'Regular'
        },
        {
          busId: 'BUS003',
          busCode: 'BUS003',
          routeId: 'ROUTE-BUS003',
          capacity: 40,
          occupancy: 15,
          inCount: 9,
          outCount: 6,
          updatedAt: new Date().toISOString(),
          deviceId: 'DEV003',
          providerName: 'TransJakarta',
          category: 'Regular'
        }
      ]
      
      console.log('🔄 Using fallback data:', fallbackData)
      setAllBuses(fallbackData)
      if (!selectedBus) {
        setSelectedBus(fallbackData[1]) // Select BUS002 as it has highest occupancy
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Initial load and periodic refresh
  useEffect(() => {
    fetchOccupancyData()
    
    const interval = setInterval(fetchOccupancyData, 10000) // Refresh every 10 seconds
    
    return () => clearInterval(interval)
  }, [])

  // Update selected bus when allBuses changes
  useEffect(() => {
    if (allBuses.length > 0 && !selectedBus) {
      const highestOccupancy = allBuses.reduce((prev, current) => 
        (current.occupancy / current.capacity) > (prev.occupancy / prev.capacity) ? current : prev
      )
      setSelectedBus(highestOccupancy)
    }
  }, [allBuses, selectedBus])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading occupancy data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <WifiOff className="h-8 w-8 mx-auto mb-4 text-red-500" />
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={fetchOccupancyData}>Retry</Button>
        </div>
      </div>
    )
  }

  const occupancyPercentage = selectedBus ? (selectedBus.occupancy / selectedBus.capacity) * 100 : 0

  const getOccupancyColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600'
    if (percentage >= 75) return 'text-orange-600'
    if (percentage >= 50) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getOccupancyBgColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-50 border-red-200'
    if (percentage >= 75) return 'bg-orange-50 border-orange-200'
    if (percentage >= 50) return 'bg-yellow-50 border-yellow-200'
    return 'bg-green-50 border-green-200'
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">TransJakarta OMS</h1>
            <p className="text-muted-foreground">Occupancy Management System</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${systemStatus.connected ? 'bg-green-500' : 'bg-red-500'}`} />
              {systemStatus.connected ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
              <span className="text-sm font-medium">
                {systemStatus.connected ? 'Connected' : 'Disconnected'}
              </span>
            </div>

            <Badge variant="secondary">
              <Activity className="mr-1 h-3 w-3" />
              {systemStatus.activeBuses}/{systemStatus.totalBuses} Active
            </Badge>

                         <Button size="sm" variant="ghost" onClick={fetchOccupancyData}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Main Occupancy Display */}
        {selectedBus && (
          <Card className={`border-2 ${getOccupancyBgColor(occupancyPercentage)}`}>
            <CardContent className="p-8">
              <div className="text-center space-y-6">
                {/* Bus Info */}
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <Bus className="h-6 w-6 text-muted-foreground" />
                    <h2 className="text-2xl font-semibold">{selectedBus.busId}</h2>
                    <Badge variant="secondary">{selectedBus.busCode}</Badge>
                  </div>
                  <p className="text-muted-foreground">
                    {selectedBus.providerName} • {selectedBus.category}
                  </p>
                  {selectedBus.routeId && (
                    <p className="text-sm text-muted-foreground">Route: {selectedBus.routeId}</p>
                  )}
                </div>

                {/* Large Occupancy Display */}
                <div className="space-y-4">
                  <div className="text-center">
                    <div className={`text-8xl font-bold ${getOccupancyColor(occupancyPercentage)}`}>
                      {selectedBus.occupancy}
                    </div>
                    <div className="text-4xl font-medium text-muted-foreground">
                      / {selectedBus.capacity}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="max-w-md mx-auto space-y-2">
                    <Progress value={occupancyPercentage} className="h-3" />
                    <p className="text-sm text-muted-foreground">
                      {occupancyPercentage.toFixed(1)}% capacity
                    </p>
                  </div>
                </div>

                {/* Status Indicators */}
                <div className="flex justify-center gap-6">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">{selectedBus.inCount} boarded</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-medium">{selectedBus.outCount} alighted</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {new Date(selectedBus.updatedAt).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Bus Selection */}
        {allBuses.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">All Buses</h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {allBuses.map((bus) => {
                  const busOccupancyPercentage = (bus.occupancy / bus.capacity) * 100
                  return (
                    <div
                      key={bus.busId}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedBus?.busId === bus.busId
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedBus(bus)}
                    >
                      <div className="flex items-center justify-between mb-2">
                                                 <h4 className="font-semibold">{bus.busId}</h4>
                         <Badge variant="secondary">{bus.busCode}</Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="text-2xl font-bold text-center">
                          {bus.occupancy}/{bus.capacity}
                        </div>
                        
                        <div className="space-y-1">
                          <Progress value={busOccupancyPercentage} className="h-2" />
                          <p className="text-xs text-muted-foreground text-center">
                            {busOccupancyPercentage.toFixed(1)}%
                          </p>
                        </div>

                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>↑ {bus.inCount}</span>
                          <span>↓ {bus.outCount}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* System Status Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>Last updated: {new Date(systemStatus.lastUpdate).toLocaleString()}</p>
          <p>TransJakarta Occupancy Management System v1.0</p>
        </div>
      </div>
    </div>
  )
} 