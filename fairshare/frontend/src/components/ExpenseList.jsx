import axiosClient from '../api/axiosClient'
import toast from 'react-hot-toast'
import { Trash2, ShoppingCart, Zap, Wifi, Flame, Tv, Tag, Home } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const categoryConfig = {
  Rent:         { icon: Home,         cls: 'cat-rent' },
  Groceries:    { icon: ShoppingCart,  cls: 'cat-groceries' },
  Utilities:    { icon: Zap,          cls: 'cat-utilities' },
  Internet:     { icon: Wifi,         cls: 'cat-internet' },
  'Cooking Gas':{ icon: Flame,        cls: 'cat-gas' },
  Entertainment:{ icon: Tv,           cls: 'cat-entertainment' },
  Other:        { icon: Tag,          cls: 'cat-other' },
}

const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

export default function ExpenseList({ expenses, onDelete, currencySymbol = 'Γé╣' }) {
  const { user } = useAuth()

  const handleDelete = async (expense) => {
    if (!confirm(`Delete "${expense.category}" expense of ${currencySymbol}${expense.amount}?`)) return
    try {
      await axiosClient.delete(`/expenses/${expense._id}`)
      toast.success('Expense deleted')
      onDelete?.()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete')
    }
  }

  if (!expenses || expenses.length === 0) {
    return (
      <div className="saas-card p-12 text-center">
        <ShoppingCart className="w-12 h-12 text-[#687080]/30 mx-auto mb-3" />
        <p className="text-[#687080]">No expenses yet. Add your first one!</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {expenses.map((exp) => {
        const config = categoryConfig[exp.category] || categoryConfig.Other
        const Icon = config.icon
        const payerId = String(exp.paidById?._id || exp.paidById || '')
        const currentUserId = String(user?._id || '')
        const isOwner = Boolean(payerId && currentUserId && payerId === currentUserId)

        return (
          <div key={exp._id} className="saas-card p-4 flex items-center gap-4 hover:border-[#5F402B]/30 transition-all">
            {/* Category icon */}
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${config.cls} shrink-0`}>
              <Icon className="w-5 h-5" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-sm text-[#172033] truncate">{exp.category}</span>
                {exp.description && (
                  <span className="text-[#687080] text-xs truncate hidden sm:block">┬╖ {exp.description}</span>
                )}
              </div>
              <p className="text-xs text-[#687080] mt-0.5">
                Paid by <span className="text-[#172033] font-medium">{exp.paidById?.name || 'Unknown'}</span>
                {' ┬╖ '}{formatDate(exp.date)}
                {' ┬╖ '}<span className="capitalize">{exp.splitType} split</span>
              </p>
            </div>

            {/* Amount */}
            <div className="text-right shrink-0">
              <p className="font-bold text-lg text-[#172033]">{currencySymbol}{exp.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              {exp.shares && exp.shares.length > 0 && (
                <p className="text-xs text-[#687080]">
                  {exp.splitType === 'equal'
                    ? `${currencySymbol}${(exp.amount / exp.shares.length).toFixed(2)} each`
                    : `${exp.shares.length} shares`}
                </p>
              )}
            </div>

            {/* Delete (only for owner) */}
            {isOwner && (
              <button
                id={`delete-expense-${exp._id}`}
                onClick={() => handleDelete(exp)}
                className="btn-danger p-2 shrink-0"
                title="Delete expense"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}
