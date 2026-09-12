import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import HouseSetup from './pages/HouseSetup'
import Dashboard from './pages/Dashboard'
import History from './pages/History'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import OAuthCallback from './pages/OAuthCallback'
import LandingPage from './pages/LandingPage'
import Expenses from './pages/Expenses'
import Balances from './pages/Balances'
import Members from './pages/Members'
import SettleUp from './pages/SettleUp'

// Protected route wrapper — waits for auth to load before deciding
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return null // AuthProvider already renders a spinner while loading
  return user ? children : <Navigate to="/login" replace />
}

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return null
  return !user ? children : <Navigate to="/dashboard" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
      <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />
      {/* OAuth callback — must be public and NOT redirect if already logged in */}
      <Route path="/oauth/callback" element={<OAuthCallback />} />
      <Route path="/setup" element={<PrivateRoute><HouseSetup /></PrivateRoute>} />
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/history" element={<PrivateRoute><History /></PrivateRoute>} />
      <Route path="/expenses" element={<PrivateRoute><Expenses /></PrivateRoute>} />
      <Route path="/balances" element={<PrivateRoute><Balances /></PrivateRoute>} />
      <Route path="/members" element={<PrivateRoute><Members /></PrivateRoute>} />
      <Route path="/settle-up" element={<PrivateRoute><SettleUp /></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
