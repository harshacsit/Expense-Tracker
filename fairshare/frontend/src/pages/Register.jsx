import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axiosClient from '../api/axiosClient'
import toast from 'react-hot-toast'
import { User, Mail, Lock, Home, Eye, EyeOff } from 'lucide-react'

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

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) return toast.error('Please fill in all fields')
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters')

    setLoading(true)
    try {
      const { data } = await axiosClient.post('/auth/register', form)
      login(data)
      toast.success('Account created! Let\'s set up your house ≡ƒÅá')
      navigate('/setup')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
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
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#5F402B] text-white mb-3 shadow-xs">
            <Home className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#172033] tracking-tight">Create your account</h1>
          <p className="text-[#687080] text-sm mt-1">Let's get you started</p>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-2xl border border-[#E5DED3] shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="reg-name" className="label text-[#172033]">Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#687080]" />
                <input
                  id="reg-name"
                  type="text"
                  className="input pl-10 border-[#E5DED3] focus:border-[#5F402B]"
                  placeholder="Enter your name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label htmlFor="reg-email" className="label text-[#172033]">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#687080]" />
                <input
                  id="reg-email"
                  type="email"
                  className="input pl-10 border-[#E5DED3] focus:border-[#5F402B]"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label htmlFor="reg-password" className="label text-[#172033]">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#687080]" />
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  className="input pl-10 pr-10 border-[#E5DED3] focus:border-[#5F402B]"
                  placeholder="Create a password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#687080] hover:text-[#172033] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              id="register-submit"
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-2.5 mt-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Sign Up'
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
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-[#E5DED3] text-[#172033] text-sm font-semibold hover:bg-[#F2EEE7] transition-colors"
          >
            <GoogleIcon />
            Continue with Google
          </button>

          {/* Footer Prompt */}
          <p className="text-center text-[#687080] text-xs font-medium mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-[#5F402B] font-bold hover:text-[#4A3121] transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
