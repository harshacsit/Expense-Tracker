import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import axiosClient from './api/axiosClient'

import AppLayout from './components/AppLayout'

import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import Register from './pages/Register'
import HouseSetup from './pages/HouseSetup'
import Dashboard from './pages/Dashboard'
import Expenses from './pages/Expenses'
import Balances from './pages/Balances'
import Members from './pages/Members'
import SettleUp from './pages/SettleUp'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import OAuthCallback from './pages/OAuthCallback'

// Protected route wrapper — waits for auth to load before deciding
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return null
  return user ? children : <Navigate to="/login" replace />
}

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return null
  return !user ? children : <Navigate to="/dashboard" replace />
}

export default function App() {
  const { user } = useAuth()
  const [house, setHouse] = useState(() => {
    const stored = localStorage.getItem('splitstay_house')
    return stored ? JSON.parse(stored) : null
  })
  const [houses, setHouses] = useState([])

  // Sync user's houses on auth state change
  useEffect(() => {
    if (user) {
      axiosClient
        .get('/houses')
        .then(({ data }) => {
          setHouses(data)
          if (!house && data.length > 0) {
            setHouse(data[0])
            localStorage.setItem('splitstay_house', JSON.stringify(data[0]))
          }
        })
        .catch(() => {})
    }
  }, [user, house])

  const handleSelectHouse = (h) => {
    setHouse(h)
    localStorage.setItem('splitstay_house', JSON.stringify(h))
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
      <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />
      <Route path="/oauth/callback" element={<OAuthCallback />} />

      {/* Room setup */}
      <Route path="/setup" element={<PrivateRoute><HouseSetup onSelectHouse={handleSelectHouse} /></PrivateRoute>} />

      {/* Main Application Pages inside unified Light SaaS AppLayout Shell */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <AppLayout house={house} houses={houses} onSelectHouse={handleSelectHouse}>
              <Dashboard house={house} houses={houses} onSelectHouse={handleSelectHouse} />
            </AppLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/expenses"
        element={
          <PrivateRoute>
            <AppLayout house={house} houses={houses} onSelectHouse={handleSelectHouse}>
              <Expenses house={house} />
            </AppLayout>
          </PrivateRoute>
        }
      />
      <Route path="/history" element={<Navigate to="/expenses" replace />} />
      <Route
        path="/balances"
        element={
          <PrivateRoute>
            <AppLayout house={house} houses={houses} onSelectHouse={handleSelectHouse}>
              <Balances house={house} />
            </AppLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/members"
        element={
          <PrivateRoute>
            <AppLayout house={house} houses={houses} onSelectHouse={handleSelectHouse}>
              <Members house={house} />
            </AppLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/settle-up"
        element={
          <PrivateRoute>
            <AppLayout house={house} houses={houses} onSelectHouse={handleSelectHouse}>
              <SettleUp house={house} />
            </AppLayout>
          </PrivateRoute>
        }
      />

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
