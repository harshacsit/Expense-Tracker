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

export default function ExpenseList({ expenses, onDelete }) {
  const { user } = useAuth()

  const handleDelete = async (expense) => {
    if (!confirm(`Delete "${expense.category}" expense of ₹${expense.amount}?`)) return
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
      <div className="glass rounded-2xl p-12 text-center">
        <ShoppingCart className="w-12 h-12 text-white/20 mx-auto mb-3" />
        <p className="text-white/40">No expenses yet. Add your first one!</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {expenses.map((exp) => {
        const config = categoryConfig[exp.category] || categoryConfig.Other
        const Icon = config.icon
        const isOwner = exp.paidById?._id === user?._id || exp.paidById === user?._id

        return (
          <div key={exp._id} className="glass-hover rounded-xl p-4 flex items-center gap-4">
            {/* Category icon */}
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${config.cls} shrink-0`}>
              <Icon className="w-5 h-5" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-sm truncate">{exp.category}</span>
                {exp.description && (
                  <span className="text-white/40 text-xs truncate hidden sm:block">· {exp.description}</span>
                )}
              </div>
              <p className="text-xs text-white/40 mt-0.5">
                Paid by <span className="text-white/60 font-medium">{exp.paidById?.name || 'Unknown'}</span>
                {' · '}{formatDate(exp.date)}
                {' · '}<span className="capitalize">{exp.splitType} split</span>
              </p>
            </div>

            {/* Amount */}
            <div className="text-right shrink-0">
              <p className="font-bold text-lg">₹{exp.amount.toLocaleString('en-IN')}</p>
              {exp.shares && exp.shares.length > 0 && (
                <p className="text-xs text-white/30">₹{(exp.amount / exp.shares.length).toFixed(2)} each</p>
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
