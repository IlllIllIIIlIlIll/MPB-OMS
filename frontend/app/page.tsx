"use client"

import { useState, useEffect } from "react"
import Badge from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Progress } from "@/components/ui/Progress"
import { Separator } from "@/components/ui/Separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs"
import {
  Activity,
  ArrowDown,
  ArrowUp,
  Camera,
  Database,
  Users,
  Wifi,
  WifiOff,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Eye,
  EyeOff,
  RefreshCw,
  Power,
} from "lucide-react"

// Core data types for the passenger counting system
interface PassengerData {
  timestamp: string
  in: number
  out: number
  occupancy: number
  capacity: number
}

interface SystemStatus {
  camera: "online" | "offline" | "error"
  erp: "connected" | "disconnected" | "syncing"
  localFallback: boolean
  lastSync: string
}

interface PassengerMovement {
  id: string
  type: "in" | "out"
  timestamp: string
}

export default function PassengerCountingDashboard() {
  // Core state for passenger counting system
  const [currentData, setCurrentData] = useState<PassengerData>({
    timestamp: new Date().toISOString(),
    in: 0,
    out: 0,
    occupancy: 0,
    capacity: 40,
  })

  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    camera: "online",
    erp: "connected",
    localFallback: false,
    lastSync: new Date().toISOString(),
  })

  const [recentMovements, setRecentMovements] = useState<PassengerMovement[]>([])
  const [isCameraActive, setIsCameraActive] = useState(true)

  // Simulate real-time passenger detection and counting
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate passenger movement detection (30% chance every 3 seconds)
      const movement = Math.random() > 0.7 ? (Math.random() > 0.5 ? "in" : "out") : null

      if (movement && isCameraActive) {
        setCurrentData((prev) => {
          const newIn = movement === "in" ? prev.in + 1 : prev.in
          const newOut = movement === "out" ? prev.out + 1 : prev.out
          const newOccupancy = Math.max(0, Math.min(prev.capacity, newIn - newOut))

          return {
            ...prev,
            in: newIn,
            out: newOut,
            occupancy: newOccupancy,
            timestamp: new Date().toISOString(),
          }
        })

        // Add to recent movements log
        setRecentMovements((prev) => [
          {
            id: Date.now().toString(),
            type: movement,
            timestamp: new Date().toISOString(),
          },
          ...prev.slice(0, 9), // Keep last 10 movements
        ])
      }

      // Simulate ERP connection status changes (5% chance)
      if (Math.random() > 0.95) {
        setSystemStatus((prev) => ({
          ...prev,
          erp: prev.erp === "connected" ? "disconnected" : "connected",
          localFallback: prev.erp === "connected", // Enable fallback when ERP disconnects
          lastSync: prev.erp === "connected" ? prev.lastSync : new Date().toISOString(),
        }))
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [isCameraActive])

  const occupancyPercentage = (currentData.occupancy / currentData.capacity) * 100

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
      case "connected":
        return "bg-green-500"
      case "syncing":
        return "bg-yellow-500"
      case "offline":
      case "disconnected":
      case "error":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusIcon = (type: "camera" | "erp") => {
    if (type === "camera") {
      return systemStatus.camera === "online" ? <Camera className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />
    }
    return systemStatus.erp === "connected" ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />
  }

  const handleSystemAction = (action: string) => {
    switch (action) {
      case "diagnostics":
        console.log("Running system diagnostics...")
        break
      case "erp-sync":
        setSystemStatus(prev => ({ ...prev, erp: "syncing" }))
        setTimeout(() => setSystemStatus(prev => ({ ...prev, erp: "connected" })), 2000)
        break
      case "restart-camera":
        setIsCameraActive(false)
        setTimeout(() => setIsCameraActive(true), 3000)
        break
      case "emergency-reset":
        setCurrentData({
          timestamp: new Date().toISOString(),
          in: 0,
          out: 0,
          occupancy: 0,
          capacity: 40,
        })
        setRecentMovements([])
        break
    }
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Passenger Counting System</h1>
            <p className="text-muted-foreground">Real-time occupancy monitoring and ERP integration</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${getStatusColor(systemStatus.camera)}`} />
              {getStatusIcon("camera")}
              <span className="text-sm font-medium capitalize">{systemStatus.camera}</span>
            </div>

            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${getStatusColor(systemStatus.erp)}`} />
              {getStatusIcon("erp")}
              <span className="text-sm font-medium capitalize">{systemStatus.erp}</span>
            </div>

            {systemStatus.localFallback && (
              <Badge variant="warning" className="text-yellow-600">
                <Database className="mr-1 h-3 w-3" />
                Local Fallback
              </Badge>
            )}
          </div>
        </div>

        {/* Main Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Occupancy</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {currentData.occupancy}/{currentData.capacity}
              </div>
              <Progress value={occupancyPercentage} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">{occupancyPercentage.toFixed(1)}% capacity</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Passengers In</CardTitle>
              <ArrowUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{currentData.in}</div>
              <p className="text-xs text-muted-foreground">Total boarding today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Passengers Out</CardTitle>
              <ArrowDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{currentData.out}</div>
              <p className="text-xs text-muted-foreground">Total alighting today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Status</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium">Operational</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Last sync: {new Date(systemStatus.lastSync).toLocaleTimeString()}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="live" className="space-y-4">
          <TabsList>
            <TabsTrigger value="live">Live Feed</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>

          <TabsContent value="live" className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-3">
              {/* Camera Feed */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Camera Feed</CardTitle>
                  <CardDescription>Overhead view - Real-time passenger detection</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-slate-900 rounded-lg relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900" />

                    {/* Camera status overlay */}
                    <div className="absolute top-2 right-2 flex items-center gap-2 bg-black/50 px-2 py-1 rounded">
                      <div className={`h-2 w-2 rounded-full ${isCameraActive ? "bg-green-400" : "bg-red-400"} animate-pulse`} />
                      <span className="text-xs text-white">{isCameraActive ? "LIVE" : "OFFLINE"}</span>
                    </div>

                    {/* Simulated detection boxes */}
                    {isCameraActive && currentData.occupancy > 0 && (
                      <>
                        <div className="absolute top-4 left-4 w-8 h-8 border-2 border-green-400 rounded">
                          <div className="absolute -top-6 left-0 text-xs text-green-400 bg-black/50 px-1 rounded">
                            Person #1
                          </div>
                        </div>
                        {currentData.occupancy > 1 && (
                          <div className="absolute top-12 right-8 w-8 h-8 border-2 border-blue-400 rounded">
                            <div className="absolute -top-6 right-0 text-xs text-blue-400 bg-black/50 px-1 rounded">
                              Person #2
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {/* Entry/Exit zones */}
                    <div className="absolute bottom-0 left-0 right-0 h-16 border-t-2 border-dashed border-yellow-400 bg-yellow-400/10">
                      <div className="absolute top-1 left-2 text-xs text-yellow-400 bg-black/50 px-1 rounded">
                        Entry/Exit Zone
                      </div>
                    </div>

                    {/* Camera controls */}
                    <div className="absolute bottom-2 right-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setIsCameraActive(!isCameraActive)}
                        className="bg-black/50 border-white/20 text-white hover:bg-black/70"
                      >
                        {isCameraActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest passenger movements</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {recentMovements.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
                  ) : (
                    recentMovements.map((movement) => (
                      <div key={movement.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-2">
                          {movement.type === "in" ? (
                            <ArrowUp className="h-4 w-4 text-green-600" />
                          ) : (
                            <ArrowDown className="h-4 w-4 text-red-600" />
                          )}
                          <span className="text-sm font-medium capitalize">Passenger {movement.type}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(movement.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Occupancy Trend</CardTitle>
                  <CardDescription>Passenger count over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-end justify-center gap-1">
                    {Array.from({ length: 24 }, (_, i) => {
                      const height = Math.random() * 80 + 20
                      return (
                        <div
                          key={i}
                          className="bg-primary/20 hover:bg-primary/40 transition-colors rounded-t"
                          style={{ height: `${height}%`, width: "3%" }}
                          title={`Hour ${i}: ${Math.floor(height / 2)} passengers`}
                        />
                      )
                    })}
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>00:00</span>
                    <span>12:00</span>
                    <span>23:59</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Daily Summary</CardTitle>
                  <CardDescription>Today's statistics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Peak Occupancy</span>
                    <span className="font-medium">38/40 (95%)</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Average Occupancy</span>
                    <span className="font-medium">24/40 (60%)</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Boardings</span>
                    <span className="font-medium text-green-600">{currentData.in}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Alightings</span>
                    <span className="font-medium text-red-600">{currentData.out}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="system" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>System Health</CardTitle>
                  <CardDescription>Device and connection status</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Camera className="h-4 w-4" />
                      <span className="text-sm">Camera Status</span>
                    </div>
                    <Badge variant={systemStatus.camera === "online" ? "success" : "danger"}>
                      {systemStatus.camera}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      <span className="text-sm">ERP Connection</span>
                    </div>
                    <Badge variant={systemStatus.erp === "connected" ? "success" : "danger"}>
                      {systemStatus.erp}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-sm">Local Fallback</span>
                    </div>
                    <Badge variant={systemStatus.localFallback ? "secondary" : "info"}>
                      {systemStatus.localFallback ? "Active" : "Inactive"}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">Last Sync</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(systemStatus.lastSync).toLocaleString()}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Actions</CardTitle>
                  <CardDescription>Manual controls and diagnostics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    className="w-full bg-transparent" 
                    variant="ghost"
                    onClick={() => handleSystemAction("diagnostics")}
                  >
                    <Activity className="mr-2 h-4 w-4" />
                    Run Diagnostics
                  </Button>

                  <Button 
                    className="w-full bg-transparent" 
                    variant="ghost"
                    onClick={() => handleSystemAction("erp-sync")}
                  >
                    <Database className="mr-2 h-4 w-4" />
                    Force ERP Sync
                  </Button>

                  <Button 
                    className="w-full bg-transparent" 
                    variant="ghost"
                    onClick={() => handleSystemAction("restart-camera")}
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    Restart Camera
                  </Button>

                  <Button 
                    className="w-full" 
                    variant="danger"
                    onClick={() => handleSystemAction("emergency-reset")}
                  >
                    <Power className="mr-2 h-4 w-4" />
                    Emergency Reset
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 