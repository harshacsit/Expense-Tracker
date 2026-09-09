import { useState, useEffect, useRef } from 'react'
import axiosClient from '../api/axiosClient'
import toast from 'react-hot-toast'
import { X, Plus, Minus, Home, ShoppingCart, Zap, Wifi, Flame, Tv, Tag, ChevronDown, Check } from 'lucide-react'

const CATEGORY_ITEMS = [
  { name: 'Rent', icon: Home, color: 'text-purple-400 bg-purple-500/15 border-purple-500/30' },
  { name: 'Groceries', icon: ShoppingCart, color: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30' },
  { name: 'Utilities', icon: Zap, color: 'text-yellow-400 bg-yellow-500/15 border-yellow-500/30' },
  { name: 'Internet', icon: Wifi, color: 'text-blue-400 bg-blue-500/15 border-blue-500/30' },
  { name: 'Cooking Gas', icon: Flame, color: 'text-orange-400 bg-orange-500/15 border-orange-500/30' },
  { name: 'Entertainment', icon: Tv, color: 'text-pink-400 bg-pink-500/15 border-pink-500/30' },
  { name: 'Other', icon: Tag, color: 'text-gray-300 bg-white/10 border-white/20' },
]

export default function ExpenseForm({ houseId, members, onSuccess, onClose }) {
  const [form, setForm] = useState({
    amount: '',
    category: 'Groceries',
    description: '',
    splitType: 'equal',
  })
  const [customShares, setCustomShares] = useState([])
  const [loading, setLoading] = useState(false)
  const [categoryOpen, setCategoryOpen] = useState(false)
  const categoryDropdownRef = useRef(null)

  // Close category dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(e.target)) {
        setCategoryOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedCategory = CATEGORY_ITEMS.find((c) => c.name === form.category) || CATEGORY_ITEMS[1]
  const SelectedIcon = selectedCategory.icon

  // Initialize custom shares when switching to custom
  useEffect(() => {
    if (form.splitType === 'custom' && members.length > 0) {
      const perPerson = form.amount ? parseFloat((parseFloat(form.amount) / members.length).toFixed(2)) : 0
      setCustomShares(members.map((m) => ({ userId: m._id, name: m.name, amountOwed: perPerson })))
    }
  }, [form.splitType, members])

  const updateShare = (userId, value) => {
    setCustomShares((prev) => prev.map((s) => s.userId === userId ? { ...s, amountOwed: parseFloat(value) || 0 } : s))
  }

  const sharesTotal = customShares.reduce((s, c) => s + (c.amountOwed || 0), 0)
  const amountNum = parseFloat(form.amount) || 0
  const shareDiff = parseFloat((sharesTotal - amountNum).toFixed(2))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.amount || parseFloat(form.amount) <= 0) return toast.error('Enter a valid amount')
    if (form.splitType === 'custom' && Math.abs(shareDiff) > 0.01) {
      return toast.error(`Shares must sum to ₹${amountNum}. Current: ₹${sharesTotal.toFixed(2)}`)
    }

    setLoading(true)
    try {
      await axiosClient.post(`/houses/${houseId}/expenses`, {
        amount: parseFloat(form.amount),
        category: form.category,
        description: form.description,
        splitType: form.splitType,
        customShares: form.splitType === 'custom' ? customShares.map(s => ({ userId: s.userId, amountOwed: s.amountOwed })) : undefined,
      })
      toast.success('Expense added! 💸')
      onSuccess?.()
      onClose?.()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add expense')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md glass rounded-2xl p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold">Add Expense</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount */}
          <div>
            <label className="label">Amount (₹)</label>
            <input
              id="expense-amount"
              type="number"
              min="0.01"
              step="0.01"
              className="input text-xl font-bold"
              placeholder="0.00"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
            />
          </div>

          {/* Category */}
          <div className="relative" ref={categoryDropdownRef}>
            <label className="label">Category</label>
            <button
              type="button"
              id="expense-category-btn"
              onClick={() => setCategoryOpen(!categoryOpen)}
              className="input flex items-center justify-between text-left cursor-pointer hover:border-brand-500/50"
            >
              <div className="flex items-center gap-2.5">
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center border ${selectedCategory.color}`}>
                  <SelectedIcon className="w-4 h-4" />
                </span>
                <span className="font-medium text-white">{selectedCategory.name}</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-white/40 transition-transform duration-200 ${categoryOpen ? 'rotate-180 text-brand-400' : ''}`} />
            </button>

            {/* Hidden select for form accessibility/compatibility */}
            <select
              id="expense-category"
              className="sr-only"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              tabIndex={-1}
              aria-hidden="true"
            >
              {CATEGORY_ITEMS.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
            </select>

            {/* Custom dark glass dropdown */}
            {categoryOpen && (
              <div className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-xl border border-white/10 bg-[#16172a] shadow-2xl p-1.5 space-y-1 backdrop-blur-xl max-h-60 overflow-y-auto">
                {CATEGORY_ITEMS.map((cat) => {
                  const Icon = cat.icon
                  const isSelected = form.category === cat.name
                  return (
                    <button
                      key={cat.name}
                      type="button"
                      onClick={() => {
                        setForm({ ...form, category: cat.name })
                        setCategoryOpen(false)
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors text-left ${
                        isSelected ? 'bg-brand-600/30 text-white font-medium border border-brand-500/30' : 'text-white/80 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`w-7 h-7 rounded-lg flex items-center justify-center border ${cat.color}`}>
                          <Icon className="w-4 h-4" />
                        </span>
                        <span>{cat.name}</span>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-brand-400" />}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="label">Description (optional)</label>
            <input
              id="expense-description"
              type="text"
              className="input"
              placeholder="e.g. Monthly grocery run"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          {/* Split Type Toggle */}
          <div>
            <label className="label">Split Type</label>
            <div className="flex glass rounded-xl p-1 gap-1">
              {['equal', 'custom'].map((type) => (
                <button
                  key={type}
                  type="button"
                  id={`split-${type}`}
                  onClick={() => setForm({ ...form, splitType: type })}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-all ${form.splitType === type ? 'bg-brand-600 text-white' : 'text-white/50 hover:text-white/80'}`}
                >
                  {type === 'equal' ? '÷ Equal' : '✏️ Custom'}
                </button>
              ))}
            </div>
          </div>

          {/* Custom shares */}
          {form.splitType === 'custom' && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="label mb-0">Per Person Amount</label>
                <span className={`text-xs font-medium ${Math.abs(shareDiff) > 0.01 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {Math.abs(shareDiff) > 0.01 ? `₹${Math.abs(shareDiff).toFixed(2)} ${shareDiff > 0 ? 'over' : 'under'}` : '✓ Balanced'}
                </span>
              </div>
              {customShares.map((s) => (
                <div key={s.userId} className="flex items-center gap-3">
                  <div className="avatar w-8 h-8 text-xs shrink-0">{s.name[0]}</div>
                  <span className="text-sm text-white/70 flex-1 truncate">{s.name}</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="input w-28 text-right text-sm py-2"
                    value={s.amountOwed}
                    onChange={(e) => updateShare(s.userId, e.target.value)}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Equal split preview */}
          {form.splitType === 'equal' && form.amount && members.length > 0 && (
            <div className="glass rounded-xl p-3 text-center">
              <p className="text-xs text-white/40">Each person pays</p>
              <p className="text-xl font-bold text-gradient">₹{(parseFloat(form.amount) / members.length).toFixed(2)}</p>
              <p className="text-xs text-white/30">split equally among {members.length} members</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button
              id="expense-submit"
              type="submit"
              disabled={loading}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {loading ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Plus className="w-4 h-4" />}
              {loading ? 'Adding...' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
