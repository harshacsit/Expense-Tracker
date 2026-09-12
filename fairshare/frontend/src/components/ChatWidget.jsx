import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Bot, RotateCcw } from 'lucide-react'
import { useChatbot } from '../hooks/useChatbot'

const getInitials = (name) => name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'LK'

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
    { label: 'Γ£¿ Add an expense', text: 'I paid Γé╣600 for internet, split equally' },
    { label: '≡ƒÆ░ How much do I owe?', text: 'How much do I owe right now?' },
    { label: '≡ƒæÑ Who owes whom?', text: 'Who owes whom in our house?' },
    { label: '≡ƒôè Show my spending', text: 'Show me our spending summary for this month' },
    { label: '≡ƒñ¥ How should we settle up?', text: 'What is the easiest way to settle all house debts?' },
    { label: '≡ƒÆí Explain categories', text: 'Explain the expense categories' },
  ]

  return (
    <>
      {/* Reusable Warm Brown Circular Chat Button Fixed at Bottom-Right */}
      <button
        id="chat-widget-toggle"
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#5F402B] hover:bg-[#4A3121] text-white flex items-center justify-center shadow-lg shadow-[#5F402B]/20 transition-all duration-200 hover:scale-105 active:scale-95"
        title="Open FairShare Assistant"
      >
        {open ? <X className="w-6 h-6 text-white" /> : <MessageCircle className="w-6 h-6 text-white" />}
      </button>

      {/* Light SaaS Chat Panel */}
      {open && (
        <div
          id="chat-panel"
          className="fixed bottom-22 right-6 z-50 w-96 max-w-[calc(100vw-2.5rem)] flex flex-col rounded-3xl bg-white border border-[#E5DED3] shadow-2xl overflow-hidden transition-all"
          style={{ height: '520px' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[#E5DED3] bg-white">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#5F402B] text-white flex items-center justify-center shrink-0 shadow-xs">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#172033] leading-tight">FairShare Assistant</h3>
                <p className="text-xs text-[#5F402B] font-semibold flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2F9B70] animate-pulse" />
                  Online ΓÇó Roommate Finance Companion
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                id="chat-clear"
                onClick={clearHistory}
                className="p-1.5 rounded-lg text-[#687080] hover:text-[#172033] hover:bg-[#F2EEE7] transition-colors"
                title="Clear chat"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg text-[#687080] hover:text-[#172033] hover:bg-[#F2EEE7] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F7F4EE]">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar */}
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                  msg.role === 'user' ? 'bg-[#5F402B] text-white' : 'bg-[#F2EEE7] text-[#5F402B] border border-[#E5DED3]'
                }`}>
                  {msg.role === 'user' ? getInitials(userName) : <MessageCircle className="w-4 h-4 text-[#5F402B]" />}
                </div>

                {/* Bubble */}
                <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-[#5F402B] text-white rounded-tr-xs shadow-xs font-medium'
                    : 'bg-white text-[#172033] border border-[#E5DED3] rounded-tl-xs shadow-xs font-medium'
                }`}>
                  {msg.content}
                  {msg.action && (
                    <div className="mt-2 pt-2 border-t border-[#E5DED3] text-xs text-[#5F402B] font-semibold">
                      Γ£ô Action completed: {msg.action.function}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-2.5">
                <div className="w-7 h-7 rounded-full bg-[#F2EEE7] text-[#5F402B] flex items-center justify-center shrink-0 border border-[#E5DED3]">
                  <MessageCircle className="w-4 h-4 text-[#5F402B]" />
                </div>
                <div className="bg-white border border-[#E5DED3] px-4 py-3 rounded-2xl rounded-tl-xs shadow-xs">
                  <div className="flex gap-1.5 items-center">
                    <span className="w-1.5 h-1.5 bg-[#5F402B] rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                    <span className="w-1.5 h-1.5 bg-[#5F402B] rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                    <span className="w-1.5 h-1.5 bg-[#5F402B] rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Action Suggestion Chips */}
          <div className="px-3.5 pt-2 pb-1.5 bg-white border-t border-[#E5DED3] flex gap-1.5 flex-wrap">
            {QUICK_PROMPTS.map((p, i) => (
              <button
                key={i}
                id={`quick-prompt-${i}`}
                onClick={() => { sendMessage(p.text); setInput('') }}
                className="text-[11px] px-2.5 py-1 rounded-full border border-[#E5DED3] bg-[#F2EEE7] text-[#5F402B] hover:bg-[#5F402B] hover:text-white hover:border-[#5F402B] transition-all font-semibold"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-[#E5DED3] flex gap-2">
            <input
              ref={inputRef}
              id="chat-input"
              type="text"
              className="input flex-1 py-2 text-xs sm:text-sm border-[#E5DED3] focus:border-[#5F402B]"
              placeholder="Ask FairShare Assistant anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <button
              id="chat-send"
              type="submit"
              disabled={loading || !input.trim()}
              className="w-9 h-9 rounded-xl bg-[#5F402B] hover:bg-[#4A3121] disabled:opacity-40 text-white flex items-center justify-center transition-colors shrink-0 shadow-xs"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </form>
        </div>
      )}
    </>
  )
}
