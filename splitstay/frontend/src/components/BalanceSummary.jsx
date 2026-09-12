import { useState } from 'react'
import { TrendingUp, TrendingDown, Minus, ArrowRight, BellRing, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import axiosClient from '../api/axiosClient'
import toast from 'react-hot-toast'

const getInitials = (name) => name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || '?'

export default function BalanceSummary({ houseId, balances, settlements, currencySymbol = '₹' }) {
  const { user } = useAuth()
  const [sendingReminder, setSendingReminder] = useState(false)

  const handleSendReminder = async () => {
    if (!houseId) return
    setSendingReminder(true)
    try {
      const { data } = await axiosClient.post(`/houses/${houseId}/balances/remind`)
      toast.success(data.message || 'Balance reminders sent!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reminders')
    } finally {
      setSendingReminder(false)
    }
  }

  if (!balances || balances.length === 0) {
    return (
      <div className="saas-card p-8 text-center">
        <TrendingUp className="w-10 h-10 text-[#687080]/30 mx-auto mb-2" />
        <p className="text-[#687080] text-sm">No balances yet. Add expenses to see who owes whom.</p>
      </div>
    )
  }

  const myBalance = balances.find((b) => b.userId === user?._id?.toString() || b.email === user?.email)
  const hasDebtors = balances.some((b) => b.netBalance < -0.01)

  return (
    <div className="space-y-4">
      {/* My balance highlight */}
      {myBalance && (
        <div className={`rounded-2xl p-5 border ${myBalance.netBalance > 0.005 ? 'bg-[#2F9B70]/10 border-[#2F9B70]/30' : myBalance.netBalance < -0.005 ? 'bg-[#D65B57]/10 border-[#D65B57]/30' : 'saas-card'}`}>
          <p className="text-xs text-[#687080] uppercase tracking-wider mb-1 font-semibold">Your Balance</p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#5F402B] text-white flex items-center justify-center font-bold text-sm">{getInitials(myBalance.name)}</div>
            <div>
              <p className="font-semibold text-[#172033]">{myBalance.name} <span className="text-[#687080] text-xs">(you)</span></p>
              <p className={`text-2xl font-bold ${myBalance.netBalance > 0.005 ? 'text-[#2F9B70]' : myBalance.netBalance < -0.005 ? 'text-[#D65B57]' : 'text-[#687080]'}`}>
                {myBalance.netBalance > 0.005 ? '+' : ''} {currencySymbol}{Math.abs(myBalance.netBalance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-[#687080]">
                {myBalance.netBalance > 0.005 ? 'you are owed' : myBalance.netBalance < -0.005 ? 'you owe' : 'all settled ✓'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* All members */}
      <div className="saas-card p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold text-[#687080] uppercase tracking-wider">All Members</h4>
          {hasDebtors && houseId && (
            <button
              onClick={handleSendReminder}
              disabled={sendingReminder}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-[#F2EEE7] border border-[#E5DED3] text-[#5F402B] hover:bg-[#5F402B] hover:text-white transition-colors disabled:opacity-50"
              title="Send email reminders to all roommates with negative balance"
            >
              {sendingReminder ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Sending...
                </>
              ) : (
                <>
                  <BellRing className="w-3.5 h-3.5" /> Send Reminder Emails
                </>
              )}
            </button>
          )}
        </div>

        <div className="space-y-3">
          {balances.map((b) => (
            <div key={b.userId} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#5F402B] text-white flex items-center justify-center font-bold text-xs shrink-0">{getInitials(b.name)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[#172033] truncate">{b.name}</p>
                <p className="text-xs text-[#687080]">
                  Paid {currencySymbol}{b.totalPaid.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} · Owed {currencySymbol}{b.totalOwed.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {b.netBalance > 0.005 ? (
                  <TrendingUp className="w-3.5 h-3.5 text-[#2F9B70]" />
                ) : b.netBalance < -0.005 ? (
                  <TrendingDown className="w-3.5 h-3.5 text-[#D65B57]" />
                ) : (
                  <Minus className="w-3.5 h-3.5 text-[#687080]" />
                )}
                <span className={`text-sm font-bold ${b.netBalance > 0.005 ? 'text-[#2F9B70]' : b.netBalance < -0.005 ? 'text-[#D65B57]' : 'text-[#687080]'}`}>
                  {b.netBalance > 0.005 ? '+' : ''}{currencySymbol}{Math.abs(b.netBalance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Settlement suggestions */}
      {settlements && settlements.length > 0 && (
        <div className="saas-card p-4">
          <h4 className="text-xs font-bold text-[#687080] mb-3 uppercase tracking-wider">
            💡 Suggested Settlements ({settlements.length} payment{settlements.length > 1 ? 's' : ''})
          </h4>
          <div className="space-y-2">
            {settlements.map((s, i) => (
              <div key={i} className="flex items-center gap-2 text-sm p-2.5 rounded-xl bg-[#F2EEE7] border border-[#E5DED3]">
                <div className="w-7 h-7 rounded-full bg-[#5F402B] text-white flex items-center justify-center font-bold text-xs shrink-0">{getInitials(s.fromName)}</div>
                <span className="font-semibold text-[#172033] truncate">{s.fromName}</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#687080] shrink-0" />
                <div className="w-7 h-7 rounded-full bg-[#5F402B] text-white flex items-center justify-center font-bold text-xs shrink-0">{getInitials(s.toName)}</div>
                <span className="font-semibold text-[#172033] truncate">{s.toName}</span>
                <span className="ml-auto font-bold text-[#5F402B] shrink-0">{currencySymbol}{s.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {settlements && settlements.length === 0 && balances.length > 0 && (
        <div className="saas-card p-4 text-center">
          <p className="text-[#2F9B70] text-sm font-bold">✓ All balances are settled!</p>
        </div>
      )}
    </div>
  )
}
