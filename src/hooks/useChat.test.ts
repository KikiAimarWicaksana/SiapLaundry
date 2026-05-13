import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useChat } from './useChat'

// Mock socket instance
const mockSocket = {
  connected: true,
  on: vi.fn(),
  off: vi.fn(),
  emit: vi.fn(),
}

// Track event listeners for simulating events
const eventListeners: Record<string, Array<(...args: unknown[]) => void>> = {}

mockSocket.on.mockImplementation((event: string, handler: (...args: unknown[]) => void) => {
  if (!eventListeners[event]) eventListeners[event] = []
  eventListeners[event].push(handler)
})

mockSocket.off.mockImplementation((event: string, handler: (...args: unknown[]) => void) => {
  if (eventListeners[event]) {
    eventListeners[event] = eventListeners[event].filter((h) => h !== handler)
  }
})

function emitEvent(event: string, ...args: unknown[]) {
  eventListeners[event]?.forEach((handler) => handler(...args))
}

// Mock useSocket
vi.mock('@/hooks/useSocket', () => ({
  useSocket: vi.fn(() => ({
    socket: mockSocket,
    isConnected: true,
    connect: vi.fn(),
    disconnect: vi.fn(),
  })),
}))

// Mock auth store
const mockUser = {
  id: 'user-1',
  name: 'Test User',
  email: 'test@example.com',
  phone: '08123456789',
  role: 'buyer' as const,
  profilePhoto: 'https://example.com/avatar.jpg',
  isVerified: true,
}

vi.mock('@/stores/authStore', () => ({
  useAuthStore: vi.fn((selector: (state: { user: typeof mockUser }) => unknown) =>
    selector({ user: mockUser })
  ),
}))

// Mock chat store
let mockMessages: Record<string, unknown[]> = {}
const mockAddMessage = vi.fn((contactId: string, message: unknown) => {
  if (!mockMessages[contactId]) mockMessages[contactId] = []
  mockMessages[contactId].push(message)
})
const mockMarkAsRead = vi.fn()

vi.mock('@/stores/chatStore', () => ({
  useChatStore: vi.fn((selector: (state: {
    messages: Record<string, unknown[]>
    addMessage: typeof mockAddMessage
    markAsRead: typeof mockMarkAsRead
  }) => unknown) =>
    selector({
      messages: mockMessages,
      addMessage: mockAddMessage,
      markAsRead: mockMarkAsRead,
    })
  ),
}))

describe('useChat', () => {
  const orderId = 'order-123'
  const contactId = 'contact-456'

  beforeEach(() => {
    vi.clearAllMocks()
    mockMessages = {}
    Object.keys(eventListeners).forEach((key) => delete eventListeners[key])
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns initial state with empty messages', () => {
    const { result } = renderHook(() => useChat(orderId, contactId))

    expect(result.current.messages).toEqual([])
    expect(result.current.isConnected).toBe(true)
    expect(typeof result.current.sendMessage).toBe('function')
    expect(typeof result.current.markAsRead).toBe('function')
  })

  it('subscribes to chat:new_message event on mount', () => {
    renderHook(() => useChat(orderId, contactId))

    expect(mockSocket.on).toHaveBeenCalledWith('chat:new_message', expect.any(Function))
  })

  it('unsubscribes from chat:new_message event on unmount', () => {
    const { unmount } = renderHook(() => useChat(orderId, contactId))

    unmount()

    expect(mockSocket.off).toHaveBeenCalledWith('chat:new_message', expect.any(Function))
  })

  it('adds incoming messages from the contact to the store', () => {
    renderHook(() => useChat(orderId, contactId))

    const incomingMessage = {
      id: 'msg-1',
      senderId: contactId,
      senderName: 'Laundry Owner',
      content: 'Hello!',
      timestamp: '2024-01-01T10:00:00Z',
      isRead: false,
    }

    act(() => {
      emitEvent('chat:new_message', incomingMessage)
    })

    expect(mockAddMessage).toHaveBeenCalledWith(contactId, incomingMessage)
  })

  it('ignores messages from other senders', () => {
    renderHook(() => useChat(orderId, contactId))

    const otherMessage = {
      id: 'msg-2',
      senderId: 'other-user',
      senderName: 'Other User',
      content: 'Not for me',
      timestamp: '2024-01-01T10:00:00Z',
      isRead: false,
    }

    act(() => {
      emitEvent('chat:new_message', otherMessage)
    })

    expect(mockAddMessage).not.toHaveBeenCalled()
  })

  it('sends a message with optimistic update', () => {
    const { result } = renderHook(() => useChat(orderId, contactId))

    act(() => {
      result.current.sendMessage('Hello from buyer!')
    })

    // Should add message to store (optimistic update)
    expect(mockAddMessage).toHaveBeenCalledWith(
      contactId,
      expect.objectContaining({
        senderId: 'user-1',
        senderName: 'Test User',
        content: 'Hello from buyer!',
        isRead: false,
      })
    )

    // Should emit to server
    expect(mockSocket.emit).toHaveBeenCalledWith('chat:send_message', {
      orderId,
      contactId,
      content: 'Hello from buyer!',
    })
  })

  it('does not send empty messages', () => {
    const { result } = renderHook(() => useChat(orderId, contactId))

    act(() => {
      result.current.sendMessage('')
    })

    expect(mockAddMessage).not.toHaveBeenCalled()
    expect(mockSocket.emit).not.toHaveBeenCalled()
  })

  it('does not send whitespace-only messages', () => {
    const { result } = renderHook(() => useChat(orderId, contactId))

    act(() => {
      result.current.sendMessage('   ')
    })

    expect(mockAddMessage).not.toHaveBeenCalled()
    expect(mockSocket.emit).not.toHaveBeenCalled()
  })

  it('trims message content before sending', () => {
    const { result } = renderHook(() => useChat(orderId, contactId))

    act(() => {
      result.current.sendMessage('  Hello!  ')
    })

    expect(mockAddMessage).toHaveBeenCalledWith(
      contactId,
      expect.objectContaining({
        content: 'Hello!',
      })
    )

    expect(mockSocket.emit).toHaveBeenCalledWith('chat:send_message', {
      orderId,
      contactId,
      content: 'Hello!',
    })
  })

  it('marks messages as read in store and emits to server', () => {
    const { result } = renderHook(() => useChat(orderId, contactId))

    act(() => {
      result.current.markAsRead()
    })

    // Should update store
    expect(mockMarkAsRead).toHaveBeenCalledWith(contactId)

    // Should emit to server
    expect(mockSocket.emit).toHaveBeenCalledWith('chat:mark_read', {
      orderId,
      contactId,
    })
  })

  it('generates optimistic message with temp id and current timestamp', () => {
    vi.spyOn(Date, 'now').mockReturnValue(1704067200000)

    const { result } = renderHook(() => useChat(orderId, contactId))

    act(() => {
      result.current.sendMessage('Test message')
    })

    expect(mockAddMessage).toHaveBeenCalledWith(
      contactId,
      expect.objectContaining({
        id: 'temp-1704067200000',
        senderAvatar: 'https://example.com/avatar.jpg',
      })
    )

    vi.restoreAllMocks()
  })
})
