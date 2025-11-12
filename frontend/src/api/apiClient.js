import axios from 'axios'
import { API_BASE } from '../config/api'

const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
})

// Añade token desde localStorage en cada request si existe
apiClient.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers = config.headers || {}
      config.headers['Authorization'] = `Bearer ${token}`
    }
  } catch (e) {
    // ignore
  }
  return config
})

// Manejo básico de respuestas (redirigir en 401)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      try {
        localStorage.removeItem('accessToken')
      } catch (e) {}
      // opcional: redirigir a /login
      if (typeof window !== 'undefined') window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

export default apiClient
