import { useState, useRef, useEffect, useCallback } from 'react'
import {
  MessageCircle,
  X,
  Send,
  RotateCcw,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Bot
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useChatbot } from '../hooks/useChatbot'

const getInitials = (name) =>
  name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'ME'

export default function ChatWidget({ houseId, userName, onExpenseAdded }) {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [voiceReplyEnabled, setVoiceReplyEnabled] = useState(false)
  const [speakingIndex, setSpeakingIndex] = useState(null)

  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const recognitionRef = useRef(null)
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

  // Stop recognition and speech synthesis on unmount or when chat closes
  const stopAllVoice = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort()
      } catch (_) {}
      recognitionRef.current = null
    }
    setIsListening(false)

    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
    setSpeakingIndex(null)
  }, [])

  useEffect(() => {
    return () => stopAllVoice()
  }, [stopAllVoice])

  useEffect(() => {
    if (!open) {
      stopAllVoice()
    }
  }, [open, stopAllVoice])

  // Text-To-Speech (Voice Output)
  const speakText = useCallback((text, index = null) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      toast.error('Voice readout is not supported in this browser.')
      return
    }

    if (speakingIndex === index && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel()
      setSpeakingIndex(null)
      return
    }

    window.speechSynthesis.cancel()

    // Clean text for speech synthesis
    const cleanText = text
      .replace(/[\u{1F600}-\u{1F64F}|\u{1F300}-\u{1F5FF}|\u{1F680}-\u{1F6FF}|\u{2600}-\u{26FF}|\u{2700}-\u{27BF}]/gu, '')
      .replace(/[*_~`#]/g, '')
      .replace(/₹/g, ' rupees ')
      .trim()

    if (!cleanText) return

    const utterance = new SpeechSynthesisUtterance(cleanText)
    utterance.rate = 1.0
    utterance.pitch = 1.0

    utterance.onend = () => setSpeakingIndex(null)
    utterance.onerror = () => setSpeakingIndex(null)

    setSpeakingIndex(index)
    window.speechSynthesis.speak(utterance)
  }, [speakingIndex])

  // Auto-speak new assistant messages if voice reply mode is ON
  const prevMessagesLength = useRef(messages.length)
  useEffect(() => {
    if (voiceReplyEnabled && messages.length > prevMessagesLength.current) {
      const lastMsg = messages[messages.length - 1]
      if (lastMsg && lastMsg.role === 'assistant') {
        speakText(lastMsg.content, messages.length - 1)
      }
    }
    prevMessagesLength.current = messages.length
  }, [messages, voiceReplyEnabled, speakText])

  // Speech-To-Text (Microphone Voice Input)
  const toggleListening = () => {
    const SpeechRecognition =
      typeof window !== 'undefined' &&
      (window.SpeechRecognition || window.webkitSpeechRecognition)

    if (!SpeechRecognition) {
      toast.error('Speech recognition is not supported in this browser. Please try Chrome, Edge, or Safari.')
      return
    }

    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch (_) {}
      }
      setIsListening(false)
      return
    }

    try {
      const recognition = new SpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = true
      recognition.lang = navigator.language || 'en-US'

      recognition.onstart = () => {
        setIsListening(true)
      }

      recognition.onresult = (event) => {
        let transcript = ''
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript
        }
        if (transcript) {
          setInput(transcript)
        }
      }

      recognition.onerror = (event) => {
        console.warn('Speech recognition status:', event.error)
        setIsListening(false)
        if (event.error === 'not-allowed') {
          toast.error('Microphone permission was denied. Please allow microphone access in your browser settings.')
        } else if (event.error === 'network') {
          toast.error('Network error during voice recognition.')
        } else if (event.error !== 'no-speech') {
          toast.error(`Voice input error: ${event.error}`)
        }
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognitionRef.current = recognition
      recognition.start()
    } catch (err) {
      console.error('Failed to start speech recognition:', err)
      setIsListening(false)
      toast.error('Could not access microphone.')
    }
  }

  const handleSend = (e) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    // Stop listening if active
    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch (_) {}
      setIsListening(false)
    }

    sendMessage(input.trim())
    setInput('')
  }

  const QUICK_PROMPTS = [
    { label: '✨ Add an expense', text: 'I paid ₹600 for internet, split equally' },
    { label: '💰 How much do I owe?', text: 'How much do I owe right now?' },
    { label: '👥 Who owes whom?', text: 'Who owes whom in our house?' },
    { label: '📊 Show my spending', text: 'Show me our spending summary for this month' },
    { label: '🤝 How should we settle up?', text: 'What is the easiest way to settle all house debts?' },
    { label: '💡 Explain categories', text: 'Explain the expense categories' },
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
          className="fixed bottom-22 right-6 z-50 w-96 max-w-[calc(100vw-2.5rem)] flex flex-col rounded-3xl bg-white border border-[#E5DED3] shadow-2xl overflow-hidden transition-all animate-fadeIn"
          style={{ height: '540px' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[#E5DED3] bg-white">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#5F402B] text-white flex items-center justify-center shrink-0 shadow-xs">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#172033] leading-tight">FairShare Assistant</h3>
                <p className="text-xs text-[#5F402B] font-semibold flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2F9B70] animate-pulse" />
                  Online • Voice & AI Companion
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Voice Reply Toggle */}
              <button
                type="button"
                id="chat-voice-toggle"
                onClick={() => {
                  const nextState = !voiceReplyEnabled
                  setVoiceReplyEnabled(nextState)
                  if (!nextState && typeof window !== 'undefined' && window.speechSynthesis) {
                    window.speechSynthesis.cancel()
                    setSpeakingIndex(null)
                  }
                  toast.success(
                    nextState ? 'Voice assistant replies ON 🔊' : 'Voice assistant replies OFF 🔇'
                  )
                }}
                className={`p-1.5 rounded-lg transition-colors ${
                  voiceReplyEnabled
                    ? 'bg-[#5F402B] text-white'
                    : 'text-[#687080] hover:text-[#172033] hover:bg-[#F2EEE7]'
                }`}
                title={voiceReplyEnabled ? 'Voice replies ON (Click to mute)' : 'Turn ON voice spoken replies'}
              >
                {voiceReplyEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              {/* Clear Chat */}
              <button
                id="chat-clear"
                onClick={clearHistory}
                className="p-1.5 rounded-lg text-[#687080] hover:text-[#172033] hover:bg-[#F2EEE7] transition-colors"
                title="Clear chat"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Close Panel */}
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg text-[#687080] hover:text-[#172033] hover:bg-[#F2EEE7] transition-colors"
                title="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F7F4EE]">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                    msg.role === 'user'
                      ? 'bg-[#5F402B] text-white'
                      : 'bg-[#F2EEE7] text-[#5F402B] border border-[#E5DED3]'
                  }`}
                >
                  {msg.role === 'user' ? (
                    getInitials(userName)
                  ) : (
                    <MessageCircle className="w-4 h-4 text-[#5F402B]" />
                  )}
                </div>

                {/* Bubble */}
                <div className="max-w-[80%] flex flex-col">
                  <div
                    className={`rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-[#5F402B] text-white rounded-tr-xs shadow-xs font-medium'
                        : 'bg-white text-[#172033] border border-[#E5DED3] rounded-tl-xs shadow-xs font-medium'
                    }`}
                  >
                    {msg.content}
                    {msg.action && (
                      <div className="mt-2 pt-2 border-t border-[#E5DED3] text-xs text-[#5F402B] font-semibold flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#5F402B]" />
                        <span>Action completed: {msg.action.function}</span>
                      </div>
                    )}
                  </div>

                  {/* Read aloud button for assistant bubbles */}
                  {msg.role === 'assistant' && (
                    <button
                      type="button"
                      onClick={() => speakText(msg.content, i)}
                      className={`self-start mt-1 p-1 rounded-md text-[11px] font-semibold flex items-center gap-1 transition-colors ${
                        speakingIndex === i
                          ? 'text-rose-600 bg-rose-50'
                          : 'text-[#687080] hover:text-[#5F402B] hover:bg-[#F2EEE7]'
                      }`}
                      title={speakingIndex === i ? 'Stop reading' : 'Read aloud'}
                    >
                      <Volume2 className={`w-3 h-3 ${speakingIndex === i ? 'animate-pulse text-rose-500' : ''}`} />
                      <span>{speakingIndex === i ? 'Reading...' : 'Listen'}</span>
                    </button>
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
                    <span
                      className="w-1.5 h-1.5 bg-[#5F402B] rounded-full animate-bounce"
                      style={{ animationDelay: '0s' }}
                    />
                    <span
                      className="w-1.5 h-1.5 bg-[#5F402B] rounded-full animate-bounce"
                      style={{ animationDelay: '0.15s' }}
                    />
                    <span
                      className="w-1.5 h-1.5 bg-[#5F402B] rounded-full animate-bounce"
                      style={{ animationDelay: '0.3s' }}
                    />
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
                onClick={() => {
                  sendMessage(p.text)
                  setInput('')
                }}
                className="text-[11px] px-2.5 py-1 rounded-full border border-[#E5DED3] bg-[#F2EEE7] text-[#5F402B] hover:bg-[#5F402B] hover:text-white hover:border-[#5F402B] transition-all font-semibold"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Voice Listening Banner */}
          {isListening && (
            <div className="px-4 py-2 bg-rose-50 border-t border-rose-200 text-rose-700 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-600"></span>
                </span>
                <span>Listening to your voice... Speak now 🎙️</span>
              </div>
              <button
                type="button"
                onClick={toggleListening}
                className="text-[11px] font-extrabold text-rose-700 hover:text-rose-900 underline"
              >
                Stop
              </button>
            </div>
          )}

          {/* Input Area with Microphone Button */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-[#E5DED3] flex items-center gap-2">
            <div className="relative flex-1 flex items-center">
              <input
                ref={inputRef}
                id="chat-input"
                type="text"
                className={`input w-full py-2 pl-3 pr-10 text-xs sm:text-sm border-[#E5DED3] focus:border-[#5F402B] transition-all ${
                  isListening
                    ? 'ring-2 ring-rose-400 border-rose-400 bg-rose-50/40 placeholder-rose-500 font-medium'
                    : ''
                }`}
                placeholder={
                  isListening
                    ? 'Listening... Speak your expense or query 🎙️'
                    : 'Ask FairShare Assistant or click 🎙️ to speak...'
                }
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
              />

              {/* Microphone / Voice Input Button */}
              <button
                id="chat-mic-button"
                type="button"
                onClick={toggleListening}
                disabled={loading}
                className={`absolute right-2 p-1.5 rounded-lg transition-all ${
                  isListening
                    ? 'bg-rose-500 text-white animate-pulse shadow-md shadow-rose-500/40'
                    : 'text-[#687080] hover:text-[#5F402B] hover:bg-[#F2EEE7]'
                }`}
                title={isListening ? 'Stop listening' : 'Speak using microphone'}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            </div>

            <button
              id="chat-send"
              type="submit"
              disabled={loading || !input.trim()}
              className="w-9 h-9 rounded-xl bg-[#5F402B] hover:bg-[#4A3121] disabled:opacity-40 text-white flex items-center justify-center transition-colors shrink-0 shadow-xs"
              title="Send message"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </form>
        </div>
      )}
    </>
  )
}
