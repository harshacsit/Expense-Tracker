import { useState, useEffect, useCallback, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useHouseBalances } from '../hooks/useHouseBalances'
import axiosClient from '../api/axiosClient'
import toast from 'react-hot-toast'

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
  Calendar
} from 'lucide-react'
import { getCurrencySymbol } from '../utils/exportUtils'

export default function Dashboard({ house, houses = [], onSelectHouse }) {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [members, setMembers] = useState([])
  const [expenses, setExpenses] = useState([])
  const [loadingData, setLoadingData] = useState(false)
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [showSettleModal, setShowSettleModal] = useState(false)

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

  return (
    <div className="space-y-6">
      {/* Top Greeting Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">
            Good evening, {greetingName} ≡ƒæï
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Here's what's happening in your house today.
          </p>
        </div>
        {/* Dynamic Date Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-xs">
          <Calendar className="w-4 h-4 text-blue-600" />
          <span>{formattedToday}</span>
        </div>
      </div>

      {/* BALANCE HERO CARD & CONNECTED FINANCIAL OVERVIEW */}
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
                {displayBalance > 0 ? 'Γ£ô You are owed' : displayBalance < 0 ? 'ΓÜá You owe' : 'Γ£ô All settled'}
              </span>
            </div>

            {/* Large Balance Number */}
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-extrabold text-[#172033] tracking-tight">
                {displayBalance >= 0 ? '+' : '-'}{currencySymbol}{Math.abs(displayBalance).toLocaleString('en-IN')}
              </span>
            </div>
            <p className="text-xs text-[#687080] font-medium mt-1">
              {displayBalance > 0
                ? 'Your housemates owe you money for recent shared purchases.'
                : displayBalance < 0
                ? 'You have outstanding shared dues to pay to your housemates.'
                : 'All shared room balances are completely balanced.'}
            </p>
          </div>

          {/* Supporting Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-6 mt-6 border-t border-[#E5DED3]">
            <div className="bg-[#F2EEE7] p-3.5 rounded-2xl border border-[#E5DED3]">
              <span className="text-[11px] font-bold text-[#687080] uppercase tracking-wider block">Total Paid</span>
              <span className="text-base font-extrabold text-[#172033] mt-0.5 block">
                {currencySymbol}{(myBalance?.totalPaid || 0).toLocaleString('en-IN')}
              </span>
            </div>
            <div className="bg-[#F2EEE7] p-3.5 rounded-2xl border border-[#E5DED3]">
              <span className="text-[11px] font-bold text-[#687080] uppercase tracking-wider block">Your Share</span>
              <span className="text-base font-extrabold text-[#172033] mt-0.5 block">
                {currencySymbol}{(myBalance?.totalOwed || 0).toLocaleString('en-IN')}
              </span>
            </div>
            <div className="bg-[#F2EEE7] p-3.5 rounded-2xl border border-[#E5DED3] col-span-2 sm:col-span-1">
              <span className="text-[11px] font-bold text-[#687080] uppercase tracking-wider block">Housemates</span>
              <span className="text-base font-extrabold text-[#172033] mt-0.5 block">
                {displayMemberCount} Active
              </span>
            </div>
          </div>
        </div>

        {/* Connected Financial Overview (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-[#E5DED3] p-6 sm:p-8 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-extrabold text-[#172033] uppercase tracking-wider">Household Spending</h3>
              <span className="text-xs font-bold text-[#5F402B] bg-[#F2EEE7] px-2.5 py-1 rounded-full border border-[#E5DED3]">
                This Month
              </span>
            </div>

            <div className="text-3xl font-extrabold text-[#172033] mb-1">
              {currencySymbol}{displayTotalExpenses.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-[#687080] font-medium mb-4">
              Total shared expenses recorded across all category ledgers.
            </p>

            {/* Contribution Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-[#687080]">Your Paid Share</span>
                <span className="text-[#5F402B]">
                  {displayTotalExpenses > 0
                    ? Math.round(((myBalance?.totalPaid || 0) / displayTotalExpenses) * 100)
                    : 0}%
                </span>
              </div>
              <div className="w-full h-3 bg-[#F2EEE7] rounded-full overflow-hidden border border-[#E5DED3]">
                <div
                  className="h-full bg-[#5F402B] rounded-full transition-all duration-500"
                  style={{
                    width: `${
                      displayTotalExpenses > 0
                        ? Math.min(Math.round(((myBalance?.totalPaid || 0) / displayTotalExpenses) * 100), 100)
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-[#E5DED3] flex items-center justify-between text-xs font-bold text-[#172033]">
            <span className="text-[#687080]">Total Logged Entries:</span>
            <span className="px-2.5 py-1 rounded-lg bg-[#F2EEE7] border border-[#E5DED3] font-mono">
              {displayExpenseCount} Expenses
            </span>
          </div>
        </div>
      </div>

      {/* Two Column Section: Spending by Category + Recent Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Spending by Category Donut Chart */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-[#E5DED3] p-6 shadow-card flex flex-col justify-between">
          <h2 className="text-base font-extrabold text-[#172033] mb-4">Spending by Category</h2>
          <CategoryDonutChart expenses={expenses} currencySymbol={currencySymbol} />
        </div>

        {/* Right Column: Recent Expenses from Database */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-[#E5DED3] p-6 shadow-card flex flex-col justify-between">
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
                  <div className="flex items-center gap-3">
                    {getCategoryIcon(exp.category)}
                    <div>
                      <p className="text-xs font-bold text-[#172033]">{exp.description}</p>
                      <p className="text-[11px] text-slate-400 font-medium">{formatDate(exp.date)}</p>
                    </div>
                  </div>
                  <span className="text-sm font-extrabold text-[#172033]">
                    {currencySymbol}{exp.amount?.toLocaleString('en-IN')}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs font-medium border border-dashed border-[#E5DED3] rounded-xl bg-[#F2EEE7]/50">
                No expenses logged yet in this room.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dashboard Quick Actions */}
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
            <p className="text-[11px] text-slate-400">Record a new expense</p>
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
            <p className="text-[11px] text-slate-400">See all expenses</p>
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
            <h3 className="text-xs font-bold text-[#10205C]">View Balances</h3>
            <p className="text-[11px] text-slate-400">Check who owes whom</p>
          </div>
        </button>

        <button
          onClick={() => setShowSettleModal(true)}
          className="bg-white rounded-2xl border border-[#C8D7FF] p-4 shadow-card hover:border-[#2453FF] hover:shadow-blue transition-all text-left flex items-center gap-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-[#EAF0FF] text-[#2453FF] flex items-center justify-center group-hover:bg-[#2453FF] group-hover:text-white transition-colors shrink-0">
            <HandCoins className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#10205C]">Settle Up</h3>
            <p className="text-[11px] text-slate-400">Record a payment</p>
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
  )
}
