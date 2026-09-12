import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

/**
 * OAuthCallback ΓÇö handles redirect from backend after Google OAuth
 * URL: /oauth/callback?token=JWT&name=...&email=...&id=...
 */
export default function OAuthCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { login } = useAuth()

  useEffect(() => {
    const token = searchParams.get('token')
    const name = searchParams.get('name')
    const email = searchParams.get('email')
    const id = searchParams.get('id')
    const error = searchParams.get('error')

    if (error || !token) {
      toast.error('Google sign-in failed. Please try again.')
      navigate('/login')
      return
    }

    // Store user in AuthContext (same shape as regular login)
    login({ _id: id, name, email, token })
    toast.success(`Welcome, ${name}! ≡ƒÅá`)
    navigate('/dashboard')
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-white/50 text-sm">Completing sign-in...</p>
    </div>
  )
}
