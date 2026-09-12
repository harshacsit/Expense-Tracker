import { useState } from 'react'
import { Link } from 'react-router-dom'
import axiosClient from '../api/axiosClient'
import toast from 'react-hot-toast'
import { Mail, Home, ArrowLeft, CheckCircle, Send } from 'lucide-react'
import Orb from '../components/Orb'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim()) return toast.error('Please enter your email address')

    setLoading(true)
    try {
      await axiosClient.post('/auth/forgot-password', { email })
      setSent(true)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
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
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
            style={{ background: 'linear-gradient(135deg, #6070f5 0%, #a855f7 100%)' }}
          >
            <Home className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gradient">FairShare</h1>
          <p className="text-white/40 text-sm mt-1">Shared roommate expense tracking</p>
        </div>

        <div className="glass rounded-2xl p-8">
          {!sent ? (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(96,112,245,0.15)', border: '1px solid rgba(96,112,245,0.3)' }}
                >
                  <Mail className="w-5 h-5 text-brand-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Forgot your password?</h2>
                  <p className="text-white/40 text-sm">We'll send a reset link to your email</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="forgot-email" className="label">Email address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                      id="forgot-email"
                      type="email"
                      className="input pl-10"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoFocus
                    />
                  </div>
                </div>

                <button
                  id="forgot-submit"
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
            </>
          ) : (
            /* Success State */
            <div className="text-center py-4">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)' }}
              >
                <CheckCircle className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold mb-2">Check your inbox!</h2>
              <p className="text-white/50 text-sm mb-1">
                We sent a password reset link to
              </p>
              <p className="text-brand-300 font-medium text-sm mb-6">{email}</p>
              <p className="text-white/30 text-xs mb-6">
                Didn't receive it? Check your spam folder. The link expires in 10 minutes.
              </p>
              <button
                id="resend-email"
                onClick={() => setSent(false)}
                className="btn-secondary text-sm px-4 py-2 mx-auto"
              >
                Try a different email
              </button>
            </div>
          )}

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
