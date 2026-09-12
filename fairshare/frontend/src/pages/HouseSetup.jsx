import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axiosClient from '../api/axiosClient'
import toast from 'react-hot-toast'
import { Home, Plus, Key, ArrowRight, Copy, ArrowLeft } from 'lucide-react'

export default function HouseSetup() {
  const [tab, setTab] = useState('create') // 'create' | 'join'
  const [houseName, setHouseName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [created, setCreated] = useState(null)
  const navigate = useNavigate()

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!houseName.trim()) return toast.error('Enter a house name')
    setLoading(true)
    try {
      const { data } = await axiosClient.post('/houses', { name: houseName })
      localStorage.setItem('fairshare_house', JSON.stringify(data.house))
      setCreated(data)
      toast.success(`"${data.house.name}" created!`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create house')
    } finally {
      setLoading(false)
    }
  }

  const handleJoin = async (e) => {
    e.preventDefault()
    if (!inviteCode.trim()) return toast.error('Enter an invite code')
    setLoading(true)
    try {
      const { data } = await axiosClient.post('/houses/join', { inviteCode: inviteCode.trim().toUpperCase() })
      localStorage.setItem('fairshare_house', JSON.stringify(data.house))
      toast.success(data.message)
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid invite code')
    } finally {
      setLoading(false)
    }
  }

  const copyCode = () => {
    navigator.clipboard.writeText(created.inviteCode)
    toast.success('Invite code copied!')
  }

  if (created) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md animate-slide-up">
          <div className="glass rounded-2xl p-8 text-center">
            <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{background: 'linear-gradient(135deg, #10b981, #059669)'}}>
              <Home className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">House Created! 🎉</h2>
            <p className="text-white/50 text-sm mb-6">Share this invite code with your roommates</p>

            <div className="glass rounded-xl p-4 mb-4">
              <p className="text-xs text-white/40 mb-2 uppercase tracking-wider">Invite Code</p>
              <p className="text-4xl font-bold tracking-[0.3em] text-gradient">{created.inviteCode}</p>
            </div>

            <div className="flex gap-3">
              <button onClick={copyCode} className="btn-secondary flex-1 flex items-center justify-center gap-2">
                <Copy className="w-4 h-4" /> Copy Code
              </button>
              <button onClick={() => navigate('/dashboard')} className="btn-primary flex-1 flex items-center justify-center gap-2">
                Go to Dashboard <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md animate-fade-in">
        <div className="flex items-center gap-3 mb-6">
          <Link
            to="/dashboard"
            id="back-to-dashboard"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-white/60 hover:text-white"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Set Up Your House</h1>
            <p className="text-white/40 text-sm mt-0.5">Create a new shared space or join an existing one</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex glass rounded-xl p-1 mb-6">
          <button
            id="tab-create"
            onClick={() => setTab('create')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${tab === 'create' ? 'bg-brand-600 text-white shadow-lg' : 'text-white/50 hover:text-white/80'}`}
          >
            <Plus className="w-4 h-4 inline mr-1.5" />Create House
          </button>
          <button
            id="tab-join"
            onClick={() => setTab('join')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${tab === 'join' ? 'bg-brand-600 text-white shadow-lg' : 'text-white/50 hover:text-white/80'}`}
          >
            <Key className="w-4 h-4 inline mr-1.5" />Join House
          </button>
        </div>

        <div className="glass rounded-2xl p-8">
          {tab === 'create' ? (
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label htmlFor="house-name" className="label">House Name</label>
                <input
                  id="house-name"
                  type="text"
                  className="input"
                  placeholder="e.g. Sunrise Apartments"
                  value={houseName}
                  onChange={(e) => setHouseName(e.target.value)}
                />
              </div>
              <button
                id="create-house-submit"
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {loading ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Plus className="w-4 h-4" />}
                {loading ? 'Creating...' : 'Create House'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleJoin} className="space-y-4">
              <div>
                <label htmlFor="join-code" className="label">Invite Code</label>
                <input
                  id="join-code"
                  type="text"
                  className="input text-center uppercase tracking-widest font-bold text-lg"
                  placeholder="e.g. A3X9KP2M"
                  maxLength={8}
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                />
              </div>
              <button
                id="join-house-submit"
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {loading ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Key className="w-4 h-4" />}
                {loading ? 'Joining...' : 'Join House'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
