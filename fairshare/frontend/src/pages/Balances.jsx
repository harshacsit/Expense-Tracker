import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useHouseBalances } from '../hooks/useHouseBalances'
import axiosClient from '../api/axiosClient'
import AppLayout from '../components/AppLayout'
import { Info, ArrowUpRight, ArrowDownLeft, CheckCircle2, Scale, HandCoins } from 'lucide-react'
import { getCurrencySymbol } from '../utils/exportUtils'

export default function Balances({ house: propHouse }) {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [house, setHouse] = useState(() => {
    if (propHouse) return propHouse
    const stored = localStorage.getItem('fairshare_house')
    return stored ? JSON.parse(stored) : null
  })

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

  const { balances, refetch } = useHouseBalances(house?._id)

  useEffect(() => {
    if (house?._id) {
      refetch()
    }
  }, [house?._id, refetch])

  const currencySymbol = getCurrencySymbol(house?.currency)

  // Live net balance calculations
  const totalOwed = balances
    .filter((b) => b.netBalance < 0)
    .reduce((sum, b) => sum + Math.abs(b.netBalance), 0)

  const totalToReceive = balances
    .filter((b) => b.netBalance > 0)
    .reduce((sum, b) => sum + b.netBalance, 0)

  const getInitials = (name) => {
    if (!name) return 'US'
    const parts = name.trim().split(' ')
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    return name.slice(0, 2).toUpperCase()
  }

  return (
    <AppLayout house={house} onSelectHouse={setHouse}>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-[#172033] tracking-tight">House Balances</h1>
            <p className="text-[#687080] text-xs mt-0.5">See who owes whom and simplify pending debts.</p>
          </div>
          <button
            onClick={() => navigate('/settle-up')}
            className="btn-primary flex items-center gap-2 shadow-xs"
          >
            <HandCoins className="w-4 h-4" /> Settle Up
          </button>
        </div>

        {/* Top 3 Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Card 1: Total Owed */}
          <div className="bg-white rounded-2xl border border-[#E5DED3] p-5 shadow-card flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#FDF0EF] text-[#D65B57] flex items-center justify-center shrink-0 font-bold">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#687080]">Total Owed</p>
              <p className="text-2xl font-extrabold text-[#D65B57]">{currencySymbol}{totalOwed.toLocaleString('en-IN')}</p>
            </div>
          </div>

          {/* Card 2: Total To Receive */}
          <div className="bg-white rounded-2xl border border-[#E5DED3] p-5 shadow-card flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#E6F4ED] text-[#2F9B70] flex items-center justify-center shrink-0 font-bold">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#687080]">Total To Receive</p>
              <p className="text-2xl font-extrabold text-[#2F9B70]">{currencySymbol}{totalToReceive.toLocaleString('en-IN')}</p>
            </div>
          </div>

          {/* Card 3: Room Status */}
          <div className="bg-white rounded-2xl border border-[#E5DED3] p-5 shadow-card flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#F2EEE7] text-[#5F402B] flex items-center justify-center shrink-0 font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#687080]">Room Status</p>
              <p className="text-sm font-extrabold text-[#172033] mt-1">
                {totalOwed === 0 ? '✓ All Settled' : `${balances.filter((b) => b.netBalance !== 0).length} Active Balances`}
              </p>
            </div>
          </div>
        </div>

        {/* Simplified Transfers Section */}
        <div className="bg-white rounded-3xl border border-[#E5DED3] p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-[#687080] uppercase tracking-wider">Who Owes Whom (Simplified Transfers)</h2>
            <span className="text-[11px] text-slate-400 font-medium">Automatic Debt Simplification</span>
          </div>

          {(() => {
            const debtors = balances.filter((b) => b.netBalance < 0).map((b) => ({ ...b, rem: Math.abs(b.netBalance) }))
            const creditors = balances.filter((b) => b.netBalance > 0).map((b) => ({ ...b, rem: b.netBalance }))

            const transfers = []
            let dIdx = 0, cIdx = 0
            while (dIdx < debtors.length && cIdx < creditors.length) {
              const transfer = Math.min(debtors[dIdx].rem, creditors[cIdx].rem)
              if (transfer > 0.01) {
                transfers.push({
                  from: debtors[dIdx].name,
                  fromEmail: debtors[dIdx].email,
                  to: creditors[cIdx].name,
                  toEmail: creditors[cIdx].email,
                  amount: transfer,
                })
              }
              debtors[dIdx].rem -= transfer
              creditors[cIdx].rem -= transfer
              if (debtors[dIdx].rem < 0.01) dIdx++
              if (creditors[cIdx].rem < 0.01) cIdx++
            }

            if (transfers.length === 0) {
              return (
                <div className="p-8 text-center text-xs font-semibold text-[#2F9B70] bg-[#E6F4ED]/60 rounded-2xl border border-[#BBE3D0]">
                  ✓ All room balances are completely settled! No pending transfers required.
                </div>
              )
            }

            return (
              <div className="space-y-3">
                {transfers.map((t, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-2xl border border-[#E5DED3] bg-[#FAF8F4] gap-3">
                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
                      {/* Debtor */}
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#5F402B] text-white font-bold text-xs flex items-center justify-center shadow-xs">
                          {getInitials(t.from)}
                        </div>
                        <span className="font-bold text-[#172033] text-xs sm:text-sm">{t.from}</span>
                      </div>

                      {/* Arrow */}
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F2EEE7] border border-[#E5DED3] text-[#5F402B] text-xs font-extrabold">
                        <span>owes</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </div>

                      {/* Creditor */}
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#4A3120] text-white font-bold text-xs flex items-center justify-center shadow-xs">
                          {getInitials(t.to)}
                        </div>
                        <span className="font-bold text-[#172033] text-xs sm:text-sm">{t.to}</span>
                      </div>
                    </div>

                    {/* Transfer Amount & Action */}
                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                      <span className="text-base font-extrabold text-[#172033]">
                        {currencySymbol}{t.amount.toLocaleString('en-IN')}
                      </span>
                      <Link
                        to="/settle-up"
                        className="btn-secondary py-1.5 px-3 text-xs"
                      >
                        Settle
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )
          })()}
        </div>

        {/* Member Balance Table Container */}
        <div className="bg-white rounded-2xl border border-[#E5DED3] shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            {balances.length > 0 ? (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#E5DED3] bg-[#FAF8F4] text-[#687080] font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3.5 px-6">Member</th>
                    <th className="py-3.5 px-6">Total Paid</th>
                    <th className="py-3.5 px-6">Total Owed</th>
                    <th className="py-3.5 px-6 text-right">Net Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5DED3] font-semibold text-slate-700">
                  {balances.map((b) => {
                    const isMe = b.email === user?.email || b.userId === user?._id
                    const isPositive = b.netBalance > 0
                    const isNegative = b.netBalance < 0
                    return (
                      <tr key={b.userId || b.email} className="hover:bg-[#F2EEE7]/50 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#5F402B] text-white font-bold text-xs flex items-center justify-center">
                              {getInitials(b.name)}
                            </div>
                            <div>
                              <p className="font-bold text-[#172033] text-xs sm:text-sm">
                                {b.name} {isMe ? '(You)' : ''}
                              </p>
                              <p className="text-[11px] text-[#687080] font-normal">{b.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-[#172033] font-extrabold">
                          {currencySymbol}{(b.totalPaid || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="py-4 px-6 text-[#687080]">
                          {currencySymbol}{(b.totalOwed || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="py-4 px-6 text-right font-extrabold text-sm">
                          {isPositive ? (
                            <span className="inline-flex items-center gap-1 text-[#2F9B70] bg-[#E6F4ED] border border-[#BBE3D0] px-3 py-1 rounded-full">
                              +{currencySymbol}{Math.abs(b.netBalance).toLocaleString('en-IN')}
                            </span>
                          ) : isNegative ? (
                            <span className="inline-flex items-center gap-1 text-[#D65B57] bg-[#FDF0EF] border border-[#F6CBC9] px-3 py-1 rounded-full">
                              -{currencySymbol}{Math.abs(b.netBalance).toLocaleString('en-IN')}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[#687080] bg-[#F2EEE7] border border-[#E5DED3] px-3 py-1 rounded-full">
                              {currencySymbol}0
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            ) : (
              <div className="p-12 text-center text-slate-500 space-y-2">
                <Scale className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <p className="font-bold text-slate-700 text-sm">No member balance data</p>
                <p className="text-xs text-slate-400">Balances will calculate automatically once expenses are recorded.</p>
              </div>
            )}
          </div>

          {/* Footer Explanatory Note */}
          <div className="p-4 border-t border-[#E5DED3] bg-[#FAF8F4] flex items-center gap-2 text-xs text-[#687080]">
            <Info className="w-4 h-4 text-[#5F402B] shrink-0" />
            <span>
              A positive balance means they are owed money. A negative balance means they owe money.
            </span>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
