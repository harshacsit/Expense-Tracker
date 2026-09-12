import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import axiosClient from '../api/axiosClient'
import toast from 'react-hot-toast'
import { Users, UserPlus, Copy, Check, MoreVertical, Crown } from 'lucide-react'

export default function Members({ house }) {
  const { user } = useAuth()
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const loadMembers = useCallback(async () => {
    if (!house?._id) return
    setLoading(true)
    try {
      const { data } = await axiosClient.get(`/houses/${house._id}/members`)
      setMembers(data)
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
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">House Members</h1>
          <p className="text-slate-500 text-xs mt-0.5">Manage your house members.</p>
        </div>
        <button
          onClick={handleCopyCode}
          className="btn-primary flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" /> Invite Member
        </button>
      </div>

      {/* Members List Cards */}
      <div className="bg-white rounded-2xl border border-[#E5DED3] p-6 shadow-card space-y-4">
        <h2 className="text-sm font-bold text-[#687080] uppercase tracking-wider mb-2">Current Housemates ({members.length})</h2>
        {members.length > 0 ? (
          <div className="space-y-3">
            {members.map((m) => {
              const memberObj = m.userId && typeof m.userId === 'object' ? m.userId : (m.user || m)
              const email = memberObj.email || m.email || m.userEmail || ''
              const name = memberObj.name || m.name || m.userName || (email ? email.split('@')[0] : 'House Member')
              const isMe = (memberObj._id || m._id) === user?._id || email === user?.email
              const isAdmin = m.role === 'admin' || m.role === 'owner'

              return (
                <div
                  key={m._id || m.id || email}
                  className="flex items-center justify-between p-4 rounded-xl border border-[#E5DED3] bg-white hover:bg-[#F2EEE7] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#5F402B] text-white font-extrabold text-xs flex items-center justify-center shadow-xs">
                      {getInitials(name)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-[#172033] text-sm">
                          {name} {isMe ? '(You)' : ''}
                        </p>
                        {isAdmin && (
                          <Crown className="w-3.5 h-3.5 text-amber-600" title="House Creator / Admin" />
                        )}
                      </div>
                      {email ? (
                        <p className="text-xs text-[#687080] font-medium">{email}</p>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      isAdmin
                        ? 'bg-[#E6F4ED] text-[#2F9B70] border border-[#BBE3D0]'
                        : 'bg-[#F2EEE7] text-[#5F402B] border border-[#E5DED3]'
                    }`}>
                      {isAdmin ? 'Owner' : 'Member'}
                    </span>
                    <button className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-[#F2EEE7] transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="p-8 text-center text-slate-400 text-xs font-medium border border-dashed border-[#E5DED3] rounded-xl space-y-2 bg-[#F2EEE7]/30">
            <Users className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="font-bold text-[#172033]">No members found</p>
            <p className="text-[#687080]">Share your invite code to invite housemates to this room.</p>
          </div>
        )}
      </div>

      {/* Invite Member Section Card */}
      <div className="bg-white rounded-2xl border border-[#E5DED3] p-6 shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-extrabold text-[#172033]">Invite a new member</h3>
          <p className="text-xs text-[#687080] mt-0.5">Share this code with your friends to join your house.</p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="px-4 py-2 bg-[#F2EEE7] border border-[#E5DED3] rounded-xl font-mono font-bold text-[#172033] text-sm tracking-wider flex-1 sm:flex-none text-center">
            {inviteCode}
          </div>
          <button
            onClick={handleCopyCode}
            className="btn-secondary flex items-center gap-2 py-2 px-4"
          >
            {copied ? <Check className="w-4 h-4 text-[#2F9B70]" /> : <Copy className="w-4 h-4 text-[#5F402B]" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
