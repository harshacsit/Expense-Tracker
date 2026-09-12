import { useState, useRef, useEffect } from 'react'
import { Bell, Check, Info, Receipt, HandCoins, UserPlus, CheckCheck, X } from 'lucide-react'

export default function NotificationDropdown({ notifications = [], onMarkAllRead, onMarkRead }) {
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const unreadCount = notifications.filter((n) => !n.read).length

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'expense':
        return <Receipt className="w-4 h-4 text-[#5F402B]" />
      case 'settlement':
        return <HandCoins className="w-4 h-4 text-[#2F9B70]" />
      case 'member':
        return <UserPlus className="w-4 h-4 text-[#5F402B]" />
      default:
        return <Info className="w-4 h-4 text-[#687080]" />
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-xl text-[#687080] hover:bg-[#F2EEE7] hover:text-[#172033] transition-colors relative"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-[#5F402B] ring-2 ring-white animate-pulse" />
        )}
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-[#E5DED3] shadow-xl overflow-hidden z-50 animate-fadeIn">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5DED3] bg-white">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-[#172033]">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-[#F2EEE7] text-[#5F402B] text-xs font-bold">
                  {unreadCount} new
                </span>
              )}
            </div>
            {notifications.length > 0 && unreadCount > 0 && (
              <button
                onClick={onMarkAllRead}
                className="text-xs font-semibold text-[#5F402B] hover:text-[#4A3121] flex items-center gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-[#E5DED3]">
            {notifications.length > 0 ? (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => onMarkRead?.(n.id)}
                  className={`p-3.5 flex items-start gap-3 hover:bg-[#F2EEE7] transition-colors cursor-pointer ${
                    !n.read ? 'bg-[#F2EEE7]/50' : ''
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-[#F2EEE7] flex items-center justify-center shrink-0 mt-0.5">
                    {getNotificationIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-[#172033] leading-snug">{n.title}</p>
                    <p className="text-xs text-[#687080] mt-0.5 leading-normal">{n.message}</p>
                    <span className="text-[10px] text-[#687080]/70 mt-1 block">{n.time}</span>
                  </div>
                  {!n.read && (
                    <span className="w-2 h-2 rounded-full bg-[#5F402B] shrink-0 mt-1.5" />
                  )}
                </div>
              ))
            ) : (
              /* Empty State */
              <div className="p-8 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-[#F2EEE7] text-[#687080] flex items-center justify-center mx-auto">
                  <Bell className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-[#172033]">No new notifications</p>
                <p className="text-[11px] text-[#687080]">You're all caught up!</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
