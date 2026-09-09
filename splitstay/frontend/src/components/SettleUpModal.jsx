import { useState } from 'react'
import axiosClient from '../api/axiosClient'
import toast from 'react-hot-toast'
import { X, ArrowRight, Banknote } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const getInitials = (name) => name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || '?'

export default function SettleUpModal({ houseId, members, onSuccess, onClose }) {
  const { user } = useAuth()
  const [toUserId, setToUserId] = useState('')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)

  const otherMembers = members.filter((m) => m._id !== user?._id && m._id?.toString() !== user?._id?.toString())

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!toUserId) return toast.error('Select who you are paying')
    if (!amount || parseFloat(amount) <= 0) return toast.error('Enter a valid amount')

    setLoading(true)
    try {
      await axiosClient.post(`/houses/${houseId}/settlements`, {
        toUserId,
        amount: parseFloat(amount),
        note,
      })
      const recipient = otherMembers.find((m) => m._id === toUserId || m._id?.toString() === toUserId)
      toast.success(`Payment of ₹${amount} to ${recipient?.name || 'housemate'} recorded!`)
      onSuccess?.()
      onClose?.()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record settlement')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md glass rounded-2xl p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold">Settle Up</h3>
            <p className="text-white/40 text-xs mt-0.5">Record a payment to a housemate</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Who are you paying? */}
          <div>
            <label className="label">I'm paying</label>
            <div className="grid grid-cols-2 gap-2">
              {otherMembers.map((m) => (
                <button
                  key={m._id}
                  type="button"
                  id={`settle-to-${m._id}`}
                  onClick={() => setToUserId(m._id?.toString() || m._id)}
                  className={`flex items-center gap-2 p-3 rounded-xl border text-sm transition-all ${toUserId === (m._id?.toString() || m._id) ? 'border-brand-500 bg-brand-500/20' : 'border-white/10 bg-white/5 hover:border-white/20'}`}
                >
                  <div className="avatar w-7 h-7 text-xs shrink-0">{getInitials(m.name)}</div>
                  <span className="font-medium truncate">{m.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Arrow indicator */}
          {toUserId && (
            <div className="flex items-center gap-3 justify-center text-sm text-white/50 animate-fade-in">
              <span className="font-medium">{user?.name}</span>
              <ArrowRight className="w-4 h-4 text-brand-400" />
              <span className="font-medium">{otherMembers.find((m) => (m._id?.toString() || m._id) === toUserId)?.name}</span>
            </div>
          )}

          {/* Amount */}
          <div>
            <label className="label">Amount (₹)</label>
            <div className="relative">
              <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                id="settle-amount"
                type="number"
                min="0.01"
                step="0.01"
                className="input pl-10 text-xl font-bold"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="label">Note (optional)</label>
            <input
              id="settle-note"
              type="text"
              className="input"
              placeholder="e.g. Paid back for groceries"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button
              id="settle-submit"
              type="submit"
              disabled={loading}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {loading ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Banknote className="w-4 h-4" />}
              {loading ? 'Recording...' : 'Record Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
