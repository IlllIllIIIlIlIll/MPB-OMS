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
    <div className="bg-blue-800 text-white px-8 py-3">
      <div className="flex items-center justify-between">
        <div className="text-sm overflow-hidden flex-1 mr-8">
          <div className="whitespace-nowrap animate-marquee">
            Panglima TNI Jenderal Andika Perkasa mengungkapkan tiga orang prajurit TNI telah terlibat dalam insiden tersebut dan sedang menjalani proses investigasi menyeluruh. Keputusan tegas akan diambil sesuai dengan hukum yang berlaku untuk menjaga kredibilitas dan integritas institusi TNI dalam melayani bangsa dan negara.
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-2xl font-bold">
            {formatTime(currentTime)}
          </div>
          <div className="w-px h-6 bg-white"></div>
          <div className="text-sm">
            {formatDate(currentTime)}
          </div>
        </div>
      </div>
    </div>
  )
}
