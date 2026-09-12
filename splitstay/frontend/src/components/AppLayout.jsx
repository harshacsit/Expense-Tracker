import React, { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ChatWidget from './ChatWidget'
import NotificationDropdown from './NotificationDropdown'
import {
  Home,
  LayoutDashboard,
  Receipt,
  Scale,
  Users,
  HandCoins,
  ChevronDown,
  LogOut,
  Menu,
  X,
  User as UserIcon,
  Copy,
  Check,
  Info
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function AppLayout({ children, house, houses = [], onSelectHouse }) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const [roomInfoOpen, setRoomInfoOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  // Notification state
  const [notifications, setNotifications] = useState([])

  const userDropdownRef = useRef(null)
  const roomModalRef = useRef(null)

  // Click outside listener for user dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false)
      }
      if (roomModalRef.current && !roomModalRef.current.contains(event.target)) {
        setRoomInfoOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Dynamic user initials
  const getInitials = (name) => {
    if (!name) return 'US'
    const parts = name.trim().split(' ')
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    return name.slice(0, 2).toUpperCase()
  }

  const handleCopyCode = () => {
    if (!house?.inviteCode) return
    navigator.clipboard.writeText(house.inviteCode)
    setCopied(true)
    toast.success('Room invite code copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const handleMarkRead = (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Expenses', path: '/expenses', icon: Receipt },
    { label: 'Balances', path: '/balances', icon: Scale },
    { label: 'Members', path: '/members', icon: Users },
    { label: 'Settle Up', path: '/settle-up', icon: HandCoins },
  ]

  const currentPath = location.pathname

  return (
    <div className="min-h-screen bg-[#F7F4EE] flex flex-col md:flex-row">
      {/* Mobile Header Bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[#FAF8F4] border-b border-[#E5DED3] sticky top-0 z-30 shadow-xs">
        <Link to="/" className="flex items-center gap-2 group cursor-pointer" title="Go to homepage">
          <div className="w-8 h-8 rounded-lg bg-[#5F402B] flex items-center justify-center text-white">
            <Home className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-lg text-[#172033] tracking-tight">SplitStay</span>
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg text-[#687080] hover:bg-[#F2EEE7]"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Desktop & Mobile Navigation Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-40 w-64 bg-[#FAF8F4] border-r border-[#E5DED3] flex flex-col justify-between transition-transform duration-200 ease-in-out shadow-xs
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-5 flex flex-col gap-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group cursor-pointer" title="Go to homepage">
            <div className="w-9 h-9 rounded-xl bg-[#5F402B] flex items-center justify-center text-white shadow-sm">
              <Home className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-xl text-[#172033] tracking-tight">SplitStay</span>
          </Link>

          {/* Active Room Info Label */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setRoomInfoOpen(!roomInfoOpen)}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-[#E5DED3] bg-[#F2EEE7] hover:bg-[#EBE5DA] transition-colors text-left"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-5 h-5 rounded bg-[#FAF8F4] text-[#5F402B] flex items-center justify-center shrink-0">
                  <Home className="w-3.5 h-3.5" />
                </div>
                <span className="text-sm font-bold text-[#172033] truncate">
                  {house?.name || 'Sunrise Apartments'}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
            </button>

            {/* Room Info Dropdown */}
            {roomInfoOpen && (
              <div
                ref={roomModalRef}
                className="absolute left-0 right-0 mt-2 bg-white rounded-xl border border-[#E5DED3] shadow-card p-3.5 z-50 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="font-bold text-[#172033]">Current Room Info</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#F2EEE7] text-[#5F402B] font-semibold text-[10px]">Active</span>
                </div>
                <p className="text-[#687080] font-medium">{house?.name || 'Sunrise Apartments'}</p>
                <div className="flex items-center justify-between bg-[#FAF8F4] p-2 rounded-lg border border-[#E5DED3]">
                  <span className="text-slate-400 font-semibold">Code:</span>
                  <span className="font-mono font-bold text-[#172033]">{house?.inviteCode || 'SUNRISE1'}</span>
                  <button onClick={handleCopyCode} className="text-[#5F402B] hover:text-[#4A3120] p-1">
                    {copied ? <Check className="w-3.5 h-3.5 text-[#2F9B70]" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Links — ONLY 5 ITEMS */}
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = currentPath === item.path || (item.path === '/expenses' && currentPath === '/history')
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`
                    flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 group
                    ${isActive
                      ? 'bg-[#5F402B] text-white shadow-xs'
                      : 'text-[#687080] hover:bg-[#F2EEE7] hover:text-[#172033]'
                    }
                  `}
                >
                  <div className={`
                    w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all duration-150
                    ${isActive ? 'bg-[#4A3120] text-white' : 'bg-[#F2EEE7] text-[#5F402B] group-hover:bg-[#E5DED3]'}
                  `}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Sidebar Footer User Info */}
        <div className="p-4 border-t border-[#E5DED3] flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-[#5F402B] text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
              {getInitials(user?.name)}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-[#172033] truncate">{user?.name || 'User'}</p>
              <p className="text-[11px] text-[#687080] truncate">{user?.email || 'user@example.com'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-[#D65B57] hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Desktop Top Header Bar */}
        <header className="hidden md:flex items-center justify-between px-8 py-3.5 bg-[#FAF8F4] border-b border-[#E5DED3] sticky top-0 z-20 shadow-xs">
          {/* Left: Active Room Label */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#687080]">Current Room:</span>
            <span className="text-sm font-bold text-[#172033]">{house?.name || 'Sunrise Apartments'}</span>
          </div>

          {/* Right: Notifications & User Profile */}
          <div className="flex items-center gap-4">
            {/* Functional Notifications Dropdown */}
            <NotificationDropdown
              notifications={notifications}
              onMarkAllRead={handleMarkAllRead}
              onMarkRead={handleMarkRead}
            />

            <div className="h-6 w-px bg-[#E5DED3]" />

            {/* Authenticated User Dropdown */}
            <div className="relative" ref={userDropdownRef}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2.5 p-1.5 pr-2.5 rounded-full hover:bg-[#F2EEE7] transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-[#5F402B] text-white font-bold text-xs flex items-center justify-center shadow-xs">
                  {getInitials(user?.name)}
                </div>
                <span className="text-sm font-bold text-[#172033]">{user?.name || 'User'}</span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl border border-[#E5DED3] shadow-xl py-1 z-50 animate-fadeIn">
                  <div className="px-4 py-3 border-b border-[#E5DED3]">
                    <p className="text-xs font-bold text-[#172033] truncate">{user?.name}</p>
                    <p className="text-[11px] text-[#687080] truncate mt-0.5">{user?.email}</p>
                  </div>
                  <div className="py-1">
                    <div className="px-4 py-2 text-xs font-semibold text-[#172033] hover:bg-[#F2EEE7] flex items-center gap-2 cursor-default">
                      <UserIcon className="w-3.5 h-3.5 text-[#5F402B]" /> Profile Info
                    </div>
                  </div>
                  <div className="border-t border-[#E5DED3] pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-xs font-bold text-[#D65B57] hover:bg-[#FDF0EF] flex items-center gap-2 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Global AI Chatbot Widget */}
      {house && (
        <ChatWidget houseId={house._id} userName={user?.name || 'User'} />
      )}
    </div>
  )
}
