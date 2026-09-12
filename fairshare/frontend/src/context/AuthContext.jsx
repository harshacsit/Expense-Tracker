// @refresh reset
import { createContext, useContext, useState, useEffect } from 'react'


const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Restore session from localStorage
    const stored = localStorage.getItem('fairshare_user') || localStorage.getItem('splitstay_user')
    if (stored) {
      try {
        setUser(JSON.parse(stored))
      } catch {
        localStorage.removeItem('fairshare_user')
        localStorage.removeItem('splitstay_user')
      }
    }
    setLoading(false)
  }, [])

  const login = (userData) => {
    setUser(userData)
    localStorage.setItem('fairshare_user', JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('fairshare_user')
    localStorage.removeItem('fairshare_house')
    localStorage.removeItem('splitstay_user')
    localStorage.removeItem('splitstay_house')
  }

  // Render the Provider unconditionally so useAuth() is always available.
  // Show a full-screen spinner while restoring auth state from localStorage.
  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {loading ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
