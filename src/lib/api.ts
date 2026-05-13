import axios from 'axios'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
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

    if (error.response?.status === 401 && !originalRequest._retry) {
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
