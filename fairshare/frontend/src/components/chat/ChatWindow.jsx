import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Send,
  Users,
  ArrowLeft,
  Check,
  CheckCheck,
  MessageSquare,
  WifiOff,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useSocket } from '../../context/SocketContext'
import axiosClient from '../../api/axiosClient'
import toast from 'react-hot-toast'

const getInitials = (name) =>
  name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'RM'

export default function ChatWindow({
  house,
  activeChat,
  onBack,
}) {
  const { user } = useAuth()
  const { socket, isConnected, onlineUserIds } = useSocket()

  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [inputText, setInputText] = useState('')
  const [sending, setSending] = useState(false)
  const [currentConversationId, setCurrentConversationId] = useState(
    activeChat?.conversationId || null
  )

  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const scrollToBottom = (behavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior })
  }

  // Load message history when activeChat changes
  const loadMessages = useCallback(async () => {
    if (!house?._id || !activeChat) return
    setLoading(true)
    try {
      if (activeChat.type === 'group') {
        const { data } = await axiosClient.get(`/houses/${house._id}/chat/group`)
        setCurrentConversationId(data.conversation?._id)
        setMessages(data.messages || [])
      } else if (activeChat.type === 'direct' && activeChat.targetUser?._id) {
        const { data } = await axiosClient.get(
          `/chat/direct/${activeChat.targetUser._id}?houseId=${house._id}`
        )
        setCurrentConversationId(data.conversation?._id)
        setMessages(data.messages || [])
      }
    } catch (err) {
      console.error('[loadMessages error]:', err)
      toast.error('Failed to load chat history')
    } finally {
      setLoading(false)
    }
  }, [house?._id, activeChat])

  useEffect(() => {
    loadMessages()
  }, [loadMessages])

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom('auto')
  }, [messages.length])

  // Real-time socket message listeners
  useEffect(() => {
    if (!socket || !currentConversationId) return

    // Notify server we've read this conversation
    socket.emit('message:read', { conversationId: currentConversationId })

    const handleNewMessage = (newMsg) => {
      if (String(newMsg.conversationId) === String(currentConversationId)) {
        setMessages((prev) => {
          // Avoid duplicate messages
          if (prev.some((m) => String(m._id) === String(newMsg._id))) {
            return prev
          }
          return [...prev, newMsg]
        })

        // Mark as read if received while active
        if (String(newMsg.senderId?._id || newMsg.senderId) !== String(user?._id)) {
          socket.emit('message:read', {
            conversationId: currentConversationId,
            messageId: newMsg._id,
          })
        }
      }
    }

    const handleReadUpdate = ({ conversationId, messageId, userId }) => {
      if (String(conversationId) === String(currentConversationId)) {
        setMessages((prev) =>
          prev.map((msg) => {
            if (messageId && String(msg._id) !== String(messageId)) return msg
            const readBy = new Set((msg.readBy || []).map(String))
            readBy.add(String(userId))
            return { ...msg, readBy: Array.from(readBy) }
          })
        )
      }
    }

    socket.on('message:new', handleNewMessage)
    socket.on('message:readUpdate', handleReadUpdate)

    return () => {
      socket.off('message:new', handleNewMessage)
      socket.off('message:readUpdate', handleReadUpdate)
    }
  }, [socket, currentConversationId, user?._id])

  // Focus input on mount/change
  useEffect(() => {
    inputRef.current?.focus()
  }, [currentConversationId])

  const handleSendMessage = (e) => {
    e.preventDefault()
    const text = inputText.trim()
    if (!text || !currentConversationId || sending) return

    setSending(true)

    if (socket && isConnected) {
      socket.emit(
        'message:send',
        { conversationId: currentConversationId, text },
        (res) => {
          setSending(false)
          if (res?.error) {
            toast.error(res.error)
          } else {
            setInputText('')
          }
        }
      )
    } else {
      setSending(false)
      toast.error('Chat connection offline. Reconnecting...')
    }
  }

  // Format date header separator
  const formatTime = (iso) => {
    if (!iso) return ''
    const d = new Date(iso)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const isTargetOnline =
    activeChat?.type === 'direct' &&
    activeChat?.targetUser?._id &&
    onlineUserIds.has(String(activeChat.targetUser._id))

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F7F4EE]">
      {/* Top Conversation Header */}
      <div className="px-4 py-3 bg-white border-b border-[#E5DED3] flex items-center justify-between shadow-xs z-10">
        <div className="flex items-center gap-3">
          {/* Mobile Back Button */}
          {onBack && (
            <button
              onClick={onBack}
              className="md:hidden p-1.5 rounded-lg text-[#687080] hover:text-[#172033] hover:bg-[#F2EEE7]"
              title="Back to conversation list"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          {/* Conversation Avatar */}
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-[#5F402B] text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {activeChat?.type === 'group' ? (
                <Users className="w-5 h-5 text-white" />
              ) : (
                getInitials(activeChat?.targetUser?.name || activeChat?.title)
              )}
            </div>
            {activeChat?.type === 'direct' && (
              <span
                className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-white ${
                  isTargetOnline ? 'bg-emerald-500' : 'bg-slate-300'
                }`}
              />
            )}
          </div>

          <div>
            <h3 className="font-extrabold text-sm text-[#172033] leading-tight">
              {activeChat?.title || 'Chat'}
            </h3>
            <p className="text-xs text-[#687080] flex items-center gap-1.5 mt-0.5">
              {activeChat?.type === 'group' ? (
                <span>House Group Channel</span>
              ) : isTargetOnline ? (
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Online
                </span>
              ) : (
                <span>Offline</span>
              )}
            </p>
          </div>
        </div>

        {/* Connection indicator */}
        {!isConnected && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs border border-amber-200">
            <WifiOff className="w-3.5 h-3.5" />
            <span className="hidden sm:inline font-semibold">Reconnecting...</span>
          </div>
        )}
      </div>

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center h-full text-xs text-[#687080]">
            Loading conversation...
          </div>
        ) : messages.length > 0 ? (
          messages.map((msg, index) => {
            const isMine =
              String(msg.senderId?._id || msg.senderId) === String(user?._id)
            const senderName = msg.senderId?.name || 'Roommate'
            const isReadByOthers =
              Array.isArray(msg.readBy) &&
              msg.readBy.some((r) => String(r) !== String(user?._id))

            return (
              <div
                key={msg._id || index}
                className={`flex gap-2.5 ${isMine ? 'justify-end' : 'justify-start'}`}
              >
                {/* Other sender's avatar */}
                {!isMine && (
                  <div className="w-7 h-7 rounded-full bg-[#E5DED3] text-[#5F402B] flex items-center justify-center font-bold text-[10px] shrink-0 mt-1">
                    {getInitials(senderName)}
                  </div>
                )}

                <div
                  className={`max-w-[75%] sm:max-w-md rounded-2xl px-3.5 py-2 text-xs sm:text-sm leading-relaxed shadow-xs ${
                    isMine
                      ? 'bg-[#5F402B] text-white rounded-tr-xs font-medium'
                      : 'bg-white text-[#172033] border border-[#E5DED3] rounded-tl-xs font-medium'
                  }`}
                >
                  {/* Sender Name for group chat */}
                  {!isMine && activeChat?.type === 'group' && (
                    <p className="text-[11px] font-extrabold text-[#5F402B] mb-0.5">
                      {senderName}
                    </p>
                  )}

                  <p className="whitespace-pre-wrap break-words">{msg.text}</p>

                  {/* Message footer: time & read ticks */}
                  <div
                    className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
                      isMine ? 'text-white/70' : 'text-[#687080]'
                    }`}
                  >
                    <span>{formatTime(msg.createdAt)}</span>
                    {isMine && (
                      <span>
                        {isReadByOthers ? (
                          <CheckCheck className="w-3 h-3 text-sky-300" title="Read" />
                        ) : (
                          <Check className="w-3 h-3 text-white/60" title="Sent" />
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-[#687080] p-6 text-center space-y-2">
            <MessageSquare className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="font-bold text-sm text-[#172033]">No messages yet</p>
            <p className="text-xs max-w-xs text-[#687080]">
              {activeChat?.type === 'group'
                ? 'Say hi to everyone in your house! All members will see your message here.'
                : `Send a private message to ${activeChat?.title || 'your roommate'}.`}
            </p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Message Input Bar */}
      <form
        onSubmit={handleSendMessage}
        className="p-3 bg-white border-t border-[#E5DED3] flex items-center gap-2"
      >
        <input
          ref={inputRef}
          type="text"
          placeholder={
            activeChat?.type === 'group'
              ? 'Message everyone in house...'
              : `Message ${activeChat?.title || 'roommate'}...`
          }
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={!isConnected && !currentConversationId}
          className="input flex-1 py-2 text-xs sm:text-sm border-[#E5DED3] focus:border-[#5F402B]"
        />

        <button
          type="submit"
          disabled={!inputText.trim() || sending}
          className="w-9 h-9 rounded-xl bg-[#5F402B] hover:bg-[#4A3121] disabled:opacity-40 text-white flex items-center justify-center transition-colors shrink-0 shadow-xs"
          title="Send message (Enter)"
        >
          <Send className="w-4 h-4 text-white" />
        </button>
      </form>
    </div>
  )
}
