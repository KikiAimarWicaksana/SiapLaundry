"use client"

import { useEffect, useState, useCallback, useRef } from 'react'
import { Socket } from 'socket.io-client'
import { connectSocket, disconnectSocket, getSocket } from '@/lib/socket'
import { useAuthStore } from '@/stores/authStore'

export interface UseSocketReturn {
  socket: Socket | null
  isConnected: boolean
  connect: () => void
  disconnect: () => void
}

/**
 * Custom hook for managing Socket.io connection.
 * Auto-connects when user is authenticated, auto-disconnects on unmount or logout.
 * Tracks connection status and provides manual connect/disconnect controls.
 */
export function useSocket(): UseSocketReturn {
  const [isConnected, setIsConnected] = useState(false)
  const [socket, setSocket] = useState<Socket | null>(null)
  const token = useAuthStore((state) => state.token)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const socketRef = useRef<Socket | null>(null)

  const connect = useCallback(() => {
    if (!token) return

    const s = connectSocket(token)
    socketRef.current = s
    setSocket(s)
  }, [token])

  const disconnect = useCallback(() => {
    disconnectSocket()
    socketRef.current = null
    setSocket(null)
    setIsConnected(false)
  }, [])

  // Auto-connect when authenticated, auto-disconnect on logout or unmount
  useEffect(() => {
    if (isAuthenticated && token) {
      connect()
    } else {
      disconnect()
    }

    return () => {
      disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, token])

  // Listen for connection status changes
  useEffect(() => {
    const s = socketRef.current ?? getSocket()

    const handleConnect = () => setIsConnected(true)
    const handleDisconnect = () => setIsConnected(false)

    s.on('connect', handleConnect)
    s.on('disconnect', handleDisconnect)

    // Set initial state if already connected
    if (s.connected) {
      setIsConnected(true)
    }

    return () => {
      s.off('connect', handleConnect)
      s.off('disconnect', handleDisconnect)
    }
  }, [socket])

  return { socket, isConnected, connect, disconnect }
}
