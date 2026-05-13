"use client"

import { useEffect, useCallback } from 'react'
import { useSocket } from '@/hooks/useSocket'
import { useNotificationStore } from '@/stores/notificationStore'
import { useToast } from '@/components/ui/Toast'
import type { Notification } from '@/types/chat'

interface NotificationNewPayload {
  id: string
  title: string
  message: string
  type: 'order' | 'chat' | 'review' | 'system'
  relatedId?: string
  createdAt: string
}

interface OrderStatusUpdatedPayload {
  orderId: string
  newStatus: string
  actorName?: string
}

/** Map order status to human-readable Indonesian labels */
const STATUS_LABELS: Record<string, string> = {
  pending_pickup: 'Menunggu Penjemputan',
  driver_on_way_pickup: 'Kurir Menuju Lokasi',
  picked_up: 'Sudah Dijemput',
  at_laundry: 'Di Laundry',
  washing: 'Sedang Dicuci',
  ready_for_delivery: 'Siap Diantar',
  driver_on_way_delivery: 'Kurir Mengantar',
  delivered: 'Sudah Diantar',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
}

/**
 * Custom hook for real-time notifications via Socket.io.
 * - Subscribes to `notification:new` event and adds to notificationStore
 * - Shows toast via useToast when a new notification arrives
 * - Subscribes to `order:status_updated` to show status change toasts
 *
 * Should be activated in a root layout or provider component.
 *
 * Validates: Requirements 17.1, 17.2, 17.3, 17.4, 17.5, 17.6, 17.7
 */
export function useNotifications(): void {
  const { socket, isConnected } = useSocket()
  const addNotification = useNotificationStore((state) => state.addNotification)
  const { addToast } = useToast()

  const handleNewNotification = useCallback(
    (payload: NotificationNewPayload) => {
      const notification: Notification = {
        id: payload.id,
        title: payload.title,
        message: payload.message,
        type: payload.type,
        relatedId: payload.relatedId,
        isRead: false,
        createdAt: payload.createdAt,
      }

      addNotification(notification)
      addToast(payload.message, 'info')
    },
    [addNotification, addToast]
  )

  const handleOrderStatusUpdated = useCallback(
    (payload: OrderStatusUpdatedPayload) => {
      const statusLabel = STATUS_LABELS[payload.newStatus] ?? payload.newStatus
      const message = `Status pesanan diperbarui: ${statusLabel}`

      addToast(message, 'success')
    },
    [addToast]
  )

  useEffect(() => {
    if (!socket || !isConnected) return

    socket.on('notification:new', handleNewNotification)
    socket.on('order:status_updated', handleOrderStatusUpdated)

    return () => {
      socket.off('notification:new', handleNewNotification)
      socket.off('order:status_updated', handleOrderStatusUpdated)
    }
  }, [socket, isConnected, handleNewNotification, handleOrderStatusUpdated])
}
