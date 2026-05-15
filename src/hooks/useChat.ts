"use client"

import { useEffect, useCallback, useState, useRef } from 'react'
import { useAuthStore } from '@/stores/authStore'
import api from '@/lib/api'
import type { Message } from '@/types/chat'

export interface UseChatReturn {
  messages: Message[]
  sendMessage: (content: string, receiverId: string) => Promise<void>
  isConnected: boolean
  markAsRead: () => void
  loading: boolean
}

export function useChat(orderId: string, receiverId?: string): UseChatReturn {
  const user = useAuthStore((state) => state.user)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [isConnected, setIsConnected] = useState(true)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const lastCountRef = useRef(0)

  const fetchMessages = useCallback(async () => {
    if (!orderId) return
    try {
      const res = await api.get(`/chat/${orderId}${receiverId ? `?receiverId=${receiverId}` : ''}`)
      const data: Message[] = res.data.data ?? []
      setMessages(data)
      lastCountRef.current = data.length
      setIsConnected(true)
    } catch {
      setIsConnected(false)
    }
  }, [orderId, receiverId])

  // Load messages saat orderId berubah
  useEffect(() => {
    if (!orderId) {
      setMessages([])
      return
    }
    setLoading(true)
    fetchMessages().finally(() => setLoading(false))

    // Poll setiap 3 detik untuk pesan baru
    pollRef.current = setInterval(fetchMessages, 3000)

    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [orderId, fetchMessages])

  const sendMessage = useCallback(async (content: string, receiverId: string) => {
    if (!content.trim() || !orderId || !user) return

    // Optimistic update
    const optimistic: Message = {
      id: `temp-${Date.now()}`,
      senderId: user.id,
      senderName: user.name,
      senderAvatar: user.profilePhoto ?? undefined,
      content: content.trim(),
      timestamp: new Date().toISOString(),
      isRead: false,
    }
    setMessages((prev) => [...prev, optimistic])

    try {
      const res = await api.post(`/chat/${orderId}`, {
        message: content.trim(),
        receiverId: Number(receiverId),
      })
      // Ganti optimistic dengan data real
      setMessages((prev) =>
        prev.map((m) => (m.id === optimistic.id ? res.data.data : m))
      )
    } catch {
      // Hapus optimistic jika gagal
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id))
    }
  }, [orderId, user])

  const markAsRead = useCallback(() => {
    // Sudah di-handle di GET endpoint
  }, [])

  return { messages, sendMessage, isConnected, markAsRead, loading }
}
