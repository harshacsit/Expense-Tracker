import { useState, useEffect, useCallback, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useHouseBalances } from '../hooks/useHouseBalances'
import axiosClient from '../api/axiosClient'
import toast from 'react-hot-toast'

import AppLayout from '../components/AppLayout'
import CategoryDonutChart from '../components/CategoryDonutChart'
import ExpenseForm from '../components/ExpenseForm'
import SettleUpModal from '../components/SettleUpModal'

import {
  TrendingUp,
  CreditCard,
  Users,
  Receipt,
  Plus,
  HandCoins,
  Scale,
  ArrowRight,
  Wifi,
  Zap,
  ShoppingBag,
  Flame,
  Film,
  Home as HomeIcon,
  Calendar,
  Download,
  Printer
} from 'lucide-react'
import { getCurrencySymbol, exportExpensesToCSV, printExpenseStatement } from '../utils/exportUtils'

export default function Dashboard({ house: propHouse, houses: propHouses = [], onSelectHouse: propOnSelectHouse }) {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [house, setHouse] = useState(() => {
    if (propHouse) return propHouse
    const stored = localStorage.getItem('fairshare_house') || localStorage.getItem('splitstay_house')
    return stored ? JSON.parse(stored) : null
  })
  const [houses, setHouses] = useState(propHouses)
  const [members, setMembers] = useState([])
  const [expenses, setExpenses] = useState([])
  const [loadingData, setLoadingData] = useState(false)
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [showSettleModal, setShowSettleModal] = useState(false)

  // Fetch houses if not present
  useEffect(() => {
    if (!house || houses.length === 0) {
      axiosClient
        .get('/houses')
        .then(({ data }) => {
          const list = data || []
          setHouses(list)
          if (!house && list.length > 0) {
            setHouse(list[0])
            localStorage.setItem('fairshare_house', JSON.stringify(list[0]))
          }
        })
        .catch(() => {})
    }
  }, [house])

  const handleSelectHouse = (h) => {
    setHouse(h)
    localStorage.setItem('fairshare_house', JSON.stringify(h))
    if (propOnSelectHouse) propOnSelectHouse(h)
  }

  const { balances, refetch: refetchBalances } = useHouseBalances(house?._id)

  const loadHouseData = useCallback(async () => {
    if (!house?._id) return
    setLoadingData(true)
    try {
      const [membersRes, expensesRes] = await Promise.all([
        axiosClient.get(`/houses/${house._id}/members`),
        axiosClient.get(`/houses/${house._id}/expenses`),
      ])
      setMembers(membersRes.data)
      setExpenses(expensesRes.data.expenses || [])
      refetchBalances()
    } catch (err) {
      toast.error('Failed to load house data')
    } finally {
      setLoadingData(false)
    }
  }, [house?._id, refetchBalances])

  useEffect(() => {
    loadHouseData()
  }, [loadHouseData])

  // Dynamic Browser Date
  const formattedToday = useMemo(() => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }, [])

  // Dynamic Greeting based on authenticated user name
  const greetingName = user?.name ? user.name.split(' ')[0] : 'User'

  // Summary calculation logic
  const totalAllExpenses = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0)
  const currentMonthExpenses = expenses
    .filter((e) => {
      const d = new Date(e.date || e.createdAt)
      const now = new Date()
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    })
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0)
  
  const myBalance = balances.find((b) => b.email === user?.email || String(b.userId) === String(user?._id))
  const currencySymbol = getCurrencySymbol(house?.currency)

  const displayTotalExpenses = expenses.length > 0 ? (currentMonthExpenses > 0 ? currentMonthExpenses : totalAllExpenses) : 0
  const displayBalance = myBalance ? myBalance.netBalance : 0
  const displayMemberCount = members.length
  const displayExpenseCount = expenses.length

  // Helper for category icons
  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'groceries':
        return (
          <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white shrink-0 shadow-xs">
            <ShoppingBag className="w-4 h-4" />
          </div>
        )
      case 'utilities':
        return (
          <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white shrink-0 shadow-xs">
            <Zap className="w-4 h-4" />
          </div>
        )
      case 'internet':
        return (
          <div className="w-8 h-8 rounded-full bg-[#2453FF] flex items-center justify-center text-white shrink-0 shadow-xs">
            <Wifi className="w-4 h-4" />
          </div>
        )
      case 'cooking gas':
      case 'gas':
      case 'food':
        return (
          <div className="w-8 h-8 rounded-full bg-rose-500 flex items-center justify-center text-white shrink-0 shadow-xs">
            <Flame className="w-4 h-4" />
          </div>
        )
      case 'entertainment':
        return (
          <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white shrink-0 shadow-xs">
            <Film className="w-4 h-4" />
          </div>
        )
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-white shrink-0 shadow-xs">
            <Receipt className="w-4 h-4" />
          </div>
        )
    }
  }

  // Format date string
  const formatDate = (dateStr) => {
    if (!dateStr) return 'Today'
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const handleExportCSV = () => {
    try {
      if (expenses.length === 0) {
        toast('No expenses logged yet. Generating template CSV...', { icon: '📄' })
      }
      exportExpensesToCSV(house?.name, expenses, currencySymbol)
      toast.success('CSV statement downloaded! 📊')
    } catch (err) {
      toast.error(err.message || 'Export failed')
    }
  }

  const handlePrintStatement = () => {
    try {
      printExpenseStatement(house, expenses, balances, currencySymbol)
    } catch (err) {
      toast.error(err.message || 'Print failed')
    }
  }

  // Empty state when user is not part of any house
  if (!house && (!houses || houses.length === 0) && !loadingData) {
    return (
      <AppLayout house={house} houses={houses} onSelectHouse={handleSelectHouse}>
        <div className="min-h-[60vh] flex items-center justify-center flex-col gap-4 text-center px-4">
          <div className="w-16 h-16 rounded-2xl bg-[#F2EEE7] text-[#5F402B] flex items-center justify-center shadow-xs">
            <HomeIcon className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-extrabold text-[#172033]">No Room Connected Yet</h2>
          <p className="text-slate-400 text-sm max-w-md">
            Create or join a room to start tracking shared expenses with your roommates.
          </p>
          <Link to="/setup" className="btn-primary flex items-center gap-2 mt-2">
            <Plus className="w-4 h-4" /> Set Up Your Room
          </Link>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout house={house} houses={houses} onSelectHouse={handleSelectHouse}>
      <div className="space-y-6">
        {/* Top Greeting Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-[#172033] tracking-tight">
              Good day, {greetingName} 👋
            </h1>
            <p className="text-[#687080] text-sm mt-0.5">
              Here's what's happening in <span className="font-bold text-[#172033]">{house?.name || 'your house'}</span> today.
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E5DED3] bg-white text-xs font-semibold text-[#172033] hover:bg-[#F2EEE7] transition-colors shadow-xs"
              title="Download CSV spreadsheet"
            >
              <Download className="w-3.5 h-3.5 text-[#5F402B]" /> Export CSV
            </button>
            <button
              onClick={handlePrintStatement}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E5DED3] bg-white text-xs font-semibold text-[#172033] hover:bg-[#F2EEE7] transition-colors shadow-xs"
              title="Print PDF statement"
            >
              <Printer className="w-3.5 h-3.5 text-[#5F402B]" /> Print
            </button>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border border-[#E5DED3] text-xs font-semibold text-[#172033] shadow-xs">
              <Calendar className="w-4 h-4 text-[#5F402B]" />
              <span>{formattedToday}</span>
            </div>
          </div>
        </div>

        {/* BALANCE HERO CARD & FINANCIAL OVERVIEW */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Large Balance Hero Card (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-[#E5DED3] p-6 sm:p-8 shadow-card relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#687080]">Your Net Balance</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  displayBalance > 0
                    ? 'bg-[#E6F4ED] text-[#2F9B70] border border-[#BBE3D0]'
                    : displayBalance < 0
                    ? 'bg-[#FDF0EF] text-[#D65B57] border border-[#F6CBC9]'
                    : 'bg-[#F2EEE7] text-[#5F402B] border border-[#E5DED3]'
                }`}>
                  {displayBalance > 0 ? '✓ You are owed' : displayBalance < 0 ? '⚠ You owe' : '✓ All settled'}
                </span>
              </div>

              <div className="mt-4">
                <span className={`text-4xl sm:text-5xl font-extrabold tracking-tight ${
                  displayBalance > 0 ? 'text-[#2F9B70]' : displayBalance < 0 ? 'text-[#D65B57]' : 'text-[#172033]'
                }`}>
                  {displayBalance < 0 ? '-' : ''}{currencySymbol}{Math.abs(displayBalance).toLocaleString('en-IN')}
                </span>
                <p className="text-xs text-[#687080] mt-1 font-medium">
                  {displayBalance > 0
                    ? 'Roommates owe you for your share of expenses'
                    : displayBalance < 0
                    ? 'You have pending balance to pay back to roommates'
                    : 'Your balance is completely settled up!'}
                </p>
              </div>
            </div>

            {/* Quick action buttons */}
            <div className="flex items-center gap-3 mt-6 pt-6 border-t border-[#E5DED3]">
              <button
                onClick={() => setShowExpenseForm(true)}
                className="btn-primary flex-1 py-2.5 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Expense
              </button>
              <button
                onClick={() => setShowSettleModal(true)}
                className="btn-secondary flex-1 py-2.5 flex items-center justify-center gap-2"
              >
                <HandCoins className="w-4 h-4" /> Settle Up
              </button>
            </div>
          </div>

          {/* Quick Metrics (5 cols) */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
            {/* Metric Card 1: Total Spending */}
            <div className="bg-white rounded-2xl border border-[#E5DED3] p-5 shadow-card flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#F2EEE7] text-[#5F402B] flex items-center justify-center shrink-0">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#687080]">Room Total</p>
                <p className="text-2xl font-extrabold text-[#172033]">
                  {currencySymbol}{displayTotalExpenses.toLocaleString('en-IN')}
                </p>
                <p className="text-[11px] text-[#687080] mt-0.5">{displayExpenseCount} expenses logged</p>
              </div>
            </div>

            {/* Metric Card 2: Room Members */}
            <div className="bg-white rounded-2xl border border-[#E5DED3] p-5 shadow-card flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#F2EEE7] text-[#5F402B] flex items-center justify-center shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold uppercase tracking-wider text-[#687080]">Room Members</p>
                <p className="text-2xl font-extrabold text-[#172033]">{displayMemberCount}</p>
                <Link to="/members" className="text-[11px] text-[#5F402B] font-bold hover:underline">
                  Manage members →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* MIDDLE ROW: CATEGORY DONUT CHART & RECENT EXPENSES */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Category Donut Chart (5 cols) */}
          <div className="lg:col-span-5">
            <CategoryDonutChart expenses={expenses} currencySymbol={currencySymbol} />
          </div>

          {/* Recent Expenses List (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-[#E5DED3] p-6 shadow-card flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-extrabold text-[#172033]">Recent Expenses</h2>
                <Link to="/expenses" className="text-xs font-bold text-[#5F402B] hover:text-[#4A3120] flex items-center gap-1">
                  View All <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="space-y-3">
                {expenses.length > 0 ? (
                  expenses.slice(0, 5).map((exp) => (
                    <div key={exp._id} className="flex items-center justify-between p-3 rounded-xl hover:bg-[#F2EEE7] transition-colors border border-[#E5DED3]">
                      <div className="flex items-center gap-3 min-w-0">
                        {getCategoryIcon(exp.category)}
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#172033] truncate">{exp.description}</p>
                          <p className="text-[11px] text-[#687080] font-medium">{formatDate(exp.date)}</p>
                        </div>
                      </div>
                      <span className="text-sm font-extrabold text-[#172033] shrink-0 ml-2">
                        {currencySymbol}{exp.amount?.toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-[#687080] text-xs font-medium border border-dashed border-[#E5DED3] rounded-xl bg-[#F2EEE7]/50">
                    No expenses logged yet in this room.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Quick Navigation Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => setShowExpenseForm(true)}
            className="bg-white rounded-2xl border border-[#E5DED3] p-4 shadow-card hover:border-[#5F402B] transition-all text-left flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#F2EEE7] text-[#5F402B] flex items-center justify-center group-hover:bg-[#5F402B] group-hover:text-white transition-colors shrink-0">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-[#172033]">Add Expense</h3>
              <p className="text-[11px] text-[#687080]">Record a new expense</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/expenses')}
            className="bg-white rounded-2xl border border-[#E5DED3] p-4 shadow-card hover:border-[#5F402B] transition-all text-left flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#F2EEE7] text-[#5F402B] flex items-center justify-center group-hover:bg-[#5F402B] group-hover:text-white transition-colors shrink-0">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-[#172033]">View Expenses</h3>
              <p className="text-[11px] text-[#687080]">See all room expenses</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/balances')}
            className="bg-white rounded-2xl border border-[#E5DED3] p-4 shadow-card hover:border-[#5F402B] transition-all text-left flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#F2EEE7] text-[#5F402B] flex items-center justify-center group-hover:bg-[#5F402B] group-hover:text-white transition-colors shrink-0">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-[#172033]">View Balances</h3>
              <p className="text-[11px] text-[#687080]">Check who owes whom</p>
            </div>
          </button>

          <button
            onClick={() => setShowSettleModal(true)}
            className="bg-white rounded-2xl border border-[#E5DED3] p-4 shadow-card hover:border-[#5F402B] transition-all text-left flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#F2EEE7] text-[#5F402B] flex items-center justify-center group-hover:bg-[#5F402B] group-hover:text-white transition-colors shrink-0">
              <HandCoins className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-[#172033]">Settle Up</h3>
              <p className="text-[11px] text-[#687080]">Record a payment</p>
            </div>
          </button>
        </div>

        {/* Modals */}
        {showExpenseForm && (
          <ExpenseForm
            houseId={house?._id}
            members={members}
            onSuccess={loadHouseData}
            onClose={() => setShowExpenseForm(false)}
            currencySymbol={currencySymbol}
          />
        )}
        {showSettleModal && (
          <SettleUpModal
            houseId={house?._id}
            members={members}
            onSuccess={loadHouseData}
            onClose={() => setShowSettleModal(false)}
            currencySymbol={currencySymbol}
          />
        )}
      </div>
    </AppLayout>
  )
}
