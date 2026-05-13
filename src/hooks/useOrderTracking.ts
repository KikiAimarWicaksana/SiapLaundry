"use client"

import { useEffect, useState, useCallback } from 'react'
import { useSocket } from '@/hooks/useSocket'
import { useOrderStore } from '@/stores/orderStore'
import type { OrderStatus, OrderStatusEvent, Order } from '@/types/order'

export interface DriverLocation {
  lat: number
  lng: number
}

export interface UseOrderTrackingReturn {
  currentStatus: OrderStatus
  statusHistory: OrderStatusEvent[]
  driverLocation: DriverLocation | null
  isConnected: boolean
}

interface OrderStatusUpdatedPayload {
  orderId: string
  newStatus: OrderStatus
  actorName?: string
  notes?: string
  createdAt: string
}

interface DriverLocationUpdatedPayload {
  orderId: string
  lat: number
  lng: number
}

/**
 * Custom hook for real-time order tracking.
 * Subscribes to `order:status_updated` and `driver:location_updated` socket events
 * filtered by orderId. Updates the orderStore in real-time.
 *
 * Validates: Requirements 8.4, 17.2
 */
export function useOrderTracking(orderId: string): UseOrderTrackingReturn {
  const { socket, isConnected } = useSocket()
  const currentOrder = useOrderStore((state) => state.currentOrder)
  const updateOrder = useOrderStore((state) => state.updateOrder)

  const [currentStatus, setCurrentStatus] = useState<OrderStatus>(
    currentOrder?.status ?? 'pending_pickup'
  )
  const [statusHistory, setStatusHistory] = useState<OrderStatusEvent[]>(
    currentOrder?.statusHistory ?? []
  )
  const [driverLocation, setDriverLocation] = useState<DriverLocation | null>(null)

  // Sync local state when currentOrder changes (e.g., initial fetch)
  useEffect(() => {
    if (currentOrder && currentOrder.id === orderId) {
      setCurrentStatus(currentOrder.status)
      setStatusHistory(currentOrder.statusHistory)
    }
  }, [currentOrder, orderId])

  const handleStatusUpdated = useCallback(
    (payload: OrderStatusUpdatedPayload) => {
      if (payload.orderId !== orderId) return

      const newEvent: OrderStatusEvent = {
        status: payload.newStatus,
        notes: payload.notes,
        createdAt: payload.createdAt,
        actorName: payload.actorName,
      }

      setCurrentStatus(payload.newStatus)
      setStatusHistory((prev) => [...prev, newEvent])

      // Update the order store so other components stay in sync
      if (currentOrder && currentOrder.id === orderId) {
        const updatedOrder: Order = {
          ...currentOrder,
          status: payload.newStatus,
          statusHistory: [...currentOrder.statusHistory, newEvent],
        }
        updateOrder(updatedOrder)
      }
    },
    [orderId, currentOrder, updateOrder]
  )

  const handleDriverLocationUpdated = useCallback(
    (payload: DriverLocationUpdatedPayload) => {
      if (payload.orderId !== orderId) return

      setDriverLocation({ lat: payload.lat, lng: payload.lng })
    },
    [orderId]
  )

  // Subscribe to socket events
  useEffect(() => {
    if (!socket || !isConnected) return

    socket.on('order:status_updated', handleStatusUpdated)
    socket.on('driver:location_updated', handleDriverLocationUpdated)

    return () => {
      socket.off('order:status_updated', handleStatusUpdated)
      socket.off('driver:location_updated', handleDriverLocationUpdated)
    }
  }, [socket, isConnected, handleStatusUpdated, handleDriverLocationUpdated])

  return {
    currentStatus,
    statusHistory,
    driverLocation,
    isConnected,
  }
}
