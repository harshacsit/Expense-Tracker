import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axiosClient from '../api/axiosClient'
import toast from 'react-hot-toast'
import { Upload, FileText, Trash2, HandCoins } from 'lucide-react'
import { getCurrencySymbol } from '../utils/exportUtils'

export default function SettleUp({ house }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [members, setMembers] = useState([])
  const [payerId, setPayerId] = useState(user?._id || '')
  const [payeeId, setPayeeId] = useState('')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [proofFile, setProofFile] = useState(null)

  const loadMembers = useCallback(async () => {
    if (!house?._id) return
    try {
      const { data } = await axiosClient.get(`/houses/${house._id}/members`)
      setMembers(data)
      if (data.length > 0 && !payerId) {
        const found = data.find((m) => (m.userId?._id || m.userId) === user?._id)
        setPayerId(found ? (found.userId?._id || found.userId) : (data[0]?.userId?._id || data[0]?.userId))
      }
    } catch (err) {
      toast.error('Failed to load house members')
    }
  }, [house?._id, payerId, user?._id])

  useEffect(() => {
    loadMembers()
  }, [loadMembers])

  const currencySymbol = getCurrencySymbol(house?.currency)

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
      await axiosClient.post(`/houses/${house._id}/settlements`, {
        payerId,
        payeeId,
        amount: parsedAmount,
        note: note.trim() || undefined,
      })

      toast.success('Settlement recorded successfully! 🤝')
      navigate('/balances')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record settlement')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">Settle Up</h1>
        <p className="text-slate-500 text-xs mt-0.5">Record payments and clear balances.</p>
      </div>

      {/* Settle Up Form Card */}
      <div className="bg-white rounded-2xl border border-[#E5DED3] p-8 shadow-card">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* From */}
          <div>
            <label className="label">From</label>
            <select
              className="input font-semibold"
              value={payerId}
              onChange={(e) => setPayerId(e.target.value)}
            >
              {members.map((m) => {
                const mId = m.userId?._id || m.userId
                const isMe = mId === user?._id
                return (
                  <option key={mId} value={mId}>
                    {m.userId?.name || 'Member'} {isMe ? '(You)' : ''}
                  </option>
                )
              })}
            </select>
          </div>

          {/* To */}
          <div>
            <label className="label">To</label>
            <select
              className="input font-semibold"
              value={payeeId}
              onChange={(e) => setPayeeId(e.target.value)}
              required
            >
              <option value="">Select recipient...</option>
              {members.filter((m) => (m.userId?._id || m.userId) !== payerId).map((m) => {
                const mId = m.userId?._id || m.userId
                const isMe = mId === user?._id
                return (
                  <option key={mId} value={mId}>
                    {m.userId?.name || 'Member'} {isMe ? '(You)' : ''}
                  </option>
                )
              })}
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="label">Amount ({currencySymbol})</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                {currencySymbol}
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                className="input pl-8 font-bold text-base"
                placeholder="250"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Note (optional) */}
          <div>
            <label className="label">Note (optional)</label>
            <input
              type="text"
              className="input"
              placeholder="e.g. UPI transaction, cash, etc."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          {/* Upload Proof (Optional) with Pre-submission Removal */}
          <div>
            <label className="label">Upload Proof (Optional)</label>
            {proofFile ? (
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-[#E5DED3] bg-[#F2EEE7]">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-[#FAF8F4] text-[#5F402B] flex items-center justify-center shrink-0 font-bold">
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
                  className="p-1.5 rounded-lg text-slate-400 hover:text-[#D65B57] hover:bg-[#FDF0EF] transition-colors"
                  title="Remove file"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-[#E5DED3] hover:border-[#5F402B] rounded-xl p-5 text-center cursor-pointer transition-colors bg-[#F2EEE7]/50 flex flex-col items-center justify-center">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  id="page-settle-proof-input"
                  onChange={(e) => e.target.files?.[0] && setProofFile(e.target.files[0])}
                />
                <Upload className="w-6 h-6 text-[#5F402B] mb-1.5" />
                <p className="text-xs font-bold text-[#172033]">
                  Drag & drop payment proof, or select a file
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5 mb-2.5">Supports JPG, PNG, PDF</p>
                <label
                  htmlFor="page-settle-proof-input"
                  className="px-3 py-1.5 rounded-lg bg-white border border-[#E5DED3] text-[#5F402B] font-bold text-xs hover:bg-[#F2EEE7] transition-colors cursor-pointer"
                >
                  Browse File
                </label>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/balances')}
              className="btn-secondary flex-1 py-3"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1 py-3 flex items-center justify-center gap-2"
            >
              <HandCoins className="w-4 h-4" />
              <span>{loading ? 'Recording...' : 'Record Settlement'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
