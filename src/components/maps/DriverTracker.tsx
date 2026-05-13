"use client"

import React from 'react'

export interface DriverTrackerProps {
  driverLat: number
  driverLng: number
  destinationLat: number
  destinationLng: number
  driverName: string
}

/**
 * DriverTracker — placeholder component for real-time driver tracking on a map.
 * Shows driver position and destination coordinates with a visual indicator.
 * Google Maps integration is deferred; this renders a styled placeholder.
 *
 * Validates: Requirement 8.7
 */
export function DriverTracker({
  driverLat,
  driverLng,
  destinationLat,
  destinationLng,
  driverName,
}: DriverTrackerProps) {
  return (
    <div
      className="relative w-full h-64 rounded-lg border border-hairline-light bg-canvas-cream overflow-hidden"
      role="region"
      aria-label={`Peta pelacakan kurir ${driverName}`}
    >
      {/* Map placeholder background */}
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-canvas-cream to-shade-30/20">
        <svg
          className="w-16 h-16 text-shade-40 opacity-30"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
          />
        </svg>
      </div>

      {/* Driver position indicator */}
      <div className="absolute top-4 left-4 flex flex-col gap-2">
        {/* Driver marker */}
        <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-md px-3 py-2 shadow-sm">
          <span
            className="inline-block w-3 h-3 rounded-full bg-green-500 animate-pulse"
            aria-hidden="true"
          />
          <div className="text-xs">
            <p className="font-medium text-ink">{driverName}</p>
            <p className="text-shade-50">
              {driverLat.toFixed(5)}, {driverLng.toFixed(5)}
            </p>
          </div>
        </div>

        {/* Destination marker */}
        <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-md px-3 py-2 shadow-sm">
          <span
            className="inline-block w-3 h-3 rounded-full bg-red-500"
            aria-hidden="true"
          />
          <div className="text-xs">
            <p className="font-medium text-ink">Tujuan</p>
            <p className="text-shade-50">
              {destinationLat.toFixed(5)}, {destinationLng.toFixed(5)}
            </p>
          </div>
        </div>
      </div>

      {/* Placeholder notice */}
      <div className="absolute bottom-3 right-3 bg-white/80 backdrop-blur-sm rounded-md px-3 py-1.5 text-xs text-shade-50">
        Google Maps — segera hadir
      </div>
    </div>
  )
}

export default DriverTracker
