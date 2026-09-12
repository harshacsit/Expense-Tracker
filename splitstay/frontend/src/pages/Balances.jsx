import { useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useHouseBalances } from '../hooks/useHouseBalances'
import { Info, ArrowUpRight, ArrowDownLeft, CheckCircle2, Scale } from 'lucide-react'
import { getCurrencySymbol } from '../utils/exportUtils'

export default function Balances({ house }) {
  const { user } = useAuth()
  const { balances, refetch } = useHouseBalances(house?._id)

  useEffect(() => {
    refetch()
  }, [refetch])

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
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">House Balances</h1>
          <p className="text-slate-500 text-xs mt-0.5">See who owes whom in your house.</p>
        </div>
        <div className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 shadow-xs">
          Simplified View
        </div>
      </div>

      {/* Top 3 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Total Owed */}
        <div className="bg-white rounded-2xl border border-[#C8D7FF] p-5 shadow-card flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#EAF0FF] text-[#2453FF] flex items-center justify-center shrink-0 font-bold">
            <ArrowDownLeft className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Owed</p>
            <p className="text-2xl font-extrabold text-[#10205C]">{currencySymbol}{totalOwed.toLocaleString('en-IN')}</p>
          </div>
        </div>

        {/* Card 2: Total To Receive */}
        <div className="bg-white rounded-2xl border border-[#C8D7FF] p-5 shadow-card flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#EAF0FF] text-[#2453FF] flex items-center justify-center shrink-0 font-bold">
            <ArrowUpRight className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total To Receive</p>
            <p className="text-2xl font-extrabold text-[#10205C]">{currencySymbol}{totalToReceive.toLocaleString('en-IN')}</p>
          </div>
        </div>

        {/* Card 3: Settled This Month */}
        <div className="bg-white rounded-2xl border border-[#C8D7FF] p-5 shadow-card flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#EAF0FF] text-[#2453FF] flex items-center justify-center shrink-0 font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Settled This Month</p>
            <p className="text-2xl font-extrabold text-[#10205C]">{currencySymbol}0</p>
          </div>
        </div>
      </div>

      {/* Connected Financial Relationships Section: WHO OWES WHOM */}
      <div className="bg-white rounded-3xl border border-[#C8D7FF] p-6 shadow-card space-y-4">
        <h2 className="text-xs font-bold text-[#65708A] uppercase tracking-wider">Who Owes Whom (Simplified Transfers)</h2>
        {(() => {
          // Compute direct relationships from balances
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
              <div className="p-6 text-center text-xs font-medium text-[#65708A] bg-[#F5F8FF] rounded-2xl border border-[#C8D7FF]">
                ✓ All room balances are completely settled! No pending debt transfers required.
              </div>
            )
          }

          return (
            <div className="space-y-3">
              {transfers.map((t, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-2xl border border-[#E5DED3] bg-[#F2EEE7] gap-3">
                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
                    {/* Debtor */}
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#5F402B] text-white font-bold text-xs flex items-center justify-center shadow-xs">
                        {getInitials(t.from)}
                      </div>
                      <span className="font-bold text-[#172033] text-xs sm:text-sm">{t.from}</span>
                    </div>

                    {/* Arrow */}
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF8F4] border border-[#E5DED3] text-[#5F402B] text-xs font-extrabold">
                      <span>owes</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </div>

                    {/* Creditor */}
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#4A3120] text-white font-bold text-xs flex items-center justify-center shadow-xs">
                        {getInitials(t.to)}
                      </div>
                      <span className="font-bold text-[#172033] text-xs sm:text-sm">{t.to}</span>
                    </div>
                  </div>

                  {/* Transfer Amount */}
                  <span className="text-base font-extrabold text-[#172033]">
                    {currencySymbol}{t.amount.toLocaleString('en-IN')}
                  </span>
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
                <tr className="border-b border-[#E5DED3] bg-[#F2EEE7] text-[#172033] font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-6">Member</th>
                  <th className="py-3.5 px-6">Paid</th>
                  <th className="py-3.5 px-6">Owed</th>
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
                            −{currencySymbol}{Math.abs(b.netBalance).toLocaleString('en-IN')}
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
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center gap-2 text-xs text-slate-500">
          <Info className="w-4 h-4 text-blue-600 shrink-0" />
          <span>
            A positive balance means they are owed money. A negative balance means they owe money.
          </span>
        </div>
      </div>
    </div>
  )
}
