import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authApi } from '../api/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true) // checking session on mount

  // Check existing session on load
  useEffect(() => {
    authApi.me()
      .then((res) => setUser(res.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (email, password) => {
    await authApi.login({ email, password })
    const { data } = await authApi.me()
    setUser(data)
    return data
  }, [])

  const register = useCallback(async (payload) => {
    await authApi.registerTenant(payload)
    const { data } = await authApi.me()
    setUser(data)
    return data
  }, [])

  const logout = useCallback(async () => {
    await authApi.logout()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}