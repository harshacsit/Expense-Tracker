import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axiosClient from '../api/axiosClient'
import toast from 'react-hot-toast'
import { Mail, Lock, Home, Eye, EyeOff } from 'lucide-react'

const rawBackend = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://fairshare-backend-mvl7.onrender.com' : 'http://localhost:5000')
const BACKEND_URL = rawBackend.replace(/\/api\/?$/, '')

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
  const [rememberMe, setRememberMe] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const oauthError = searchParams.get('error')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email.trim() || !form.password) return toast.error('Please fill in all fields')

    setLoading(true)
    try {
      const { data } = await axiosClient.post('/auth/login', {
        email: form.email.trim().toLowerCase(),
        password: form.password,
      })
      login(data)
      toast.success(`Welcome back, ${data.name}! ≡ƒÅá`)
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    window.location.href = `${BACKEND_URL}/api/auth/google`
  }

  return (
    <div className="min-h-screen bg-[#F7F4EE] flex items-center justify-center p-4">
      <div className="w-full max-w-md my-8">
        {/* Logo & Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#5F402B] text-white mb-3 shadow-md">
            <Home className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#172033] tracking-tight">Welcome back</h1>
          <p className="text-[#687080] text-sm mt-1">Sign in to continue to your house</p>
        </div>

        {/* OAuth Error Banner */}
        {oauthError && (
          <div className="mb-4 px-4 py-3 rounded-xl text-xs text-[#D65B57] bg-[#FDF0EF] border border-[#F6CBC9]">
            <p className="font-semibold">Google sign-in failed</p>
            <p className="text-[#D65B57] mt-0.5">
              {oauthError === 'oauth_failed'
                ? 'Authentication could not be completed. Please ensure this Google account is added under Test Users.'
                : decodeURIComponent(oauthError)}
            </p>
          </div>
        )}

        {/* Auth Card */}
        <div className="bg-white rounded-2xl border border-[#E5DED3] shadow-card p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="label">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
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
                  className="text-xs font-semibold text-[#5F402B] hover:text-[#4A3120] transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  className="input pl-10 pr-10"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember me checkbox */}
            <div className="flex items-center gap-2 pt-1">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-[#E5DED3] text-[#5F402B] focus:ring-[#5F402B] cursor-pointer"
              />
              <label htmlFor="remember-me" className="text-xs font-medium text-[#687080] cursor-pointer">
                Remember me
              </label>
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-2.5"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-[#E5DED3]" />
            <span className="text-[#687080] text-xs font-medium uppercase tracking-wider">or continue with</span>
            <div className="flex-1 h-px bg-[#E5DED3]" />
          </div>

          {/* Google Sign-In */}
          <button
            id="google-login"
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-[#E5DED3] text-[#172033] text-sm font-semibold hover:bg-[#F2EEE7] transition-colors"
          >
            <GoogleIcon />
            Continue with Google
          </button>

          {/* Footer Prompt */}
          <p className="text-center text-[#687080] text-xs font-medium mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#5F402B] font-bold hover:text-[#4A3120] transition-colors">
              Sign up
            </Link>
          </p>
        </div>

        {/* Demo Hint */}
        <div className="mt-4 p-3 bg-[#F2EEE7] rounded-xl border border-[#E5DED3] text-center">
          <p className="text-xs text-[#172033] font-medium">
            Demo account: <span className="font-bold text-[#5F402B]">anith@sunrise.com / password123</span>
          </p>
        </div>
      </div>
    </div>
  )
}
