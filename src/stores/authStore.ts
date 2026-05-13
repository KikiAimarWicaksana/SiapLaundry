import { create } from 'zustand'
import type { AuthUser, LoginCredentials } from '@/types/user'

export interface AuthStoreState {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
}

export interface AuthStoreActions {
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
  refreshToken: () => Promise<void>
  setUser: (user: AuthUser | null) => void
}

export type AuthStore = AuthStoreState & AuthStoreActions

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  login: async (credentials: LoginCredentials) => {
    const { default: api } = await import('@/lib/api')

    const response = await api.post('/auth/login', credentials)
    // API response format: { success, data: { user, token }, message }
    const payload = response.data.data ?? response.data
    const { user, token } = payload

    set({
      user,
      token,
      isAuthenticated: true,
    })
  },

  logout: async () => {
    try {
      const { default: api } = await import('@/lib/api')
      // Call API to clear httpOnly cookie server-side
      await api.post('/auth/logout')
    } catch {
      // Clear state even if API call fails
    }

    set({
      user: null,
      token: null,
      isAuthenticated: false,
    })

    // Redirect to landing page
    if (typeof window !== 'undefined') {
      window.location.href = '/'
    }
  },

  refreshToken: async () => {
    try {
      const { default: api } = await import('@/lib/api')
      const response = await api.post('/auth/refresh')
      const payload = response.data.data ?? response.data
      const { user, token } = payload

      set({
        user,
        token,
        isAuthenticated: true,
      })
    } catch {
      // If refresh fails, clear auth state
      set({
        user: null,
        token: null,
        isAuthenticated: false,
      })
    }
  },

  setUser: (user: AuthUser | null) => {
    set({
      user,
      isAuthenticated: user !== null,
    })
  },
}))
