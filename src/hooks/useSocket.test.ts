import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useSocket } from './useSocket'
import { connectSocket, disconnectSocket } from '@/lib/socket'

// Mock socket.io-client
const mockSocket = {
  connected: false,
  auth: {} as Record<string, string>,
  connect: vi.fn(),
  disconnect: vi.fn(),
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

// Mock the socket lib
vi.mock('@/lib/socket', () => ({
  connectSocket: vi.fn((_token: string) => {
    return mockSocket
  }),
  disconnectSocket: vi.fn(),
  getSocket: vi.fn(() => mockSocket),
}))

// Mock auth store
let mockToken: string | null = null
let mockIsAuthenticated = false

vi.mock('@/stores/authStore', () => ({
  useAuthStore: vi.fn((selector: (state: { token: string | null; isAuthenticated: boolean }) => unknown) =>
    selector({ token: mockToken, isAuthenticated: mockIsAuthenticated })
  ),
}))

describe('useSocket', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockToken = null
    mockIsAuthenticated = false
    mockSocket.connected = false
    Object.keys(eventListeners).forEach((key) => delete eventListeners[key])
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns initial state with no connection when not authenticated', () => {
    const { result } = renderHook(() => useSocket())

    expect(result.current.socket).toBeNull()
    expect(result.current.isConnected).toBe(false)
    expect(typeof result.current.connect).toBe('function')
    expect(typeof result.current.disconnect).toBe('function')
  })

  it('auto-connects when user is authenticated', () => {
    mockToken = 'test-jwt-token'
    mockIsAuthenticated = true

    renderHook(() => useSocket())

    expect(connectSocket).toHaveBeenCalledWith('test-jwt-token')
  })

  it('does not connect when token is missing', () => {
    mockToken = null
    mockIsAuthenticated = false

    renderHook(() => useSocket())

    expect(connectSocket).not.toHaveBeenCalled()
  })

  it('tracks connection status via socket events', () => {
    mockToken = 'test-jwt-token'
    mockIsAuthenticated = true

    const { result } = renderHook(() => useSocket())

    expect(result.current.isConnected).toBe(false)

    // Simulate socket connect event
    act(() => {
      emitEvent('connect')
    })

    expect(result.current.isConnected).toBe(true)

    // Simulate socket disconnect event
    act(() => {
      emitEvent('disconnect')
    })

    expect(result.current.isConnected).toBe(false)
  })

  it('disconnects on unmount', () => {
    mockToken = 'test-jwt-token'
    mockIsAuthenticated = true

    const { unmount } = renderHook(() => useSocket())

    vi.mocked(disconnectSocket).mockClear()

    unmount()

    expect(disconnectSocket).toHaveBeenCalled()
  })

  it('manual connect does nothing without token', () => {
    mockToken = null
    mockIsAuthenticated = false

    const { result } = renderHook(() => useSocket())

    vi.mocked(connectSocket).mockClear()

    act(() => {
      result.current.connect()
    })

    expect(connectSocket).not.toHaveBeenCalled()
  })

  it('manual disconnect calls disconnectSocket', () => {
    mockToken = 'test-jwt-token'
    mockIsAuthenticated = true

    const { result } = renderHook(() => useSocket())

    vi.mocked(disconnectSocket).mockClear()

    act(() => {
      result.current.disconnect()
    })

    expect(disconnectSocket).toHaveBeenCalled()
    expect(result.current.isConnected).toBe(false)
  })
})
