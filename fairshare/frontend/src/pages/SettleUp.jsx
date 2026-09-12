import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axiosClient from '../api/axiosClient'
import toast from 'react-hot-toast'
import AppLayout from '../components/AppLayout'
import { Upload, FileText, Trash2, HandCoins } from 'lucide-react'
import { getCurrencySymbol } from '../utils/exportUtils'

export default function SettleUp({ house: propHouse }) {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [house, setHouse] = useState(() => {
    if (propHouse) return propHouse
    const stored = localStorage.getItem('fairshare_house')
    return stored ? JSON.parse(stored) : null
  })

  const [members, setMembers] = useState([])
  const [payerId, setPayerId] = useState(user?._id || '')
  const [payeeId, setPayeeId] = useState('')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [proofFile, setProofFile] = useState(null)

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
    try {
      const { data } = await axiosClient.get(`/houses/${house._id}/members`)
      setMembers(data || [])
      if (data && data.length > 0 && !payerId) {
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
    <AppLayout house={house} onSelectHouse={setHouse}>
      <div className="space-y-6 max-w-xl mx-auto">
        {/* Top Header */}
        <div>
          <h1 className="text-2xl font-extrabold text-[#172033] tracking-tight">Settle Up</h1>
          <p className="text-[#687080] text-xs mt-0.5">Record direct payments and clear balances with roommates.</p>
        </div>

        {/* Settle Up Form Card */}
        <div className="bg-white rounded-2xl border border-[#E5DED3] p-8 shadow-card">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* From */}
            <div>
              <label className="label">Payer (Who Paid?)</label>
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
              <label className="label">Recipient (Who Received?)</label>
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
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="input pl-8 font-bold text-sm"
                  required
                />
              </div>
            </div>

            {/* Note */}
            <div>
              <label className="label">Optional Note</label>
              <input
                type="text"
                placeholder="e.g. GPay for last month rent"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="input text-xs"
              />
            </div>

            {/* Payment Proof Upload (Optional Mock) */}
            <div>
              <label className="label">Payment Receipt / Proof (Optional)</label>
              {proofFile ? (
                <div className="flex items-center justify-between p-3 rounded-xl border border-[#E5DED3] bg-[#FAF8F4]">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileText className="w-4 h-4 text-[#5F402B] shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#172033] truncate">{proofFile.name}</p>
                      <p className="text-[10px] text-slate-400">{formatFileSize(proofFile.size)}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="p-1 rounded text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center p-4 border border-dashed border-[#E5DED3] rounded-xl hover:bg-[#FAF8F4] transition-colors cursor-pointer text-center">
                  <Upload className="w-5 h-5 text-[#5F402B] mb-1" />
                  <span className="text-xs font-bold text-[#172033]">Upload screenshot or receipt</span>
                  <span className="text-[10px] text-[#687080] mt-0.5">PNG, JPG, PDF up to 5MB</span>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) setProofFile(e.target.files[0])
                    }}
                  />
                </label>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/balances')}
                className="btn-secondary flex-1 py-2.5"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex-1 py-2.5 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <HandCoins className="w-4 h-4" />
                )}
                <span>{loading ? 'Recording...' : 'Record Payment'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  )
}
