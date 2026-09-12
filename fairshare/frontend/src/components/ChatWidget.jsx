import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Bot, Sparkles, RotateCcw, Zap } from 'lucide-react'
import { useChatbot } from '../hooks/useChatbot'

const getInitials = (name) => name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || '?'

export default function ChatWidget({ houseId, userName, onExpenseAdded }) {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const { messages, loading, sendMessage, clearHistory } = useChatbot(houseId, onExpenseAdded)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    let timer
    if (open) {
      timer = setTimeout(() => inputRef.current?.focus(), 200)
    }
    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [open])

  const handleSend = (e) => {
    e.preventDefault()
    if (!input.trim() || loading) return
    sendMessage(input.trim())
    setInput('')
  }

  const QUICK_PROMPTS = [
    { label: '💰 Add expense', text: 'I paid ₹600 for internet, split equally' },
    { label: '⚖️ Check balance', text: 'How much do I owe right now?' },
    { label: '🤝 Settle up', text: 'What is the easiest way to settle all house debts?' },
    { label: '📊 Spending summary', text: 'Show me our spending summary for this month' },
  ]

  return (
    <>
      {/* Floating Bubble */}
      <button
        id="chat-widget-toggle"
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110"
        style={{ background: 'linear-gradient(135deg, #4285F4 0%, #8B5CF6 50%, #0EA5E9 100%)', boxShadow: '0 8px 32px rgba(66,133,244,0.45)' }}
        title="Open Gemini AI Assistant"
      >
        {open ? <X className="w-6 h-6 text-white" /> : (
          <div className="relative">
            <Zap className="w-6 h-6 text-white" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-dark-900 animate-pulse-slow" />
          </div>
        )}
      </button>

      {/* Chat Panel */}
      {open && (
        <div
          id="chat-panel"
          className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] flex flex-col rounded-2xl shadow-2xl animate-slide-up overflow-hidden"
          style={{ height: '520px', background: 'rgba(18,18,26,0.97)', border: '1px solid rgba(96,112,245,0.25)' }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 p-4 border-b border-white/10">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #4285F4, #8B5CF6, #0EA5E9)' }}>
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">FairShare AI</p>
              <p className="text-xs text-white/40">Powered by Gemini · Always online</p>
            </div>
            <button
              id="chat-clear"
              onClick={clearHistory}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/30 hover:text-white/60"
              title="Clear chat"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar */}
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-brand-600' : 'bg-purple-600/30 border border-purple-500/30'}`}>
                  {msg.role === 'user' ? (
                    <span className="text-xs font-bold text-white">{getInitials(userName)}</span>
                  ) : (
                    <Bot className="w-3.5 h-3.5 text-purple-300" />
                  )}
                </div>

                {/* Bubble */}
                <div className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-brand-600 text-white rounded-tr-sm'
                    : 'bg-white/8 text-white/90 rounded-tl-sm border border-white/5'
                }`}
                  style={msg.role !== 'user' ? { background: 'rgba(255,255,255,0.06)' } : {}}
                >
                  {msg.content}
                  {/* Action badge */}
                  {msg.action && (
                    <div className="mt-2 pt-2 border-t border-white/10">
                      <span className="text-xs text-emerald-400 font-medium">
                        ✓ {msg.action.function === 'addExpense' ? 'Expense added' : msg.action.function === 'getBalances' ? 'Balances fetched' : 'Settlements calculated'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {loading && (
              <div className="flex gap-2.5">
                <div className="w-7 h-7 rounded-full flex items-center justify-center bg-purple-600/30 border border-purple-500/30 shrink-0">
                  <Bot className="w-3.5 h-3.5 text-purple-300" />
                </div>
                <div className="px-3.5 py-3 rounded-2xl rounded-tl-sm" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <div className="flex gap-1 items-center h-4">
                    {[0, 0.15, 0.3].map((delay, i) => (
                      <span key={i} className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: `${delay}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick prompts */}
          {/* Quick prompts */}
          <div className="px-3.5 pb-2 flex gap-1.5 flex-wrap">
            {QUICK_PROMPTS.map((p, i) => (
              <button
                key={i}
                id={`quick-prompt-${i}`}
                onClick={() => { sendMessage(p.text); setInput('') }}
                className="text-xs px-2.5 py-1.5 rounded-full border border-white/10 text-white/70 hover:text-white hover:border-brand-500/60 hover:bg-brand-600/20 transition-all font-medium"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-3 border-t border-white/10 flex gap-2">
            <input
              ref={inputRef}
              id="chat-input"
              type="text"
              className="input flex-1 py-2.5 text-sm"
              placeholder="Ask about expenses, balances..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <button
              id="chat-send"
              type="submit"
              disabled={loading || !input.trim()}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all disabled:opacity-30"
              style={{ background: 'linear-gradient(135deg, #4285F4, #8B5CF6)' }}
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </form>
        </div>
      )}
    </>
  )
}
