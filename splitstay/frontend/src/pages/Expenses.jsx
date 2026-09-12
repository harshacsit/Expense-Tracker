import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import axiosClient from '../api/axiosClient'
import toast from 'react-hot-toast'
import ExpenseForm from '../components/ExpenseForm'
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Trash2,
  Receipt,
  Wifi,
  Zap,
  ShoppingBag,
  Flame,
  Film,
  UtensilsCrossed,
  Home
} from 'lucide-react'
import { getCurrencySymbol } from '../utils/exportUtils'

export default function Expenses({ house }) {
  const { user } = useAuth()
  const [expenses, setExpenses] = useState([])
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(false)
  const [showExpenseForm, setShowExpenseForm] = useState(false)

  const [activeFilter, setActiveFilter] = useState('all') // 'all' | 'month' | '3months' | 'year'
  const [searchQuery, setSearchQuery] = useState('')
  const [actionMenuOpen, setActionMenuOpen] = useState(null)

  const loadData = useCallback(async () => {
    if (!house?._id) return
    setLoading(true)
    try {
      const [expRes, memRes] = await Promise.all([
        axiosClient.get(`/houses/${house._id}/expenses`),
        axiosClient.get(`/houses/${house._id}/members`),
      ])
      setExpenses(expRes.data.expenses || [])
      setMembers(memRes.data)
    } catch (err) {
      toast.error('Failed to load expenses')
    } finally {
      setLoading(false)
    }
  }, [house?._id])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleDeleteExpense = async (expenseId) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return
    try {
      await axiosClient.delete(`/expenses/${expenseId}`)
      toast.success('Expense deleted')
      loadData()
    } catch (err) {
      toast.error('Failed to delete expense')
    }
  }

  const currencySymbol = getCurrencySymbol(house?.currency)

  // Filter expenses strictly from room data
  const filteredExpenses = expenses.filter((exp) => {
    const matchesSearch =
      exp.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.paidById?.name?.toLowerCase().includes(searchQuery.toLowerCase())

    if (!matchesSearch) return false

    if (activeFilter === 'month') {
      const expDate = new Date(exp.date)
      const now = new Date()
      return expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear()
    }

    return true
  })

  // Category Icon helper
  const getCategoryBadge = (category) => {
    switch (category?.toLowerCase()) {
      case 'groceries':
        return (
          <div className="inline-flex items-center gap-2 font-bold text-[#10205C]">
            <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs shrink-0 shadow-xs">
              <ShoppingBag className="w-3.5 h-3.5" />
            </div>
            <span>Groceries</span>
          </div>
        )
      case 'utilities':
        return (
          <div className="inline-flex items-center gap-2 font-bold text-[#10205C]">
            <div className="w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center text-white text-xs shrink-0 shadow-xs">
              <Zap className="w-3.5 h-3.5" />
            </div>
            <span>Utilities</span>
          </div>
        )
      case 'internet':
        return (
          <div className="inline-flex items-center gap-2 font-bold text-[#10205C]">
            <div className="w-7 h-7 rounded-full bg-[#2453FF] flex items-center justify-center text-white text-xs shrink-0 shadow-xs">
              <Wifi className="w-3.5 h-3.5" />
            </div>
            <span>Internet</span>
          </div>
        )
      case 'cooking gas':
      case 'food':
        return (
          <div className="inline-flex items-center gap-2 font-bold text-[#10205C]">
            <div className="w-7 h-7 rounded-full bg-rose-500 flex items-center justify-center text-white text-xs shrink-0 shadow-xs">
              <Flame className="w-3.5 h-3.5" />
            </div>
            <span className="capitalize">{category || 'Food'}</span>
          </div>
        )
      case 'entertainment':
        return (
          <div className="inline-flex items-center gap-2 font-bold text-[#10205C]">
            <div className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs shrink-0 shadow-xs">
              <Film className="w-3.5 h-3.5" />
            </div>
            <span>Entertainment</span>
          </div>
        )
      default:
        return (
          <div className="inline-flex items-center gap-2 font-bold text-[#10205C]">
            <div className="w-7 h-7 rounded-full bg-slate-600 flex items-center justify-center text-white text-xs shrink-0 shadow-xs">
              <Receipt className="w-3.5 h-3.5" />
            </div>
            <span className="capitalize">{category || 'General'}</span>
          </div>
        )
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Today'
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">Expenses</h1>
          <p className="text-slate-500 text-xs mt-0.5">Manage and filter all recorded house expenses.</p>
        </div>
        <button
          onClick={() => setShowExpenseForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Expense
        </button>
      </div>

      {/* Main Expenses Container */}
      <div className="bg-white rounded-2xl border border-[#E5DED3] shadow-card overflow-hidden">
        {/* Filter Tabs & Search Controls */}
        <div className="p-4 border-b border-[#E5DED3] space-y-4">
          {/* Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {[
              ['all', 'All Expenses'],
              ['month', 'This Month'],
              ['3months', 'Last 3 Months'],
              ['year', 'This Year'],
            ].map(([tabKey, label]) => (
              <button
                key={tabKey}
                onClick={() => setActiveFilter(tabKey)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeFilter === tabKey
                    ? 'bg-[#5F402B] text-white shadow-xs'
                    : 'bg-[#F2EEE7] text-[#687080] hover:bg-[#E5DED3]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Search Bar & Filter Icon */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                className="input pl-10 text-xs"
                placeholder="Search expenses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="p-2.5 rounded-xl border border-[#E5DED3] bg-white text-[#687080] hover:bg-[#F2EEE7] transition-colors">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Expenses Table */}
        <div className="overflow-x-auto">
          {filteredExpenses.length > 0 ? (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E5DED3] bg-[#F2EEE7] text-[#172033] font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Description</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Paid By</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5DED3] font-medium text-slate-700">
                {filteredExpenses.map((exp) => (
                  <tr key={exp._id} className="hover:bg-[#F2EEE7]/50 transition-colors">
                    <td className="py-3.5 px-4 text-[#687080] whitespace-nowrap">{formatDate(exp.date)}</td>
                    <td className="py-3.5 px-4 font-bold text-[#172033]">{exp.description}</td>
                    <td className="py-3.5 px-4">{getCategoryBadge(exp.category)}</td>
                    <td className="py-3.5 px-4 text-[#172033] font-semibold">{exp.paidById?.name || 'Member'}</td>
                    <td className="py-3.5 px-4 font-extrabold text-[#172033] text-sm">
                      {currencySymbol}{exp.amount?.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-right relative">
                      <button
                        onClick={() => setActionMenuOpen(actionMenuOpen === exp._id ? null : exp._id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-[#F2EEE7] transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      {actionMenuOpen === exp._id && (
                        <div className="absolute right-4 mt-1 w-32 bg-white rounded-xl border border-[#E5DED3] shadow-lg py-1 z-20 text-left">
                          <button
                            onClick={() => { handleDeleteExpense(exp._id); setActionMenuOpen(null) }}
                            className="w-full px-3 py-1.5 text-xs text-[#D65B57] hover:bg-[#FDF0EF] flex items-center gap-2 font-semibold"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center text-slate-500 space-y-2">
              <Receipt className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="font-bold text-[#172033] text-sm">No expenses found</p>
              <p className="text-xs text-[#687080]">Click "+ Add Expense" above to record a new expense in this room.</p>
            </div>
          )}
        </div>

        {/* Table Pagination Footer */}
        {filteredExpenses.length > 0 && (
          <div className="p-4 border-t border-[#E5DED3] flex items-center justify-between text-xs text-[#687080]">
            <span>Showing {filteredExpenses.length} of {filteredExpenses.length} expenses</span>
            <div className="flex items-center gap-1">
              <button className="px-2.5 py-1 rounded-lg border border-[#E5DED3] hover:bg-[#F2EEE7] font-bold">&lt;</button>
              <button className="px-2.5 py-1 rounded-lg bg-[#5F402B] text-white font-bold">1</button>
              <button className="px-2.5 py-1 rounded-lg border border-[#E5DED3] hover:bg-[#F2EEE7] font-bold">&gt;</button>
            </div>
          </div>
        )}
      </div>

      {/* Add Expense Modal */}
      {showExpenseForm && (
        <ExpenseForm
          houseId={house?._id}
          members={members}
          onSuccess={loadData}
          onClose={() => setShowExpenseForm(false)}
          currencySymbol={currencySymbol}
        />
      )}
    </div>
  )
}
