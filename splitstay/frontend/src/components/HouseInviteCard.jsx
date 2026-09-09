import { useState } from 'react'
import toast from 'react-hot-toast'
import { Copy, Key, Users } from 'lucide-react'

export default function HouseInviteCard({ house, members }) {
  const [copied, setCopied] = useState(false)

  const copyCode = () => {
    navigator.clipboard.writeText(house.inviteCode)
    setCopied(true)
    toast.success('Invite code copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Key className="w-4 h-4 text-brand-400" />
            <span className="text-xs text-white/40 uppercase tracking-wider">Invite Code</span>
          </div>
          <p className="text-2xl font-bold tracking-[0.2em] text-gradient">{house.inviteCode}</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-white/40 text-sm">
            <Users className="w-4 h-4" />
            <span>{members?.length || 0} member{members?.length !== 1 ? 's' : ''}</span>
          </div>
          <button
            id="copy-invite-code"
            onClick={copyCode}
            className={`btn-secondary flex items-center gap-2 text-sm py-2 ${copied ? 'text-emerald-400' : ''}`}
          >
            <Copy className="w-3.5 h-3.5" />
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {members && members.length > 0 && (
        <div className="mt-4 flex items-center gap-2">
          <div className="flex -space-x-2">
            {members.slice(0, 5).map((m, i) => (
              <div
                key={m._id || i}
                className="avatar w-7 h-7 text-xs border-2 border-dark-800"
                title={m.name}
              >
                {m.name?.[0]?.toUpperCase() || '?'}
              </div>
            ))}
          </div>
          <p className="text-xs text-white/40">
            {members.map((m) => m.name).join(', ')}
          </p>
        </div>
      )}
    </div>
  )
}
