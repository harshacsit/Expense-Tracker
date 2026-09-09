import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import axiosClient from '../api/axiosClient'
import ExpenseList from '../components/ExpenseList'
import { ArrowLeft, Filter, Search } from 'lucide-react'

const CATEGORIES = ['All', 'Rent', 'Groceries', 'Utilities', 'Internet', 'Cooking Gas', 'Entertainment', 'Other']

export default function History() {
  const [house, setHouse] = useState(() => {
    const stored = localStorage.getItem('splitstay_house')
    return stored ? JSON.parse(stored) : null
  })
  const [members, setMembers] = useState([])
  const [expenses, setExpenses] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({ category: '', member: '' })
  const LIMIT = 20

  const loadData = useCallback(async () => {
    if (!house?._id) return
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, limit: LIMIT })
      if (filters.category && filters.category !== 'All') params.set('category', filters.category)
      if (filters.member) params.set('member', filters.member)

      const [expRes, membersRes] = await Promise.all([
        axiosClient.get(`/houses/${house._id}/expenses?${params}`),
        axiosClient.get(`/houses/${house._id}/members`),
      ])
      setExpenses(expRes.data.expenses || [])
      setTotal(expRes.data.total || 0)
      setMembers(membersRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [house?._id, page, filters])

  useEffect(() => { loadData() }, [loadData])
  useEffect(() => { setPage(1) }, [filters])

  const totalPages = Math.ceil(total / LIMIT)

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-40 glass border-b border-white/5 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Link to="/dashboard" id="back-to-dashboard" className="p-2 rounded-lg hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-bold">Transaction History</h1>
            <p className="text-xs text-white/40">{house?.name} · {total} total expense{total !== 1 ? 's' : ''}</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Filters */}
        <div className="glass rounded-2xl p-4 mb-6 flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label className="label">Filter by Category</label>
            <select
              id="filter-category"
              className="input"
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            >
              {CATEGORIES.map((c) => <option key={c} value={c === 'All' ? '' : c}>{c}</option>)}
            </select>
          </div>
          <div className="flex-1">
            <label className="label">Filter by Member</label>
            <select
              id="filter-member"
              className="input"
              value={filters.member}
              onChange={(e) => setFilters({ ...filters, member: e.target.value })}
            >
              <option value="">All Members</option>
              {members.map((m) => <option key={m._id} value={m._id}>{m.name}</option>)}
            </select>
          </div>
          {(filters.category || filters.member) && (
            <div className="flex items-end">
              <button
                id="clear-filters"
                onClick={() => setFilters({ category: '', member: '' })}
                className="btn-secondary whitespace-nowrap"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Monthly summary */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-white/40 text-sm">{total} expense{total !== 1 ? 's' : ''} found</p>
          {expenses.length > 0 && (
            <p className="text-sm font-medium">
              Total: <span className="text-gradient font-bold">₹{expenses.reduce((s, e) => s + e.amount, 0).toLocaleString('en-IN')}</span>
              {total > LIMIT && <span className="text-white/30"> (this page)</span>}
            </p>
          )}
        </div>

        {/* List */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <ExpenseList expenses={expenses} onDelete={loadData} />
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-8">
            <button
              id="prev-page"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="btn-secondary py-2 px-4 text-sm disabled:opacity-30"
            >
              ← Prev
            </button>
            <span className="text-white/40 text-sm">Page {page} of {totalPages}</span>
            <button
              id="next-page"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="btn-secondary py-2 px-4 text-sm disabled:opacity-30"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
