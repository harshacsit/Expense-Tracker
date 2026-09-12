import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import axiosClient from '../api/axiosClient'
import toast from 'react-hot-toast'
import AppLayout from '../components/AppLayout'
import { Users, UserPlus, Copy, Check, Crown, Mail, Shield } from 'lucide-react'

export default function Members({ house: propHouse }) {
  const { user } = useAuth()
  const [house, setHouse] = useState(() => {
    if (propHouse) return propHouse
    const stored = localStorage.getItem('fairshare_house')
    return stored ? JSON.parse(stored) : null
  })
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  // Fetch house if not present
  useEffect(() => {
    if (!house) {
      axiosClient
        .get('/houses')
        .then(({ data }) => {
          if (data && data.length > 0) {
            setHouse(data[0])
            localStorage.setItem('fairshare_house', JSON.stringify(data[0]))
          }
        })
        .catch(() => {})
    }
  }, [house])

  const loadMembers = useCallback(async () => {
    if (!house?._id) return
    setLoading(true)
    try {
      const { data } = await axiosClient.get(`/houses/${house._id}/members`)
      setMembers(data || [])
    } catch (err) {
      toast.error('Failed to load house members')
    } finally {
      setLoading(false)
    }
  }, [house?._id])

  useEffect(() => {
    loadMembers()
  }, [loadMembers])

  const inviteCode = house?.inviteCode || 'SUNRISE1'

  const handleCopyCode = () => {
    navigator.clipboard.writeText(inviteCode)
    setCopied(true)
    toast.success('Invite code copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  const getInitials = (name) => {
    if (!name) return 'MB'
    const parts = name.trim().split(' ')
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    return name.slice(0, 2).toUpperCase()
  }

  return (
    <AppLayout house={house} onSelectHouse={setHouse}>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-[#172033] tracking-tight">House Members</h1>
            <p className="text-[#687080] text-xs mt-0.5">Manage and invite roommates sharing your room.</p>
          </div>
          <button
            onClick={handleCopyCode}
            className="btn-primary flex items-center gap-2 shadow-xs"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <UserPlus className="w-4 h-4" />}
            <span>{copied ? 'Code Copied!' : 'Invite Member'}</span>
          </button>
        </div>

        {/* Invite Code Share Banner */}
        <div className="bg-white rounded-2xl border border-[#E5DED3] p-6 shadow-card flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#687080]">Room Invite Code</span>
              <span className="px-2 py-0.5 rounded-full bg-[#E6F4ED] text-[#2F9B70] font-bold text-[10px]">Active</span>
            </div>
            <p className="text-sm font-bold text-[#172033] mt-1">
              Share this unique room code with your roommates so they can join:
            </p>
          </div>

          <div className="flex items-center gap-2 bg-[#FAF8F4] border border-[#E5DED3] px-4 py-2.5 rounded-xl">
            <span className="font-mono font-extrabold text-base text-[#5F402B] tracking-wider">{inviteCode}</span>
            <button
              onClick={handleCopyCode}
              className="p-1.5 rounded-lg bg-[#F2EEE7] hover:bg-[#E5DED3] text-[#5F402B] transition-colors"
              title="Copy code"
            >
              {copied ? <Check className="w-4 h-4 text-[#2F9B70]" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Members List Container */}
        <div className="bg-white rounded-2xl border border-[#E5DED3] shadow-card overflow-hidden">
          <div className="p-4 border-b border-[#E5DED3] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#5F402B]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#172033]">
                Total Members ({members.length})
              </span>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400 text-xs font-medium">
              Loading members...
            </div>
          ) : members.length > 0 ? (
            <div className="divide-y divide-[#E5DED3]">
              {members.map((m) => {
                const memberUser = (m.userId && typeof m.userId === 'object') ? m.userId : m
                const isOwner = m.role === 'admin' || m.role === 'owner'
                const isMe = String(memberUser._id || memberUser.id) === String(user?._id) || memberUser.email === user?.email

                return (
                  <div key={m._id || memberUser._id} className="p-4 flex items-center justify-between hover:bg-[#F2EEE7]/40 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#5F402B] text-white font-bold text-sm flex items-center justify-center shadow-xs">
                        {getInitials(memberUser.name)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-[#172033]">
                            {memberUser.name || 'Member'}
                          </p>
                          {isMe && (
                            <span className="px-2 py-0.5 rounded-md bg-[#F2EEE7] text-[#5F402B] text-[10px] font-bold">
                              You
                            </span>
                          )}
                          {isOwner && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">
                              <Crown className="w-3 h-3 text-amber-500" /> Admin
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#687080] mt-0.5 flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-400" /> {memberUser.email || 'No email provided'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#FAF8F4] border border-[#E5DED3] text-[#687080]">
                        Joined {new Date(m.joinedAt || Date.now()).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 text-xs">
              No members found in this room.
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
