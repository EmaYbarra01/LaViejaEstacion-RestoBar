import React, { createContext, useState, useEffect } from 'react'
import apiClient from '../api/apiClient'
import ENDPOINTS from '../api/endpoints'
import { clearStoredAuthToken, getValidStoredAuthToken } from './authToken'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => {
    try {
      return getValidStoredAuthToken()
    } catch (e) {
      return null
    }
  })

  useEffect(() => {
    if (token) {
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`
      // intentar obtener perfil
      apiClient
        .get(ENDPOINTS.PROFILE)
        .then((res) => setUser(res.data))
        .catch(() => setUser(null))
    } else {
      delete apiClient.defaults.headers.common['Authorization']
      setUser(null)
      clearStoredAuthToken()
    }
  }, [token])

  const login = async (email, password) => {
    const res = await apiClient.post(ENDPOINTS.AUTH_LOGIN, { email, password })
    const data = res.data
    // backend debería devolver { accessToken, refreshToken?, user }
    const accessToken = data.accessToken || data.token || null
    if (accessToken) {
      try {
        // Guardar en ambas claves por compatibilidad
        clearStoredAuthToken()
        localStorage.setItem('accessToken', accessToken)
        localStorage.setItem('token', accessToken)
      } catch (e) {}
      setToken(accessToken)
    }
    if (data.user) setUser(data.user)
    return data
  }

  const logout = () => {
    try {
      clearStoredAuthToken()
    } catch (e) {}
    setToken(null)
    setUser(null)
    delete apiClient.defaults.headers.common['Authorization']
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}
