import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import axiosClient from '../api/axiosClient'
import toast from 'react-hot-toast'
import AppLayout from '../components/AppLayout'
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
  Home,
  Download,
  Printer
} from 'lucide-react'
import { getCurrencySymbol, exportExpensesToCSV, printExpenseStatement } from '../utils/exportUtils'

export default function Expenses({ house: propHouse }) {
  const { user } = useAuth()
  const [house, setHouse] = useState(() => {
    if (propHouse) return propHouse
    const stored = localStorage.getItem('fairshare_house')
    return stored ? JSON.parse(stored) : null
  })
  const [expenses, setExpenses] = useState([])
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(false)
  const [showExpenseForm, setShowExpenseForm] = useState(false)

  const [activeFilter, setActiveFilter] = useState('all') // 'all' | 'month' | '3months' | 'year'
  const [searchQuery, setSearchQuery] = useState('')
  const [actionMenuOpen, setActionMenuOpen] = useState(null)

  // Fallback to fetch house if not present
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

  const handleExportCSV = () => {
    try {
      if (expenses.length === 0) {
        toast('No expenses logged yet. Generating template CSV...', { icon: '📄' })
      }
      exportExpensesToCSV(house?.name, filteredExpenses, currencySymbol)
      toast.success('CSV downloaded! 📊')
    } catch (err) {
      toast.error(err.message || 'Export failed')
    }
  }

  const handlePrintStatement = () => {
    try {
      printExpenseStatement(house, filteredExpenses, [], currencySymbol)
    } catch (err) {
      toast.error(err.message || 'Print failed')
    }
  }

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
          <div className="inline-flex items-center gap-2 font-bold text-[#172033]">
            <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs shrink-0 shadow-xs">
              <ShoppingBag className="w-3.5 h-3.5" />
            </div>
            <span>Groceries</span>
          </div>
        )
      case 'utilities':
        return (
          <div className="inline-flex items-center gap-2 font-bold text-[#172033]">
            <div className="w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center text-white text-xs shrink-0 shadow-xs">
              <Zap className="w-3.5 h-3.5" />
            </div>
            <span>Utilities</span>
          </div>
        )
      case 'internet':
        return (
          <div className="inline-flex items-center gap-2 font-bold text-[#172033]">
            <div className="w-7 h-7 rounded-full bg-[#2453FF] flex items-center justify-center text-white text-xs shrink-0 shadow-xs">
              <Wifi className="w-3.5 h-3.5" />
            </div>
            <span>Internet</span>
          </div>
        )
      case 'cooking gas':
      case 'gas':
      case 'food':
        return (
          <div className="inline-flex items-center gap-2 font-bold text-[#172033]">
            <div className="w-7 h-7 rounded-full bg-rose-500 flex items-center justify-center text-white text-xs shrink-0 shadow-xs">
              <Flame className="w-3.5 h-3.5" />
            </div>
            <span>Gas & Food</span>
          </div>
        )
      case 'entertainment':
        return (
          <div className="inline-flex items-center gap-2 font-bold text-[#172033]">
            <div className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs shrink-0 shadow-xs">
              <Film className="w-3.5 h-3.5" />
            </div>
            <span>Entertainment</span>
          </div>
        )
      default:
        return (
          <div className="inline-flex items-center gap-2 font-bold text-[#172033]">
            <div className="w-7 h-7 rounded-full bg-slate-600 flex items-center justify-center text-white text-xs shrink-0 shadow-xs">
              <Receipt className="w-3.5 h-3.5" />
            </div>
            <span>{category || 'Other'}</span>
          </div>
        )
    }
  }

  const formatDate = (d) => {
    if (!d) return 'N/A'
    return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <AppLayout house={house} onSelectHouse={setHouse}>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-[#172033] tracking-tight">Expenses</h1>
            <p className="text-[#687080] text-xs mt-0.5">Manage and audit all expenses logged in your room.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#E5DED3] bg-white text-xs font-semibold text-[#172033] hover:bg-[#F2EEE7] transition-colors shadow-xs"
              title="Download CSV"
            >
              <Download className="w-3.5 h-3.5 text-[#5F402B]" /> Export CSV
            </button>
            <button
              onClick={handlePrintStatement}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#E5DED3] bg-white text-xs font-semibold text-[#172033] hover:bg-[#F2EEE7] transition-colors shadow-xs"
              title="Print"
            >
              <Printer className="w-3.5 h-3.5 text-[#5F402B]" /> Print
            </button>
            <button
              onClick={() => setShowExpenseForm(true)}
              className="btn-primary flex items-center gap-2 shadow-xs"
            >
              <Plus className="w-4 h-4" /> Add Expense
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white rounded-2xl border border-[#E5DED3] p-4 shadow-card flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search expenses by description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10 py-2 text-xs"
            />
          </div>

          {/* Timeframe Filter Buttons */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeFilter === 'all'
                  ? 'bg-[#5F402B] text-white shadow-xs'
                  : 'bg-[#F2EEE7] text-[#687080] hover:text-[#172033]'
              }`}
            >
              All Time
            </button>
            <button
              onClick={() => setActiveFilter('month')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeFilter === 'month'
                  ? 'bg-[#5F402B] text-white shadow-xs'
                  : 'bg-[#F2EEE7] text-[#687080] hover:text-[#172033]'
              }`}
            >
              This Month
            </button>
          </div>
        </div>

        {/* Expenses Table */}
        <div className="bg-white rounded-2xl border border-[#E5DED3] shadow-card overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-400 text-xs font-semibold">
              Loading expenses...
            </div>
          ) : filteredExpenses.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E5DED3] bg-[#FAF8F4] text-[11px] font-bold uppercase tracking-wider text-[#687080]">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Paid By</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5DED3] text-xs font-medium text-[#172033]">
                {filteredExpenses.map((exp) => (
                  <tr key={exp._id} className="hover:bg-[#F2EEE7]/50 transition-colors">
                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                      {formatDate(exp.date)}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#172033]">
                      {exp.description}
                    </td>
                    <td className="py-3.5 px-4">
                      {getCategoryBadge(exp.category)}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#5F402B] text-white font-bold text-[10px] flex items-center justify-center">
                          {exp.paidById?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <span className="font-semibold text-[#172033]">
                          {exp.paidById?.name || 'Member'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-extrabold text-[#172033] text-sm">
                      {currencySymbol}{exp.amount?.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-center relative">
                      <button
                        onClick={() => setActionMenuOpen(actionMenuOpen === exp._id ? null : exp._id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-[#F2EEE7]"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {actionMenuOpen === exp._id && (
                        <div className="absolute right-4 mt-1 bg-white rounded-xl border border-[#E5DED3] shadow-card py-1 z-20 text-xs w-28">
                          <button
                            onClick={() => {
                              setActionMenuOpen(null)
                              handleDeleteExpense(exp._id)
                            }}
                            className="w-full text-left px-3 py-1.5 text-[#D65B57] hover:bg-[#FDF0EF] flex items-center gap-2 font-bold"
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
    </AppLayout>
  )
}
