import React, { createContext, useContext, useEffect, useState, useRef } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'

export const SocketContext = createContext(null)

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    return { socket: null, isConnected: false, onlineUserIds: new Set() }
  }
  return context
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

    // Resolve socket server base URL
    let socketUrl = ''
    const envApiUrl = import.meta.env.VITE_API_URL
    if (envApiUrl && envApiUrl.trim()) {
      socketUrl = envApiUrl.trim().replace(/\/api\/?$/, '').replace(/\/$/, '')
    } else if (import.meta.env.PROD) {
      socketUrl = 'https://fairshare-backend-mvl7.onrender.com'
    } else {
      socketUrl = 'http://localhost:5000'
    }

    const socketInstance = io(socketUrl, {
      auth: { token: user.token },
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionAttempts: 20,
      reconnectionDelay: 1000,
      timeout: 10000,
    })

    socketRef.current = socketInstance

    socketInstance.on('connect', () => {
      setIsConnected(true)
    })

    socketInstance.on('disconnect', () => {
      setIsConnected(false)
    })

    socketInstance.on('connect_error', () => {
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
