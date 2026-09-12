import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import axiosClient from '../api/axiosClient'
import ExpenseList from '../components/ExpenseList'
import { ArrowLeft, Filter, Search, Download, Printer, ChevronDown, X } from 'lucide-react'
import { getCurrencySymbol, exportExpensesToCSV, printExpenseStatement } from '../utils/exportUtils'
import toast from 'react-hot-toast'

const CATEGORIES = ['All', 'Rent', 'Groceries', 'Utilities', 'Internet', 'Cooking Gas', 'Entertainment', 'Other']

export default function History() {
  const [houses, setHouses] = useState([])
  const [house, setHouse] = useState(() => {
    const stored = localStorage.getItem('fairshare_house') || localStorage.getItem('splitstay_house')
    return stored ? JSON.parse(stored) : null
  })
  const [members, setMembers] = useState([])
  const [expenses, setExpenses] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({ category: '', member: '', search: '' })
  const LIMIT = 20

  // Fallback: Fetch user's houses if house is not set or to allow switching
  useEffect(() => {
    axiosClient.get('/houses').then(({ data }) => {
      setHouses(data || [])
      if (!house && data && data.length > 0) {
        setHouse(data[0])
        localStorage.setItem('fairshare_house', JSON.stringify(data[0]))
      }
    }).catch(console.error)
  }, [])

  const handleHouseChange = (newHouseId) => {
    const selected = houses.find((h) => h._id === newHouseId)
    if (selected) {
      setHouse(selected)
      localStorage.setItem('fairshare_house', JSON.stringify(selected))
      setPage(1)
    }
  }

  const currencySymbol = getCurrencySymbol(house?.currency)

  const handleExportCSV = () => {
    try {
      if (expenses.length === 0) {
        toast('No expenses in this view. Generating template CSV...', { icon: '📄' })
      }
      exportExpensesToCSV(house?.name, expenses, currencySymbol)
      toast.success('CSV downloaded! 📊')
    } catch (err) {
      toast.error(err.message || 'Export failed')
    }
  }

  const handlePrintStatement = () => {
    try {
      printExpenseStatement(house, expenses, [], currencySymbol)
    } catch (err) {
      toast.error(err.message || 'Print failed')
    }
  }

  const loadData = useCallback(async () => {
    if (!house?._id) return
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, limit: LIMIT })
      if (filters.category && filters.category !== 'All') params.set('category', filters.category)
      if (filters.member) params.set('member', filters.member)
      if (filters.search && filters.search.trim()) params.set('search', filters.search.trim())

      const [expRes, membersRes] = await Promise.all([
        axiosClient.get(`/houses/${house._id}/expenses?${params}`),
        axiosClient.get(`/houses/${house._id}/members`),
      ])
      setExpenses(expRes.data.expenses || [])
      setTotal(expRes.data.total || 0)
      setMembers(membersRes.data || [])
    } catch (err) {
      console.error('Failed to load history data:', err)
      toast.error('Failed to load transactions')
    } finally {
      setLoading(false)
    }
  }, [house?._id, page, filters.category, filters.member, filters.search])

  useEffect(() => {
    loadData()
  }, [loadData])

  useEffect(() => {
    setPage(1)
  }, [filters.category, filters.member, filters.search])

  const totalPages = Math.ceil(total / LIMIT)
  const isFiltered = Boolean(filters.category || filters.member || filters.search)

  return (
    <div className="min-h-screen bg-dark-900 pb-16">
      {/* Header */}
      <div className="sticky top-0 z-40 glass border-b border-white/10 px-4 py-3 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              id="back-to-dashboard"
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-white/80 hover:text-white"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-lg text-white">Transaction History</h1>
                {houses.length > 1 && (
                  <select
                    id="history-house-select"
                    value={house?._id || ''}
                    onChange={(e) => handleHouseChange(e.target.value)}
                    className="text-xs bg-brand-600/20 border border-brand-500/30 rounded-lg px-2 py-0.5 text-brand-300 font-semibold cursor-pointer outline-hidden"
                  >
                    {houses.map((h) => (
                      <option key={h._id} value={h._id} className="bg-dark-800 text-white">
                        {h.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <p className="text-xs text-white/50">
                {house?.name || 'Loading house...'} · {total} expense{total !== 1 ? 's' : ''} recorded
              </p>
            </div>
          </div>

          {/* Export Actions */}
          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              id="history-export-csv"
              onClick={handleExportCSV}
              className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1.5 hover:border-brand-500/50"
              title="Download spreadsheet CSV"
            >
              <Download className="w-3.5 h-3.5 text-brand-400" /> Export CSV
            </button>
            <button
              id="history-print-statement"
              onClick={handlePrintStatement}
              className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1.5 hover:border-brand-500/50"
              title="Print or save PDF statement"
            >
              <Printer className="w-3.5 h-3.5 text-brand-400" /> Print / PDF
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Filter Controls Bar */}
        <div className="glass rounded-2xl p-4 mb-6 space-y-3">
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="history-search"
              type="text"
              className="input pl-10 pr-9 py-2 text-sm w-full"
              placeholder="Search expenses by description or category..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
            {filters.search && (
              <button
                onClick={() => setFilters({ ...filters, search: '' })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category & Member Dropdowns */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label className="label text-xs">Filter by Category</label>
              <select
                id="filter-category"
                className="input py-2 text-sm"
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c === 'All' ? '' : c} className="bg-dark-800 text-white">
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1">
              <label className="label text-xs">Filter by Member</label>
              <select
                id="filter-member"
                className="input py-2 text-sm"
                value={filters.member}
                onChange={(e) => setFilters({ ...filters, member: e.target.value })}
              >
                <option value="" className="bg-dark-800 text-white">All Members</option>
                {members.map((m) => (
                  <option key={m._id} value={m._id} className="bg-dark-800 text-white">
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            {isFiltered && (
              <div className="flex items-end">
                <button
                  id="clear-filters"
                  onClick={() => setFilters({ category: '', member: '', search: '' })}
                  className="btn-secondary py-2 px-3 text-xs whitespace-nowrap text-brand-300 hover:text-brand-200"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Results Info Bar */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-white/50 text-sm">
            {total} expense{total !== 1 ? 's' : ''} found
            {isFiltered && <span className="text-brand-400 font-medium"> (filtered)</span>}
          </p>
          {expenses.length > 0 && (
            <p className="text-sm font-medium">
              Total:{' '}
              <span className="text-gradient font-bold">
                {currencySymbol}
                {expenses
                  .reduce((s, e) => s + (e.amount || 0), 0)
                  .toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              {total > LIMIT && <span className="text-white/30 text-xs"> (page {page})</span>}
            </p>
          )}
        </div>

        {/* Expense List Content */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : expenses.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <Filter className="w-10 h-10 text-white/20 mx-auto mb-3" />
            <h4 className="text-white font-semibold mb-1">
              {isFiltered ? 'No matching expenses' : 'No expenses recorded yet'}
            </h4>
            <p className="text-white/40 text-sm max-w-sm mx-auto mb-4">
              {isFiltered
                ? 'Try adjusting or clearing your search and filter criteria.'
                : 'Expenses logged by roommates in this house will appear here.'}
            </p>
            {isFiltered ? (
              <button
                onClick={() => setFilters({ category: '', member: '', search: '' })}
                className="btn-secondary text-xs"
              >
                Reset Filters
              </button>
            ) : (
              <Link to="/dashboard" className="btn-primary text-xs inline-flex items-center gap-2">
                Go to Dashboard
              </Link>
            )}
          </div>
        ) : (
          <ExpenseList expenses={expenses} onDelete={loadData} currencySymbol={currencySymbol} />
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-8">
            <button
              id="prev-page"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="btn-secondary py-2 px-4 text-sm disabled:opacity-30 transition-all"
            >
              ← Prev
            </button>
            <span className="text-white/50 text-sm font-medium">
              Page {page} of {totalPages}
            </span>
            <button
              id="next-page"
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="btn-secondary py-2 px-4 text-sm disabled:opacity-30 transition-all"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
