"use client"

import { useEffect, useCallback, useMemo } from 'react'
import { useSocket } from '@/hooks/useSocket'
import { useChatStore } from '@/stores/chatStore'
import { useAuthStore } from '@/stores/authStore'
import type { Message } from '@/types/chat'

export interface UseChatReturn {
  messages: Message[]
  sendMessage: (content: string) => void
  isConnected: boolean
  markAsRead: () => void
}

const EMPTY_MESSAGES: Message[] = []

export function useChat(orderId: string, contactId: string): UseChatReturn {
  const { socket, isConnected } = useSocket()
  const user = useAuthStore((state) => state.user)

  const allMessages = useChatStore((state) => state.messages)
  const addMessage = useChatStore((state) => state.addMessage)
  const markAsReadInStore = useChatStore((state) => state.markAsRead)

  // Stable reference — avoid new array on every render when contactId is empty
  const messages = useMemo(
    () => (contactId ? allMessages[contactId] ?? EMPTY_MESSAGES : EMPTY_MESSAGES),
    [allMessages, contactId]
  )

  // Subscribe to incoming messages
  useEffect(() => {
    if (!socket) return

    const handleNewMessage = (message: Message) => {
      // Only add messages for this contact/conversation
      if (message.senderId === contactId) {
        addMessage(contactId, message)
      }
    }

    socket.on('chat:new_message', handleNewMessage)

    return () => {
      socket.off('chat:new_message', handleNewMessage)
    }
  }, [socket, contactId, addMessage])

  // Send a message with optimistic update
  const sendMessage = useCallback(
    (content: string) => {
      if (!socket || !user || !content.trim()) return

      const optimisticMessage: Message = {
        id: `temp-${Date.now()}`,
        senderId: user.id,
        senderName: user.name,
        senderAvatar: user.profilePhoto,
        content: content.trim(),
        timestamp: new Date().toISOString(),
        isRead: false,
      }

      // Optimistic update: add message to store immediately
      addMessage(contactId, optimisticMessage)

      // Emit to server
      socket.emit('chat:send_message', {
        orderId,
        contactId,
        content: content.trim(),
      })
    },
    [socket, user, contactId, orderId, addMessage]
  )

  // Mark all messages from this contact as read
  const markAsRead = useCallback(() => {
    if (!socket) return

    // Update store locally
    markAsReadInStore(contactId)

    // Emit to server
    socket.emit('chat:mark_read', {
      orderId,
      contactId,
    })
  }, [socket, contactId, orderId, markAsReadInStore])

  return { messages, sendMessage, isConnected, markAsRead }
}
