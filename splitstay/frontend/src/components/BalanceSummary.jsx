import { TrendingUp, TrendingDown, Minus, ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const getInitials = (name) => name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || '?'

export default function BalanceSummary({ balances, settlements }) {
  const { user } = useAuth()

  if (!balances || balances.length === 0) {
    return (
      <div className="glass rounded-2xl p-8 text-center">
        <TrendingUp className="w-10 h-10 text-white/20 mx-auto mb-2" />
        <p className="text-white/40 text-sm">No balances yet. Add expenses to see who owes whom.</p>
      </div>
    )
  }

  const myBalance = balances.find((b) => b.userId === user?._id?.toString() || b.email === user?.email)

  return (
    <div className="space-y-4">
      {/* My balance highlight */}
      {myBalance && (
        <div className={`rounded-2xl p-5 border ${myBalance.netBalance > 0.005 ? 'bg-emerald-500/10 border-emerald-500/30' : myBalance.netBalance < -0.005 ? 'bg-red-500/10 border-red-500/30' : 'glass border-white/10'}`}>
          <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Your Balance</p>
          <div className="flex items-center gap-3">
            <div className="avatar w-10 h-10">{getInitials(myBalance.name)}</div>
            <div>
              <p className="font-semibold">{myBalance.name} <span className="text-white/40 text-xs">(you)</span></p>
              <p className={`text-2xl font-bold ${myBalance.netBalance > 0.005 ? 'text-emerald-400' : myBalance.netBalance < -0.005 ? 'text-red-400' : 'text-white/60'}`}>
                {myBalance.netBalance > 0.005 ? '+' : ''} ₹{Math.abs(myBalance.netBalance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-white/40">
                {myBalance.netBalance > 0.005 ? 'you are owed' : myBalance.netBalance < -0.005 ? 'you owe' : 'all settled ✓'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* All members */}
      <div className="glass rounded-2xl p-4">
        <h4 className="text-sm font-semibold text-white/60 mb-3 uppercase tracking-wider">All Members</h4>
        <div className="space-y-3">
          {balances.map((b) => (
            <div key={b.userId} className="flex items-center gap-3">
              <div className="avatar w-9 h-9 text-xs shrink-0">{getInitials(b.name)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{b.name}</p>
                <p className="text-xs text-white/30">
                  Paid ₹{b.totalPaid.toLocaleString('en-IN')} · Owed ₹{b.totalOwed.toLocaleString('en-IN')}
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {b.netBalance > 0.005 ? (
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                ) : b.netBalance < -0.005 ? (
                  <TrendingDown className="w-3.5 h-3.5 text-red-400" />
                ) : (
                  <Minus className="w-3.5 h-3.5 text-white/30" />
                )}
                <span className={`text-sm font-bold ${b.netBalance > 0.005 ? 'text-emerald-400' : b.netBalance < -0.005 ? 'text-red-400' : 'text-white/40'}`}>
                  {b.netBalance > 0.005 ? '+' : ''}₹{Math.abs(b.netBalance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Settlement suggestions */}
      {settlements && settlements.length > 0 && (
        <div className="glass rounded-2xl p-4">
          <h4 className="text-sm font-semibold text-white/60 mb-3 uppercase tracking-wider">
            💡 Suggested Settlements ({settlements.length} payment{settlements.length > 1 ? 's' : ''})
          </h4>
          <div className="space-y-2">
            {settlements.map((s, i) => (
              <div key={i} className="flex items-center gap-2 text-sm p-2.5 rounded-xl bg-white/5">
                <div className="avatar w-7 h-7 text-xs shrink-0">{getInitials(s.fromName)}</div>
                <span className="font-medium truncate">{s.fromName}</span>
                <ArrowRight className="w-3.5 h-3.5 text-white/30 shrink-0" />
                <div className="avatar w-7 h-7 text-xs shrink-0">{getInitials(s.toName)}</div>
                <span className="font-medium truncate">{s.toName}</span>
                <span className="ml-auto font-bold text-brand-400 shrink-0">₹{s.amount.toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {settlements && settlements.length === 0 && balances.length > 0 && (
        <div className="glass rounded-xl p-4 text-center">
          <p className="text-emerald-400 text-sm font-medium">✓ All balances are settled!</p>
        </div>
      )}
    </div>
  )
}
