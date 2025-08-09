"use client"

import { useState, useEffect } from "react"

export default function Footer() {
  const [currentTime, setCurrentTime] = useState(new Date())

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('id-ID', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric', 
      month: 'long',
      year: 'numeric'
    })
  }

  return (
    <div className="bg-blue-800 text-white px-8 py-3 mt-auto">
      <div className="flex items-center justify-between">
        <div className="text-sm">
          Panglima TNI Jenderal Andika Perkasa mengungkapkan tiga orang prajurit T
        </div>
        <div className="flex items-center gap-4">
          <div className="text-2xl font-bold">
            {formatTime(currentTime)}
          </div>
          <div className="text-sm">
            {formatDate(currentTime)}
          </div>
        </div>
      </div>
    </div>
  )
}
