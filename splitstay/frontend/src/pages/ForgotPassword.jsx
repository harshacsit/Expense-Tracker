import { useState } from 'react'
import { Link } from 'react-router-dom'
import axiosClient from '../api/axiosClient'
import toast from 'react-hot-toast'
import { Mail, Home, ArrowLeft } from 'lucide-react'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) return toast.error('Please enter your email')

    setLoading(true)
    try {
      await axiosClient.post('/auth/forgot-password', { email })
      setSent(true)
      toast.success('Password reset link sent!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset email')
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
          <h1 className="text-2xl font-extrabold text-[#172033] tracking-tight">Forgot password?</h1>
          <p className="text-[#687080] text-sm mt-1">Enter your email and we'll send a reset link</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5DED3] shadow-sm p-8">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#F2EEE7] text-[#2F9B70] flex items-center justify-center mx-auto">
                <Mail className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-[#172033]">
                Check your inbox for <span className="text-[#5F402B] font-bold">{email}</span>
              </p>
              <p className="text-xs text-[#687080]">The link will expire in 10 minutes.</p>
              <Link to="/login" className="btn-primary w-full py-2.5 inline-block text-center mt-2">
                Back to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label text-[#172033]">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#687080]" />
                  <input
                    type="email"
                    className="input pl-10 border-[#E5DED3] focus:border-[#5F402B]"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>

              <div className="text-center pt-2">
                <Link to="/login" className="text-xs font-semibold text-[#687080] hover:text-[#172033] inline-flex items-center gap-1">
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
