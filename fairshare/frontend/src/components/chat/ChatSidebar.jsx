import { useState, useMemo } from 'react'
import { Users, Search, MessageSquare, Circle } from 'lucide-react'

const getInitials = (name) =>
  name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'RM'

export default function ChatSidebar({
  house,
  members = [],
  activeChat,
  onSelectGroup,
  onSelectDirect,
  onlineUserIds = new Set(),
}) {
  const [search, setSearch] = useState('')

  // Filter out self and apply search filter
  const filteredMembers = useMemo(() => {
    return members
      .filter((m) => !m.isSelf)
      .filter((m) => {
        if (!search.trim()) return true
        const query = search.toLowerCase()
        return (
          m.name?.toLowerCase().includes(query) ||
          m.email?.toLowerCase().includes(query)
        )
      })
  }, [members, search])

  const isGroupActive = activeChat?.type === 'group'

  return (
    <div className="w-full md:w-80 bg-white border-r border-[#E5DED3] flex flex-col h-full select-none">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-[#E5DED3]">
        <h2 className="font-extrabold text-lg text-[#172033] tracking-tight">Roommate Chat</h2>
        <p className="text-xs text-[#687080] mt-0.5">Real-time conversations with your housemates</p>

        {/* Search input */}
        <div className="relative mt-3">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search roommates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input w-full pl-9 py-1.5 text-xs bg-[#FAF8F4]"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {/* House Group Chat Button */}
        <div className="px-2 pt-1 pb-1">
          <p className="text-[10px] font-bold text-[#687080] uppercase tracking-wider px-1 mb-1">
            House Channel
          </p>
          <button
            onClick={onSelectGroup}
            className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all ${
              isGroupActive
                ? 'bg-[#5F402B] text-white shadow-xs'
                : 'hover:bg-[#F2EEE7] text-[#172033]'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-extrabold ${
                isGroupActive ? 'bg-white/20 text-white' : 'bg-[#F2EEE7] text-[#5F402B]'
              }`}
            >
              <Users className="w-5 h-5" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="font-bold text-xs truncate">
                  {house?.name ? `${house.name} Group` : 'House Group Chat'}
                </p>
              </div>
              <p
                className={`text-[11px] truncate mt-0.5 ${
                  isGroupActive ? 'text-white/80' : 'text-[#687080]'
                }`}
              >
                Everyone in this house
              </p>
            </div>
          </button>
        </div>

        {/* Direct Messages Section */}
        <div className="px-2 pt-3">
          <div className="flex items-center justify-between px-1 mb-1">
            <p className="text-[10px] font-bold text-[#687080] uppercase tracking-wider">
              Direct Messages
            </p>
            <span className="text-[10px] text-[#687080] font-semibold">
              {filteredMembers.length} {filteredMembers.length === 1 ? 'roommate' : 'roommates'}
            </span>
          </div>

          {filteredMembers.length > 0 ? (
            <div className="space-y-1 mt-1">
              {filteredMembers.map((member) => {
                const isOnline =
                  onlineUserIds.has(String(member.userId)) || member.isOnline
                const isDirectActive =
                  activeChat?.type === 'direct' &&
                  String(activeChat.targetUser?._id) === String(member.userId)

                return (
                  <button
                    key={member.userId}
                    onClick={() => onSelectDirect(member)}
                    className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all ${
                      isDirectActive
                        ? 'bg-[#5F402B] text-white shadow-xs'
                        : 'hover:bg-[#F2EEE7] text-[#172033]'
                    }`}
                  >
                    {/* Avatar with Presence Indicator */}
                    <div className="relative shrink-0">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
                          isDirectActive
                            ? 'bg-white/20 text-white'
                            : 'bg-[#5F402B] text-white'
                        }`}
                      >
                        {getInitials(member.name)}
                      </div>

                      {/* Presence Dot */}
                      <span
                        className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-white ${
                          isOnline ? 'bg-emerald-500' : 'bg-slate-300'
                        }`}
                        title={isOnline ? 'Online now' : 'Offline'}
                      />
                    </div>

                    {/* Roommate details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-xs truncate">{member.name}</p>
                        {member.unreadCount > 0 && !isDirectActive && (
                          <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#D65B57] text-white shrink-0 animate-pulse">
                            {member.unreadCount}
                          </span>
                        )}
                      </div>

                      <p
                        className={`text-[11px] truncate mt-0.5 flex items-center gap-1 ${
                          isDirectActive ? 'text-white/80' : 'text-[#687080]'
                        }`}
                      >
                        {member.lastMessage?.text ? (
                          <>
                            {member.lastMessage.isMine && <span>You: </span>}
                            <span>{member.lastMessage.text}</span>
                          </>
                        ) : (
                          <span className="italic">
                            {isOnline ? 'Online • Click to chat' : 'Click to send message'}
                          </span>
                        )}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="py-6 px-3 text-center text-[#687080] text-xs">
              <MessageSquare className="w-6 h-6 text-slate-300 mx-auto mb-1.5" />
              <p className="font-medium">No roommates found</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Invite members to this house to start direct chats</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
