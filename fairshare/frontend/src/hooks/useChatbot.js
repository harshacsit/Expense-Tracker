import { useState } from 'react'
import { sendChatMessage } from '../api/chatbotApi'

export const useChatbot = (houseId, onExpenseAdded) => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm your FairShare assistant 🏠 Tell me about an expense (e.g. \"I paid ₹800 for groceries, split equally\"), ask about balances, or ask how to settle up!",
    },
  ])
  const [loading, setLoading] = useState(false)

  const sendMessage = async (text) => {
    if (!text.trim() || loading) return

    const userMessage = { role: 'user', content: text }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setLoading(true)

    try {
      // Build history for Gemini context (prior messages, excluding error messages)
      const history = messages
        .slice(-10)
        .filter((m) => (m.role === 'user' || m.role === 'assistant') && !m.content?.startsWith('❌'))
        .map((m) => ({ role: m.role, content: m.content }))

      const { data } = await sendChatMessage(houseId, text, history)
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply, action: data.action }])

      // If an expense was logged via AI, trigger dashboard refetch
      if (data.action?.function === 'addExpense') {
        onExpenseAdded?.()
      }
    } catch (err) {
      const errorText = err.response?.data?.message || '❌ Sorry, I encountered an error. Please try again.'
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: errorText },
      ])
    } finally {
      setLoading(false)
    }
  }

  const clearHistory = () => {
    setMessages([
      {
        role: 'assistant',
        content: "Hi! I'm your FairShare assistant 🏠 How can I help?",
      },
    ])
  }

  return { messages, loading, sendMessage, clearHistory }
}
