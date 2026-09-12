import { useState, useEffect, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useHouseBalances } from '../hooks/useHouseBalances'
import axiosClient from '../api/axiosClient'
import toast from 'react-hot-toast'

import BalanceSummary from '../components/BalanceSummary'
import ExpenseList from '../components/ExpenseList'
import ExpenseForm from '../components/ExpenseForm'
import SettleUpModal from '../components/SettleUpModal'
import HouseInviteCard from '../components/HouseInviteCard'
import ChatWidget from '../components/ChatWidget'
import Lightfall from '../components/Lightfall'

import { Plus, HandCoins, LayoutDashboard, History as HistoryIcon, LogOut, Home, Settings, Download, Printer } from 'lucide-react'
import { getCurrencySymbol, exportExpensesToCSV, printExpenseStatement } from '../utils/exportUtils'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [house, setHouse] = useState(() => {
    const stored = localStorage.getItem('splitstay_house')
    return stored ? JSON.parse(stored) : null
  })
  const [houses, setHouses] = useState([])
  const [members, setMembers] = useState([])
  const [expenses, setExpenses] = useState([])
  const [loadingData, setLoadingData] = useState(false)
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [showSettleModal, setShowSettleModal] = useState(false)
  const [activeTab, setActiveTab] = useState('balances')

  const { balances, settlements: settlementSuggestions, refetch: refetchBalances } = useHouseBalances(house?._id)

  // Load user's houses on mount
  useEffect(() => {
    axiosClient.get('/houses').then(({ data }) => {
      setHouses(data)
      if (!house && data.length > 0) {
        setHouse(data[0])
        localStorage.setItem('splitstay_house', JSON.stringify(data[0]))
      }
    }).catch(() => {})
  }, [])

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
  }, [house?._id])

  useEffect(() => { loadHouseData() }, [loadHouseData])

  const handleLogout = () => { logout(); navigate('/login') }

  // Summary stats
  const currentMonth = new Date().toLocaleString('default', { month: 'long' })
  const monthlyTotal = expenses
    .filter((e) => new Date(e.date).getMonth() === new Date().getMonth())
    .reduce((sum, e) => sum + e.amount, 0)
  const myBalance = balances.find((b) => b.email === user?.email)

  const currencySymbol = getCurrencySymbol(house?.currency)

  const handleCurrencyChange = async (newCurrency) => {
    if (!house?._id) return
    try {
      await axiosClient.put(`/houses/${house._id}/currency`, { currency: newCurrency })
      const updatedHouse = { ...house, currency: newCurrency }
      setHouse(updatedHouse)
      localStorage.setItem('splitstay_house', JSON.stringify(updatedHouse))
      toast.success(`Currency set to ${newCurrency} (${getCurrencySymbol(newCurrency)})`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update currency')
    }
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

  if (!house && houses.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4 px-4">
        <Home className="w-16 h-16 text-white/20" />
        <h2 className="text-xl font-bold">No House Yet</h2>
        <p className="text-white/40 text-sm text-center">Create or join a house to start tracking shared expenses</p>
        <Link to="/setup" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Set Up Your House
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Top Nav */}
      <nav className="sticky top-0 z-40 glass border-b border-white/5 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #6070f5, #a855f7)' }}>
              <Home className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-sm truncate">{house?.name || 'Loading...'}</p>
              <p className="text-xs text-white/30 truncate">{user?.email}</p>
            </div>
          </div>

          {/* Currency switcher */}
          {house && (
            <select
              id="currency-selector"
              className="input py-1.5 px-2.5 text-xs max-w-28 cursor-pointer font-semibold bg-dark-800/80 border-white/10 text-brand-300"
              value={house.currency || 'INR'}
              onChange={(e) => handleCurrencyChange(e.target.value)}
              title="Select house currency"
            >
              <option value="INR">₹ INR</option>
              <option value="USD">$ USD</option>
              <option value="EUR">€ EUR</option>
              <option value="GBP">£ GBP</option>
            </select>
          )}

          {/* House switcher */}
          {houses.length > 1 && (
            <select
              className="input py-1.5 text-xs max-w-36"
              value={house?._id}
              onChange={(e) => {
                const h = houses.find((h) => h._id === e.target.value)
                setHouse(h)
                localStorage.setItem('splitstay_house', JSON.stringify(h))
              }}
            >
              {houses.map((h) => <option key={h._id} value={h._id}>{h.name}</option>)}
            </select>
          )}

          <Link to="/setup" className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/40 hover:text-white/80" title="Manage house">
            <Settings className="w-4 h-4" />
          </Link>
          <button onClick={handleLogout} id="logout-btn" className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/40 hover:text-white/80" title="Log out">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Interactive Lightfall Hero Banner */}
        <div className="relative w-full rounded-3xl overflow-hidden mb-6 border border-white/10 shadow-2xl" style={{ minHeight: '190px' }}>
          <div className="absolute inset-0 z-0">
            <Lightfall
              colors={['#A6C8FF', '#5227FF', '#FF9FFC']}
              backgroundColor="#0A29FF"
              speed={0.5}
              streakCount={2}
              streakWidth={1}
              streakLength={1}
              glow={1}
              density={0.6}
              twinkle={1}
              zoom={3}
              backgroundGlow={0.5}
              opacity={0.65}
              mouseInteraction
              mouseStrength={0.5}
              mouseRadius={1}
            />
          </div>
          <div className="relative z-10 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-black/40 backdrop-blur-xs">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 border border-brand-400/30 text-xs font-semibold text-brand-300 mb-2">
                <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
                Live Household Hub
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {house?.name || 'SplitStay Dashboard'}
              </h2>
              <p className="text-sm text-white/70 max-w-md mt-1">
                Real-time shared balances, automated debt simplification, and Gemini AI insights.
              </p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <button
                id="hero-add-expense-btn"
                onClick={() => setShowExpenseForm(true)}
                className="btn-primary flex items-center gap-2 shadow-lg shadow-brand-500/30"
              >
                <Plus className="w-4 h-4" /> Add Expense
              </button>
              <button
                id="hero-settle-up-btn"
                onClick={() => setShowSettleModal(true)}
                className="btn-secondary flex items-center gap-2 bg-dark-800/80 backdrop-blur-md"
              >
                <HandCoins className="w-4 h-4" /> Settle Up
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="glass rounded-2xl p-5">
            <p className="text-xs text-white/40 uppercase tracking-wider mb-1">{currentMonth} Spending</p>
            <p className="text-3xl font-bold">{currencySymbol}{monthlyTotal.toLocaleString('en-US', { maximumFractionDigits: 2 })}</p>
            <p className="text-xs text-white/30 mt-1">house total this month</p>
          </div>
          <div className={`rounded-2xl p-5 ${myBalance?.netBalance > 0 ? 'bg-emerald-500/10 border border-emerald-500/20' : myBalance?.netBalance < 0 ? 'bg-red-500/10 border border-red-500/20' : 'glass'}`}>
            <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Your Balance</p>
            <p className={`text-3xl font-bold ${myBalance?.netBalance > 0 ? 'text-emerald-400' : myBalance?.netBalance < 0 ? 'text-red-400' : 'text-white/60'}`}>
              {myBalance ? `${myBalance.netBalance > 0 ? '+' : ''}${currencySymbol}${Math.abs(myBalance.netBalance).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : `${currencySymbol}0`}
            </p>
            <p className="text-xs text-white/30 mt-1">
              {!myBalance || myBalance.netBalance === 0 ? 'all settled' : myBalance.netBalance > 0 ? 'you are owed' : 'you owe'}
            </p>
          </div>
          <div className="glass rounded-2xl p-5">
            <p className="text-xs text-white/40 uppercase tracking-wider mb-1">House Members</p>
            <p className="text-3xl font-bold">{members.length}</p>
            <p className="text-xs text-white/30 mt-1">{expenses.length} expense{expenses.length !== 1 ? 's' : ''} logged</p>
          </div>
        </div>

        {/* Invite Card */}
        {house && <div className="mb-6"><HouseInviteCard house={house} members={members} /></div>}

        {/* Action Buttons */}
        <div className="flex gap-3 mb-6 flex-wrap">
          <button
            id="add-expense-btn"
            onClick={() => setShowExpenseForm(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Expense
          </button>
          <button
            id="settle-up-btn"
            onClick={() => setShowSettleModal(true)}
            className="btn-secondary flex items-center gap-2"
          >
            <HandCoins className="w-4 h-4" /> Settle Up
          </button>
          <button
            id="export-csv-btn"
            onClick={handleExportCSV}
            className="btn-secondary flex items-center gap-2 hover:border-brand-500/50"
            title="Download CSV spreadsheet"
          >
            <Download className="w-4 h-4 text-brand-400" /> Export CSV
          </button>
          <button
            id="print-statement-btn"
            onClick={handlePrintStatement}
            className="btn-secondary flex items-center gap-2 hover:border-brand-500/50"
            title="Print or save PDF statement"
          >
            <Printer className="w-4 h-4 text-brand-400" /> Print Statement
          </button>
          <Link to="/history" className="btn-secondary flex items-center gap-2">
            <HistoryIcon className="w-4 h-4" /> Full History
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex glass rounded-xl p-1 gap-1 mb-6 w-fit">
          {[['balances', LayoutDashboard, 'Balances'], ['expenses', HistoryIcon, 'Recent Expenses']].map(([id, Icon, label]) => (
            <button
              key={id}
              id={`tab-${id}`}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === id ? 'bg-brand-600 text-white shadow-lg' : 'text-white/50 hover:text-white/80'}`}
            >
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loadingData ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : activeTab === 'balances' ? (
          <BalanceSummary
            houseId={house?._id}
            balances={balances}
            settlements={settlementSuggestions}
            currencySymbol={currencySymbol}
          />
        ) : (
          <ExpenseList
            expenses={expenses.slice(0, 10)}
            onDelete={loadHouseData}
            currencySymbol={currencySymbol}
          />
        )}
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

      {/* AI Chatbot */}
      {house && <ChatWidget houseId={house._id} userName={user?.name} onExpenseAdded={loadHouseData} />}
    </div>
  )
}
