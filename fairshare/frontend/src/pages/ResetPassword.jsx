import { useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import axiosClient from '../api/axiosClient'
import toast from 'react-hot-toast'
import { Lock, Home, Eye, EyeOff } from 'lucide-react'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!password || !confirmPassword) return toast.error('Please fill in all fields')
    if (password !== confirmPassword) return toast.error('Passwords do not match')
    if (password.length < 6) return toast.error('Password must be at least 6 characters')

    setLoading(true)
    try {
      await axiosClient.post('/auth/reset-password', { token, password })
      toast.success('Password reset successful! Please sign in.')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password reset failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F4EE] flex items-center justify-center p-4">
      <div className="w-full max-w-md my-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#5F402B] text-white mb-3 shadow-xs">
            <Home className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#172033] tracking-tight">Set new password</h1>
          <p className="text-[#687080] text-sm mt-1">Please enter your new password below</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5DED3] shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label text-[#172033]">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#687080]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input pl-10 pr-10 border-[#E5DED3] focus:border-[#5F402B]"
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

            <div>
              <label className="label text-[#172033]">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#687080]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input pl-10 border-[#E5DED3] focus:border-[#5F402B]"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 mt-2">
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
