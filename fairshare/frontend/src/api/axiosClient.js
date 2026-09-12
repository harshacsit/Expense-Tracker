import axios from 'axios'

const rawBaseUrl = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://fairshare-backend-mvl7.onrender.com/api' : '/api')
const API_BASE_URL = rawBaseUrl.endsWith('/api') ? rawBaseUrl : `${rawBaseUrl.replace(/\/$/, '')}/api`

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token from localStorage on every request
axiosClient.interceptors.request.use((config) => {
  const stored = localStorage.getItem('fairshare_user')
  if (stored) {
    const user = JSON.parse(stored)
    if (user?.token) {
      config.headers.Authorization = `Bearer ${user.token}`
    }
  }
  return config
})

// Handle 401 globally — clear session and redirect to login
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('fairshare_user')
      localStorage.removeItem('fairshare_house')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default axiosClient
