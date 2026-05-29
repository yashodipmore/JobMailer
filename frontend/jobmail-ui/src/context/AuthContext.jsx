import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import api, { storeToken } from '../services/api.js'

const AuthContext = createContext(null)
const tokenKey = 'jobmail_token'

export function AuthProvider({ children }) {
  const hasToken = Boolean(localStorage.getItem(tokenKey))
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(hasToken)

  const refresh = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/api/auth/me')
      setUser(data)
    } catch {
      storeToken(null)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!hasToken) {
      return
    }

    api
      .get('/api/auth/me')
      .then(({ data }) => setUser(data))
      .catch(() => {
        storeToken(null)
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [hasToken])

  const login = async (email, password) => {
    const { data } = await api.post('/api/auth/login', { email, password })
    storeToken(data.token)
    setUser(data.user)
    return data
  }

  const register = async (payload) => {
    const { data } = await api.post('/api/auth/register', payload)
    storeToken(data.token)
    setUser(data.user)
    return data
  }

  const logout = () => {
    storeToken(null)
    setUser(null)
  }

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      logout,
      refresh,
    }),
    [user, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
