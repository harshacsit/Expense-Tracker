import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import axiosClient from '../api/axiosClient'
import toast from 'react-hot-toast'
import { X, Upload, HandCoins, FileText, Trash2 } from 'lucide-react'

const getMemberId = (m) => String(m?.userId?._id || m?.userId?.id || m?.userId || m?._id || m?.id || '')
const getMemberName = (m) => {
  if (!m) return 'Member'
  return (
    m.userId?.name ||
    m.name ||
    (m.userId?.email ? m.userId.email.split('@')[0] : null) ||
    (m.email ? m.email.split('@')[0] : null) ||
    'Member'
  )
}

export default function SettleUpModal({ houseId, members, onSuccess, onClose, currencySymbol = '₹' }) {
  const { user } = useAuth()
  const [payerId, setPayerId] = useState(() => {
    const myId = String(user?._id || user?.id || '')
    const found = members?.find((m) => getMemberId(m) === myId)
    if (found) return getMemberId(found)
    if (members && members.length > 0) return getMemberId(members[0])
    return myId
  })
  const [payeeId, setPayeeId] = useState('')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [proofFile, setProofFile] = useState(null)

  const handleRemoveFile = () => {
    setProofFile(null)
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 KB'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const parsedAmount = parseFloat(amount)
    if (!payeeId) return toast.error('Please select a recipient member')
    if (payerId === payeeId) return toast.error('Payer and recipient cannot be the same person')
    if (isNaN(parsedAmount) || parsedAmount <= 0) return toast.error('Please enter a valid amount')

    setLoading(true)
    try {
      await axiosClient.post(`/houses/${houseId}/settlements`, {
        payerId,
        payeeId,
        amount: parsedAmount,
        note: note.trim() || undefined,
      })

      toast.success('Settlement recorded successfully! 🤝')
      onSuccess?.()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record settlement')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#172033]/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-md rounded-2xl border border-[#E5DED3] shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5DED3]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#F2EEE7] text-[#5F402B] flex items-center justify-center">
              <HandCoins className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-extrabold text-[#172033]">Settle Up</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#687080] hover:text-[#172033] hover:bg-[#F2EEE7] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-xs text-[#687080]">Record a direct payment between housemates to clear balances.</p>

          {/* From */}
          <div>
            <label className="label text-[#172033]">From</label>
            <select
              className="input font-semibold border-[#E5DED3] focus:border-[#5F402B]"
              value={payerId}
              onChange={(e) => setPayerId(e.target.value)}
            >
              {members.map((m) => {
                const mId = getMemberId(m)
                const mName = getMemberName(m)
                const isMe = mId === String(user?._id || user?.id || '')
                return (
                  <option key={mId} value={mId}>
                    {mName} {isMe ? '(You)' : ''}
                  </option>
                )
              })}
            </select>
          </div>

          {/* To */}
          <div>
            <label className="label text-[#172033]">To</label>
            <select
              className="input font-semibold border-[#E5DED3] focus:border-[#5F402B]"
              value={payeeId}
              onChange={(e) => setPayeeId(e.target.value)}
              required
            >
              <option value="">Select recipient...</option>
              {members.filter((m) => getMemberId(m) !== String(payerId)).map((m) => {
                const mId = getMemberId(m)
                const mName = getMemberName(m)
                const isMe = mId === String(user?._id || user?.id || '')
                return (
                  <option key={mId} value={mId}>
                    {mName} {isMe ? '(You)' : ''}
                  </option>
                )
              })}
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="label text-[#172033]">Amount ({currencySymbol})</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-[#687080]">
                {currencySymbol}
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                className="input pl-8 font-bold text-base border-[#E5DED3] focus:border-[#5F402B]"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Note (optional) */}
          <div>
            <label className="label text-[#172033]">Note (optional)</label>
            <input
              type="text"
              className="input text-xs border-[#E5DED3] focus:border-[#5F402B]"
              placeholder="e.g. UPI transaction, cash, etc."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          {/* Upload Proof (Optional) with Pre-submission Removal */}
          <div>
            <label className="label text-[#172033]">Upload Proof (Optional)</label>
            {proofFile ? (
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-[#E5DED3] bg-[#F2EEE7]">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-[#E5DED3] text-[#5F402B] flex items-center justify-center shrink-0 font-bold">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#172033] truncate">{proofFile.name}</p>
                    <p className="text-[10px] text-[#687080] font-semibold">{formatFileSize(proofFile.size)}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="p-1.5 rounded-lg text-[#687080] hover:text-[#D65B57] hover:bg-red-50 transition-colors"
                  title="Remove file"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-[#E5DED3] hover:border-[#5F402B] rounded-xl p-4 text-center cursor-pointer transition-colors bg-[#F7F4EE]/60 flex flex-col items-center justify-center">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  id="settle-proof-input"
                  onChange={(e) => e.target.files?.[0] && setProofFile(e.target.files[0])}
                />
                <Upload className="w-6 h-6 text-[#5F402B] mb-1.5" />
                <p className="text-xs font-bold text-[#172033]">
                  Drag & drop payment proof, or select a file
                </p>
                <p className="text-[10px] text-[#687080] mt-0.5 mb-2.5">Supports JPG, PNG, PDF</p>
                <label
                  htmlFor="settle-proof-input"
                  className="btn-secondary py-1.5 px-3.5 text-xs inline-flex items-center gap-1.5 cursor-pointer font-bold shadow-xs hover:bg-[#E5DED3]"
                >
                  <Upload className="w-3.5 h-3.5 text-[#5F402B]" /> Choose File
                </label>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E5DED3]">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? 'Recording...' : 'Record Settlement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
