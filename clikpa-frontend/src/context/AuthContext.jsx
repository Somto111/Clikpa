import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api, getAuthToken, setAuthToken } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(() => getAuthToken())
  const [user, setUser] = useState(null)
  const [loadingProfile, setLoadingProfile] = useState(() => Boolean(getAuthToken()))

  const refreshProfile = useCallback(async () => {
    const activeToken = getAuthToken()
    if (!activeToken) {
      setUser(null)
      setLoadingProfile(false)
      return null
    }
    setLoadingProfile(true)
    try {
      const profile = await api.getMe()
      setUser(profile)
      return profile
    } catch {
      setAuthToken(null)
      setTokenState(null)
      setUser(null)
      return null
    } finally {
      setLoadingProfile(false)
    }
  }, [])

  useEffect(() => {
    if (token) {
      refreshProfile()
    }
  }, [token, refreshProfile])

  const completeSignIn = useCallback((nextToken, nextUser) => {
    setAuthToken(nextToken)
    setTokenState(nextToken)
    setUser(nextUser || null)
  }, [])

  const signOut = useCallback(() => {
    setAuthToken(null)
    setTokenState(null)
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      loadingProfile,
      completeSignIn,
      signOut,
      refreshProfile,
      setUser,
    }),
    [token, user, loadingProfile, completeSignIn, signOut, refreshProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
