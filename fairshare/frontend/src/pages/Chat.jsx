import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'
import axiosClient from '../api/axiosClient'
import AppLayout from '../components/AppLayout'
import ChatSidebar from '../components/chat/ChatSidebar'
import ChatWindow from '../components/chat/ChatWindow'
import toast from 'react-hot-toast'

export default function Chat({ house: propHouse }) {
  const { user } = useAuth()
  const { socket, onlineUserIds } = useSocket()

  const [house, setHouse] = useState(() => {
    if (propHouse) return propHouse
    const stored = localStorage.getItem('fairshare_house')
    return stored ? JSON.parse(stored) : null
  })

  const [members, setMembers] = useState([])
  const [loadingMembers, setLoadingMembers] = useState(false)

  // Active chat selection: 'group' or 'direct'
  const [activeChat, setActiveChat] = useState({
    type: 'group',
    title: house?.name ? `${house.name} Group` : 'House Group Chat',
    subtitle: 'Everyone in this house',
  })

  // Mobile view toggle: 'sidebar' | 'chat'
  const [mobileView, setMobileView] = useState('chat')

  // Fallback to fetch house if not present in state
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

  // Update default group chat title when house changes
  useEffect(() => {
    if (house?.name) {
      setActiveChat((prev) => {
        if (prev.type === 'group') {
          return {
            ...prev,
            title: `${house.name} Group`,
          }
        }
        return prev
      })
    }
  }, [house?.name])

  // Load chat members with presence & unread counts
  const loadMembers = useCallback(async () => {
    if (!house?._id) return
    setLoadingMembers(true)
    try {
      const { data } = await axiosClient.get(`/houses/${house._id}/chat/members`)
      setMembers(data || [])
    } catch (err) {
      console.error('[loadMembers Error]:', err)
      toast.error('Failed to load roommate list')
    } finally {
      setLoadingMembers(false)
    }
  }, [house?._id])

  useEffect(() => {
    loadMembers()
  }, [loadMembers])

  // Handler: Select House Group
  const handleSelectGroup = () => {
    setActiveChat({
      type: 'group',
      title: house?.name ? `${house.name} Group` : 'House Group Chat',
      subtitle: 'Everyone in this house',
    })
    setMobileView('chat')
  }

  // Handler: Select Direct Chat
  const handleSelectDirect = (member) => {
    setActiveChat({
      type: 'direct',
      targetUser: {
        _id: member.userId,
        name: member.name,
        email: member.email,
      },
      conversationId: member.directConversationId || null,
      title: member.name,
      subtitle: member.isOnline ? 'Online' : 'Offline',
    })
    setMobileView('chat')
  }

  return (
    <AppLayout house={house} onSelectHouse={setHouse}>
      <div className="h-[calc(100vh-8.5rem)] min-h-[520px] max-w-6xl mx-auto rounded-3xl border border-[#E5DED3] bg-white shadow-card overflow-hidden flex flex-col md:flex-row">
        {/* Sidebar: Show on desktop OR on mobile when view is 'sidebar' */}
        <div
          className={`h-full ${
            mobileView === 'sidebar' ? 'block w-full' : 'hidden md:block'
          }`}
        >
          <ChatSidebar
            house={house}
            members={members}
            activeChat={activeChat}
            onSelectGroup={handleSelectGroup}
            onSelectDirect={handleSelectDirect}
            onlineUserIds={onlineUserIds}
          />
        </div>

        {/* Chat Window: Show on desktop OR on mobile when view is 'chat' */}
        <div
          className={`h-full flex-1 flex flex-col ${
            mobileView === 'chat' ? 'block w-full' : 'hidden md:flex'
          }`}
        >
          <ChatWindow
            house={house}
            activeChat={activeChat}
            onBack={() => setMobileView('sidebar')}
          />
        </div>
      </div>
    </AppLayout>
  )
}
