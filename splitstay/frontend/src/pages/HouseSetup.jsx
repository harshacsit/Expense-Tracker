import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axiosClient from '../api/axiosClient'
import toast from 'react-hot-toast'
import { Home, Building, Users, Bed, Wrench, UserPlus, ArrowLeft } from 'lucide-react'

export default function HouseSetup({ onSelectHouse }) {
  const [tab, setTab] = useState('create') // 'create' | 'join'
  const [houseName, setHouseName] = useState('')
  const [selectedIcon, setSelectedIcon] = useState('home')
  const [currency, setCurrency] = useState('INR')
  const [inviteCode, setInviteCode] = useState('')
  const [loading, setLoading] = useState(false)
  const { logout } = useAuth()
  const navigate = useNavigate()

  const icons = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'building', icon: Building, label: 'Building' },
    { id: 'people', icon: Users, label: 'People' },
    { id: 'bed', icon: Bed, label: 'Bed' },
    { id: 'tools', icon: Wrench, label: 'Tools' },
  ]

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!houseName.trim()) return toast.error('Please enter a room name')

    setLoading(true)
    try {
      const { data } = await axiosClient.post('/houses', { name: houseName.trim(), currency })
      localStorage.setItem('splitstay_house', JSON.stringify(data.house))
      onSelectHouse?.(data.house)
      toast.success(`Room "${data.house.name}" created! 🏠`)
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create room')
    } finally {
      setLoading(false)
    }
  }

  const handleJoin = async (e) => {
    e.preventDefault()
    if (!inviteCode.trim()) return toast.error('Please enter an invite code')

    setLoading(true)
    try {
      const { data } = await axiosClient.post('/houses/join', { inviteCode: inviteCode.trim().toUpperCase() })
      localStorage.setItem('splitstay_house', JSON.stringify(data.house))
      onSelectHouse?.(data.house)
      toast.success(`Joined "${data.house.name}"! 🎉`)
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to join room')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F4EE] flex items-center justify-center p-4">
      <div className="w-full max-w-md my-8">
        {/* Top Header with Back Link and Centered Logo */}
        <div className="relative flex items-center justify-center mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="absolute left-0 text-xs font-semibold text-[#687080] hover:text-[#172033] flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#5F402B] text-white flex items-center justify-center shadow-xs">
              <Home className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-xl text-[#172033] tracking-tight">SplitStay</span>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="flex bg-[#F2EEE7] border border-[#E5DED3] p-1 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => setTab('create')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              tab === 'create' ? 'bg-[#5F402B] text-white shadow-xs' : 'text-[#687080] hover:text-[#172033]'
            }`}
          >
            Create a Room
          </button>
          <button
            type="button"
            onClick={() => setTab('join')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              tab === 'join' ? 'bg-[#5F402B] text-white shadow-xs' : 'text-[#687080] hover:text-[#172033]'
            }`}
          >
            Join a Room
          </button>
        </div>

        {/* Create Room Card */}
        {tab === 'create' ? (
          <div className="bg-white rounded-2xl border border-[#E5DED3] shadow-sm p-8">
            <div className="text-center mb-6">
              <h2 className="text-xl font-extrabold text-[#172033]">Create a Room</h2>
              <p className="text-[#687080] text-xs mt-1">Set up a new shared space for you and your housemates.</p>
            </div>

            <form onSubmit={handleCreate} className="space-y-5">
              <div>
                <label className="label text-[#172033]">Room Name</label>
                <input
                  type="text"
                  className="input border-[#E5DED3] focus:border-[#5F402B]"
                  placeholder="e.g. Sunrise Apartments"
                  value={houseName}
                  onChange={(e) => setHouseName(e.target.value)}
                />
              </div>

              {/* Room Icon Selection Row */}
              <div>
                <label className="label text-[#172033]">Room Icon (optional)</label>
                <div className="flex items-center gap-2 justify-between pt-1">
                  {icons.map((item) => {
                    const IconComp = item.icon
                    const isSelected = selectedIcon === item.id
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelectedIcon(item.id)}
                        className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-[#5F402B] text-white shadow-md ring-2 ring-[#5F402B] ring-offset-2'
                            : 'bg-[#F2EEE7] text-[#687080] hover:bg-[#E5DED3]'
                        }`}
                        title={item.label}
                      >
                        <IconComp className="w-5 h-5" />
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Currency Selector */}
              <div>
                <label className="label text-[#172033]">Default Currency</label>
                <select
                  className="input font-semibold border-[#E5DED3] focus:border-[#5F402B]"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                >
                  <option value="INR">₹ INR (Indian Rupee)</option>
                  <option value="USD">$ USD (US Dollar)</option>
                  <option value="EUR">€ EUR (Euro)</option>
                  <option value="GBP">£ GBP (British Pound)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-2.5 mt-2"
              >
                {loading ? 'Creating...' : 'Create Room'}
              </button>
            </form>
          </div>
        ) : (
          /* Join Room Card */
          <div className="bg-white rounded-2xl border border-[#E5DED3] shadow-sm p-8 text-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#F2EEE7] text-[#5F402B] mb-3 border border-[#E5DED3]">
                <UserPlus className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-extrabold text-[#172033]">Join a Room</h2>
              <p className="text-[#687080] text-xs mt-1">Enter the invite code shared by your housemate.</p>
            </div>

            <form onSubmit={handleJoin} className="space-y-5 text-left">
              <div>
                <label className="label text-[#172033]">Invite Code</label>
                <input
                  type="text"
                  className="input uppercase tracking-wider font-mono text-center text-base border-[#E5DED3] focus:border-[#5F402B]"
                  placeholder="e.g. FEDB86BD"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-2.5"
              >
                {loading ? 'Joining...' : 'Join Room'}
              </button>
            </form>

            <p className="text-center text-[#687080] text-xs font-medium mt-6">
              Don't have a code?{' '}
              <button
                onClick={() => setTab('create')}
                className="text-[#5F402B] font-bold hover:underline"
              >
                Create a room instead
              </button>
            </p>
          </div>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={logout}
            className="text-xs font-semibold text-[#687080] hover:text-[#172033] transition-colors"
          >
            Sign out of account
          </button>
        </div>
      </div>
    </div>
  )
}
