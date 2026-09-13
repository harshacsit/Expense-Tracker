import { createContext, useContext, useEffect, useState, useRef } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'

const SocketContext = createContext(null)

export const useSocket = () => {
  return useContext(SocketContext)
}

export function SocketProvider({ children }) {
  const { user } = useAuth()
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [onlineUserIds, setOnlineUserIds] = useState(new Set())
  const socketRef = useRef(null)

  useEffect(() => {
    if (!user?.token) {
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
        setSocket(null)
        setIsConnected(false)
      }
      return
    }

    // Resolve socket server base URL (remove trailing /api if present)
    const rawUrl =
      import.meta.env.VITE_API_URL ||
      (import.meta.env.PROD
        ? 'https://fairshare-backend-mvl7.onrender.com'
        : 'http://localhost:5000')

    const socketUrl = rawUrl.replace(/\/api\/?$/, '').replace(/\/$/, '')

    const socketInstance = io(socketUrl, {
      auth: { token: user.token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1500,
    })

    socketRef.current = socketInstance

    socketInstance.on('connect', () => {
      setIsConnected(true)
    })

    socketInstance.on('disconnect', () => {
      setIsConnected(false)
    })

    socketInstance.on('connect_error', (err) => {
      console.warn('[Socket connection error]:', err.message)
      setIsConnected(false)
    })

    socketInstance.on('presence:online', ({ userId }) => {
      if (userId) {
        setOnlineUserIds((prev) => new Set(prev).add(String(userId)))
      }
    })

    socketInstance.on('presence:offline', ({ userId }) => {
      if (userId) {
        setOnlineUserIds((prev) => {
          const next = new Set(prev)
          next.delete(String(userId))
          return next
        })
      }
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.disconnect()
      socketRef.current = null
      setSocket(null)
      setIsConnected(false)
    }
  }, [user?.token])

  return (
    <SocketContext.Provider value={{ socket, isConnected, onlineUserIds }}>
      {children}
    </SocketContext.Provider>
  )
}
