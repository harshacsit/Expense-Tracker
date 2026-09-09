import axios from 'axios'

const axiosClient = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token from localStorage on every request
axiosClient.interceptors.request.use((config) => {
  const stored = localStorage.getItem('splitstay_user')
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
      localStorage.removeItem('splitstay_user')
      localStorage.removeItem('splitstay_house')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default axiosClient
