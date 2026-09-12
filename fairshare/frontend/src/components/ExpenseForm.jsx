import { useState, useMemo, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import axiosClient from '../api/axiosClient'
import toast from 'react-hot-toast'
import { X, Upload, Check, FileText, Camera, Trash2, AlertCircle } from 'lucide-react'

export default function ExpenseForm({ houseId, members: initialMembers = [], onSuccess, onClose, currencySymbol = 'Γé╣' }) {
  const { user } = useAuth()
  const [members, setMembers] = useState(initialMembers || [])
  const [entryMode, setEntryMode] = useState('manual')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('Groceries')

  const parsedTotal = parseFloat(amount) || 0

  // Auto-fetch members if not provided or empty
  useEffect(() => {
    if ((!members || members.length === 0) && houseId) {
      axiosClient.get(`/houses/${houseId}/members`)
        .then(({ data }) => {
          if (Array.isArray(data) && data.length > 0) {
            setMembers(data)
          }
        })
        .catch((err) => console.error('Failed to load members for expense form', err))
    }
  }, [houseId, members?.length])

  // Normalize members list to include logged-in user if missing
  const safeMembers = useMemo(() => {
    const list = Array.isArray(members) && members.length > 0 ? members : []
    if (list.length === 0 && user) {
      return [{ userId: user, _id: user._id, name: user.name, email: user.email }]
    }
    return list
  }, [members, user])

  // Default Paid By to the logged-in user if present in members list
  const defaultPaidBy = useMemo(() => {
    const found = safeMembers.find((m) => String(m.userId?._id || m.userId || m._id) === String(user?._id))
    if (found) return String(found.userId?._id || found.userId || found._id)
    return String(safeMembers[0]?.userId?._id || safeMembers[0]?.userId || safeMembers[0]?._id || user?._id || '')
  }, [safeMembers, user?._id])

  const [paidById, setPaidById] = useState(defaultPaidBy)
  const [splitType, setSplitType] = useState('equal')
  const [customShares, setCustomShares] = useState({})

  // Selected member IDs for splitting
  const [selectedMemberIds, setSelectedMemberIds] = useState(
    () => safeMembers.map((m) => String(m.userId?._id || m.userId || m._id))
  )

  useEffect(() => {
    if (safeMembers && safeMembers.length > 0) {
      const allIds = safeMembers.map((m) => String(m.userId?._id || m.userId || m._id))
      if (selectedMemberIds.length === 0) {
        setSelectedMemberIds(allIds)
      }
      if (!paidById) {
        setPaidById(defaultPaidBy)
      }
    }
  }, [safeMembers, defaultPaidBy, paidById, selectedMemberIds.length])

  // Auto-fill split shares when switching splitType
  useEffect(() => {
    if (splitType === 'exact' && parsedTotal > 0 && selectedMemberIds.length > 0) {
      const perPerson = parseFloat((parsedTotal / selectedMemberIds.length).toFixed(2))
      const sharesObj = {}
      selectedMemberIds.forEach((id, idx) => {
        if (idx === selectedMemberIds.length - 1) {
          const sumPrior = perPerson * (selectedMemberIds.length - 1)
          sharesObj[id] = parseFloat((parsedTotal - sumPrior).toFixed(2))
        } else {
          sharesObj[id] = perPerson
        }
      })
      setCustomShares(sharesObj)
    } else if (splitType === 'percent' && selectedMemberIds.length > 0) {
      const perPerson = Math.floor(100 / selectedMemberIds.length)
      const remainder = 100 - perPerson * selectedMemberIds.length
      const sharesObj = {}
      selectedMemberIds.forEach((id, idx) => {
        sharesObj[id] = idx === 0 ? perPerson + remainder : perPerson
      })
      setCustomShares(sharesObj)
    }
  }, [splitType, parsedTotal, selectedMemberIds])

  const [loading, setLoading] = useState(false)
  const [receiptFile, setReceiptFile] = useState(null)

  const categories = [
    'Groceries',
    'Rent',
    'Utilities',
    'Internet',
    'Cooking Gas',
    'Entertainment',
    'Other',
  ]

  const toggleMember = (id) => {
    setSelectedMemberIds((prev) =>
      prev.includes(id) ? prev.filter((mId) => mId !== id) : [...prev, id]
    )
  }

  const handleShareChange = (userId, val) => {
    setCustomShares((prev) => ({ ...prev, [userId]: val }))
  }

  // Pre-submission file removal helper
  const handleRemoveFile = () => {
    setReceiptFile(null)
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 KB'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  // Real-time split validation

  const validationState = useMemo(() => {
    if (splitType === 'exact') {
      const sum = selectedMemberIds.reduce((s, id) => s + (parseFloat(customShares[id]) || 0), 0)
      const valid = Math.abs(sum - parsedTotal) <= 0.01
      return {
        valid,
        message: !valid ? `Exact shares sum (${currencySymbol}${sum.toFixed(2)}) must equal total (${currencySymbol}${parsedTotal.toFixed(2)})` : '',
      }
    }
    if (splitType === 'percent') {
      const sum = selectedMemberIds.reduce((s, id) => s + (parseFloat(customShares[id]) || 0), 0)
      const valid = Math.abs(sum - 100) <= 0.01
      return {
        valid,
        message: !valid ? `Percentages sum (${sum.toFixed(1)}%) must equal 100%` : '',
      }
    }
    return { valid: true, message: '' }
  }, [splitType, selectedMemberIds, customShares, parsedTotal, currencySymbol])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!description.trim() || isNaN(parsedTotal) || parsedTotal <= 0) {
      return toast.error('Please enter a valid description and amount')
    }
    if (selectedMemberIds.length === 0) {
      return toast.error('Please select at least one housemate to split with')
    }
    if (!validationState.valid) {
      return toast.error(validationState.message)
    }

    let payloadShares = []
    if (splitType === 'exact') {
      payloadShares = selectedMemberIds.map((id) => ({
        userId: id,
        amountOwed: parseFloat(customShares[id]) || 0,
      }))
    } else if (splitType === 'percent') {
      payloadShares = selectedMemberIds.map((id) => ({
        userId: id,
        percentage: parseFloat(customShares[id]) || 0,
      }))
    }

    setLoading(true)
    try {
      await axiosClient.post(`/houses/${houseId}/expenses`, {
        description: description.trim(),
        amount: parsedTotal,
        category,
        paidById,
        splitType,
        memberIds: selectedMemberIds,
        customShares: payloadShares.length > 0 ? payloadShares : undefined,
      })

      toast.success('Expense added successfully! ≡ƒÆ╕')
      onSuccess?.()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add expense')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#172033]/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-2xl border border-[#E5DED3] shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5DED3]">
          <h2 className="text-lg font-extrabold text-[#172033]">Add Expense</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#687080] hover:text-[#172033] hover:bg-[#F2EEE7] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Entry Mode Toggle */}
          <div className="flex bg-[#F2EEE7] p-1 rounded-xl border border-[#E5DED3]">
            <button
              type="button"
              onClick={() => setEntryMode('manual')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${
                entryMode === 'manual'
                  ? 'bg-[#5F402B] text-white shadow-xs'
                  : 'text-[#687080] hover:text-[#172033]'
              }`}
            >
              <FileText className="w-4 h-4" /> Manual Entry
            </button>
            <button
              type="button"
              onClick={() => setEntryMode('scan')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${
                entryMode === 'scan'
                  ? 'bg-[#5F402B] text-white shadow-xs'
                  : 'text-[#687080] hover:text-[#172033]'
              }`}
            >
              <Camera className="w-4 h-4" /> Scan Receipt
            </button>
          </div>

          {/* Amount Field */}
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

          {/* Description */}
          <div>
            <label className="label text-[#172033]">Description</label>
            <input
              type="text"
              className="input border-[#E5DED3] focus:border-[#5F402B]"
              placeholder="e.g. Grocery shopping, Electricity bill"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="label text-[#172033]">Category</label>
            <select
              className="input font-semibold border-[#E5DED3] focus:border-[#5F402B]"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Paid By ΓÇö Defaults to Logged In User */}
          <div>
            <label className="label text-[#172033]">Paid By</label>
            <select
              className="input font-semibold border-[#E5DED3] focus:border-[#5F402B]"
              value={paidById}
              onChange={(e) => setPaidById(e.target.value)}
            >
              {safeMembers.map((m) => {
                const mId = String(m.userId?._id || m.userId || m._id || '')
                const mName = m.userId?.name || m.name || m.email || 'Member'
                const isMe = mId === String(user?._id || '')
                return (
                  <option key={mId} value={mId}>
                    {mName} {isMe ? '(You)' : ''}
                  </option>
                )
              })}
            </select>
          </div>

          {/* Split Type Segmented Control */}
          <div>
            <label className="label text-[#172033]">Split Type</label>
            <div className="grid grid-cols-3 gap-2 bg-[#F2EEE7] p-1 rounded-xl border border-[#E5DED3]">
              {[
                ['equal', 'Equal'],
                ['exact', 'Exact'],
                ['percent', 'Percent'],
              ].map(([st, label]) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setSplitType(st)}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                    splitType === st
                      ? 'bg-[#5F402B] text-white shadow-xs'
                      : 'text-[#687080] hover:text-[#172033]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Split Among Members Chips */}
          <div>
            <label className="label text-[#172033]">Split Among</label>
            <div className="flex flex-wrap gap-2 pt-1">
              {safeMembers.map((m) => {
                const mId = String(m.userId?._id || m.userId || m._id || '')
                const mName = m.userId?.name || m.name || m.email || 'Member'
                const isMe = mId === String(user?._id || '')
                const isSelected = selectedMemberIds.includes(mId)
                const firstName = mName.split(' ')[0]
                const displayName = isMe ? `${firstName} (You)` : firstName

                return (
                  <button
                    key={mId}
                    type="button"
                    onClick={() => toggleMember(mId)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 border transition-all ${
                      isSelected
                        ? 'bg-[#5F402B] text-white border-[#5F402B] shadow-xs'
                        : 'bg-[#F2EEE7] text-[#687080] border-[#E5DED3] hover:bg-[#E5DED3]'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                    <span>{displayName}</span>
                  </button>
                )
              })}
            </div>

            {/* Custom Amounts/Percentages Inputs */}
            {splitType !== 'equal' && (
              <div className="mt-3 space-y-2 p-3.5 bg-[#F2EEE7] rounded-xl border border-[#E5DED3]">
                <p className="text-xs font-semibold text-[#687080]">
                  {splitType === 'exact' ? `Enter exact amount for each member (${currencySymbol}):` : 'Enter percentage share for each member (%):'}
                </p>
                {safeMembers
                  .filter((m) => {
                    const mId = String(m.userId?._id || m.userId || m._id || '')
                    return selectedMemberIds.includes(mId)
                  })
                  .map((m) => {
                    const mId = String(m.userId?._id || m.userId || m._id || '')
                    const mName = m.userId?.name || m.name || m.email || 'Member'
                    return (
                      <div key={mId} className="flex items-center justify-between text-xs gap-3">
                        <span className="font-semibold text-[#172033]">{mName}</span>
                        <input
                          type="number"
                          step="0.01"
                          className="input max-w-28 py-1 px-2.5 text-right font-bold border-[#E5DED3] focus:border-[#5F402B]"
                          placeholder={splitType === 'exact' ? '0.00' : '0%'}
                          value={customShares[mId] !== undefined ? customShares[mId] : ''}
                          onChange={(e) => handleShareChange(mId, e.target.value)}
                        />
                      </div>
                    )
                  })}
              </div>
            )}

            {/* Validation Error Banner */}
            {!validationState.valid && (
              <div className="mt-2.5 p-3 rounded-xl bg-red-50 border border-red-200 text-[#D65B57] text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="font-semibold">{validationState.message}</span>
              </div>
            )}
          </div>

          {/* Optional Receipt Upload Zone with Pre-submission File Removal */}
          <div>
            <label className="label text-[#172033]">Upload Receipt (Optional)</label>
            {receiptFile ? (
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-[#E5DED3] bg-[#F2EEE7]">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-[#E5DED3] text-[#5F402B] flex items-center justify-center shrink-0 font-bold">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#172033] truncate">{receiptFile.name}</p>
                    <p className="text-[10px] text-[#687080] font-semibold">{formatFileSize(receiptFile.size)}</p>
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
                  id="receipt-file-input"
                  onChange={(e) => e.target.files?.[0] && setReceiptFile(e.target.files[0])}
                />
                <Upload className="w-6 h-6 text-[#5F402B] mb-1.5" />
                <p className="text-xs font-bold text-[#172033]">
                  Drag & drop an image or PDF, or select a file
                </p>
                <p className="text-[10px] text-[#687080] mt-0.5 mb-2.5">Supports JPG, PNG, PDF</p>
                <label
                  htmlFor="receipt-file-input"
                  className="btn-secondary py-1.5 px-3.5 text-xs inline-flex items-center gap-1.5 cursor-pointer font-bold shadow-xs hover:bg-[#E5DED3]"
                >
                  <Upload className="w-3.5 h-3.5 text-[#5F402B]" /> Choose File
                </label>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#E5DED3]">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !validationState.valid}
              className="btn-primary"
            >
              {loading ? 'Adding...' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
