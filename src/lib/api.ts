import axios from 'axios'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
  withCredentials: true, // Send httpOnly cookies with every request
  headers: {
    'Content-Type': 'application/json',
  },
})

// Response interceptor for handling 401 (token expired)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Don't retry for auth endpoints (login, refresh, logout, me) to prevent infinite loop
    const url = originalRequest?.url || ''
    const isAuthEndpoint =
      url.includes('/auth/login') ||
      url.includes('/auth/refresh') ||
      url.includes('/auth/logout') ||
      url.includes('/auth/register')

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true

      try {
        // Attempt to refresh the token
        await api.post('/auth/refresh')
        // Retry the original request
        return api(originalRequest)
      } catch {
        // Refresh failed — redirect to login will be handled by the auth store
        return Promise.reject(error)
      }
    }

    return Promise.reject(error)
  }
)

export default api
