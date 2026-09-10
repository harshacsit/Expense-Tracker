import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import axiosClient from '../api/axiosClient'
import toast from 'react-hot-toast'
import { Lock, Home, Eye, EyeOff, ShieldCheck, ArrowLeft } from 'lucide-react'
import Orb from '../components/Orb'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')

  const [form, setForm] = useState({ password: '', confirm: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!token) {
      toast.error('Invalid reset link')
      navigate('/forgot-password')
    }
  }, [token, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.password) return toast.error('Please enter a new password')
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters')
    if (form.password !== form.confirm) return toast.error('Passwords do not match')

    setLoading(true)
    try {
      await axiosClient.post(`/auth/reset-password/${token}`, { password: form.password })
      toast.success('Password reset successfully!')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed. The link may have expired.')
    } finally {
      setLoading(false)
    }
  }

  const passwordStrength = () => {
    const p = form.password
    if (!p) return null
    if (p.length < 6) return { label: 'Too short', color: '#ef4444', width: '25%' }
    if (p.length < 8) return { label: 'Weak', color: '#f97316', width: '50%' }
    if (p.length < 12 || !/[A-Z]/.test(p) || !/[0-9]/.test(p)) return { label: 'Fair', color: '#eab308', width: '75%' }
    return { label: 'Strong', color: '#10b981', width: '100%' }
  }
  const strength = passwordStrength()

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
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
            style={{ background: 'linear-gradient(135deg, #6070f5 0%, #a855f7 100%)' }}
          >
            <Home className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gradient">SplitStay</h1>
          <p className="text-white/40 text-sm mt-1">Set your new password</p>
        </div>

        <div className="glass rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'rgba(96,112,245,0.15)', border: '1px solid rgba(96,112,245,0.3)' }}
            >
              <ShieldCheck className="w-5 h-5 text-brand-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Reset Password</h2>
              <p className="text-white/40 text-sm">Choose a strong new password</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New Password */}
            <div>
              <label htmlFor="reset-password" className="label">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  id="reset-password"
                  type={showPassword ? 'text' : 'password'}
                  className="input pl-10 pr-10"
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* Strength bar */}
              {strength && (
                <div className="mt-2">
                  <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: strength.width, background: strength.color }}
                    />
                  </div>
                  <p className="text-xs mt-1" style={{ color: strength.color }}>{strength.label}</p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="reset-confirm" className="label">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  id="reset-confirm"
                  type={showConfirm ? 'text' : 'password'}
                  className="input pl-10 pr-10"
                  placeholder="Repeat new password"
                  value={form.confirm}
                  onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* Match indicator */}
              {form.confirm && (
                <p className={`text-xs mt-1.5 ${form.password === form.confirm ? 'text-emerald-400' : 'text-red-400'}`}>
                  {form.password === form.confirm ? '✓ Passwords match' : '✗ Passwords do not match'}
                </p>
              )}
            </div>

            <button
              id="reset-submit"
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <ShieldCheck className="w-4 h-4" />
              )}
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-white/8 flex items-center justify-center">
            <Link
              to="/login"
              className="flex items-center gap-1.5 text-white/40 hover:text-white/70 text-sm transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
