import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axiosClient from '../api/axiosClient'
import toast from 'react-hot-toast'
import { LogIn, Mail, Lock, Home, Eye, EyeOff } from 'lucide-react'
import Orb from '../components/Orb'

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
)

export default function Login() {
  const [searchParams] = useSearchParams()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const oauthError = searchParams.get('error')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) return toast.error('Please fill in all fields')

    setLoading(true)
    try {
      const { data } = await axiosClient.post('/auth/login', form)
      login(data)
      toast.success(`Welcome back, ${data.name}! 🏠`)
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    window.location.href = `${BACKEND_URL}/api/auth/google`
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 overflow-hidden">
      {/* Interactive Glowing Orb WebGL Background */}
      <div className="fixed inset-0 pointer-events-auto z-0 flex items-center justify-center overflow-hidden">
        <Orb
          hoverIntensity={0.5}
          rotateOnHover={true}
          hue={0}
          forceHoverState={false}
          backgroundColor="#000000"
        />
      </div>

      <div className="w-full max-w-md animate-fade-in relative z-10 my-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4" style={{background: 'linear-gradient(135deg, #6070f5 0%, #a855f7 100%)'}}>
            <Home className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gradient">SplitStay</h1>
          <p className="text-white/40 text-sm mt-1">Shared roommate expense tracking</p>
        </div>

        {/* OAuth error banner */}
        {oauthError && (
          <div className="mb-4 px-4 py-3 rounded-xl text-sm text-red-400 border border-red-500/30" style={{ background: 'rgba(239,68,68,0.1)' }}>
            <p className="font-semibold">Google sign-in failed</p>
            <p className="text-xs text-red-400/80 mt-0.5">
              {oauthError === 'oauth_failed'
                ? 'Authentication could not be completed. Please make sure this Google account is added under Test Users in Google Cloud Console.'
                : decodeURIComponent(oauthError)}
            </p>
          </div>
        )}

        {/* Card */}
        <div className="glass rounded-2xl p-8">
          <h2 className="text-xl font-bold mb-1">Welcome back</h2>
          <p className="text-white/40 text-sm mb-6">Sign in to your account</p>

          {/* Google Sign-In */}
          <button
            id="google-login"
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-white/10 text-white/80 text-sm font-medium transition-all duration-200 mb-4 hover:border-white/20 hover:bg-white/5"
          >
            <GoogleIcon />
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-white/8" />
            <span className="text-white/25 text-xs font-medium">or sign in with email</span>
            <div className="flex-1 h-px bg-white/8" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="label">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  id="login-email"
                  type="email"
                  className="input pl-10"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="login-password" className="label !mb-0">Password</label>
                <Link
                  to="/forgot-password"
                  id="forgot-password-link"
                  className="text-xs text-brand-400 hover:text-brand-300 transition-colors font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  className="input pl-10 pr-10"
                  placeholder="Your password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-white/40 text-sm mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
              Sign up free
            </Link>
          </p>
        </div>

        {/* Demo hint */}
        <div className="mt-4 glass rounded-xl p-3 text-center">
          <p className="text-white/30 text-xs">
            Demo: <span className="text-white/50">anith@sunrise.com / password123</span>
          </p>
        </div>
      </div>
    </div>
  )
}
