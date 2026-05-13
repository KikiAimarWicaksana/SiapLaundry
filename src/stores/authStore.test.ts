import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useAuthStore } from './authStore'
import type { AuthUser, LoginCredentials } from '@/types/user'

// Mock the api module
vi.mock('@/lib/api', () => ({
  default: {
    post: vi.fn(),
  },
}))

describe('authStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
    })
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('should have null user, null token, and isAuthenticated false', () => {
      const state = useAuthStore.getState()
      expect(state.user).toBeNull()
      expect(state.token).toBeNull()
      expect(state.isAuthenticated).toBe(false)
    })
  })

  describe('login', () => {
    it('should set user, token, and isAuthenticated on successful login', async () => {
      const mockUser: AuthUser = {
        id: '1',
        email: 'test@example.com',
        phone: '08123456789',
        name: 'Test User',
        role: 'buyer',
        isVerified: true,
      }

      const { default: api } = await import('@/lib/api')
      vi.mocked(api.post).mockResolvedValueOnce({
        data: { user: mockUser, token: 'jwt-token-123' },
      })

      const credentials: LoginCredentials = {
        emailOrPhone: 'test@example.com',
        password: 'password123',
        role: 'buyer',
      }

      await useAuthStore.getState().login(credentials)

      const state = useAuthStore.getState()
      expect(state.user).toEqual(mockUser)
      expect(state.token).toBe('jwt-token-123')
      expect(state.isAuthenticated).toBe(true)
    })

    it('should throw error on failed login', async () => {
      const { default: api } = await import('@/lib/api')
      vi.mocked(api.post).mockRejectedValueOnce(new Error('Invalid credentials'))

      const credentials: LoginCredentials = {
        emailOrPhone: 'wrong@example.com',
        password: 'wrongpass',
        role: 'buyer',
      }

      await expect(useAuthStore.getState().login(credentials)).rejects.toThrow(
        'Invalid credentials'
      )

      const state = useAuthStore.getState()
      expect(state.user).toBeNull()
      expect(state.isAuthenticated).toBe(false)
    })
  })

  describe('logout', () => {
    it('should clear user, token, and isAuthenticated', async () => {
      // Set initial authenticated state
      useAuthStore.setState({
        user: {
          id: '1',
          email: 'test@example.com',
          phone: '08123456789',
          name: 'Test User',
          role: 'buyer',
          isVerified: true,
        },
        token: 'jwt-token-123',
        isAuthenticated: true,
      })

      const { default: api } = await import('@/lib/api')
      vi.mocked(api.post).mockResolvedValueOnce({})

      await useAuthStore.getState().logout()

      const state = useAuthStore.getState()
      expect(state.user).toBeNull()
      expect(state.token).toBeNull()
      expect(state.isAuthenticated).toBe(false)
    })

    it('should clear state even if API call fails', async () => {
      useAuthStore.setState({
        user: {
          id: '1',
          email: 'test@example.com',
          phone: '08123456789',
          name: 'Test User',
          role: 'buyer',
          isVerified: true,
        },
        token: 'jwt-token-123',
        isAuthenticated: true,
      })

      const { default: api } = await import('@/lib/api')
      vi.mocked(api.post).mockRejectedValueOnce(new Error('Network error'))

      await useAuthStore.getState().logout()

      const state = useAuthStore.getState()
      expect(state.user).toBeNull()
      expect(state.token).toBeNull()
      expect(state.isAuthenticated).toBe(false)
    })
  })

  describe('refreshToken', () => {
    it('should update user and token on successful refresh', async () => {
      const mockUser: AuthUser = {
        id: '1',
        email: 'test@example.com',
        phone: '08123456789',
        name: 'Test User',
        role: 'seller',
        isVerified: true,
      }

      const { default: api } = await import('@/lib/api')
      vi.mocked(api.post).mockResolvedValueOnce({
        data: { user: mockUser, token: 'new-jwt-token' },
      })

      await useAuthStore.getState().refreshToken()

      const state = useAuthStore.getState()
      expect(state.user).toEqual(mockUser)
      expect(state.token).toBe('new-jwt-token')
      expect(state.isAuthenticated).toBe(true)
    })

    it('should clear state on failed refresh', async () => {
      useAuthStore.setState({
        user: {
          id: '1',
          email: 'test@example.com',
          phone: '08123456789',
          name: 'Test User',
          role: 'buyer',
          isVerified: true,
        },
        token: 'old-token',
        isAuthenticated: true,
      })

      const { default: api } = await import('@/lib/api')
      vi.mocked(api.post).mockRejectedValueOnce(new Error('Refresh failed'))

      await useAuthStore.getState().refreshToken()

      const state = useAuthStore.getState()
      expect(state.user).toBeNull()
      expect(state.token).toBeNull()
      expect(state.isAuthenticated).toBe(false)
    })
  })

  describe('setUser', () => {
    it('should set user and mark as authenticated', () => {
      const mockUser: AuthUser = {
        id: '2',
        email: 'driver@example.com',
        phone: '08198765432',
        name: 'Driver User',
        role: 'driver',
        isVerified: true,
      }

      useAuthStore.getState().setUser(mockUser)

      const state = useAuthStore.getState()
      expect(state.user).toEqual(mockUser)
      expect(state.isAuthenticated).toBe(true)
    })

    it('should clear user and mark as not authenticated when null', () => {
      useAuthStore.setState({
        user: {
          id: '1',
          email: 'test@example.com',
          phone: '08123456789',
          name: 'Test User',
          role: 'buyer',
          isVerified: true,
        },
        isAuthenticated: true,
      })

      useAuthStore.getState().setUser(null)

      const state = useAuthStore.getState()
      expect(state.user).toBeNull()
      expect(state.isAuthenticated).toBe(false)
    })
  })
})
